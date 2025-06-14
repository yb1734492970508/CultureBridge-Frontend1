import React, { useState, useRef, useEffect } from 'react';
import './TokenSelector.css';

/**
 * 代币选择器组件
 * 支持代币搜索、选择和显示
 */
const TokenSelector = ({ 
  selectedToken, 
  onTokenSelect, 
  tokens = [], 
  className = '',
  placeholder = '选择代币'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // 过滤代币列表
  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理代币选择
  const handleTokenSelect = (token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchTerm('');
  };

  // 处理搜索输入
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 打开下拉框时聚焦搜索框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 格式化代币余额
  const formatBalance = (balance) => {
    if (!balance) return '0';
    const num = parseFloat(balance);
    if (num < 0.001) return '< 0.001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(3);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  };

  return (
    <div className={`token-selector ${className}`} ref={dropdownRef}>
      {/* 选择按钮 */}
      <button
        className={`token-selector-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {selectedToken ? (
          <div className="selected-token">
            <img 
              src={selectedToken.logoURI || '/images/tokens/default.png'} 
              alt={selectedToken.symbol}
              className="token-logo"
              onError={(e) => {
                e.target.src = '/images/tokens/default.png';
              }}
            />
            <span className="token-symbol">{selectedToken.symbol}</span>
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <svg 
          className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path 
            d="M3 4.5L6 7.5L9 4.5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
          />
        </svg>
      </button>

      {/* 下拉框 */}
      {isOpen && (
        <div className="token-dropdown">
          {/* 搜索框 */}
          <div className="search-container">
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索代币名称或地址"
              value={searchTerm}
              onChange={handleSearchChange}
              className="token-search-input"
            />
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16">
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* 常用代币 */}
          {!searchTerm && (
            <div className="common-tokens">
              <div className="section-title">常用代币</div>
              <div className="common-tokens-grid">
                {tokens.slice(0, 4).map((token) => (
                  <button
                    key={token.address}
                    className="common-token-button"
                    onClick={() => handleTokenSelect(token)}
                  >
                    <img 
                      src={token.logoURI || '/images/tokens/default.png'} 
                      alt={token.symbol}
                      className="token-logo-small"
                      onError={(e) => {
                        e.target.src = '/images/tokens/default.png';
                      }}
                    />
                    <span>{token.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 代币列表 */}
          <div className="token-list">
            {searchTerm && (
              <div className="section-title">
                搜索结果 ({filteredTokens.length})
              </div>
            )}
            
            {filteredTokens.length > 0 ? (
              <div className="token-list-container">
                {filteredTokens.map((token) => (
                  <button
                    key={token.address}
                    className={`token-list-item ${
                      selectedToken?.address === token.address ? 'selected' : ''
                    }`}
                    onClick={() => handleTokenSelect(token)}
                  >
                    <div className="token-info">
                      <img 
                        src={token.logoURI || '/images/tokens/default.png'} 
                        alt={token.symbol}
                        className="token-logo"
                        onError={(e) => {
                          e.target.src = '/images/tokens/default.png';
                        }}
                      />
                      <div className="token-details">
                        <div className="token-symbol">{token.symbol}</div>
                        <div className="token-name">{token.name}</div>
                      </div>
                    </div>
                    
                    <div className="token-balance">
                      <div className="balance-amount">
                        {formatBalance(token.balance || '0')}
                      </div>
                      {token.balanceUSD && (
                        <div className="balance-usd">
                          ${parseFloat(token.balanceUSD).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-text">
                  {searchTerm ? '未找到匹配的代币' : '暂无可用代币'}
                </div>
                {searchTerm && (
                  <div className="no-results-suggestion">
                    请检查代币符号或合约地址是否正确
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 添加自定义代币 */}
          {searchTerm && searchTerm.startsWith('0x') && searchTerm.length === 42 && (
            <div className="custom-token-section">
              <button className="add-custom-token-button">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path
                    d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM4.5 8a.5.5 0 0 1 .5-.5h2.5V5a.5.5 0 0 1 1 0v2.5H11a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V8.5H5a.5.5 0 0 1-.5-.5z"
                    fill="currentColor"
                  />
                </svg>
                添加自定义代币
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;

