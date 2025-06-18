import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  notification,
  Affix,
  BackTop,
  Drawer,
  Modal,
  Popover,
  Dropdown,
  Menu,
  Spin,
  Empty,
  Result,
  Alert
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
  MoreOutlined,
  MenuOutlined,
  CloseOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  CompressOutlined,
  HomeOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  FundOutlined,
  HeatMapOutlined,
  InteractionOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  RiseOutlined,
  StockOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './UltraModernDashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 超现代化主题配色
const ULTRA_THEMES = {
  neon: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accent: '#00f5ff',
    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
    card: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  },
  cyberpunk: {
    primary: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)',
    secondary: 'linear-gradient(135deg, #3a86ff 0%, #06ffa5 100%)',
    accent: '#ffbe0b',
    background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    card: 'rgba(255, 255, 255, 0.08)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)'
  },
  aurora: {
    primary: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    secondary: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    accent: '#ff9a9e',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)',
    card: 'rgba(255, 255, 255, 0.2)',
    text: '#2c3e50',
    textSecondary: 'rgba(44, 62, 80, 0.7)'
  }
};

// 模拟增强数据
const mockEnhancedUserData = {
  username: '文化探索者Pro',
  avatar: '/api/placeholder/80/80',
  level: 25,
  exp: 4567,
  nextLevelExp: 5000,
  cbtBalance: 2847.89,
  followers: 2345,
  following: 789,
  posts: 156,
  totalViews: 45678,
  totalLikes: 12345,
  streakDays: 28,
  achievements: [
    { id: 1, name: '翻译大师', icon: '🌐', color: '#1890ff', earned: true, rarity: 'legendary' },
    { id: 2, name: '文化使者', icon: '🎭', color: '#52c41a', earned: true, rarity: 'epic' },
    { id: 3, name: '语言天才', icon: '📚', color: '#722ed1', earned: true, rarity: 'rare' },
    { id: 4, name: '社交达人', icon: '⭐', color: '#fa8c16', earned: true, rarity: 'epic' },
    { id: 5, name: '创作之星', icon: '🎨', color: '#eb2f96', earned: false, rarity: 'legendary' },
    { id: 6, name: '学习狂人', icon: '🚀', color: '#13c2c2', earned: true, rarity: 'rare' },
  ],
  learningProgress: [
    { language: '日语', progress: 85, level: 'N2', color: '#ff6b6b', streak: 15, totalHours: 120 },
    { language: '法语', progress: 65, level: 'B1', color: '#4ecdc4', streak: 8, totalHours: 89 },
    { language: '西班牙语', progress: 45, level: 'A2', color: '#45b7d1', streak: 5, totalHours: 67 },
    { language: '韩语', progress: 30, level: 'A1', color: '#f9ca24', streak: 3, totalHours: 34 },
  ],
  recentActivities: [
    { type: 'post', content: '分享了一张京都金阁寺的绝美照片', time: '1小时前', likes: 89, views: 234 },
    { type: 'achievement', content: '获得了"翻译大师"传奇徽章', time: '3小时前', likes: 156, views: 445 },
    { type: 'comment', content: '深度评论了"法式料理的艺术哲学"', time: '5小时前', likes: 34, views: 78 },
    { type: 'learning', content: '完成了日语N2高级语法挑战', time: '8小时前', likes: 67, views: 123 },
    { type: 'chat', content: '与来自巴黎的Marie进行了2小时文化交流', time: '12小时前', likes: 23, views: 56 },
  ],
  stats: {
    weeklyActive: 7,
    monthlyPosts: 23,
    translationAccuracy: 96.8,
    culturalScore: 8.9,
    friendshipIndex: 9.2
  }
};

const UltraModernDashboard = () => {
  const [currentTheme, setCurrentTheme] = useState('neon');
  const [userData, setUserData] = useState(mockEnhancedUserData);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({
    onlineUsers: 1234,
    activeChats: 89,
    translationsToday: 567,
    newPosts: 45
  });

  const theme = ULTRA_THEMES[currentTheme];

  // 实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 10 - 5),
        activeChats: prev.activeChats + Math.floor(Math.random() * 6 - 3),
        translationsToday: prev.translationsToday + Math.floor(Math.random() * 8),
        newPosts: prev.newPosts + Math.floor(Math.random() * 4)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // 渲染超现代用户卡片
  const renderUltraUserCard = () => (
    <motion.div variants={itemVariants}>
      <Card 
        className="ultra-user-card"
        style={{ 
          background: theme.card,
          backdropFilter: 'blur(20px)',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative'
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* 背景装饰 */}
        <div 
          className="card-bg-decoration"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: theme.primary,
            opacity: 0.1,
            borderRadius: '24px 24px 0 0'
          }}
        />
        
        <div style={{ padding: 24, position: 'relative', zIndex: 1 }}>
          <Row align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Badge 
                  count={<CrownOutlined style={{ color: '#ffd93d', fontSize: 16 }} />} 
                  offset={[-8, 8]}
                >
                  <Avatar 
                    size={100} 
                    src={userData.avatar} 
                    icon={<UserOutlined />}
                    style={{ 
                      border: '4px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                    }}
                  />
                </Badge>
              </motion.div>
              
              <div style={{ marginTop: 12 }}>
                <Tag color="gold" style={{ borderRadius: 12 }}>
                  连续学习 {userData.streakDays} 天
                </Tag>
              </div>
            </Col>
            
            <Col xs={24} sm={16}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Title level={3} style={{ color: theme.text, margin: 0, fontSize: 24 }}>
                    {userData.username}
                  </Title>
                  <Space>
                    <Text style={{ color: theme.textSecondary, fontSize: 16 }}>
                      Lv.{userData.level}
                    </Text>
                    <Divider type="vertical" />
                    <Text style={{ color: theme.accent, fontSize: 16, fontWeight: 'bold' }}>
                      {userData.cbtBalance.toFixed(2)} CBT
                    </Text>
                  </Space>
                </div>
                
                <div style={{ marginTop: 12 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    经验值进度
                  </Text>
                  <Progress 
                    percent={(userData.exp / userData.nextLevelExp) * 100} 
                    showInfo={false}
                    strokeColor={{
                      '0%': theme.accent,
                      '100%': '#ff6b6b',
                    }}
                    trailColor="rgba(255,255,255,0.1)"
                    strokeWidth={8}
                    style={{ marginTop: 4 }}
                  />
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                    {userData.exp} / {userData.nextLevelExp} XP
                  </Text>
                </div>
                
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={6}>
                    <Statistic 
                      title="关注者" 
                      value={userData.followers} 
                      valueStyle={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}
                      titleStyle={{ color: theme.textSecondary, fontSize: 11 }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="关注中" 
                      value={userData.following} 
                      valueStyle={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}
                      titleStyle={{ color: theme.textSecondary, fontSize: 11 }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="帖子" 
                      value={userData.posts} 
                      valueStyle={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}
                      titleStyle={{ color: theme.textSecondary, fontSize: 11 }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="总浏览" 
                      value={userData.totalViews} 
                      valueStyle={{ color: theme.accent, fontSize: 18, fontWeight: 'bold' }}
                      titleStyle={{ color: theme.textSecondary, fontSize: 11 }}
                    />
                  </Col>
                </Row>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>
    </motion.div>
  );

  // 渲染实时统计
  const renderRealTimeStats = () => (
    <motion.div variants={itemVariants}>
      <Card 
        title={
          <Space>
            <ThunderboltOutlined style={{ color: theme.accent }} />
            <span style={{ color: theme.text }}>实时数据</span>
          </Space>
        }
        style={{ 
          background: theme.card,
          backdropFilter: 'blur(20px)',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderRadius: 16
        }}
        headStyle={{ 
          background: 'transparent',
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row gutter={[16, 16]}>
          {[
            { label: '在线用户', value: realTimeData.onlineUsers, icon: <UserOutlined />, color: '#52c41a' },
            { label: '活跃聊天', value: realTimeData.activeChats, icon: <MessageOutlined />, color: '#1890ff' },
            { label: '今日翻译', value: realTimeData.translationsToday, icon: <TranslationOutlined />, color: '#722ed1' },
            { label: '新增帖子', value: realTimeData.newPosts, icon: <PictureOutlined />, color: '#fa8c16' },
          ].map((stat, index) => (
            <Col xs={12} sm={6} key={index}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  textAlign: 'center',
                  padding: 16,
                  background: `${stat.color}15`,
                  borderRadius: 12,
                  border: `1px solid ${stat.color}30`
                }}
              >
                <div style={{ fontSize: 24, color: stat.color, marginBottom: 8 }}>
                  {stat.icon}
                </div>
                <Statistic 
                  value={stat.value}
                  valueStyle={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}
                />
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {stat.label}
                </Text>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Card>
    </motion.div>
  );

  // 渲染增强学习进度
  const renderEnhancedLearningProgress = () => (
    <motion.div variants={itemVariants}>
      <Card 
        title={
          <Space>
            <RocketOutlined style={{ color: theme.accent }} />
            <span style={{ color: theme.text }}>学习进度</span>
          </Space>
        }
        extra={
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            style={{ color: theme.textSecondary }}
          >
            查看详情
          </Button>
        }
        style={{ 
          background: theme.card,
          backdropFilter: 'blur(20px)',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderRadius: 16
        }}
        headStyle={{ 
          background: 'transparent',
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {userData.learningProgress.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              style={{
                padding: 16,
                background: `${item.color}10`,
                borderRadius: 12,
                border: `1px solid ${item.color}30`
              }}
            >
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col>
                  <Space>
                    <Text strong style={{ color: theme.text, fontSize: 16 }}>
                      {item.language}
                    </Text>
                    <Tag color={item.color} style={{ borderRadius: 8 }}>
                      {item.level}
                    </Tag>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                      连续 {item.streak} 天
                    </Text>
                    <Text strong style={{ color: item.color, fontSize: 16 }}>
                      {item.progress}%
                    </Text>
                  </Space>
                </Col>
              </Row>
              
              <Progress 
                percent={item.progress} 
                strokeColor={{
                  '0%': item.color,
                  '100%': '#ff6b6b'
                }}
                trailColor="rgba(255,255,255,0.1)"
                strokeWidth={8}
                showInfo={false}
              />
              
              <Row justify="space-between" style={{ marginTop: 8 }}>
                <Col>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                    总学习时长: {item.totalHours}h
                  </Text>
                </Col>
                <Col>
                  <Space size="small">
                    <Button size="small" type="text" icon={<BookOutlined />} />
                    <Button size="small" type="text" icon={<SoundOutlined />} />
                    <Button size="small" type="text" icon={<VideoCameraOutlined />} />
                  </Space>
                </Col>
              </Row>
            </motion.div>
          ))}
        </Space>
      </Card>
    </motion.div>
  );

  return (
    <div 
      className="ultra-modern-dashboard"
      style={{
        background: theme.background,
        minHeight: '100vh',
        color: theme.text
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: 24 }}
      >
        {/* 顶部控制栏 */}
        <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="large">
                <Title level={2} style={{ color: theme.text, margin: 0 }}>
                  CultureBridge Pro
                </Title>
                <Select
                  value={currentTheme}
                  onChange={setCurrentTheme}
                  style={{ width: 120 }}
                  size="large"
                >
                  <Option value="neon">霓虹</Option>
                  <Option value="cyberpunk">赛博朋克</Option>
                  <Option value="aurora">极光</Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button 
                  icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  style={{ 
                    background: theme.card,
                    border: 'none',
                    color: theme.text
                  }}
                />
                <Button 
                  icon={<SettingOutlined />}
                  style={{ 
                    background: theme.card,
                    border: 'none',
                    color: theme.text
                  }}
                />
                <Badge count={5}>
                  <Button 
                    icon={<BellOutlined />}
                    style={{ 
                      background: theme.card,
                      border: 'none',
                      color: theme.text
                    }}
                  />
                </Badge>
              </Space>
            </Col>
          </Row>
        </motion.div>

        {/* 主要内容区域 */}
        <Row gutter={[24, 24]}>
          {/* 左侧栏 */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {renderUltraUserCard()}
              {renderRealTimeStats()}
            </Space>
          </Col>

          {/* 中间栏 */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {renderEnhancedLearningProgress()}
              
              {/* 成就展示区 */}
              <motion.div variants={itemVariants}>
                <Card 
                  title={
                    <Space>
                      <TrophyOutlined style={{ color: theme.accent }} />
                      <span style={{ color: theme.text }}>成就收藏</span>
                    </Space>
                  }
                  style={{ 
                    background: theme.card,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    borderRadius: 16
                  }}
                  headStyle={{ 
                    background: 'transparent',
                    borderBottom: `1px solid rgba(255, 255, 255, 0.1)`
                  }}
                >
                  <Row gutter={[12, 12]}>
                    {userData.achievements.map((achievement, index) => (
                      <Col xs={8} sm={6} key={achievement.id}>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Card 
                            size="small"
                            style={{ 
                              textAlign: 'center',
                              background: achievement.earned 
                                ? `${achievement.color}20`
                                : 'rgba(255,255,255,0.05)',
                              border: achievement.earned 
                                ? `2px solid ${achievement.color}`
                                : '2px solid rgba(255,255,255,0.1)',
                              borderRadius: 12,
                              opacity: achievement.earned ? 1 : 0.5,
                              cursor: 'pointer',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            bodyStyle={{ padding: 8 }}
                          >
                            {achievement.rarity === 'legendary' && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                                width: 0,
                                height: 0,
                                borderLeft: '20px solid transparent',
                                borderTop: '20px solid #ffd700'
                              }} />
                            )}
                            <div style={{ fontSize: 24, marginBottom: 4 }}>
                              {achievement.icon}
                            </div>
                            <Text style={{ 
                              fontSize: 10, 
                              color: theme.text,
                              fontWeight: achievement.earned ? 'bold' : 'normal'
                            }}>
                              {achievement.name}
                            </Text>
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </motion.div>
            </Space>
          </Col>

          {/* 右侧栏 */}
          <Col xs={24} lg={6}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 个人统计 */}
              <motion.div variants={itemVariants}>
                <Card 
                  title={
                    <Space>
                      <BarChartOutlined style={{ color: theme.accent }} />
                      <span style={{ color: theme.text }}>个人统计</span>
                    </Space>
                  }
                  style={{ 
                    background: theme.card,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    borderRadius: 16
                  }}
                  headStyle={{ 
                    background: 'transparent',
                    borderBottom: `1px solid rgba(255, 255, 255, 0.1)`
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {[
                      { label: '翻译准确率', value: userData.stats.translationAccuracy, suffix: '%', color: '#52c41a' },
                      { label: '文化评分', value: userData.stats.culturalScore, suffix: '/10', color: '#1890ff' },
                      { label: '友谊指数', value: userData.stats.friendshipIndex, suffix: '/10', color: '#eb2f96' },
                    ].map((stat, index) => (
                      <div key={index}>
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                              {stat.label}
                            </Text>
                          </Col>
                          <Col>
                            <Text strong style={{ color: stat.color }}>
                              {stat.value}{stat.suffix}
                            </Text>
                          </Col>
                        </Row>
                        <Progress 
                          percent={stat.value * 10} 
                          strokeColor={stat.color}
                          trailColor="rgba(255,255,255,0.1)"
                          strokeWidth={6}
                          showInfo={false}
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    ))}
                  </Space>
                </Card>
              </motion.div>

              {/* 最近活动 */}
              <motion.div variants={itemVariants}>
                <Card 
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: theme.accent }} />
                      <span style={{ color: theme.text }}>最近活动</span>
                    </Space>
                  }
                  style={{ 
                    background: theme.card,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    borderRadius: 16
                  }}
                  headStyle={{ 
                    background: 'transparent',
                    borderBottom: `1px solid rgba(255, 255, 255, 0.1)`
                  }}
                >
                  <Timeline>
                    {userData.recentActivities.slice(0, 4).map((activity, index) => (
                      <Timeline.Item
                        key={index}
                        dot={
                          activity.type === 'post' ? <PictureOutlined style={{ color: '#1890ff' }} /> :
                          activity.type === 'comment' ? <CommentOutlined style={{ color: '#52c41a' }} /> :
                          activity.type === 'achievement' ? <TrophyOutlined style={{ color: '#fa8c16' }} /> :
                          activity.type === 'learning' ? <BookOutlined style={{ color: '#722ed1' }} /> :
                          <MessageOutlined style={{ color: '#eb2f96' }} />
                        }
                      >
                        <Space direction="vertical" size={0}>
                          <Text style={{ color: theme.text, fontSize: 12 }}>
                            {activity.content}
                          </Text>
                          <Space>
                            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                              {activity.time}
                            </Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                              <HeartOutlined /> {activity.likes}
                            </Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                              <EyeOutlined /> {activity.views}
                            </Text>
                          </Space>
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </motion.div>
            </Space>
          </Col>
        </Row>

        {/* 浮动操作按钮 */}
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ right: 24 }}
          icon={<PlusOutlined />}
        >
          <FloatButton 
            icon={<MessageOutlined />} 
            tooltip="开始聊天"
          />
          <FloatButton 
            icon={<CameraOutlined />} 
            tooltip="分享动态"
          />
          <FloatButton 
            icon={<BookOutlined />} 
            tooltip="学习语言"
          />
          <FloatButton 
            icon={<CalendarOutlined />} 
            tooltip="文化活动"
          />
        </FloatButton.Group>

        {/* 返回顶部 */}
        <BackTop style={{ right: 100 }} />
      </motion.div>
    </div>
  );
};

export default UltraModernDashboard;

