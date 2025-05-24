import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { ethers } from 'ethers';
import './CulturalReputationSystem.css';

/**
 * 文化声誉系统组件
 * 
 * 该组件实现了基于区块链的文化声誉系统，允许用户:
 * 1. 查看自己的文化声誉分数和等级
 * 2. 查看声誉历史记录和获取途径
 * 3. 为其他用户背书文化贡献
 * 4. 查看社区内声誉排行榜
 */
const CulturalReputationSystem = () => {
  // 区块链上下文
  const { account, provider, isConnected, connectWallet } = useBlockchain();
  
  // 组件状态
  const [activeTab, setActiveTab] = useState('profile');
  const [reputationScore, setReputationScore] = useState(0);
  const [reputationLevel, setReputationLevel] = useState('');
  const [reputationHistory, setReputationHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [endorseAddress, setEndorseAddress] = useState('');
  const [endorseCategory, setEndorseCategory] = useState('knowledge');
  const [endorsePoints, setEndorsePoints] = useState(1);
  const [endorseComment, setEndorseComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 文化类别选项
  const categories = [
    { id: 'knowledge', label: '文化知识分享' },
    { id: 'creation', label: '文化创作' },
    { id: 'preservation', label: '文化保护' },
    { id: 'education', label: '文化教育' },
    { id: 'exchange', label: '跨文化交流' }
  ];
  
  // 声誉等级定义
  const reputationLevels = [
    { level: '文化新手', minScore: 0, maxScore: 99 },
    { level: '文化爱好者', minScore: 100, maxScore: 499 },
    { level: '文化使者', minScore: 500, maxScore: 999 },
    { level: '文化大师', minScore: 1000, maxScore: 2499 },
    { level: '文化守护者', minScore: 2500, maxScore: 4999 },
    { level: '文化传奇', minScore: 5000, maxScore: Infinity }
  ];

  // 模拟数据 - 实际应用中应从区块链获取
  const mockReputationHistory = [
    { id: 1, date: '2025-05-20', category: 'knowledge', points: 25, description: '分享关于中国传统节日的深度文章', from: '0x1234...5678' },
    { id: 2, date: '2025-05-15', category: 'creation', points: 50, description: '创作并分享传统音乐作品', from: '0x8765...4321' },
    { id: 3, date: '2025-05-10', category: 'exchange', points: 30, description: '组织线上文化交流活动', from: '0x5678...1234' },
    { id: 4, date: '2025-05-05', category: 'education', points: 40, description: '为社区提供语言学习资源', from: '0x4321...8765' },
    { id: 5, date: '2025-05-01', category: 'preservation', points: 35, description: '参与数字化保存濒危文化项目', from: '0x2468...1357' }
  ];
  
  const mockLeaderboard = [
    { rank: 1, address: '0x1234...5678', name: '文化守护者小王', score: 3750, level: '文化守护者' },
    { rank: 2, address: '0x8765...4321', name: '传统艺术家小李', score: 2890, level: '文化守护者' },
    { rank: 3, address: '0x5678...1234', name: '语言学者小张', score: 2340, level: '文化大师' },
    { rank: 4, address: '0x4321...8765', name: '民俗收藏家小陈', score: 1980, level: '文化大师' },
    { rank: 5, address: '0x2468...1357', name: '文化教育家小林', score: 1750, level: '文化大师' },
    { rank: 6, address: '0x1357...2468', name: '跨文化交流者小刘', score: 1520, level: '文化大师' },
    { rank: 7, address: '0x3690...1478', name: '传统音乐家小赵', score: 1340, level: '文化大师' },
    { rank: 8, address: '0x1478...3690', name: '文化研究者小孙', score: 980, level: '文化使者' },
    { rank: 9, address: '0x9012...3456', name: '文化爱好者小钱', score: 780, level: '文化使者' },
    { rank: 10, address: '0x3456...9012', name: '文化传播者小周', score: 650, level: '文化使者' }
  ];

  // 初始化数据
  useEffect(() => {
    if (isConnected && account) {
      fetchReputationData();
    }
  }, [isConnected, account]);

  // 获取声誉数据
  const fetchReputationData = async () => {
    setIsLoading(true);
    try {
      // 模拟从区块链获取数据
      // 实际应用中应调用智能合约
      setTimeout(() => {
        const mockScore = 780;
        setReputationScore(mockScore);
        
        // 设置声誉等级
        const level = reputationLevels.find(
          level => mockScore >= level.minScore && mockScore <= level.maxScore
        );
        setReputationLevel(level.level);
        
        // 设置声誉历史
        setReputationHistory(mockReputationHistory);
        
        // 设置排行榜
        setLeaderboard(mockLeaderboard);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取声誉数据失败:', error);
      setErrorMessage('获取声誉数据失败，请稍后再试');
      setIsLoading(false);
    }
  };

  // 为其他用户背书
  const handleEndorse = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!endorseAddress) {
      setErrorMessage('请输入要背书的用户地址');
      return;
    }
    
    if (!ethers.utils.isAddress(endorseAddress)) {
      setErrorMessage('请输入有效的以太坊地址');
      return;
    }
    
    if (endorseAddress.toLowerCase() === account.toLowerCase()) {
      setErrorMessage('不能为自己背书');
      return;
    }
    
    if (!endorseComment) {
      setErrorMessage('请输入背书理由');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // 模拟区块链交互
      // 实际应用中应调用智能合约
      setTimeout(() => {
        setSuccessMessage('背书成功！您的评价将帮助建立更可信的文化社区');
        setEndorseAddress('');
        setEndorseComment('');
        setEndorsePoints(1);
        setIsLoading(false);
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('背书失败:', error);
      setErrorMessage('背书失败，请稍后再试');
      setIsLoading(false);
    }
  };

  // 获取类别标签
  const getCategoryLabel = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.label : categoryId;
  };

  // 渲染声誉历史记录
  const renderReputationHistory = () => {
    if (reputationHistory.length === 0) {
      return (
        <div className="empty-state">
          <p>暂无声誉历史记录</p>
        </div>
      );
    }

    return (
      <div className="reputation-history">
        {reputationHistory.map(item => (
          <div key={item.id} className="history-item">
            <div className="history-date">{item.date}</div>
            <div className="history-content">
              <div className="history-category">
                <span className={`category-tag ${item.category}`}>
                  {getCategoryLabel(item.category)}
                </span>
              </div>
              <div className="history-description">{item.description}</div>
              <div className="history-points">+{item.points} 声誉值</div>
              <div className="history-from">
                <span className="label">来自:</span> {item.from}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染排行榜
  const renderLeaderboard = () => {
    if (leaderboard.length === 0) {
      return (
        <div className="empty-state">
          <p>暂无排行榜数据</p>
        </div>
      );
    }

    return (
      <div className="leaderboard">
        <div className="leaderboard-header">
          <div className="rank">排名</div>
          <div className="user">用户</div>
          <div className="score">声誉分</div>
          <div className="level">等级</div>
        </div>
        {leaderboard.map(user => (
          <div key={user.rank} className={`leaderboard-item ${user.address.toLowerCase() === (account || '').toLowerCase() ? 'current-user' : ''}`}>
            <div className="rank">
              {user.rank <= 3 ? (
                <span className={`rank-badge rank-${user.rank}`}>{user.rank}</span>
              ) : (
                user.rank
              )}
            </div>
            <div className="user">
              <div className="user-name">{user.name}</div>
              <div className="user-address">{user.address}</div>
            </div>
            <div className="score">{user.score}</div>
            <div className="level">{user.level}</div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染背书表单
  const renderEndorseForm = () => {
    return (
      <form className="endorse-form" onSubmit={handleEndorse}>
        <div className="form-group">
          <label htmlFor="endorseAddress">用户地址</label>
          <input
            type="text"
            id="endorseAddress"
            value={endorseAddress}
            onChange={(e) => setEndorseAddress(e.target.value)}
            placeholder="输入以太坊地址 (0x...)"
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endorseCategory">文化贡献类别</label>
          <select
            id="endorseCategory"
            value={endorseCategory}
            onChange={(e) => setEndorseCategory(e.target.value)}
            disabled={isLoading}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="endorsePoints">声誉点数</label>
          <div className="points-selector">
            {[1, 2, 3, 5, 10].map(point => (
              <button
                key={point}
                type="button"
                className={`point-btn ${endorsePoints === point ? 'active' : ''}`}
                onClick={() => setEndorsePoints(point)}
                disabled={isLoading}
              >
                {point}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="endorseComment">背书理由</label>
          <textarea
            id="endorseComment"
            value={endorseComment}
            onChange={(e) => setEndorseComment(e.target.value)}
            placeholder="请描述该用户的文化贡献..."
            disabled={isLoading}
            required
          />
        </div>
        
        {errorMessage && (
          <div className="error-message">
            <i className="error-icon">!</i> {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="success-message">
            <i className="success-icon">✓</i> {successMessage}
          </div>
        )}
        
        <button
          type="submit"
          className="endorse-btn"
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : '提交背书'}
        </button>
      </form>
    );
  };

  // 渲染声誉等级进度
  const renderReputationProgress = () => {
    const currentLevel = reputationLevels.find(
      level => reputationScore >= level.minScore && reputationScore <= level.maxScore
    );
    
    const nextLevel = reputationLevels.find(
      level => level.minScore > currentLevel.maxScore
    );
    
    const progress = nextLevel 
      ? ((reputationScore - currentLevel.minScore) / (currentLevel.maxScore - currentLevel.minScore)) * 100
      : 100;
    
    return (
      <div className="reputation-progress">
        <div className="current-level">
          <span className="level-label">当前等级:</span>
          <span className="level-value">{reputationLevel}</span>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="level-info">
          <div className="current-score">
            <span className="score-value">{reputationScore}</span>
            <span className="score-label">声誉值</span>
          </div>
          
          {nextLevel && (
            <div className="next-level">
              <span className="next-level-label">距离 {nextLevel.level} 还需:</span>
              <span className="next-level-value">{nextLevel.minScore - reputationScore} 声誉值</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染声誉系统说明
  const renderReputationInfo = () => {
    return (
      <div className="reputation-info">
        <h3>文化声誉系统说明</h3>
        
        <div className="info-section">
          <h4>什么是文化声誉?</h4>
          <p>
            文化声誉是CultureBridge平台上衡量用户文化贡献和参与度的指标。
            它基于区块链技术，确保透明、不可篡改，并由社区共同维护。
          </p>
        </div>
        
        <div className="info-section">
          <h4>如何获得声誉?</h4>
          <ul>
            <li>分享有价值的文化知识和见解</li>
            <li>创作和分享原创文化作品</li>
            <li>参与文化保护和传承活动</li>
            <li>提供文化教育资源</li>
            <li>促进跨文化交流和理解</li>
            <li>获得其他用户的背书认可</li>
          </ul>
        </div>
        
        <div className="info-section">
          <h4>声誉等级</h4>
          <div className="level-list">
            {reputationLevels.map((level, index) => (
              <div key={index} className="level-item">
                <span className="level-name">{level.level}</span>
                <span className="level-range">
                  {level.minScore} - {level.maxScore === Infinity ? '∞' : level.maxScore}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="info-section">
          <h4>声誉的作用</h4>
          <ul>
            <li>提高社区中的可信度和影响力</li>
            <li>解锁特定的平台功能和权限</li>
            <li>参与平台治理和决策</li>
            <li>获得特定活动和资源的优先访问权</li>
            <li>在文化市场中建立信任</li>
          </ul>
        </div>
      </div>
    );
  };

  // 主渲染函数
  return (
    <div className="cultural-reputation-system">
      <div className="reputation-header">
        <h2>文化声誉系统</h2>
        <p className="subtitle">基于区块链的文化贡献认可与信任建立机制</p>
      </div>
      
      {!isConnected ? (
        <div className="connect-wallet-prompt">
          <p>请连接钱包以访问您的文化声誉信息</p>
          <button className="connect-wallet-btn" onClick={connectWallet}>
            连接钱包
          </button>
        </div>
      ) : (
        <>
          <div className="reputation-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              我的声誉
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              声誉历史
            </button>
            <button
              className={`tab-btn ${activeTab === 'endorse' ? 'active' : ''}`}
              onClick={() => setActiveTab('endorse')}
            >
              背书他人
            </button>
            <button
              className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              声誉排行
            </button>
            <button
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              系统说明
            </button>
          </div>
          
          <div className="reputation-content">
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>加载中...</p>
              </div>
            ) : (
              <>
                {activeTab === 'profile' && (
                  <div className="reputation-profile">
                    <div className="reputation-summary">
                      <div className="reputation-score">
                        <span className="score-value">{reputationScore}</span>
                        <span className="score-label">声誉值</span>
                      </div>
                      <div className="reputation-level">
                        <span className="level-label">等级:</span>
                        <span className="level-value">{reputationLevel}</span>
                      </div>
                    </div>
                    
                    {renderReputationProgress()}
                    
                    <div className="reputation-benefits">
                      <h3>当前等级特权</h3>
                      <ul className="benefits-list">
                        <li className="benefit-item">
                          <i className="benefit-icon">✓</i>
                          <span className="benefit-text">参与社区讨论和投票</span>
                        </li>
                        <li className="benefit-item">
                          <i className="benefit-icon">✓</i>
                          <span className="benefit-text">创建和分享文化内容</span>
                        </li>
                        {reputationScore >= 100 && (
                          <li className="benefit-item">
                            <i className="benefit-icon">✓</i>
                            <span className="benefit-text">为他人文化贡献背书</span>
                          </li>
                        )}
                        {reputationScore >= 500 && (
                          <li className="benefit-item">
                            <i className="benefit-icon">✓</i>
                            <span className="benefit-text">创建文化活动和项目</span>
                          </li>
                        )}
                        {reputationScore >= 1000 && (
                          <li className="benefit-item">
                            <i className="benefit-icon">✓</i>
                            <span className="benefit-text">参与平台治理提案投票</span>
                          </li>
                        )}
                        {reputationScore >= 2500 && (
                          <li className="benefit-item">
                            <i className="benefit-icon">✓</i>
                            <span className="benefit-text">创建治理提案</span>
                          </li>
                        )}
                        {reputationScore >= 5000 && (
                          <li className="benefit-item">
                            <i className="benefit-icon">✓</i>
                            <span className="benefit-text">成为文化验证者</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === 'history' && (
                  <div className="tab-history">
                    <h3>声誉历史记录</h3>
                    {renderReputationHistory()}
                  </div>
                )}
                
                {activeTab === 'endorse' && (
                  <div className="tab-endorse">
                    <h3>为文化贡献背书</h3>
                    <p className="endorse-intro">
                      通过背书，您可以认可其他用户的文化贡献，帮助建立一个更可信的文化社区。
                      每次背书都会记录在区块链上，确保透明和不可篡改。
                    </p>
                    {renderEndorseForm()}
                  </div>
                )}
                
                {activeTab === 'leaderboard' && (
                  <div className="tab-leaderboard">
                    <h3>文化声誉排行榜</h3>
                    <p className="leaderboard-intro">
                      以下是平台上文化声誉最高的用户。他们通过持续的文化贡献和社区参与获得了广泛认可。
                    </p>
                    {renderLeaderboard()}
                  </div>
                )}
                
                {activeTab === 'info' && (
                  <div className="tab-info">
                    {renderReputationInfo()}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CulturalReputationSystem;
