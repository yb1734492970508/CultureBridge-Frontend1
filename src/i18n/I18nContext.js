import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

// 创建国际化上下文
const I18nContext = createContext();

// 获取浏览器语言
const getBrowserLanguage = () => {
  const language = navigator.language || navigator.userLanguage;
  if (language.startsWith('zh')) return 'zh';
  if (language.startsWith('ja')) return 'ja';
  if (language.startsWith('es')) return 'es';
  return 'en'; // 默认英语
};

// 国际化提供者组件
export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // 优先从localStorage获取，否则使用浏览器语言
    return localStorage.getItem('culturebridge_language') || getBrowserLanguage();
  });

  // 切换语言
  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('culturebridge_language', language);
  };

  // 翻译函数
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // 如果找不到翻译，尝试使用英语作为后备
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          } else {
            return key; // 如果英语也没有，返回原始key
          }
        }
        break;
      }
    }
    
    return value || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations)
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

