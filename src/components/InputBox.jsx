import React, { useState } from 'react';
import FileUpload from './FileUpload';

const InputBox = ({ onSend }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const sendMessage = () => {
    const message = text.trim();
    if (!message && !file) return;

    if(message) {
      onSend(message);
      setText('');
    }

    if (file) {
      onSend('[File sent: ${file.name}]');
      setFile(null);
    }
  };

  return (
    <div className="p-2 border-top">
      <div className="input-group mb-2">
        <textarea
          className="form-control"
          rows="1"
          placeholder="Write your message here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          style={{ resize: 'none' }}
        />
        <button className="btn btn-warning" onClick={sendMessage}>
          Send
        </button>
      </div>
      <FileUpload onFileSelect={setFile} />
    </div>

  );
};

export default InputBox;
