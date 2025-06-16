// 增强版认证上下文
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socketService';
import { errorHandler, ERROR_CODES } from '../utils/errorHandler';

// 认证状态
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  walletAddress: null,
  isWalletConnected: false,
  loginMethod: null, // 'email' | 'wallet'
  permissions: [],
  lastActivity: null,
};

// 认证动作类型
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CONNECT_WALLET: 'CONNECT_WALLET',
  DISCONNECT_WALLET: 'DISCONNECT_WALLET',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  UPDATE_ACTIVITY: 'UPDATE_ACTIVITY',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// 认证状态reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        loginMethod: action.payload.loginMethod,
        permissions: action.payload.permissions || [],
        lastActivity: new Date().toISOString(),
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        lastActivity: new Date().toISOString(),
      };

    case AUTH_ACTIONS.CONNECT_WALLET:
      return {
        ...state,
        walletAddress: action.payload.address,
        isWalletConnected: true,
        lastActivity: new Date().toISOString(),
      };

    case AUTH_ACTIONS.DISCONNECT_WALLET:
      return {
        ...state,
        walletAddress: null,
        isWalletConnected: false,
        lastActivity: new Date().toISOString(),
      };

    case AUTH_ACTIONS.SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
      };

    case AUTH_ACTIONS.UPDATE_ACTIVITY:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    default:
      return state;
  }
}

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化认证状态
  useEffect(() => {
    initializeAuth();
  }, []);

  // 设置活动监听器
  useEffect(() => {
    if (state.isAuthenticated) {
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      const updateActivity = () => {
        dispatch({ type: AUTH_ACTIONS.UPDATE_ACTIVITY });
      };

      activityEvents.forEach(event => {
        document.addEventListener(event, updateActivity, true);
      });

      return () => {
        activityEvents.forEach(event => {
          document.removeEventListener(event, updateActivity, true);
        });
      };
    }
  }, [state.isAuthenticated]);

  // 初始化认证
  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const walletAddress = localStorage.getItem('walletAddress');

      if (token && user) {
        // 验证token是否仍然有效
        try {
          const profile = await authAPI.getProfile();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: profile.user,
              token,
              loginMethod: user.loginMethod || 'email',
              permissions: profile.permissions || [],
            },
          });

          // 连接Socket
          socketService.connect(token);

          // 恢复钱包连接状态
          if (walletAddress) {
            dispatch({
              type: AUTH_ACTIONS.CONNECT_WALLET,
              payload: { address: walletAddress },
            });
          }
        } catch (error) {
          // Token无效，清除本地存储
          clearAuthData();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // 邮箱登录
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.login(credentials);
      const { user, token, permissions } = response;

      // 保存到本地存储
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ ...user, loginMethod: 'email' }));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token,
          loginMethod: 'email',
          permissions: permissions || [],
        },
      });

      // 连接Socket
      socketService.connect(token);

      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw errorHandler.handleError(error);
    }
  };

  // 钱包登录
  const walletLogin = async (walletData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.walletLogin(walletData);
      const { user, token, permissions } = response;

      // 保存到本地存储
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ ...user, loginMethod: 'wallet' }));
      localStorage.setItem('walletAddress', walletData.address);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token,
          loginMethod: 'wallet',
          permissions: permissions || [],
        },
      });

      dispatch({
        type: AUTH_ACTIONS.CONNECT_WALLET,
        payload: { address: walletData.address },
      });

      // 连接Socket
      socketService.connect(token);

      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw errorHandler.handleError(error);
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.register(userData);
      const { user, token, permissions } = response;

      // 保存到本地存储
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ ...user, loginMethod: 'email' }));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token,
          loginMethod: 'email',
          permissions: permissions || [],
        },
      });

      // 连接Socket
      socketService.connect(token);

      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw errorHandler.handleError(error);
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 调用后端登出API
      if (state.token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 清除本地数据
      clearAuthData();
      
      // 断开Socket连接
      socketService.disconnect();
      
      // 更新状态
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // 更新用户信息
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user,
      });

      // 更新本地存储
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.user }));

      return response;
    } catch (error) {
      throw errorHandler.handleError(error);
    }
  };

  // 连接钱包
  const connectWallet = async (walletData) => {
    try {
      if (state.isAuthenticated) {
        // 如果已登录，只更新钱包信息
        localStorage.setItem('walletAddress', walletData.address);
        dispatch({
          type: AUTH_ACTIONS.CONNECT_WALLET,
          payload: { address: walletData.address },
        });
      } else {
        // 如果未登录，使用钱包登录
        await walletLogin(walletData);
      }
    } catch (error) {
      throw errorHandler.handleError(error);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    localStorage.removeItem('walletAddress');
    dispatch({ type: AUTH_ACTIONS.DISCONNECT_WALLET });
  };

  // 刷新token
  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      const { token } = response;
      
      localStorage.setItem('authToken', token);
      
      // 重新连接Socket
      socketService.disconnect();
      socketService.connect(token);
      
      return response;
    } catch (error) {
      // Token刷新失败，强制登出
      logout();
      throw errorHandler.handleError(error);
    }
  };

  // 检查权限
  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  // 检查是否为管理员
  const isAdmin = () => {
    return hasPermission('admin') || state.user?.role === 'admin';
  };

  // 清除认证数据
  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('walletAddress');
  };

  // 检查会话是否过期
  const isSessionExpired = () => {
    if (!state.lastActivity) return false;
    
    const lastActivity = new Date(state.lastActivity);
    const now = new Date();
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24小时
    
    return (now - lastActivity) > sessionTimeout;
  };

  // 上下文值
  const contextValue = {
    // 状态
    ...state,
    
    // 方法
    login,
    walletLogin,
    register,
    logout,
    updateProfile,
    connectWallet,
    disconnectWallet,
    refreshToken,
    hasPermission,
    isAdmin,
    isSessionExpired,
    
    // 工具方法
    clearError: () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR }),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的Hook
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// 认证守卫组件
export function AuthGuard({ children, requireAuth = true, requiredPermissions = [] }) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>正在验证身份...</p>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>需要登录</h2>
        <p>请先登录后再访问此页面。</p>
        <button onClick={() => window.location.href = '/login'}>
          前往登录
        </button>
      </div>
    );
  }

  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return (
        <div className="permission-denied">
          <h2>权限不足</h2>
          <p>您没有访问此页面的权限。</p>
        </div>
      );
    }
  }

  return children;
}

export default AuthContext;

