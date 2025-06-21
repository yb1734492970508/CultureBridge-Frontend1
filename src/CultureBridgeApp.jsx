import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  MessageCircle, 
  BookOpen, 
  Users, 
  Star, 
  ArrowRight, 
  Play, 
  ChevronDown,
  Sparkles,
  Heart,
  Award,
  TrendingUp,
  Languages,
  Camera,
  Headphones,
  Video,
  Menu,
  X,
  Mic,
  Settings,
  User
} from 'lucide-react';

const CultureBridgeApp = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('zh');

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const heroSlides = [
    {
      title: currentLanguage === 'zh' ? "连接文化，桥接世界" : "Connect Cultures, Bridge Worlds",
      subtitle: currentLanguage === 'zh' 
        ? "通过AI驱动的实时翻译和文化交流，打破语言障碍，建立全球友谊"
        : "Break language barriers and build global friendships through AI-powered real-time translation and cultural exchange",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: currentLanguage === 'zh' ? "智能语言学习" : "Smart Language Learning",
      subtitle: currentLanguage === 'zh'
        ? "与母语者实时对话，在真实场景中提升语言技能"
        : "Practice with native speakers in real-time conversations and improve your language skills in authentic scenarios",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: currentLanguage === 'zh' ? "全球文化社区" : "Global Cultural Community",
      subtitle: currentLanguage === 'zh'
        ? "探索世界各地的文化传统，分享你的故事"
        : "Explore cultural traditions from around the world and share your own stories",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const features = [
    {
      icon: <Languages className="w-8 h-8" />,
      title: currentLanguage === 'zh' ? "实时翻译" : "Real-time Translation",
      description: currentLanguage === 'zh' 
        ? "支持50+语言的即时翻译，让沟通无障碍"
        : "Instant translation for 50+ languages, making communication barrier-free",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: currentLanguage === 'zh' ? "文化交流" : "Cultural Exchange",
      description: currentLanguage === 'zh'
        ? "与来自150+国家的用户分享文化体验"
        : "Share cultural experiences with users from 150+ countries",
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: currentLanguage === 'zh' ? "全球社区" : "Global Community",
      description: currentLanguage === 'zh'
        ? "加入活跃的全球社区，建立国际友谊"
        : "Join an active global community and build international friendships",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const stats = [
    { 
      number: "2M+", 
      label: currentLanguage === 'zh' ? "活跃用户" : "Active Users", 
      icon: <Users className="w-6 h-6" /> 
    },
    { 
      number: "150+", 
      label: currentLanguage === 'zh' ? "国家覆盖" : "Countries", 
      icon: <Globe className="w-6 h-6" /> 
    },
    { 
      number: "50+", 
      label: currentLanguage === 'zh' ? "支持语言" : "Languages", 
      icon: <Languages className="w-6 h-6" /> 
    },
    { 
      number: "98%", 
      label: currentLanguage === 'zh' ? "用户满意度" : "User Satisfaction", 
      icon: <Star className="w-6 h-6" /> 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CultureBridge</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={toggleLanguage}
                className="px-3 py-1 rounded-full bg-gray-100 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {currentLanguage === 'zh' ? 'EN' : '中文'}
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <User className="w-4 h-4" />
                <span>{currentLanguage === 'zh' ? '登录' : 'Login'}</span>
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all">
                {currentLanguage === 'zh' ? '开始聊天' : 'Start Chatting'}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-4">
                <button 
                  onClick={toggleLanguage}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-gray-100 text-sm font-medium"
                >
                  {currentLanguage === 'zh' ? 'English' : '中文'}
                </button>
                <button className="block w-full text-left px-3 py-2 text-gray-600">
                  {currentLanguage === 'zh' ? '登录' : 'Login'}
                </button>
                <button className="block w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-full">
                  {currentLanguage === 'zh' ? '开始聊天' : 'Start Chatting'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {heroSlides[currentSlide].title}
                </motion.h1>
                <motion.p 
                  className="text-xl text-gray-600 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {heroSlides[currentSlide].subtitle}
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                  <span>{currentLanguage === 'zh' ? '开始聊天' : 'Start Chatting'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 transition-all flex items-center justify-center space-x-2">
                  <span>{currentLanguage === 'zh' ? '加入社区' : 'Join Community'}</span>
                  <Users className="w-5 h-5" />
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2 text-blue-500">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    src={heroSlides[currentSlide].image}
                    alt="CultureBridge Hero"
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                  />
                </AnimatePresence>
                
                {/* Slide indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentLanguage === 'zh' ? '核心功能' : 'Core Features'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {currentLanguage === 'zh' 
                ? '通过先进的AI技术和直观的用户界面，让跨文化交流变得简单而有趣'
                : 'Make cross-cultural communication simple and fun through advanced AI technology and intuitive user interface'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-8 rounded-2xl transition-all duration-300 cursor-pointer ${
                  hoveredFeature === index 
                    ? 'transform scale-105 shadow-xl' 
                    : 'shadow-lg hover:shadow-xl'
                } ${feature.bgColor}`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-green-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {currentLanguage === 'zh' ? '准备好开始你的文化之旅了吗？' : 'Ready to Start Your Cultural Journey?'}
            </h2>
            <p className="text-xl text-blue-100">
              {currentLanguage === 'zh' 
                ? '加入数百万用户，体验无障碍的跨文化交流'
                : 'Join millions of users and experience barrier-free cross-cultural communication'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                {currentLanguage === 'zh' ? '立即开始' : 'Get Started Now'}
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
                {currentLanguage === 'zh' ? '了解更多' : 'Learn More'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CultureBridge</span>
              </div>
              <p className="text-gray-400">
                {currentLanguage === 'zh' 
                  ? '连接世界，分享文化，建立友谊。'
                  : 'Connecting the world, sharing cultures, building friendships.'
                }
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{currentLanguage === 'zh' ? '产品' : 'Product'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '实时翻译' : 'Real-time Translation'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '文化交流' : 'Cultural Exchange'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '语言学习' : 'Language Learning'}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{currentLanguage === 'zh' ? '公司' : 'Company'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '关于我们' : 'About Us'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '联系我们' : 'Contact'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '隐私政策' : 'Privacy Policy'}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{currentLanguage === 'zh' ? '支持' : 'Support'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '帮助中心' : 'Help Center'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '社区' : 'Community'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{currentLanguage === 'zh' ? '反馈' : 'Feedback'}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CultureBridge. {currentLanguage === 'zh' ? '保留所有权利。' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CultureBridgeApp;

