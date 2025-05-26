import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDAO } from '../../context/dao/DAOContext';
import '../../styles/dao.css';

/**
 * 提案卡片组件
 * 展示单个提案的概要信息
 */
const ProposalCard = ({ proposal }) => {
  const navigate = useNavigate();
  
  // 获取提案状态对应的样式类和文本
  const getStatusInfo = (status) => {
    const statusMap = {
      0: { className: 'status-pending', text: '待处理' },
      1: { className: 'status-active', text: '投票中' },
      2: { className: 'status-canceled', text: '已取消' },
      3: { className: 'status-defeated', text: '已否决' },
      4: { className: 'status-succeeded', text: '已通过' },
      5: { className: 'status-queued', text: '队列中' },
      6: { className: 'status-expired', text: '已过期' },
      7: { className: 'status-executed', text: '已执行' }
    };
    
    return statusMap[status] || { className: '', text: '未知状态' };
  };
  
  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 提取提案标题（从描述的第一行）
  const getProposalTitle = (description) => {
    if (!description) return '无标题提案';
    const firstLine = description.split('\n')[0];
    return firstLine.length > 100 ? `${firstLine.substring(0, 100)}...` : firstLine;
  };
  
  // 提取提案描述（从描述的第二行开始）
  const getProposalDescription = (description) => {
    if (!description) return '';
    const lines = description.split('\n');
    if (lines.length <= 1) return '';
    
    const desc = lines.slice(1).join('\n').trim();
    return desc.length > 200 ? `${desc.substring(0, 200)}...` : desc;
  };
  
  // 处理卡片点击，导航到提案详情页
  const handleCardClick = () => {
    navigate(`/dao/proposal/${proposal.id}`);
  };
  
  // 获取状态信息
  const statusInfo = getStatusInfo(proposal.state);
  
  // 提取标题和描述
  const title = getProposalTitle(proposal.description);
  const description = getProposalDescription(proposal.description);
  
  return (
    <div className="proposal-card" onClick={handleCardClick}>
      <div className="proposal-card-header">
        <p className="proposal-id">提案 #{proposal.id}</p>
        <h3 className="proposal-title">{title}</h3>
      </div>
      
      <div className="proposal-card-content">
        <p className="proposal-description">{description}</p>
        <div className="proposal-meta">
          <span className="proposal-proposer">提案人: {formatAddress(proposal.proposer)}</span>
        </div>
      </div>
      
      <div className="proposal-card-footer">
        <span className={`proposal-status ${statusInfo.className}`}>
          {statusInfo.text}
        </span>
        
        <div className="proposal-votes">
          <span className="vote-count vote-for">
            <span className="vote-icon">👍</span> {proposal.forVotes}
          </span>
          <span className="vote-count vote-against">
            <span className="vote-icon">👎</span> {proposal.againstVotes}
          </span>
          <span className="vote-count vote-abstain">
            <span className="vote-icon">🤔</span> {proposal.abstainVotes}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProposalCard;
