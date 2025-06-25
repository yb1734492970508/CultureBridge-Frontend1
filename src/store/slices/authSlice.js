/**
 * 认证状态管理
 * 处理用户登录、注册、登出等认证相关状态
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

// 异步action：用户登录
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：用户注册
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：钱包登录
export const loginWithWallet = createAsyncThunk(
  'auth/loginWithWallet',
  async (walletData, { rejectWithValue }) => {
    try {
      const response = await authAPI.walletLogin(walletData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：刷新token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await authAPI.refreshToken(auth.refreshToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：验证token
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        throw new Error('No token found');
      }
      const response = await authAPI.verifyToken(auth.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 用户信息
  user: null,
  token: null,
  refreshToken: null,
  
  // 认证状态
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  
  // 登录方式
  loginMethod: null, // 'email', 'wallet'
  walletAddress: null,
  
  // 错误信息
  error: null,
  
  // 会话信息
  sessionExpiry: null,
  lastActivity: null,
  
  // 权限信息
  permissions: [],
  roles: [],
};

// 创建slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 登出
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loginMethod = null;
      state.walletAddress = null;
      state.error = null;
      state.sessionExpiry = null;
      state.permissions = [];
      state.roles = [];
    },
    
    // 更新最后活动时间
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    
    // 设置初始化状态
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    
    // 更新用户信息
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // 设置权限
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    
    // 设置角色
    setRoles: (state, action) => {
      state.roles = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.loginMethod = 'email';
        state.sessionExpiry = action.payload.expiresAt;
        state.permissions = action.payload.permissions || [];
        state.roles = action.payload.roles || [];
        state.lastActivity = Date.now();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // 注册
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.loginMethod = 'email';
        state.sessionExpiry = action.payload.expiresAt;
        state.permissions = action.payload.permissions || [];
        state.roles = action.payload.roles || [];
        state.lastActivity = Date.now();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // 钱包登录
    builder
      .addCase(loginWithWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.loginMethod = 'wallet';
        state.walletAddress = action.payload.walletAddress;
        state.sessionExpiry = action.payload.expiresAt;
        state.permissions = action.payload.permissions || [];
        state.roles = action.payload.roles || [];
        state.lastActivity = Date.now();
      })
      .addCase(loginWithWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // 刷新token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpiry = action.payload.expiresAt;
        state.lastActivity = Date.now();
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token刷新失败，清除认证状态
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loginMethod = null;
        state.walletAddress = null;
        state.sessionExpiry = null;
        state.permissions = [];
        state.roles = [];
      });
    
    // 验证token
    builder
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.permissions = action.payload.permissions || [];
        state.roles = action.payload.roles || [];
        state.lastActivity = Date.now();
      })
      .addCase(verifyToken.rejected, (state) => {
        // Token验证失败，清除认证状态
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loginMethod = null;
        state.walletAddress = null;
        state.sessionExpiry = null;
        state.permissions = [];
        state.roles = [];
      });
  },
});

// 导出actions
export const {
  clearError,
  logout,
  updateLastActivity,
  setInitialized,
  updateUser,
  setPermissions,
  setRoles,
} = authSlice.actions;

// 选择器
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectLoginMethod = (state) => state.auth.loginMethod;
export const selectWalletAddress = (state) => state.auth.walletAddress;
export const selectPermissions = (state) => state.auth.permissions;
export const selectRoles = (state) => state.auth.roles;

// 检查是否有特定权限
export const selectHasPermission = (permission) => (state) => {
  return state.auth.permissions.includes(permission);
};

// 检查是否有特定角色
export const selectHasRole = (role) => (state) => {
  return state.auth.roles.includes(role);
};

// 检查会话是否过期
export const selectIsSessionExpired = (state) => {
  if (!state.auth.sessionExpiry) return false;
  return Date.now() > state.auth.sessionExpiry;
};

export default authSlice.reducer;

