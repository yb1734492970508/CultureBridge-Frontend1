import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Users, 
  Settings, 
  Smile, 
  Paperclip,
  MoreVertical,
  Volume2,
  VolumeX,
  Languages,
  Globe,
  MessageCircle,
  Phone,
  Video,
  UserPlus,
  Search,
  Filter,
  Hash,
  Lock,
  Unlock,
  Star,
  Heart,
  ThumbsUp,
  Gift
} from 'lucide-react';
import io from 'socket.io-client';

const EnhancedChatRoom = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 支持的语言
  const languages = [
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  // 初始化Socket连接
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: `Bearer ${user.token || 'mock-token'}`
        }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket连接成功');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket连接断开');
      });

      newSocket.on('welcome', (data) => {
        console.log('欢迎消息:', data);
      });

      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        if (soundEnabled) {
          playNotificationSound();
        }
      });

      newSocket.on('new_voice_message', (voiceMessage) => {
        setMessages(prev => [...prev, voiceMessage]);
        if (soundEnabled) {
          playNotificationSound();
        }
      });

      newSocket.on('user_joined', (userData) => {
        setOnlineUsers(prev => [...prev, userData]);
      });

      newSocket.on('user_left', (userData) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId));
      });

      newSocket.on('online_users_list', (data) => {
        setOnlineUsers(data.users);
      });

      newSocket.on('rooms_list', (data) => {
        setRooms(data.rooms);
      });

      newSocket.on('translation_result', (result) => {
        // 更新消息的翻译结果
        setMessages(prev => prev.map(msg => 
          msg.id === result.messageId 
            ? { ...msg, translations: { ...msg.translations, [result.toLanguage]: result.translatedText } }
            : msg
        ));
      });

      newSocket.on('reward_earned', (reward) => {
        // 显示奖励通知
        showRewardNotification(reward);
      });

      newSocket.on('error', (error) => {
        console.error('Socket错误:', error);
      });

      setSocket(newSocket);

      // 加入默认房间
      setTimeout(() => {
        newSocket.emit('join_room', { roomId: 'general', roomType: 'public' });
        newSocket.emit('get_online_users');
        newSocket.emit('get_rooms');
      }, 1000);

      return () => {
        newSocket.close();
      };
    }
  }, [user, soundEnabled]);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    // 播放通知音效
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('播放音效失败:', e));
  };

  const showRewardNotification = (reward) => {
    // 显示奖励通知
    console.log('获得奖励:', reward);
  };

  // 发送文本消息
  const sendMessage = () => {
    if (newMessage.trim() && socket && isConnected) {
      socket.emit('send_message', {
        roomId: currentRoom,
        content: newMessage.trim(),
        messageType: 'text'
      });
      setNewMessage('');
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = () => {
          const audioData = reader.result;
          sendVoiceMessage(audioData);
        };
        reader.readAsDataURL(audioBlob);
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('录音失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 发送语音消息
  const sendVoiceMessage = (audioData) => {
    if (socket && isConnected) {
      socket.emit('send_voice_message', {
        roomId: currentRoom,
        audioData: audioData,
        duration: 5, // 模拟时长
        language: selectedLanguage
      });
    }
  };

  // 翻译消息
  const translateMessage = (messageId, text, fromLang, toLang) => {
    if (socket && isConnected) {
      socket.emit('translate_message', {
        messageId: messageId,
        text: text,
        fromLang: fromLang,
        toLang: toLang
      });
    }
  };

  // 切换房间
  const switchRoom = (roomId) => {
    if (socket && isConnected && roomId !== currentRoom) {
      // 离开当前房间
      socket.emit('leave_room', { roomId: currentRoom });
      
      // 加入新房间
      socket.emit('join_room', { roomId: roomId, roomType: 'public' });
      
      setCurrentRoom(roomId);
      setMessages([]); // 清空消息
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 获取用户头像
  const getUserAvatar = (username) => {
    return username?.charAt(0).toUpperCase() || 'U';
  };

  // 渲染消息
  const renderMessage = (message) => {
    const isOwn = message.userId === user?.id || message.username === user?.username;
    const currentLang = selectedLanguage;
    const translatedText = message.translations?.[currentLang];
    const displayText = autoTranslate && translatedText ? translatedText : message.content;

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 max-w-[70%]`}>
          {/* 头像 */}
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {getUserAvatar(message.username)}
          </div>
          
          {/* 消息内容 */}
          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
            {/* 用户名和时间 */}
            <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-sm font-medium text-gray-700">{message.username}</span>
              <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
              {message.userLevel && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {message.userLevel}
                </span>
              )}
            </div>
            
            {/* 消息气泡 */}
            <div className={`relative px-4 py-2 rounded-lg ${
              isOwn 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              {message.type === 'voice' ? (
                <div className="flex items-center gap-2">
                  <Volume2 size={16} />
                  <span className="text-sm">语音消息 ({message.duration}s)</span>
                  <button className="text-xs underline">播放</button>
                </div>
              ) : (
                <div>
                  <p className="text-sm">{displayText}</p>
                  {autoTranslate && translatedText && translatedText !== message.content && (
                    <p className="text-xs opacity-75 mt-1 border-t border-white/20 pt-1">
                      原文: {message.content}
                    </p>
                  )}
                </div>
              )}
              
              {/* 翻译按钮 */}
              {!isOwn && message.type === 'text' && !autoTranslate && (
                <div className="flex gap-1 mt-2">
                  {languages.filter(lang => lang.code !== selectedLanguage).slice(0, 3).map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => translateMessage(message.id, message.content, 'auto', lang.code)}
                      className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                      title={`翻译为${lang.name}`}
                    >
                      {lang.flag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧边栏 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 房间列表 */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">聊天室</h2>
          <div className="space-y-2">
            {['general', 'culture', 'language', 'travel'].map((roomId) => (
              <button
                key={roomId}
                onClick={() => switchRoom(roomId)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentRoom === roomId
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash size={16} />
                  <span className="font-medium">{roomId}</span>
                  {roomId === 'general' && <Lock size={12} className="text-gray-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 在线用户 */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">在线用户</h3>
            <span className="text-xs text-gray-500">{onlineUsers.length}</span>
          </div>
          <div className="space-y-2">
            {onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {getUserAvatar(onlineUser.username)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {onlineUser.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {onlineUser.level}
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 设置 */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            {/* 语言选择 */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">显示语言</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 自动翻译 */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">自动翻译</span>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  autoTranslate ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  autoTranslate ? 'translate-x-4' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>

            {/* 声音通知 */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">声音通知</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <Hash size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">#{currentRoom}</h1>
                <p className="text-sm text-gray-500">
                  {onlineUsers.length} 人在线
                  {isConnected ? (
                    <span className="ml-2 text-green-500">● 已连接</span>
                  ) : (
                    <span className="ml-2 text-red-500">● 连接中...</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search size={18} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <UserPlus size={18} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">欢迎来到 #{currentRoom}</h3>
              <p className="text-gray-500">开始聊天，与全球用户交流文化！</p>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-3">
            {/* 附件按钮 */}
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Paperclip size={20} className="text-gray-500" />
            </button>

            {/* 输入框 */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              
              {/* 表情按钮 */}
              <button className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded">
                <Smile size={16} className="text-gray-500" />
              </button>
            </div>

            {/* 语音按钮 */}
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* 发送按钮 */}
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* 录音提示 */}
          {isRecording && (
            <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              正在录音... 松开发送
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatRoom;

