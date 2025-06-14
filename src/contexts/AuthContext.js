import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// 创建认证上下文
const AuthContext = createContext();

// 初始状态
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// 认证reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// 认证Provider组件
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 设置axios默认headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // 加载用户信息
  const loadUser = async () => {
    if (localStorage.token) {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/me`);
        dispatch({
          type: 'USER_LOADED',
          payload: res.data.data
        });
      } catch (err) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: err.response?.data?.message || '加载用户信息失败'
        });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 注册用户
  const register = async (formData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, formData);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          token: res.data.token,
          user: res.data.user
        }
      });
      
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || '注册失败';
      dispatch({
        type: 'REGISTER_FAIL',
        payload: message
      });
      return { success: false, message };
    }
  };

  // 登录用户
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: res.data.token,
          user: res.data.user
        }
      });
      
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || '登录失败';
      dispatch({
        type: 'LOGIN_FAIL',
        payload: message
      });
      return { success: false, message };
    }
  };

  // 登出用户
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // 清除错误
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // 更新用户信息
  const updateUser = async (userData) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/auth/updatedetails`, userData);
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data
      });
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || '更新用户信息失败';
      return { success: false, message };
    }
  };

  // 更新密码
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/auth/updatepassword`, {
        currentPassword,
        newPassword
      });
      return { success: true, message: '密码更新成功' };
    } catch (err) {
      const message = err.response?.data?.message || '密码更新失败';
      return { success: false, message };
    }
  };

  // 忘记密码
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/forgotpassword`, { email });
      return { success: true, message: '重置密码邮件已发送' };
    } catch (err) {
      const message = err.response?.data?.message || '发送重置密码邮件失败';
      return { success: false, message };
    }
  };

  // 重置密码
  const resetPassword = async (resetToken, password) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/auth/resetpassword/${resetToken}`, {
        password
      });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: res.data.token,
          user: res.data.user
        }
      });
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || '重置密码失败';
      return { success: false, message };
    }
  };

  // 初始化时加载用户
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    ...state,
    register,
    login,
    logout,
    clearErrors,
    loadUser,
    updateUser,
    updatePassword,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用认证上下文的Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

