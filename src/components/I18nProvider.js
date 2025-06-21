import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectUserLanguage, getTranslation, supportedLanguages, isRTLLanguage } from '../i18n';

// 创建国际化上下文
const I18nContext = createContext();

// 国际化提供者组件
export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初始化语言设置
    const initLanguage = async () => {
      try {
        // 检测用户语言
        const detectedLanguage = detectUserLanguage();
        setCurrentLanguage(detectedLanguage);
        
        // 设置文档方向
        document.dir = isRTLLanguage(detectedLanguage) ? 'rtl' : 'ltr';
        document.documentElement.lang = detectedLanguage;
        
        setIsLoading(false);
      } catch (error) {
        console.error('Language initialization failed:', error);
        setCurrentLanguage('zh');
        setIsLoading(false);
      }
    };

    initLanguage();
  }, []);

  const changeLanguage = (language) => {
    if (supportedLanguages.find(lang => lang.code === language)) {
      setCurrentLanguage(language);
      localStorage.setItem('culturebridge_language', language);
      
      // 更新文档方向和语言
      document.dir = isRTLLanguage(language) ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  };

  const t = (key, params = {}) => {
    return getTranslation(key, currentLanguage, params);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isRTL: isRTLLanguage(currentLanguage),
    supportedLanguages,
    isLoading
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// 使用国际化的 Hook
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// 语言切换组件
export const LanguageSwitcher = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useI18n();

  return (
    <div className={`language-switcher ${className}`}>
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default I18nProvider;

