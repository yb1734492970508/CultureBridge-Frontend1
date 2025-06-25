/**
 * 聊天页面
 * 实时聊天和语言交换功能
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Phone,
  PhoneOff,
  Users,
  Settings,
  Search,
  Plus,
  MoreVertical,
  Smile,
  Paperclip,
  Languages,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);

  const [conversations] = useState([
    {
      id: 1,
      name: 'John Smith',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Hello! How are you today?',
      lastMessageTime: '2分钟前',
      unreadCount: 2,
      isOnline: true,
      language: 'English',
      flag: '🇺🇸'
    },
    {
      id: 2,
      name: '田中太郎',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'こんにちは！元気ですか？',
      lastMessageTime: '10分钟前',
      unreadCount: 0,
      isOnline: true,
      language: 'Japanese',
      flag: '🇯🇵'
    },
    {
      id: 3,
      name: 'Marie Dubois',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Bonjour! Comment allez-vous?',
      lastMessageTime: '1小时前',
      unreadCount: 1,
      isOnline: false,
      language: 'French',
      flag: '🇫🇷'
    },
    {
      id: 4,
      name: 'Language Exchange Group',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Welcome to our group!',
      lastMessageTime: '2小时前',
      unreadCount: 5,
      isOnline: true,
      language: 'Multilingual',
      flag: '🌍',
      isGroup: true
    }
  ]);

  const [messages] = useState([
    {
      id: 1,
      senderId: 2,
      senderName: 'John Smith',
      content: 'Hello! How are you today?',
      timestamp: '14:30',
      type: 'text',
      isTranslated: false,
      originalLanguage: 'en',
      translatedContent: '你好！你今天怎么样？'
    },
    {
      id: 2,
      senderId: 1,
      senderName: 'Me',
      content: '我很好，谢谢！你呢？',
      timestamp: '14:32',
      type: 'text',
      isTranslated: false,
      originalLanguage: 'zh',
      translatedContent: 'I\'m fine, thank you! How about you?'
    },
    {
      id: 3,
      senderId: 2,
      senderName: 'John Smith',
      content: 'I\'m doing great! Would you like to practice some English conversation?',
      timestamp: '14:33',
      type: 'text',
      isTranslated: false,
      originalLanguage: 'en',
      translatedContent: '我很好！你想练习一些英语对话吗？'
    },
    {
      id: 4,
      senderId: 1,
      senderName: 'Me',
      content: '当然！我想提高我的英语口语。',
      timestamp: '14:35',
      type: 'text',
      isTranslated: false,
      originalLanguage: 'zh',
      translatedContent: 'Of course! I want to improve my spoken English.'
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('发送消息:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
  };

  const endVideoCall = () => {
    setIsVideoCall(false);
  };

  const startVoiceCall = () => {
    setIsVoiceCall(true);
  };

  const endVoiceCall = () => {
    setIsVoiceCall(false);
  };

  useEffect(() => {
    if (conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 h-[calc(100vh-5rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* 对话列表 */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    对话
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索对话..."
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-white/10 border-r-2 border-blue-500'
                          : 'hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-white font-medium text-sm truncate">
                                {conversation.name}
                              </h3>
                              <span className="text-xs">{conversation.flag}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-400 text-xs">
                                {conversation.lastMessageTime}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 聊天区域 */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <Card className="bg-white/5 border-white/10 h-full flex flex-col">
                {/* 聊天头部 */}
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.avatar} />
                          <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium flex items-center space-x-2">
                          <span>{selectedConversation.name}</span>
                          <span>{selectedConversation.flag}</span>
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {selectedConversation.isOnline ? '在线' : '离线'} • {selectedConversation.language}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={startVoiceCall}
                        className="text-gray-400 hover:text-white"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={startVideoCall}
                        className="text-gray-400 hover:text-white"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* 消息区域 */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.senderId === 1 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${
                          msg.senderId === 1 ? 'order-2' : 'order-1'
                        }`}>
                          <div className={`rounded-2xl px-4 py-2 ${
                            msg.senderId === 1
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 text-white'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            {msg.translatedContent && (
                              <div className="mt-2 pt-2 border-t border-white/20">
                                <div className="flex items-center space-x-1 mb-1">
                                  <Languages className="h-3 w-3 text-gray-300" />
                                  <span className="text-xs text-gray-300">翻译</span>
                                </div>
                                <p className="text-xs text-gray-300">{msg.translatedContent}</p>
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center space-x-2 mt-1 ${
                            msg.senderId === 1 ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-gray-400">{msg.timestamp}</span>
                            {msg.translatedContent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white p-0 h-auto"
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>

                {/* 输入区域 */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入消息..."
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 pr-20"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white p-1 h-auto"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white p-1 h-auto"
                        >
                          <Languages className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRecording}
                      className={`${
                        isRecording ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">选择一个对话</h3>
                  <p className="text-gray-400">开始与全球朋友交流吧</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* 通话界面覆盖层 */}
        {(isVideoCall || isVoiceCall) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="mb-8">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={selectedConversation?.avatar} />
                  <AvatarFallback className="text-2xl">
                    {selectedConversation?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-white text-2xl font-medium mb-2">
                  {selectedConversation?.name}
                </h3>
                <p className="text-gray-400">
                  {isVideoCall ? '视频通话中...' : '语音通话中...'}
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                
                {isVideoCall && (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <VideoOff className="h-6 w-6" />
                  </Button>
                )}
                
                <Button
                  onClick={isVideoCall ? endVideoCall : endVoiceCall}
                  size="lg"
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

