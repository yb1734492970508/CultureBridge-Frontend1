import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  Button,
  Input,
  Select,
  Upload,
  Space,
  Row,
  Col,
  Typography,
  Tag,
  Progress,
  Steps,
  Form,
  Switch,
  Slider,
  Rate,
  message,
  Modal,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Spin
} from 'antd';
import {
  PlusOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  GlobalOutlined,
  TranslationOutlined,
  LocationOutlined,
  TagsOutlined,
  BookOutlined,
  StarOutlined,
  SendOutlined,
  SaveOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  MicrophoneOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CommentOutlined
} from '@ant-design/icons';
import './ContentCreator.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;
const { Dragger } = Upload;

// 内容类型配置
const CONTENT_TYPES = [
  {
    key: 'cultural_experience',
    label: '文化体验',
    icon: <GlobalOutlined />,
    description: '分享真实的文化体验和见解',
    cbtReward: 20,
    color: '#1890ff'
  },
  {
    key: 'food_culture',
    label: '美食文化',
    icon: <CameraOutlined />,
    description: '探索世界各地的美食文化',
    cbtReward: 15,
    color: '#52c41a'
  },
  {
    key: 'performing_arts',
    label: '表演艺术',
    icon: <VideoCameraOutlined />,
    description: '展示传统和现代表演艺术',
    cbtReward: 25,
    color: '#722ed1'
  },
  {
    key: 'language_learning',
    label: '语言学习',
    icon: <TranslationOutlined />,
    description: '分享语言学习技巧和经验',
    cbtReward: 18,
    color: '#fa8c16'
  },
  {
    key: 'traditional_craft',
    label: '传统工艺',
    icon: <StarOutlined />,
    description: '传承和展示传统手工艺',
    cbtReward: 22,
    color: '#eb2f96'
  }
];

// 文化标签选项
const CULTURAL_TAGS = [
  '日本文化', '中国文化', '韩国文化', '法国文化', '意大利文化', '西班牙文化',
  '德国文化', '英国文化', '美国文化', '印度文化', '泰国文化', '越南文化',
  '茶道', '书法', '绘画', '音乐', '舞蹈', '戏剧', '电影', '文学',
  '美食', '节日', '传统', '现代', '艺术', '手工艺', '建筑', '服饰',
  '哲学', '宗教', '历史', '民俗', '习俗', '礼仪', '庆典', '仪式'
];

// 语言选项
const LANGUAGE_OPTIONS = [
  '中文', '英语', '日语', '韩语', '法语', '德语', '西班牙语', '意大利语',
  '俄语', '阿拉伯语', '印地语', '泰语', '越南语', '葡萄牙语', '荷兰语'
];

// 难度等级
const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: '初级', color: '#52c41a', description: '适合初学者' },
  { value: 'intermediate', label: '中级', color: '#faad14', description: '需要一定基础' },
  { value: 'advanced', label: '高级', color: '#f5222d', description: '需要深入了解' }
];

// 语音录制组件
const VoiceRecorder = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      message.success('开始录音');
    } catch (error) {
      message.error('无法访问麦克风，请检查权限设置');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
      message.success('录音完成');
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="recorder-controls">
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <div className="recording-display">
            {isRecording && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="recording-indicator"
              >
                <div className="recording-dot" />
              </motion.div>
            )}
            <Text strong style={{ fontSize: 18 }}>
              {formatTime(recordingTime)}
            </Text>
          </div>
          
          <Space size="large">
            {!isRecording ? (
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<MicrophoneOutlined />}
                onClick={startRecording}
                disabled={disabled}
                className="record-button"
              />
            ) : (
              <>
                <Button
                  shape="circle"
                  size="large"
                  icon={isPaused ? <PlayCircleOutlined /> : <PauseOutlined />}
                  onClick={pauseRecording}
                  className="pause-button"
                />
                <Button
                  danger
                  shape="circle"
                  size="large"
                  icon={<StopOutlined />}
                  onClick={stopRecording}
                  className="stop-button"
                />
              </>
            )}
          </Space>
          
          {audioBlob && (
            <Button
              type="text"
              icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
              onClick={playAudio}
            >
              {isPlaying ? '暂停播放' : '播放录音'}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

// 内容预览组件
const ContentPreview = ({ contentData, onEdit }) => {
  const [previewMode, setPreviewMode] = useState('mobile');

  return (
    <div className="content-preview">
      <div className="preview-header">
        <Space>
          <Title level={4}>内容预览</Title>
          <Select
            value={previewMode}
            onChange={setPreviewMode}
            size="small"
            style={{ width: 100 }}
          >
            <Option value="mobile">手机</Option>
            <Option value="tablet">平板</Option>
            <Option value="desktop">桌面</Option>
          </Select>
        </Space>
        <Button type="link" icon={<EditOutlined />} onClick={onEdit}>
          编辑
        </Button>
      </div>
      
      <div className={`preview-container ${previewMode}`}>
        <Card className="preview-card">
          {/* 作者信息 */}
          <div className="preview-author">
            <Space>
              <div className="author-avatar">U</div>
              <div>
                <Text strong>当前用户</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  刚刚发布
                </Text>
              </div>
            </Space>
          </div>
          
          {/* 内容主体 */}
          <div className="preview-content">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>{contentData.title || '标题'}</Title>
              <Paragraph>{contentData.description || '内容描述'}</Paragraph>
              
              {contentData.location && (
                <Text type="secondary">
                  <LocationOutlined /> {contentData.location}
                </Text>
              )}
              
              {/* 标签 */}
              <div className="preview-tags">
                {contentData.culturalTags?.map(tag => (
                  <Tag key={tag} color="blue" size="small">{tag}</Tag>
                ))}
                {contentData.languageTags?.map(lang => (
                  <Tag key={lang} color="green" size="small">{lang}</Tag>
                ))}
              </div>
              
              {/* 学习信息 */}
              <Row justify="space-between">
                <Col>
                  <Space>
                    <Text style={{ fontSize: 12 }}>学习价值:</Text>
                    <Progress
                      percent={contentData.learningValue || 0}
                      size="small"
                      style={{ width: 60 }}
                      showInfo={false}
                    />
                  </Space>
                </Col>
                <Col>
                  <Badge
                    count={`+${CONTENT_TYPES.find(t => t.key === contentData.type)?.cbtReward || 0} CBT`}
                    style={{ backgroundColor: '#faad14' }}
                  />
                </Col>
              </Row>
            </Space>
          </div>
          
          {/* 互动栏 */}
          <div className="preview-interactions">
            <Divider style={{ margin: '12px 0' }} />
            <Row justify="space-between">
              <Col>
                <Space>
                  <Button type="text" icon={<HeartOutlined />} size="small">0</Button>
                  <Button type="text" icon={<CommentOutlined />} size="small">0</Button>
                  <Button type="text" icon={<ShareAltOutlined />} size="small">0</Button>
                </Space>
              </Col>
              <Col>
                <Button type="text" icon={<EyeOutlined />} size="small">0</Button>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
};

// 主要的内容创作组件
const ContentCreator = ({ onPublish, onSaveDraft }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [contentData, setContentData] = useState({
    type: '',
    title: '',
    description: '',
    culturalTags: [],
    languageTags: [],
    location: '',
    difficulty: 'beginner',
    learningValue: 50,
    images: [],
    videos: [],
    audio: null,
    enableTranslation: true,
    enableAIInsights: true,
    visibility: 'public'
  });
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 步骤配置
  const steps = [
    {
      title: '选择类型',
      description: '选择内容类型和基本信息',
      icon: <TagsOutlined />
    },
    {
      title: '创作内容',
      description: '编写内容和上传媒体文件',
      icon: <EditOutlined />
    },
    {
      title: '添加标签',
      description: '添加文化和语言标签',
      icon: <BookOutlined />
    },
    {
      title: '预览发布',
      description: '预览内容并发布',
      icon: <SendOutlined />
    }
  ];

  // 处理表单数据变化
  const handleFormChange = useCallback((changedValues, allValues) => {
    setContentData(prev => ({ ...prev, ...allValues }));
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback((info, type) => {
    const { fileList } = info;
    
    if (type === 'images') {
      setContentData(prev => ({
        ...prev,
        images: fileList.map(file => ({
          uid: file.uid,
          name: file.name,
          status: file.status,
          url: file.response?.url || file.url,
          thumbUrl: file.thumbUrl
        }))
      }));
    } else if (type === 'videos') {
      setContentData(prev => ({
        ...prev,
        videos: fileList.map(file => ({
          uid: file.uid,
          name: file.name,
          status: file.status,
          url: file.response?.url || file.url
        }))
      }));
    }
  }, []);

  // 处理语音录制完成
  const handleVoiceRecording = useCallback((audioBlob) => {
    setContentData(prev => ({
      ...prev,
      audio: {
        blob: audioBlob,
        url: URL.createObjectURL(audioBlob),
        duration: 0 // 实际应用中需要计算音频时长
      }
    }));
    message.success('语音录制完成');
  }, []);

  // 下一步
  const nextStep = useCallback(() => {
    form.validateFields().then(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }).catch(() => {
      message.error('请完善当前步骤的信息');
    });
  }, [form, steps.length]);

  // 上一步
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // 保存草稿
  const handleSaveDraft = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      onSaveDraft?.(contentData);
      message.success('草稿已保存');
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [contentData, onSaveDraft]);

  // 发布内容
  const handlePublish = useCallback(async () => {
    try {
      await form.validateFields();
      setLoading(true);
      
      // 模拟发布过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const publishData = {
        ...contentData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        author: {
          id: 'current_user',
          username: '当前用户',
          avatar: '/api/placeholder/40/40',
          level: 10,
          verified: false
        },
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          bookmarks: 0,
          views: 0,
          cbtRewards: CONTENT_TYPES.find(t => t.key === contentData.type)?.cbtReward || 0
        }
      };
      
      onPublish?.(publishData);
      message.success('内容发布成功！');
      
      // 重置表单
      form.resetFields();
      setContentData({
        type: '',
        title: '',
        description: '',
        culturalTags: [],
        languageTags: [],
        location: '',
        difficulty: 'beginner',
        learningValue: 50,
        images: [],
        videos: [],
        audio: null,
        enableTranslation: true,
        enableAIInsights: true,
        visibility: 'public'
      });
      setCurrentStep(0);
      
    } catch (error) {
      message.error('发布失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, [form, contentData, onPublish]);

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Title level={4}>选择内容类型</Title>
            <Row gutter={[16, 16]}>
              {CONTENT_TYPES.map(type => (
                <Col xs={24} sm={12} md={8} key={type.key}>
                  <Card
                    hoverable
                    className={`type-card ${contentData.type === type.key ? 'selected' : ''}`}
                    onClick={() => setContentData(prev => ({ ...prev, type: type.key }))}
                  >
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <div style={{ fontSize: 32, color: type.color }}>
                        {type.icon}
                      </div>
                      <Title level={5}>{type.label}</Title>
                      <Text type="secondary" style={{ textAlign: 'center' }}>
                        {type.description}
                      </Text>
                      <Badge
                        count={`+${type.cbtReward} CBT`}
                        style={{ backgroundColor: '#faad14' }}
                      />
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleFormChange}
              initialValues={contentData}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="title"
                    label="标题"
                    rules={[{ required: true, message: '请输入标题' }]}
                  >
                    <Input placeholder="为你的内容起一个吸引人的标题" />
                  </Form.Item>
                  
                  <Form.Item
                    name="description"
                    label="内容描述"
                    rules={[{ required: true, message: '请输入内容描述' }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="详细描述你的文化体验、见解或故事..."
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>
                  
                  <Form.Item name="location" label="位置">
                    <Input
                      prefix={<LocationOutlined />}
                      placeholder="添加位置信息（可选）"
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item label="上传图片">
                    <Dragger
                      multiple
                      listType="picture-card"
                      fileList={contentData.images}
                      onChange={(info) => handleFileUpload(info, 'images')}
                      beforeUpload={() => false}
                    >
                      <p className="ant-upload-drag-icon">
                        <CameraOutlined />
                      </p>
                      <p className="ant-upload-text">点击或拖拽上传图片</p>
                      <p className="ant-upload-hint">支持 JPG、PNG、WebP 格式</p>
                    </Dragger>
                  </Form.Item>
                  
                  <Form.Item label="语音录制">
                    <VoiceRecorder
                      onRecordingComplete={handleVoiceRecording}
                      disabled={loading}
                    />
                    {contentData.audio && (
                      <Alert
                        message="语音录制完成"
                        type="success"
                        showIcon
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="culturalTags"
                    label="文化标签"
                    rules={[{ required: true, message: '请至少选择一个文化标签' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="选择相关的文化标签"
                      style={{ width: '100%' }}
                      maxTagCount={5}
                    >
                      {CULTURAL_TAGS.map(tag => (
                        <Option key={tag} value={tag}>{tag}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="languageTags"
                    label="语言标签"
                    rules={[{ required: true, message: '请至少选择一种语言' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="选择涉及的语言"
                      style={{ width: '100%' }}
                      maxTagCount={3}
                    >
                      {LANGUAGE_OPTIONS.map(lang => (
                        <Option key={lang} value={lang}>{lang}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item name="difficulty" label="难度等级">
                    <Select placeholder="选择内容难度">
                      {DIFFICULTY_LEVELS.map(level => (
                        <Option key={level.value} value={level.value}>
                          <Space>
                            <Tag color={level.color}>{level.label}</Tag>
                            <Text type="secondary">{level.description}</Text>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item name="learningValue" label="学习价值">
                    <Slider
                      min={0}
                      max={100}
                      marks={{
                        0: '低',
                        50: '中',
                        100: '高'
                      }}
                      tooltip={{
                        formatter: (value) => `${value}%`
                      }}
                    />
                  </Form.Item>
                  
                  <Form.Item label="高级设置">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>启用AI翻译</Text>
                        <Switch
                          checked={contentData.enableTranslation}
                          onChange={(checked) => 
                            setContentData(prev => ({ ...prev, enableTranslation: checked }))
                          }
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>启用AI文化洞察</Text>
                        <Switch
                          checked={contentData.enableAIInsights}
                          onChange={(checked) => 
                            setContentData(prev => ({ ...prev, enableAIInsights: checked }))
                          }
                        />
                      </div>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <ContentPreview
                  contentData={contentData}
                  onEdit={() => setCurrentStep(1)}
                />
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="发布设置" className="publish-settings">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>可见性</Text>
                      <Select
                        value={contentData.visibility}
                        onChange={(value) => 
                          setContentData(prev => ({ ...prev, visibility: value }))
                        }
                        style={{ width: '100%', marginTop: 8 }}
                      >
                        <Option value="public">公开</Option>
                        <Option value="followers">仅关注者</Option>
                        <Option value="private">私密</Option>
                      </Select>
                    </div>
                    
                    <Divider />
                    
                    <div className="reward-info">
                      <Title level={5}>
                        <GiftOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        预计奖励
                      </Title>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>基础奖励:</Text>
                          <Text strong>
                            +{CONTENT_TYPES.find(t => t.key === contentData.type)?.cbtReward || 0} CBT
                          </Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>质量加成:</Text>
                          <Text strong>
                            +{Math.round((contentData.learningValue || 0) / 10)} CBT
                          </Text>
                        </div>
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>总计:</Text>
                          <Text strong style={{ color: '#faad14', fontSize: 16 }}>
                            +{(CONTENT_TYPES.find(t => t.key === contentData.type)?.cbtReward || 0) + 
                              Math.round((contentData.learningValue || 0) / 10)} CBT
                          </Text>
                        </div>
                      </Space>
                    </div>
                    
                    <Alert
                      message="发布提示"
                      description="发布后的内容将经过AI审核，符合社区规范的优质内容将获得更多曝光机会。"
                      type="info"
                      showIcon
                    />
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="content-creator">
      <Card className="creator-card">
        <div className="creator-header">
          <Title level={3}>
            <PlusOutlined style={{ marginRight: 8 }} />
            创作文化内容
          </Title>
          <Text type="secondary">
            分享你的文化体验，连接世界各地的朋友
          </Text>
        </div>
        
        <Steps current={currentStep} className="creator-steps">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
        
        <div className="step-content-container">
          <Spin spinning={loading}>
            {renderStepContent()}
          </Spin>
        </div>
        
        <div className="creator-actions">
          <Row justify="space-between">
            <Col>
              <Space>
                {currentStep > 0 && (
                  <Button onClick={prevStep}>
                    上一步
                  </Button>
                )}
                <Button
                  type="default"
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraft}
                  loading={loading}
                >
                  保存草稿
                </Button>
              </Space>
            </Col>
            
            <Col>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  onClick={nextStep}
                  disabled={!contentData.type && currentStep === 0}
                >
                  下一步
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handlePublish}
                  loading={loading}
                  size="large"
                >
                  发布内容
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default ContentCreator;

