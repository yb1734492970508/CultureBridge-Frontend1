import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建Context
const AppContext = createContext();

/**
 * 应用全局状态提供者
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子组件
 */
export const AppProvider = ({ children }) => {
  // 主题状态
  const [theme, setTheme] = useState(() => {
    // 从本地存储获取主题设置，默认为light
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // 用户认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // 从本地存储获取认证状态，默认为false
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // 用户信息
  const [user, setUser] = useState(() => {
    // 从本地存储获取用户信息，默认为null
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 全局UI状态
  const [uiState, setUiState] = useState({
    isMobileMenuOpen: false,
    isLoading: false,
    notifications: [],
  });

  // 监听主题变化，更新本地存储和文档根元素类名
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 监听认证状态变化，更新本地存储
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  // 监听用户信息变化，更新本地存储
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // 切换主题
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // 登录
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  // 登出
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  // 更新UI状态
  const updateUiState = (newState) => {
    setUiState(prevState => ({ ...prevState, ...newState }));
  };

  // 添加通知
  const addNotification = (notification) => {
    setUiState(prevState => ({
      ...prevState,
      notifications: [...prevState.notifications, {
        id: Date.now(),
        ...notification,
      }],
    }));
  };

  // 移除通知
  const removeNotification = (id) => {
    setUiState(prevState => ({
      ...prevState,
      notifications: prevState.notifications.filter(notification => notification.id !== id),
    }));
  };

  // 提供的Context值
  const contextValue = {
    theme,
    toggleTheme,
    isAuthenticated,
    user,
    login,
    logout,
    uiState,
    updateUiState,
    addNotification,
    removeNotification,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * 使用应用全局状态的Hook
 * @returns {Object} 全局状态和方法
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
