const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const intents = require("./intents.json");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, "public")));

let coinListCache = null;
const userContext = {};

// Load and cache coin list from CoinGecko
async function loadCoinList() {
  if (coinListCache) return coinListCache;

  const res = await fetch("https://api.coingecko.com/api/v3/coins/list");
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error("CoinGecko /coins/list did not return an array:", data);
    throw new Error("Invalid response from CoinGecko.");
  }

  coinListCache = data;
  return data;
}

// Smart coin lookup with shortest-id tie breaker
async function getCoinData(userInput) {
  const list = await loadCoinList();
  const q = userInput.trim().toLowerCase();

  const filtered = list.filter(c => !c.id.toLowerCase().includes("binance-peg"));

  // Special case: always return bitcoin for 'btc'
  if (q === "btc") {
    const bitcoin = filtered.find(c => c.id === "bitcoin");
    if (bitcoin) return bitcoin;
  }

  const exactId = filtered.find(c => c.id.toLowerCase() === q);
  if (exactId) return exactId;

  const exactSymbolMatches = filtered.filter(c => c.symbol.toLowerCase() === q);
  if (exactSymbolMatches.length) {
    // Prefer bitcoin for btc, ethereum for eth, otherwise shortest id
    exactSymbolMatches.sort((a, b) => a.id.length - b.id.length || a.name.length - b.name.length);
    return exactSymbolMatches[0];
  }

  const exactName = filtered.find(c => c.name.toLowerCase() === q);
  if (exactName) return exactName;

  return filtered.find(c =>
    c.id.toLowerCase().includes(q) ||
    c.symbol.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q)
  ) || null;
}

// Get formatted live price
async function getLivePrice(coinId) {
  if (!coinId) return null;
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    const data = await res.json();
    console.log("CoinGecko price response for", coinId, ":", data);
    const usd = data[coinId]?.usd;
    if (typeof usd !== "number" || isNaN(usd)) return null;
    if (usd < 0.0001) return "< $0.0001";

    return usd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  } catch (err) {
    console.error("Error fetching price:", err);
    return null;
  }
}

// Detect user intent
function detectIntent(message) {
  const lower = message.toLowerCase();
  for (const intent of intents.intents) {
    if (intent.keywords.some(k => lower.includes(k))) return intent;
  }
  return null;
}

function extractCoinName(message) {
  const lower = message.toLowerCase();
  const match = lower.match(/(?:price of|price for|what(?:'s| is) the price of)\s+([a-z0-9\-]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return message.trim();
}

// Replace placeholders with actual values
function fillPlaceholders(template, coinName, price, marketUpdate, trendingCoins) {
  return template
    .replace(/\*?\[CRYPTO_NAME\]\*?/gi, coinName || "the coin")
    .replace(/\*?\[API_CALL:COINGECKO_PRICE(?:[^\]]*)?\]\*?/gi, price || "not in my database Sorry")    
    .replace(/\*?\[API_CALL:COINGECKO_MARKET_UPDATE\]\*?/gi, marketUpdate || "[market update unavailable]")
    .replace(/\*?\[API_CALL:COINGECKO_TRENDING\]\*?/gi, trendingCoins || "[trending info unavailable]");
}

io.on("connection", socket => {
  console.log("User connected:", socket.id);
  userContext[socket.id] = {
    lastCoinMentioned: null, lastIntent: null, fallbackCount: 0, flow: null, step: null, tempData: {}
  };

  socket.on("user_message", async msg => {
    const userMsg = msg.trim();
    const ctx = userContext[socket.id];

    // Portfolio builder logic
    if (ctx.flow === "portfolio_builder") {
      if (ctx.step === "ask_budget") {
        const budget = parseFloat(userMsg.replace(/[^\d.]/g, ""));
        if (isNaN(budget)) {
          socket.emit("bot_message", "Please enter a valid number for your budget.");
          return;
        }
        ctx.tempData.budget = budget;
        ctx.step = "ask_risk_level";
        socket.emit("bot_message", `Got it. Your budget is $${budget}. What's your risk tolerance? (high / low / mixed)`);
        return;
      }

      if (ctx.step === "ask_risk_level") {
        const risk = userMsg.toLowerCase().trim();
        if (!["high", "low", "mixed"].includes(risk)) {
          socket.emit("bot_message", "Please enter a valid risk tolerance: high, low, or mixed.");
          return; // Do not advance to next step
        }
        ctx.tempData.risk = risk;
        ctx.step = "ask_preference";
        socket.emit("bot_message", "Any specific coin preferences? If not, say 'no preference'.");
        return;
      }

      if (ctx.step === "ask_preference") {
        const pref = userMsg.toLowerCase();
        const risk = ctx.tempData.risk || "mixed";
        let picks;

        if (pref.includes("no")) {
          picks = (risk === "high") ? ["pepe", "dogecoin", "shiba", "solaxy", "centrifuge"]
                : (risk === "low") ? ["bitcoin", "ethereum", "bnb"]
                : ["bitcoin", "ethereum", "solana", "dogecoin"];
        } else {
          // Validate each coin
          const coinList = await loadCoinList();
          const entered = pref.split(/[ ,]+/).filter(Boolean);
          const valid = entered.filter(name => {
            const q = name.trim().toLowerCase();
            return coinList.some(c =>
              c.id.toLowerCase() === q ||
              c.symbol.toLowerCase() === q ||
              c.name.toLowerCase() === q
            );
          });
          if (valid.length === 0) {
            socket.emit("bot_message", "Please enter valid coin names or say 'no preference'.");
            return;
          }
          // If only one valid coin, add a couple of popular coins for a mix
          if (valid.length === 1) {
            // Avoid duplicates
            const extra = ["bitcoin", "ethereum"].filter(c => !valid.includes(c));
            picks = [valid[0], ...extra];
          } else {
            picks = valid;
          }
        }

        const amount = ctx.tempData.budget || 100;
        const perCoin = Math.floor(amount / picks.length);
        socket.emit("bot_message", `Here's a suggestion: ${picks.map(c => `$${perCoin} in ${c}`).join(", ")}`);

        ctx.flow = ctx.step = null;
        ctx.tempData = {};
        return;
      }
    }

    // Intent detection
    let intent = detectIntent(userMsg);
    let coinData = null;
    let extractedCoinName = null;

    // Only extract coin name and fetch coin data if intent is coin/price/market related
    const coinIntents = [
      "crypto_name_only",
      "crypto_price",
      "market_and_trends"
    ];

    if (intent && coinIntents.includes(intent.tag)) {
      extractedCoinName = extractCoinName(userMsg);
      coinData = await getCoinData(extractedCoinName);
      if (coinData) ctx.lastCoinMentioned = coinData.id;
    } else if (!intent && ctx.lastIntent === "crypto_name_only" && ctx.lastCoinMentioned) {
      intent = intents.intents.find(i => i.tag === "market_and_trends");
      coinData = { id: ctx.lastCoinMentioned };
    }

    if (intent) ctx.lastIntent = intent.tag;

    if (!intent && coinData?.id) {
  const price = await getLivePrice(coinData.id);
  if (price) {
    socket.emit("bot_message", `The current price of ${coinData.name} is ${price}.`);
    return;
  }
}

    if (!intent) {
      ctx.fallbackCount++;
      if (ctx.fallbackCount >= 3) {
        socket.emit("bot_message", "Let's reset. What would you like to know?");
        userContext[socket.id] = {
          lastCoinMentioned: null, lastIntent: null, fallbackCount: 0, flow: null, step: null, tempData: {}
        };
      } else {
        socket.emit("bot_message", "Didn't catch that. Could you rephrase?");
      }
      return;
    } else {
      ctx.fallbackCount = 0;
    }

    if (intent.tag === "portfolio builder") {
      ctx.flow = "portfolio_builder";
      ctx.step = "ask_budget";
      socket.emit("bot_message", "Sure! What's your total budget in USD?");
      return;
    }

    // When user asks for platform help
    if (intent && intent.tag === "crypto advice" && intent.answer.some(a => a.includes("Want help choosing a platform?"))) {
      ctx.flow = "platform_recommendation";
      socket.emit("bot_message", intent.answer[0]);
      return;
    }

    // Handle "yes" for platform recommendation
    if (ctx.flow === "platform_recommendation") {
      if (userMsg.toLowerCase().includes("yes")) {
        const platformIntent = intents.intents.find(i => i.tag === "crypto platforms");
        if (platformIntent) {
          socket.emit("bot_message", platformIntent.answer[0]);
        }
        ctx.flow = null;
        return;
      }
    }

    // Default: pick one random answer
    const rawAnswer = intent.answer[Math.floor(Math.random() * intent.answer.length)];
    let price = null;
    if (
      coinData?.id &&
      (rawAnswer.includes("[API_CALL:COINGECKO_PRICE]") || rawAnswer.includes("[API_CALL:COINGECKO_MARKET_UPDATE]"))
    ) {
      price = await getLivePrice(coinData.id);
    }

    let marketUpdate = null;
    let trendingCoins = null;

    if (rawAnswer.includes("[API_CALL:COINGECKO_MARKET_UPDATE]")) {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/global");
        const data = await res.json();
        const cap = data.data.total_market_cap.usd;
        marketUpdate = `Global crypto market cap is $${Math.round(cap).toLocaleString()}`;
      } catch { marketUpdate = null; }
    }

    if (rawAnswer.includes("[API_CALL:COINGECKO_TRENDING]")) {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
        const data = await res.json();
        trendingCoins = data.coins.map(c => c.item.name).slice(0, 3).join(", ");
      } catch { trendingCoins = null; }
    }

    // Check if user asked for help
    const helpKeywords = [
      "help", "what can u do", "how to", "how does this work", "commands", "what can you do",
      "assist me", "functions", "how do you work", "options", "features", "list", "support", "start"
    ];

    // Only match if the whole message is a help keyword (ignoring case and whitespace)
    const normalizedMsg = userMsg.trim().toLowerCase();
    if (
      helpKeywords.some(k => normalizedMsg === k) &&
      intent.answer && Array.isArray(intent.answer)
    ) {
      for (const ans of intent.answer) {
        const response = fillPlaceholders(
          ans,
          coinData?.name,
          price,
          marketUpdate,
          trendingCoins
        );
        socket.emit("bot_message", response);
      }
      return;
    }

    const response = fillPlaceholders(
      rawAnswer,
      coinData?.name,
      price,
      marketUpdate,
      trendingCoins
    );
    socket.emit("bot_message", response);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userContext[socket.id];
  });
});

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});