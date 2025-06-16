import React from 'react';
import './styles/CollateralManager.css';

const CollateralManager = () => {
  // Dummy data for demonstration
  const userPositions = [
    {
      asset: 'ETH',
      supplied: 10,
      borrowed: 5,
      collateralValue: 8000, // Example value
      healthFactor: 1.6,
    },
    {
      asset: 'USDT',
      supplied: 1000,
      borrowed: 0,
      collateralValue: 1000,
      healthFactor: 999,
    },
  ];

  return (
    <div className="collateral-manager">
      <h2>抵押品管理</h2>
      <p>这里将展示您的抵押品组合，监控抵押率和健康度。</p>
      <div className="positions-list">
        {userPositions.map((position, index) => (
          <div key={index} className="position-card">
            <h3>{position.asset}</h3>
            <p>已存款: {position.supplied}</p>
            <p>已借款: {position.borrowed}</p>
            <p>抵押品价值: ${position.collateralValue}</p>
            <p>健康因子: {position.healthFactor}</p>
            {/* TODO: Add actions like adjust collateral, repay, withdraw */}
          </div>
        ))}
      </div>
      {/* TODO: Add overall collateral ratio, liquidation risk, and recommendations */}
    </div>
  );
};

export default CollateralManager;


