import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { IdentityContext } from '../../context/identity/IdentityContext';
import { TokenContext } from '../../context/token/TokenContext';
import { Card, Row, Col, Button, Tabs, Tag, Statistic, Alert, Spin, Empty, Divider, Typography, Space, Progress } from 'antd';
import { UserOutlined, WalletOutlined, RiseOutlined, HistoryOutlined, QuestionCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

/**
 * 通证系统身份集成组件
 * 将身份与声誉系统集成到通证系统中
 */
const TokenSystemIdentityIntegration = ({ identityId }) => {
  const { account, active } = useWeb3React();
  const { currentIdentity, getIdentity } = useContext(IdentityContext);
  const { getReputation } = useContext(ReputationContext);
  const { getTokenBalance, getRewardMultiplier, getVotingPower, getStakingInfo } = useContext(TokenContext);
  
  const [identity, setIdentity] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [rewardMultiplier, setRewardMultiplier] = useState(100); // 基础倍数100%
  const [votingPower, setVotingPower] = useState(0);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 使用传入的identityId或当前身份的ID
        const targetId = identityId || (currentIdentity ? currentIdentity.identityId : null);
        
        if (!targetId) {
          setError('未找到有效的身份ID');
          setLoading(false);
          return;
        }
        
        // 获取身份信息
        const identityResult = await getIdentity(targetId);
        if (identityResult.success) {
          setIdentity(identityResult.identity);
        } else {
          throw new Error(identityResult.error || '获取身份信息失败');
        }
        
        // 获取声誉信息
        const reputationResult = await getReputation(targetId);
        if (reputationResult.success) {
          setReputation(reputationResult.reputation);
        } else {
          console.error('获取声誉信息失败:', reputationResult.error);
          // 不阻止整个组件加载
        }
        
        // 获取通证余额
        if (active && account) {
          const balanceResult = await getTokenBalance(account);
          if (balanceResult.success) {
            setTokenBalance(balanceResult.balance);
          }
          
          // 获取奖励倍数
          const multiplierResult = await getRewardMultiplier(account);
          if (multiplierResult.success) {
            setRewardMultiplier(multiplierResult.multiplier);
          }
          
          // 获取投票权重
          const votingResult = await getVotingPower(account);
          if (votingResult.success) {
            setVotingPower(votingResult.votingPower);
          }
          
          // 获取质押信息
          const stakingResult = await getStakingInfo(account);
          if (stakingResult.success) {
            setStakingInfo(stakingResult.stakingInfo);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('加载数据失败:', error);
        setError(error.message || '加载数据失败');
        setLoading(false);
      }
    };
    
    loadData();
  }, [identityId, currentIdentity, account, active, getIdentity, getReputation, getTokenBalance, getRewardMultiplier, getVotingPower, getStakingInfo]);

  // 渲染声誉奖励
  const renderReputationRewards = () => {
    if (!reputation) {
      return (
        <Empty description="未找到声誉数据" />
      );
    }
    
    // 计算下一级奖励倍数
    const nextLevelMultiplier = Math.min(rewardMultiplier + 25, 200);
    
    // 计算达到下一级所需的声誉分数
    const currentReputationTier = Math.floor(reputation.totalScore / 2500);
    const nextTierThreshold = (currentReputationTier + 1) * 2500;
    const progressToNextTier = Math.min(Math.round((reputation.totalScore % 2500) / 25), 100);
    
    return (
      <Card className="reputation-rewards-card">
        <Title level={4}>声誉奖励</Title>
        
        <div className="current-multiplier">
          <Statistic
            title="当前奖励倍数"
            value={rewardMultiplier}
            suffix="%"
            valueStyle={{ color: '#1890ff' }}
          />
          <Paragraph>
            基于您的声誉分数，您当前获得的通证奖励倍数为 {rewardMultiplier}%。
          </Paragraph>
        </div>
        
        <Divider />
        
        <div className="next-level-progress">
          <Title level={5}>距离下一级奖励</Title>
          <Progress
            percent={progressToNextTier}
            format={() => `${reputation.totalScore} / ${nextTierThreshold}`}
            status="active"
          />
          <Paragraph>
            达到 {nextTierThreshold} 声誉分数可获得 {nextLevelMultiplier}% 奖励倍数
          </Paragraph>
        </div>
        
        <Divider />
        
        <div className="reward-tiers">
          <Title level={5}>奖励等级表</Title>
          <ul className="tier-list">
            <li className={reputation.totalScore < 2500 ? 'current-tier' : 'passed-tier'}>
              <span className="tier-name">初级</span>
              <span className="tier-requirement">0 - 2,499</span>
              <span className="tier-multiplier">100%</span>
              {reputation.totalScore < 2500 && <Tag color="blue">当前</Tag>}
            </li>
            <li className={reputation.totalScore >= 2500 && reputation.totalScore < 5000 ? 'current-tier' : (reputation.totalScore >= 5000 ? 'passed-tier' : '')}>
              <span className="tier-name">中级</span>
              <span className="tier-requirement">2,500 - 4,999</span>
              <span className="tier-multiplier">125%</span>
              {reputation.totalScore >= 2500 && reputation.totalScore < 5000 && <Tag color="blue">当前</Tag>}
            </li>
            <li className={reputation.totalScore >= 5000 && reputation.totalScore < 7500 ? 'current-tier' : (reputation.totalScore >= 7500 ? 'passed-tier' : '')}>
              <span className="tier-name">高级</span>
              <span className="tier-requirement">5,000 - 7,499</span>
              <span className="tier-multiplier">150%</span>
              {reputation.totalScore >= 5000 && reputation.totalScore < 7500 && <Tag color="blue">当前</Tag>}
            </li>
            <li className={reputation.totalScore >= 7500 && reputation.totalScore < 9000 ? 'current-tier' : (reputation.totalScore >= 9000 ? 'passed-tier' : '')}>
              <span className="tier-name">专家</span>
              <span className="tier-requirement">7,500 - 8,999</span>
              <span className="tier-multiplier">175%</span>
              {reputation.totalScore >= 7500 && reputation.totalScore < 9000 && <Tag color="blue">当前</Tag>}
            </li>
            <li className={reputation.totalScore >= 9000 ? 'current-tier' : ''}>
              <span className="tier-name">大师</span>
              <span className="tier-requirement">9,000+</span>
              <span className="tier-multiplier">200%</span>
              {reputation.totalScore >= 9000 && <Tag color="blue">当前</Tag>}
            </li>
          </ul>
        </div>
      </Card>
    );
  };

  // 渲染投票权重
  const renderVotingPower = () => {
    if (!reputation) {
      return (
        <Empty description="未找到声誉数据" />
      );
    }
    
    // 计算基础投票权重
    const baseVotingPower = tokenBalance ? Math.floor(tokenBalance / 100) : 0;
    
    // 计算声誉加成
    const reputationBonus = Math.floor(reputation.totalScore / 1000);
    
    // 计算总投票权重
    const totalVotingPower = baseVotingPower + reputationBonus;
    
    return (
      <Card className="voting-power-card">
        <Title level={4}>投票权重</Title>
        
        <div className="voting-power-summary">
          <Statistic
            title="总投票权重"
            value={votingPower || totalVotingPower}
            valueStyle={{ color: '#722ed1' }}
          />
          <Paragraph>
            您的投票权重决定了您在平台治理中的影响力。
          </Paragraph>
        </div>
        
        <Divider />
        
        <div className="voting-power-breakdown">
          <Title level={5}>权重构成</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title={
                  <Tooltip title="基于您持有的通证数量">
                    基础权重 <QuestionCircleOutlined />
                  </Tooltip>
                }
                value={baseVotingPower}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={
                  <Tooltip title="基于您的声誉分数">
                    声誉加成 <QuestionCircleOutlined />
                  </Tooltip>
                }
                value={reputationBonus}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
        </div>
        
        <Divider />
        
        <div className="voting-power-tips">
          <Alert
            message="提升投票权重的方法"
            description={
              <ul>
                <li>增持CULT通证</li>
                <li>质押通证获取声誉</li>
                <li>参与平台活动提升声誉</li>
                <li>创作高质量内容</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </div>
      </Card>
    );
  };

  // 渲染特权解锁
  const renderPrivileges = () => {
    if (!reputation) {
      return (
        <Empty description="未找到声誉数据" />
      );
    }
    
    // 特权列表
    const privileges = [
      {
        id: 1,
        name: '降低交易费率',
        description: '交易费率降低5%',
        reputationRequired: 2500,
        unlocked: reputation.totalScore >= 2500
      },
      {
        id: 2,
        name: '内容优先展示',
        description: '您的内容将获得优先展示位置',
        reputationRequired: 5000,
        unlocked: reputation.totalScore >= 5000
      },
      {
        id: 3,
        name: '高级市场功能',
        description: '解锁拍卖、捆绑销售等高级功能',
        reputationRequired: 7500,
        unlocked: reputation.totalScore >= 7500
      },
      {
        id: 4,
        name: '治理投票权',
        description: '参与平台重大决策投票',
        reputationRequired: 9000,
        unlocked: reputation.totalScore >= 9000
      },
      {
        id: 5,
        name: '专属创作者奖励',
        description: '获取额外的创作者奖励池分配',
        reputationRequired: 9500,
        unlocked: reputation.totalScore >= 9500
      }
    ];
    
    // 找到下一个未解锁的特权
    const nextPrivilege = privileges.find(p => !p.unlocked);
    
    return (
      <Card className="privileges-card">
        <Title level={4}>声誉特权</Title>
        
        <div className="privileges-list">
          {privileges.map(privilege => (
            <div 
              key={privilege.id} 
              className={`privilege-item ${privilege.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="privilege-status">
                {privilege.unlocked ? (
                  <CheckCircleOutlined className="unlocked-icon" />
                ) : (
                  <span className="reputation-required">{privilege.reputationRequired}</span>
                )}
              </div>
              <div className="privilege-info">
                <div className="privilege-name">
                  {privilege.name}
                  {privilege.unlocked && <Tag color="success">已解锁</Tag>}
                </div>
                <div className="privilege-description">{privilege.description}</div>
              </div>
            </div>
          ))}
        </div>
        
        {nextPrivilege && (
          <div className="next-privilege">
            <Divider />
            <Title level={5}>下一个特权</Title>
            <Progress
              percent={Math.min(Math.round(reputation.totalScore * 100 / nextPrivilege.reputationRequired), 99)}
              format={() => `${reputation.totalScore} / ${nextPrivilege.reputationRequired}`}
              status="active"
            />
            <Paragraph>
              再获得 {nextPrivilege.reputationRequired - reputation.totalScore} 声誉分数即可解锁 {nextPrivilege.name}
            </Paragraph>
          </div>
        )}
      </Card>
    );
  };

  // 渲染质押奖励
  const renderStakingRewards = () => {
    if (!stakingInfo) {
      return (
        <Alert
          message="未找到质押信息"
          description="您尚未质押CULT通证，质押可以获得声誉加成和额外奖励。"
          type="info"
          showIcon
          action={
            <Button type="primary" href="/token/staking">
              去质押
            </Button>
          }
        />
      );
    }
    
    return (
      <Card className="staking-rewards-card">
        <Title level={4}>质押奖励</Title>
        
        <div className="staking-summary">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="已质押数量"
                value={stakingInfo.stakedAmount}
                precision={2}
                suffix="CULT"
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="累计奖励"
                value={stakingInfo.totalRewards}
                precision={2}
                suffix="CULT"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
        </div>
        
        <Divider />
        
        <div className="staking-details">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="质押时长"
                value={stakingInfo.stakingDuration}
                suffix="天"
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="年化收益率"
                value={stakingInfo.apr}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
        </div>
        
        <Divider />
        
        <div className="reputation-boost">
          <Title level={5}>声誉加成</Title>
          <Paragraph>
            质押CULT通证可以获得声誉加成，您当前的声誉加成为:
          </Paragraph>
          <Statistic
            value={stakingInfo.reputationBoost}
            suffix="声誉/月"
            valueStyle={{ color: '#722ed1' }}
          />
          <Paragraph type="secondary">
            声誉加成将按月自动添加到您的总声誉分数中
          </Paragraph>
        </div>
      </Card>
    );
  };

  if (loading) {
    return <Spin tip="加载中..." />;
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="token-system-identity-integration">
      <Tabs defaultActiveKey="rewards">
        <TabPane 
          tab={
            <span>
              <RiseOutlined />
              声誉奖励
            </span>
          } 
          key="rewards"
        >
          {renderReputationRewards()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <WalletOutlined />
              投票权重
            </span>
          } 
          key="voting"
        >
          {renderVotingPower()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              特权解锁
            </span>
          } 
          key="privileges"
        >
          {renderPrivileges()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              质押奖励
            </span>
          } 
          key="staking"
        >
          {renderStakingRewards()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TokenSystemIdentityIntegration;
