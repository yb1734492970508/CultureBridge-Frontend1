import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { IdentityContext } from '../../context/identity/IdentityContext';
import { NFTMarketContext } from '../../context/marketplace/NFTMarketContext';
import { TokenContext } from '../../context/token/TokenContext';
import { Card, Row, Col, Button, Tabs, Tag, Avatar, Tooltip, Statistic, Alert, Spin, Empty, Divider, Typography, Space } from 'antd';
import { UserOutlined, SafetyOutlined, ShoppingOutlined, WalletOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

/**
 * NFT市场身份集成组件
 * 将身份与声誉系统集成到NFT市场中
 */
const NFTMarketIdentityIntegration = ({ nftId, creatorId, showBuyerRequirements = true }) => {
  const { account, active } = useWeb3React();
  const { currentIdentity, getIdentity } = useContext(IdentityContext);
  const { getReputation, checkReputationThreshold } = useContext(ReputationContext);
  const { getNFTDetails, getNFTReputationRequirements, setNFTReputationRequirements } = useContext(NFTMarketContext);
  
  const [creatorIdentity, setCreatorIdentity] = useState(null);
  const [creatorReputation, setCreatorReputation] = useState(null);
  const [nftDetails, setNftDetails] = useState(null);
  const [reputationRequirements, setReputationRequirements] = useState(null);
  const [buyerMeetsRequirements, setBuyerMeetsRequirements] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingRequirements, setIsSettingRequirements] = useState(false);
  const [newRequirement, setNewRequirement] = useState(0);
  
  // 加载NFT和创作者数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 加载NFT详情
        if (nftId) {
          const nftResult = await getNFTDetails(nftId);
          if (nftResult.success) {
            setNftDetails(nftResult.nft);
          } else {
            throw new Error(nftResult.error || '获取NFT详情失败');
          }
          
          // 加载声誉要求
          const requirementsResult = await getNFTReputationRequirements(nftId);
          if (requirementsResult.success) {
            setReputationRequirements(requirementsResult.requirements);
          }
        }
        
        // 加载创作者身份
        const targetCreatorId = creatorId || (nftDetails ? nftDetails.creatorId : null);
        if (targetCreatorId) {
          const identityResult = await getIdentity(targetCreatorId);
          if (identityResult.success) {
            setCreatorIdentity(identityResult.identity);
            
            // 加载创作者声誉
            const reputationResult = await getReputation(targetCreatorId);
            if (reputationResult.success) {
              setCreatorReputation(reputationResult.reputation);
            }
          }
        }
        
        // 检查买家是否满足要求
        if (active && currentIdentity && reputationRequirements) {
          const checkResult = await checkReputationThreshold(
            currentIdentity.identityId, 
            reputationRequirements.totalScore
          );
          setBuyerMeetsRequirements(checkResult);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('加载数据失败:', error);
        setError(error.message || '加载数据失败');
        setLoading(false);
      }
    };
    
    loadData();
  }, [nftId, creatorId, nftDetails, currentIdentity, active, getIdentity, getReputation, getNFTDetails, getNFTReputationRequirements, checkReputationThreshold]);

  // 设置声誉要求
  const handleSetRequirements = async () => {
    try {
      setIsSettingRequirements(true);
      
      const result = await setNFTReputationRequirements(nftId, {
        totalScore: newRequirement
      });
      
      if (result.success) {
        setReputationRequirements({
          totalScore: newRequirement
        });
        setIsSettingRequirements(false);
      } else {
        throw new Error(result.error || '设置声誉要求失败');
      }
    } catch (error) {
      console.error('设置声誉要求失败:', error);
      setError(error.message || '设置声誉要求失败');
      setIsSettingRequirements(false);
    }
  };

  // 渲染创作者身份信息
  const renderCreatorIdentity = () => {
    if (!creatorIdentity) {
      return (
        <Empty description="未找到创作者身份信息" />
      );
    }
    
    // 获取验证状态
    const hasBasicVerification = creatorIdentity.verifications?.some(v => 
      v.verificationType === 'basic' && v.valid
    );
    
    const hasSocialVerification = creatorIdentity.verifications?.some(v => 
      v.verificationType === 'social' && v.valid
    );
    
    const hasProfessionalVerification = creatorIdentity.verifications?.some(v => 
      v.verificationType === 'professional' && v.valid
    );
    
    return (
      <Card className="creator-identity-card">
        <div className="creator-identity-header">
          <Avatar 
            size={64} 
            src={creatorIdentity.avatar ? `https://ipfs.io/ipfs/${creatorIdentity.avatar}` : null}
            icon={!creatorIdentity.avatar ? <UserOutlined /> : null}
          />
          <div className="creator-identity-info">
            <Title level={4}>{creatorIdentity.name}</Title>
            <div className="creator-identity-verifications">
              {hasBasicVerification && (
                <Tooltip title="基础验证已完成">
                  <Tag color="blue" icon={<CheckCircleOutlined />}>已验证</Tag>
                </Tooltip>
              )}
              {hasSocialVerification && (
                <Tooltip title="社交验证已完成">
                  <Tag color="green" icon={<CheckCircleOutlined />}>社交已验证</Tag>
                </Tooltip>
              )}
              {hasProfessionalVerification && (
                <Tooltip title="专业验证已完成">
                  <Tag color="purple" icon={<CheckCircleOutlined />}>专业已验证</Tag>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        
        <Divider />
        
        <div className="creator-identity-content">
          {creatorIdentity.bio && (
            <>
              <Paragraph>{creatorIdentity.bio}</Paragraph>
              <Divider />
            </>
          )}
          
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="创作数量" 
                value={nftDetails?.creatorStats?.totalCreations || 0} 
                suffix="件"
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="销售总额" 
                value={nftDetails?.creatorStats?.totalSales || 0} 
                precision={2}
                suffix="ETH"
              />
            </Col>
          </Row>
          
          {creatorReputation && (
            <div className="creator-reputation-summary">
              <Divider />
              <Title level={5}>声誉评分</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="总声誉" 
                    value={creatorReputation.totalScore} 
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="创作得分" 
                    value={creatorReputation.creationScore} 
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </div>
          )}
        </div>
        
        <Divider />
        
        <div className="creator-identity-footer">
          <Button type="link" href={`/identity/${creatorIdentity.identityId}`}>
            查看完整档案
          </Button>
        </div>
      </Card>
    );
  };

  // 渲染买家要求
  const renderBuyerRequirements = () => {
    if (!showBuyerRequirements) {
      return null;
    }
    
    // 是否是创作者
    const isCreator = currentIdentity && creatorIdentity && 
      currentIdentity.identityId === creatorIdentity.identityId;
    
    return (
      <Card className="buyer-requirements-card">
        <Title level={4}>购买要求</Title>
        
        {isCreator ? (
          <div className="set-requirements">
            <Paragraph>
              作为创作者，您可以设置购买此NFT所需的最低声誉分数。
            </Paragraph>
            
            <div className="requirements-input">
              <input
                type="number"
                min="0"
                max="10000"
                value={newRequirement}
                onChange={(e) => setNewRequirement(parseInt(e.target.value) || 0)}
                placeholder="最低声誉分数"
              />
              <Button 
                type="primary" 
                onClick={handleSetRequirements}
                loading={isSettingRequirements}
              >
                设置要求
              </Button>
            </div>
            
            <Paragraph type="secondary">
              当前要求: {reputationRequirements?.totalScore || '无要求'}
            </Paragraph>
          </div>
        ) : (
          <div className="view-requirements">
            {reputationRequirements && reputationRequirements.totalScore > 0 ? (
              <>
                <Alert
                  message={
                    buyerMeetsRequirements ? 
                      "您满足购买要求" : 
                      "您不满足购买要求"
                  }
                  description={
                    <div>
                      <p>此NFT要求买家声誉分数不低于 {reputationRequirements.totalScore}</p>
                      {currentIdentity ? (
                        <p>您当前的声誉分数: {currentIdentity.reputation?.totalScore || 0}</p>
                      ) : (
                        <p>请先创建身份并获取声誉</p>
                      )}
                    </div>
                  }
                  type={buyerMeetsRequirements ? "success" : "warning"}
                  showIcon
                />
                
                {!buyerMeetsRequirements && currentIdentity && (
                  <div className="requirements-tips">
                    <Title level={5}>如何提升声誉:</Title>
                    <ul>
                      <li>完成身份验证</li>
                      <li>创作和发布高质量内容</li>
                      <li>参与社区活动和讨论</li>
                      <li>完成交易并获得好评</li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Alert
                message="无购买要求"
                description="此NFT没有设置声誉要求，任何人都可以购买。"
                type="info"
                showIcon
              />
            )}
          </div>
        )}
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
    <div className="nft-market-identity-integration">
      <Tabs defaultActiveKey="creator">
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              创作者信息
            </span>
          } 
          key="creator"
        >
          {renderCreatorIdentity()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SafetyOutlined />
              购买要求
            </span>
          } 
          key="requirements"
        >
          {renderBuyerRequirements()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default NFTMarketIdentityIntegration;
