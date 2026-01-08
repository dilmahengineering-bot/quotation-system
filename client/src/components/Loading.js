import React from 'react';

const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <span>{text}</span>
    </div>
  );
};

export default Loading;
