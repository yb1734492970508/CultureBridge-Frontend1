import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { chatAPI, voiceAPI, apiUtils } from '../../services/enhancedAPI';
import socketService from '../../services/enhancedSocketService';
import { useAuth } from '../../context/auth/EnhancedAuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import Button from '../ui/Button';
import { Input, SearchInput } from '../ui/Input';
import LoadingSpinner, { ButtonLoader } from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import './SuperEnhancedRealTimeChat.css';

// 消息类型常量
const MESSAGE_TYPES = {
  TEXT: 'text',
  VOICE: 'voice',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system'
};

// 用户状态常量
const USER_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  BUSY: 'busy',
  OFFLINE: 'offline'
};

// 高级语音消息可视化组件
const VoiceMessageVisualizer = ({ audioUrl, duration, isPlaying, onPlay, onPause, waveformData = [] }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => {
        setCurrentTime(0);
        onPause();
      };

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [onPause]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      onPause();
    } else {
      audioRef.current?.play();
      onPlay();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="voice-message-visualizer">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="voice-controls">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlayPause}
          className="voice-play-button"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </Button>
        
        <div className="voice-info">
          <div className="voice-waveform">
            <div className="waveform-container">
              {waveformData.length > 0 ? (
                waveformData.map((amplitude, index) => (
                  <div
                    key={index}
                    className="waveform-bar"
                    style={{
                      height: `${Math.max(2, amplitude * 20)}px`,
                      opacity: (index / waveformData.length) <= (progress / 100) ? 1 : 0.3
                    }}
                  />
                ))
              ) : (
                // 默认波形
                Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="waveform-bar"
                    style={{
                      height: `${Math.random() * 16 + 4}px`,
                      opacity: (i / 20) <= (progress / 100) ? 1 : 0.3
                    }}
                  />
                ))
              )}
            </div>
            <div className="progress-overlay" style={{ width: `${progress}%` }} />
          </div>
          
          <div className="voice-duration">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

// 消息状态指示器组件
const MessageStatusIndicator = ({ status, timestamp }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      case 'failed': return '❌';
      default: return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending': return 'var(--color-warning-500)';
      case 'sent': return 'var(--color-neutral-400)';
      case 'delivered': return 'var(--color-primary-500)';
      case 'read': return 'var(--color-success-500)';
      case 'failed': return 'var(--color-error-500)';
      default: return 'var(--color-neutral-400)';
    }
  };

  return (
    <div className="message-status" style={{ color: getStatusColor() }}>
      <span className="status-icon">{getStatusIcon()}</span>
      <span className="status-time">
        {new Date(timestamp).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
    </div>
  );
};

// 用户头像组件
const UserAvatar = ({ user, size = 'md', showStatus = true }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case USER_STATUS.ONLINE: return 'var(--color-success-500)';
      case USER_STATUS.AWAY: return 'var(--color-warning-500)';
      case USER_STATUS.BUSY: return 'var(--color-error-500)';
      default: return 'var(--color-neutral-400)';
    }
  };

  return (
    <div className={`user-avatar ${sizeClasses[size]}`}>
      {user.avatar ? (
        <img src={user.avatar} alt={user.username} className="avatar-image" />
      ) : (
        <div className="avatar-placeholder">
          {user.username?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      
      {showStatus && (
        <div 
          className="status-indicator"
          style={{ backgroundColor: getStatusColor(user.status) }}
        />
      )}
    </div>
  );
};

// 消息搜索组件
const MessageSearch = ({ onSearch, onClear, isSearching }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    user: 'all',
    dateRange: 'all'
  });

  const handleSearch = useCallback(() => {
    onSearch({ query, filters });
  }, [query, filters, onSearch]);

  const handleClear = () => {
    setQuery('');
    setFilters({ type: 'all', user: 'all', dateRange: 'all' });
    onClear();
  };

  return (
    <div className="message-search">
      <div className="search-input-group">
        <SearchInput
          placeholder="搜索消息..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="primary" size="sm" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? <ButtonLoader /> : '🔍'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          清除
        </Button>
      </div>
      
      <div className="search-filters">
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="filter-select"
        >
          <option value="all">所有类型</option>
          <option value="text">文本消息</option>
          <option value="voice">语音消息</option>
          <option value="image">图片消息</option>
        </select>
        
        <select
          value={filters.dateRange}
          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          className="filter-select"
        >
          <option value="all">所有时间</option>
          <option value="today">今天</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
        </select>
      </div>
    </div>
  );
};

// 输入状态指示器组件
const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} 正在输入...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} 和 ${typingUsers[1].username} 正在输入...`;
    } else {
      return `${typingUsers.length} 人正在输入...`;
    }
  };

  return (
    <div className="typing-indicator">
      <div className="typing-animation">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="typing-text">{getTypingText()}</span>
    </div>
  );
};

// 语音录制组件
const VoiceRecorder = ({ onRecordingComplete, onCancel, isRecording }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      <div className="recording-visualizer">
        <div className="recording-circle">
          <div className="pulse-ring" />
          <div className="recording-icon">🎤</div>
        </div>
        
        <div className="recording-info">
          <div className="recording-time">{formatTime(recordingTime)}</div>
          <div className="recording-status">正在录音...</div>
        </div>
        
        <div className="audio-level-bars">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`level-bar ${audioLevel > (i / 10) ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
      
      <div className="recording-controls">
        <Button variant="error" onClick={onCancel}>
          取消
        </Button>
        <Button variant="success" onClick={onRecordingComplete}>
          完成
        </Button>
      </div>
    </div>
  );
};

// 主聊天组件
const SuperEnhancedRealTimeChat = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, isDarkMode } = useTheme();
  
  // 状态管理
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [messageStatus, setMessageStatus] = useState({});
  
  // 新房间数据
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',
    language: 'zh-CN',
    isPrivate: false,
    maxMembers: 100
  });

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // 初始化组件
  useEffect(() => {
    if (isAuthenticated) {
      initializeChat();
    }

    return () => {
      cleanup();
    };
  }, [isAuthenticated]);

  // 设置Socket事件监听
  useEffect(() => {
    if (isAuthenticated) {
      setupSocketListeners();
    }
  }, [isAuthenticated]);

  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 过滤消息
  useEffect(() => {
    setFilteredMessages(messages);
  }, [messages]);

  /**
   * 初始化聊天功能
   */
  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // 获取聊天室列表
      await fetchChatRooms();
      
      // 连接Socket
      socketService.connect(user);
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError('初始化聊天功能失败');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 清理资源
   */
  const cleanup = () => {
    if (currentRoom) {
      socketService.leaveRoom(currentRoom.id);
    }
    socketService.disconnect();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  /**
   * 设置Socket事件监听器
   */
  const setupSocketListeners = () => {
    // 连接状态
    socketService.on('socket:connected', () => {
      setIsConnected(true);
      setError(null);
    });

    socketService.on('socket:disconnected', () => {
      setIsConnected(false);
    });

    socketService.on('socket:error', (data) => {
      setError(`连接错误: ${data.error}`);
    });

    // 聊天消息
    socketService.on('chat:new_message', (message) => {
      setMessages(prev => [...prev, { ...message, status: 'delivered' }]);
      
      // 如果不是自己的消息，标记为已读
      if (message.sender?.id !== user.id) {
        markMessageAsRead(message.id);
      }
    });

    socketService.on('chat:voice_message', (voiceMessage) => {
      setMessages(prev => [...prev, { ...voiceMessage, status: 'delivered' }]);
    });

    socketService.on('chat:message_status_updated', (data) => {
      setMessageStatus(prev => ({
        ...prev,
        [data.messageId]: data.status
      }));
    });

    // 用户状态
    socketService.on('room:user_joined', (data) => {
      setOnlineUsers(prev => {
        const existing = prev.find(u => u.id === data.user.id);
        if (existing) {
          return prev.map(u => u.id === data.user.id ? { ...u, ...data.user } : u);
        }
        return [...prev, data.user];
      });
    });

    socketService.on('room:user_left', (data) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== data.user.id));
    });

    socketService.on('room:online_users_updated', (users) => {
      setOnlineUsers(users);
    });

    socketService.on('room:user_status_changed', (data) => {
      setOnlineUsers(prev => prev.map(u => 
        u.id === data.userId ? { ...u, status: data.status } : u
      ));
    });

    // 输入状态
    socketService.on('chat:user_typing', (data) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => {
          const existing = prev.find(u => u.userId === data.userId);
          if (!existing) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });

    socketService.on('chat:user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // 语音翻译完成
    socketService.on('voice:translation_complete', (translation) => {
      setMessages(prev => prev.map(msg => 
        msg.id === translation.messageId 
          ? { ...msg, translation: translation.result }
          : msg
      ));
    });
  };

  /**
   * 获取聊天室列表
   */
  const fetchChatRooms = async () => {
    try {
      const response = await chatAPI.getChatRooms();
      if (response.success) {
        setChatRooms(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    }
  };

  /**
   * 创建聊天室
   */
  const createChatRoom = async () => {
    try {
      setIsLoading(true);
      
      const response = await chatAPI.createChatRoom(newRoomData);
      
      if (response.success) {
        setChatRooms(prev => [...prev, response.data]);
        setShowCreateRoom(false);
        setNewRoomData({
          name: '',
          description: '',
          language: 'zh-CN',
          isPrivate: false,
          maxMembers: 100
        });
        
        // 自动加入新创建的房间
        await joinRoom(response.data);
      } else {
        setError(response.error);
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 加入聊天室
   */
  const joinRoom = async (room) => {
    try {
      setIsLoading(true);
      
      // 离开当前房间
      if (currentRoom) {
        socketService.leaveRoom(currentRoom.id);
      }
      
      // 加入新房间
      const response = await chatAPI.joinChatRoom(room.id);
      
      if (response.success) {
        setCurrentRoom(room);
        setMessages([]);
        setFilteredMessages([]);
        setOnlineUsers([]);
        setTypingUsers([]);
        setMessageStatus({});
        
        // Socket加入房间
        socketService.joinRoom(room.id, { roomName: room.name });
        
        // 获取房间消息
        await fetchRoomMessages(room.id);
        
        // 获取在线用户
        socketService.getOnlineUsers(room.id);
      } else {
        setError(response.error);
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 获取房间消息
   */
  const fetchRoomMessages = async (roomId, limit = 50) => {
    try {
      const response = await chatAPI.getMessages(roomId, { limit });
      if (response.success) {
        const messagesWithStatus = response.data.map(msg => ({
          ...msg,
          status: msg.sender?.id === user.id ? 'read' : 'delivered'
        }));
        setMessages(messagesWithStatus.reverse());
      }
    } catch (error) {
      console.error('Failed to fetch room messages:', error);
    }
  };

  /**
   * 发送文本消息
   */
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;

    try {
      const tempId = Date.now().toString();
      const messageData = {
        id: tempId,
        content: newMessage.trim(),
        type: MESSAGE_TYPES.TEXT,
        sender: user,
        timestamp: new Date().toISOString(),
        status: 'sending'
      };

      // 立即添加到本地消息列表
      setMessages(prev => [...prev, messageData]);
      
      // 清空输入框
      setNewMessage('');
      
      // 停止输入状态
      socketService.sendTypingStatus(currentRoom.id, false);
      
      // 通过Socket发送消息
      socketService.sendMessage(currentRoom.id, {
        content: messageData.content,
        type: messageData.type,
        tempId
      });
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('发送消息失败');
      
      // 更新消息状态为失败
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  /**
   * 开始录音
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('无法访问麦克风，请检查权限设置');
    }
  };

  /**
   * 停止录音
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * 取消录音
   */
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
    }
  };

  /**
   * 发送语音消息
   */
  const sendVoiceMessage = async () => {
    if (!audioBlob || !currentRoom) return;

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');
      formData.append('roomId', currentRoom.id);

      const response = await chatAPI.uploadVoiceMessage(currentRoom.id, formData);
      
      if (response.success) {
        const tempId = Date.now().toString();
        const voiceMessage = {
          id: tempId,
          type: MESSAGE_TYPES.VOICE,
          audioUrl: response.data.audioUrl,
          duration: response.data.duration,
          waveformData: response.data.waveformData || [],
          sender: user,
          timestamp: new Date().toISOString(),
          status: 'sending'
        };

        // 添加到本地消息列表
        setMessages(prev => [...prev, voiceMessage]);
        
        // 通过Socket发送语音消息
        socketService.sendVoiceMessage(currentRoom.id, {
          ...voiceMessage,
          tempId
        });
        
        setAudioBlob(null);
      } else {
        setError(response.error);
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // 发送输入状态
    if (currentRoom) {
      socketService.sendTypingStatus(currentRoom.id, true);
      
      // 清除之前的定时器
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // 设置新的定时器，3秒后停止输入状态
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTypingStatus(currentRoom.id, false);
      }, 3000);
    }
  };

  /**
   * 处理键盘事件
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * 播放语音消息
   */
  const playVoiceMessage = (messageId) => {
    if (playingVoiceId === messageId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(messageId);
    }
  };

  /**
   * 标记消息为已读
   */
  const markMessageAsRead = (messageId) => {
    if (currentRoom) {
      socketService.markMessageAsRead(currentRoom.id, messageId);
    }
  };

  /**
   * 搜索消息
   */
  const searchMessages = async ({ query, filters }) => {
    if (!currentRoom) return;

    try {
      setIsSearching(true);
      
      const response = await chatAPI.searchMessages(currentRoom.id, {
        query,
        type: filters.type !== 'all' ? filters.type : undefined,
        dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined
      });
      
      if (response.success) {
        setFilteredMessages(response.data);
      }
    } catch (error) {
      console.error('Failed to search messages:', error);
      setError('搜索失败');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 清除搜索
   */
  const clearSearch = () => {
    setFilteredMessages(messages);
    setShowSearch(false);
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 格式化日期
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 按日期分组消息
  const groupedMessages = useMemo(() => {
    const groups = {};
    filteredMessages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  }, [filteredMessages]);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <div className="chat-container">
          <div className="auth-required">
            <div className="auth-icon">🔐</div>
            <h3>请先登录</h3>
            <p>使用实时聊天功能需要登录账户</p>
            <Button variant="primary" onClick={() => window.location.href = '/login'}>
              前往登录
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="super-enhanced-chat">
        {/* 聊天头部 */}
        <div className="chat-header">
          <div className="header-left">
            <h1 className="chat-title">💬 实时聊天</h1>
            <div className="connection-status">
              <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                <div className="status-dot" />
                <span className="status-text">
                  {isConnected ? '已连接' : '未连接'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className={showSearch ? 'active' : ''}
            >
              🔍 搜索
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateRoom(true)}
            >
              ➕ 创建房间
            </Button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              ✕
            </Button>
          </div>
        )}

        {/* 搜索面板 */}
        {showSearch && (
          <div className="search-panel">
            <MessageSearch
              onSearch={searchMessages}
              onClear={clearSearch}
              isSearching={isSearching}
            />
          </div>
        )}

        <div className="chat-layout">
          {/* 聊天室侧边栏 */}
          <div className="chat-sidebar">
            <div className="sidebar-header">
              <h3>聊天室</h3>
              <span className="room-count">({chatRooms.length})</span>
            </div>

            <div className="room-list">
              {chatRooms.map(room => (
                <div
                  key={room.id}
                  className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
                  onClick={() => joinRoom(room)}
                >
                  <div className="room-avatar">
                    {room.isPrivate ? '🔒' : '🌐'}
                  </div>
                  <div className="room-info">
                    <h4 className="room-name">{room.name}</h4>
                    <p className="room-description">{room.description}</p>
                    <div className="room-meta">
                      <span className="room-language">🌍 {room.language}</span>
                      <span className="room-members">👥 {room.memberCount}</span>
                    </div>
                  </div>
                  {room.unreadCount > 0 && (
                    <div className="unread-badge">{room.unreadCount}</div>
                  )}
                </div>
              ))}
            </div>

            {/* 在线用户 */}
            {currentRoom && onlineUsers.length > 0 && (
              <div className="online-users-section">
                <div className="section-header">
                  <h4>在线用户</h4>
                  <span className="user-count">({onlineUsers.length})</span>
                </div>
                <div className="online-users-list">
                  {onlineUsers.map(user => (
                    <div key={user.id} className="online-user-item">
                      <UserAvatar user={user} size="sm" />
                      <div className="user-info">
                        <span className="user-name">{user.username}</span>
                        <span className="user-status">{user.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 聊天主区域 */}
          <div className="chat-main">
            {currentRoom ? (
              <>
                {/* 房间头部 */}
                <div className="room-header">
                  <div className="room-info">
                    <h3 className="room-title">{currentRoom.name}</h3>
                    <p className="room-subtitle">{currentRoom.description}</p>
                  </div>
                  <div className="room-actions">
                    <Button variant="ghost" size="sm">
                      ⚙️ 设置
                    </Button>
                  </div>
                </div>

                {/* 消息区域 */}
                <div className="messages-container" ref={messagesContainerRef}>
                  {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date} className="message-group">
                      <div className="date-divider">
                        <span className="date-text">{date}</span>
                      </div>
                      
                      {dayMessages.map((message, index) => (
                        <div
                          key={message.id || index}
                          className={`message ${message.sender?.id === user.id ? 'own' : 'other'}`}
                        >
                          {message.sender?.id !== user.id && (
                            <UserAvatar user={message.sender} size="sm" />
                          )}
                          
                          <div className="message-bubble">
                            <div className="message-header">
                              <span className="sender-name">
                                {message.sender?.username}
                              </span>
                              <MessageStatusIndicator
                                status={messageStatus[message.id] || message.status}
                                timestamp={message.timestamp}
                              />
                            </div>
                            
                            <div className="message-content">
                              {message.type === MESSAGE_TYPES.TEXT && (
                                <p className="text-content">{message.content}</p>
                              )}
                              
                              {message.type === MESSAGE_TYPES.VOICE && (
                                <VoiceMessageVisualizer
                                  audioUrl={message.audioUrl}
                                  duration={message.duration}
                                  waveformData={message.waveformData}
                                  isPlaying={playingVoiceId === message.id}
                                  onPlay={() => playVoiceMessage(message.id)}
                                  onPause={() => setPlayingVoiceId(null)}
                                />
                              )}
                              
                              {message.translation && (
                                <div className="message-translation">
                                  <div className="translation-label">翻译:</div>
                                  <div className="translation-text">
                                    {message.translation.text}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {/* 输入状态指示器 */}
                  <TypingIndicator typingUsers={typingUsers} />
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* 语音录制界面 */}
                {isRecording && (
                  <div className="voice-recording-overlay">
                    <VoiceRecorder
                      onRecordingComplete={stopRecording}
                      onCancel={cancelRecording}
                      isRecording={isRecording}
                    />
                  </div>
                )}

                {/* 语音预览 */}
                {audioBlob && !isRecording && (
                  <div className="voice-preview">
                    <div className="preview-content">
                      <span className="preview-icon">🎤</span>
                      <span className="preview-text">语音已录制</span>
                    </div>
                    <div className="preview-actions">
                      <Button variant="ghost" size="sm" onClick={() => setAudioBlob(null)}>
                        取消
                      </Button>
                      <Button variant="primary" size="sm" onClick={sendVoiceMessage}>
                        发送
                      </Button>
                    </div>
                  </div>
                )}

                {/* 消息输入区域 */}
                <div className="message-input-area">
                  <div className="input-container">
                    <Button
                      variant="ghost"
                      size="md"
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      className={`voice-button ${isRecording ? 'recording' : ''}`}
                      disabled={isLoading}
                    >
                      {isRecording ? '🔴' : '🎤'}
                    </Button>

                    <div className="text-input-container">
                      <textarea
                        ref={messageInputRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                        className="message-input"
                        rows={1}
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="send-button"
                    >
                      {isLoading ? <ButtonLoader /> : '📤'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-room-selected">
                <div className="no-room-content">
                  <div className="no-room-icon">💬</div>
                  <h3>选择一个聊天室开始对话</h3>
                  <p>从左侧选择一个聊天室，或创建一个新的聊天室</p>
                  <Button variant="primary" onClick={() => setShowCreateRoom(true)}>
                    创建聊天室
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 创建房间模态框 */}
        {showCreateRoom && (
          <div className="modal-overlay" onClick={() => setShowCreateRoom(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>创建聊天室</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateRoom(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>房间名称</label>
                  <Input
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入房间名称"
                  />
                </div>
                
                <div className="form-group">
                  <label>房间描述</label>
                  <textarea
                    value={newRoomData.description}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入房间描述"
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>主要语言</label>
                    <select
                      value={newRoomData.language}
                      onChange={(e) => setNewRoomData(prev => ({ ...prev, language: e.target.value }))}
                      className="form-select"
                    >
                      <option value="zh-CN">中文</option>
                      <option value="en-US">English</option>
                      <option value="ja-JP">日本語</option>
                      <option value="ko-KR">한국어</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>最大成员数</label>
                    <Input
                      type="number"
                      value={newRoomData.maxMembers}
                      onChange={(e) => setNewRoomData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                      min="2"
                      max="1000"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newRoomData.isPrivate}
                      onChange={(e) => setNewRoomData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    />
                    私人房间 (需要邀请才能加入)
                  </label>
                </div>
              </div>
              
              <div className="modal-footer">
                <Button variant="ghost" onClick={() => setShowCreateRoom(false)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={createChatRoom}
                  disabled={!newRoomData.name.trim() || isLoading}
                >
                  {isLoading ? <ButtonLoader /> : '创建'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SuperEnhancedRealTimeChat;

