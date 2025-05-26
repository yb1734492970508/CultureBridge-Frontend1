import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import ProposalCard from './ProposalCard';
import '../../styles/dao.css';

/**
 * DAO统计信息组件
 * 展示DAO治理的关键统计数据
 */
const DAOStats = () => {
  const { proposals } = useDAO();
  
  // 计算活跃提案数量
  const activeProposals = proposals.filter(p => p.state === 1).length;
  
  // 计算已执行提案数量
  const executedProposals = proposals.filter(p => p.state === 7).length;
  
  // 计算参与率（简化版，实际应从合约获取）
  const participationRate = proposals.length > 0 ? '35%' : '0%';
  
  return (
    <div className="dao-stats">
      <div className="stat-card active-proposals">
        <h4 className="stat-title">活跃提案</h4>
        <p className="stat-value">{activeProposals}</p>
      </div>
      
      <div className="stat-card total-proposals">
        <h4 className="stat-title">总提案数</h4>
        <p className="stat-value">{proposals.length}</p>
      </div>
      
      <div className="stat-card executed-proposals">
        <h4 className="stat-title">已执行提案</h4>
        <p className="stat-value">{executedProposals}</p>
      </div>
      
      <div className="stat-card participation-rate">
        <h4 className="stat-title">参与率</h4>
        <p className="stat-value">{participationRate}</p>
      </div>
    </div>
  );
};

/**
 * 提案列表组件
 * 展示平台上的治理提案
 */
const ProposalList = () => {
  const navigate = useNavigate();
  const { account, active } = useBlockchain();
  const { 
    proposals, 
    isLoading, 
    error, 
    successMessage, 
    hasMore, 
    loadProposals, 
    loadMoreProposals, 
    clearMessages 
  } = useDAO();
  
  // 初始加载
  useEffect(() => {
    loadProposals(1);
  }, [loadProposals]);
  
  return (
    <div className="dao-container">
      <div className="dao-header">
        <div>
          <h1>CultureBridge DAO 治理</h1>
          <p>参与平台决策，共建文化未来</p>
        </div>
        <button 
          onClick={() => navigate('/dao/create-proposal')} 
          className="create-proposal-btn"
          disabled={!active}
        >
          创建提案
        </button>
      </div>
      
      <div className="dao-stats-container">
        <DAOStats />
      </div>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以参与治理</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearMessages} className="dao-btn secondary-btn">关闭</button>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button onClick={clearMessages} className="dao-btn secondary-btn">关闭</button>
        </div>
      )}
      
      <div className="proposals-container">
        <h2 className="dao-section-title">提案列表</h2>
        
        {proposals.length === 0 && !isLoading ? (
          <div className="empty-proposals">
            <p>当前没有提案</p>
            {active && (
              <button 
                onClick={() => navigate('/dao/create-proposal')} 
                className="dao-btn primary-btn"
              >
                创建第一个提案
              </button>
            )}
          </div>
        ) : (
          <div className="proposals-grid">
            {proposals.map(proposal => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载提案中...</p>
          </div>
        )}
        
        {!isLoading && hasMore && proposals.length > 0 && (
          <div className="load-more-container">
            <button onClick={loadMoreProposals} className="load-more-btn">
              加载更多
            </button>
          </div>
        )}
      </div>
      
      <div className="dao-section">
        <h3 className="dao-section-title">关于CultureBridge DAO</h3>
        <div className="dao-info">
          <p>CultureBridge DAO是一个去中心化自治组织，旨在让社区成员共同参与平台决策和发展方向。</p>
          <p>作为CULT代币持有者，您可以：</p>
          <ul>
            <li>创建关于平台功能、资金分配和发展方向的提案</li>
            <li>对社区提案进行投票</li>
            <li>根据您持有的代币数量获得相应的投票权重</li>
            <li>通过质押代币增加您的治理影响力</li>
          </ul>
          <p>DAO治理流程：</p>
          <ol>
            <li>提案创建：任何持有足够代币的成员都可以创建提案</li>
            <li>投票期：提案创建后进入为期3天的投票期</li>
            <li>执行队列：通过的提案进入48小时的时间锁定期</li>
            <li>提案执行：时间锁定期结束后，提案可以被执行</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ProposalList;
