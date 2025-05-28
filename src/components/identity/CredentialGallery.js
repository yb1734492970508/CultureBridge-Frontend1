import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { IdentityContext } from '../../context/identity/IdentityContext';
import { Card, Row, Col, Button, Tabs, Tag, Avatar, Tooltip, Alert, Spin, Empty, Divider, Typography, List, Badge } from 'antd';
import { SafetyCertificateOutlined, TrophyOutlined, FileProtectOutlined, LinkOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

/**
 * 凭证展示组件
 * 展示用户的凭证和成就
 */
const CredentialGallery = ({ identityId }) => {
  const { account, active } = useWeb3React();
  const { 
    currentIdentity, 
    getIdentity, 
    getCredentials,
    credentialsLoading, 
    credentialsError 
  } = useContext(IdentityContext);
  
  const [credentials, setCredentials] = useState([]);
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // 凭证类型
  const credentialTypes = [
    { key: 'all', label: '全部', color: '' },
    { key: 'achievement', label: '成就', color: 'gold' },
    { key: 'certification', label: '认证', color: 'blue' },
    { key: 'award', label: '奖项', color: 'purple' },
    { key: 'participation', label: '参与', color: 'green' },
    { key: 'contribution', label: '贡献', color: 'red' }
  ];
  
  // 加载凭证数据
  useEffect(() => {
    const loadCredentials = async () => {
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
        
        // 获取凭证列表
        const credentialsResult = await getCredentials(targetId);
        if (credentialsResult.success) {
          setCredentials(credentialsResult.credentials);
        } else {
          throw new Error(credentialsResult.error || '获取凭证列表失败');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('加载凭证数据失败:', error);
        setError(error.message || '加载凭证数据失败');
        setLoading(false);
      }
    };
    
    loadCredentials();
  }, [identityId, currentIdentity, getIdentity, getCredentials]);

  // 处理筛选
  const handleFilterChange = (key) => {
    setFilter(key);
  };

  // 渲染凭证卡片
  const renderCredentialCard = (credential) => {
    // 检查凭证是否过期
    const isExpired = credential.expiresAt && new Date(credential.expiresAt) < new Date();
    
    // 获取凭证类型信息
    const typeInfo = credentialTypes.find(t => t.key === credential.credentialType) || {
      label: credential.credentialType,
      color: 'default'
    };
    
    return (
      <Badge.Ribbon 
        text={typeInfo.label} 
        color={typeInfo.color}
        style={{ display: isExpired ? 'none' : 'block' }}
      >
        <Card 
          hoverable
          className={`credential-card ${isExpired ? 'expired' : ''}`}
          cover={
            <div className="credential-image">
              {credential.image ? (
                <img 
                  alt={credential.name} 
                  src={`https://ipfs.io/ipfs/${credential.image.replace('ipfs://', '')}`} 
                />
              ) : (
                <div className="credential-placeholder">
                  <SafetyCertificateOutlined />
                </div>
              )}
              {isExpired && (
                <div className="expired-overlay">
                  <span>已过期</span>
                </div>
              )}
            </div>
          }
          actions={[
            <Tooltip title="查看详情">
              <Button 
                type="link" 
                icon={<FileProtectOutlined />}
                href={`/credentials/${credential.id}`}
              />
            </Tooltip>,
            credential.metadata && (
              <Tooltip title="查看元数据">
                <Button 
                  type="link" 
                  icon={<LinkOutlined />}
                  href={`https://ipfs.io/ipfs/${credential.metadata.replace('ipfs://', '')}`}
                  target="_blank"
                />
              </Tooltip>
            )
          ]}
        >
          <Card.Meta
            title={credential.name}
            description={
              <div className="credential-meta">
                <div className="credential-issuer">
                  <Text type="secondary">颁发者: </Text>
                  <Text>{credential.issuerName || credential.issuer.substring(0, 6) + '...' + credential.issuer.substring(credential.issuer.length - 4)}</Text>
                </div>
                <div className="credential-date">
                  <Text type="secondary">颁发日期: </Text>
                  <Text>{new Date(credential.issuedAt).toLocaleDateString()}</Text>
                </div>
                {credential.expiresAt && (
                  <div className="credential-expiry">
                    <Text type="secondary">有效期至: </Text>
                    <Text type={isExpired ? 'danger' : 'default'}>
                      {new Date(credential.expiresAt).toLocaleDateString()}
                      {isExpired && ' (已过期)'}
                    </Text>
                  </div>
                )}
              </div>
            }
          />
        </Card>
      </Card>
    </Badge.Ribbon>
  );

  // 渲染凭证网格
  const renderCredentialGrid = () => {
    // 筛选凭证
    const filteredCredentials = filter === 'all' 
      ? credentials 
      : credentials.filter(c => c.credentialType === filter);
    
    if (filteredCredentials.length === 0) {
      return (
        <Empty 
          description={filter === 'all' ? '暂无凭证' : `暂无${credentialTypes.find(t => t.key === filter)?.label || filter}类型的凭证`} 
        />
      );
    }
    
    return (
      <Row gutter={[16, 16]} className="credential-grid">
        {filteredCredentials.map(credential => (
          <Col xs={24} sm={12} md={8} lg={6} key={credential.id}>
            {renderCredentialCard(credential)}
          </Col>
        ))}
      </Row>
    );
  };

  // 渲染成就统计
  const renderAchievementStats = () => {
    if (!credentials || credentials.length === 0) {
      return null;
    }
    
    // 统计各类型凭证数量
    const stats = credentialTypes.reduce((acc, type) => {
      if (type.key !== 'all') {
        acc[type.key] = credentials.filter(c => c.credentialType === type.key).length;
      }
      return acc;
    }, {});
    
    // 计算总凭证数
    const totalCredentials = credentials.length;
    
    // 计算有效凭证数
    const validCredentials = credentials.filter(c => !c.expiresAt || new Date(c.expiresAt) >= new Date()).length;
    
    return (
      <Card className="achievement-stats-card">
        <Title level={4}>凭证统计</Title>
        
        <Row gutter={16}>
          <Col span={12}>
            <div className="stat-item">
              <div className="stat-value">{totalCredentials}</div>
              <div className="stat-label">总凭证数</div>
            </div>
          </Col>
          <Col span={12}>
            <div className="stat-item">
              <div className="stat-value">{validCredentials}</div>
              <div className="stat-label">有效凭证</div>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <div className="credential-type-stats">
          <List
            size="small"
            dataSource={Object.entries(stats)}
            renderItem={([type, count]) => {
              const typeInfo = credentialTypes.find(t => t.key === type) || {
                label: type,
                color: 'default'
              };
              
              return (
                <List.Item>
                  <div className="type-stat-item">
                    <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                    <span className="type-count">{count}</span>
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      </Card>
    );
  };

  // 渲染最近获得的凭证
  const renderRecentCredentials = () => {
    if (!credentials || credentials.length === 0) {
      return null;
    }
    
    // 获取最近5个凭证
    const recentCredentials = [...credentials]
      .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
      .slice(0, 5);
    
    return (
      <Card className="recent-credentials-card">
        <Title level={4}>最近获得</Title>
        
        <List
          itemLayout="horizontal"
          dataSource={recentCredentials}
          renderItem={credential => {
            // 获取凭证类型信息
            const typeInfo = credentialTypes.find(t => t.key === credential.credentialType) || {
              label: credential.credentialType,
              color: 'default'
            };
            
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    credential.image ? (
                      <Avatar src={`https://ipfs.io/ipfs/${credential.image.replace('ipfs://', '')}`} />
                    ) : (
                      <Avatar icon={<SafetyCertificateOutlined />} />
                    )
                  }
                  title={
                    <div className="recent-credential-title">
                      <span>{credential.name}</span>
                      <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                    </div>
                  }
                  description={
                    <div className="recent-credential-meta">
                      <div>颁发者: {credential.issuerName || credential.issuer.substring(0, 6) + '...'}</div>
                      <div>颁发日期: {new Date(credential.issuedAt).toLocaleDateString()}</div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    );
  };

  if (loading || credentialsLoading) {
    return <Spin tip="加载凭证数据..." />;
  }

  if (error || credentialsError) {
    return (
      <Alert
        message="加载凭证数据失败"
        description={error || credentialsError}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="credential-gallery">
      <div className="credential-gallery-header">
        <div className="credential-gallery-title">
          <Title level={3}>
            <SafetyCertificateOutlined /> 凭证与成就
          </Title>
          <Paragraph>
            展示您在平台上获得的各类凭证、认证和成就。这些凭证证明了您的身份、技能和贡献。
          </Paragraph>
        </div>
        
        {identity && (
          <div className="identity-summary">
            <Avatar 
              size={64} 
              src={identity.avatar ? `https://ipfs.io/ipfs/${identity.avatar}` : null}
              icon={!identity.avatar ? <UserOutlined /> : null}
            />
            <div className="identity-info">
              <Title level={4}>{identity.name}</Title>
              <div className="identity-verification-status">
                {identity.verifications?.some(v => v.valid) ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>已验证身份</Tag>
                ) : (
                  <Tag color="warning" icon={<ClockCircleOutlined />}>未验证身份</Tag>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Divider />
      
      <div className="credential-gallery-content">
        <Row gutter={16}>
          <Col xs={24} md={18}>
            <div className="credential-filter">
              <div className="filter-label">筛选凭证类型:</div>
              <div className="filter-buttons">
                {credentialTypes.map(type => (
                  <Button
                    key={type.key}
                    type={filter === type.key ? 'primary' : 'default'}
                    onClick={() => handleFilterChange(type.key)}
                    style={{ 
                      borderColor: type.color && filter !== type.key ? type.color : undefined,
                      color: type.color && filter !== type.key ? type.color : undefined
                    }}
                  >
                    {type.label} {filter !== 'all' && filter === type.key && `(${credentials.filter(c => c.credentialType === type.key).length})`}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="credentials-container">
              {renderCredentialGrid()}
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div className="credential-sidebar">
              {renderAchievementStats()}
              {renderRecentCredentials()}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CredentialGallery;
