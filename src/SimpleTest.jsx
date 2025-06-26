/**
 * 简单测试组件
 */

import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>CultureBridge Test Page</h1>
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
        If you can see this, React is working!
      </p>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Backend Connection Test</h2>
        <p>Testing connection to backend API...</p>
        <button 
          onClick={() => {
            fetch('http://localhost:5000/health')
              .then(res => res.json())
              .then(data => {
                alert('Backend connected! Status: ' + data.status);
              })
              .catch(err => {
                alert('Backend connection failed: ' + err.message);
              });
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Backend Connection
        </button>
      </div>
    </div>
  );
};

export default SimpleTest;

