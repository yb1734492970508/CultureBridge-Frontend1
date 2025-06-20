import React, { createContext, useContext, useState, useEffect } from 'react';

// 语言配置
const languages = {
  zh: {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    translations: {
      // 导航
      'navigation.home': '首页',
      'navigation.chat': '聊天',
      'navigation.learning': '学习',
      'navigation.wallet': '钱包',
      'navigation.profile': '我的',
      'navigation.community': '社区',
      
      // 首页
      'home.welcome': '欢迎来到CultureBridge',
      'home.subtitle': '连接世界，交流文化',
      'home.exploreButton': '探索',
      'home.translate': '翻译',
      'home.featuredCultures': '精选文化',
      'home.recentActivities': '最近活动',
      'home.trendingTopics': '热门话题',
      'home.participants': '参与者',
      
      // 文化相关
      'home.japaneseTeaCeremony': '日本茶道',
      'home.japaneseTeaCeremonyDesc': '体验传统日式茶道的优雅与宁静',
      'home.italianCuisine': '意大利美食',
      'home.italianCuisineDesc': '学习正宗的意大利料理制作技巧',
      'home.indianYoga': '印度瑜伽',
      'home.indianYogaDesc': '探索古老的瑜伽修行智慧',
      'home.mexicanFiesta': '墨西哥节庆',
      'home.mexicanFiestaDesc': '感受热情洋溢的墨西哥文化',
      
      // 活动
      'home.activitySpanish': '与西班牙朋友练习口语',
      'home.activityChineseNewYear': '分享了中国新年习俗',
      'home.activityFrenchCourse': '完成了法语课程',
      'home.activityTime2h': '2小时前',
      'home.activityTime5h': '5小时前',
      'home.activityTime1d': '1天前',
      
      // 聊天
      'chat.title': '聊天',
      'chat.searchPlaceholder': '搜索聊天记录...',
      'chat.noMessages': '暂无消息',
      
      // 通用
      'common.seeAll': '查看全部',
      'common.loading': '加载中...',
      'common.error': '出错了',
      'common.retry': '重试',
      'common.cancel': '取消',
      'common.confirm': '确认',
      'common.save': '保存',
      'common.edit': '编辑',
      'common.delete': '删除',
      'common.share': '分享',
      'common.like': '点赞',
      'common.comment': '评论',
      
      // 用户相关
      'user.profile': '个人资料',
      'user.settings': '设置',
      'user.logout': '退出登录',
      'user.login': '登录',
      'user.register': '注册',
      'user.username': '用户名',
      'user.email': '邮箱',
      'user.password': '密码',
      
      // 学习
      'learning.title': '语言学习',
      'learning.progress': '学习进度',
      'learning.courses': '课程',
      'learning.vocabulary': '词汇',
      'learning.grammar': '语法',
      'learning.practice': '练习',
      
      // 钱包
      'wallet.title': 'CBT钱包',
      'wallet.balance': '余额',
      'wallet.transaction': '交易记录',
      'wallet.send': '发送',
      'wallet.receive': '接收',
      'wallet.history': '历史记录',
    }
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    translations: {
      // Navigation
      'navigation.home': 'Home',
      'navigation.chat': 'Chat',
      'navigation.learning': 'Learning',
      'navigation.wallet': 'Wallet',
      'navigation.profile': 'Profile',
      'navigation.community': 'Community',
      
      // Home
      'home.welcome': 'Welcome to CultureBridge',
      'home.subtitle': 'Connecting Worlds, Cultivating Understanding',
      'home.exploreButton': 'Explore',
      'home.translate': 'Translate',
      'home.featuredCultures': 'Featured Cultures',
      'home.recentActivities': 'Recent Activities',
      'home.trendingTopics': 'Trending Topics',
      'home.participants': 'participants',
      
      // Culture related
      'home.japaneseTeaCeremony': 'Japanese Tea Ceremony',
      'home.japaneseTeaCeremonyDesc': 'Experience the elegance and tranquility of traditional Japanese tea ceremony',
      'home.italianCuisine': 'Italian Cuisine',
      'home.italianCuisineDesc': 'Learn authentic Italian cooking techniques',
      'home.indianYoga': 'Indian Yoga',
      'home.indianYogaDesc': 'Explore ancient yoga wisdom and practices',
      'home.mexicanFiesta': 'Mexican Fiesta',
      'home.mexicanFiestaDesc': 'Feel the passionate and vibrant Mexican culture',
      
      // Activities
      'home.activitySpanish': 'Practiced speaking with Spanish friends',
      'home.activityChineseNewYear': 'Shared Chinese New Year traditions',
      'home.activityFrenchCourse': 'Completed French course',
      'home.activityTime2h': '2 hours ago',
      'home.activityTime5h': '5 hours ago',
      'home.activityTime1d': '1 day ago',
      
      // Chat
      'chat.title': 'Chat',
      'chat.searchPlaceholder': 'Search conversations...',
      'chat.noMessages': 'No messages yet',
      
      // Common
      'common.seeAll': 'See All',
      'common.loading': 'Loading...',
      'common.error': 'Something went wrong',
      'common.retry': 'Retry',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.share': 'Share',
      'common.like': 'Like',
      'common.comment': 'Comment',
      
      // User related
      'user.profile': 'Profile',
      'user.settings': 'Settings',
      'user.logout': 'Logout',
      'user.login': 'Login',
      'user.register': 'Register',
      'user.username': 'Username',
      'user.email': 'Email',
      'user.password': 'Password',
      
      // Learning
      'learning.title': 'Language Learning',
      'learning.progress': 'Progress',
      'learning.courses': 'Courses',
      'learning.vocabulary': 'Vocabulary',
      'learning.grammar': 'Grammar',
      'learning.practice': 'Practice',
      
      // Wallet
      'wallet.title': 'CBT Wallet',
      'wallet.balance': 'Balance',
      'wallet.transaction': 'Transactions',
      'wallet.send': 'Send',
      'wallet.receive': 'Receive',
      'wallet.history': 'History',
    }
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    translations: {
      'navigation.home': 'Inicio',
      'navigation.chat': 'Chat',
      'navigation.learning': 'Aprendizaje',
      'navigation.wallet': 'Billetera',
      'navigation.profile': 'Perfil',
      'navigation.community': 'Comunidad',
      
      'home.welcome': 'Bienvenido a CultureBridge',
      'home.subtitle': 'Conectando Mundos, Cultivando Comprensión',
      'home.exploreButton': 'Explorar',
      'home.translate': 'Traducir',
      'home.featuredCultures': 'Culturas Destacadas',
      'home.recentActivities': 'Actividades Recientes',
      'home.trendingTopics': 'Temas Populares',
      'home.participants': 'participantes',
      
      'chat.title': 'Chat',
      'chat.searchPlaceholder': 'Buscar conversaciones...',
      'chat.noMessages': 'Aún no hay mensajes',
      
      'common.seeAll': 'Ver Todo',
      'common.loading': 'Cargando...',
      'common.error': 'Algo salió mal',
      'common.retry': 'Reintentar',
    }
  },
  ja: {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵',
    translations: {
      'navigation.home': 'ホーム',
      'navigation.chat': 'チャット',
      'navigation.learning': '学習',
      'navigation.wallet': 'ウォレット',
      'navigation.profile': 'プロフィール',
      'navigation.community': 'コミュニティ',
      
      'home.welcome': 'CultureBridgeへようこそ',
      'home.subtitle': '世界をつなぎ、理解を深める',
      'home.exploreButton': '探索',
      'home.translate': '翻訳',
      'home.featuredCultures': '注目の文化',
      'home.recentActivities': '最近のアクティビティ',
      'home.trendingTopics': 'トレンドトピック',
      'home.participants': '参加者',
      
      'chat.title': 'チャット',
      'chat.searchPlaceholder': '会話を検索...',
      'chat.noMessages': 'まだメッセージがありません',
      
      'common.seeAll': 'すべて見る',
      'common.loading': '読み込み中...',
      'common.error': 'エラーが発生しました',
      'common.retry': '再試行',
    }
  },
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    translations: {
      'navigation.home': 'Accueil',
      'navigation.chat': 'Chat',
      'navigation.learning': 'Apprentissage',
      'navigation.wallet': 'Portefeuille',
      'navigation.profile': 'Profil',
      'navigation.community': 'Communauté',
      
      'home.welcome': 'Bienvenue sur CultureBridge',
      'home.subtitle': 'Connecter les Mondes, Cultiver la Compréhension',
      'home.exploreButton': 'Explorer',
      'home.translate': 'Traduire',
      'home.featuredCultures': 'Cultures en Vedette',
      'home.recentActivities': 'Activités Récentes',
      'home.trendingTopics': 'Sujets Tendance',
      'home.participants': 'participants',
      
      'chat.title': 'Chat',
      'chat.searchPlaceholder': 'Rechercher des conversations...',
      'chat.noMessages': 'Aucun message pour le moment',
      
      'common.seeAll': 'Voir Tout',
      'common.loading': 'Chargement...',
      'common.error': 'Une erreur s\'est produite',
      'common.retry': 'Réessayer',
    }
  }
};

// 国家/地区到语言的映射
const countryToLanguage = {
  'CN': 'zh', // 中国
  'TW': 'zh', // 台湾
  'HK': 'zh', // 香港
  'MO': 'zh', // 澳门
  'SG': 'zh', // 新加坡（部分中文用户）
  'US': 'en', // 美国
  'GB': 'en', // 英国
  'CA': 'en', // 加拿大
  'AU': 'en', // 澳大利亚
  'NZ': 'en', // 新西兰
  'IE': 'en', // 爱尔兰
  'ZA': 'en', // 南非
  'ES': 'es', // 西班牙
  'MX': 'es', // 墨西哥
  'AR': 'es', // 阿根廷
  'CO': 'es', // 哥伦比亚
  'PE': 'es', // 秘鲁
  'VE': 'es', // 委内瑞拉
  'CL': 'es', // 智利
  'EC': 'es', // 厄瓜多尔
  'GT': 'es', // 危地马拉
  'CU': 'es', // 古巴
  'BO': 'es', // 玻利维亚
  'DO': 'es', // 多米尼加
  'HN': 'es', // 洪都拉斯
  'PY': 'es', // 巴拉圭
  'SV': 'es', // 萨尔瓦多
  'NI': 'es', // 尼加拉瓜
  'CR': 'es', // 哥斯达黎加
  'PA': 'es', // 巴拿马
  'UY': 'es', // 乌拉圭
  'JP': 'ja', // 日本
  'FR': 'fr', // 法国
  'BE': 'fr', // 比利时（部分法语用户）
  'CH': 'fr', // 瑞士（部分法语用户）
  'LU': 'fr', // 卢森堡
  'MC': 'fr', // 摩纳哥
};

// 创建国际化上下文
const I18nContext = createContext();

// 国际化提供者组件
export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  const [isLoading, setIsLoading] = useState(true);

  // 检测用户的地理位置和语言偏好
  const detectUserLanguage = async () => {
    try {
      // 1. 首先检查本地存储的语言偏好
      const savedLanguage = localStorage.getItem('culturebridge_language');
      if (savedLanguage && languages[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
        setIsLoading(false);
        return;
      }

      // 2. 检测浏览器语言
      const browserLanguage = navigator.language || navigator.userLanguage;
      const languageCode = browserLanguage.split('-')[0];
      
      if (languages[languageCode]) {
        setCurrentLanguage(languageCode);
        setIsLoading(false);
        return;
      }

      // 3. 尝试通过IP地理位置检测
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        
        if (countryCode && countryToLanguage[countryCode]) {
          const detectedLanguage = countryToLanguage[countryCode];
          setCurrentLanguage(detectedLanguage);
        }
      } catch (geoError) {
        console.log('地理位置检测失败，使用默认语言');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('语言检测失败:', error);
      setCurrentLanguage('zh'); // 默认中文
      setIsLoading(false);
    }
  };

  useEffect(() => {
    detectUserLanguage();
  }, []);

  // 切换语言
  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('culturebridge_language', languageCode);
    }
  };

  // 翻译函数
  const t = (key, params = {}) => {
    const translation = languages[currentLanguage]?.translations[key] || key;
    
    // 支持参数替换
    return Object.keys(params).reduce((str, param) => {
      return str.replace(`{{${param}}}`, params[param]);
    }, translation);
  };

  // 获取当前语言信息
  const getCurrentLanguage = () => languages[currentLanguage];

  // 获取所有可用语言
  const getAvailableLanguages = () => Object.values(languages);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentLanguage,
    getAvailableLanguages,
    isLoading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// 使用国际化的Hook
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;

