import React from 'react';

/**
 * 链选择器组件
 * 允许用户选择要查看的区块链网络
 */
const ChainSelector = ({ chains, selectedChain, onChainSelect }) => {
  return (
    <div className="chain-selector">
      <h3>选择网络</h3>
      <div className="chain-options">
        {chains.map((chain) => (
          <button
            key={chain.id}
            className={`chain-option ${selectedChain === chain.id ? 'active' : ''}`}
            onClick={() => onChainSelect(chain.id)}
            style={{
              '--chain-color': chain.color
            }}
          >
            <span className="chain-icon">{chain.icon}</span>
            <span className="chain-name">{chain.name}</span>
            {chain.chainId && (
              <span className="chain-id">({chain.chainId})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChainSelector;

