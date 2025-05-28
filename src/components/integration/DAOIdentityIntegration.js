import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { IdentityContext } from '../../context/identity/IdentityContext';
import { DAOContext } from '../../context/dao/DAOContext';
import { Card, Row, Col, Button, Tabs, Tag, Avatar, Tooltip, Alert, Spin, Empty, Divider, Typography, Progress, Statistic } from 'antd';
import { TeamOutlined, UserOutlined, SafetyOutlined, TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

/**
 * DAO治理身份集成组件
 * 将身份与声誉系统集成到DAO治理中
 */
const DAOIdentityIntegration = ({ daoId }) => {
  const { account, active } = useWeb3React();
  const { currentIdentity, getIdentity, getReputation } = useContext(IdentityContext);
  const { 
    getDaoMembershipRequirements, 
    checkMembershipEligibility,
    getDaoMembershipStatus,
    getVotingPower,
    getDaoStats
  } = useContext(DAOContext);
  
  const [identity, setIdentity] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [membershipRequirements, setMembershipRequirements] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [votingPower, setVotingPower] = useState(0);
  const [daoStats, setDaoStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!daoId) {
          throw new Error('未提供DAO ID');
        }
        
        // 获取DAO成员资格要求
        const requirementsResult = await getDaoMembershipRequirements(daoId);
        if (requirementsResult.success) {
          setMembershipRequirements(requirementsResult.requirements);
        } else {
          throw new Error(requirementsResult.error || '获取DAO成员资格要求失败');
        }
        
        // 获取DAO统计数据
        const statsResult = await getDaoStats(daoId);
        if (statsResult.success) {
          setDaoStats(statsResult.stats);
        }
        
        // 如果用户已连接钱包且有身份，获取更多信息
        if (active && account && currentIdentity) {
          // 获取身份信息
          const identityResult = await getIdentity(currentIdentity.identityId);
          if (identityResult.success) {
            setIdentity(identityResult.identity);
          }
          
          // 获取声誉信息
          const reputationResult = await getReputation(currentIdentity.identityId);
          if (reputationResult.success) {
            setReputation(reputationResult.reputation);
          }
          
          // 检查成员资格
          const eligibilityResult = await checkMembershipEligibility(daoId, currentIdentity.identityId);
          if (eligibilityResult.success) {
            setIsEligible(eligibilityResult.eligible);
          }
          
          // 获取成员状态
          const statusResult = await getDaoMembershipStatus(daoId, currentIdentity.identityId);
          if (statusResult.success) {
            setMembershipStatus(statusResult.status);
          }
          
          // 获取投票权重
          const votingResult = await getVotingPower(daoId, currentIdentity.identityId);
          if (votingResult.success) {
            setVotingPower(votingResult.votingPower);
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
  }, [daoId, account, active, currentIdentity, getIdentity, getReputation, getDaoMembershipRequirements, checkMembershipEligibility, getDaoMembershipStatus, getVotingPower, getDaoStats]);

  // 渲染成员资格要求
  const renderMembershipRequirements = () => {
    if (!membershipRequirements) {
      return (
        <Empty description="未找到成员资格要求" />
      );
    }
    
    return (
      <Card className="membership-requirements-card">
        <Title level={4}>成员资格要求</Title>
        
        <div className="requirements-list">
          {membershipRequirements.identityVerified && (
            <div className="requirement-item">
              <div className="requirement-icon">
                <SafetyOutlined className={identity?.verifications?.some(v => v.valid) ? 'requirement-met' : 'requirement-not-met'} />
              </div>
              <div className="requirement-content">
                <div className="requirement-title">身份验证</div>
                <div className="requirement-description">需要完成基础身份验证</div>
                {identity?.verifications?.some(v => v.valid) ? (
                  <Tag color="success">已满足</Tag>
                ) : (
                  <Tag color="error">未满足</Tag>
                )}
              </div>
            </div>
          )}
          
          {membershipRequirements.minReputationScore > 0 && (
            <div className="requirement-item">
              <div className="requirement-icon">
                <TrophyOutlined className={reputation && reputation.totalScore >= membershipRequirements.minReputationScore ? 'requirement-met' : 'requirement-not-met'} />
              </div>
              <div className="requirement-content">
                <div className="requirement-title">最低声誉分数</div>
                <div className="requirement-description">
                  需要至少 {membershipRequirements.minReputationScore} 声誉分数
                </div>
                {reputation ? (
                  reputation.totalScore >= membershipRequirements.minReputationScore ? (
                    <Tag color="success">已满足 ({reputation.totalScore})</Tag>
                  ) : (
                    <>
                      <Tag color="error">未满足 ({reputation.totalScore}/{membershipRequirements.minReputationScore})</Tag>
                      <Progress 
                        percent={Math.min(Math.round(reputation.totalScore * 100 / membershipRequirements.minReputationScore), 99)} 
                        status="active"
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    </>
                  )
                ) : (
                  <Tag color="error">未满足 (无声誉数据)</Tag>
                )}
              </div>
            </div>
          )}
          
          {membershipRequirements.minTokenHolding > 0 && (
            <div className="requirement-item">
              <div className="requirement-icon">
                <WalletOutlined className={membershipStatus?.tokenBalance >= membershipRequirements.minTokenHolding ? 'requirement-met' : 'requirement-not-met'} />
              </div>
              <div className="requirement-content">
                <div className="requirement-title">最低通证持有量</div>
                <div className="requirement-description">
                  需要持有至少 {membershipRequirements.minTokenHolding} CULT通证
                </div>
                {membershipStatus ? (
                  membershipStatus.tokenBalance >= membershipRequirements.minTokenHolding ? (
                    <Tag color="success">已满足 ({membershipStatus.tokenBalance})</Tag>
                  ) : (
                    <>
                      <Tag color="error">未满足 ({membershipStatus.tokenBalance}/{membershipRequirements.minTokenHolding})</Tag>
                      <Progress 
                        percent={Math.min(Math.round(membershipStatus.tokenBalance * 100 / membershipRequirements.minTokenHolding), 99)} 
                        status="active"
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    </>
                  )
                ) : (
                  <Tag color="error">未满足 (无通证数据)</Tag>
                )}
              </div>
            </div>
          )}
          
          {membershipRequirements.minNFTOwned > 0 && (
            <div className="requirement-item">
              <div className="requirement-icon">
                <PictureOutlined className={membershipStatus?.nftCount >= membershipRequirements.minNFTOwned ? 'requirement-met' : 'requirement-not-met'} />
              </div>
              <div className="requirement-content">
                <div className="requirement-title">最低NFT持有量</div>
                <div className="requirement-description">
                  需要持有至少 {membershipRequirements.minNFTOwned} 个平台NFT
                </div>
                {membershipStatus ? (
                  membershipStatus.nftCount >= membershipRequirements.minNFTOwned ? (
                    <Tag color="success">已满足 ({membershipStatus.nftCount})</Tag>
                  ) : (
                    <>
                      <Tag color="error">未满足 ({membershipStatus.nftCount}/{membershipRequirements.minNFTOwned})</Tag>
                      <Progress 
                        percent={Math.min(Math.round(membershipStatus.nftCount * 100 / membershipRequirements.minNFTOwned), 99)} 
                        status="active"
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    </>
                  )
                ) : (
                  <Tag color="error">未满足 (无NFT数据)</Tag>
                )}
              </div>
            </div>
          )}
        </div>
        
        <Divider />
        
        <div className="eligibility-summary">
          {active && currentIdentity ? (
            isEligible ? (
              <Alert
                message="您符合成员资格要求"
                description="您已满足所有成员资格要求，可以加入此DAO参与治理。"
                type="success"
                showIcon
                action={
                  membershipStatus?.isMember ? (
                    <Button type="primary" disabled>
                      已是成员
                    </Button>
                  ) : (
                    <Button type="primary" href={`/dao/${daoId}/join`}>
                      加入DAO
                    </Button>
                  )
                }
              />
            ) : (
              <Alert
                message="您不符合成员资格要求"
                description="您尚未满足所有成员资格要求，请完成上述要求后再尝试加入。"
                type="warning"
                showIcon
              />
            )
          ) : (
            <Alert
              message="请先连接钱包并创建身份"
              description="连接钱包并创建身份后，系统将自动检查您是否符合成员资格要求。"
              type="info"
              showIcon
              action={
                <Button type="primary" href="/identity/create">
                  创建身份
                </Button>
              }
            />
          )}
        </div>
      </Card>
    );
  };

  // 渲染成员状态
  const renderMembershipStatus = () => {
    if (!membershipStatus || !membershipStatus.isMember) {
      return (
        <Alert
          message="您尚未加入此DAO"
          description="加入DAO后可以查看您的成员状态和投票权重。"
          type="info"
          showIcon
        />
      );
    }
    
    return (
      <Card className="membership-status-card">
        <Title level={4}>成员状态</Title>
        
        <div className="membership-info">
          <div className="membership-header">
            <Avatar 
              size={64} 
              src={identity?.avatar ? `https://ipfs.io/ipfs/${identity.avatar}` : null}
              icon={!identity?.avatar ? <UserOutlined /> : null}
            />
            <div className="membership-meta">
              <Title level={4}>{identity?.name || '成员'}</Title>
              <div className="membership-tags">
                <Tag color="blue">DAO成员</Tag>
                {membershipStatus.isCouncilMember && (
                  <Tag color="purple">理事会成员</Tag>
                )}
                {membershipStatus.joinDate && (
                  <Tag color="cyan">加入于 {new Date(membershipStatus.joinDate).toLocaleDateString()}</Tag>
                )}
              </div>
            </div>
          </div>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="投票权重"
                value={votingPower}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="提案参与率"
                value={membershipStatus.proposalParticipation || 0}
                suffix="%"
                precision={1}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="贡献分数"
                value={membershipStatus.contributionScore || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <div className="membership-actions">
            <Button type="primary" href={`/dao/${daoId}/proposals`}>
              查看提案
            </Button>
            <Button href={`/dao/${daoId}/members`}>
              查看所有成员
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染DAO统计
  const renderDAOStats = () => {
    if (!daoStats) {
      return null;
    }
    
    return (
      <Card className="dao-stats-card">
        <Title level={4}>DAO统计</Title>
        
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="成员数量"
              value={daoStats.memberCount}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="活跃提案"
              value={daoStats.activeProposals}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="已执行提案"
              value={daoStats.executedProposals}
            />
          </Col>
        </Row>
        
        <Divider />
        
        <div className="dao-reputation-distribution">
          <Title level={5}>声誉分布</Title>
          <div className="reputation-tiers">
            <div className="tier">
              <div className="tier-label">低声誉</div>
              <div className="tier-value">{daoStats.reputationDistribution?.low || 0}%</div>
            </div>
            <div className="tier">
              <div className="tier-label">中声誉</div>
              <div className="tier-value">{daoStats.reputationDistribution?.medium || 0}%</div>
            </div>
            <div className="tier">
              <div className="tier-label">高声誉</div>
              <div className="tier-value">{daoStats.reputationDistribution?.high || 0}%</div>
            </div>
          </div>
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
    <div className="dao-identity-integration">
      <Tabs defaultActiveKey="requirements">
        <TabPane 
          tab={
            <span>
              <SafetyOutlined />
              成员资格要求
            </span>
          } 
          key="requirements"
        >
          {renderMembershipRequirements()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              成员状态
            </span>
          } 
          key="status"
        >
          {renderMembershipStatus()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              DAO统计
            </span>
          } 
          key="stats"
        >
          {renderDAOStats()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DAOIdentityIntegration;
