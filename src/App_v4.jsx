/**
 * CultureBridge - 跨文化交流平台
 * 主应用组件 - 增强版 v2.0
 */

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, 
  Users, 
  MessageCircle, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  Play,
  Star,
  Heart,
  Share2,
  Menu,
  X,
  Mic,
  Languages,
  Video,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import RealTimeChat from './components/RealTimeChat.jsx'
import VoiceTranslator from './components/VoiceTranslator.jsx'
import './App.css'

// API服务
const API_BASE_URL = 'http://localhost:5000'

const apiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  },

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  },

  async healthCheck() {
    return this.get('/health')
  },

  async getCultures(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/api/cultures?${queryString}` : '/api/cultures'
    return this.get(endpoint)
  },

  async getChatRooms() {
    return this.get('/api/chat/rooms')
  },

  async getUser(userId) {
    return this.get(`/api/users/${userId}`)
  }
}

// 主页组件
function HomePage() {
  const [cultures, setCultures] = useState([])
  const [chatRooms, setChatRooms] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('explore')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentView, setCurrentView] = useState('home') // home, chat, translator

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [culturesResponse, chatRoomsResponse, userResponse] = await Promise.all([
        apiService.getCultures({ limit: 6 }),
        apiService.getChatRooms(),
        apiService.getUser('user1').catch(() => null)
      ])

      setCultures(culturesResponse.data || [])
      setChatRooms(chatRoomsResponse.data || [])
      setUserStats(userResponse?.data || null)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{trend}%</span>
            </div>
          )}
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
    </motion.div>
  )

  const CultureCard = ({ culture }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
        <span className="text-4xl">{culture.image}</span>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{culture.category}</Badge>
          <span className="text-sm text-muted-foreground">{culture.difficulty}</span>
        </div>
        <CardTitle className="text-lg">{culture.title}</CardTitle>
        <CardDescription className="line-clamp-2">{culture.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            <span>{culture.participants} participants</span>
          </div>
          <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
            Explore
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ChatRoomCard = ({ room }) => (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setCurrentView('chat')}>
      <CardContent className="flex items-center p-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl mr-4">
          {room.language}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{room.name}</h4>
          <p className="text-sm text-muted-foreground truncate">{room.lastMessage}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-500 text-sm mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            {room.online} online
          </div>
          <span className="text-xs text-muted-foreground">{room.members} members</span>
        </div>
      </CardContent>
    </Card>
  )

  const FeatureCard = ({ icon: Icon, title, description, onClick, color = "from-blue-500 to-purple-500" }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // 如果是聊天视图
  if (currentView === 'chat') {
    return (
      <div className="h-screen">
        <div className="bg-white border-b px-4 py-2 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')}>
            ← Back to Home
          </Button>
        </div>
        <RealTimeChat />
      </div>
    )
  }

  // 如果是翻译器视图
  if (currentView === 'translator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white border-b px-4 py-2 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')}>
            ← Back to Home
          </Button>
        </div>
        <VoiceTranslator />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CultureBridge
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#explore" className="text-gray-700 hover:text-blue-600 transition-colors">Explore</a>
              <Button variant="ghost" onClick={() => setCurrentView('chat')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button variant="ghost" onClick={() => setCurrentView('translator')}>
                <Languages className="w-4 h-4 mr-2" />
                Translate
              </Button>
              <Button>Get Started</Button>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 py-2 space-y-2">
                <a href="#explore" className="block py-2 text-gray-700 hover:text-blue-600">Explore</a>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('chat')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('translator')}>
                  <Languages className="w-4 h-4 mr-2" />
                  Translate
                </Button>
                <Button className="w-full mt-2">Get Started</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              Connect <span className="text-yellow-300">Cultures</span>
            </motion.h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Bridge languages, explore traditions, and build friendships across the globe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <Play className="w-5 h-5 mr-2" />
                Start Exploring
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                Join Community
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {userStats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Your Journey
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Award}
              title="Total Points"
              value={userStats.points?.toLocaleString()}
              color="from-yellow-400 to-orange-500"
              trend={12}
            />
            <StatCard
              icon={Globe}
              title="Cultures Explored"
              value={userStats.culturesExplored}
              color="from-green-400 to-blue-500"
              trend={8}
            />
            <StatCard
              icon={Users}
              title="Friends Connected"
              value={userStats.friendsConnected}
              color="from-purple-400 to-pink-500"
              trend={15}
            />
            <StatCard
              icon={Sparkles}
              title="Current Streak"
              value={`${userStats.streak} days`}
              color="from-blue-400 to-purple-500"
              trend={5}
            />
          </div>
        </section>
      )}

      {/* New Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          🚀 New Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={MessageCircle}
            title="Real-time Chat"
            description="Join global conversations with instant translation"
            onClick={() => setCurrentView('chat')}
            color="from-green-400 to-blue-500"
          />
          <FeatureCard
            icon={Mic}
            title="Voice Translator"
            description="Speak in any language, get instant translations"
            onClick={() => setCurrentView('translator')}
            color="from-purple-400 to-pink-500"
          />
          <FeatureCard
            icon={Video}
            title="Video Calls"
            description="Face-to-face conversations with live translation"
            onClick={() => alert('Video calls coming soon!')}
            color="from-red-400 to-orange-500"
          />
          <FeatureCard
            icon={Phone}
            title="Voice Calls"
            description="Practice speaking with native speakers"
            onClick={() => alert('Voice calls coming soon!')}
            color="from-indigo-400 to-purple-500"
          />
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-2 shadow-lg">
            {[
              { id: 'explore', label: 'Explore Cultures', icon: Globe },
              { id: 'chat', label: 'Global Chat', icon: MessageCircle },
              { id: 'learn', label: 'Learn Languages', icon: BookOpen }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                onClick={() => setActiveTab(id)}
                className="rounded-full"
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">
                Discover Amazing Cultures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cultures.map((culture) => (
                  <CultureCard key={culture._id} culture={culture} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">
                Join Global Conversations
              </h2>
              <div className="max-w-4xl mx-auto space-y-4">
                {chatRooms.map((room) => (
                  <ChatRoomCard key={room._id} room={room} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">
                Master New Languages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Spanish', flag: '🇪🇸', level: 'Intermediate', progress: 68 },
                  { name: 'Japanese', flag: '🇯🇵', level: 'Beginner', progress: 23 },
                  { name: 'French', flag: '🇫🇷', level: 'Advanced', progress: 89 }
                ].map((lang) => (
                  <Card key={lang.name} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">{lang.flag}</div>
                      <h3 className="text-xl font-semibold mb-2">{lang.name}</h3>
                      <Badge variant="secondary" className="mb-4">{lang.level}</Badge>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span>{lang.progress}%</span>
                        </div>
                        <Progress value={lang.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Ready to Bridge Cultures?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8 opacity-90"
          >
            Join thousands of cultural explorers and language learners worldwide
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">CultureBridge</span>
              </div>
              <p className="text-gray-400">
                Connecting cultures and bridging languages worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Real-time Translation</li>
                <li>Cultural Exploration</li>
                <li>Global Chat Rooms</li>
                <li>Language Learning</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Join Discussions</li>
                <li>Find Language Partners</li>
                <li>Cultural Events</li>
                <li>Achievement System</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CultureBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

