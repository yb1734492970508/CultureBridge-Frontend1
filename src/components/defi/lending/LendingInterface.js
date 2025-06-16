import React from 'react';
import './styles/LendingInterface.css';

const LendingInterface = () => {
  // Dummy data for demonstration
  const availableTokens = [
    { symbol: 'ETH', name: 'Ethereum', icon: '/images/eth.png' },
    { symbol: 'USDT', name: 'Tether', icon: '/images/usdt.png' },
    { symbol: 'DAI', name: 'Dai', icon: '/images/dai.png' },
  ];

  const [selectedToken, setSelectedToken] = React.useState(availableTokens[0]);
  const [amount, setAmount] = React.useState('');
  const [operation, setOperation] = React.useState('supply'); // 'supply' or 'borrow'

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleOperationChange = (op) => {
    setOperation(op);
  };

  const handleTransaction = () => {
    alert(`${operation} ${amount} ${selectedToken.symbol}`);
    // In a real application, this would interact with a blockchain smart contract
  };

  return (
    <div className="lending-interface">
      <h2>借贷操作</h2>
      <div className="operation-selector">
        <button
          className={operation === 'supply' ? 'active' : ''}
          onClick={() => handleOperationChange('supply')}
        >
          存款
        </button>
        <button
          className={operation === 'borrow' ? 'active' : ''}
          onClick={() => handleOperationChange('borrow')}
        >
          借款
        </button>
      </div>

      <div className="input-section">
        <div className="token-selector">
          <label>选择代币</label>
          <select 
            value={selectedToken.symbol} 
            onChange={(e) => handleTokenSelect(availableTokens.find(t => t.symbol === e.target.value))}
          >
            {availableTokens.map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="amount-input">
          <label>金额</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="输入金额"
          />
        </div>
      </div>

      <div className="summary-section">
        <p>预计年化收益/利率: --%</p>
        <p>可用余额: -- {selectedToken.symbol}</p>
      </div>

      <button
        className="transaction-button"
        onClick={handleTransaction}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        {operation === 'supply' ? '存款' : '借款'}
      </button>
    </div>
  );
};

export default LendingInterface;


