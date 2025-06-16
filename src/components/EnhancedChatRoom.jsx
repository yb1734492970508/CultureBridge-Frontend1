import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Smile, 
  Paperclip, 
  Users, 
  Settings,
  Volume2,
  VolumeX,
  Languages,
  Heart,
  MessageCircle,
  Globe,
  Crown,
  Star,
  Gift,
  Zap,
  Coffee,
  Music,
  Camera,
  MapPin,
  Calendar,
  Clock,
  User,
  UserPlus,
  LogOut,
  MoreVertical,
  Search,
  Filter,
  Bookmark,
  Share,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Forward,
  Copy,
  Download,
  Trash2,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';

const EnhancedChatRoom = ({ user, onEarnTokens }) => {
  // 状态管理
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [rooms, setRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messageFilter, setMessageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [theme, setTheme] = useState('light');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  
  // Refs
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // 支持的语言
  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];
  
  // 表情符号
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '🔥', '⭐', '🌟', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇'
  ];
  
  // 初始化WebSocket连接
  useEffect(() => {
    connectWebSocket();
    loadChatRooms();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 连接WebSocket
  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const ws = new WebSocket(`ws://localhost:5000`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setIsConnected(true);
      // 加入默认房间
      ws.send(JSON.stringify({
        type: 'join_room',
        roomId: selectedRoom,
        token
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      // 尝试重连
      setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
      setIsConnected(false);
    };
  };
  
  // 处理WebSocket消息
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'room_joined':
        console.log('成功加入房间:', data.roomId);
        loadChatHistory(data.roomId);
        break;
        
      case 'new_message':
        addNewMessage(data.message);
        playNotificationSound();
        break;
        
      case 'new_voice_message':
        addNewMessage(data.message);
        playNotificationSound();
        break;
        
      case 'user_joined':
        updateOnlineUsers(data.users);
        break;
        
      case 'user_left':
        updateOnlineUsers(data.users);
        break;
        
      case 'typing_start':
        addTypingUser(data.userId);
        break;
        
      case 'typing_stop':
        removeTypingUser(data.userId);
        break;
        
      case 'error':
        console.error('WebSocket错误:', data.message);
        break;
    }
  };
  
  // 加载聊天室列表
  const loadChatRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setRooms(result.rooms);
      }
    } catch (error) {
      console.error('加载聊天室失败:', error);
    }
  };
  
  // 加载聊天历史
  const loadChatHistory = async (roomId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error);
    }
  };
  
  // 发送消息
  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !isConnected) return;
    
    const messageData = {
      type: 'send_message',
      roomId: selectedRoom,
      message: newMessage.trim(),
      language: currentLanguage
    };
    
    wsRef.current.send(JSON.stringify(messageData));
    setNewMessage('');
    stopTyping();
    
    // 奖励用户
    if (onEarnTokens) {
      onEarnTokens(0.1, 'CHAT_MESSAGE');
    }
  };
  
  // 发送语音消息
  const sendVoiceMessage = async (audioBlob) => {
    if (!audioBlob || !wsRef.current || !isConnected) return;
    
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const messageData = {
        type: 'voice_message',
        roomId: selectedRoom,
        audioData: base64Audio,
        language: currentLanguage
      };
      
      wsRef.current.send(JSON.stringify(messageData));
      
      // 奖励用户
      if (onEarnTokens) {
        onEarnTokens(0.2, 'VOICE_MESSAGE');
      }
    } catch (error) {
      console.error('发送语音消息失败:', error);
    }
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('录音失败:', error);
    }
  };
  
  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // 切换房间
  const switchRoom = (roomId) => {
    if (roomId === selectedRoom) return;
    
    setSelectedRoom(roomId);
    setMessages([]);
    
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'join_room',
        roomId,
        token: localStorage.getItem('token')
      }));
    }
  };
  
  // 添加新消息
  const addNewMessage = (message) => {
    setMessages(prev => [...prev, {
      ...message,
      id: message.id || Date.now(),
      timestamp: message.timestamp || new Date().toISOString()
    }]);
  };
  
  // 更新在线用户
  const updateOnlineUsers = (users) => {
    setOnlineUsers(users);
  };
  
  // 开始输入
  const startTyping = () => {
    if (!isTyping && wsRef.current && isConnected) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({
        type: 'typing_start',
        roomId: selectedRoom
      }));
    }
    
    // 重置输入超时
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(stopTyping, 3000);
  };
  
  // 停止输入
  const stopTyping = () => {
    if (isTyping && wsRef.current && isConnected) {
      setIsTyping(false);
      wsRef.current.send(JSON.stringify({
        type: 'typing_stop',
        roomId: selectedRoom
      }));
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
  
  // 添加正在输入的用户
  const addTypingUser = (userId) => {
    setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
  };
  
  // 移除正在输入的用户
  const removeTypingUser = (userId) => {
    setTypingUsers(prev => prev.filter(id => id !== userId));
  };
  
  // 播放通知声音
  const playNotificationSound = () => {
    if (soundEnabled && notifications) {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // 忽略播放失败
      });
    }
  };
  
  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key !== 'Enter') {
      startTyping();
    }
  };
  
  // 插入表情符号
  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString();
  };
  
  // 获取用户头像
  const getUserAvatar = (userId) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  };
  
  // 获取语言标志
  const getLanguageFlag = (langCode) => {
    const lang = languages.find(l => l.code === langCode);
    return lang ? lang.flag : '🌐';
  };
  
  // 过滤消息
  const filteredMessages = messages.filter(message => {
    if (messageFilter === 'all') return true;
    if (messageFilter === 'text') return message.type === 'text';
    if (messageFilter === 'voice') return message.type === 'voice';
    if (messageFilter === 'my') return message.userId === user?.id;
    return true;
  }).filter(message => {
    if (!searchQuery) return true;
    return message.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           message.transcription?.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 - 聊天室列表 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">聊天室</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="在线用户"
              >
                <Users className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="设置"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索聊天室..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* 聊天室列表 */}
        <div className="flex-1 overflow-y-auto">
          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => switchRoom(room.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedRoom === room.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{room.description}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <div className="flex">
                      {room.languages?.slice(0, 3).map(lang => (
                        <span key={lang} className="text-xs">
                          {getLanguageFlag(lang)}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {room.userCount}/{room.maxUsers}
                    </span>
                  </div>
                </div>
                {unreadCounts[room.id] > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCounts[room.id]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* 连接状态 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? '已连接' : '连接中...'}
            </span>
          </div>
        </div>
      </div>
      
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {rooms.find(r => r.id === selectedRoom)?.name || '聊天室'}
              </h3>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{onlineUsers.length} 在线</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 语言选择 */}
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              
              {/* 消息过滤 */}
              <select
                value={messageFilter}
                onChange={(e) => setMessageFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">全部消息</option>
                <option value="text">文字消息</option>
                <option value="voice">语音消息</option>
                <option value="my">我的消息</option>
              </select>
              
              {/* 自动翻译开关 */}
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`p-2 rounded-lg transition-colors ${
                  autoTranslate ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
                title="自动翻译"
              >
                <Languages className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.userId === user?.id ? 'order-2' : 'order-1'}`}>
                {/* 用户信息 */}
                {message.userId !== user?.id && (
                  <div className="flex items-center space-x-2 mb-1">
                    <img
                      src={getUserAvatar(message.userId)}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {message.username || `用户${message.userId?.slice(-4)}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getLanguageFlag(message.language)}
                    </span>
                  </div>
                )}
                
                {/* 消息内容 */}
                <div
                  className={`rounded-lg p-3 ${
                    message.userId === user?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  {message.type === 'voice' ? (
                    <div className="flex items-center space-x-2">
                      <button className="p-1 rounded-full bg-white bg-opacity-20">
                        <Play className="h-4 w-4" />
                      </button>
                      <div className="flex-1">
                        <div className="text-sm opacity-90">语音消息</div>
                        {message.transcription && (
                          <div className="text-xs opacity-75 mt-1">
                            "{message.transcription}"
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm">{message.message}</p>
                      {message.translation && autoTranslate && (
                        <p className="text-xs opacity-75 mt-1 italic">
                          {message.translation}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* 时间戳 */}
                  <div className={`text-xs mt-1 ${
                    message.userId === user?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
              
              {/* 用户头像（自己的消息） */}
              {message.userId === user?.id && (
                <img
                  src={getUserAvatar(message.userId)}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full ml-2 order-3"
                />
              )}
            </div>
          ))}
          
          {/* 正在输入指示器 */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">
                {typingUsers.length === 1 ? '有人正在输入...' : `${typingUsers.length}人正在输入...`}
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* 消息输入区域 */}
        <div className="bg-white border-t border-gray-200 p-4">
          {/* 表情符号选择器 */}
          {showEmojiPicker && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-10 gap-2">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 hover:bg-gray-200 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            {/* 附件按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            {/* 表情按钮 */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Smile className="h-5 w-5" />
            </button>
            
            {/* 消息输入框 */}
            <div className="flex-1 relative">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="1"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            
            {/* 语音按钮 */}
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            {/* 发送按钮 */}
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 在线用户侧边栏 */}
      {showUserList && (
        <div className="w-64 bg-white border-l border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">在线用户 ({onlineUsers.length})</h3>
          <div className="space-y-2">
            {onlineUsers.map(userId => (
              <div key={userId} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
                <img
                  src={getUserAvatar(userId)}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {userId === user?.id ? '我' : `用户${userId?.slice(-4)}`}
                  </div>
                  <div className="text-xs text-gray-500">在线</div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">聊天设置</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 通知设置 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">消息通知</label>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* 声音设置 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">提示音</label>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* 字体大小 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">字体大小</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>
              
              {/* 主题设置 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">主题</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="auto">跟随系统</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,video/*"
        className="hidden"
        onChange={(e) => {
          // 处理文件上传
          console.log('文件上传:', e.target.files[0]);
        }}
      />
    </div>
  );
};

export default EnhancedChatRoom;

