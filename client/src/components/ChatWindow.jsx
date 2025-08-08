import React from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages }) => {
  return (
    <div className="flex-grow-1 p-3" 
      style={{ 
        backgroundColor: 'white',
        minHeight: '65vh', 
        overflowY: 'auto',
        borderRadius: '5px',
        border: '1px solid #ddd', 
        }}
      >
      
      {messages.length === 0 ? (
      <p className="text-muted">Chat messages will be displayed here.</p>
      ) : (
        messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender} text={msg.text} />
        ))
      )}
    </div>
  );
};

export default ChatWindow;
