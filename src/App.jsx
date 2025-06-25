import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Globe, 
  MessageCircle, 
  Mic, 
  Users, 
  Heart, 
  Star, 
  ArrowRight, 
  Play,
  Menu,
  X,
  Languages,
  Zap,
  Shield,
  Award,
  BookOpen,
  Camera
} from 'lucide-react';
import './App.css';

// 导入图片
import heroImage from './assets/hero-cultural-exchange.jpg';
import diversityImage from './assets/cultural-diversity.png';
import inclusionImage from './assets/diversity-inclusion.jpg';

// 导航组件
const Navigation = ({ isMenuOpen, setIsMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CultureBridge</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">功能特色</a>
            <a href="#community" className="text-gray-700 hover:text-blue-600 transition-colors">社区</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">关于我们</a>
            <Button variant="outline" className="mr-2">登录</Button>
            <Button>开始体验</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-700 hover:text-blue-600">功能特色</a>
              <a href="#community" className="block text-gray-700 hover:text-blue-600">社区</a>
              <a href="#about" className="block text-gray-700 hover:text-blue-600">关于我们</a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline">登录</Button>
                <Button>开始体验</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// 英雄区域组件
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Cultural Exchange" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60"></div>
      </div>

      {/* 内容 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            连接世界
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              分享文化
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            通过AI驱动的实时翻译和智能推荐系统，打破语言障碍，促进全球文化交流与理解
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
              <Play className="mr-2 h-5 w-5" />
              立即开始
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg">
              了解更多
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* 统计数据 */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">100K+</div>
              <div className="text-gray-300">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
              <div className="text-gray-300">支持语言</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">1M+</div>
              <div className="text-gray-300">文化内容</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">24/7</div>
              <div className="text-gray-300">在线交流</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 滚动指示器 */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
};

// 功能特色组件
const FeaturesSection = () => {
  const features = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "AI实时语音翻译",
      description: "支持50+语言的实时语音翻译，让跨语言交流如母语般自然流畅",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "积分奖励系统",
      description: "通过分享优质内容和积极参与文化交流获得积分奖励，解锁更多功能",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "全球文化社区",
      description: "连接世界各地的文化爱好者，分享独特的文化体验和见解",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "安全可信",
      description: "严格的内容审核和用户认证机制，确保交流环境的安全可信",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "智能推荐",
      description: "AI驱动的个性化内容推荐，发现你感兴趣的文化内容和交流伙伴",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "文化学习",
      description: "丰富的文化课程和学习资源，深入了解不同文化的历史和传统",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            创新功能特色
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            结合最新的AI技术和智能推荐算法，为您提供前所未有的跨文化交流体验
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 社区展示组件
const CommunitySection = () => {
  return (
    <section id="community" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              加入全球文化社区
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              与来自世界各地的文化爱好者连接，分享你的文化故事，探索未知的文化世界。
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">实时文化交流</h3>
                  <p className="text-gray-600">通过文字、语音、视频等多种方式，与全球用户进行实时文化交流</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">文化内容分享</h3>
                  <p className="text-gray-600">分享你的文化体验、传统习俗、美食文化等，获得积分奖励和社区认可</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">专家指导</h3>
                  <p className="text-gray-600">文化专家和语言教师提供专业指导，帮助你更深入地理解不同文化</p>
                </div>
              </div>
            </div>

            <Button size="lg" className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              立即加入社区
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src={diversityImage} 
              alt="Cultural Diversity" 
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Languages className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-gray-600">支持语言</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// 页脚组件
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">CultureBridge</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              连接世界文化，促进跨文化理解与交流的创新平台。通过AI技术和智能推荐，让文化交流变得更加简单、有趣、有价值。
            </p>
            <div className="flex space-x-4">
              <Badge variant="secondary">AI翻译</Badge>
              <Badge variant="secondary">智能推荐</Badge>
              <Badge variant="secondary">文化交流</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">产品功能</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">实时翻译</a></li>
              <li><a href="#" className="hover:text-white transition-colors">文化社区</a></li>
              <li><a href="#" className="hover:text-white transition-colors">积分系统</a></li>
              <li><a href="#" className="hover:text-white transition-colors">移动应用</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">关于我们</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">公司介绍</a></li>
              <li><a href="#" className="hover:text-white transition-colors">团队成员</a></li>
              <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
              <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 CultureBridge. All rights reserved. | 让世界文化无界交流</p>
        </div>
      </div>
    </footer>
  );
};

// 主应用组件
function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Router>
      <div className="App min-h-screen bg-white">
        <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <FeaturesSection />
              <CommunitySection />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

