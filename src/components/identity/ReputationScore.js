import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { IdentityContext } from '../../context/identity/IdentityContext';
import { ReputationContext } from '../../context/identity/ReputationContext';
import { Card, Row, Col, Progress, Tabs, Statistic, Timeline, Empty, Spin, Alert, Tag, Tooltip, Button } from 'antd';
import { TrophyOutlined, RiseOutlined, FallOutlined, ClockCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';

const { TabPane } = Tabs;

/**
 * 声誉评分展示组件
 * 显示用户的声誉评分、分类评分、历史趋势和同行比较
 */
const ReputationScore = ({ identityId, showComparison = true }) => {
  const { account } = useWeb3React();
  const { currentIdentity } = useContext(IdentityContext);
  const { 
    getReputation, 
    getReputationHistory, 
    getPeerComparison,
    reputationLoading, 
    reputationError 
  } = useContext(ReputationContext);
  
  const [reputation, setReputation] = useState(null);
  const [history, setHistory] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 加载声誉数据
  useEffect(() => {
    const loadReputationData = async () => {
      try {
        setLoading(true);
        
        // 使用传入的identityId或当前身份的ID
        const targetId = identityId || (currentIdentity ? currentIdentity.identityId : null);
        
        if (!targetId) {
          setError('未找到有效的身份ID');
          setLoading(false);
          return;
        }
        
        // 获取声誉信息
        const reputationResult = await getReputation(targetId);
        if (reputationResult.success) {
          setReputation(reputationResult.reputation);
        } else {
          throw new Error(reputationResult.error || '获取声誉信息失败');
        }
        
        // 获取声誉历史
        const historyResult = await getReputationHistory(targetId);
        if (historyResult.success) {
          setHistory(historyResult.history);
        } else {
          console.error('获取声誉历史失败:', historyResult.error);
          // 不阻止整个组件加载
        }
        
        // 获取同行比较数据
        if (showComparison) {
          const comparisonResult = await getPeerComparison(targetId);
          if (comparisonResult.success) {
            setComparison(comparisonResult.comparison);
          } else {
            console.error('获取同行比较数据失败:', comparisonResult.error);
            // 不阻止整个组件加载
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('加载声誉数据失败:', error);
        setError(error.message || '加载声誉数据失败');
        setLoading(false);
      }
    };
    
    loadReputationData();
  }, [identityId, currentIdentity, getReputation, getReputationHistory, getPeerComparison, showComparison]);

  // 渲染总体评分
  const renderTotalScore = () => {
    if (!reputation) return null;
    
    const { totalScore } = reputation;
    
    // 根据分数确定等级和颜色
    let level, color;
    if (totalScore >= 9000) {
      level = '大师';
      color = '#722ed1';
    } else if (totalScore >= 7500) {
      level = '专家';
      color = '#1890ff';
    } else if (totalScore >= 5000) {
      level = '高级';
      color = '#52c41a';
    } else if (totalScore >= 2500) {
      level = '中级';
      color = '#faad14';
    } else {
      level = '初级';
      color = '#fa8c16';
    }
    
    // 计算百分比，满分10000
    const percent = Math.min(Math.round(totalScore / 100), 100);
    
    return (
      <Card className="reputation-total-card">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Progress
              type="dashboard"
              percent={percent}
              strokeColor={color}
              format={() => (
                <div className="reputation-score-value">
                  <div className="score">{totalScore}</div>
                  <div className="level">{level}</div>
                </div>
              )}
            />
          </Col>
          <Col span={16}>
            <h3>声誉等级: {level}</h3>
            <p>您的声誉分数在平台上处于 {level} 水平，继续保持良好行为可以提升声誉。</p>
            <div className="reputation-benefits">
              <h4>当前特权:</h4>
              <ul>
                {totalScore >= 2500 && <li>降低交易费率 (5%)</li>}
                {totalScore >= 5000 && <li>优先展示作品</li>}
                {totalScore >= 7500 && <li>解锁高级市场功能</li>}
                {totalScore >= 9000 && <li>获得平台治理投票权</li>}
              </ul>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // 渲染分类评分
  const renderCategoryScores = () => {
    if (!reputation) return null;
    
    const { creationScore, participationScore, tradingScore, contributionScore } = reputation;
    
    // 计算各类别百分比，各类别满分不同
    const creationPercent = Math.min(Math.round(creationScore / 40), 100);
    const participationPercent = Math.min(Math.round(participationScore / 20), 100);
    const tradingPercent = Math.min(Math.round(tradingScore / 20), 100);
    const contributionPercent = Math.min(Math.round(contributionScore / 20), 100);
    
    return (
      <Card title="分类评分" className="reputation-category-card">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic
              title={
                <Tooltip title="基于您创作的内容质量和数量">
                  创作得分 <QuestionCircleOutlined />
                </Tooltip>
              }
              value={creationScore}
              suffix={`/ 4000`}
            />
            <Progress percent={creationPercent} strokeColor="#1890ff" />
          </Col>
          <Col span={12}>
            <Statistic
              title={
                <Tooltip title="基于您在平台上的参与度和互动">
                  参与得分 <QuestionCircleOutlined />
                </Tooltip>
              }
              value={participationScore}
              suffix={`/ 2000`}
            />
            <Progress percent={participationPercent} strokeColor="#52c41a" />
          </Col>
          <Col span={12}>
            <Statistic
              title={
                <Tooltip title="基于您的交易行为和评价">
                  交易得分 <QuestionCircleOutlined />
                </Tooltip>
              }
              value={tradingScore}
              suffix={`/ 2000`}
            />
            <Progress percent={tradingPercent} strokeColor="#fa8c16" />
          </Col>
          <Col span={12}>
            <Statistic
              title={
                <Tooltip title="基于您对社区的贡献">
                  贡献得分 <QuestionCircleOutlined />
                </Tooltip>
              }
              value={contributionScore}
              suffix={`/ 2000`}
            />
            <Progress percent={contributionPercent} strokeColor="#722ed1" />
          </Col>
        </Row>
      </Card>
    );
  };

  // 渲染历史趋势
  const renderHistoryTrend = () => {
    if (!history || history.length === 0) {
      return (
        <Card title="历史趋势" className="reputation-history-card">
          <Empty description="暂无历史数据" />
        </Card>
      );
    }
    
    // 准备图表数据
    const chartData = history.map(item => ({
      date: new Date(item.timestamp).toLocaleDateString(),
      score: item.totalScore
    }));
    
    // 图表配置
    const config = {
      data: chartData,
      xField: 'date',
      yField: 'score',
      point: {
        size: 5,
        shape: 'diamond',
      },
      label: {
        style: {
          fill: '#aaa',
        },
      },
      smooth: true,
    };
    
    return (
      <Card title="历史趋势" className="reputation-history-card">
        <Line {...config} />
        <div className="reputation-history-events">
          <h4>近期声誉变动:</h4>
          <Timeline>
            {history.slice(-5).reverse().map((item, index) => {
              const isPositive = item.scoreChange > 0;
              return (
                <Timeline.Item
                  key={index}
                  color={isPositive ? '#52c41a' : '#f5222d'}
                  dot={isPositive ? <RiseOutlined /> : <FallOutlined />}
                >
                  <p>
                    {new Date(item.timestamp).toLocaleString()} - 
                    {item.eventType} 
                    <span className={`score-change ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '+' : ''}{item.scoreChange}
                    </span>
                  </p>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </div>
      </Card>
    );
  };

  // 渲染同行比较
  const renderPeerComparison = () => {
    if (!showComparison || !comparison) {
      return null;
    }
    
    return (
      <Card title="同行比较" className="reputation-comparison-card">
        {comparison.peers.length === 0 ? (
          <Empty description="暂无同行比较数据" />
        ) : (
          <>
            <div className="comparison-summary">
              <p>您的声誉分数超过了 <strong>{comparison.percentile}%</strong> 的同领域用户</p>
              {comparison.ranking && (
                <p>在{comparison.totalPeers}位{comparison.domain}领域用户中排名第 <strong>{comparison.ranking}</strong></p>
              )}
            </div>
            
            <h4>领域内顶尖用户:</h4>
            <ul className="top-peers-list">
              {comparison.topPeers.map((peer, index) => (
                <li key={index}>
                  <span className="peer-rank">{index + 1}</span>
                  <span className="peer-name">{peer.name}</span>
                  <span className="peer-score">{peer.score}</span>
                  {peer.isYou && <Tag color="#1890ff">您</Tag>}
                </li>
              ))}
            </ul>
            
            <div className="comparison-tips">
              <h4>提升建议:</h4>
              <ul>
                {comparison.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Card>
    );
  };

  // 渲染成就展示
  const renderAchievements = () => {
    if (!reputation) return null;
    
    // 根据声誉分数确定解锁的成就
    const achievements = [
      {
        id: 1,
        title: '平台新手',
        description: '成功创建身份并完成验证',
        unlocked: true,
        icon: <TrophyOutlined style={{ color: '#52c41a' }} />
      },
      {
        id: 2,
        title: '活跃参与者',
        description: '参与度得分达到500+',
        unlocked: reputation.participationScore >= 500,
        icon: <TrophyOutlined style={{ color: reputation.participationScore >= 500 ? '#1890ff' : '#d9d9d9' }} />
      },
      {
        id: 3,
        title: '创作先锋',
        description: '创作得分达到1000+',
        unlocked: reputation.creationScore >= 1000,
        icon: <TrophyOutlined style={{ color: reputation.creationScore >= 1000 ? '#722ed1' : '#d9d9d9' }} />
      },
      {
        id: 4,
        title: '交易达人',
        description: '交易得分达到1000+',
        unlocked: reputation.tradingScore >= 1000,
        icon: <TrophyOutlined style={{ color: reputation.tradingScore >= 1000 ? '#fa8c16' : '#d9d9d9' }} />
      },
      {
        id: 5,
        title: '社区贡献者',
        description: '贡献得分达到1000+',
        unlocked: reputation.contributionScore >= 1000,
        icon: <TrophyOutlined style={{ color: reputation.contributionScore >= 1000 ? '#eb2f96' : '#d9d9d9' }} />
      },
      {
        id: 6,
        title: '声誉大师',
        description: '总声誉分达到9000+',
        unlocked: reputation.totalScore >= 9000,
        icon: <TrophyOutlined style={{ color: reputation.totalScore >= 9000 ? '#f5222d' : '#d9d9d9' }} />
      }
    ];
    
    return (
      <Card title="成就与荣誉" className="reputation-achievements-card">
        <Row gutter={[16, 16]}>
          {achievements.map(achievement => (
            <Col span={8} key={achievement.id}>
              <Card
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                hoverable
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-title">{achievement.title}</div>
                <div className="achievement-description">{achievement.description}</div>
                <div className="achievement-status">
                  {achievement.unlocked ? (
                    <Tag color="success">已解锁</Tag>
                  ) : (
                    <Tag color="default">未解锁</Tag>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  if (loading || reputationLoading) {
    return <Spin tip="加载声誉数据..." />;
  }

  if (error || reputationError) {
    return (
      <Alert
        message="加载声誉数据失败"
        description={error || reputationError}
        type="error"
        showIcon
      />
    );
  }

  if (!reputation) {
    return (
      <Alert
        message="未找到声誉数据"
        description="该身份尚未初始化声誉系统或声誉数据不可用。"
        type="info"
        showIcon
        action={
          <Button size="small" type="primary">
            初始化声誉
          </Button>
        }
      />
    );
  }

  return (
    <div className="reputation-score-container">
      <Tabs defaultActiveKey="overview">
        <TabPane tab="概览" key="overview">
          {renderTotalScore()}
          {renderCategoryScores()}
        </TabPane>
        <TabPane tab="历史趋势" key="history">
          {renderHistoryTrend()}
        </TabPane>
        {showComparison && (
          <TabPane tab="同行比较" key="comparison">
            {renderPeerComparison()}
          </TabPane>
        )}
        <TabPane tab="成就与荣誉" key="achievements">
          {renderAchievements()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReputationScore;
