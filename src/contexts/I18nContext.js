import React, { createContext, useContext, useState, useEffect } from 'react';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = {
  'zh-CN': {
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳',
    rtl: false
  },
  'zh-TW': {
    name: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    rtl: false
  },
  'en': {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  'ja': {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false
  },
  'ko': {
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false
  },
  'es': {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false
  },
  'fr': {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false
  },
  'de': {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false
  },
  'ar': {
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true
  },
  'ru': {
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    rtl: false
  }
};

// 默认语言
const DEFAULT_LANGUAGE = 'zh-CN';

// 国际化上下文
const I18nContext = createContext();

/**
 * 国际化提供者组件
 */
export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 从本地存储加载语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('culturebridge_language');
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    } else {
      // 检测浏览器语言
      const browserLanguage = navigator.language || navigator.languages[0];
      const detectedLanguage = Object.keys(SUPPORTED_LANGUAGES).find(lang => 
        browserLanguage.startsWith(lang) || browserLanguage.startsWith(lang.split('-')[0])
      );
      if (detectedLanguage) {
        setCurrentLanguage(detectedLanguage);
      }
    }
  }, []);

  // 加载翻译文件
  const loadTranslations = async (language) => {
    if (translations[language]) {
      return translations[language];
    }

    setLoading(true);
    setError(null);

    try {
      // 动态导入翻译文件
      const translationModule = await import(`../../locales/${language}.json`);
      const translationData = translationModule.default;

      setTranslations(prev => ({
        ...prev,
        [language]: translationData
      }));

      return translationData;
    } catch (err) {
      console.error(`加载语言包失败: ${language}`, err);
      setError(`加载语言包失败: ${language}`);
      
      // 回退到默认语言
      if (language !== DEFAULT_LANGUAGE) {
        return loadTranslations(DEFAULT_LANGUAGE);
      }
      
      return {};
    } finally {
      setLoading(false);
    }
  };

  // 切换语言
  const changeLanguage = async (language) => {
    if (!SUPPORTED_LANGUAGES[language]) {
      console.error(`不支持的语言: ${language}`);
      return;
    }

    setCurrentLanguage(language);
    localStorage.setItem('culturebridge_language', language);
    
    // 加载新语言的翻译
    await loadTranslations(language);
    
    // 更新HTML lang属性
    document.documentElement.lang = language;
    
    // 更新HTML dir属性（用于RTL语言）
    document.documentElement.dir = SUPPORTED_LANGUAGES[language].rtl ? 'rtl' : 'ltr';
  };

  // 翻译函数
  const t = (key, params = {}) => {
    const currentTranslations = translations[currentLanguage] || {};
    
    // 支持嵌套键，如 'common.buttons.save'
    const keys = key.split('.');
    let value = currentTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果找不到翻译，返回键名
        console.warn(`翻译缺失: ${key} (${currentLanguage})`);
        return key;
      }
    }

    // 如果value不是字符串，返回键名
    if (typeof value !== 'string') {
      console.warn(`翻译值类型错误: ${key} (${currentLanguage})`);
      return key;
    }

    // 参数替换
    let result = value;
    Object.keys(params).forEach(param => {
      const placeholder = `{{${param}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), params[param]);
    });

    return result;
  };

  // 格式化数字
  const formatNumber = (number, options = {}) => {
    try {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    } catch (err) {
      console.error('数字格式化失败:', err);
      return number.toString();
    }
  };

  // 格式化日期
  const formatDate = (date, options = {}) => {
    try {
      return new Intl.DateTimeFormat(currentLanguage, options).format(new Date(date));
    } catch (err) {
      console.error('日期格式化失败:', err);
      return date.toString();
    }
  };

  // 格式化货币
  const formatCurrency = (amount, currency = 'USD', options = {}) => {
    try {
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency,
        ...options
      }).format(amount);
    } catch (err) {
      console.error('货币格式化失败:', err);
      return `${amount} ${currency}`;
    }
  };

  // 获取当前语言信息
  const getCurrentLanguageInfo = () => {
    return SUPPORTED_LANGUAGES[currentLanguage];
  };

  // 检查是否为RTL语言
  const isRTL = () => {
    return SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false;
  };

  // 初始化时加载当前语言的翻译
  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    translations: translations[currentLanguage] || {},
    loading,
    error,
    changeLanguage,
    t,
    formatNumber,
    formatDate,
    formatCurrency,
    getCurrentLanguageInfo,
    isRTL
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

/**
 * 使用国际化的Hook
 */
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

/**
 * 语言选择器组件
 */
export const LanguageSelector = ({ className = "" }) => {
  const { currentLanguage, supportedLanguages, changeLanguage, loading } = useI18n();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLanguageChange = async (language) => {
    await changeLanguage(language);
    setShowDropdown(false);
  };

  return (
    <div className={`language-selector ${className}`}>
      <button
        className="language-button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
      >
        <span className="language-flag">
          {supportedLanguages[currentLanguage]?.flag}
        </span>
        <span className="language-name">
          {supportedLanguages[currentLanguage]?.nativeName}
        </span>
        <span className="dropdown-arrow">
          {showDropdown ? '▲' : '▼'}
        </span>
      </button>

      {showDropdown && (
        <div className="language-dropdown">
          {Object.entries(supportedLanguages).map(([code, info]) => (
            <button
              key={code}
              className={`language-option ${code === currentLanguage ? 'active' : ''}`}
              onClick={() => handleLanguageChange(code)}
            >
              <span className="option-flag">{info.flag}</span>
              <span className="option-name">{info.nativeName}</span>
              {code === currentLanguage && (
                <span className="option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="language-loading">
          <div className="loading-spinner small" />
        </div>
      )}
    </div>
  );
};

export default I18nProvider;

