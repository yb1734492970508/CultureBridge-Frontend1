import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import './NFTRoyaltyDistribution.css';

// NFT版税分配系统组件
const NFTRoyaltyDistribution = () => {
  const [nftContracts, setNftContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [royaltySettings, setRoyaltySettings] = useState({
    enabled: false,
    percentage: 5,
    recipients: []
  });
  const [distributionHistory, setDistributionHistory] = useState([]);
  const [pendingRoyalties, setPendingRoyalties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 初始化数据
  useEffect(() => {
    loadNFTContracts();
    loadDistributionHistory();
    loadPendingRoyalties();
  }, []);

  // 加载NFT合约列表
  const loadNFTContracts = async () => {
    try {
      // 模拟数据，实际应从区块链或API获取
      const mockContracts = [
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'CultureBridge Art Collection',
          symbol: 'CBAC',
          totalSupply: 1000,
          royaltyEnabled: true
        },
        {
          address: '0xabcdef1234567890abcdef1234567890abcdef12',
          name: 'Digital Heritage NFTs',
          symbol: 'DHN',
          totalSupply: 500,
          royaltyEnabled: false
        }
      ];
      setNftContracts(mockContracts);
    } catch (error) {
      console.error('加载NFT合约失败:', error);
      setError('加载NFT合约失败');
    }
  };

  // 加载分配历史
  const loadDistributionHistory = async () => {
    try {
      // 模拟数据
      const mockHistory = [
        {
          id: '1',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          tokenId: '123',
          salePrice: '1.5',
          royaltyAmount: '0.075',
          timestamp: Date.now() - 86400000,
          txHash: '0xabc123...',
          recipients: [
            { address: '0x111...', percentage: 60, amount: '0.045' },
            { address: '0x222...', percentage: 40, amount: '0.03' }
          ]
        },
        {
          id: '2',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          tokenId: '456',
          salePrice: '2.0',
          royaltyAmount: '0.1',
          timestamp: Date.now() - 172800000,
          txHash: '0xdef456...',
          recipients: [
            { address: '0x111...', percentage: 60, amount: '0.06' },
            { address: '0x222...', percentage: 40, amount: '0.04' }
          ]
        }
      ];
      setDistributionHistory(mockHistory);
    } catch (error) {
      console.error('加载分配历史失败:', error);
    }
  };

  // 加载待分配版税
  const loadPendingRoyalties = async () => {
    try {
      // 模拟数据
      const mockPending = [
        {
          id: '1',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          tokenId: '789',
          salePrice: '3.0',
          royaltyAmount: '0.15',
          timestamp: Date.now() - 3600000,
          status: 'pending'
        }
      ];
      setPendingRoyalties(mockPending);
    } catch (error) {
      console.error('加载待分配版税失败:', error);
    }
  };

  // 加载合约版税设置
  const loadRoyaltySettings = async (contractAddress) => {
    try {
      setIsLoading(true);
      
      // 模拟从合约获取版税设置
      const mockSettings = {
        enabled: true,
        percentage: 5,
        recipients: [
          {
            id: '1',
            address: '0x1111111111111111111111111111111111111111',
            name: '原创作者',
            percentage: 60,
            role: 'creator'
          },
          {
            id: '2',
            address: '0x2222222222222222222222222222222222222222',
            name: '平台方',
            percentage: 40,
            role: 'platform'
          }
        ]
      };
      
      setRoyaltySettings(mockSettings);
    } catch (error) {
      console.error('加载版税设置失败:', error);
      setError('加载版税设置失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理合约选择
  const handleContractSelect = (contractAddress) => {
    setSelectedContract(contractAddress);
    if (contractAddress) {
      loadRoyaltySettings(contractAddress);
    }
  };

  // 添加版税接收者
  const addRecipient = () => {
    const newRecipient = {
      id: Date.now().toString(),
      address: '',
      name: '',
      percentage: 0,
      role: 'custom'
    };
    setRoyaltySettings(prev => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient]
    }));
  };

  // 更新版税接收者
  const updateRecipient = (id, field, value) => {
    setRoyaltySettings(prev => ({
      ...prev,
      recipients: prev.recipients.map(recipient =>
        recipient.id === id ? { ...recipient, [field]: value } : recipient
      )
    }));
  };

  // 删除版税接收者
  const removeRecipient = (id) => {
    setRoyaltySettings(prev => ({
      ...prev,
      recipients: prev.recipients.filter(recipient => recipient.id !== id)
    }));
  };

  // 保存版税设置
  const saveRoyaltySettings = async () => {
    try {
      setIsLoading(true);
      
      // 验证设置
      const totalPercentage = royaltySettings.recipients.reduce(
        (sum, recipient) => sum + parseFloat(recipient.percentage || 0), 0
      );
      
      if (totalPercentage !== 100) {
        throw new Error('版税分配比例总和必须为100%');
      }
      
      // 模拟保存到区块链
      console.log('保存版税设置:', royaltySettings);
      
      // 这里应该调用智能合约方法
      // await contract.setRoyaltySettings(royaltySettings);
      
      alert('版税设置保存成功');
    } catch (error) {
      console.error('保存版税设置失败:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 执行版税分配
  const distributeRoyalty = async (royaltyId) => {
    try {
      setIsLoading(true);
      
      const royalty = pendingRoyalties.find(r => r.id === royaltyId);
      if (!royalty) {
        throw new Error('未找到版税记录');
      }
      
      // 模拟执行分配
      console.log('执行版税分配:', royalty);
      
      // 这里应该调用智能合约方法
      // await contract.distributeRoyalty(royaltyId);
      
      // 更新状态
      setPendingRoyalties(prev => prev.filter(r => r.id !== royaltyId));
      
      // 添加到历史记录
      const newHistoryItem = {
        ...royalty,
        recipients: royaltySettings.recipients.map(recipient => ({
          address: recipient.address,
          percentage: recipient.percentage,
          amount: (parseFloat(royalty.royaltyAmount) * recipient.percentage / 100).toFixed(6)
        }))
      };
      setDistributionHistory(prev => [newHistoryItem, ...prev]);
      
      alert('版税分配成功');
    } catch (error) {
      console.error('版税分配失败:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 计算总版税收入
  const getTotalRoyaltyIncome = () => {
    return distributionHistory.reduce(
      (sum, item) => sum + parseFloat(item.royaltyAmount), 0
    ).toFixed(6);
  };

  // 计算待分配总额
  const getPendingRoyaltyAmount = () => {
    return pendingRoyalties.reduce(
      (sum, item) => sum + parseFloat(item.royaltyAmount), 0
    ).toFixed(6);
  };

  return (
    <div className="nft-royalty-distribution">
      <div className="royalty-header">
        <h2>NFT版税分配系统</h2>
        <p>管理NFT二次销售版税的自动分配</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      <div className="royalty-stats">
        <div className="stat-card">
          <h3>总版税收入</h3>
          <div className="stat-value">{getTotalRoyaltyIncome()} ETH</div>
        </div>
        <div className="stat-card">
          <h3>待分配金额</h3>
          <div className="stat-value">{getPendingRoyaltyAmount()} ETH</div>
        </div>
        <div className="stat-card">
          <h3>分配次数</h3>
          <div className="stat-value">{distributionHistory.length}</div>
        </div>
        <div className="stat-card">
          <h3>活跃合约</h3>
          <div className="stat-value">{nftContracts.filter(c => c.royaltyEnabled).length}</div>
        </div>
      </div>

      <div className="royalty-content">
        <div className="contract-selection">
          <h3>选择NFT合约</h3>
          <select
            value={selectedContract}
            onChange={(e) => handleContractSelect(e.target.value)}
            className="contract-select"
          >
            <option value="">请选择合约</option>
            {nftContracts.map(contract => (
              <option key={contract.address} value={contract.address}>
                {contract.name} ({contract.symbol})
              </option>
            ))}
          </select>
        </div>

        {selectedContract && (
          <div className="royalty-settings">
            <h3>版税设置</h3>
            
            <div className="settings-form">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={royaltySettings.enabled}
                    onChange={(e) => setRoyaltySettings(prev => ({
                      ...prev,
                      enabled: e.target.checked
                    }))}
                  />
                  启用版税分配
                </label>
              </div>

              {royaltySettings.enabled && (
                <>
                  <div className="form-group">
                    <label>版税比例 (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={royaltySettings.percentage}
                      onChange={(e) => setRoyaltySettings(prev => ({
                        ...prev,
                        percentage: parseFloat(e.target.value)
                      }))}
                      className="percentage-input"
                    />
                  </div>

                  <div className="recipients-section">
                    <div className="recipients-header">
                      <h4>版税接收者</h4>
                      <button onClick={addRecipient} className="add-recipient-btn">
                        添加接收者
                      </button>
                    </div>

                    <div className="recipients-list">
                      {royaltySettings.recipients.map(recipient => (
                        <div key={recipient.id} className="recipient-item">
                          <div className="recipient-form">
                            <input
                              type="text"
                              placeholder="钱包地址"
                              value={recipient.address}
                              onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                              className="address-input"
                            />
                            <input
                              type="text"
                              placeholder="名称"
                              value={recipient.name}
                              onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                              className="name-input"
                            />
                            <input
                              type="number"
                              placeholder="比例 (%)"
                              min="0"
                              max="100"
                              value={recipient.percentage}
                              onChange={(e) => updateRecipient(recipient.id, 'percentage', parseFloat(e.target.value))}
                              className="percentage-input"
                            />
                            <select
                              value={recipient.role}
                              onChange={(e) => updateRecipient(recipient.id, 'role', e.target.value)}
                              className="role-select"
                            >
                              <option value="creator">创作者</option>
                              <option value="platform">平台</option>
                              <option value="collaborator">合作者</option>
                              <option value="custom">自定义</option>
                            </select>
                            <button
                              onClick={() => removeRecipient(recipient.id)}
                              className="remove-recipient-btn"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="percentage-summary">
                      总比例: {royaltySettings.recipients.reduce(
                        (sum, r) => sum + parseFloat(r.percentage || 0), 0
                      ).toFixed(1)}%
                    </div>

                    <button
                      onClick={saveRoyaltySettings}
                      disabled={isLoading}
                      className="save-settings-btn"
                    >
                      {isLoading ? '保存中...' : '保存设置'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="pending-royalties">
          <h3>待分配版税</h3>
          {pendingRoyalties.length > 0 ? (
            <div className="pending-list">
              {pendingRoyalties.map(royalty => (
                <div key={royalty.id} className="pending-item">
                  <div className="pending-info">
                    <div className="token-info">
                      <span className="token-id">Token #{royalty.tokenId}</span>
                      <span className="contract-address">{formatAddress(royalty.contractAddress)}</span>
                    </div>
                    <div className="sale-info">
                      <span className="sale-price">售价: {royalty.salePrice} ETH</span>
                      <span className="royalty-amount">版税: {royalty.royaltyAmount} ETH</span>
                    </div>
                    <div className="time-info">
                      {formatTime(royalty.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => distributeRoyalty(royalty.id)}
                    disabled={isLoading}
                    className="distribute-btn"
                  >
                    分配版税
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">暂无待分配版税</div>
          )}
        </div>

        <div className="distribution-history">
          <h3>分配历史</h3>
          {distributionHistory.length > 0 ? (
            <div className="history-list">
              {distributionHistory.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-header">
                    <span className="token-info">Token #{item.tokenId}</span>
                    <span className="time-info">{formatTime(item.timestamp)}</span>
                  </div>
                  <div className="history-details">
                    <div className="sale-details">
                      <span>售价: {item.salePrice} ETH</span>
                      <span>版税: {item.royaltyAmount} ETH</span>
                    </div>
                    <div className="recipients-details">
                      {item.recipients.map((recipient, index) => (
                        <div key={index} className="recipient-detail">
                          <span className="recipient-address">{formatAddress(recipient.address)}</span>
                          <span className="recipient-percentage">{recipient.percentage}%</span>
                          <span className="recipient-amount">{recipient.amount} ETH</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="tx-hash">
                    <a href={`https://etherscan.io/tx/${item.txHash}`} target="_blank" rel="noopener noreferrer">
                      查看交易
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">暂无分配历史</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTRoyaltyDistribution;

