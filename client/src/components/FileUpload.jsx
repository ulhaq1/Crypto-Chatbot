import React, { useState } from 'react';

const FileUpload = ({ onFileSelect }) => {
  const [file, setFile] = useState(null);

  const onChange = (e) => {
    if (e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      onFileSelect(selected);
    }
  };

  const clearFile = () => {
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div className="d-flex align-items-center">
      <input
        type="file"
        className="form-control"
        onChange={onChange}
        accept="image/*,application/pdf"
      />
      {file && (
        <div className="ms-2 d-flex align-items-center" style={{ maxWidth: '180px' }}>
          <small className="text-truncate" title={file.name}>
            {file.name}
          </small>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={clearFile}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
