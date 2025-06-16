import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './designSystem';

// 创建主题上下文
const ThemeContext = createContext();

// 主题提供者组件
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  // 从本地存储加载主题偏好
  useEffect(() => {
    const savedTheme = localStorage.getItem('culturebridge-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      setTheme(isDark ? darkTheme : lightTheme);
    } else if (prefersDark) {
      setIsDarkMode(true);
      setTheme(darkTheme);
    }
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('culturebridge-theme')) {
        setIsDarkMode(e.matches);
        setTheme(e.matches ? darkTheme : lightTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    setTheme(newIsDarkMode ? darkTheme : lightTheme);
    localStorage.setItem('culturebridge-theme', newIsDarkMode ? 'dark' : 'light');
  };

  // 设置特定主题
  const setThemeMode = (mode) => {
    const isDark = mode === 'dark';
    setIsDarkMode(isDark);
    setTheme(isDark ? darkTheme : lightTheme);
    localStorage.setItem('culturebridge-theme', mode);
  };

  // 应用CSS变量到根元素
  useEffect(() => {
    const root = document.documentElement;
    
    // 设置颜色变量
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
    
    Object.entries(theme.colors.success).forEach(([key, value]) => {
      root.style.setProperty(`--color-success-${key}`, value);
    });
    
    Object.entries(theme.colors.warning).forEach(([key, value]) => {
      root.style.setProperty(`--color-warning-${key}`, value);
    });
    
    Object.entries(theme.colors.error).forEach(([key, value]) => {
      root.style.setProperty(`--color-error-${key}`, value);
    });
    
    Object.entries(theme.colors.gray).forEach(([key, value]) => {
      root.style.setProperty(`--color-gray-${key}`, value);
    });

    // 设置语义化颜色
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-border', theme.colors.border);

    // 设置字体变量
    root.style.setProperty('--font-sans', theme.typography.fontFamily.sans.join(', '));
    root.style.setProperty('--font-mono', theme.typography.fontFamily.mono.join(', '));
    root.style.setProperty('--font-display', theme.typography.fontFamily.display.join(', '));

    // 设置间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // 设置圆角变量
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // 设置阴影变量
    Object.entries(theme.boxShadow).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // 设置动画变量
    Object.entries(theme.animation.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });

    Object.entries(theme.animation.easing).forEach(([key, value]) => {
      root.style.setProperty(`--easing-${key}`, value);
    });

    // 设置断点变量
    Object.entries(theme.breakpoints).forEach(([key, value]) => {
      root.style.setProperty(`--breakpoint-${key}`, value);
    });

    // 设置z-index变量
    Object.entries(theme.zIndex).forEach(([key, value]) => {
      root.style.setProperty(`--z-${key}`, value);
    });

    // 设置主题模式类
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme, isDarkMode]);

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setThemeMode,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    boxShadow: theme.boxShadow,
    animation: theme.animation,
    breakpoints: theme.breakpoints,
    zIndex: theme.zIndex
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义Hook使用主题
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 样式化组件辅助函数
export const styled = (component, styles) => {
  return React.forwardRef((props, ref) => {
    const { theme } = useTheme();
    const computedStyles = typeof styles === 'function' ? styles(theme, props) : styles;
    
    return React.createElement(component, {
      ...props,
      ref,
      style: { ...computedStyles, ...props.style }
    });
  });
};

// CSS-in-JS 辅助函数
export const css = (styles) => {
  return (theme, props) => {
    return typeof styles === 'function' ? styles(theme, props) : styles;
  };
};

// 响应式辅助函数
export const responsive = (values) => {
  return (theme) => {
    const breakpoints = theme.breakpoints;
    const mediaQueries = {};
    
    Object.entries(values).forEach(([key, value]) => {
      if (breakpoints[key]) {
        mediaQueries[`@media (min-width: ${breakpoints[key]})`] = value;
      }
    });
    
    return mediaQueries;
  };
};

export default ThemeProvider;

