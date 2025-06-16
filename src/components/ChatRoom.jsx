/**
 * 实时聊天组件 - Real-time Chat Component
 * 支持多语言聊天、自动翻译、语音消息等功能
 */

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Globe,
  Users,
  Settings,
  Smile,
  Paperclip,
  MoreVertical
} from 'lucide-react';

const ChatRoom = ({ user, onEarnTokens }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 支持的语言列表
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

  // 聊天室列表
  const chatRooms = [
    { id: 'general', name: '综合讨论', description: '自由交流各种话题' },
    { id: 'language-exchange', name: '语言交换', description: '练习语言，互相学习' },
    { id: 'culture-share', name: '文化分享', description: '分享各国文化特色' },
    { id: 'tech-talk', name: '科技讨论', description: '讨论最新科技趋势' },
    { id: 'travel-stories', name: '旅行故事', description: '分享旅行经历和见闻' }
  ];

  useEffect(() => {
    // 连接Socket.IO服务器
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001', {
      query: {
        userId: user?.id || 'anonymous',
        username: user?.username || '匿名用户'
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('已连接到聊天服务器');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('与聊天服务器断开连接');
    });

    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      // 如果收到消息，给用户奖励CBT代币
      if (message.userId !== user?.id) {
        onEarnTokens && onEarnTokens(1, 'chat_participation');
      }
    });

    newSocket.on('userJoined', (userData) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `${userData.username} 加入了聊天室`,
        timestamp: new Date()
      }]);
    });

    newSocket.on('userLeft', (userData) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `${userData.username} 离开了聊天室`,
        timestamp: new Date()
      }]);
    });

    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('translatedMessage', (translatedData) => {
      setMessages(prev => prev.map(msg => 
        msg.id === translatedData.messageId 
          ? { ...msg, translation: translatedData.translation }
          : msg
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  useEffect(() => {
    if (socket && currentRoom) {
      socket.emit('joinRoom', currentRoom);
    }
  }, [socket, currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket) return;

    const message = {
      id: Date.now(),
      userId: user?.id || 'anonymous',
      username: user?.username || '匿名用户',
      content: inputMessage.trim(),
      room: currentRoom,
      language: selectedLanguage,
      timestamp: new Date(),
      type: 'text'
    };

    socket.emit('sendMessage', message);
    setInputMessage('');
    
    // 发送消息奖励CBT代币
    onEarnTokens && onEarnTokens(2, 'send_message');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('录音失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = (audioBlob) => {
    if (!socket) return;

    const reader = new FileReader();
    reader.onload = () => {
      const voiceMessage = {
        id: Date.now(),
        userId: user?.id || 'anonymous',
        username: user?.username || '匿名用户',
        content: reader.result,
        room: currentRoom,
        language: selectedLanguage,
        timestamp: new Date(),
        type: 'voice'
      };

      socket.emit('sendMessage', voiceMessage);
      
      // 发送语音消息奖励更多CBT代币
      onEarnTokens && onEarnTokens(5, 'send_voice_message');
    };
    reader.readAsDataURL(audioBlob);
  };

  const playAudio = (audioData) => {
    const audio = new Audio(audioData);
    audio.play().catch(error => {
      console.error('播放音频失败:', error);
    });
  };

  const requestTranslation = (messageId, targetLanguage) => {
    if (socket) {
      socket.emit('requestTranslation', { messageId, targetLanguage });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentRoomInfo = () => {
    return chatRooms.find(room => room.id === currentRoom);
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg shadow-lg">
      {/* 聊天室头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {getCurrentRoomInfo()?.name || '聊天室'}
            </h3>
            <p className="text-sm text-gray-500">
              {onlineUsers.length} 人在线
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isConnected ? '已连接' : '连接中...'}
          </span>
          
          {/* 语言选择 */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          
          <button className="p-1 hover:bg-gray-200 rounded">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 聊天室选择 */}
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-5 p-1 m-2 bg-gray-100 rounded-lg">
          {chatRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room.id)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                currentRoom === room.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages
            .filter(msg => msg.room === currentRoom || msg.type === 'system')
            .map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.userId === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'system'
                    ? 'bg-gray-100 text-gray-600 text-center text-sm'
                    : message.userId === user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.type !== 'system' && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs opacity-75">
                      {message.username}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}
                
                {message.type === 'voice' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => playAudio(message.content)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <span className="text-sm">语音消息</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">{message.content}</p>
                    {message.translation && (
                      <p className="text-xs opacity-75 mt-1 italic">
                        翻译: {message.translation}
                      </p>
                    )}
                    {autoTranslate && message.userId !== user?.id && !message.translation && (
                      <button
                        onClick={() => requestTranslation(message.id, selectedLanguage)}
                        className="text-xs mt-1 p-0 h-auto flex items-center hover:underline"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        翻译
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 消息输入区域 */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center space-x-2 bg-white rounded-lg border p-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="border-0 outline-none flex-1 px-2 py-1"
              />
              
              <button className="p-1 hover:bg-gray-100 rounded">
                <Smile className="h-4 w-4" />
              </button>
              
              <button className="p-1 hover:bg-gray-100 rounded">
                <Paperclip className="h-4 w-4" />
              </button>
            </div>
            
            <button
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={!isConnected}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            
            <button 
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>按住录音按钮发送语音消息</span>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="w-3 h-3"
              />
              <span>自动翻译</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

