import React from 'react';

const TestApp = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1>React is working! 🎉</h1>
        <p>If you can see this, React is rendering correctly.</p>
        <p>Check the browser console (F12) for any error messages.</p>
      </div>
    </div>
  );
};

export default TestApp;
