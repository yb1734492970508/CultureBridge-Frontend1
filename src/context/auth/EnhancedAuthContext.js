import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, apiUtils } from '../../services/enhancedAPI';
import socketService from '../../services/enhancedSocketService';

// 初始状态
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: null,
  activityStats: null,
  walletConnected: false,
  walletAddress: null,
};

// Action类型
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  SET_ACTIVITY_STATS: 'SET_ACTIVITY_STATS',
  CONNECT_WALLET: 'CONNECT_WALLET',
  DISCONNECT_WALLET: 'DISCONNECT_WALLET',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer函数
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        walletAddress: action.payload.user?.walletAddress || null,
        walletConnected: !!action.payload.user?.walletAddress,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        walletAddress: action.payload.walletAddress || state.walletAddress,
        walletConnected: !!(action.payload.walletAddress || state.walletAddress),
      };

    case AUTH_ACTIONS.SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
      };

    case AUTH_ACTIONS.SET_ACTIVITY_STATS:
      return {
        ...state,
        activityStats: action.payload,
      };

    case AUTH_ACTIONS.CONNECT_WALLET:
      return {
        ...state,
        walletConnected: true,
        walletAddress: action.payload.address,
        user: state.user ? {
          ...state.user,
          walletAddress: action.payload.address,
        } : state.user,
      };

    case AUTH_ACTIONS.DISCONNECT_WALLET:
      return {
        ...state,
        walletConnected: false,
        walletAddress: null,
        user: state.user ? {
          ...state.user,
          walletAddress: null,
        } : state.user,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// 创建Context
const AuthContext = createContext();

// AuthProvider组件
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化认证状态
  useEffect(() => {
    initializeAuth();
  }, []);

  // 当用户状态改变时，更新Socket连接
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      socketService.connect(state.user);
    } else {
      socketService.disconnect();
    }
  }, [state.isAuthenticated, state.user]);

  /**
   * 初始化认证状态
   */
  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        
        // 验证token是否有效
        const response = await authAPI.verifyToken();
        
        if (response.success) {
          const user = JSON.parse(userData);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token },
          });
          
          // 获取最新用户信息
          await fetchUserData();
        } else {
          // Token无效，清除本地存储
          clearAuthData();
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        clearAuthData();
      }
    }
    
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
  };

  /**
   * 获取用户数据
   */
  const fetchUserData = async () => {
    try {
      const [userResponse, permissionsResponse, statsResponse] = await Promise.all([
        authAPI.getMe(),
        authAPI.getPermissions(),
        authAPI.getActivityStats(),
      ]);

      if (userResponse.success) {
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userResponse.data.user });
      }

      if (permissionsResponse.success) {
        dispatch({ type: AUTH_ACTIONS.SET_PERMISSIONS, payload: permissionsResponse.data });
      }

      if (statsResponse.success) {
        dispatch({ type: AUTH_ACTIONS.SET_ACTIVITY_STATS, payload: statsResponse.data });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  /**
   * 用户注册
   */
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.register(userData);

      if (response.success) {
        const { user, token } = response.data;
        
        // 保存到本地存储
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        // 获取用户权限和统计
        await fetchUserData();

        return { success: true, message: response.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo.error });
      return errorInfo;
    }
  };

  /**
   * 用户登录
   */
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.login(credentials);

      if (response.success) {
        const { user, token } = response.data;
        
        // 保存到本地存储
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        // 获取用户权限和统计
        await fetchUserData();

        return { success: true, message: response.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo.error });
      return errorInfo;
    }
  };

  /**
   * 钱包登录
   */
  const walletLogin = async (walletData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.walletLogin(walletData);

      if (response.success) {
        const { user, token } = response.data;
        
        // 保存到本地存储
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        // 获取用户权限和统计
        await fetchUserData();

        return { success: true, message: response.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo.error });
      return errorInfo;
    }
  };

  /**
   * 用户登出
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  /**
   * 更新用户详情
   */
  const updateUserDetails = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.updateDetails(userData);

      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.data });
        
        // 更新本地存储
        const updatedUser = { ...state.user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { success: true, message: response.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo.error });
      return errorInfo;
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * 更新密码
   */
  const updatePassword = async (passwordData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.updatePassword(passwordData);

      if (response.success) {
        // 更新token
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: { token } });
        return { success: true, message: response.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo.error });
      return errorInfo;
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * 创建钱包
   */
  const createWallet = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.createWallet();

      if (response.success) {
        const { walletAddress } = response.data;
        
        dispatch({
          type: AUTH_ACTIONS.CONNECT_WALLET,
          payload: { address: walletAddress },
        });

        // 更新本地存储
        const updatedUser = { ...state.user, walletAddress };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { success: true, data: response.data, message: response.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo.error });
      return errorInfo;
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * 绑定钱包
   */
  const bindWallet = async (walletData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.bindWallet(walletData);

      if (response.success) {
        const { walletAddress } = response.data;
        
        dispatch({
          type: AUTH_ACTIONS.CONNECT_WALLET,
          payload: { address: walletAddress },
        });

        // 更新本地存储
        const updatedUser = { ...state.user, walletAddress };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { success: true, message: response.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo.error });
      return errorInfo;
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * 刷新令牌
   */
  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      
      if (response.success) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return { success: false };
    }
  };

  /**
   * 清除认证数据
   */
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * 清除错误
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context值
  const contextValue = {
    // 状态
    ...state,
    
    // 方法
    register,
    login,
    walletLogin,
    logout,
    updateUserDetails,
    updatePassword,
    createWallet,
    bindWallet,
    refreshToken,
    fetchUserData,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;

