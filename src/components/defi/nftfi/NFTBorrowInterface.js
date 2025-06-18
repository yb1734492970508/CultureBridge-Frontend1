import React, { useState } from 'react';
import TokenSelector from '../common/TokenSelector';
import AmountInput from '../common/AmountInput';
import TransactionButton from '../common/TransactionButton';
import './styles/NFTBorrowInterface.css';

const NFTBorrowInterface = () => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [borrowToken, setBorrowToken] = useState('ETH');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 模拟用户拥有的NFT
  const userNFTs = [
    {
      id: 1,
      tokenId: '1111',
      collection: 'CryptoPunks',
      name: 'CryptoPunk #1111',
      image: 'https://via.placeholder.com/150x150/667eea/ffffff?text=Punk%231111',
      floorPrice: 45.2,
      maxLTV: 50,
      estimatedValue: 45.2
    },
    {
      id: 2,
      tokenId: '2222',
      collection: 'Bored Ape Yacht Club',
      name: 'Bored Ape #2222',
      image: 'https://via.placeholder.com/150x150/764ba2/ffffff?text=Ape%232222',
      floorPrice: 28.7,
      maxLTV: 45,
      estimatedValue: 28.7
    },
    {
      id: 3,
      tokenId: '3333',
      collection: 'Azuki',
      name: 'Azuki #3333',
      image: 'https://via.placeholder.com/150x150/ff6b6b/ffffff?text=Azuki%233333',
      floorPrice: 12.3,
      maxLTV: 40,
      estimatedValue: 12.3
    }
  ];

  const calculateMaxBorrow = () => {
    if (!selectedNFT) return 0;
    return (selectedNFT.estimatedValue * selectedNFT.maxLTV / 100).toFixed(2);
  };

  const calculateHealthFactor = () => {
    if (!selectedNFT || !borrowAmount) return 0;
    const collateralValue = selectedNFT.estimatedValue;
    const borrowed = parseFloat(borrowAmount) || 0;
    if (borrowed === 0) return 999;
    return (collateralValue / borrowed).toFixed(2);
  };

  const getHealthFactorColor = (healthFactor) => {
    if (healthFactor >= 1.5) return 'healthy';
    if (healthFactor >= 1.2) return 'warning';
    return 'danger';
  };

  const handleBorrow = async () => {
    if (!selectedNFT || !borrowAmount) return;
    
    setIsLoading(true);
    // 模拟交易处理
    setTimeout(() => {
      setIsLoading(false);
      alert(`成功借入 ${borrowAmount} ${borrowToken}，抵押NFT: ${selectedNFT.name}`);
      // 重置表单
      setSelectedNFT(null);
      setBorrowAmount('');
    }, 2000);
  };

  return (
    <div className="nft-borrow-interface">
      <h2>NFT抵押借款</h2>
      <p className="section-description">
        选择您的NFT作为抵押品，获得即时流动性
      </p>

      <div className="borrow-container">
        {/* NFT选择区域 */}
        <div className="nft-selection-section">
          <h3>选择抵押NFT</h3>
          {userNFTs.length === 0 ? (
            <div className="no-nfts">
              <div className="no-nfts-icon">🖼️</div>
              <p>您还没有可用于抵押的NFT</p>
              <button className="browse-nfts-btn">浏览NFT市场</button>
            </div>
          ) : (
            <div className="nft-grid">
              {userNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className={`nft-card ${selectedNFT?.id === nft.id ? 'selected' : ''}`}
                  onClick={() => setSelectedNFT(nft)}
                >
                  <img src={nft.image} alt={nft.name} className="nft-image" />
                  <div className="nft-details">
                    <h4>{nft.name}</h4>
                    <p className="nft-collection">{nft.collection}</p>
                    <div className="nft-stats">
                      <div className="stat">
                        <span className="stat-label">估值:</span>
                        <span className="stat-value">{nft.estimatedValue} ETH</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">最大LTV:</span>
                        <span className="stat-value">{nft.maxLTV}%</span>
                      </div>
                    </div>
                  </div>
                  {selectedNFT?.id === nft.id && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 借款配置区域 */}
        {selectedNFT && (
          <div className="borrow-config-section">
            <h3>借款配置</h3>
            
            <div className="config-form">
              <div className="form-group">
                <label>借入代币</label>
                <TokenSelector
                  selectedToken={borrowToken}
                  onTokenSelect={setBorrowToken}
                  tokens={['ETH', 'USDT', 'DAI']}
                />
              </div>

              <div className="form-group">
                <label>借款金额</label>
                <AmountInput
                  value={borrowAmount}
                  onChange={setBorrowAmount}
                  placeholder="输入借款金额"
                  maxAmount={calculateMaxBorrow()}
                  token={borrowToken}
                />
                <div className="amount-info">
                  <span>最大可借: {calculateMaxBorrow()} {borrowToken}</span>
                </div>
              </div>

              {/* 借款预览 */}
              <div className="borrow-preview">
                <h4>借款预览</h4>
                <div className="preview-stats">
                  <div className="preview-row">
                    <span>抵押NFT:</span>
                    <span>{selectedNFT.name}</span>
                  </div>
                  <div className="preview-row">
                    <span>抵押价值:</span>
                    <span>{selectedNFT.estimatedValue} ETH</span>
                  </div>
                  <div className="preview-row">
                    <span>借款金额:</span>
                    <span>{borrowAmount || '0'} {borrowToken}</span>
                  </div>
                  <div className="preview-row">
                    <span>贷款价值比:</span>
                    <span>
                      {borrowAmount ? 
                        ((parseFloat(borrowAmount) / selectedNFT.estimatedValue) * 100).toFixed(1) : '0'
                      }%
                    </span>
                  </div>
                  <div className="preview-row">
                    <span>健康因子:</span>
                    <span className={`health-factor ${getHealthFactorColor(calculateHealthFactor())}`}>
                      {calculateHealthFactor()}
                    </span>
                  </div>
                  <div className="preview-row">
                    <span>预估利率:</span>
                    <span className="interest-rate">8.5% APR</span>
                  </div>
                </div>
              </div>

              {/* 风险提示 */}
              {parseFloat(calculateHealthFactor()) < 1.3 && borrowAmount && (
                <div className="risk-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-content">
                    <strong>高风险警告!</strong>
                    <p>您的健康因子较低，存在清算风险。建议降低借款金额。</p>
                  </div>
                </div>
              )}

              <TransactionButton
                onClick={handleBorrow}
                disabled={!selectedNFT || !borrowAmount || parseFloat(borrowAmount) <= 0}
                loading={isLoading}
                text="确认借款"
              />
            </div>
          </div>
        )}
      </div>

      {/* 借款说明 */}
      <div className="borrow-info">
        <h3>借款说明</h3>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">🔒</div>
            <h4>安全抵押</h4>
            <p>您的NFT将被安全锁定在智能合约中，直到还款完成</p>
          </div>
          <div className="info-item">
            <div className="info-icon">💰</div>
            <h4>即时流动性</h4>
            <p>无需出售NFT即可获得流动性，保持对NFT的所有权</p>
          </div>
          <div className="info-item">
            <div className="info-icon">📊</div>
            <h4>灵活还款</h4>
            <p>支持随时还款，利息按实际借款时间计算</p>
          </div>
          <div className="info-item">
            <div className="info-icon">⚡</div>
            <h4>清算保护</h4>
            <p>实时监控健康因子，提供清算风险预警</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTBorrowInterface;

