import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain/BlockchainContext';
import './CrossChainBridge.css';

/**
 * 跨链桥组件
 * 允许用户在不同区块链网络间转移资产
 */
const CrossChainBridge = () => {
  // 区块链上下文
  const { 
    account, 
    connectWallet, 
    chainId,
    switchNetwork,
    getTokenBalance
  } = useContext(BlockchainContext);

  // 组件状态
  const [sourceChain, setSourceChain] = useState('bnb');
  const [targetChain, setTargetChain] = useState('ethereum');
  const [amount, setAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('0');
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [fee, setFee] = useState('0');
  const [transferId, setTransferId] = useState('');
  const [transferHistory, setTransferHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 支持的链
  const supportedChains = [
    { id: 'bnb', name: 'BNB Chain', icon: '/images/bnb-chain-logo.png', chainId: '0x38' },
    { id: 'ethereum', name: 'Ethereum', icon: '/images/ethereum-logo.png', chainId: '0x1' },
    { id: 'polygon', name: 'Polygon', icon: '/images/polygon-logo.png', chainId: '0x89' }
  ];

  // 初始化
  useEffect(() => {
    if (account) {
      loadUserBalance();
      loadTransferHistory();
    }
  }, [account, sourceChain]);

  // 加载用户余额
  const loadUserBalance = async () => {
    if (!account) return;
    
    try {
      const balance = await getTokenBalance(sourceChain);
      setMaxAmount(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  // 加载转账历史
  const loadTransferHistory = async () => {
    if (!account) return;
    
    try {
      setIsLoading(true);
      
      // 这里应该从API或本地存储加载历史记录
      // 示例数据
      const history = [
        {
          id: '0x1234...5678',
          sourceChain: 'bnb',
          targetChain: 'ethereum',
          amount: '10.5',
          status: 'completed',
          timestamp: Date.now() - 86400000
        },
        {
          id: '0xabcd...ef01',
          sourceChain: 'ethereum',
          targetChain: 'polygon',
          amount: '5.0',
          status: 'pending',
          timestamp: Date.now() - 3600000
        }
      ];
      
      setTransferHistory(history);
    } catch (error) {
      console.error('Error loading transfer history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换源链和目标链
  const handleSwitchChains = () => {
    const temp = sourceChain;
    setSourceChain(targetChain);
    setTargetChain(temp);
  };

  // 设置最大金额
  const handleSetMaxAmount = () => {
    setAmount(maxAmount);
  };

  // 估算跨链费用
  const estimateFee = async () => {
    // 这里应该调用API或合约来估算费用
    // 示例实现
    const baseFee = 0.001;
    const amountValue = parseFloat(amount) || 0;
    
    let chainFactor = 1;
    if (sourceChain === 'ethereum') {
      chainFactor = 2; // Ethereum费用较高
    } else if (sourceChain === 'polygon') {
      chainFactor = 0.5; // Polygon费用较低
    }
    
    const estimatedFee = baseFee * chainFactor;
    setFee(estimatedFee.toFixed(6));
  };

  // 当金额变化时重新估算费用
  useEffect(() => {
    if (amount) {
      estimateFee();
    }
  }, [amount, sourceChain, targetChain]);

  // 处理跨链转移
  const handleTransfer = async () => {
    if (!account) {
      alert('请先连接钱包');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效金额');
      return;
    }
    
    if (parseFloat(amount) > parseFloat(maxAmount)) {
      setError('余额不足');
      return;
    }
    
    try {
      setStatus('processing');
      setError('');
      
      // 步骤1: 确保连接到正确的网络
      setStep(1);
      const sourceChainConfig = supportedChains.find(chain => chain.id === sourceChain);
      if (chainId !== sourceChainConfig.chainId) {
        await switchNetwork(sourceChainConfig.chainId);
      }
      
      // 步骤2: 授权代币
      setStep(2);
      // 这里应该调用合约授权代币
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟授权过程
      
      // 步骤3: 发起跨链转移
      setStep(3);
      // 这里应该调用合约发起跨链转移
      await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟转移过程
      
      // 生成模拟交易哈希和转账ID
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockTransferId = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      setTxHash(mockTxHash);
      setTransferId(mockTransferId);
      
      // 步骤4: 监控交易状态
      setStep(4);
      await new Promise(resolve => setTimeout(resolve, 5000)); // 模拟监控过程
      
      // 步骤5: 完成
      setStep(5);
      setStatus('completed');
      
      // 更新转账历史
      const newTransfer = {
        id: mockTransferId,
        sourceChain,
        targetChain,
        amount,
        status: 'pending',
        timestamp: Date.now()
      };
      
      setTransferHistory([newTransfer, ...transferHistory]);
      
    } catch (error) {
      console.error('Transfer error:', error);
      setStatus('error');
      setError(error.message || '跨链转移失败');
    }
  };

  // 获取链图标
  const getChainIcon = (chainId) => {
    const chain = supportedChains.find(chain => chain.id === chainId);
    return chain ? chain.icon : '';
  };

  // 获取链名称
  const getChainName = (chainId) => {
    const chain = supportedChains.find(chain => chain.id === chainId);
    return chain ? chain.name : '';
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // 获取交易状态类名
  const getStatusClassName = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <div className="cross-chain-bridge">
      <h2>跨链资产桥</h2>
      <p className="description">
        在BNB Chain、Ethereum和Polygon之间安全转移您的资产
      </p>
      
      {!account ? (
        <div className="connect-wallet-container">
          <p>请连接钱包以使用跨链桥</p>
          <button className="connect-button" onClick={connectWallet}>
            连接钱包
          </button>
        </div>
      ) : (
        <>
          {status === 'idle' && (
            <div className="transfer-form">
              <div className="chain-selector">
                <div className="chain-select">
                  <label>从</label>
                  <div className="chain-dropdown">
                    <div className="selected-chain">
                      <img src={getChainIcon(sourceChain)} alt={sourceChain} />
                      <span>{getChainName(sourceChain)}</span>
                    </div>
                    <div className="chain-options">
                      {supportedChains.map(chain => (
                        chain.id !== targetChain && (
                          <div 
                            key={chain.id} 
                            className="chain-option" 
                            onClick={() => setSourceChain(chain.id)}
                          >
                            <img src={chain.icon} alt={chain.name} />
                            <span>{chain.name}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
                
                <button className="switch-button" onClick={handleSwitchChains}>
                  ⇄
                </button>
                
                <div className="chain-select">
                  <label>到</label>
                  <div className="chain-dropdown">
                    <div className="selected-chain">
                      <img src={getChainIcon(targetChain)} alt={targetChain} />
                      <span>{getChainName(targetChain)}</span>
                    </div>
                    <div className="chain-options">
                      {supportedChains.map(chain => (
                        chain.id !== sourceChain && (
                          <div 
                            key={chain.id} 
                            className="chain-option" 
                            onClick={() => setTargetChain(chain.id)}
                          >
                            <img src={chain.icon} alt={chain.name} />
                            <span>{chain.name}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="amount-input">
                <label>
                  <span>转移金额</span>
                  <span className="balance">余额: {maxAmount} CBT</span>
                </label>
                <div className="input-with-max">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="输入CBT金额" 
                  />
                  <button onClick={handleSetMaxAmount}>最大</button>
                </div>
              </div>
              
              <div className="fee-estimator">
                <div className="fee-row">
                  <span>预估跨链费用:</span>
                  <span>{fee} CBT</span>
                </div>
                <div className="fee-row">
                  <span>预计到账金额:</span>
                  <span>{amount ? (parseFloat(amount) - parseFloat(fee)).toFixed(6) : '0'} CBT</span>
                </div>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                className="transfer-button" 
                onClick={handleTransfer} 
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(maxAmount)}
              >
                开始跨链转移
              </button>
            </div>
          )}
          
          {status === 'processing' && (
            <div className="transfer-progress">
              <h3>跨链转移进行中</h3>
              
              <div className="progress-steps">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>连接网络</h4>
                    <p>确保连接到 {getChainName(sourceChain)}</p>
                  </div>
                  {step > 1 && <div className="step-check">✓</div>}
                </div>
                
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>授权代币</h4>
                    <p>授权跨链桥合约使用您的CBT代币</p>
                  </div>
                  {step > 2 && <div className="step-check">✓</div>}
                </div>
                
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>发起跨链转移</h4>
                    <p>在 {getChainName(sourceChain)} 上锁定代币</p>
                  </div>
                  {step > 3 && <div className="step-check">✓</div>}
                </div>
                
                <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>等待确认</h4>
                    <p>等待跨链验证和确认</p>
                  </div>
                  {step > 4 && <div className="step-check">✓</div>}
                </div>
                
                <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h4>完成</h4>
                    <p>在 {getChainName(targetChain)} 上接收代币</p>
                  </div>
                  {step > 5 && <div className="step-check">✓</div>}
                </div>
              </div>
              
              {txHash && (
                <div className="transaction-info">
                  <p>交易哈希: <a href={`https://explorer.example.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}</a></p>
                </div>
              )}
              
              <div className="loading-spinner"></div>
              <p className="processing-message">请不要关闭此页面，跨链转移正在处理中...</p>
            </div>
          )}
          
          {status === 'completed' && (
            <div className="transfer-complete">
              <div className="success-icon">✓</div>
              <h3>跨链转移成功!</h3>
              <p>您已成功将 {amount} CBT 从 {getChainName(sourceChain)} 转移到 {getChainName(targetChain)}</p>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span>转账ID:</span>
                  <span>{transferId.substring(0, 10)}...{transferId.substring(transferId.length - 8)}</span>
                </div>
                <div className="detail-row">
                  <span>交易哈希:</span>
                  <span>
                    <a href={`https://explorer.example.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                      {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                    </a>
                  </span>
                </div>
                <div className="detail-row">
                  <span>转移金额:</span>
                  <span>{amount} CBT</span>
                </div>
                <div className="detail-row">
                  <span>跨链费用:</span>
                  <span>{fee} CBT</span>
                </div>
                <div className="detail-row">
                  <span>到账金额:</span>
                  <span>{(parseFloat(amount) - parseFloat(fee)).toFixed(6)} CBT</span>
                </div>
              </div>
              
              <button className="new-transfer-button" onClick={() => setStatus('idle')}>
                发起新的跨链转移
              </button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="transfer-error">
              <div className="error-icon">✗</div>
              <h3>跨链转移失败</h3>
              <p>{error || '处理您的跨链转移请求时发生错误'}</p>
              
              <button className="retry-button" onClick={() => setStatus('idle')}>
                重试
              </button>
            </div>
          )}
          
          <div className="transfer-history">
            <h3>跨链转移历史</h3>
            
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : transferHistory.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>从</th>
                    <th>到</th>
                    <th>金额</th>
                    <th>状态</th>
                    <th>时间</th>
                  </tr>
                </thead>
                <tbody>
                  {transferHistory.map(transfer => (
                    <tr key={transfer.id}>
                      <td title={transfer.id}>
                        {transfer.id.substring(0, 6)}...{transfer.id.substring(transfer.id.length - 4)}
                      </td>
                      <td>
                        <div className="chain-cell">
                          <img src={getChainIcon(transfer.sourceChain)} alt={transfer.sourceChain} />
                          <span>{getChainName(transfer.sourceChain)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="chain-cell">
                          <img src={getChainIcon(transfer.targetChain)} alt={transfer.targetChain} />
                          <span>{getChainName(transfer.targetChain)}</span>
                        </div>
                      </td>
                      <td>{transfer.amount} CBT</td>
                      <td>
                        <span className={`status-badge ${getStatusClassName(transfer.status)}`}>
                          {transfer.status === 'completed' ? '已完成' : 
                           transfer.status === 'pending' ? '处理中' : '失败'}
                        </span>
                      </td>
                      <td>{formatTimestamp(transfer.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-history">
                <p>暂无跨链转移记录</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CrossChainBridge;
