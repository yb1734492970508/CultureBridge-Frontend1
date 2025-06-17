import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Avatar, 
  List, 
  Typography, 
  Space, 
  Tooltip, 
  Modal, 
  Select, 
  Badge,
  Spin,
  message as antMessage,
  Popover,
  Divider,
  Upload,
  Image,
  Slider,
  Switch,
  Tabs,
  Row,
  Col,
  Tag,
  Rate,
  Progress,
  Dropdown,
  Menu
} from 'antd';
import { 
  SendOutlined, 
  AudioOutlined, 
  TranslationOutlined, 
  UserOutlined,
  MoreOutlined,
  SmileOutlined,
  PaperClipOutlined,
  StopOutlined,
  CameraOutlined,
  GifOutlined,
  HeartOutlined,
  LikeOutlined,
  DislikeOutlined,
  ShareAltOutlined,
  FlagOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SettingOutlined,
  SoundOutlined,
  MutedOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  TeamOutlined,
  GlobalOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
  CrownOutlined,
  GiftOutlined
} from '@ant-design/icons';
import io from 'socket.io-client';
import './EnhancedChatRoom.css';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// 增强的语言选项
const ENHANCED_LANGUAGES = [
  { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' }
];

// 表情包数据
const EMOJI_CATEGORIES = {
  faces: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳']
};

// 聊天室主题
const CHAT_THEMES = [
  { id: 'default', name: '默认', colors: { primary: '#1890ff', secondary: '#f0f2f5' } },
  { id: 'dark', name: '暗夜', colors: { primary: '#722ed1', secondary: '#1f1f1f' } },
  { id: 'ocean', name: '海洋', colors: { primary: '#13c2c2', secondary: '#e6fffb' } },
  { id: 'sunset', name: '日落', colors: { primary: '#fa8c16', secondary: '#fff7e6' } },
  { id: 'forest', name: '森林', colors: { primary: '#52c41a', secondary: '#f6ffed' } },
  { id: 'cherry', name: '樱花', colors: { primary: '#eb2f96', secondary: '#fff0f6' } }
];

const EnhancedChatRoom = ({ roomId, userInfo, onLeaveRoom }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const [translationModal, setTranslationModal] = useState({ visible: false, messageId: null });
  const [translations, setTranslations] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatTheme, setChatTheme] = useState('default');
  const [fontSize, setFontSize] = useState(14);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [pinnedMessages, setPinnedMessages] = useState([]);
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 初始化Socket连接
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_CHAT_SERVER_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // 连接事件
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('聊天服务器连接成功');
      
      // 加入房间
      newSocket.emit('join-room', {
        roomId,
        userInfo: {
          ...userInfo,
          language: selectedLanguage,
          theme: chatTheme
        }
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('聊天服务器连接断开');
    });

    // 房间事件
    newSocket.on('room-joined', (data) => {
      setRoomInfo(data.roomInfo);
      setRoomUsers(data.users);
      antMessage.success(`已加入房间: ${data.roomInfo.name}`);
    });

    newSocket.on('user-joined', (user) => {
      setRoomUsers(prev => [...prev, user]);
      antMessage.info(`${user.username} 加入了房间`);
      playNotificationSound();
    });

    newSocket.on('user-left', (user) => {
      setRoomUsers(prev => prev.filter(u => u.userId !== user.userId));
      antMessage.info(`${user.username} 离开了房间`);
    });

    // 消息事件
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      playNotificationSound();
      
      // 自动翻译
      if (autoTranslate && message.userId !== userInfo.id) {
        requestTranslation(message.id, selectedLanguage);
      }
    });

    newSocket.on('message-updated', (updatedMessage) => {
      setMessages(prev => prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      ));
    });

    newSocket.on('message-deleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    newSocket.on('new-voice-message', (voiceMessage) => {
      setMessages(prev => [...prev, voiceMessage]);
      scrollToBottom();
      playNotificationSound();
    });

    // 输入状态事件
    newSocket.on('user-typing', (user) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === user.userId)) {
          return [...prev, user];
        }
        return prev;
      });
    });

    newSocket.on('user-stop-typing', (user) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    // 翻译事件
    newSocket.on('translation-result', (result) => {
      setTranslations(prev => ({
        ...prev,
        [`${result.messageId}-${result.targetLanguage}`]: result.translation
      }));
    });

    // 语音识别事件
    newSocket.on('voice-transcription', (result) => {
      setMessages(prev => prev.map(msg => 
        msg.id === result.messageId 
          ? { ...msg, transcription: result.transcription }
          : msg
      ));
    });

    // 消息反应事件
    newSocket.on('message-reaction', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    });

    // 错误处理
    newSocket.on('error', (error) => {
      antMessage.error(error.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, userInfo, selectedLanguage, chatTheme, autoTranslate]);

  // 播放通知音效
  const playNotificationSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('音效播放失败:', e));
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const sendMessage = useCallback(() => {
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      roomId,
      message: inputMessage.trim(),
      messageType: 'text',
      replyTo: replyingTo?.id || null,
      language: selectedLanguage
    };

    if (editingMessage) {
      // 编辑消息
      socket.emit('edit-message', {
        messageId: editingMessage.id,
        newContent: inputMessage.trim()
      });
      setEditingMessage(null);
    } else {
      // 发送新消息
      socket.emit('send-message', messageData);
    }

    setInputMessage('');
    setReplyingTo(null);
    
    // 停止输入状态
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('stop-typing', { roomId });
  }, [inputMessage, socket, roomId, replyingTo, editingMessage, selectedLanguage]);

  // 处理输入变化
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    if (!socket) return;

    // 发送正在输入状态
    socket.emit('typing', { roomId });
    
    // 设置停止输入的定时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { roomId });
    }, 1000);
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      antMessage.info('开始录音...');
    } catch (error) {
      console.error('录音失败:', error);
      antMessage.error('无法访问麦克风');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      antMessage.success('录音完成');
    }
  };

  // 发送语音消息
  const sendVoiceMessage = () => {
    if (!audioBlob || !socket) return;

    const reader = new FileReader();
    reader.onload = () => {
      const audioData = reader.result;
      
      socket.emit('send-voice-message', {
        roomId,
        audioData,
        duration: 0,
        language: selectedLanguage
      });

      setAudioBlob(null);
      antMessage.success('语音消息已发送');
    };
    
    reader.readAsDataURL(audioBlob);
  };

  // 请求翻译
  const requestTranslation = (messageId, targetLanguage) => {
    if (!socket) return;

    socket.emit('request-translation', {
      messageId,
      targetLanguage
    });
  };

  // 添加消息反应
  const addReaction = (messageId, emoji) => {
    if (!socket) return;

    socket.emit('add-reaction', {
      messageId,
      emoji,
      userId: userInfo.id
    });
  };

  // 删除消息
  const deleteMessage = (messageId) => {
    if (!socket) return;

    socket.emit('delete-message', { messageId });
  };

  // 编辑消息
  const startEditMessage = (message) => {
    setEditingMessage(message);
    setInputMessage(message.content);
  };

  // 回复消息
  const replyToMessage = (message) => {
    setReplyingTo(message);
  };

  // 固定消息
  const pinMessage = (messageId) => {
    if (!socket) return;

    socket.emit('pin-message', { messageId });
    setPinnedMessages(prev => [...prev, messageId]);
  };

  // 渲染消息
  const renderMessage = (msg) => {
    const isOwnMessage = msg.userId === userInfo.id;
    const translationKey = `${msg.id}-${selectedLanguage}`;
    const translation = translations[translationKey];
    const theme = CHAT_THEMES.find(t => t.id === chatTheme);

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          marginBottom: 16
        }}
      >
        <div style={{ maxWidth: '70%' }}>
          {!isOwnMessage && (
            <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" src={msg.avatar} icon={<UserOutlined />} />
              <Text style={{ fontSize: 12, color: '#666' }}>
                {msg.username}
              </Text>
              {msg.userLevel && (
                <Tag color="gold" size="small">
                  Lv.{msg.userLevel}
                </Tag>
              )}
            </div>
          )}
          
          {/* 回复消息显示 */}
          {msg.replyTo && (
            <div style={{
              marginBottom: 8,
              padding: 8,
              background: '#f5f5f5',
              borderRadius: 8,
              borderLeft: '3px solid #1890ff',
              fontSize: 12
            }}>
              <Text type="secondary">回复: {msg.replyTo.content}</Text>
            </div>
          )}
          
          <Card
            size="small"
            style={{
              backgroundColor: isOwnMessage ? theme.colors.primary : '#f5f5f5',
              color: isOwnMessage ? 'white' : 'black',
              border: 'none',
              borderRadius: 16,
              fontSize: fontSize
            }}
            bodyStyle={{ padding: '12px 16px' }}
          >
            {msg.type === 'voice' ? (
              <div>
                <audio controls style={{ width: '100%', maxWidth: 200 }}>
                  <source src={msg.audioData} type="audio/wav" />
                </audio>
                {msg.transcription && (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                    <SoundOutlined /> {msg.transcription}
                  </div>
                )}
              </div>
            ) : msg.type === 'image' ? (
              <div>
                <Image
                  src={msg.imageUrl}
                  alt="shared image"
                  style={{ maxWidth: 200, borderRadius: 8 }}
                />
                {msg.content && (
                  <div style={{ marginTop: 8 }}>{msg.content}</div>
                )}
              </div>
            ) : (
              <div>
                <div>{msg.content}</div>
                {translation && (
                  <div style={{ 
                    marginTop: 12, 
                    padding: 8, 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                    borderLeft: '3px solid #52c41a'
                  }}>
                    <TranslationOutlined style={{ marginRight: 4 }} />
                    {translation}
                  </div>
                )}
              </div>
            )}
            
            {/* 消息反应 */}
            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {Object.entries(msg.reactions).map(([emoji, users]) => (
                  <Tag
                    key={emoji}
                    style={{ 
                      cursor: 'pointer',
                      background: users.includes(userInfo.id) ? '#e6f7ff' : 'transparent'
                    }}
                    onClick={() => addReaction(msg.id, emoji)}
                  >
                    {emoji} {users.length}
                  </Tag>
                ))}
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 8 
            }}>
              <Text style={{ 
                fontSize: 10, 
                color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#999' 
              }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.edited && <span style={{ marginLeft: 4 }}>(已编辑)</span>}
              </Text>
              
              <Space size="small">
                {/* 消息操作菜单 */}
                <Dropdown
                  overlay={
                    <Menu>
                      {!isOwnMessage && msg.type === 'text' && (
                        <Menu.Item 
                          key="translate" 
                          icon={<TranslationOutlined />}
                          onClick={() => requestTranslation(msg.id, selectedLanguage)}
                        >
                          翻译
                        </Menu.Item>
                      )}
                      <Menu.Item 
                        key="reply" 
                        icon={<ShareAltOutlined />}
                        onClick={() => replyToMessage(msg)}
                      >
                        回复
                      </Menu.Item>
                      <Menu.Item 
                        key="copy" 
                        icon={<CopyOutlined />}
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                      >
                        复制
                      </Menu.Item>
                      <Menu.Item 
                        key="pin" 
                        icon={<StarOutlined />}
                        onClick={() => pinMessage(msg.id)}
                      >
                        固定
                      </Menu.Item>
                      {isOwnMessage && (
                        <>
                          <Menu.Item 
                            key="edit" 
                            icon={<EditOutlined />}
                            onClick={() => startEditMessage(msg)}
                          >
                            编辑
                          </Menu.Item>
                          <Menu.Item 
                            key="delete" 
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => deleteMessage(msg.id)}
                          >
                            删除
                          </Menu.Item>
                        </>
                      )}
                    </Menu>
                  }
                  trigger={['click']}
                  placement="topRight"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    style={{ 
                      color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#999',
                      padding: 0,
                      height: 'auto'
                    }}
                  />
                </Dropdown>
                
                {/* 快速反应 */}
                <Popover
                  content={
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                        <Button
                          key={emoji}
                          type="text"
                          size="small"
                          onClick={() => addReaction(msg.id, emoji)}
                          style={{ padding: 4 }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  }
                  trigger="hover"
                  placement="top"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<SmileOutlined />}
                    style={{ 
                      color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#999',
                      padding: 0,
                      height: 'auto'
                    }}
                  />
                </Popover>
              </Space>
            </div>
          </Card>
        </div>
      </motion.div>
    );
  };

  // 渲染用户列表
  const renderUserList = () => (
    <List
      size="small"
      dataSource={roomUsers}
      renderItem={(user) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Badge 
                status={user.isOnline ? "success" : "default"} 
                offset={[-5, 5]}
              >
                <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
              </Badge>
            }
            title={
              <Space>
                <span>{user.username}</span>
                {user.level && <Tag color="gold" size="small">Lv.{user.level}</Tag>}
                {user.isVip && <CrownOutlined style={{ color: '#faad14' }} />}
              </Space>
            }
            description={
              <Space size="small">
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {user.language}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(user.joinedAt).toLocaleTimeString()}
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  // 渲染表情选择器
  const renderEmojiPicker = () => (
    <div style={{ width: 300, maxHeight: 200, overflow: 'auto' }}>
      <Tabs size="small" tabPosition="top">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <TabPane tab={category} key={category}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
              {emojis.map(emoji => (
                <Button
                  key={emoji}
                  type="text"
                  size="small"
                  onClick={() => {
                    setInputMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  style={{ padding: 4, height: 32 }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );

  // 渲染设置面板
  const renderSettings = () => (
    <div style={{ width: 300, padding: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong>聊天主题</Text>
          <Select
            value={chatTheme}
            onChange={setChatTheme}
            style={{ width: '100%', marginTop: 8 }}
          >
            {CHAT_THEMES.map(theme => (
              <Option key={theme.id} value={theme.id}>
                {theme.name}
              </Option>
            ))}
          </Select>
        </div>
        
        <div>
          <Text strong>字体大小</Text>
          <Slider
            min={12}
            max={20}
            value={fontSize}
            onChange={setFontSize}
            style={{ marginTop: 8 }}
          />
        </div>
        
        <div>
          <Row justify="space-between" align="middle">
            <Text>消息提示音</Text>
            <Switch checked={soundEnabled} onChange={setSoundEnabled} />
          </Row>
        </div>
        
        <div>
          <Row justify="space-between" align="middle">
            <Text>自动翻译</Text>
            <Switch checked={autoTranslate} onChange={setAutoTranslate} />
          </Row>
        </div>
      </Space>
    </div>
  );

  if (!isConnected) {
    return (
      <Card style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>连接聊天服务器中...</div>
      </Card>
    );
  }

  const theme = CHAT_THEMES.find(t => t.id === chatTheme);

  return (
    <div className="enhanced-chat-room" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 房间头部 */}
      <Card 
        size="small" 
        style={{ 
          marginBottom: 0, 
          borderRadius: 0,
          background: theme.colors.primary,
          color: 'white',
          border: 'none'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Avatar.Group maxCount={3}>
                {roomUsers.slice(0, 3).map(user => (
                  <Avatar key={user.userId} src={user.avatar} size="small" />
                ))}
              </Avatar.Group>
              <div>
                <Title level={5} style={{ margin: 0, color: 'white' }}>
                  {roomInfo?.name}
                  {roomInfo?.isHot && <FireOutlined style={{ marginLeft: 8, color: '#ff4d4f' }} />}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  {roomUsers.length} 人在线 • {roomInfo?.language}
                </Text>
              </div>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <Select
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                style={{ width: 140 }}
                size="small"
              >
                {ENHANCED_LANGUAGES.map(lang => (
                  <Option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </Option>
                ))}
              </Select>
              
              <Popover
                content={renderUserList()}
                title={`在线用户 (${roomUsers.length})`}
                trigger="click"
                placement="bottomRight"
              >
                <Button size="small" icon={<TeamOutlined />} style={{ color: 'white', borderColor: 'white' }}>
                  {roomUsers.length}
                </Button>
              </Popover>
              
              <Popover
                content={renderSettings()}
                title="聊天设置"
                trigger="click"
                placement="bottomRight"
              >
                <Button size="small" icon={<SettingOutlined />} style={{ color: 'white', borderColor: 'white' }} />
              </Popover>
              
              <Button size="small" onClick={onLeaveRoom} style={{ color: 'white', borderColor: 'white' }}>
                离开房间
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 消息区域 */}
      <div 
        ref={chatContainerRef}
        style={{ 
          flex: 1, 
          padding: 16, 
          overflowY: 'auto',
          background: theme.colors.secondary
        }}
      >
        <AnimatePresence>
          {messages
            .filter(msg => !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(renderMessage)}
        </AnimatePresence>
        
        {/* 正在输入指示器 */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ padding: '8px 0', color: '#666', fontSize: 12 }}
            >
              <Space>
                <Spin size="small" />
                <Text>{typingUsers.map(user => user.username).join(', ')} 正在输入...</Text>
              </Space>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* 回复消息显示 */}
      {replyingTo && (
        <div style={{ 
          padding: '8px 16px', 
          background: '#f0f0f0', 
          borderTop: '1px solid #d9d9d9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              回复 {replyingTo.username}: {replyingTo.content.substring(0, 50)}...
            </Text>
          </div>
          <Button 
            type="text" 
            size="small" 
            onClick={() => setReplyingTo(null)}
            icon={<DeleteOutlined />}
          />
        </div>
      )}

      {/* 语音消息预览 */}
      {audioBlob && (
        <div style={{ 
          margin: '0 16px 8px', 
          padding: 12, 
          background: '#f0f0f0', 
          borderRadius: 8,
          border: '1px solid #d9d9d9'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <audio controls style={{ width: 200 }}>
                <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
              </audio>
            </Col>
            <Col>
              <Space>
                <Button size="small" onClick={sendVoiceMessage} type="primary">
                  发送语音
                </Button>
                <Button size="small" onClick={() => setAudioBlob(null)}>
                  取消
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}
      
      {/* 输入区域 */}
      <Card size="small" style={{ marginTop: 0, borderRadius: 0, border: 'none' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <TextArea
              value={inputMessage}
              onChange={handleInputChange}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={editingMessage ? "编辑消息..." : "输入消息... (Shift+Enter 换行)"}
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ fontSize: fontSize }}
            />
          </div>
          
          <Space direction="vertical" size="small">
            <Space size="small">
              {/* 表情按钮 */}
              <Popover
                content={renderEmojiPicker()}
                title="选择表情"
                trigger="click"
                visible={showEmojiPicker}
                onVisibleChange={setShowEmojiPicker}
                placement="topRight"
              >
                <Button
                  type="text"
                  icon={<SmileOutlined />}
                  size="small"
                />
              </Popover>
              
              {/* 文件上传 */}
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                accept="image/*"
              >
                <Button
                  type="text"
                  icon={<PaperClipOutlined />}
                  size="small"
                />
              </Upload>
              
              {/* 语音录制 */}
              <Button
                icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
                onClick={isRecording ? stopRecording : startRecording}
                size="small"
                style={{ 
                  backgroundColor: isRecording ? '#ff4d4f' : undefined,
                  borderColor: isRecording ? '#ff4d4f' : undefined,
                  color: isRecording ? 'white' : undefined
                }}
              />
            </Space>
            
            {/* 发送按钮 */}
            <Button
              type="primary"
              icon={editingMessage ? <EditOutlined /> : <SendOutlined />}
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              style={{ background: theme.colors.primary, borderColor: theme.colors.primary }}
            >
              {editingMessage ? '更新' : '发送'}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedChatRoom;

