import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, MessageCircle, BookOpen, Users, Star, ArrowRight, Play, ChevronDown } from 'lucide-react';

const ModernHomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "文化沉浸",
      description: "深入体验来自世界各地的真实文化，由当地专家和社区成员指导。",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "语言交流",
      description: "通过有意义的文化对话和日常生活话题，自然地练习语言。",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "全球社区",
      description: "加入来自世界各地的学习者、教师和文化爱好者的多元化社区。",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const culturalSpotlights = [
    {
      emoji: "🍵",
      title: "日本茶道",
      description: "探索冥想式的茶艺准备艺术",
      learners: "1,247",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop"
    },
    {
      emoji: "💃",
      title: "西班牙弗拉明戈",
      description: "感受传统安达卢西亚舞蹈的激情",
      learners: "892",
      image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop"
    },
    {
      emoji: "🕯️",
      title: "北欧Hygge",
      description: "拥抱丹麦式舒适生活的艺术",
      learners: "2,156",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      country: "加拿大",
      text: "CultureBridge让我真正理解了不同文化的美妙之处。我不仅学会了日语，还深入了解了日本文化的精髓。",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Miguel Rodriguez",
      country: "墨西哥",
      text: "这个平台改变了我学习语言的方式。通过真实的文化交流，我的英语水平突飞猛进。",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Aisha Patel",
      country: "印度",
      text: "在这里我找到了志同道合的朋友，我们一起探索世界各地的文化传统。这是一次真正的全球之旅。",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="modern-homepage">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="navbar-brand flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">CultureBridge</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#cultures" className="nav-link">文化</a>
              <a href="#languages" className="nav-link">语言</a>
              <a href="#stories" className="nav-link">故事</a>
              <a href="#community" className="nav-link">社区</a>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/auth')}
              >
                登录
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/auth')}
              >
                免费加入
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative z-10 hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              体验世界上最沉浸式的
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                文化交流平台
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              与来自150+个国家的学习者连接，探索真实的文化体验
            </p>
            <motion.button
              className="btn btn-primary btn-lg inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
            >
              <span>开始你的旅程</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse delay-500"></div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-800">为什么选择 CultureBridge？</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们将现代技术与真实的文化体验相结合，创造独特的学习环境
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className={`feature-icon bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Spotlights */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-800">文化聚焦</h2>
            <p className="text-xl text-gray-600">探索我们社区的精选文化体验</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {culturalSpotlights.map((spotlight, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-6xl">{spotlight.emoji}</span>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{spotlight.title}</h3>
                  <p className="text-gray-600 mb-4">{spotlight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{spotlight.learners} 学习者</span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      了解更多 →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-800">用户心声</h2>
            <p className="text-xl text-gray-600">听听我们全球用户的真实体验</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">准备好开始你的文化之旅了吗？</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              加入我们的全球社区，与世界各地的人们连接，学习新语言，探索不同文化
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg"
                onClick={() => navigate('/auth')}
              >
                免费注册
              </button>
              <button 
                className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 btn-lg"
                onClick={() => navigate('/demo')}
              >
                观看演示
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">CultureBridge</span>
              </div>
              <p className="text-gray-400 mb-4">
                连接世界，交流文化。让每个人都能体验全球文化的美妙。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">语言学习</a></li>
                <li><a href="#" className="hover:text-white transition-colors">文化交流</a></li>
                <li><a href="#" className="hover:text-white transition-colors">社区</a></li>
                <li><a href="#" className="hover:text-white transition-colors">移动应用</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">服务条款</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">关注我们</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm">微</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm">推</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm">脸</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CultureBridge. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernHomePage;

