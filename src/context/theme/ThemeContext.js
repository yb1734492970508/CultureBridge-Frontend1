import React, { createContext, useContext, useState, useEffect } from 'react';

// 主题配置
const themes = {
  light: {
    name: 'light',
    displayName: '浅色主题',
    colors: {
      primary: '#6366f1',
      primaryHover: '#5855eb',
      secondary: '#f59e0b',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f8fafc',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
  },
  dark: {
    name: 'dark',
    displayName: '深色主题',
    colors: {
      primary: '#6366f1',
      primaryHover: '#5855eb',
      secondary: '#f59e0b',
      accent: '#10b981',
      background: '#0f172a',
      surface: '#1e293b',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
    },
  },
  auto: {
    name: 'auto',
    displayName: '跟随系统',
    colors: null, // 将根据系统偏好动态设置
  },
};

// 创建 Context
const ThemeContext = createContext();

// Provider 组件
export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');
  
  // 检测系统主题偏好
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    
    // 初始设置
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    
    // 监听变化
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // 从本地存储加载主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('culturebridge_theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);
  
  // 应用主题到 DOM
  useEffect(() => {
    const effectiveTheme = currentTheme === 'auto' ? systemPreference : currentTheme;
    const theme = themes[effectiveTheme];
    
    if (theme && theme.colors) {
      // 设置 CSS 变量
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVar}`, value);
      });
      
      // 设置 data-theme 属性
      root.setAttribute('data-theme', effectiveTheme);
    }
  }, [currentTheme, systemPreference]);
  
  // 保存主题设置到本地存储
  useEffect(() => {
    localStorage.setItem('culturebridge_theme', currentTheme);
  }, [currentTheme]);
  
  // 切换主题
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };
  
  // 获取当前有效主题
  const getEffectiveTheme = () => {
    return currentTheme === 'auto' ? systemPreference : currentTheme;
  };
  
  // 获取主题配置
  const getThemeConfig = (themeName = null) => {
    const targetTheme = themeName || getEffectiveTheme();
    return themes[targetTheme];
  };
  
  // 检查是否为深色主题
  const isDark = () => {
    return getEffectiveTheme() === 'dark';
  };
  
  // 切换深色/浅色主题
  const toggleTheme = () => {
    const effectiveTheme = getEffectiveTheme();
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };
  
  const value = {
    currentTheme,
    systemPreference,
    themes,
    setTheme,
    getEffectiveTheme,
    getThemeConfig,
    isDark,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook 使用 Context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;

