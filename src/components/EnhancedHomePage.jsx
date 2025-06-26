/**
 * CultureBridge 增强版主页组件
 * 现代化UI设计，集成后端API
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Share2
} from 'lucide-react';
import apiService from '../services/api';

const EnhancedHomePage = () => {
  const [cultures, setCultures] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载数据
      const [culturesResponse, chatRoomsResponse, userResponse] = await Promise.all([
        apiService.getCultures({ limit: 6 }),
        apiService.getChatRooms(),
        apiService.getUser('user1').catch(() => null) // 如果用户未登录，忽略错误
      ]);

      setCultures(culturesResponse.data || []);
      setChatRooms(chatRoomsResponse.data || []);
      setUserStats(userResponse?.data || null);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <motion.div
      variants={itemVariants}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-lg`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
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
  );

  const CultureCard = ({ culture }) => (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
        <span className="text-4xl">{culture.image}</span>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
            {culture.category}
          </span>
          <span className="text-sm text-gray-500">{culture.difficulty}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{culture.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{culture.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>{culture.participants} participants</span>
          </div>
          <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:translate-x-1 transition-transform">
            Explore
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const ChatRoomCard = ({ room }) => (
    <motion.div
      variants={itemVariants}
      className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
      whileHover={{ scale: 1.02 }}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl mr-4">
        {room.language}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{room.name}</h4>
        <p className="text-sm text-gray-600 truncate">{room.lastMessage}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center text-green-500 text-sm mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          {room.online} online
        </div>
        <span className="text-xs text-gray-500">{room.members} members</span>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div variants={itemVariants} className="text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              Connect <span className="text-yellow-300">Cultures</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
            >
              Bridge languages, explore traditions, and build friendships across the globe
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Start Exploring
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors">
                Join Community
              </button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full"
        />
      </motion.section>

      {/* Stats Section */}
      {userStats && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center mb-12">
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
        </motion.section>
      )}

      {/* Main Content Tabs */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-2 shadow-lg">
            {[
              { id: 'explore', label: 'Explore Cultures', icon: Globe },
              { id: 'chat', label: 'Global Chat', icon: MessageCircle },
              { id: 'learn', label: 'Learn Languages', icon: BookOpen }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
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
                  <motion.div
                    key={lang.name}
                    variants={itemVariants}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">{lang.flag}</div>
                      <h3 className="text-xl font-semibold mb-2">{lang.name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                        {lang.level}
                      </span>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{lang.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${lang.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-6">
            Ready to Bridge Cultures?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl mb-8 opacity-90">
            Join thousands of cultural explorers and language learners worldwide
          </motion.p>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Today
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
};

export default EnhancedHomePage;

