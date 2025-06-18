import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Space, 
  Button, 
  Progress, 
  Tag, 
  List, 
  Statistic, 
  Badge,
  FloatButton,
  Tooltip,
  Divider,
  Image,
  Rate,
  Timeline,
  Calendar,
  Carousel,
  Tabs,
  Input,
  Select,
  Switch,
  Slider,
  notification
} from 'antd';
import { 
  UserOutlined, 
  MessageOutlined, 
  BookOutlined, 
  TrophyOutlined,
  FireOutlined,
  HeartOutlined,
  ShareAltOutlined,
  PlusOutlined,
  SettingOutlined,
  BellOutlined,
  GiftOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  StarOutlined,
  GlobalOutlined,
  CameraOutlined,
  WalletOutlined,
  TeamOutlined,
  CalendarOutlined,
  RocketOutlined,
  DiamondOutlined,
  CommentOutlined,
  LikeOutlined,
  EyeOutlined,
  SendOutlined,
  TranslationOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  SmileOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './EnhancedDashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 模拟数据
const mockUserData = {
  username: '文化探索者',
  avatar: '/api/placeholder/64/64',
  level: 18,
  exp: 2847,
  nextLevelExp: 3000,
  cbtBalance: 1247.89,
  followers: 1234,
  following: 567,
  posts: 89,
  achievements: [
    { id: 1, name: '翻译达人', icon: '🌐', color: '#1890ff', earned: true },
    { id: 2, name: '文化使者', icon: '🎭', color: '#52c41a', earned: true },
    { id: 3, name: '语言大师', icon: '📚', color: '#722ed1', earned: false },
    { id: 4, name: '社交明星', icon: '⭐', color: '#fa8c16', earned: true },
  ],
  learningProgress: [
    { language: '日语', progress: 75, level: 'N3', color: '#ff6b6b' },
    { language: '法语', progress: 45, level: 'A2', color: '#4ecdc4' },
    { language: '西班牙语', progress: 30, level: 'A1', color: '#45b7d1' },
  ],
  recentActivities: [
    { type: 'post', content: '分享了一张京都金阁寺的照片', time: '2小时前', likes: 23 },
    { type: 'comment', content: '评论了"法式料理制作技巧"', time: '4小时前', likes: 8 },
    { type: 'achievement', content: '获得了"翻译达人"徽章', time: '1天前', likes: 45 },
    { type: 'learning', content: '完成了日语N3语法练习', time: '2天前', likes: 12 },
  ]
};

const mockTrendingPosts = [
  {
    id: 1,
    author: '东京茶道师',
    avatar: '/api/placeholder/40/40',
    content: '今天在浅草寺体验了传统茶道，感受到了日本文化的深邃之美。每一个动作都蕴含着对自然和生活的敬畏...',
    images: ['/api/placeholder/300/200'],
    likes: 234,
    comments: 45,
    shares: 12,
    time: '3小时前',
    tags: ['茶道', '日本文化', '传统艺术'],
    location: '东京·浅草寺'
  },
  {
    id: 2,
    author: '巴黎美食家',
    avatar: '/api/placeholder/40/40',
    content: '在蒙马特高地发现了一家百年老店，他们的可颂酥脆香甜，配上一杯香浓的咖啡，这就是法式慢生活的精髓',
    images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
    likes: 189,
    comments: 32,
    shares: 8,
    time: '5小时前',
    tags: ['法式美食', '巴黎', '咖啡文化'],
    location: '巴黎·蒙马特'
  },
  {
    id: 3,
    author: '西班牙舞者',
    avatar: '/api/placeholder/40/40',
    content: '弗拉明戈不仅仅是舞蹈，它是安达卢西亚人民情感的表达，每一个转身都诉说着历史的故事',
    images: ['/api/placeholder/300/200'],
    likes: 156,
    comments: 28,
    shares: 15,
    time: '8小时前',
    tags: ['弗拉明戈', '西班牙', '舞蹈'],
    location: '塞维利亚'
  }
];

const mockCulturalEvents = [
  {
    id: 1,
    title: '日本茶道体验课',
    description: '学习正宗的日式茶道礼仪',
    date: '2024-01-20',
    time: '14:00',
    participants: 12,
    maxParticipants: 15,
    price: 50,
    image: '/api/placeholder/200/120',
    host: '茶道大师田中',
    rating: 4.9
  },
  {
    id: 2,
    title: '法语角聚会',
    description: '与法国朋友一起练习口语',
    date: '2024-01-22',
    time: '19:00',
    participants: 8,
    maxParticipants: 10,
    price: 0,
    image: '/api/placeholder/200/120',
    host: '巴黎留学生协会',
    rating: 4.7
  },
  {
    id: 3,
    title: '西班牙料理制作',
    description: '学做正宗的西班牙海鲜饭',
    date: '2024-01-25',
    time: '16:00',
    participants: 6,
    maxParticipants: 8,
    price: 80,
    image: '/api/placeholder/200/120',
    host: '马德里主厨Carlos',
    rating: 4.8
  }
];

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [userData, setUserData] = useState(mockUserData);
  const [trendingPosts, setTrendingPosts] = useState(mockTrendingPosts);
  const [culturalEvents, setCulturalEvents] = useState(mockCulturalEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showNotifications, setShowNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const carouselRef = useRef(null);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      // 随机更新CBT余额
      setUserData(prev => ({
        ...prev,
        cbtBalance: prev.cbtBalance + (Math.random() - 0.5) * 10
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 处理帖子互动
  const handlePostInteraction = (postId, type) => {
    setTrendingPosts(prev => prev.map(post => {
      if (post.id === postId) {
        switch (type) {
          case 'like':
            return { ...post, likes: post.likes + 1 };
          case 'comment':
            return { ...post, comments: post.comments + 1 };
          case 'share':
            return { ...post, shares: post.shares + 1 };
          default:
            return post;
        }
      }
      return post;
    }));

    notification.success({
      message: '操作成功',
      description: type === 'like' ? '已点赞' : type === 'comment' ? '已评论' : '已分享',
      placement: 'topRight',
      duration: 2,
    });
  };

  // 渲染用户信息卡片
  const renderUserCard = () => (
    <motion.div variants={itemVariants}>
      <Card 
        className="enhanced-user-card glass-effect"
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="card-decoration">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <Row align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Badge 
                count={<CrownOutlined style={{ color: '#ffd93d' }} />} 
                offset={[-5, 5]}
              >
                <Avatar 
                  size={80} 
                  src={userData.avatar} 
                  icon={<UserOutlined />}
                  style={{ 
                    border: '3px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                />
              </Badge>
            </motion.div>
          </Col>
          
          <Col xs={24} sm={16}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                  {userData.username}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Lv.{userData.level} • {userData.cbtBalance.toFixed(2)} CBT
                </Text>
              </div>
              
              <Progress 
                percent={(userData.exp / userData.nextLevelExp) * 100} 
                showInfo={false}
                strokeColor={{
                  '0%': '#ffd93d',
                  '100%': '#ff6b6b',
                }}
                trailColor="rgba(255,255,255,0.2)"
                strokeWidth={8}
              />
              
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic 
                    title="关注者" 
                    value={userData.followers} 
                    valueStyle={{ color: 'white', fontSize: 16 }}
                    titleStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="关注中" 
                    value={userData.following} 
                    valueStyle={{ color: 'white', fontSize: 16 }}
                    titleStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="帖子" 
                    value={userData.posts} 
                    valueStyle={{ color: 'white', fontSize: 16 }}
                    titleStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                  />
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );

  // 渲染快捷功能
  const renderQuickActions = () => (
    <motion.div variants={itemVariants}>
      <Card 
        title={<span className="gradient-text">快捷功能</span>}
        className="enhanced-quick-actions"
        extra={<MoreOutlined />}
      >
        <Row gutter={[16, 16]}>
          {[
            { icon: <MessageOutlined />, title: '开始聊天', color: '#1890ff', action: () => {} },
            { icon: <BookOutlined />, title: '学习语言', color: '#52c41a', action: () => {} },
            { icon: <CameraOutlined />, title: '分享动态', color: '#fa8c16', action: () => {} },
            { icon: <CalendarOutlined />, title: '文化活动', color: '#722ed1', action: () => {} },
            { icon: <WalletOutlined />, title: 'CBT钱包', color: '#eb2f96', action: () => {} },
            { icon: <TeamOutlined />, title: '找朋友', color: '#13c2c2', action: () => {} },
          ].map((item, index) => (
            <Col xs={12} sm={8} key={index}>
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  size="small" 
                  className="enhanced-action-card"
                  style={{ 
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
                    border: `1px solid ${item.color}30`,
                    cursor: 'pointer'
                  }}
                  onClick={item.action}
                >
                  <div className="action-card-bg"></div>
                  <Space direction="vertical" size="small">
                    <div style={{ 
                      fontSize: 24, 
                      color: item.color,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}>
                      {item.icon}
                    </div>
                    <Text strong style={{ fontSize: 12 }}>{item.title}</Text>
                  </Space>
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
      <Card 
        title={<span className="gradient-text">学习进度</span>}
        className="enhanced-learning-card"
        extra={<Button type="link" icon={<RocketOutlined />}>查看全部</Button>}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {userData.learningProgress.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Text strong>{item.language}</Text>
                    <Tag color={item.color} size="small">{item.level}</Tag>
                  </Space>
                </Col>
                <Col>
                  <Text type="secondary">{item.progress}%</Text>
                </Col>
              </Row>
              <Progress 
                percent={item.progress} 
                strokeColor={item.color}
                trailColor="#f0f0f0"
                strokeWidth={6}
                showInfo={false}
              />
            </motion.div>
          ))}
        </Space>
      </Card>
    </motion.div>
  );

  // 渲染成就徽章
  const renderAchievements = () => (
    <motion.div variants={itemVariants}>
      <Card 
        title={<span className="gradient-text">成就徽章</span>}
        className="achievements-card"
        extra={<Button type="link" icon={<TrophyOutlined />}>查看全部</Button>}
      >
        <Row gutter={[8, 8]}>
          {userData.achievements.map((achievement, index) => (
            <Col xs={12} sm={6} key={achievement.id}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Card 
                  size="small"
                  style={{ 
                    textAlign: 'center',
                    background: achievement.earned 
                      ? `linear-gradient(135deg, ${achievement.color}20, ${achievement.color}10)`
                      : '#f5f5f5',
                    border: achievement.earned 
                      ? `2px solid ${achievement.color}50`
                      : '2px solid #d9d9d9',
                    opacity: achievement.earned ? 1 : 0.6,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>
                    {achievement.icon}
                  </div>
                  <Text style={{ fontSize: 10 }}>{achievement.name}</Text>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Card>
    </motion.div>
  );

  // 渲染热门动态
  const renderTrendingFeed = () => (
    <motion.div variants={itemVariants}>
      <Card 
        title={
          <Space>
            <FireOutlined style={{ color: '#ff4d4f' }} />
            <span className="gradient-text">热门动态</span>
          </Space>
        }
        className="trending-feed-card"
        extra={
          <Space>
            <Select 
              value={selectedLanguage} 
              onChange={setSelectedLanguage}
              size="small"
              style={{ width: 100 }}
            >
              <Option value="all">全部</Option>
              <Option value="zh">中文</Option>
              <Option value="ja">日语</Option>
              <Option value="fr">法语</Option>
              <Option value="es">西语</Option>
            </Select>
            <Button type="link" icon={<MoreOutlined />}>更多</Button>
          </Space>
        }
      >
        <List
          dataSource={trendingPosts}
          renderItem={(post, index) => (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <List.Item 
                className="enhanced-post-item"
                style={{ 
                  padding: 16,
                  marginBottom: 12,
                  background: 'white',
                  borderRadius: 12,
                  border: '1px solid #f0f0f0'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={post.avatar} icon={<UserOutlined />} />
                  }
                  title={
                    <Space>
                      <Text strong>{post.author}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {post.time}
                      </Text>
                      {post.location && (
                        <Tag icon={<GlobalOutlined />} size="small">
                          {post.location}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Paragraph 
                        ellipsis={{ rows: 2, expandable: true }}
                        style={{ margin: 0 }}
                      >
                        {post.content}
                      </Paragraph>
                      
                      {post.images && post.images.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {post.images.length === 1 ? (
                            <Image
                              src={post.images[0]}
                              alt="post image"
                              style={{ 
                                width: '100%', 
                                maxWidth: 300, 
                                borderRadius: 8 
                              }}
                            />
                          ) : (
                            <Image.PreviewGroup>
                              <Row gutter={[8, 8]}>
                                {post.images.map((img, imgIndex) => (
                                  <Col span={12} key={imgIndex}>
                                    <Image
                                      src={img}
                                      alt={`post image ${imgIndex + 1}`}
                                      style={{ 
                                        width: '100%', 
                                        height: 120, 
                                        objectFit: 'cover',
                                        borderRadius: 8 
                                      }}
                                    />
                                  </Col>
                                ))}
                              </Row>
                            </Image.PreviewGroup>
                          )}
                        </div>
                      )}
                      
                      <Space wrap>
                        {post.tags.map(tag => (
                          <Tag key={tag} color="blue" size="small">
                            #{tag}
                          </Tag>
                        ))}
                      </Space>
                      
                      <Row justify="space-between" align="middle" style={{ marginTop: 8 }}>
                        <Col>
                          <Space size="large">
                            <Button 
                              type="text" 
                              icon={<LikeOutlined />}
                              onClick={() => handlePostInteraction(post.id, 'like')}
                            >
                              {post.likes}
                            </Button>
                            <Button 
                              type="text" 
                              icon={<CommentOutlined />}
                              onClick={() => handlePostInteraction(post.id, 'comment')}
                            >
                              {post.comments}
                            </Button>
                            <Button 
                              type="text" 
                              icon={<ShareAltOutlined />}
                              onClick={() => handlePostInteraction(post.id, 'share')}
                            >
                              {post.shares}
                            </Button>
                          </Space>
                        </Col>
                        <Col>
                          <Button 
                            type="text" 
                            icon={<TranslationOutlined />}
                            size="small"
                          >
                            翻译
                          </Button>
                        </Col>
                      </Row>
                    </Space>
                  }
                />
              </List.Item>
            </motion.div>
          )}
        />
      </Card>
    </motion.div>
  );

  // 渲染文化活动
  const renderCulturalEvents = () => (
    <motion.div variants={itemVariants}>
      <Card 
        title={<span className="gradient-text">文化活动</span>}
        className="cultural-events-card"
        extra={<Button type="link" icon={<CalendarOutlined />}>查看全部</Button>}
      >
        <Row gutter={[16, 16]}>
          {culturalEvents.map((event, index) => (
            <Col xs={24} sm={12} lg={8} key={event.id}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  size="small"
                  cover={
                    <Image
                      src={event.image}
                      alt={event.title}
                      style={{ height: 120, objectFit: 'cover' }}
                    />
                  }
                  style={{ height: '100%' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 14 }}>{event.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {event.description}
                    </Text>
                    
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space direction="vertical" size={0}>
                          <Text style={{ fontSize: 12 }}>
                            {event.date} {event.time}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {event.participants}/{event.maxParticipants} 人
                          </Text>
                        </Space>
                      </Col>
                      <Col>
                        <Space direction="vertical" size={0} align="end">
                          <Text strong style={{ color: '#fa8c16' }}>
                            {event.price === 0 ? '免费' : `¥${event.price}`}
                          </Text>
                          <Rate 
                            disabled 
                            defaultValue={event.rating} 
                            style={{ fontSize: 10 }}
                          />
                        </Space>
                      </Col>
                    </Row>
                    
                    <Button 
                      type="primary" 
                      size="small" 
                      block
                      style={{ marginTop: 8 }}
                    >
                      立即报名
                    </Button>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Card>
    </motion.div>
  );

  // 渲染最近活动
  const renderRecentActivities = () => (
    <motion.div variants={itemVariants}>
      <Card 
        title={<span className="gradient-text">最近活动</span>}
        extra={<Button type="link">查看全部</Button>}
      >
        <Timeline>
          {userData.recentActivities.map((activity, index) => (
            <Timeline.Item
              key={index}
              dot={
                activity.type === 'post' ? <PictureOutlined style={{ color: '#1890ff' }} /> :
                activity.type === 'comment' ? <CommentOutlined style={{ color: '#52c41a' }} /> :
                activity.type === 'achievement' ? <TrophyOutlined style={{ color: '#fa8c16' }} /> :
                <BookOutlined style={{ color: '#722ed1' }} />
              }
            >
              <Space direction="vertical" size={0}>
                <Text>{activity.content}</Text>
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {activity.time}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <HeartOutlined /> {activity.likes}
                  </Text>
                </Space>
              </Space>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </motion.div>
  );

  return (
    <div className="enhanced-dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: 24 }}
      >
        {/* 搜索栏 */}
        <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Search
                placeholder="搜索用户、帖子、活动..."
                allowClear
                enterButton={<SendOutlined />}
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderRadius: 12 }}
              />
            </Col>
            <Col>
              <Space>
                <Tooltip title="通知设置">
                  <Switch 
                    checked={showNotifications}
                    onChange={setShowNotifications}
                    checkedChildren={<BellOutlined />}
                    unCheckedChildren={<BellOutlined />}
                  />
                </Tooltip>
                <Tooltip title="自动播放">
                  <Switch 
                    checked={autoPlay}
                    onChange={setAutoPlay}
                    checkedChildren={<SoundOutlined />}
                    unCheckedChildren={<SoundOutlined />}
                  />
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </motion.div>

        {/* 主要内容区域 */}
        <Row gutter={[24, 24]}>
          {/* 左侧栏 */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {renderUserCard()}
              {renderQuickActions()}
              {renderLearningProgress()}
              {renderAchievements()}
            </Space>
          </Col>

          {/* 中间栏 */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {renderTrendingFeed()}
            </Space>
          </Col>

          {/* 右侧栏 */}
          <Col xs={24} lg={6}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {renderCulturalEvents()}
              {renderRecentActivities()}
            </Space>
          </Col>
        </Row>

        {/* 浮动按钮组 */}
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ right: 24 }}
          icon={<PlusOutlined />}
        >
          <FloatButton 
            icon={<MessageOutlined />} 
            tooltip="发起聊天"
          />
          <FloatButton 
            icon={<CameraOutlined />} 
            tooltip="分享动态"
          />
          <FloatButton 
            icon={<VideoCameraOutlined />} 
            tooltip="录制视频"
          />
          <FloatButton 
            icon={<CalendarOutlined />} 
            tooltip="创建活动"
          />
        </FloatButton.Group>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;

