import React, { useState, useEffect } from 'react';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import './DelegatedVotingInterface.css';

/**
 * 委托投票界面组件
 * 用于显示用户收到的委托和代表他人进行投票
 */
const DelegatedVotingInterface = ({ proposalId }) => {
  const { 
    vote, 
    currentProposal, 
    loadProposalDetails, 
    isLoading, 
    error, 
    successMessage, 
    clearMessages 
  } = useDAO();
  const { account, active } = useBlockchain();
  
  // 状态
  const [delegations, setDelegations] = useState([]);
  const [selectedDelegations, setSelectedDelegations] = useState([]);
  const [voteSupport, setVoteSupport] = useState(null);
  const [voteReason, setVoteReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [totalVotingPower, setTotalVotingPower] = useState('0');
  
  // 模拟数据 - 实际应从合约获取
  useEffect(() => {
    if (active && account && proposalId) {
      // 模拟加载委托数据
      const mockDelegations = [
        {
          id: 'delegation-001',
          delegator: '0x1234567890123456789012345678901234567890',
          delegatorName: '文化爱好者',
          votingPower: '150',
          restrictions: {
            categoryRestrictions: ['财务', '社区'],
            minVotingPower: '0',
            maxProposals: '0'
          },
          endTime: Math.floor(Date.now() / 1000) + 86400 * 30, // 30天后
          hasVoted: false
        },
        {
          id: 'delegation-002',
          delegator: '0x2345678901234567890123456789012345678901',
          delegatorName: '艺术收藏家',
          votingPower: '320',
          restrictions: {
            categoryRestrictions: [],
            minVotingPower: '0',
            maxProposals: '5'
          },
          endTime: Math.floor(Date.now() / 1000) + 86400 * 60, // 60天后
          hasVoted: false
        },
        {
          id: 'delegation-003',
          delegator: '0x3456789012345678901234567890123456789012',
          delegatorName: '技术专家',
          votingPower: '85',
          restrictions: {
            categoryRestrictions: ['技术', '治理'],
            minVotingPower: '100',
            maxProposals: '0'
          },
          endTime: 0, // 无限期
          hasVoted: true
        }
      ];
      
      // 过滤掉不符合当前提案的委托
      const filteredDelegations = mockDelegations.filter(delegation => {
        // 检查是否已经为此提案投票
        if (delegation.hasVoted) return false;
        
        // 检查是否过期
        if (delegation.endTime > 0 && delegation.endTime < Math.floor(Date.now() / 1000)) return false;
        
        // 检查类别限制
        if (currentProposal && 
            delegation.restrictions.categoryRestrictions.length > 0 && 
            !delegation.restrictions.categoryRestrictions.includes(currentProposal.category)) {
          return false;
        }
        
        // 检查最小投票权重限制
        if (currentProposal && 
            delegation.restrictions.minVotingPower !== '0' && 
            parseInt(currentProposal.votingPower) < parseInt(delegation.restrictions.minVotingPower)) {
          return false;
        }
        
        return true;
      });
      
      setDelegations(filteredDelegations);
      
      // 计算总投票权重
      const total = filteredDelegations.reduce((sum, delegation) => {
        return sum + parseInt(delegation.votingPower);
      }, 0);
      
      setTotalVotingPower(total.toString());
    }
  }, [active, account, proposalId, currentProposal]);
  
  // 处理委托选择
  const handleDelegationSelect = (delegationId) => {
    setSelectedDelegations(prev => {
      if (prev.includes(delegationId)) {
        return prev.filter(id => id !== delegationId);
      } else {
        return [...prev, delegationId];
      }
    });
  };
  
  // 处理全选
  const handleSelectAll = () => {
    if (selectedDelegations.length === delegations.length) {
      setSelectedDelegations([]);
    } else {
      setSelectedDelegations(delegations.map(d => d.id));
    }
  };
  
  // 处理投票支持选择
  const handleSupportSelect = (support) => {
    setVoteSupport(support);
  };
  
  // 处理投票理由变更
  const handleReasonChange = (e) => {
    setVoteReason(e.target.value);
  };
  
  // 处理投票提交
  const handleVoteSubmit = () => {
    if (voteSupport === null) {
      alert('请选择投票立场');
      return;
    }
    
    if (selectedDelegations.length === 0) {
      alert('请选择至少一个委托');
      return;
    }
    
    setShowConfirmation(true);
  };
  
  // 处理确认投票
  const handleConfirmVote = async () => {
    try {
      // 获取选中的委托
      const selectedDelegationsList = delegations.filter(d => selectedDelegations.includes(d.id));
      
      // 计算总投票权重
      const votingPower = selectedDelegationsList.reduce((sum, delegation) => {
        return sum + parseInt(delegation.votingPower);
      }, 0);
      
      // 提交投票
      const result = await vote(proposalId, voteSupport, voteReason);
      
      if (result.success) {
        // 更新委托状态
        setDelegations(prev => prev.map(d => {
          if (selectedDelegations.includes(d.id)) {
            return { ...d, hasVoted: true };
          }
          return d;
        }));
        
        // 清空选择
        setSelectedDelegations([]);
        setVoteSupport(null);
        setVoteReason('');
      }
      
      setShowConfirmation(false);
    } catch (error) {
      console.error('投票失败:', error);
      setShowConfirmation(false);
    }
  };
  
  // 处理取消确认
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };
  
  // 计算选中的投票权重
  const calculateSelectedVotingPower = () => {
    return delegations
      .filter(d => selectedDelegations.includes(d.id))
      .reduce((sum, d) => sum + parseInt(d.votingPower), 0)
      .toString();
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 格式化日期时间
  const formatDateTime = (timestamp) => {
    if (!timestamp || timestamp === 0) return '无限期';
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 如果没有委托，显示空状态
  if (delegations.length === 0) {
    return (
      <div className="delegated-voting-interface empty-state">
        <div className="empty-icon">
          <i className="fas fa-user-friends"></i>
        </div>
        <h3>没有可用的委托</h3>
        <p>您当前没有收到任何可用于此提案的投票委托。</p>
      </div>
    );
  }
  
  return (
    <div className="delegated-voting-interface">
      <div className="delegated-header">
        <h3>代表他人投票</h3>
        <p className="delegated-description">
          您收到了以下用户的投票委托，可以代表他们为此提案投票。
        </p>
      </div>
      
      {error && (
        <div className="delegated-error">
          <p>{error}</p>
          <button type="button" className="close-btn" onClick={clearMessages}>&times;</button>
        </div>
      )}
      
      {successMessage && (
        <div className="delegated-success">
          <p>{successMessage}</p>
          <button type="button" className="close-btn" onClick={clearMessages}>&times;</button>
        </div>
      )}
      
      <div className="delegated-content">
        <div className="delegations-list">
          <div className="list-header">
            <div className="header-select">
              <input 
                type="checkbox"
                checked={selectedDelegations.length === delegations.length}
                onChange={handleSelectAll}
              />
            </div>
            <div className="header-delegator">委托人</div>
            <div className="header-power">投票权重</div>
            <div className="header-restrictions">限制</div>
            <div className="header-expiry">到期时间</div>
          </div>
          
          {delegations.map(delegation => (
            <div 
              key={delegation.id} 
              className={`delegation-item ${selectedDelegations.includes(delegation.id) ? 'selected' : ''}`}
              onClick={() => handleDelegationSelect(delegation.id)}
            >
              <div className="item-select">
                <input 
                  type="checkbox"
                  checked={selectedDelegations.includes(delegation.id)}
                  onChange={() => {}} // 通过父元素点击处理
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="item-delegator">
                <span className="delegator-name">{delegation.delegatorName}</span>
                <span className="delegator-address">{formatAddress(delegation.delegator)}</span>
              </div>
              <div className="item-power">{delegation.votingPower}</div>
              <div className="item-restrictions">
                {delegation.restrictions.categoryRestrictions.length > 0 ? (
                  <span className="restriction-badge category">类别限制</span>
                ) : null}
                
                {delegation.restrictions.minVotingPower !== '0' ? (
                  <span className="restriction-badge power">权重限制</span>
                ) : null}
                
                {delegation.restrictions.maxProposals !== '0' ? (
                  <span className="restriction-badge proposals">提案数限制</span>
                ) : null}
                
                {delegation.restrictions.categoryRestrictions.length === 0 && 
                 delegation.restrictions.minVotingPower === '0' && 
                 delegation.restrictions.maxProposals === '0' ? (
                  <span className="no-restrictions">无限制</span>
                ) : null}
              </div>
              <div className="item-expiry">{formatDateTime(delegation.endTime)}</div>
            </div>
          ))}
        </div>
        
        <div className="voting-summary">
          <div className="summary-item">
            <span className="summary-label">已选委托:</span>
            <span className="summary-value">{selectedDelegations.length} / {delegations.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">总投票权重:</span>
            <span className="summary-value">{calculateSelectedVotingPower()} / {totalVotingPower}</span>
          </div>
        </div>
        
        <div className="voting-options">
          <h4>选择投票立场</h4>
          
          <div className="vote-buttons">
            <button 
              type="button"
              className={`vote-btn support-btn ${voteSupport === 1 ? 'active' : ''}`}
              onClick={() => handleSupportSelect(1)}
            >
              支持
            </button>
            <button 
              type="button"
              className={`vote-btn against-btn ${voteSupport === 0 ? 'active' : ''}`}
              onClick={() => handleSupportSelect(0)}
            >
              反对
            </button>
            <button 
              type="button"
              className={`vote-btn abstain-btn ${voteSupport === 2 ? 'active' : ''}`}
              onClick={() => handleSupportSelect(2)}
            >
              弃权
            </button>
          </div>
          
          <div className="vote-reason">
            <label htmlFor="vote-reason">投票理由 (可选)</label>
            <textarea 
              id="vote-reason"
              value={voteReason}
              onChange={handleReasonChange}
              placeholder="输入您的投票理由..."
              rows={3}
            />
            <p className="char-count">{voteReason.length} / 500</p>
          </div>
          
          <button 
            type="button"
            className="dao-btn primary-btn vote-submit-btn"
            onClick={handleVoteSubmit}
            disabled={isLoading || selectedDelegations.length === 0 || voteSupport === null}
          >
            {isLoading ? '处理中...' : '代表委托人投票'}
          </button>
        </div>
      </div>
      
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>确认投票</h3>
            
            <div className="confirmation-content">
              <p>您将代表 <strong>{selectedDelegations.length}</strong> 个委托人进行投票，总投票权重为 <strong>{calculateSelectedVotingPower()}</strong>。</p>
              
              <div className="confirmation-details">
                <div className="detail-item">
                  <span className="detail-label">投票立场:</span>
                  <span className="detail-value">
                    {voteSupport === 1 ? '支持' : voteSupport === 0 ? '反对' : '弃权'}
                  </span>
                </div>
                
                {voteReason && (
                  <div className="detail-item">
                    <span className="detail-label">投票理由:</span>
                    <span className="detail-value">{voteReason}</span>
                  </div>
                )}
              </div>
              
              <p className="confirmation-warning">
                此操作将代表所有选中的委托人进行投票，且不可撤销。
              </p>
            </div>
            
            <div className="confirmation-actions">
              <button 
                type="button"
                className="dao-btn secondary-btn"
                onClick={handleCancelConfirmation}
              >
                取消
              </button>
              <button 
                type="button"
                className="dao-btn primary-btn"
                onClick={handleConfirmVote}
                disabled={isLoading}
              >
                {isLoading ? '处理中...' : '确认投票'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelegatedVotingInterface;
