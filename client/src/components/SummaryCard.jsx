import React from 'react';

const SummaryCard = ({ messages }) => {
  // Just a simple summary: count user messages & bot messages
  const userCount = messages.filter(msg => msg.sender === 'user').length;
  const botCount = messages.length - userCount;

  return (
    <div className="border p-3 mt-3 rounded shadow-sm" style={{ backgroundColor: '#fff' }}>
      <h5>Conversation Summary</h5>
      <p>Total messages: {messages.length}</p>
      <p>User messages: {userCount}</p>
      <p>Bot messages: {botCount}</p>
      <p>Thanks for chatting with us!</p>
    </div>
  );
};

export default SummaryCard;
