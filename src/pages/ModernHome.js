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
  X
} from 'lucide-react';

const ModernHomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('zh');

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const premiumFeatures = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: currentLanguage === 'zh' ? "沉浸式文化体验" : "Immersive Cultural Experience",
      description: currentLanguage === 'zh' 
        ? "通过AI驱动的个性化学习路径，深入探索150+国家的真实文化。从传统节庆到现代生活方式，体验最地道的文化精髓。"
        : "Explore authentic cultures from 150+ countries through AI-driven personalized learning paths. From traditional festivals to modern lifestyles, experience the most authentic cultural essence.",
      color: "from-emerald-400 via-teal-500 to-cyan-600",
      gradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
      stats: currentLanguage === 'zh' ? "150+ 国家" : "150+ Countries",
      badge: currentLanguage === 'zh' ? "AI 驱动" : "AI Powered"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: currentLanguage === 'zh' ? "智能语言交流" : "Smart Language Exchange",
      description: currentLanguage === 'zh'
        ? "实时语音翻译、智能语法纠正、文化语境解释。与母语者进行自然对话，在真实场景中提升语言技能。"
        : "Real-time voice translation, intelligent grammar correction, and cultural context explanation. Have natural conversations with native speakers and improve language skills in real scenarios.",
      color: "from-violet-400 via-purple-500 to-indigo-600",
      gradient: "bg-gradient-to-br from-violet-50 to-purple-50",
      stats: currentLanguage === 'zh' ? "50+ 语言" : "50+ Languages",
      badge: currentLanguage === 'zh' ? "实时翻译" : "Real-time Translation"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: currentLanguage === 'zh' ? "全球精英社区" : "Global Elite Community",
      description: currentLanguage === 'zh'
        ? "连接来自世界顶尖大学、跨国企业的文化爱好者。参与高质量的文化讨论，建立国际化的人脉网络。"
        : "Connect with culture enthusiasts from world-class universities and multinational companies. Participate in high-quality cultural discussions and build international networks.",
      color: "from-rose-400 via-pink-500 to-red-500",
      gradient: "bg-gradient-to-br from-rose-50 to-pink-50",
      stats: currentLanguage === 'zh' ? "100万+ 用户" : "1M+ Users",
      badge: currentLanguage === 'zh' ? "精英社区" : "Elite Community"
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
      label: currentLanguage === 'zh' ? "满意度" : "Satisfaction", 
      icon: <Heart className="w-6 h-6" /> 
    }
  ];

  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="modern-homepage overflow-hidden bg-white">
      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  CultureBridge
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  {currentLanguage === 'zh' ? '文化桥梁' : 'Cultural Bridge'}
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#experiences" className="nav-link-modern">
                {currentLanguage === 'zh' ? '文化体验' : 'Experiences'}
              </a>
              <a href="#languages" className="nav-link-modern">
                {currentLanguage === 'zh' ? '语言学习' : 'Languages'}
              </a>
              <a href="#community" className="nav-link-modern">
                {currentLanguage === 'zh' ? '社区' : 'Community'}
              </a>
              <a href="#stories" className="nav-link-modern">
                {currentLanguage === 'zh' ? '成功故事' : 'Stories'}
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button 
                onClick={toggleLanguage}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center space-x-1"
              >
                <Languages className="w-4 h-4" />
                <span>{currentLanguage === 'zh' ? 'EN' : '中文'}</span>
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Desktop Buttons */}
              <div className="hidden lg:flex items-center space-x-4">
                <button className="btn-secondary-modern">
                  {currentLanguage === 'zh' ? '登录' : 'Login'}
                </button>
                <button className="btn-primary-modern group">
                  <span>{currentLanguage === 'zh' ? '开启旅程' : 'Start Journey'}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 pb-4 border-t border-gray-100"
              >
                <div className="flex flex-col space-y-4 pt-4">
                  <a href="#experiences" className="text-gray-700 hover:text-emerald-600 font-medium">
                    {currentLanguage === 'zh' ? '文化体验' : 'Experiences'}
                  </a>
                  <a href="#languages" className="text-gray-700 hover:text-emerald-600 font-medium">
                    {currentLanguage === 'zh' ? '语言学习' : 'Languages'}
                  </a>
                  <a href="#community" className="text-gray-700 hover:text-emerald-600 font-medium">
                    {currentLanguage === 'zh' ? '社区' : 'Community'}
                  </a>
                  <a href="#stories" className="text-gray-700 hover:text-emerald-600 font-medium">
                    {currentLanguage === 'zh' ? '成功故事' : 'Stories'}
                  </a>
                  <div className="flex flex-col space-y-3 pt-4">
                    <button className="btn-secondary-modern w-full">
                      {currentLanguage === 'zh' ? '登录' : 'Login'}
                    </button>
                    <button className="btn-primary-modern w-full">
                      {currentLanguage === 'zh' ? '开启旅程' : 'Start Journey'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-modern relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"></div>
          
          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full opacity-60"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full opacity-60"
            animate={{
              y: [0, 20, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-700">
                {currentLanguage === 'zh' 
                  ? '全球首个AI驱动的文化交流平台' 
                  : 'World\'s First AI-Powered Cultural Exchange Platform'
                }
              </span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {currentLanguage === 'zh' ? '重新定义' : 'Redefining'}
              </span>
              <br />
              <span className="text-gray-800">
                {currentLanguage === 'zh' ? '文化学习体验' : 'Cultural Learning'}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl mb-12 text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {currentLanguage === 'zh' 
                ? '通过AI技术与真人导师的完美结合，为您打造个性化的文化探索之旅。让每一次交流都成为文化的桥梁。'
                : 'Through the perfect combination of AI technology and human mentors, we create personalized cultural exploration journeys. Making every interaction a bridge between cultures.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                className="btn-hero-primary group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
              >
                <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                <span>{currentLanguage === 'zh' ? '开始免费体验' : 'Start Free Trial'}</span>
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                className="btn-hero-secondary group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Video className="w-5 h-5 mr-2" />
                <span>{currentLanguage === 'zh' ? '观看演示' : 'Watch Demo'}</span>
              </motion.button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 md:mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-full px-6 py-3 mb-6">
              <Award className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                {currentLanguage === 'zh' ? '为什么选择我们' : 'Why Choose Us'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {currentLanguage === 'zh' ? '超越传统的' : 'Beyond Traditional'}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {currentLanguage === 'zh' ? '学习体验' : ' Learning Experience'}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {currentLanguage === 'zh'
                ? '我们将最先进的AI技术与人文关怀相结合，为您创造前所未有的文化学习体验'
                : 'We combine cutting-edge AI technology with human care to create unprecedented cultural learning experiences'
              }
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className={`feature-card-modern group ${feature.gradient} relative overflow-hidden`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/80 text-gray-700">
                    {feature.badge}
                  </span>
                </div>
                
                <div className={`feature-icon-modern bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">{feature.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-600">{feature.stats}</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                
                {/* Hover Effect */}
                <AnimatePresence>
                  {hoveredFeature === index && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {currentLanguage === 'zh' 
                ? '准备好开始您的文化之旅了吗？' 
                : 'Ready to Start Your Cultural Journey?'
              }
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {currentLanguage === 'zh'
                ? '加入全球200万用户，探索世界文化，学习新语言，结交国际朋友。'
                : 'Join 2 million global users to explore world cultures, learn new languages, and make international friends.'
              }
            </p>
            <motion.button
              className="btn-cta-primary group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{currentLanguage === 'zh' ? '立即开始免费体验' : 'Start Free Trial Now'}</span>
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ModernHomePage;

