import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Users, 
  Settings, 
  Globe,
  Heart,
  Smile,
  Image,
  Paperclip,
  MoreVertical,
  Volume2,
  VolumeX,
  Star,
  Gift,
  Coins
} from 'lucide-react';

const ChatRoom = ({ user, onEarnTokens }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [isRecording, setIsRecording] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const messagesEndRef = useRef(null);

  // 聊天室配置
  const chatRooms = [
    { id: 'general', name: '综合讨论', description: '自由交流各种话题', icon: '💬', users: 234 },
    { id: 'language-exchange', name: '语言交换', description: '练习语言，互相学习', icon: '🌐', users: 156 },
    { id: 'culture-share', name: '文化分享', description: '分享各国文化特色', icon: '🎭', users: 89 },
    { id: 'tech-talk', name: '科技讨论', description: '讨论最新科技趋势', icon: '💻', users: 67 },
    { id: 'travel-stories', name: '旅行故事', description: '分享旅行经历和见闻', icon: '✈️', users: 123 }
  ];

  // 支持的语言
  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' }
  ];

  // 表情符号
  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🌟', '🎭'];

  // 模拟消息数据
  const mockMessages = [
    {
      id: 1,
      user: { id: 'user1', name: 'Alice', avatar: '👩', country: '🇺🇸' },
      content: 'Hello everyone! Welcome to CultureBridge!',
      translation: '大家好！欢迎来到文化桥梁！',
      timestamp: new Date(Date.now() - 300000),
      type: 'text',
      language: 'en',
      likes: 5,
      isLiked: false
    },
    {
      id: 2,
      user: { id: 'user2', name: '小明', avatar: '👨', country: '🇨🇳' },
      content: '很高兴认识大家！我来自中国，希望能学习更多英语。',
      translation: 'Nice to meet everyone! I\'m from China and hope to learn more English.',
      timestamp: new Date(Date.now() - 240000),
      type: 'text',
      language: 'zh',
      likes: 3,
      isLiked: true
    },
    {
      id: 3,
      user: { id: 'user3', name: 'Maria', avatar: '👩', country: '🇪🇸' },
      content: '¡Hola! Me encanta esta plataforma para intercambio cultural.',
      translation: '你好！我喜欢这个文化交流平台。',
      timestamp: new Date(Date.now() - 180000),
      type: 'text',
      language: 'es',
      likes: 7,
      isLiked: false
    }
  ];

  const mockOnlineUsers = [
    { id: 'user1', name: 'Alice', avatar: '👩', country: '🇺🇸', status: 'online' },
    { id: 'user2', name: '小明', avatar: '👨', country: '🇨🇳', status: 'online' },
    { id: 'user3', name: 'Maria', avatar: '👩', country: '🇪🇸', status: 'online' },
    { id: 'user4', name: 'Jean', avatar: '👨', country: '🇫🇷', status: 'away' },
    { id: 'user5', name: 'Hans', avatar: '👨', country: '🇩🇪', status: 'online' }
  ];

  useEffect(() => {
    setMessages(mockMessages);
    setOnlineUsers(mockOnlineUsers);
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message = {
      id: Date.now(),
      user: {
        id: user.id,
        name: user.username,
        avatar: '👤',
        country: '🌍'
      },
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      language: selectedLanguage,
      likes: 0,
      isLiked: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // 奖励用户发送消息
    onEarnTokens && onEarnTokens(0.1, 'CHAT_MESSAGE');

    // 模拟自动翻译
    if (autoTranslate && selectedLanguage !== 'zh') {
      setTimeout(() => {
        const translatedMessage = {
          ...message,
          translation: `[自动翻译] ${newMessage}`
        };
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? translatedMessage : msg
        ));
      }, 1000);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // 模拟录音
    setTimeout(() => {
      setIsRecording(false);
      // 模拟语音消息
      const voiceMessage = {
        id: Date.now(),
        user: {
          id: user?.id || 'current_user',
          name: user?.username || '我',
          avatar: '👤',
          country: '🌍'
        },
        content: '[语音消息]',
        timestamp: new Date(),
        type: 'voice',
        duration: 3,
        likes: 0,
        isLiked: false
      };
      setMessages(prev => [...prev, voiceMessage]);
      
      // 奖励用户语音消息
      onEarnTokens && onEarnTokens(0.5, 'VOICE_MESSAGE');
    }, 3000);
  };

  const likeMessage = (messageId) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newLiked = !msg.isLiked;
        return {
          ...msg,
          isLiked: newLiked,
          likes: newLiked ? msg.likes + 1 : msg.likes - 1
        };
      }
      return msg;
    }));

    // 奖励收到点赞
    onEarnTokens && onEarnTokens(0.2, 'LIKE_RECEIVED');
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentRoom = () => {
    return chatRooms.find(room => room.id === selectedRoom);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧边栏 - 聊天室列表 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <span>聊天室</span>
          </h2>
        </div>

        {/* 聊天室列表 */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms.map(room => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedRoom === room.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{room.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{room.name}</div>
                  <div className="text-sm text-gray-600">{room.description}</div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                    <Users className="h-3 w-3" />
                    <span>{room.users} 在线</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 在线用户 */}
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">在线用户</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {onlineUsers.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center space-x-2">
                <div className="relative">
                  <span className="text-lg">{user.avatar}</span>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                </div>
                <span className="text-sm">{user.country}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getCurrentRoom()?.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{getCurrentRoom()?.name}</h3>
                <p className="text-sm text-gray-600">{getCurrentRoom()?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* 语言选择 */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              
              {/* 设置按钮 */}
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`p-2 rounded-md ${autoTranslate ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title="自动翻译"
              >
                <Globe className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-md ${soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title="声音通知"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm">{message.user.avatar}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{message.user.name}</span>
                  <span className="text-xs">{message.user.country}</span>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
                
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  {message.type === 'voice' ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mic className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{message.content}</div>
                        <div className="text-xs text-gray-500">{message.duration}秒</div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Volume2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900">{message.content}</p>
                      {message.translation && autoTranslate && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                          <p className="text-sm text-blue-800">{message.translation}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 消息操作 */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => likeMessage(message.id)}
                        className={`flex items-center space-x-1 text-xs ${
                          message.isLiked ? 'text-red-500' : 'text-gray-500'
                        } hover:text-red-500`}
                      >
                        <Heart className={`h-3 w-3 ${message.isLiked ? 'fill-current' : ''}`} />
                        <span>{message.likes}</span>
                      </button>
                      
                      {message.user.id !== user?.id && (
                        <button className="text-xs text-gray-500 hover:text-blue-500">
                          回复
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400">
                        {message.language && languages.find(l => l.code === message.language)?.flag}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 消息输入区域 */}
        <div className="bg-white border-t border-gray-200 p-4">
          {/* 表情选择器 */}
          {showEmojiPicker && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-6 gap-2">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-xl hover:bg-gray-200 rounded p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {/* 附件按钮 */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              <Paperclip className="h-5 w-5" />
            </button>
            
            {/* 图片按钮 */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              <Image className="h-5 w-5" />
            </button>
            
            {/* 表情按钮 */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Smile className="h-5 w-5" />
            </button>
            
            {/* 消息输入框 */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="输入消息..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* 语音按钮 */}
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`p-2 rounded-md ${
                isRecording 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            {/* 发送按钮 */}
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-md"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {isRecording && (
            <div className="mt-2 flex items-center space-x-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">正在录音...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

