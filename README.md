# 💬 TradeBot Advisor – Real-Time Crypto Investment Chatbot

**TradeBot Advisor** is a full-stack conversational chatbot designed to assist users with cryptocurrency-related decisions and live data. It offers real-time price tracking, market updates, beginner advice, wallet and platform suggestions, and even helps users build personalized investment portfolios based on their preferences.

This project merges a modern chat interface with intelligent backend logic to create an engaging and helpful crypto assistant, accessible via a sleek web UI and powered by live APIs.

---

# Features

- 🧠 **Conversational AI with Context Memory**  
  Remembers conversation state to provide personalized and follow-up responses.

- 🔍 **Live Cryptocurrency Data (via CoinGecko API)**  
  Instantly answers queries like:  
  - "price of bitcoin"
  - "market update"
  - "trending coins"

- 💼 **Custom Portfolio Builder**  
  Helps users build a crypto portfolio based on budget and risk profile.

- 🧰 **Beginner-Friendly Investment Guidance**  
  Explains basic concepts like wallets, storage, exchanges, and risk.

- 🔗 **Trusted Links for Platforms and Wallets**  
  Offers quick access to Binance, Coinbase, Trust Wallet, MetaMask, and more.

- 🧱 **Keyword-Based Intent Matching**  
  Uses a flexible and easily editable `intents.json` system for mapping queries to responses — no need to hardcode logic.

- 💬 **Multi-Turn Dialogue Handling**  
  Can sustain conversations across 20+ turns without breaking context.

---

# Preview

![TradeBot Chat Interface](https://your-image-url.com/chat-preview.png)  
_(Live screenshot of the chat interface on desktop view)_

---

## Tech Stack

### Frontend
- React 18
- Bootstrap 5
- HTML5 + CSS3
- Responsive UI (mobile & desktop)

### Backend
- Node.js
- Express.js
- Socket.IO for real-time messaging
- dotenv for environment variables

### APIs
- **[CoinGecko API](https://www.coingecko.com/)** — Used for:
  - Real-time price queries
  - Market trends
  - Global crypto stats

---

## Usage

### Installation (Local)

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/tradebot-advisor.git
   cd tradebot-advisor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Visit:  
   `http://localhost:5000` in your browser.

### ☁️ Deployment

The chatbot is deployed on **Microsoft Azure App Services** with:
- SSL Encryption (HTTPS)
- Publicly accessible URL

> 💡 You can also deploy this on Vercel, Render, or Heroku with minimal config changes.

---

## Project Structure

```
├── intents.json         # Defines intents, keywords, and responses
├── server.js            # Express + Socket.IO backend
├── index.html           # Main entry point for frontend
├── /client              # React frontend components (if split)
├── package.json         # Scripts and dependencies
└── .gitignore
```

---

## Extending the Bot

To add a new functionality (e.g., support for NFT info or DeFi stats):

1. Add a new `tag` in `intents.json` with:
   - relevant `keywords`
   - bot `response` or [API_CALL] placeholder

2. No backend change needed — the system dynamically reads intents.

---

## Example Intents Supported

- **"How do I buy crypto?"** → Suggests platforms like Binance, Coinbase  
- **"Give me wallet links"** → Offers MetaMask, Trust Wallet, Ledger, Trezor  
- **"What's trending?"** → Lists hot coins using live data  
- **"Start portfolio with $200"** → Builds a sample portfolio

---

## Contributions

This project was built collaboratively as part of an academic team initiative.  
Contributions are welcome! Just fork the repo, open a pull request, and let's build better investment tools together.

---

## License

This project is open-source under the **MIT License**.  
Feel free to use, adapt, and build upon it.

---

## Contact

Questions, feedback, or feature suggestions?  
Feel free to open an issue or reach out via GitHub.

> *"Helping you make smarter crypto moves, one message at a time."*