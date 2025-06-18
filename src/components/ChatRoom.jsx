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
  Divider
} from 'antd';
import { 
  SendOutlined, 
  AudioOutlined, 
  TranslationOutlined, 
  UserOutlined,
  MoreOutlined,
  SmileOutlined,
  PaperClipOutlined,
  StopOutlined
} from '@ant-design/icons';
import io from 'socket.io-client';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

// 语言选项
const LANGUAGES = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

const ChatRoom = ({ roomId, userInfo, onLeaveRoom }) => {
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
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);

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
        userInfo
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
    });

    newSocket.on('user-left', (user) => {
      setRoomUsers(prev => prev.filter(u => u.userId !== user.userId));
      antMessage.info(`${user.username} 离开了房间`);
    });

    // 消息事件
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('new-voice-message', (voiceMessage) => {
      setMessages(prev => [...prev, voiceMessage]);
      scrollToBottom();
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

    // 错误处理
    newSocket.on('error', (error) => {
      antMessage.error(error.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, userInfo]);

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

    socket.emit('send-message', {
      roomId,
      message: inputMessage.trim(),
      messageType: 'text'
    });

    setInputMessage('');
    
    // 停止输入状态
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('stop-typing', { roomId });
  }, [inputMessage, socket, roomId]);

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
        duration: 0, // 这里应该计算实际时长
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

  // 渲染消息
  const renderMessage = (msg) => {
    const isOwnMessage = msg.userId === userInfo.id;
    const translationKey = `${msg.id}-${selectedLanguage}`;
    const translation = translations[translationKey];

    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          marginBottom: 16
        }}
      >
        <div style={{ maxWidth: '70%' }}>
          {!isOwnMessage && (
            <div style={{ marginBottom: 4 }}>
              <Avatar size="small" src={msg.avatar} icon={<UserOutlined />} />
              <Text style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                {msg.username}
              </Text>
            </div>
          )}
          
          <Card
            size="small"
            style={{
              backgroundColor: isOwnMessage ? '#1890ff' : '#f5f5f5',
              color: isOwnMessage ? 'white' : 'black',
              border: 'none'
            }}
            bodyStyle={{ padding: '8px 12px' }}
          >
            {msg.type === 'voice' ? (
              <div>
                <audio controls style={{ width: '100%', maxWidth: 200 }}>
                  <source src={msg.audioData} type="audio/wav" />
                </audio>
                {msg.transcription && (
                  <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                    转录: {msg.transcription}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div>{msg.content}</div>
                {translation && (
                  <div style={{ 
                    marginTop: 8, 
                    padding: 8, 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    fontSize: 12
                  }}>
                    <TranslationOutlined style={{ marginRight: 4 }} />
                    {translation}
                  </div>
                )}
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 4 
            }}>
              <Text style={{ 
                fontSize: 10, 
                color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#999' 
              }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
              
              {!isOwnMessage && msg.type === 'text' && (
                <Tooltip title="翻译">
                  <Button
                    type="text"
                    size="small"
                    icon={<TranslationOutlined />}
                    onClick={() => requestTranslation(msg.id, selectedLanguage)}
                    style={{ 
                      color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#999',
                      padding: 0,
                      height: 'auto'
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </Card>
        </div>
      </div>
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
            avatar={<Avatar size="small" src={user.avatar} icon={<UserOutlined />} />}
            title={user.username}
            description={`加入时间: ${new Date(user.joinedAt).toLocaleTimeString()}`}
          />
          <Badge status="success" />
        </List.Item>
      )}
    />
  );

  if (!isConnected) {
    return (
      <Card style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>连接聊天服务器中...</div>
      </Card>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 房间头部 */}
      <Card size="small" style={{ marginBottom: 0, borderRadius: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {roomInfo?.name}
            </Title>
            <Text type="secondary">
              {roomUsers.length} 人在线 • {roomInfo?.language}
            </Text>
          </div>
          
          <Space>
            <Select
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              style={{ width: 120 }}
              size="small"
            >
              {LANGUAGES.map(lang => (
                <Option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </Option>
              ))}
            </Select>
            
            <Popover
              content={renderUserList()}
              title="在线用户"
              trigger="click"
              placement="bottomRight"
            >
              <Button size="small" icon={<UserOutlined />}>
                {roomUsers.length}
              </Button>
            </Popover>
            
            <Button size="small" onClick={onLeaveRoom}>
              离开房间
            </Button>
          </Space>
        </div>
      </Card>

      {/* 消息区域 */}
      <div style={{ 
        flex: 1, 
        padding: 16, 
        overflowY: 'auto',
        backgroundColor: '#fafafa'
      }}>
        {messages.map(renderMessage)}
        
        {/* 正在输入指示器 */}
        {typingUsers.length > 0 && (
          <div style={{ padding: '8px 0', color: '#666', fontSize: 12 }}>
            {typingUsers.map(user => user.username).join(', ')} 正在输入...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <Card size="small" style={{ marginTop: 0, borderRadius: 0 }}>
        {audioBlob && (
          <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
            <audio controls style={{ width: '100%', maxWidth: 200 }}>
              <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
            </audio>
            <div style={{ marginTop: 8 }}>
              <Button size="small" onClick={sendVoiceMessage} type="primary">
                发送语音
              </Button>
              <Button size="small" onClick={() => setAudioBlob(null)} style={{ marginLeft: 8 }}>
                取消
              </Button>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 8 }}>
          <TextArea
            value={inputMessage}
            onChange={handleInputChange}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="输入消息... (Shift+Enter 换行)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          
          <Space direction="vertical">
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
            />
            
            <Button
              icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
              onClick={isRecording ? stopRecording : startRecording}
              style={{ 
                backgroundColor: isRecording ? '#ff4d4f' : undefined,
                borderColor: isRecording ? '#ff4d4f' : undefined,
                color: isRecording ? 'white' : undefined
              }}
            />
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default ChatRoom;

