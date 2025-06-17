import React, { createContext, useContext, useState, useEffect } from 'react';

// 支持的主题列表
export const SUPPORTED_THEMES = {
  light: {
    name: 'Light',
    displayName: '浅色模式',
    icon: '☀️',
    colors: {
      primary: '#6366f1',
      primaryHover: '#5855eb',
      secondary: '#f3f4f6',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  dark: {
    name: 'Dark',
    displayName: '深色模式',
    icon: '🌙',
    colors: {
      primary: '#818cf8',
      primaryHover: '#6366f1',
      secondary: '#374151',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  neon: {
    name: 'Neon',
    displayName: '霓虹模式',
    icon: '⚡',
    colors: {
      primary: '#00ffff',
      primaryHover: '#00e6e6',
      secondary: '#1a1a2e',
      background: '#0f0f23',
      surface: '#16213e',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      border: '#00ffff',
      success: '#00ff41',
      warning: '#ffff00',
      error: '#ff0080',
      info: '#0080ff'
    }
  },
  nature: {
    name: 'Nature',
    displayName: '自然模式',
    icon: '🌿',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      secondary: '#f0fdf4',
      background: '#ffffff',
      surface: '#f7fee7',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#d1fae5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  ocean: {
    name: 'Ocean',
    displayName: '海洋模式',
    icon: '🌊',
    colors: {
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      secondary: '#f0f9ff',
      background: '#ffffff',
      surface: '#f0f9ff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#bae6fd',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  }
};

// 默认主题
const DEFAULT_THEME = 'light';

// 主题上下文
const ThemeContext = createContext();

/**
 * 主题提供者组件
 */
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const [systemPreference, setSystemPreference] = useState('light');
  const [autoMode, setAutoMode] = useState(false);

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
    const savedAutoMode = localStorage.getItem('culturebridge_auto_theme') === 'true';
    
    setAutoMode(savedAutoMode);
    
    if (savedAutoMode) {
      setCurrentTheme(systemPreference);
    } else if (savedTheme && SUPPORTED_THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, [systemPreference]);

  // 应用主题到DOM
  useEffect(() => {
    const theme = SUPPORTED_THEMES[currentTheme];
    if (!theme) return;

    const root = document.documentElement;
    
    // 设置CSS变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // 设置主题类名
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${currentTheme}`);

    // 设置meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.primary);
    }
  }, [currentTheme]);

  // 切换主题
  const changeTheme = (themeName) => {
    if (!SUPPORTED_THEMES[themeName]) {
      console.error(`不支持的主题: ${themeName}`);
      return;
    }

    setCurrentTheme(themeName);
    setAutoMode(false);
    localStorage.setItem('culturebridge_theme', themeName);
    localStorage.setItem('culturebridge_auto_theme', 'false');
  };

  // 切换自动模式
  const toggleAutoMode = () => {
    const newAutoMode = !autoMode;
    setAutoMode(newAutoMode);
    localStorage.setItem('culturebridge_auto_theme', newAutoMode.toString());
    
    if (newAutoMode) {
      setCurrentTheme(systemPreference);
    }
  };

  // 切换深色/浅色模式
  const toggleDarkMode = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  // 获取当前主题信息
  const getCurrentThemeInfo = () => {
    return SUPPORTED_THEMES[currentTheme];
  };

  // 检查是否为深色主题
  const isDarkTheme = () => {
    return ['dark', 'neon'].includes(currentTheme);
  };

  // 获取计算后的颜色值
  const getColor = (colorName) => {
    const theme = SUPPORTED_THEMES[currentTheme];
    return theme?.colors[colorName] || '';
  };

  const value = {
    currentTheme,
    supportedThemes: SUPPORTED_THEMES,
    systemPreference,
    autoMode,
    changeTheme,
    toggleAutoMode,
    toggleDarkMode,
    getCurrentThemeInfo,
    isDarkTheme,
    getColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题的Hook
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * 主题选择器组件
 */
export const ThemeSelector = ({ className = "" }) => {
  const { 
    currentTheme, 
    supportedThemes, 
    autoMode, 
    changeTheme, 
    toggleAutoMode 
  } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={`theme-selector ${className}`}>
      <button
        className="theme-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="theme-icon">
          {supportedThemes[currentTheme]?.icon}
        </span>
        <span className="theme-name">
          {supportedThemes[currentTheme]?.displayName}
        </span>
        <span className="dropdown-arrow">
          {showDropdown ? '▲' : '▼'}
        </span>
      </button>

      {showDropdown && (
        <div className="theme-dropdown">
          <div className="theme-section">
            <div className="theme-section-title">主题选择</div>
            {Object.entries(supportedThemes).map(([key, theme]) => (
              <button
                key={key}
                className={`theme-option ${key === currentTheme ? 'active' : ''}`}
                onClick={() => {
                  changeTheme(key);
                  setShowDropdown(false);
                }}
              >
                <span className="option-icon">{theme.icon}</span>
                <span className="option-name">{theme.displayName}</span>
                {key === currentTheme && !autoMode && (
                  <span className="option-check">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="theme-divider" />

          <div className="theme-section">
            <button
              className={`theme-option auto-mode ${autoMode ? 'active' : ''}`}
              onClick={() => {
                toggleAutoMode();
                setShowDropdown(false);
              }}
            >
              <span className="option-icon">🔄</span>
              <span className="option-name">跟随系统</span>
              {autoMode && (
                <span className="option-check">✓</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 快速主题切换按钮
 */
export const ThemeToggle = ({ className = "" }) => {
  const { isDarkTheme, toggleDarkMode } = useTheme();

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleDarkMode}
      title={isDarkTheme() ? '切换到浅色模式' : '切换到深色模式'}
    >
      <span className="toggle-icon">
        {isDarkTheme() ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeProvider;

