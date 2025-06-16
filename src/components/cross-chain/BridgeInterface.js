import React, { useState, useEffect, useCallback } from 'react';
import useBridgeEstimation from '../../hooks/useBridgeEstimation';
import './BridgeInterface.css';

/**
 * 跨链桥接界面组件
 * 提供资产跨链转移功能
 */
const BridgeInterface = ({
  chains,
  assets,
  balances,
  bridgeStatus,
  config,
  onConfigChange,
  onBridge,
  onStatusCheck
}) => {
  const [estimation, setEstimation] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [bridgeStep, setBridgeStep] = useState('config'); // config, confirm, processing, complete

  const {
    estimateBridge,
    getSupportedRoutes,
    getBridgeFees
  } = useBridgeEstimation();

  // 获取可用资产
  const getAvailableAssets = () => {
    const fromChainBalances = balances[config.fromChain] || [];
    return fromChainBalances.filter(balance => 
      balance.type === 'token' && parseFloat(balance.balance) > 0
    );
  };

  // 获取支持的目标链
  const getSupportedToChains = () => {
    if (!config.asset) return chains;
    
    const supportedRoutes = getSupportedRoutes(config.fromChain, config.asset.address);
    return chains.filter(chain => 
      chain.id !== config.fromChain && 
      supportedRoutes.includes(chain.id)
    );
  };

  // 处理配置更新
  const handleConfigUpdate = useCallback((updates) => {
    const newConfig = { ...config, ...updates };
    
    // 如果改变了源链，清除资产选择
    if (updates.fromChain && updates.fromChain !== config.fromChain) {
      newConfig.asset = null;
      newConfig.amount = '';
    }
    
    // 如果改变了资产，清除数量
    if (updates.asset && updates.asset !== config.asset) {
      newConfig.amount = '';
    }
    
    onConfigChange(newConfig);
  }, [config, onConfigChange]);

  // 估算桥接费用
  const handleEstimate = useCallback(async () => {
    if (!config.asset || !config.amount || parseFloat(config.amount) <= 0) {
      return;
    }

    setIsEstimating(true);
    try {
      const result = await estimateBridge({
        fromChain: config.fromChain,
        toChain: config.toChain,
        asset: config.asset.address,
        amount: config.amount
      });
      setEstimation(result);
    } catch (error) {
      console.error('估算失败:', error);
      setEstimation(null);
    } finally {
      setIsEstimating(false);
    }
  }, [config, estimateBridge]);

  // 自动估算
  useEffect(() => {
    const timer = setTimeout(() => {
      if (config.asset && config.amount && parseFloat(config.amount) > 0) {
        handleEstimate();
      } else {
        setEstimation(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [config.asset, config.amount, handleEstimate]);

  // 处理桥接
  const handleBridgeSubmit = async () => {
    if (!estimation) return;

    setBridgeStep('processing');
    try {
      const result = await onBridge({
        fromChain: config.fromChain,
        toChain: config.toChain,
        asset: config.asset.address,
        amount: config.amount,
        estimation
      });
      
      setBridgeStep('complete');
      return result;
    } catch (error) {
      setBridgeStep('config');
      throw error;
    }
  };

  // 获取链信息
  const getChainInfo = (chainId) => {
    return chains.find(chain => chain.id === chainId);
  };

  // 格式化数量
  const formatAmount = (amount, decimals = 4) => {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    return num.toFixed(decimals);
  };

  // 渲染链选择器
  const renderChainSelector = (value, onChange, label, excludeChain = null) => {
    const availableChains = chains.filter(chain => chain.id !== excludeChain);
    
    return (
      <div className="chain-selector">
        <label className="selector-label">{label}</label>
        <div className="chain-options">
          {availableChains.map(chain => (
            <button
              key={chain.id}
              className={`chain-option ${value === chain.id ? 'selected' : ''}`}
              onClick={() => onChange(chain.id)}
            >
              <img src={chain.icon} alt={chain.name} className="chain-icon" />
              <span className="chain-name">{chain.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 渲染资产选择器
  const renderAssetSelector = () => {
    const availableAssets = getAvailableAssets();
    
    if (availableAssets.length === 0) {
      return (
        <div className="asset-selector">
          <label className="selector-label">选择资产</label>
          <div className="empty-assets">
            <p>在 {getChainInfo(config.fromChain)?.name} 上没有可用资产</p>
          </div>
        </div>
      );
    }

    return (
      <div className="asset-selector">
        <label className="selector-label">选择资产</label>
        <div className="asset-dropdown">
          <button className="asset-dropdown-trigger">
            {config.asset ? (
              <div className="selected-asset">
                <img src={config.asset.icon} alt={config.asset.name} className="asset-icon" />
                <div className="asset-info">
                  <div className="asset-name">{config.asset.name}</div>
                  <div className="asset-balance">
                    余额: {formatAmount(config.asset.balance)} {config.asset.symbol}
                  </div>
                </div>
              </div>
            ) : (
              <span className="placeholder">选择要桥接的资产</span>
            )}
            <span className="dropdown-arrow">▼</span>
          </button>
          
          <div className="asset-dropdown-menu">
            {availableAssets.map(asset => (
              <button
                key={asset.address}
                className="asset-option"
                onClick={() => handleConfigUpdate({ asset })}
              >
                <img src={asset.icon} alt={asset.name} className="asset-icon" />
                <div className="asset-info">
                  <div className="asset-name">{asset.name}</div>
                  <div className="asset-balance">
                    {formatAmount(asset.balance)} {asset.symbol}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染数量输入
  const renderAmountInput = () => {
    const maxAmount = config.asset ? parseFloat(config.asset.balance) : 0;
    
    return (
      <div className="amount-input">
        <label className="input-label">桥接数量</label>
        <div className="amount-input-container">
          <input
            type="number"
            value={config.amount}
            onChange={(e) => handleConfigUpdate({ amount: e.target.value })}
            placeholder="0.0"
            className="amount-field"
            min="0"
            max={maxAmount}
            step="any"
          />
          <div className="amount-controls">
            <button
              className="max-button"
              onClick={() => handleConfigUpdate({ amount: maxAmount.toString() })}
              disabled={!config.asset}
            >
              最大
            </button>
            <div className="amount-symbol">
              {config.asset?.symbol || ''}
            </div>
          </div>
        </div>
        {config.asset && (
          <div className="balance-info">
            可用余额: {formatAmount(config.asset.balance)} {config.asset.symbol}
          </div>
        )}
      </div>
    );
  };

  // 渲染估算信息
  const renderEstimation = () => {
    if (isEstimating) {
      return (
        <div className="estimation-loading">
          <div className="loading-spinner small" />
          <span>正在估算费用...</span>
        </div>
      );
    }

    if (!estimation) {
      return null;
    }

    return (
      <div className="bridge-estimation">
        <h4>桥接估算</h4>
        <div className="estimation-details">
          <div className="estimation-item">
            <span className="label">桥接费用:</span>
            <span className="value">{estimation.bridgeFee} {estimation.feeToken}</span>
          </div>
          <div className="estimation-item">
            <span className="label">网络费用:</span>
            <span className="value">{estimation.networkFee} ETH</span>
          </div>
          <div className="estimation-item">
            <span className="label">预计时间:</span>
            <span className="value">{estimation.estimatedTime}</span>
          </div>
          <div className="estimation-item">
            <span className="label">接收数量:</span>
            <span className="value highlight">
              {estimation.receiveAmount} {config.asset?.symbol}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染配置步骤
  const renderConfigStep = () => (
    <div className="bridge-config">
      <div className="config-section">
        {renderChainSelector(
          config.fromChain,
          (fromChain) => handleConfigUpdate({ fromChain }),
          '从链',
          config.toChain
        )}
      </div>

      <div className="bridge-arrow">
        <button
          className="swap-chains-button"
          onClick={() => handleConfigUpdate({
            fromChain: config.toChain,
            toChain: config.fromChain,
            asset: null,
            amount: ''
          })}
          title="交换链"
        >
          ⇄
        </button>
      </div>

      <div className="config-section">
        {renderChainSelector(
          config.toChain,
          (toChain) => handleConfigUpdate({ toChain }),
          '到链',
          config.fromChain
        )}
      </div>

      <div className="config-section">
        {renderAssetSelector()}
      </div>

      <div className="config-section">
        {renderAmountInput()}
      </div>

      {renderEstimation()}

      <div className="bridge-actions">
        <button
          className="bridge-button primary"
          onClick={() => setBridgeStep('confirm')}
          disabled={!estimation || isEstimating}
        >
          继续桥接
        </button>
      </div>
    </div>
  );

  // 渲染确认步骤
  const renderConfirmStep = () => (
    <div className="bridge-confirm">
      <h3>确认桥接</h3>
      
      <div className="confirm-details">
        <div className="bridge-route">
          <div className="route-item">
            <img src={getChainInfo(config.fromChain)?.icon} alt="" className="chain-icon" />
            <span>{getChainInfo(config.fromChain)?.name}</span>
          </div>
          <div className="route-arrow">→</div>
          <div className="route-item">
            <img src={getChainInfo(config.toChain)?.icon} alt="" className="chain-icon" />
            <span>{getChainInfo(config.toChain)?.name}</span>
          </div>
        </div>

        <div className="bridge-summary">
          <div className="summary-item">
            <span className="label">桥接资产:</span>
            <span className="value">
              {config.amount} {config.asset?.symbol}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">总费用:</span>
            <span className="value">
              {estimation?.totalFee} {estimation?.feeToken}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">预计接收:</span>
            <span className="value highlight">
              {estimation?.receiveAmount} {config.asset?.symbol}
            </span>
          </div>
        </div>
      </div>

      <div className="confirm-actions">
        <button
          className="bridge-button secondary"
          onClick={() => setBridgeStep('config')}
        >
          返回修改
        </button>
        <button
          className="bridge-button primary"
          onClick={handleBridgeSubmit}
        >
          确认桥接
        </button>
      </div>
    </div>
  );

  // 渲染处理步骤
  const renderProcessingStep = () => (
    <div className="bridge-processing">
      <div className="processing-animation">
        <div className="loading-spinner large" />
      </div>
      <h3>正在处理桥接</h3>
      <p>请在钱包中确认交易，然后等待桥接完成</p>
      
      <div className="processing-steps">
        <div className="step completed">
          <div className="step-icon">✓</div>
          <div className="step-text">发起桥接交易</div>
        </div>
        <div className="step active">
          <div className="step-icon">⏳</div>
          <div className="step-text">等待确认</div>
        </div>
        <div className="step">
          <div className="step-icon">⏳</div>
          <div className="step-text">跨链处理</div>
        </div>
        <div className="step">
          <div className="step-icon">⏳</div>
          <div className="step-text">完成桥接</div>
        </div>
      </div>
    </div>
  );

  // 渲染完成步骤
  const renderCompleteStep = () => (
    <div className="bridge-complete">
      <div className="success-icon">✅</div>
      <h3>桥接成功!</h3>
      <p>您的资产已成功桥接到目标链</p>
      
      <div className="complete-summary">
        <div className="summary-item">
          <span className="label">桥接数量:</span>
          <span className="value">
            {config.amount} {config.asset?.symbol}
          </span>
        </div>
        <div className="summary-item">
          <span className="label">目标链:</span>
          <span className="value">
            {getChainInfo(config.toChain)?.name}
          </span>
        </div>
      </div>

      <div className="complete-actions">
        <button
          className="bridge-button secondary"
          onClick={() => {
            setBridgeStep('config');
            handleConfigUpdate({
              fromChain: 'ethereum',
              toChain: 'polygon',
              asset: null,
              amount: ''
            });
          }}
        >
          新建桥接
        </button>
        <button
          className="bridge-button primary"
          onClick={() => window.open(`${getChainInfo(config.toChain)?.explorer}/address/${config.asset?.address}`, '_blank')}
        >
          查看资产
        </button>
      </div>
    </div>
  );

  // 渲染当前步骤
  const renderCurrentStep = () => {
    switch (bridgeStep) {
      case 'config':
        return renderConfigStep();
      case 'confirm':
        return renderConfirmStep();
      case 'processing':
        return renderProcessingStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderConfigStep();
    }
  };

  return (
    <div className="bridge-interface">
      <div className="bridge-header">
        <h2>跨链桥接</h2>
        <p>安全快速地在不同区块链网络间转移资产</p>
      </div>

      <div className="bridge-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default BridgeInterface;

