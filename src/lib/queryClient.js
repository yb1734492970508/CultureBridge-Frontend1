/**
 * React Query 配置
 * 提供数据获取、缓存和同步功能
 */

import { QueryClient } from '@tanstack/react-query';

// 创建查询客户端
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据保持新鲜的时间（5分钟）
      staleTime: 5 * 60 * 1000,
      // 缓存时间（10分钟）
      cacheTime: 10 * 60 * 1000,
      // 重试次数
      retry: 3,
      // 重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 窗口重新获得焦点时重新获取
      refetchOnWindowFocus: false,
      // 网络重新连接时重新获取
      refetchOnReconnect: true,
      // 组件挂载时重新获取
      refetchOnMount: true,
    },
    mutations: {
      // 重试次数
      retry: 1,
      // 重试延迟
      retryDelay: 1000,
    },
  },
});

// 查询键工厂
export const queryKeys = {
  // 用户相关
  user: {
    all: ['user'],
    profile: (userId) => [...queryKeys.user.all, 'profile', userId],
    stats: (userId) => [...queryKeys.user.all, 'stats', userId],
    achievements: (userId) => [...queryKeys.user.all, 'achievements', userId],
    preferences: (userId) => [...queryKeys.user.all, 'preferences', userId],
  },
  
  // 聊天相关
  chat: {
    all: ['chat'],
    rooms: () => [...queryKeys.chat.all, 'rooms'],
    room: (roomId) => [...queryKeys.chat.all, 'room', roomId],
    messages: (roomId, page) => 
      [...queryKeys.chat.room(roomId), 'messages', page],
    onlineUsers: (roomId) => 
      [...queryKeys.chat.room(roomId), 'onlineUsers'],
  },
  
  // 翻译相关
  translation: {
    all: ['translation'],
    history: (userId) => [...queryKeys.translation.all, 'history', userId],
    languages: () => [...queryKeys.translation.all, 'languages'],
    stats: (userId) => [...queryKeys.translation.all, 'stats', userId],
  },
  
  // 学习相关
  learning: {
    all: ['learning'],
    courses: () => [...queryKeys.learning.all, 'courses'],
    course: (courseId) => [...queryKeys.learning.all, 'course', courseId],
    progress: (userId, courseId) => 
      [...queryKeys.learning.course(courseId), 'progress', userId],
    sessions: (userId) => [...queryKeys.learning.all, 'sessions', userId],
  },
  
  // 社区相关
  community: {
    all: ['community'],
    posts: (filters) => [...queryKeys.community.all, 'posts', filters],
    post: (postId) => [...queryKeys.community.all, 'post', postId],
    comments: (postId) => [...queryKeys.community.post(postId), 'comments'],
    groups: () => [...queryKeys.community.all, 'groups'],
    group: (groupId) => [...queryKeys.community.all, 'group', groupId],
  },
  
  // 区块链相关
  blockchain: {
    all: ['blockchain'],
    balance: (address) => [...queryKeys.blockchain.all, 'balance', address],
    transactions: (address) => [...queryKeys.blockchain.all, 'transactions', address],
    tokenInfo: () => [...queryKeys.blockchain.all, 'tokenInfo'],
  }
};

// 查询工具函数
export const queryUtils = {
  // 使查询无效
  invalidateQueries: (queryKey) => {
    return queryClient.invalidateQueries({ queryKey });
  },
  
  // 设置查询数据
  setQueryData: (queryKey, data) => {
    return queryClient.setQueryData(queryKey, data);
  },
  
  // 获取查询数据
  getQueryData: (queryKey) => {
    return queryClient.getQueryData(queryKey);
  },
  
  // 预取查询
  prefetchQuery: (queryKey, queryFn, options = {}) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...options
    });
  },
  
  // 移除查询
  removeQueries: (queryKey) => {
    return queryClient.removeQueries({ queryKey });
  },
  
  // 取消查询
  cancelQueries: (queryKey) => {
    return queryClient.cancelQueries({ queryKey });
  },
  
  // 重置查询
  resetQueries: (queryKey) => {
    return queryClient.resetQueries({ queryKey });
  }
};

// 错误处理
export const handleQueryError = (error) => {
  console.error('Query error:', error);
  
  // 根据错误类型进行不同处理
  if (error.response) {
    // HTTP错误
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 401:
        // 未授权，可能需要重新登录
        console.warn('Unauthorized access, redirecting to login');
        // 这里可以触发登录流程
        break;
      case 403:
        // 禁止访问
        console.warn('Access forbidden');
        break;
      case 404:
        // 资源未找到
        console.warn('Resource not found');
        break;
      case 500:
        // 服务器错误
        console.error('Server error');
        break;
      default:
        console.error(`HTTP error ${status}: ${message}`);
    }
    
    return {
      type: 'http_error',
      status,
      message
    };
  } else if (error.request) {
    // 网络错误
    console.error('Network error:', error.message);
    return {
      type: 'network_error',
      message: '网络连接失败，请检查网络设置'
    };
  } else {
    // 其他错误
    console.error('Unknown error:', error.message);
    return {
      type: 'unknown_error',
      message: error.message || '发生未知错误'
    };
  }
};

// 乐观更新工具
export const optimisticUpdate = {
  // 乐观更新用户数据
  updateUser: (userId, updates) => {
    const queryKey = queryKeys.user.profile(userId);
    const previousData = queryClient.getQueryData(queryKey);
    
    // 乐观更新
    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      ...updates
    }));
    
    return () => {
      // 回滚函数
      queryClient.setQueryData(queryKey, previousData);
    };
  },
  
  // 乐观添加消息
  addMessage: (roomId, message) => {
    const queryKey = queryKeys.chat.messages(roomId);
    const previousData = queryClient.getQueryData(queryKey);
    
    // 乐观更新
    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      pages: old?.pages?.map((page, index) => 
        index === 0 
          ? { ...page, data: [message, ...page.data] }
          : page
      ) || []
    }));
    
    return () => {
      // 回滚函数
      queryClient.setQueryData(queryKey, previousData);
    };
  },
  
  // 乐观更新点赞
  toggleLike: (postId, isLiked, likeCount) => {
    const queryKey = queryKeys.community.post(postId);
    const previousData = queryClient.getQueryData(queryKey);
    
    // 乐观更新
    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      isLiked: !isLiked,
      likeCount: isLiked ? likeCount - 1 : likeCount + 1
    }));
    
    return () => {
      // 回滚函数
      queryClient.setQueryData(queryKey, previousData);
    };
  }
};

export default queryClient;

