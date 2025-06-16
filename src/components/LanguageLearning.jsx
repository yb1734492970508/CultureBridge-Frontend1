import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Progress,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Badge,
  Statistic,
  List,
  Tag,
  Modal,
  Input,
  Select,
  Rate,
  Tooltip,
  Divider,
  Alert
} from 'antd';
import {
  BookOutlined,
  SoundOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  StarOutlined,
  HeartOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 模拟学习数据
const mockLearningData = {
  currentStreak: 15,
  totalXP: 2850,
  level: 12,
  nextLevelXP: 3000,
  completedLessons: 45,
  totalLessons: 120,
  languages: [
    {
      code: 'ja',
      name: '日语',
      flag: '🇯🇵',
      level: 'N3',
      progress: 75,
      xp: 1200,
      streak: 15,
      lessons: [
        { id: 1, title: '基础问候语', type: 'vocabulary', completed: true, xp: 50 },
        { id: 2, title: '数字与时间', type: 'grammar', completed: true, xp: 75 },
        { id: 3, title: '日常对话', type: 'conversation', completed: false, xp: 100 },
        { id: 4, title: '发音练习', type: 'pronunciation', completed: false, xp: 60 }
      ]
    },
    {
      code: 'fr',
      name: '法语',
      flag: '🇫🇷',
      level: 'A2',
      progress: 45,
      xp: 800,
      streak: 8,
      lessons: [
        { id: 5, title: '法语字母', type: 'vocabulary', completed: true, xp: 40 },
        { id: 6, title: '动词变位', type: 'grammar', completed: false, xp: 80 },
        { id: 7, title: '购物对话', type: 'conversation', completed: false, xp: 90 }
      ]
    }
  ]
};

const mockVocabulary = [
  { word: 'こんにちは', pronunciation: 'konnichiwa', meaning: '你好', language: 'ja', mastery: 90 },
  { word: 'ありがとう', pronunciation: 'arigatou', meaning: '谢谢', language: 'ja', mastery: 85 },
  { word: 'すみません', pronunciation: 'sumimasen', meaning: '对不起', language: 'ja', mastery: 70 },
  { word: 'bonjour', pronunciation: 'bon-ZHOOR', meaning: '你好', language: 'fr', mastery: 80 },
  { word: 'merci', pronunciation: 'mer-SEE', meaning: '谢谢', language: 'fr', mastery: 95 }
];

const mockCulturalContent = [
  {
    id: 1,
    title: '日本茶道文化体验',
    author: '文化导师小田',
    avatar: '/api/placeholder/40/40',
    type: 'experience',
    difficulty: '中级',
    duration: '45分钟',
    participants: 128,
    rating: 4.8,
    description: '深入了解日本茶道的历史、哲学和实践，体验正宗的茶道仪式...',
    tags: ['日本文化', '茶道', '传统艺术'],
    image: '/api/placeholder/300/200',
    price: 50, // CBT
    enrolled: false
  },
  {
    id: 2,
    title: '法国料理制作工坊',
    author: '巴黎主厨Pierre',
    avatar: '/api/placeholder/40/40',
    type: 'workshop',
    difficulty: '初级',
    duration: '90分钟',
    participants: 89,
    rating: 4.9,
    description: '学习制作经典法式甜点，了解法国饮食文化的精髓...',
    tags: ['法国文化', '料理', '美食'],
    image: '/api/placeholder/300/200',
    price: 75, // CBT
    enrolled: true
  }
];

const LanguageLearning = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLanguage, setSelectedLanguage] = useState('ja');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // 渲染学习概览
  const renderOverview = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Row gutter={[24, 24]}>
        {/* 学习统计 */}
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants}>
            <Card className="stats-card">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
                    <FireOutlined style={{ fontSize: 32 }} />
                  </Avatar>
                  <Title level={4} style={{ margin: '12px 0 0' }}>
                    连续学习 {mockLearningData.currentStreak} 天
                  </Title>
                  <Text type="secondary">保持学习热情！</Text>
                </div>
                
                <Divider />
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="总经验值"
                      value={mockLearningData.totalXP}
                      prefix={<StarOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="当前等级"
                      value={mockLearningData.level}
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
                
                <div>
                  <Text strong>升级进度</Text>
                  <Progress
                    percent={(mockLearningData.totalXP / mockLearningData.nextLevelXP) * 100}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    style={{ marginTop: 8 }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {mockLearningData.totalXP}/{mockLearningData.nextLevelXP} XP
                  </Text>
                </div>
              </Space>
            </Card>
          </motion.div>
        </Col>

        {/* 语言进度 */}
        <Col xs={24} lg={16}>
          <motion.div variants={itemVariants}>
            <Card title="学习进度" className="language-progress-card">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {mockLearningData.languages.map((lang, index) => (
                  <motion.div
                    key={lang.code}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: 16,
                      border: '1px solid #f0f0f0',
                      borderRadius: 12,
                      background: selectedLanguage === lang.code ? '#f6ffed' : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <Row align="middle" gutter={16}>
                      <Col>
                        <div style={{ fontSize: 32 }}>{lang.flag}</div>
                      </Col>
                      <Col flex={1}>
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Title level={5} style={{ margin: 0 }}>
                              {lang.name}
                            </Title>
                            <Space>
                              <Tag color="blue">{lang.level}</Tag>
                              <Text type="secondary">
                                <FireOutlined /> {lang.streak} 天连续
                              </Text>
                            </Space>
                          </Col>
                          <Col>
                            <Text strong style={{ fontSize: 16, color: '#faad14' }}>
                              {lang.xp} XP
                            </Text>
                          </Col>
                        </Row>
                        <Progress
                          percent={lang.progress}
                          strokeColor="#52c41a"
                          style={{ marginTop: 8 }}
                        />
                      </Col>
                    </Row>
                  </motion.div>
                ))}
              </Space>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );

  // 渲染课程列表
  const renderLessons = () => {
    const currentLang = mockLearningData.languages.find(lang => lang.code === selectedLanguage);
    
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <motion.div variants={itemVariants}>
              <Card 
                title={`${currentLang?.name} 课程`}
                extra={
                  <Select value={selectedLanguage} onChange={setSelectedLanguage} style={{ width: 120 }}>
                    {mockLearningData.languages.map(lang => (
                      <Option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </Option>
                    ))}
                  </Select>
                }
              >
                <List
                  dataSource={currentLang?.lessons || []}
                  renderItem={(lesson) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <List.Item
                        style={{
                          padding: 16,
                          margin: '8px 0',
                          border: '1px solid #f0f0f0',
                          borderRadius: 12,
                          background: lesson.completed ? '#f6ffed' : 'white',
                          cursor: 'pointer'
                        }}
                        onClick={() => setCurrentLesson(lesson)}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              style={{
                                backgroundColor: lesson.completed ? '#52c41a' : '#1890ff'
                              }}
                              icon={
                                lesson.completed ? <CheckCircleOutlined /> : 
                                lesson.type === 'vocabulary' ? <BookOutlined /> :
                                lesson.type === 'grammar' ? <BookOutlined /> :
                                lesson.type === 'conversation' ? <MessageOutlined /> :
                                <SoundOutlined />
                              }
                            />
                          }
                          title={
                            <Space>
                              <Text strong>{lesson.title}</Text>
                              {lesson.completed && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            </Space>
                          }
                          description={
                            <Space>
                              <Tag color={
                                lesson.type === 'vocabulary' ? 'blue' :
                                lesson.type === 'grammar' ? 'green' :
                                lesson.type === 'conversation' ? 'orange' : 'purple'
                              }>
                                {lesson.type === 'vocabulary' ? '词汇' :
                                 lesson.type === 'grammar' ? '语法' :
                                 lesson.type === 'conversation' ? '对话' : '发音'}
                              </Tag>
                              <Text type="secondary">+{lesson.xp} XP</Text>
                            </Space>
                          }
                        />
                        <Button
                          type={lesson.completed ? "default" : "primary"}
                          icon={lesson.completed ? <ReloadOutlined /> : <PlayCircleOutlined />}
                        >
                          {lesson.completed ? '复习' : '开始'}
                        </Button>
                      </List.Item>
                    </motion.div>
                  )}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} lg={8}>
            <motion.div variants={itemVariants}>
              <Card title="今日目标" className="daily-goals-card">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <Row justify="space-between">
                      <Text>完成 2 个课程</Text>
                      <Text strong>1/2</Text>
                    </Row>
                    <Progress percent={50} strokeColor="#1890ff" />
                  </div>
                  
                  <div>
                    <Row justify="space-between">
                      <Text>学习 20 个新单词</Text>
                      <Text strong>15/20</Text>
                    </Row>
                    <Progress percent={75} strokeColor="#52c41a" />
                  </div>
                  
                  <div>
                    <Row justify="space-between">
                      <Text>练习口语 10 分钟</Text>
                      <Text strong>6/10</Text>
                    </Row>
                    <Progress percent={60} strokeColor="#faad14" />
                  </div>
                </Space>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
              <Card title="词汇复习" extra={
                <Button size="small" onClick={() => setShowVocabularyModal(true)}>
                  查看全部
                </Button>
              }>
                <List
                  size="small"
                  dataSource={mockVocabulary.slice(0, 3)}
                  renderItem={(word) => (
                    <List.Item>
                      <List.Item.Meta
                        title={<Text strong>{word.word}</Text>}
                        description={
                          <div>
                            <Text type="secondary">{word.pronunciation}</Text>
                            <br />
                            <Text>{word.meaning}</Text>
                          </div>
                        }
                      />
                      <Progress
                        type="circle"
                        size={40}
                        percent={word.mastery}
                        strokeColor="#52c41a"
                        format={() => `${word.mastery}%`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    );
  };

  // 渲染文化交流
  const renderCulturalExchange = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <motion.div variants={itemVariants}>
            <Alert
              message="文化交流活动"
              description="参与文化交流活动，不仅能学习语言，还能深入了解不同文化的精髓，获得CBT奖励！"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          </motion.div>
        </Col>

        {mockCulturalContent.map((content, index) => (
          <Col xs={24} lg={12} key={content.id}>
            <motion.div variants={itemVariants}>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative' }}>
                    <img
                      alt={content.title}
                      src={content.image}
                      style={{ height: 200, objectFit: 'cover', width: '100%' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12
                    }}>
                      <ClockCircleOutlined /> {content.duration}
                    </div>
                  </div>
                }
                actions={[
                  <Tooltip title="点赞">
                    <HeartOutlined key="like" />
                  </Tooltip>,
                  <Tooltip title="评论">
                    <MessageOutlined key="comment" />
                  </Tooltip>,
                  <Tooltip title="收藏">
                    <StarOutlined key="star" />
                  </Tooltip>
                ]}
              >
                <Card.Meta
                  avatar={<Avatar src={content.avatar} />}
                  title={
                    <Space>
                      <Text strong>{content.title}</Text>
                      {content.enrolled && <Badge status="success" text="已报名" />}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">by {content.author}</Text>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {content.description}
                      </Paragraph>
                      <div>
                        {content.tags.map(tag => (
                          <Tag key={tag} color="blue" size="small">
                            {tag}
                          </Tag>
                        ))}
                      </div>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space>
                            <Rate disabled defaultValue={content.rating} allowHalf />
                            <Text type="secondary">({content.participants})</Text>
                          </Space>
                        </Col>
                        <Col>
                          <Space>
                            <Text strong style={{ color: '#faad14' }}>
                              {content.price} CBT
                            </Text>
                            <Button
                              type={content.enrolled ? "default" : "primary"}
                              size="small"
                            >
                              {content.enrolled ? '已报名' : '立即报名'}
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </Space>
                  }
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </motion.div>
  );

  return (
    <div className="language-learning-container">
      <Card style={{ margin: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane
            tab={
              <span>
                <TrophyOutlined />
                学习概览
              </span>
            }
            key="overview"
          >
            {renderOverview()}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <BookOutlined />
                课程学习
              </span>
            }
            key="lessons"
          >
            {renderLessons()}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <SoundOutlined />
                口语练习
              </span>
            }
            key="speaking"
          >
            <div style={{ textAlign: 'center', padding: 40 }}>
              <SoundOutlined style={{ fontSize: 64, color: '#1890ff' }} />
              <Title level={3}>口语练习</Title>
              <Paragraph>
                通过AI语音识别技术，练习发音和口语表达能力
              </Paragraph>
              <Button type="primary" size="large">
                开始练习
              </Button>
            </div>
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <FireOutlined />
                文化交流
              </span>
            }
            key="cultural"
          >
            {renderCulturalExchange()}
          </TabPane>
        </Tabs>
      </Card>

      {/* 词汇复习模态框 */}
      <Modal
        title="词汇复习"
        open={showVocabularyModal}
        onCancel={() => setShowVocabularyModal(false)}
        footer={null}
        width={800}
      >
        <List
          dataSource={mockVocabulary}
          renderItem={(word) => (
            <List.Item
              actions={[
                <Button size="small" icon={<SoundOutlined />}>
                  发音
                </Button>,
                <Progress
                  type="circle"
                  size={40}
                  percent={word.mastery}
                  strokeColor="#52c41a"
                />
              ]}
            >
              <List.Item.Meta
                title={<Text strong style={{ fontSize: 18 }}>{word.word}</Text>}
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {word.pronunciation}
                    </Text>
                    <br />
                    <Text style={{ fontSize: 16 }}>{word.meaning}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default LanguageLearning;

