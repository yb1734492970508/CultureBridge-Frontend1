/**
 * UI状态管理
 * 处理界面状态、主题、布局、模态框等UI相关状态
 */

import { createSlice } from '@reduxjs/toolkit';

// 初始状态
const initialState = {
  // 主题设置
  theme: 'light', // 'light', 'dark', 'auto'
  colorScheme: 'blue', // 'blue', 'purple', 'green', 'orange'
  
  // 布局设置
  layout: {
    sidebarCollapsed: false,
    sidebarWidth: 280,
    headerHeight: 64,
    footerHeight: 60,
  },
  
  // 响应式设计
  breakpoint: 'desktop', // 'mobile', 'tablet', 'desktop'
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  
  // 模态框状态
  modals: {
    login: false,
    register: false,
    profile: false,
    settings: false,
    achievement: false,
    confirmation: false,
    imageViewer: false,
    videoPlayer: false,
  },
  
  // 抽屉状态
  drawers: {
    navigation: false,
    notifications: false,
    chat: false,
    search: false,
  },
  
  // 加载状态
  loading: {
    global: false,
    page: false,
    component: {},
  },
  
  // 通知系统
  notifications: [],
  
  // 错误处理
  errors: [],
  
  // 页面状态
  currentPage: 'home',
  previousPage: null,
  pageHistory: [],
  
  // 搜索状态
  search: {
    isOpen: false,
    query: '',
    results: [],
    isLoading: false,
    filters: {},
  },
  
  // 动画设置
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
  },
  
  // 可访问性设置
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium', // 'small', 'medium', 'large'
    screenReader: false,
  },
  
  // 性能设置
  performance: {
    enableVirtualization: true,
    enableLazyLoading: true,
    enableImageOptimization: true,
  },
  
  // 开发者工具
  devTools: {
    enabled: false,
    showGrid: false,
    showBoundaries: false,
    showPerformance: false,
  },
};

// 创建slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 主题管理
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    setColorScheme: (state, action) => {
      state.colorScheme = action.payload;
    },
    
    // 布局管理
    toggleSidebar: (state) => {
      state.layout.sidebarCollapsed = !state.layout.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action) => {
      state.layout.sidebarCollapsed = action.payload;
    },
    
    setSidebarWidth: (state, action) => {
      state.layout.sidebarWidth = action.payload;
    },
    
    // 响应式设计
    setBreakpoint: (state, action) => {
      const breakpoint = action.payload;
      state.breakpoint = breakpoint;
      state.isMobile = breakpoint === 'mobile';
      state.isTablet = breakpoint === 'tablet';
      state.isDesktop = breakpoint === 'desktop';
      
      // 自动调整侧边栏
      if (breakpoint === 'mobile') {
        state.layout.sidebarCollapsed = true;
      }
    },
    
    // 模态框管理
    openModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = true;
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = false;
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // 抽屉管理
    openDrawer: (state, action) => {
      const drawerName = action.payload;
      state.drawers[drawerName] = true;
    },
    
    closeDrawer: (state, action) => {
      const drawerName = action.payload;
      state.drawers[drawerName] = false;
    },
    
    closeAllDrawers: (state) => {
      Object.keys(state.drawers).forEach(key => {
        state.drawers[key] = false;
      });
    },
    
    // 加载状态管理
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading.component[component] = loading;
    },
    
    // 通知管理
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // 限制通知数量
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    
    removeNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter(n => n.id !== id);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // 错误管理
    addError: (state, action) => {
      const error = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.errors.unshift(error);
      
      // 限制错误数量
      if (state.errors.length > 5) {
        state.errors = state.errors.slice(0, 5);
      }
    },
    
    removeError: (state, action) => {
      const id = action.payload;
      state.errors = state.errors.filter(e => e.id !== id);
    },
    
    clearErrors: (state) => {
      state.errors = [];
    },
    
    // 页面导航
    setCurrentPage: (state, action) => {
      state.previousPage = state.currentPage;
      state.currentPage = action.payload;
      
      // 更新页面历史
      state.pageHistory.push(action.payload);
      if (state.pageHistory.length > 20) {
        state.pageHistory = state.pageHistory.slice(-20);
      }
    },
    
    // 搜索管理
    openSearch: (state) => {
      state.search.isOpen = true;
    },
    
    closeSearch: (state) => {
      state.search.isOpen = false;
      state.search.query = '';
      state.search.results = [];
    },
    
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
    },
    
    setSearchLoading: (state, action) => {
      state.search.isLoading = action.payload;
    },
    
    setSearchFilters: (state, action) => {
      state.search.filters = { ...state.search.filters, ...action.payload };
    },
    
    // 动画设置
    setAnimationsEnabled: (state, action) => {
      state.animations.enabled = action.payload;
    },
    
    setAnimationDuration: (state, action) => {
      state.animations.duration = action.payload;
    },
    
    // 可访问性设置
    setReducedMotion: (state, action) => {
      state.accessibility.reducedMotion = action.payload;
      if (action.payload) {
        state.animations.enabled = false;
      }
    },
    
    setHighContrast: (state, action) => {
      state.accessibility.highContrast = action.payload;
    },
    
    setFontSize: (state, action) => {
      state.accessibility.fontSize = action.payload;
    },
    
    setScreenReader: (state, action) => {
      state.accessibility.screenReader = action.payload;
    },
    
    // 性能设置
    setVirtualization: (state, action) => {
      state.performance.enableVirtualization = action.payload;
    },
    
    setLazyLoading: (state, action) => {
      state.performance.enableLazyLoading = action.payload;
    },
    
    setImageOptimization: (state, action) => {
      state.performance.enableImageOptimization = action.payload;
    },
    
    // 开发者工具
    toggleDevTools: (state) => {
      state.devTools.enabled = !state.devTools.enabled;
    },
    
    setDevToolsOption: (state, action) => {
      const { option, value } = action.payload;
      state.devTools[option] = value;
    },
  },
});

// 导出actions
export const {
  setTheme,
  toggleTheme,
  setColorScheme,
  toggleSidebar,
  setSidebarCollapsed,
  setSidebarWidth,
  setBreakpoint,
  openModal,
  closeModal,
  closeAllModals,
  openDrawer,
  closeDrawer,
  closeAllDrawers,
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  addError,
  removeError,
  clearErrors,
  setCurrentPage,
  openSearch,
  closeSearch,
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  setSearchFilters,
  setAnimationsEnabled,
  setAnimationDuration,
  setReducedMotion,
  setHighContrast,
  setFontSize,
  setScreenReader,
  setVirtualization,
  setLazyLoading,
  setImageOptimization,
  toggleDevTools,
  setDevToolsOption,
} = uiSlice.actions;

// 选择器
export const selectUI = (state) => state.ui;
export const selectTheme = (state) => state.ui.theme;
export const selectColorScheme = (state) => state.ui.colorScheme;
export const selectLayout = (state) => state.ui.layout;
export const selectBreakpoint = (state) => state.ui.breakpoint;
export const selectIsMobile = (state) => state.ui.isMobile;
export const selectIsTablet = (state) => state.ui.isTablet;
export const selectIsDesktop = (state) => state.ui.isDesktop;
export const selectModals = (state) => state.ui.modals;
export const selectDrawers = (state) => state.ui.drawers;
export const selectLoading = (state) => state.ui.loading;
export const selectNotifications = (state) => state.ui.notifications;
export const selectErrors = (state) => state.ui.errors;
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectSearch = (state) => state.ui.search;
export const selectAnimations = (state) => state.ui.animations;
export const selectAccessibility = (state) => state.ui.accessibility;
export const selectPerformance = (state) => state.ui.performance;
export const selectDevTools = (state) => state.ui.devTools;

// 复合选择器
export const selectIsModalOpen = (modalName) => (state) => {
  return state.ui.modals[modalName] || false;
};

export const selectIsDrawerOpen = (drawerName) => (state) => {
  return state.ui.drawers[drawerName] || false;
};

export const selectIsComponentLoading = (componentName) => (state) => {
  return state.ui.loading.component[componentName] || false;
};

export const selectUnreadNotifications = (state) => {
  return state.ui.notifications.filter(n => !n.read);
};

export const selectRecentErrors = (state) => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return state.ui.errors.filter(e => e.timestamp > oneHourAgo);
};

export default uiSlice.reducer;

