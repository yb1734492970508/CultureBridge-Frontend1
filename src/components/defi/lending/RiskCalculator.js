import React from 'react';
import './styles/RiskCalculator.css';

const RiskCalculator = () => {
  // Dummy data for demonstration
  const [collateralValue, setCollateralValue] = React.useState(10000);
  const [borrowedValue, setBorrowedValue] = React.useState(5000);
  const [liquidationThreshold, setLiquidationThreshold] = React.useState(0.85);

  const healthFactor = collateralValue / (borrowedValue / liquidationThreshold);

  return (
    <div className="risk-calculator">
      <h2>风险计算工具</h2>
      <p>这里将帮助您计算借贷风险指标。</p>
      <div className="input-group">
        <label>抵押品价值:</label>
        <input
          type="number"
          value={collateralValue}
          onChange={(e) => setCollateralValue(parseFloat(e.target.value))}
        />
      </div>
      <div className="input-group">
        <label>借款价值:</label>
        <input
          type="number"
          value={borrowedValue}
          onChange={(e) => setBorrowedValue(parseFloat(e.target.value))}
        />
      </div>
      <div className="input-group">
        <label>清算阈值:</label>
        <input
          type="number"
          step="0.01"
          value={liquidationThreshold}
          onChange={(e) => setLiquidationThreshold(parseFloat(e.target.value))}
        />
      </div>
      <div className="result-section">
        <h3>健康因子: {healthFactor.toFixed(2)}</h3>
        <p className={healthFactor < 1.2 ? 'risk-high' : healthFactor < 1.5 ? 'risk-medium' : 'risk-low'}>
          {healthFactor < 1.2 ? '高风险' : healthFactor < 1.5 ? '中风险' : '低风险'}
        </p>
        {/* TODO: Add more detailed risk assessment and recommendations */}
      </div>
    </div>
  );
};

export default RiskCalculator;


