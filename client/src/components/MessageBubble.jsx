import React from 'react';

const MessageBubble = ({ sender, text, riskLevel }) => {
  const isUser = sender === 'user';

  return (
    <div
      className={`d-flex mb-2 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
    >
      <div
        className={`p-2 rounded ${isUser ? 'bg-primary text-white' : 'bg-light text-dark'}`}
        style={{ maxWidth: '70%' }}
      >
        <div>{text}</div>
        {/* Show risk badge if riskLevel prop exists */}
        {!isUser && riskLevel && <RiskBadge level={riskLevel} />}
      </div>
    </div>
  );
};

export default MessageBubble;
