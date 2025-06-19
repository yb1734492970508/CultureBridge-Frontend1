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
  Video
} from 'lucide-react';

const PremiumHomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState(null);

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
      title: "沉浸式文化体验",
      description: "通过AI驱动的个性化学习路径，深入探索150+国家的真实文化。从传统节庆到现代生活方式，体验最地道的文化精髓。",
      color: "from-emerald-400 via-teal-500 to-cyan-600",
      gradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
      stats: "150+ 国家",
      badge: "AI 驱动"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "智能语言交流",
      description: "实时语音翻译、智能语法纠正、文化语境解释。与母语者进行自然对话，在真实场景中提升语言技能。",
      color: "from-violet-400 via-purple-500 to-indigo-600",
      gradient: "bg-gradient-to-br from-violet-50 to-purple-50",
      stats: "50+ 语言",
      badge: "实时翻译"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "全球精英社区",
      description: "连接来自世界顶尖大学、跨国企业的文化爱好者。参与高质量的文化讨论，建立国际化的人脉网络。",
      color: "from-rose-400 via-pink-500 to-red-500",
      gradient: "bg-gradient-to-br from-rose-50 to-pink-50",
      stats: "100万+ 用户",
      badge: "精英社区"
    }
  ];

  const culturalExperiences = [
    {
      emoji: "🎋",
      title: "日本茶道艺术",
      description: "在京都茶师的指导下，学习千年传承的茶道精神",
      participants: "2,847",
      rating: 4.9,
      image: "/api/placeholder/400/300",
      category: "传统艺术",
      duration: "45分钟",
      level: "初学者友好"
    },
    {
      emoji: "🎭",
      title: "意大利歌剧鉴赏",
      description: "探索威尼斯歌剧院的华丽世界，感受意式浪漫",
      participants: "1,923",
      rating: 4.8,
      image: "/api/placeholder/400/300",
      category: "表演艺术",
      duration: "60分钟",
      level: "中级"
    },
    {
      emoji: "🏺",
      title: "希腊神话探秘",
      description: "在雅典考古学家的带领下，重现古希腊文明",
      participants: "3,156",
      rating: 4.9,
      image: "/api/placeholder/400/300",
      category: "历史文化",
      duration: "90分钟",
      level: "深度体验"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      title: "斯坦福大学教授",
      country: "美国",
      text: "CultureBridge彻底改变了我对跨文化教育的认知。这里的学习体验如此真实和深入，我的学生们都爱上了文化探索。",
      rating: 5,
      avatar: "/api/placeholder/100/100",
      verified: true,
      achievement: "文化大使"
    },
    {
      name: "Miguel Rodriguez",
      title: "联合国翻译官",
      country: "西班牙",
      text: "作为专业翻译，我深知语言背后的文化重要性。CultureBridge提供的文化语境学习是我见过最优秀的。",
      rating: 5,
      avatar: "/api/placeholder/100/100",
      verified: true,
      achievement: "语言专家"
    },
    {
      name: "Aisha Patel",
      title: "Google 产品经理",
      country: "印度",
      text: "在这个全球化的时代，CultureBridge帮助我建立了真正的国际视野。这不仅是学习，更是一次心灵的旅程。",
      rating: 5,
      avatar: "/api/placeholder/100/100",
      verified: true,
      achievement: "全球视野"
    }
  ];

  const stats = [
    { number: "2M+", label: "活跃用户", icon: <Users className="w-6 h-6" /> },
    { number: "150+", label: "国家覆盖", icon: <Globe className="w-6 h-6" /> },
    { number: "50+", label: "支持语言", icon: <Languages className="w-6 h-6" /> },
    { number: "98%", label: "满意度", icon: <Heart className="w-6 h-6" /> }
  ];

  return (
    <div className="premium-homepage overflow-hidden">
      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
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
                <div className="text-xs text-gray-500 font-medium">Premium Experience</div>
              </div>
            </motion.div>

            <div className="hidden lg:flex items-center space-x-8">
              <a href="#experiences" className="nav-link-premium">文化体验</a>
              <a href="#languages" className="nav-link-premium">语言学习</a>
              <a href="#community" className="nav-link-premium">精英社区</a>
              <a href="#stories" className="nav-link-premium">成功故事</a>
            </div>

            <div className="flex items-center space-x-4">
              <button className="btn-secondary-premium">
                登录
              </button>
              <button className="btn-primary-premium group">
                <span>开启旅程</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section className="hero-premium relative min-h-screen flex items-center justify-center overflow-hidden">
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
          <motion.div
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full opacity-40"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 6,
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
              <span className="text-sm font-semibold text-gray-700">全球首个AI驱动的文化交流平台</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                重新定义
              </span>
              <br />
              <span className="text-gray-800">文化学习体验</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-gray-600 max-w-4xl mx-auto leading-relaxed">
              通过AI技术与真人导师的完美结合，为您打造个性化的文化探索之旅。
              <br />
              <span className="text-emerald-600 font-semibold">让每一次交流都成为文化的桥梁</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                className="btn-hero-primary group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
              >
                <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                <span>开始免费体验</span>
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                className="btn-hero-secondary group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Video className="w-5 h-5 mr-2" />
                <span>观看演示</span>
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
                  <div className="text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-full px-6 py-3 mb-6">
              <Award className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">为什么选择我们</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-800">
              超越传统的
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                学习体验
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们将最先进的AI技术与人文关怀相结合，为您创造前所未有的文化学习体验
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className={`premium-feature-card group ${feature.gradient} relative overflow-hidden`}
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
                
                <div className={`feature-icon-premium bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                
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

      {/* Cultural Experiences */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-full px-6 py-3 mb-6">
              <Camera className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-semibold text-violet-700">精选体验</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-800">
              沉浸式
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                文化探索
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              由文化专家精心策划的体验课程，让您在舒适的环境中探索世界各地的文化瑰宝
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {culturalExperiences.map((experience, index) => (
              <motion.div
                key={index}
                className="premium-experience-card group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -12 }}
              >
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl opacity-80">{experience.emoji}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700">
                      {experience.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-semibold text-gray-700">{experience.rating}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full bg-white/90 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-semibold text-gray-800 hover:bg-white transition-colors">
                      立即体验
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    {experience.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{experience.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{experience.duration}</span>
                    <span>{experience.level}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{experience.participants} 参与者</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-full px-6 py-3 mb-6">
              <Heart className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-semibold text-rose-700">用户心声</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-800">
              来自全球精英的
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                真实评价
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              听听来自世界顶尖大学、知名企业的用户如何评价他们的CultureBridge体验
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="premium-testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-8 text-lg leading-relaxed italic">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      {testimonial.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                      <p className="text-xs text-gray-500">{testimonial.country}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700">
                      {testimonial.achievement}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white">限时优惠</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              开启您的
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                文化探索之旅
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              加入200万+全球用户，体验最先进的AI文化学习平台
              <br />
              <span className="font-semibold">前1000名用户享受终身VIP特权</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button 
                className="btn-cta-primary group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                <span>立即免费开始</span>
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button 
                className="btn-cta-secondary group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Headphones className="w-5 h-5 mr-2" />
                <span>预约专属顾问</span>
              </motion.button>
            </div>
            
            <div className="mt-12 text-sm opacity-75">
              <p>✨ 无需信用卡 • 🎯 个性化学习路径 • 🌍 全球认证证书</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">CultureBridge</span>
                  <div className="text-xs text-gray-400">Premium Experience</div>
                </div>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed">
                全球领先的AI驱动文化交流平台，致力于连接世界各地的文化爱好者，
                打造最具影响力的国际化学习社区。
              </p>
              <div className="flex space-x-4">
                {['微信', '微博', 'LinkedIn', 'Twitter'].map((social, index) => (
                  <a 
                    key={index}
                    href="#" 
                    className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300 group"
                  >
                    <span className="text-sm group-hover:text-white">{social.charAt(0)}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">产品服务</h3>
              <ul className="space-y-4 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">AI文化导师</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">实时语言交流</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">文化沉浸体验</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">全球认证课程</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">学习资源</h3>
              <ul className="space-y-4 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">文化百科</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">语言工具</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">学习指南</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">成功案例</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">支持中心</h3>
              <ul className="space-y-4 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">帮助文档</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">联系客服</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">用户社区</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">反馈建议</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 lg:mb-0">
                &copy; 2024 CultureBridge. 保留所有权利。
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-emerald-400 transition-colors">隐私政策</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">服务条款</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Cookie政策</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PremiumHomePage;

