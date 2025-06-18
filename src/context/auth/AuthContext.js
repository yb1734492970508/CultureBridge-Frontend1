import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查本地存储中的用户信息
    const savedUser = localStorage.getItem('culturebridge_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('culturebridge_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      // 这里应该调用实际的登录API
      // const response = await api.login(credentials);
      
      // 模拟登录成功
      const userData = {
        id: 'user_' + Date.now(),
        username: credentials.username,
        email: credentials.email || `${credentials.username}@example.com`,
        avatar: '/api/placeholder/40/40',
        level: 1,
        points: 0,
        joinDate: new Date().toISOString()
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('culturebridge_user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      // 这里应该调用实际的注册API
      // const response = await api.register(userData);
      
      // 模拟注册成功
      const newUser = {
        id: 'user_' + Date.now(),
        username: userData.username,
        email: userData.email,
        avatar: '/api/placeholder/40/40',
        level: 1,
        points: 100, // 新用户奖励
        joinDate: new Date().toISOString()
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('culturebridge_user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('注册失败:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('culturebridge_user');
  };

  const updateUser = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('culturebridge_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

