import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';
import SummaryCard from './components/SummaryCard';

function App() {
  const [messages, setMessages] = useState([]);

  const handleSend = (message) => {
    setMessages([...messages, { sender: 'user', text: message }]);
    // backend/socket integration coming soon...
  };

  return (
    <div className="d-flex flex-column vh-100">
      <Header />
      <ChatWindow messages={messages}/>
      <InputBox onSend={handleSend} />
      {messages.length >= 20 && <SummaryCard messages={messages} />}
    </div>
  );
}

export default App;
