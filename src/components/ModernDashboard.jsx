import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Avatar, 
  Badge,
  Statistic,
  Progress,
  Carousel,
  Divider,
  Tag,
  Tooltip,
  FloatButton
} from 'antd';
import {
  MessageOutlined,
  WalletOutlined,
  BookOutlined,
  GlobalOutlined,
  TrophyOutlined,
  StarOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './ModernDashboard.css';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// 模拟数据
const mockUserData = {
  username: "文化探索者",
  avatar: "/api/placeholder/64/64",
  level: 15,
  experience: 2850,
  nextLevelExp: 3000,
  cbtBalance: 1250.5,
  totalEarned: 5680.2,
  streak: 7,
  badges: ['初学者', '翻译达人', '社交明星'],
  stats: {
    messagesTranslated: 1234,
    friendsMade: 89,
    lessonsCompleted: 156,
    postsShared: 45
  }
};

const mockCulturalPosts = [
  {
    id: 1,
    author: "东京美食家",
    avatar: "/api/placeholder/40/40",
    content: "今天在京都体验了正宗的茶道文化，每一个动作都蕴含着深深的禅意...",
    images: ["/api/placeholder/300/200"],
    likes: 128,
    comments: 23,
    shares: 15,
    tags: ['日本文化', '茶道', '京都'],
    timestamp: "2小时前",
    language: "中文"
  },
  {
    id: 2,
    author: "巴黎艺术家",
    avatar: "/api/placeholder/40/40",
    content: "Visited the Louvre today and was amazed by the cultural diversity in art...",
    images: ["/api/placeholder/300/200"],
    likes: 256,
    comments: 45,
    shares: 32,
    tags: ['Art', 'Culture', 'Paris'],
    timestamp: "4小时前",
    language: "English"
  }
];

const mockLearningProgress = [
  { language: '日语', progress: 75, level: 'N3', nextGoal: 'N2' },
  { language: '法语', progress: 45, level: 'A2', nextGoal: 'B1' },
  { language: '西班牙语', progress: 30, level: 'A1', nextGoal: 'A2' }
];

const ModernDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState(3);
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    // 添加浮动动画
    const interval = setInterval(() => {
      setIsFloating(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const floatingVariants = {
    floating: {
      y: [-10, 10, -10],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // 渲染用户状态卡片
  const renderUserStatusCard = () => (
    <motion.div variants={itemVariants}>
      <Card 
        className="user-status-card gradient-card"
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none'
        }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge count={notifications} offset={[-5, 5]}>
                <Avatar size={64} src={mockUserData.avatar} icon={<UserOutlined />} />
              </Badge>
            </motion.div>
          </Col>
          <Col flex={1}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {mockUserData.username}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              等级 {mockUserData.level} • 连续学习 {mockUserData.streak} 天
            </Text>
            <div style={{ marginTop: 8 }}>
              <Progress 
                percent={(mockUserData.experience / mockUserData.nextLevelExp) * 100}
                strokeColor="#ffd700"
                trailColor="rgba(255,255,255,0.3)"
                showInfo={false}
                size="small"
              />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                {mockUserData.experience}/{mockUserData.nextLevelExp} EXP
              </Text>
            </div>
          </Col>
          <Col>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>CBT余额</span>}
              value={mockUserData.cbtBalance}
              precision={1}
              valueStyle={{ color: '#ffd700', fontSize: 20 }}
              suffix="CBT"
            />
          </Col>
        </Row>
      </Card>
    </motion.div>
  );

  // 渲染功能快捷入口
  const renderQuickActions = () => (
    <motion.div variants={itemVariants}>
      <Card title="快捷功能" className="quick-actions-card">
        <Row gutter={[16, 16]}>
          {[
            { icon: MessageOutlined, title: '实时聊天', color: '#1890ff', desc: '与全球朋友交流' },
            { icon: WalletOutlined, title: 'CBT钱包', color: '#52c41a', desc: '管理数字资产' },
            { icon: BookOutlined, title: '语言学习', color: '#722ed1', desc: '提升语言技能' },
            { icon: GlobalOutlined, title: '文化探索', color: '#fa8c16', desc: '发现世界文化' }
          ].map((action, index) => (
            <Col xs={12} sm={6} key={index}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                variants={floatingVariants}
                animate={isFloating ? "floating" : ""}
              >
                <Card 
                  hoverable
                  className="action-card"
                  style={{ 
                    textAlign: 'center',
                    borderRadius: 16,
                    border: `2px solid ${action.color}20`,
                    background: `linear-gradient(135deg, ${action.color}10, ${action.color}05)`
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${action.color}, ${action.color}80)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: `0 4px 12px ${action.color}30`
                  }}>
                    <action.icon style={{ fontSize: 24, color: 'white' }} />
                  </div>
                  <Title level={5} style={{ margin: '0 0 4px', fontSize: 14 }}>
                    {action.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {action.desc}
                  </Text>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Card>
    </motion.div>
  );

  // 渲染学习进度
  const renderLearningProgress = () => (
    <motion.div variants={itemVariants}>
      <Card title="学习进度" className="learning-progress-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {mockLearningProgress.map((lang, index) => (
            <div key={index}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong>{lang.language}</Text>
                  <Tag color="blue" style={{ marginLeft: 8 }}>{lang.level}</Tag>
                </Col>
                <Col>
                  <Text type="secondary">目标: {lang.nextGoal}</Text>
                </Col>
              </Row>
              <Progress 
                percent={lang.progress} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                trailColor="#f0f0f0"
                strokeWidth={8}
                style={{ marginTop: 8 }}
              />
            </div>
          ))}
        </Space>
      </Card>
    </motion.div>
  );

  // 渲染文化动态
  const renderCulturalFeed = () => (
    <motion.div variants={itemVariants}>
      <Card title="文化动态" className="cultural-feed-card">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {mockCulturalPosts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.02 }}
              className="post-item"
            >
              <Card 
                size="small"
                style={{ 
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0'
                }}
              >
                <Row gutter={12} align="top">
                  <Col>
                    <Avatar src={post.avatar} icon={<UserOutlined />} />
                  </Col>
                  <Col flex={1}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>{post.author}</Text>
                      <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                        {post.timestamp}
                      </Text>
                      <Tag color="geekblue" size="small" style={{ marginLeft: 8 }}>
                        {post.language}
                      </Tag>
                    </div>
                    
                    <Paragraph style={{ margin: '8px 0' }}>
                      {post.content}
                    </Paragraph>
                    
                    {post.images && (
                      <div style={{ margin: '12px 0' }}>
                        <img 
                          src={post.images[0]} 
                          alt="post" 
                          style={{ 
                            width: '100%', 
                            maxWidth: 300, 
                            borderRadius: 8,
                            objectFit: 'cover'
                          }} 
                        />
                      </div>
                    )}
                    
                    <div style={{ marginBottom: 8 }}>
                      {post.tags.map(tag => (
                        <Tag key={tag} color="blue" size="small">
                          #{tag}
                        </Tag>
                      ))}
                    </div>
                    
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space size="large">
                          <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button type="text" size="small" icon={<HeartOutlined />}>
                              {post.likes}
                            </Button>
                          </motion.span>
                          <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button type="text" size="small" icon={<CommentOutlined />}>
                              {post.comments}
                            </Button>
                          </motion.span>
                          <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button type="text" size="small" icon={<ShareAltOutlined />}>
                              {post.shares}
                            </Button>
                          </motion.span>
                        </Space>
                      </Col>
                      <Col>
                        <Button type="primary" size="small" ghost>
                          翻译
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          ))}
        </Space>
      </Card>
    </motion.div>
  );

  // 渲染成就徽章
  const renderAchievements = () => (
    <motion.div variants={itemVariants}>
      <Card title="成就徽章" className="achievements-card">
        <Row gutter={[16, 16]}>
          {mockUserData.badges.map((badge, index) => (
            <Col xs={8} key={index}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Card 
                  size="small"
                  hoverable
                  style={{ 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                    border: 'none',
                    borderRadius: 12
                  }}
                >
                  <TrophyOutlined style={{ fontSize: 24, color: '#d4af37' }} />
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 'bold' }}>
                    {badge}
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Card>
    </motion.div>
  );

  return (
    <Layout className="modern-dashboard">
      {/* 头部导航 */}
      <Header 
        style={{ 
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                CultureBridge
              </Title>
            </motion.div>
          </Col>
          <Col>
            <Space>
              <Tooltip title="通知">
                <Badge count={notifications}>
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    style={{ color: 'white' }}
                  />
                </Badge>
              </Tooltip>
              <Tooltip title="设置">
                <Button 
                  type="text" 
                  icon={<SettingOutlined />} 
                  style={{ color: 'white' }}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Header>

      {/* 主要内容区域 */}
      <Content style={{ padding: 24, background: '#f5f7fa' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row gutter={[24, 24]}>
            {/* 左侧列 */}
            <Col xs={24} lg={16}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {renderUserStatusCard()}
                {renderQuickActions()}
                {renderCulturalFeed()}
              </Space>
            </Col>

            {/* 右侧列 */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {renderLearningProgress()}
                {renderAchievements()}
                
                {/* 统计卡片 */}
                <motion.div variants={itemVariants}>
                  <Card title="我的统计" className="stats-card">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="翻译消息"
                          value={mockUserData.stats.messagesTranslated}
                          prefix={<MessageOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="结识朋友"
                          value={mockUserData.stats.friendsMade}
                          prefix={<UserOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="完成课程"
                          value={mockUserData.stats.lessonsCompleted}
                          prefix={<BookOutlined />}
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="分享内容"
                          value={mockUserData.stats.postsShared}
                          prefix={<ShareAltOutlined />}
                          valueStyle={{ color: '#fa8c16' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </motion.div>
              </Space>
            </Col>
          </Row>
        </motion.div>
      </Content>

      {/* 浮动按钮 */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24 }}
        icon={<PlusOutlined />}
      >
        <FloatButton icon={<MessageOutlined />} tooltip="开始聊天" />
        <FloatButton icon={<BookOutlined />} tooltip="学习课程" />
        <FloatButton icon={<GlobalOutlined />} tooltip="发布动态" />
      </FloatButton.Group>
    </Layout>
  );
};

export default ModernDashboard;

