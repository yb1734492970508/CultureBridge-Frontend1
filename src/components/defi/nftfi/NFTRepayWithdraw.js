import React, { useState } from 'react';
import AmountInput from '../common/AmountInput';
import TransactionButton from '../common/TransactionButton';
import './styles/NFTRepayWithdraw.css';

const NFTRepayWithdraw = () => {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayType, setRepayType] = useState('partial'); // 'partial' or 'full'
  const [isLoading, setIsLoading] = useState(false);

  // 模拟用户的借贷记录
  const userLoans = [
    {
      id: 1,
      nft: {
        tokenId: '1234',
        collection: 'CryptoPunks',
        name: 'CryptoPunk #1234',
        image: 'https://via.placeholder.com/150x150/667eea/ffffff?text=Punk%231234'
      },
      borrowedAmount: 22.6,
      borrowedToken: 'ETH',
      interestAccrued: 1.2,
      totalOwed: 23.8,
      healthFactor: 1.8,
      interestRate: 8.5,
      borrowDate: '2024-05-15',
      daysActive: 32
    },
    {
      id: 2,
      nft: {
        tokenId: '5678',
        collection: 'Bored Ape Yacht Club',
        name: 'Bored Ape #5678',
        image: 'https://via.placeholder.com/150x150/764ba2/ffffff?text=Ape%235678'
      },
      borrowedAmount: 17.2,
      borrowedToken: 'ETH',
      interestAccrued: 0.8,
      totalOwed: 18.0,
      healthFactor: 1.4,
      interestRate: 9.2,
      borrowDate: '2024-06-01',
      daysActive: 15
    }
  ];

  const calculateNewHealthFactor = () => {
    if (!selectedLoan || !repayAmount) return selectedLoan?.healthFactor || 0;
    
    const currentOwed = selectedLoan.totalOwed;
    const repayAmountNum = parseFloat(repayAmount) || 0;
    const newOwed = Math.max(0, currentOwed - repayAmountNum);
    
    if (newOwed === 0) return 999; // 完全还款
    
    // 简化计算：假设抵押品价值不变
    const collateralValue = selectedLoan.borrowedAmount * selectedLoan.healthFactor;
    return (collateralValue / newOwed).toFixed(2);
  };

  const getHealthFactorColor = (healthFactor) => {
    if (healthFactor >= 1.5) return 'healthy';
    if (healthFactor >= 1.2) return 'warning';
    return 'danger';
  };

  const handleRepay = async () => {
    if (!selectedLoan || !repayAmount) return;
    
    setIsLoading(true);
    // 模拟交易处理
    setTimeout(() => {
      setIsLoading(false);
      const isFullRepay = parseFloat(repayAmount) >= selectedLoan.totalOwed;
      if (isFullRepay) {
        alert(`成功全额还款并赎回NFT: ${selectedLoan.nft.name}`);
      } else {
        alert(`成功部分还款 ${repayAmount} ${selectedLoan.borrowedToken}`);
      }
      // 重置表单
      setSelectedLoan(null);
      setRepayAmount('');
    }, 2000);
  };

  return (
    <div className="nft-repay-withdraw">
      <h2>NFT还款与赎回</h2>
      <p className="section-description">
        偿还借款并赎回您的NFT抵押品
      </p>

      <div className="repay-container">
        {/* 借贷记录选择 */}
        <div className="loans-section">
          <h3>选择要还款的借贷记录</h3>
          {userLoans.length === 0 ? (
            <div className="no-loans">
              <div className="no-loans-icon">📋</div>
              <h4>暂无借贷记录</h4>
              <p>您还没有任何NFT抵押借贷记录</p>
              <button className="start-borrow-btn">开始借款</button>
            </div>
          ) : (
            <div className="loans-list">
              {userLoans.map((loan) => (
                <div
                  key={loan.id}
                  className={`loan-card ${selectedLoan?.id === loan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLoan(loan)}
                >
                  <div className="loan-nft">
                    <img src={loan.nft.image} alt={loan.nft.name} className="loan-nft-image" />
                    <div className="loan-nft-info">
                      <h4>{loan.nft.name}</h4>
                      <p>{loan.nft.collection}</p>
                    </div>
                  </div>
                  
                  <div className="loan-details">
                    <div className="loan-stat">
                      <span className="stat-label">借款金额:</span>
                      <span className="stat-value">{loan.borrowedAmount} {loan.borrowedToken}</span>
                    </div>
                    <div className="loan-stat">
                      <span className="stat-label">累计利息:</span>
                      <span className="stat-value interest">{loan.interestAccrued} {loan.borrowedToken}</span>
                    </div>
                    <div className="loan-stat">
                      <span className="stat-label">总欠款:</span>
                      <span className="stat-value total-owed">{loan.totalOwed} {loan.borrowedToken}</span>
                    </div>
                    <div className="loan-stat">
                      <span className="stat-label">健康因子:</span>
                      <span className={`stat-value health-factor ${getHealthFactorColor(loan.healthFactor)}`}>
                        {loan.healthFactor}
                      </span>
                    </div>
                    <div className="loan-stat">
                      <span className="stat-label">借款天数:</span>
                      <span className="stat-value">{loan.daysActive} 天</span>
                    </div>
                  </div>
                  
                  {selectedLoan?.id === loan.id && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 还款配置 */}
        {selectedLoan && (
          <div className="repay-config-section">
            <h3>还款配置</h3>
            
            <div className="repay-form">
              {/* 还款类型选择 */}
              <div className="repay-type-selector">
                <button
                  className={`type-btn ${repayType === 'partial' ? 'active' : ''}`}
                  onClick={() => {
                    setRepayType('partial');
                    setRepayAmount('');
                  }}
                >
                  部分还款
                </button>
                <button
                  className={`type-btn ${repayType === 'full' ? 'active' : ''}`}
                  onClick={() => {
                    setRepayType('full');
                    setRepayAmount(selectedLoan.totalOwed.toString());
                  }}
                >
                  全额还款
                </button>
              </div>

              {/* 还款金额输入 */}
              <div className="form-group">
                <label>还款金额 ({selectedLoan.borrowedToken})</label>
                <AmountInput
                  value={repayAmount}
                  onChange={setRepayAmount}
                  placeholder="输入还款金额"
                  maxAmount={selectedLoan.totalOwed}
                  token={selectedLoan.borrowedToken}
                  disabled={repayType === 'full'}
                />
                <div className="amount-info">
                  <span>总欠款: {selectedLoan.totalOwed} {selectedLoan.borrowedToken}</span>
                </div>
              </div>

              {/* 还款预览 */}
              <div className="repay-preview">
                <h4>还款预览</h4>
                <div className="preview-stats">
                  <div className="preview-row">
                    <span>还款金额:</span>
                    <span>{repayAmount || '0'} {selectedLoan.borrowedToken}</span>
                  </div>
                  <div className="preview-row">
                    <span>剩余欠款:</span>
                    <span>
                      {Math.max(0, selectedLoan.totalOwed - (parseFloat(repayAmount) || 0)).toFixed(4)} {selectedLoan.borrowedToken}
                    </span>
                  </div>
                  <div className="preview-row">
                    <span>新健康因子:</span>
                    <span className={`health-factor ${getHealthFactorColor(calculateNewHealthFactor())}`}>
                      {calculateNewHealthFactor()}
                    </span>
                  </div>
                  <div className="preview-row">
                    <span>NFT状态:</span>
                    <span className={parseFloat(repayAmount) >= selectedLoan.totalOwed ? 'nft-released' : 'nft-locked'}>
                      {parseFloat(repayAmount) >= selectedLoan.totalOwed ? '将被释放' : '继续抵押'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 全额还款提示 */}
              {parseFloat(repayAmount) >= selectedLoan.totalOwed && (
                <div className="full-repay-notice">
                  <div className="notice-icon">🎉</div>
                  <div className="notice-content">
                    <strong>全额还款</strong>
                    <p>您将完全偿还借款并赎回NFT: {selectedLoan.nft.name}</p>
                  </div>
                </div>
              )}

              <TransactionButton
                onClick={handleRepay}
                disabled={!selectedLoan || !repayAmount || parseFloat(repayAmount) <= 0}
                loading={isLoading}
                text={parseFloat(repayAmount) >= selectedLoan.totalOwed ? '全额还款并赎回NFT' : '部分还款'}
              />
            </div>
          </div>
        )}
      </div>

      {/* 还款说明 */}
      <div className="repay-info">
        <h3>还款说明</h3>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">💰</div>
            <h4>灵活还款</h4>
            <p>支持部分还款和全额还款，随时可以偿还借款</p>
          </div>
          <div className="info-item">
            <div className="info-icon">🔓</div>
            <h4>NFT赎回</h4>
            <p>全额还款后，您的NFT将立即从智能合约中释放</p>
          </div>
          <div className="info-item">
            <div className="info-icon">📊</div>
            <h4>健康因子</h4>
            <p>部分还款可以提高健康因子，降低清算风险</p>
          </div>
          <div className="info-item">
            <div className="info-icon">⏰</div>
            <h4>利息计算</h4>
            <p>利息按实际借款时间计算，还款后停止计息</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTRepayWithdraw;

