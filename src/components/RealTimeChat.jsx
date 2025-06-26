/**
 * 实时聊天组件
 * 支持Socket.IO实时通信和语音翻译
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  Users, 
  Settings,
  Smile,
  Paperclip,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx'

// 模拟Socket.IO连接
class MockSocket {
  constructor() {
    this.listeners = {}
    this.connected = false
  }

  connect() {
    this.connected = true
    setTimeout(() => {
      this.emit('connect')
    }, 1000)
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  disconnect() {
    this.connected = false
    this.emit('disconnect')
  }
}

const RealTimeChat = ({ roomId = 'general', roomName = 'General Chat' }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [sourceLanguage, setSourceLanguage] = useState('auto')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // 语言选项
  const languages = [
    { code: 'auto', name: 'Auto Detect', flag: '🌐' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
  ]

  // 模拟用户数据
  const currentUser = {
    id: 'user1',
    name: 'You',
    avatar: '👤'
  }

  useEffect(() => {
    // 初始化Socket连接
    const mockSocket = new MockSocket()
    setSocket(mockSocket)

    // 连接事件
    mockSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to chat server')
    })

    mockSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from chat server')
    })

    // 接收消息
    mockSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    // 用户列表更新
    mockSocket.on('users_update', (users) => {
      setOnlineUsers(users)
    })

    // 连接到服务器
    mockSocket.connect()

    // 模拟初始数据
    setTimeout(() => {
      setMessages([
        {
          id: '1',
          userId: 'user2',
          userName: 'Alice',
          avatar: '👩',
          message: 'Hello everyone! 👋',
          timestamp: new Date(Date.now() - 300000),
          translated: false
        },
        {
          id: '2',
          userId: 'user3',
          userName: 'Carlos',
          avatar: '👨',
          message: '¡Hola! ¿Cómo están todos?',
          timestamp: new Date(Date.now() - 240000),
          translated: true,
          originalMessage: '¡Hola! ¿Cómo están todos?',
          translatedMessage: 'Hello! How is everyone?',
          sourceLanguage: 'es',
          targetLanguage: 'en'
        },
        {
          id: '3',
          userId: 'user4',
          userName: 'Yuki',
          avatar: '👩‍🦱',
          message: 'こんにちは！今日はいい天気ですね。',
          timestamp: new Date(Date.now() - 180000),
          translated: true,
          originalMessage: 'こんにちは！今日はいい天気ですね。',
          translatedMessage: 'Hello! It\'s nice weather today.',
          sourceLanguage: 'ja',
          targetLanguage: 'en'
        }
      ])

      setOnlineUsers([
        { id: 'user1', name: 'You', avatar: '👤', status: 'online' },
        { id: 'user2', name: 'Alice', avatar: '👩', status: 'online' },
        { id: 'user3', name: 'Carlos', avatar: '👨', status: 'online' },
        { id: 'user4', name: 'Yuki', avatar: '👩‍🦱', status: 'online' },
        { id: 'user5', name: 'Ahmed', avatar: '👨‍🦲', status: 'away' }
      ])
    }, 1500)

    return () => {
      if (mockSocket) {
        mockSocket.disconnect()
      }
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return

    const message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      avatar: currentUser.avatar,
      message: newMessage,
      timestamp: new Date(),
      translated: false
    }

    // 如果启用翻译且目标语言不是自动检测
    if (isTranslating && targetLanguage !== 'auto') {
      try {
        const translatedText = await translateText(newMessage, sourceLanguage, targetLanguage)
        message.translated = true
        message.originalMessage = newMessage
        message.translatedMessage = translatedText
        message.sourceLanguage = sourceLanguage
        message.targetLanguage = targetLanguage
        message.message = translatedText
      } catch (error) {
        console.error('Translation failed:', error)
      }
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // 发送到服务器
    socket.emit('send_message', {
      roomId,
      ...message
    })
  }

  const translateText = async (text, from, to) => {
    // 模拟翻译API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        const translations = {
          'Hello': { es: 'Hola', fr: 'Bonjour', de: 'Hallo', ja: 'こんにちは', zh: '你好' },
          'How are you?': { es: '¿Cómo estás?', fr: 'Comment allez-vous?', de: 'Wie geht es dir?', ja: '元気ですか？', zh: '你好吗？' },
          'Good morning': { es: 'Buenos días', fr: 'Bonjour', de: 'Guten Morgen', ja: 'おはよう', zh: '早上好' }
        }
        
        const translated = translations[text]?.[to] || `[Translated to ${to}: ${text}]`
        resolve(translated)
      }, 1000)
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudioMessage(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Microphone access denied or not available')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudioMessage = async (audioBlob) => {
    // 模拟语音识别和翻译
    const mockTranscription = "Hello, this is a voice message"
    
    const message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      avatar: currentUser.avatar,
      message: mockTranscription,
      timestamp: new Date(),
      isVoiceMessage: true,
      audioBlob: audioBlob
    }

    setMessages(prev => [...prev, message])
  }

  const MessageBubble = ({ message, isOwn }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md`}>
        <Avatar className="w-8 h-8 mx-2">
          <AvatarFallback>{message.avatar}</AvatarFallback>
        </Avatar>
        
        <div className={`px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {!isOwn && (
            <p className="text-xs font-medium mb-1 opacity-70">{message.userName}</p>
          )}
          
          {message.translated && (
            <div className="mb-2">
              <p className="text-xs opacity-70 mb-1">
                Original ({message.sourceLanguage}):
              </p>
              <p className="text-sm italic opacity-80">{message.originalMessage}</p>
              <div className="flex items-center mt-1">
                <Languages className="w-3 h-3 mr-1" />
                <span className="text-xs opacity-70">Translated</span>
              </div>
            </div>
          )}
          
          <p className="text-sm">{message.message}</p>
          
          {message.isVoiceMessage && (
            <div className="flex items-center mt-2">
              <Volume2 className="w-4 h-4 mr-2" />
              <span className="text-xs opacity-70">Voice message</span>
            </div>
          )}
          
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  )

  const UserList = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Online ({onlineUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center px-4 py-2 hover:bg-gray-50">
              <Avatar className="w-8 h-8 mr-3">
                <AvatarFallback>{user.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-xs text-gray-500 capitalize">{user.status}</span>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{roomName}</h1>
              <p className="text-sm text-gray-500">
                {isConnected ? (
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    Connecting...
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isTranslating ? "default" : "outline"}
                size="sm"
                onClick={() => setIsTranslating(!isTranslating)}
              >
                <Languages className="w-4 h-4 mr-2" />
                Translate
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Translation Settings */}
          <AnimatePresence>
            {isTranslating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">From:</span>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center">
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">To:</span>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center">
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.userId === currentUser.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Smile className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="pr-12"
              />
              {isTranslating && (
                <Badge className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
                  <Languages className="w-3 h-3 mr-1" />
                  {languages.find(l => l.code === targetLanguage)?.flag}
                </Badge>
              )}
            </div>
            
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center justify-center text-red-500"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 bg-red-500 rounded-full mr-2"
              />
              Recording... Release to send
            </motion.div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l">
        <UserList />
      </div>
    </div>
  )
}

export default RealTimeChat

