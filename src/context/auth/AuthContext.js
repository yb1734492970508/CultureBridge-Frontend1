import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 初始状态
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

// 创建认证上下文
const AuthContext = createContext(initialState);

// 认证状态管理器
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'REGISTER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 从本地存储加载用户状态
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: JSON.parse(userData)
          });
        } else {
          dispatch({
            type: 'LOGOUT'
          });
        }
      } catch (error) {
        console.error('加载用户数据失败:', error);
        dispatch({
          type: 'LOGOUT'
        });
      }
    };

    loadUser();
  }, []);

  // 注册函数
  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 检查邮箱是否已存在
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const emailExists = existingUsers.some(user => user.email === userData.email);
      
      if (emailExists) {
        throw new Error('该邮箱已被注册');
      }
      
      // 创建新用户
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        createdAt: new Date().toISOString(),
        avatar: null,
        bio: '',
        walletAddress: null
      };
      
      // 保存用户数据（实际应用中应由后端处理）
      existingUsers.push({
        ...newUser,
        password: userData.password // 注意：实际应用中密码应在后端加密存储
      });
      localStorage.setItem('users', JSON.stringify(existingUsers));
      
      // 保存认证状态
      localStorage.setItem('auth_token', 'mock_token_' + newUser.id);
      localStorage.setItem('user_data', JSON.stringify(newUser));
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: newUser
      });
      
      return newUser;
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error.message
      });
      throw error;
    }
  };

  // 登录函数
  const login = async (email, password, remember = false) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 验证用户凭据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('邮箱或密码不正确');
      }
      
      // 移除密码字段
      const { password: _, ...userWithoutPassword } = user;
      
      // 保存认证状态
      localStorage.setItem('auth_token', 'mock_token_' + user.id);
      localStorage.setItem('user_data', JSON.stringify(userWithoutPassword));
      
      // 如果选择"记住我"，设置更长的过期时间
      if (remember) {
        // 实际应用中，这里应该设置cookie或其他机制
        localStorage.setItem('remember_me', 'true');
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userWithoutPassword
      });
      
      return userWithoutPassword;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      throw error;
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('remember_me');
    
    dispatch({ type: 'LOGOUT' });
  };

  // 更新用户资料
  const updateProfile = async (profileData) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!state.user) {
        throw new Error('用户未登录');
      }
      
      // 更新本地存储中的用户数据
      const updatedUser = { ...state.user, ...profileData };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      // 更新用户列表中的数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(user => 
        user.id === state.user.id ? { ...user, ...profileData } : user
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      dispatch({
        type: 'UPDATE_USER',
        payload: profileData
      });
      
      return updatedUser;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  };

  // 绑定钱包地址
  const linkWallet = async (walletAddress) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!state.user) {
        throw new Error('用户未登录');
      }
      
      // 更新钱包地址
      return await updateProfile({ walletAddress });
    } catch (error) {
      console.error('绑定钱包失败:', error);
      throw error;
    }
  };

  // 清除错误
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        updateProfile,
        linkWallet,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，方便使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
