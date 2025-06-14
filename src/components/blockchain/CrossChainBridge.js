import React, { useState } from 'react';
import './CrossChainBridge.css';

/**
 * 简化版跨链桥组件
 */
const CrossChainBridge = () => {
  const [activeTab, setActiveTab] = useState('bridge');

  return (
    <div className="cross-chain-bridge">
      <div className="bridge-header">
        <h2>跨链桥</h2>
        <p>在不同区块链网络间安全转移您的数字资产</p>
      </div>

      <div className="bridge-tabs">
        <button 
          className={`tab-btn ${activeTab === 'bridge' ? 'active' : ''}`}
          onClick={() => setActiveTab('bridge')}
        >
          跨链转移
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          历史记录
        </button>
      </div>

      <div className="bridge-content">
        {activeTab === 'bridge' && (
          <div className="bridge-form">
            <div className="form-section">
              <h3>源链</h3>
              <select className="chain-select">
                <option value="ethereum">以太坊</option>
                <option value="bsc">BNB智能链</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>

            <div className="form-section">
              <h3>目标链</h3>
              <select className="chain-select">
                <option value="bsc">BNB智能链</option>
                <option value="ethereum">以太坊</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>

            <div className="form-section">
              <h3>代币</h3>
              <select className="token-select">
                <option value="cbt">CBT</option>
                <option value="usdt">USDT</option>
                <option value="eth">ETH</option>
              </select>
            </div>

            <div className="form-section">
              <h3>数量</h3>
              <input 
                type="number" 
                placeholder="0.0" 
                className="amount-input"
              />
            </div>

            <div className="form-section">
              <h3>接收地址</h3>
              <input 
                type="text" 
                placeholder="0x..." 
                className="address-input"
              />
            </div>

            <button className="bridge-button">
              开始跨链转移
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-content">
            <div className="history-placeholder">
              <p>暂无跨链转移记录</p>
              <p>完成首次跨链转移后，记录将显示在这里</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossChainBridge;

