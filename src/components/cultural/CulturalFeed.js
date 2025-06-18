import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  Avatar, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Image, 
  Divider,
  Tooltip,
  Badge,
  Rate,
  Progress,
  Statistic,
  Input,
  Select,
  Tabs,
  List,
  Empty,
  Skeleton,
  notification
} from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ShareAltOutlined,
  BookmarkOutlined,
  BookmarkFilled,
  EyeOutlined,
  FireOutlined,
  TrophyOutlined,
  GlobalOutlined,
  TranslationOutlined,
  SoundOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  GiftOutlined,
  StarOutlined,
  CommentOutlined,
  SendOutlined,
  MoreOutlined,
  FilterOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  DiamondOutlined
} from '@ant-design/icons';
import './CulturalFeed.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 模拟文化内容数据
const mockCulturalPosts = [
  {
    id: 1,
    author: {
      id: 'user_001',
      username: '京都茶道师',
      avatar: '/api/placeholder/40/40',
      level: 15,
      verified: true,
      culturalBackground: '日本',
      followers: 2340,
      cbtEarned: 1250
    },
    content: {
      type: 'cultural_experience',
      title: '千年茶道的现代传承',
      description: '在京都金阁寺附近的百年茶室，体验了正宗的日式茶道。每一个动作都蕴含着对自然和生活的敬畏，这不仅仅是喝茶，更是一种生活哲学的体现。',
      images: [
        '/api/placeholder/400/300',
        '/api/placeholder/400/300',
        '/api/placeholder/400/300'
      ],
      videos: [],
      audio: '/api/placeholder/audio/tea-ceremony.mp3',
      location: '京都·金阁寺',
      culturalTags: ['茶道', '日本文化', '传统艺术', '禅意生活'],
      languageTags: ['日语', '中文'],
      difficulty: 'intermediate',
      learningValue: 85
    },
    engagement: {
      likes: 1234,
      comments: 89,
      shares: 45,
      bookmarks: 156,
      views: 5678,
      cbtRewards: 25
    },
    timestamp: '2024-01-15T10:30:00Z',
    featured: true,
    trending: true,
    aiInsights: {
      culturalContext: '茶道是日本传统文化的重要组成部分，体现了和、敬、清、寂的精神',
      languageLearning: '包含茶道相关的日语词汇和表达方式',
      crossCultural: '展示了东方文化中的美学和哲学思想'
    }
  },
  {
    id: 2,
    author: {
      id: 'user_002',
      username: '巴黎美食探索者',
      avatar: '/api/placeholder/40/40',
      level: 12,
      verified: false,
      culturalBackground: '法国',
      followers: 890,
      cbtEarned: 680
    },
    content: {
      type: 'food_culture',
      title: '蒙马特高地的百年面包房',
      description: '发现了一家传承四代的法式面包房，他们的可颂酥脆香甜，每一口都是法式慢生活的精髓。老板还教了我几句地道的法语表达。',
      images: [
        '/api/placeholder/400/300',
        '/api/placeholder/400/300'
      ],
      videos: ['/api/placeholder/video/bakery.mp4'],
      audio: null,
      location: '巴黎·蒙马特',
      culturalTags: ['法式美食', '面包文化', '慢生活', '家族传承'],
      languageTags: ['法语', '中文'],
      difficulty: 'beginner',
      learningValue: 72
    },
    engagement: {
      likes: 567,
      comments: 34,
      shares: 12,
      bookmarks: 78,
      views: 2340,
      cbtRewards: 15
    },
    timestamp: '2024-01-14T15:45:00Z',
    featured: false,
    trending: true,
    aiInsights: {
      culturalContext: '法式面包文化体现了法国人对传统工艺和生活品质的追求',
      languageLearning: '学习法语中关于食物和日常生活的表达',
      crossCultural: '对比不同文化中的面包制作工艺和饮食习惯'
    }
  },
  {
    id: 3,
    author: {
      id: 'user_003',
      username: '弗拉明戈舞者',
      avatar: '/api/placeholder/40/40',
      level: 18,
      verified: true,
      culturalBackground: '西班牙',
      followers: 3456,
      cbtEarned: 2100
    },
    content: {
      type: 'performing_arts',
      title: '安达卢西亚的激情舞蹈',
      description: '弗拉明戈不仅仅是舞蹈，它是安达卢西亚人民情感的表达，每一个转身都诉说着历史的故事。今晚在塞维利亚的表演让我重新理解了这门艺术。',
      images: [
        '/api/placeholder/400/300'
      ],
      videos: ['/api/placeholder/video/flamenco.mp4'],
      audio: '/api/placeholder/audio/flamenco-music.mp3',
      location: '塞维利亚·弗拉明戈剧院',
      culturalTags: ['弗拉明戈', '西班牙文化', '舞蹈艺术', '情感表达'],
      languageTags: ['西班牙语', '中文'],
      difficulty: 'advanced',
      learningValue: 92
    },
    engagement: {
      likes: 2345,
      comments: 156,
      shares: 89,
      bookmarks: 234,
      views: 8901,
      cbtRewards: 35
    },
    timestamp: '2024-01-13T20:15:00Z',
    featured: true,
    trending: false,
    aiInsights: {
      culturalContext: '弗拉明戈是西班牙安达卢西亚地区的传统艺术形式，融合了多种文化元素',
      languageLearning: '学习西班牙语中关于艺术、情感和文化的表达',
      crossCultural: '探索舞蹈作为跨文化交流媒介的重要作用'
    }
  }
];

// 文化内容推荐算法
class CulturalRecommendationEngine {
  constructor() {
    this.userPreferences = this.loadUserPreferences();
    this.interactionHistory = this.loadInteractionHistory();
  }

  loadUserPreferences() {
    return JSON.parse(localStorage.getItem('user_preferences') || JSON.stringify({
      culturalInterests: ['日本文化', '法式美食', '西班牙艺术'],
      languageGoals: ['日语', '法语', '西班牙语'],
      contentTypes: ['cultural_experience', 'food_culture', 'performing_arts'],
      difficultyLevel: 'intermediate',
      engagementStyle: 'visual_learner'
    }));
  }

  loadInteractionHistory() {
    return JSON.parse(localStorage.getItem('interaction_history') || '[]');
  }

  calculateRecommendationScore(post, userProfile) {
    let score = 0;
    
    // 文化兴趣匹配 (30%)
    const culturalMatch = post.content.culturalTags.some(tag => 
      this.userPreferences.culturalInterests.includes(tag)
    );
    if (culturalMatch) score += 30;
    
    // 语言学习目标匹配 (25%)
    const languageMatch = post.content.languageTags.some(lang => 
      this.userPreferences.languageGoals.includes(lang)
    );
    if (languageMatch) score += 25;
    
    // 内容类型偏好 (20%)
    if (this.userPreferences.contentTypes.includes(post.content.type)) {
      score += 20;
    }
    
    // 学习价值 (15%)
    score += (post.content.learningValue / 100) * 15;
    
    // 社区热度 (10%)
    const engagementRate = (post.engagement.likes + post.engagement.comments) / post.engagement.views;
    score += Math.min(engagementRate * 100, 10);
    
    // 新鲜度调整
    const daysSincePost = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePost < 1) score *= 1.2; // 新内容加权
    else if (daysSincePost > 7) score *= 0.8; // 旧内容降权
    
    return Math.round(score);
  }

  getRecommendedPosts(posts, limit = 10) {
    const scoredPosts = posts.map(post => ({
      ...post,
      recommendationScore: this.calculateRecommendationScore(post)
    }));
    
    return scoredPosts
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }

  updateUserPreferences(interaction) {
    // 基于用户交互更新偏好
    this.interactionHistory.push({
      ...interaction,
      timestamp: Date.now()
    });
    
    // 保存到本地存储
    localStorage.setItem('interaction_history', JSON.stringify(this.interactionHistory));
    
    // 重新计算偏好权重
    this.recalculatePreferences();
  }

  recalculatePreferences() {
    // 基于最近的交互历史重新计算用户偏好
    const recentInteractions = this.interactionHistory.slice(-50); // 最近50次交互
    
    // 分析文化兴趣趋势
    const culturalInterests = {};
    const languageGoals = {};
    const contentTypes = {};
    
    recentInteractions.forEach(interaction => {
      if (interaction.type === 'like' || interaction.type === 'bookmark') {
        // 正面交互增加权重
        interaction.culturalTags?.forEach(tag => {
          culturalInterests[tag] = (culturalInterests[tag] || 0) + 2;
        });
        interaction.languageTags?.forEach(lang => {
          languageGoals[lang] = (languageGoals[lang] || 0) + 2;
        });
        if (interaction.contentType) {
          contentTypes[interaction.contentType] = (contentTypes[interaction.contentType] || 0) + 2;
        }
      } else if (interaction.type === 'skip' || interaction.type === 'hide') {
        // 负面交互减少权重
        interaction.culturalTags?.forEach(tag => {
          culturalInterests[tag] = (culturalInterests[tag] || 0) - 1;
        });
      }
    });
    
    // 更新偏好设置
    this.userPreferences = {
      ...this.userPreferences,
      culturalInterests: Object.keys(culturalInterests)
        .sort((a, b) => culturalInterests[b] - culturalInterests[a])
        .slice(0, 10),
      languageGoals: Object.keys(languageGoals)
        .sort((a, b) => languageGoals[b] - languageGoals[a])
        .slice(0, 5),
      contentTypes: Object.keys(contentTypes)
        .sort((a, b) => contentTypes[b] - contentTypes[a])
        .slice(0, 5)
    };
    
    localStorage.setItem('user_preferences', JSON.stringify(this.userPreferences));
  }
}

// 内容互动组件
const ContentInteractionBar = ({ post, onInteraction }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = useCallback(() => {
    setLiked(!liked);
    onInteraction({
      type: liked ? 'unlike' : 'like',
      postId: post.id,
      culturalTags: post.content.culturalTags,
      languageTags: post.content.languageTags,
      contentType: post.content.type
    });
  }, [liked, post, onInteraction]);

  const handleBookmark = useCallback(() => {
    setBookmarked(!bookmarked);
    onInteraction({
      type: bookmarked ? 'unbookmark' : 'bookmark',
      postId: post.id,
      culturalTags: post.content.culturalTags,
      languageTags: post.content.languageTags,
      contentType: post.content.type
    });
  }, [bookmarked, post, onInteraction]);

  const handleShare = useCallback(() => {
    onInteraction({
      type: 'share',
      postId: post.id,
      culturalTags: post.content.culturalTags,
      languageTags: post.content.languageTags,
      contentType: post.content.type
    });
    
    // 实际分享逻辑
    if (navigator.share) {
      navigator.share({
        title: post.content.title,
        text: post.content.description,
        url: window.location.href
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(window.location.href);
      notification.success({
        message: '链接已复制到剪贴板',
        duration: 2
      });
    }
  }, [post, onInteraction]);

  return (
    <div className="content-interaction-bar">
      <Row justify="space-between" align="middle">
        <Col>
          <Space size="large">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                type="text"
                icon={liked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={handleLike}
                className="interaction-button"
              >
                {post.engagement.likes + (liked ? 1 : 0)}
              </Button>
            </motion.div>
            
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => setShowComments(!showComments)}
                className="interaction-button"
              >
                {post.engagement.comments}
              </Button>
            </motion.div>
            
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                className="interaction-button"
              >
                {post.engagement.shares}
              </Button>
            </motion.div>
          </Space>
        </Col>
        
        <Col>
          <Space>
            <Tooltip title="CBT奖励">
              <Badge count={post.engagement.cbtRewards} showZero>
                <ThunderboltOutlined style={{ color: '#faad14', fontSize: 16 }} />
              </Badge>
            </Tooltip>
            
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                type="text"
                icon={bookmarked ? <BookmarkFilled style={{ color: '#1890ff' }} /> : <BookmarkOutlined />}
                onClick={handleBookmark}
                className="interaction-button"
              />
            </motion.div>
          </Space>
        </Col>
      </Row>
      
      {showComments && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="comments-section"
        >
          <Divider style={{ margin: '12px 0' }} />
          <Input.TextArea
            placeholder="分享你的文化见解..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            suffix={
              <Button type="link" icon={<SendOutlined />} size="small">
                发送
              </Button>
            }
          />
        </motion.div>
      )}
    </div>
  );
};

// 文化内容卡片组件
const CulturalPostCard = ({ post, onInteraction }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#52c41a',
      intermediate: '#faad14',
      advanced: '#f5222d'
    };
    return colors[difficulty] || '#d9d9d9';
  };

  const getContentTypeIcon = (type) => {
    const icons = {
      cultural_experience: <GlobalOutlined />,
      food_culture: <CameraOutlined />,
      performing_arts: <VideoCameraOutlined />,
      language_learning: <TranslationOutlined />,
      traditional_craft: <StarOutlined />
    };
    return icons[type] || <GlobalOutlined />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="cultural-post-card"
    >
      <Card
        className="enhanced-cultural-card"
        cover={
          post.content.images.length > 0 && (
            <div className="post-media-container">
              <Image.PreviewGroup>
                <Image
                  src={post.content.images[0]}
                  alt={post.content.title}
                  className="post-cover-image"
                  onLoad={() => setImageLoaded(true)}
                  placeholder={<Skeleton.Image style={{ width: '100%', height: 200 }} />}
                />
              </Image.PreviewGroup>
              
              {post.featured && (
                <div className="featured-badge">
                  <CrownOutlined style={{ color: '#faad14' }} />
                  <Text style={{ color: '#faad14', fontSize: 12, marginLeft: 4 }}>
                    精选
                  </Text>
                </div>
              )}
              
              {post.trending && (
                <div className="trending-badge">
                  <FireOutlined style={{ color: '#ff4d4f' }} />
                  <Text style={{ color: '#ff4d4f', fontSize: 12, marginLeft: 4 }}>
                    热门
                  </Text>
                </div>
              )}
            </div>
          )
        }
      >
        {/* 作者信息 */}
        <div className="post-author-info">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Avatar src={post.author.avatar} size="small">
                  {post.author.username[0]}
                </Avatar>
                <div>
                  <Space>
                    <Text strong style={{ fontSize: 14 }}>
                      {post.author.username}
                    </Text>
                    {post.author.verified && (
                      <DiamondOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                    )}
                  </Space>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Lv.{post.author.level} • {post.author.culturalBackground}
                    </Text>
                  </div>
                </div>
              </Space>
            </Col>
            <Col>
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Col>
          </Row>
        </div>

        {/* 内容信息 */}
        <div className="post-content-info">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div className="post-header">
              <Space>
                {getContentTypeIcon(post.content.type)}
                <Title level={5} style={{ margin: 0 }}>
                  {post.content.title}
                </Title>
              </Space>
            </div>
            
            <Paragraph 
              ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
              style={{ margin: 0 }}
            >
              {post.content.description}
            </Paragraph>
            
            {/* 位置信息 */}
            {post.content.location && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                📍 {post.content.location}
              </Text>
            )}
          </Space>
        </div>

        {/* 标签和学习信息 */}
        <div className="post-tags-section">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div className="cultural-tags">
              <Space wrap>
                {post.content.culturalTags.map(tag => (
                  <Tag key={tag} color="blue" size="small">
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
            
            <div className="language-tags">
              <Space wrap>
                {post.content.languageTags.map(lang => (
                  <Tag key={lang} color="green" size="small">
                    <TranslationOutlined style={{ marginRight: 2 }} />
                    {lang}
                  </Tag>
                ))}
              </Space>
            </div>
            
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Text style={{ fontSize: 12 }}>学习价值:</Text>
                  <Progress
                    percent={post.content.learningValue}
                    size="small"
                    style={{ width: 60 }}
                    showInfo={false}
                  />
                  <Text style={{ fontSize: 12, color: getDifficultyColor(post.content.difficulty) }}>
                    {post.content.difficulty}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <EyeOutlined style={{ fontSize: 12 }} />
                  <Text style={{ fontSize: 12 }}>{post.engagement.views}</Text>
                </Space>
              </Col>
            </Row>
          </Space>
        </div>

        {/* AI洞察 */}
        {post.aiInsights && (
          <div className="ai-insights-section">
            <Divider style={{ margin: '12px 0' }} />
            <div className="ai-insights">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 12, color: '#722ed1' }}>
                  🤖 AI文化洞察
                </Text>
                <Text style={{ fontSize: 12 }}>
                  {post.aiInsights.culturalContext}
                </Text>
              </Space>
            </div>
          </div>
        )}

        {/* 互动栏 */}
        <ContentInteractionBar post={post} onInteraction={onInteraction} />
      </Card>
    </motion.div>
  );
};

// 主要的文化动态组件
const CulturalFeed = () => {
  const [posts, setPosts] = useState(mockCulturalPosts);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCulture, setSelectedCulture] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  
  const recommendationEngine = useMemo(() => new CulturalRecommendationEngine(), []);

  // 处理用户交互
  const handleInteraction = useCallback((interaction) => {
    recommendationEngine.updateUserPreferences(interaction);
    
    // 更新帖子的互动数据
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === interaction.postId) {
        const updatedPost = { ...post };
        switch (interaction.type) {
          case 'like':
            updatedPost.engagement.likes += 1;
            break;
          case 'unlike':
            updatedPost.engagement.likes -= 1;
            break;
          case 'bookmark':
            updatedPost.engagement.bookmarks += 1;
            break;
          case 'unbookmark':
            updatedPost.engagement.bookmarks -= 1;
            break;
          case 'share':
            updatedPost.engagement.shares += 1;
            break;
        }
        return updatedPost;
      }
      return post;
    }));
  }, [recommendationEngine]);

  // 获取推荐内容
  const getFilteredPosts = useMemo(() => {
    let filteredPosts = [...posts];

    // 搜索过滤
    if (searchQuery) {
      filteredPosts = filteredPosts.filter(post =>
        post.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.culturalTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 文化背景过滤
    if (selectedCulture !== 'all') {
      filteredPosts = filteredPosts.filter(post =>
        post.author.culturalBackground === selectedCulture ||
        post.content.culturalTags.includes(selectedCulture)
      );
    }

    // 语言过滤
    if (selectedLanguage !== 'all') {
      filteredPosts = filteredPosts.filter(post =>
        post.content.languageTags.includes(selectedLanguage)
      );
    }

    // 排序
    switch (sortBy) {
      case 'recommended':
        return recommendationEngine.getRecommendedPosts(filteredPosts);
      case 'trending':
        return filteredPosts.sort((a, b) => b.engagement.likes - a.engagement.likes);
      case 'latest':
        return filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      case 'learning_value':
        return filteredPosts.sort((a, b) => b.content.learningValue - a.content.learningValue);
      default:
        return filteredPosts;
    }
  }, [posts, searchQuery, selectedCulture, selectedLanguage, sortBy, recommendationEngine]);

  return (
    <div className="cultural-feed-container">
      {/* 搜索和过滤栏 */}
      <div className="feed-controls">
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="搜索文化内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
            
            <Col xs={12} sm={6} md={4}>
              <Select
                value={selectedCulture}
                onChange={setSelectedCulture}
                style={{ width: '100%' }}
                placeholder="选择文化"
              >
                <Option value="all">所有文化</Option>
                <Option value="日本">日本文化</Option>
                <Option value="法国">法国文化</Option>
                <Option value="西班牙">西班牙文化</Option>
                <Option value="中国">中国文化</Option>
              </Select>
            </Col>
            
            <Col xs={12} sm={6} md={4}>
              <Select
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                style={{ width: '100%' }}
                placeholder="选择语言"
              >
                <Option value="all">所有语言</Option>
                <Option value="中文">中文</Option>
                <Option value="日语">日语</Option>
                <Option value="法语">法语</Option>
                <Option value="西班牙语">西班牙语</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
                placeholder="排序方式"
              >
                <Option value="recommended">智能推荐</Option>
                <Option value="trending">热门内容</Option>
                <Option value="latest">最新发布</Option>
                <Option value="learning_value">学习价值</Option>
              </Select>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 内容标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="feed-tabs">
        <TabPane tab="推荐" key="recommended">
          <div className="posts-grid">
            {loading ? (
              <div className="loading-skeleton">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} style={{ marginBottom: 16 }}>
                    <Skeleton avatar paragraph={{ rows: 4 }} />
                  </Card>
                ))}
              </div>
            ) : getFilteredPosts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {getFilteredPosts.map(post => (
                  <Col xs={24} sm={24} md={12} lg={8} xl={8} key={post.id}>
                    <CulturalPostCard
                      post={post}
                      onInteraction={handleInteraction}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="暂无符合条件的文化内容"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </TabPane>
        
        <TabPane tab="关注" key="following">
          <Empty
            description="关注更多文化创作者来查看他们的内容"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </TabPane>
        
        <TabPane tab="收藏" key="bookmarked">
          <Empty
            description="收藏的文化内容将在这里显示"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CulturalFeed;

