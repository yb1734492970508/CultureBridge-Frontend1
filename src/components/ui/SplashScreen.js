import React from 'react';

const SplashScreen = ({ isLoading }) => {
  return (
    <div className="splash-screen">
      <div className="splash-logo">🌍 CultureBridge</div>
      <div className="splash-tagline">连接世界，分享文化</div>
      {isLoading && <div className="loading-spinner"></div>}
    </div>
  );
};

export default SplashScreen;

