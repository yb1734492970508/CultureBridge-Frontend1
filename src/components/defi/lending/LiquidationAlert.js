import React from 'react';
import './styles/LiquidationAlert.css';

const LiquidationAlert = ({ healthFactor }) => {
  const isAtRisk = healthFactor < 1.2; // Example threshold for high risk

  if (!isAtRisk) {
    return null;
  }

  return (
    <div className="liquidation-alert">
      <h3>清算风险警告！</h3>
      <p>您的健康因子为 <strong>{healthFactor.toFixed(2)}</strong>，已接近清算线。</p>
      <p>请及时补充抵押品或偿还部分借款以降低风险。</p>
      {/* TODO: Add actions like add collateral or repay */}
    </div>
  );
};

export default LiquidationAlert;


