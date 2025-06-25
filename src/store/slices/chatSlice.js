/**
 * 聊天状态管理
 * 处理实时聊天、消息历史、在线用户等
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI } from '../services/api';

// 异步action：获取聊天室列表
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getRooms();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：获取消息历史
export const fetchMessageHistory = createAsyncThunk(
  'chat/fetchMessageHistory',
  async ({ roomId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMessages(roomId, { page, limit });
      return { roomId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：发送消息
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ roomId, message, type = 'text' }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.sendMessage(roomId, { message, type });
      return { roomId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：翻译消息
export const translateMessage = createAsyncThunk(
  'chat/translateMessage',
  async ({ messageId, targetLanguage }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.translateMessage(messageId, targetLanguage);
      return { messageId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 聊天室列表
  rooms: [],
  
  // 当前聊天室
  currentRoom: null,
  
  // 消息数据 - 按房间ID组织
  messages: {}, // { roomId: { messages: [], hasMore: boolean, isLoading: boolean } }
  
  // 在线用户 - 按房间ID组织
  onlineUsers: {}, // { roomId: [users] }
  
  // 正在输入的用户 - 按房间ID组织
  typingUsers: {}, // { roomId: [userIds] }
  
  // 未读消息计数 - 按房间ID组织
  unreadCounts: {}, // { roomId: count }
  
  // 私聊对话
  privateChats: [], // [{ userId, userName, lastMessage, unreadCount }]
  
  // 消息草稿 - 按房间ID组织
  drafts: {}, // { roomId: draftText }
  
  // 语音消息状态
  voiceMessages: {
    isRecording: false,
    recordingRoom: null,
    isPlaying: false,
    playingMessage: null,
  },
  
  // 翻译状态
  translations: {}, // { messageId: { [language]: translatedText } }
  
  // 连接状态
  connection: {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    lastConnected: null,
  },
  
  // 聊天设置
  settings: {
    autoTranslate: false,
    targetLanguage: 'en',
    showTimestamps: true,
    enableNotifications: true,
    enableSounds: true,
    fontSize: 'medium',
    theme: 'light',
  },
  
  // 状态标志
  isLoading: false,
  error: null,
  
  // 搜索状态
  search: {
    query: '',
    results: [],
    isSearching: false,
  },
  
  // 表情符号和贴纸
  emojis: {
    recentlyUsed: [],
    favorites: [],
  },
};

// 创建slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置当前聊天室
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
      
      // 清除该房间的未读计数
      if (action.payload) {
        state.unreadCounts[action.payload] = 0;
      }
    },
    
    // 添加新消息
    addMessage: (state, action) => {
      const { roomId, message } = action.payload;
      
      if (!state.messages[roomId]) {
        state.messages[roomId] = { messages: [], hasMore: true, isLoading: false };
      }
      
      // 检查消息是否已存在（避免重复）
      const exists = state.messages[roomId].messages.find(m => m.id === message.id);
      if (!exists) {
        state.messages[roomId].messages.push(message);
        
        // 如果不是当前房间，增加未读计数
        if (state.currentRoom !== roomId) {
          state.unreadCounts[roomId] = (state.unreadCounts[roomId] || 0) + 1;
        }
      }
    },
    
    // 批量添加消息（历史消息）
    addMessages: (state, action) => {
      const { roomId, messages, hasMore } = action.payload;
      
      if (!state.messages[roomId]) {
        state.messages[roomId] = { messages: [], hasMore: true, isLoading: false };
      }
      
      // 将新消息添加到开头（历史消息）
      state.messages[roomId].messages = [...messages, ...state.messages[roomId].messages];
      state.messages[roomId].hasMore = hasMore;
    },
    
    // 更新消息状态（已读、已发送等）
    updateMessageStatus: (state, action) => {
      const { roomId, messageId, status } = action.payload;
      
      if (state.messages[roomId]) {
        const message = state.messages[roomId].messages.find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    
    // 删除消息
    deleteMessage: (state, action) => {
      const { roomId, messageId } = action.payload;
      
      if (state.messages[roomId]) {
        state.messages[roomId].messages = state.messages[roomId].messages.filter(
          m => m.id !== messageId
        );
      }
    },
    
    // 更新在线用户
    setOnlineUsers: (state, action) => {
      const { roomId, users } = action.payload;
      state.onlineUsers[roomId] = users;
    },
    
    // 用户加入房间
    userJoined: (state, action) => {
      const { roomId, user } = action.payload;
      
      if (!state.onlineUsers[roomId]) {
        state.onlineUsers[roomId] = [];
      }
      
      const exists = state.onlineUsers[roomId].find(u => u.id === user.id);
      if (!exists) {
        state.onlineUsers[roomId].push(user);
      }
    },
    
    // 用户离开房间
    userLeft: (state, action) => {
      const { roomId, userId } = action.payload;
      
      if (state.onlineUsers[roomId]) {
        state.onlineUsers[roomId] = state.onlineUsers[roomId].filter(u => u.id !== userId);
      }
    },
    
    // 用户开始输入
    userStartedTyping: (state, action) => {
      const { roomId, userId } = action.payload;
      
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      
      if (!state.typingUsers[roomId].includes(userId)) {
        state.typingUsers[roomId].push(userId);
      }
    },
    
    // 用户停止输入
    userStoppedTyping: (state, action) => {
      const { roomId, userId } = action.payload;
      
      if (state.typingUsers[roomId]) {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(id => id !== userId);
      }
    },
    
    // 设置消息草稿
    setDraft: (state, action) => {
      const { roomId, draft } = action.payload;
      state.drafts[roomId] = draft;
    },
    
    // 清除消息草稿
    clearDraft: (state, action) => {
      const roomId = action.payload;
      delete state.drafts[roomId];
    },
    
    // 语音消息控制
    startRecording: (state, action) => {
      state.voiceMessages.isRecording = true;
      state.voiceMessages.recordingRoom = action.payload;
    },
    
    stopRecording: (state) => {
      state.voiceMessages.isRecording = false;
      state.voiceMessages.recordingRoom = null;
    },
    
    startPlayingVoice: (state, action) => {
      state.voiceMessages.isPlaying = true;
      state.voiceMessages.playingMessage = action.payload;
    },
    
    stopPlayingVoice: (state) => {
      state.voiceMessages.isPlaying = false;
      state.voiceMessages.playingMessage = null;
    },
    
    // 翻译管理
    addTranslation: (state, action) => {
      const { messageId, language, translation } = action.payload;
      
      if (!state.translations[messageId]) {
        state.translations[messageId] = {};
      }
      
      state.translations[messageId][language] = translation;
    },
    
    // 连接状态管理
    setConnected: (state, action) => {
      state.connection.isConnected = action.payload;
      state.connection.isConnecting = false;
      if (action.payload) {
        state.connection.lastConnected = Date.now();
        state.connection.reconnectAttempts = 0;
      }
    },
    
    setConnecting: (state, action) => {
      state.connection.isConnecting = action.payload;
    },
    
    incrementReconnectAttempts: (state) => {
      state.connection.reconnectAttempts += 1;
    },
    
    // 聊天设置
    updateChatSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // 搜索功能
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
    },
    
    setSearching: (state, action) => {
      state.search.isSearching = action.payload;
    },
    
    // 表情符号管理
    addRecentEmoji: (state, action) => {
      const emoji = action.payload;
      state.emojis.recentlyUsed = [
        emoji,
        ...state.emojis.recentlyUsed.filter(e => e !== emoji)
      ].slice(0, 20);
    },
    
    toggleFavoriteEmoji: (state, action) => {
      const emoji = action.payload;
      const index = state.emojis.favorites.indexOf(emoji);
      
      if (index >= 0) {
        state.emojis.favorites.splice(index, 1);
      } else {
        state.emojis.favorites.push(emoji);
      }
    },
    
    // 清除聊天数据
    clearChatData: (state) => {
      state.messages = {};
      state.onlineUsers = {};
      state.typingUsers = {};
      state.unreadCounts = {};
      state.drafts = {};
      state.translations = {};
    },
  },
  extraReducers: (builder) => {
    // 获取聊天室列表
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // 获取消息历史
    builder
      .addCase(fetchMessageHistory.pending, (state, action) => {
        const roomId = action.meta.arg.roomId;
        if (!state.messages[roomId]) {
          state.messages[roomId] = { messages: [], hasMore: true, isLoading: false };
        }
        state.messages[roomId].isLoading = true;
      })
      .addCase(fetchMessageHistory.fulfilled, (state, action) => {
        const { roomId, messages, hasMore } = action.payload;
        
        if (!state.messages[roomId]) {
          state.messages[roomId] = { messages: [], hasMore: true, isLoading: false };
        }
        
        state.messages[roomId].messages = [...messages, ...state.messages[roomId].messages];
        state.messages[roomId].hasMore = hasMore;
        state.messages[roomId].isLoading = false;
      })
      .addCase(fetchMessageHistory.rejected, (state, action) => {
        const roomId = action.meta.arg.roomId;
        if (state.messages[roomId]) {
          state.messages[roomId].isLoading = false;
        }
      });
    
    // 发送消息
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { roomId, message } = action.payload;
        
        if (!state.messages[roomId]) {
          state.messages[roomId] = { messages: [], hasMore: true, isLoading: false };
        }
        
        // 更新本地消息状态为已发送
        const localMessage = state.messages[roomId].messages.find(m => m.tempId === message.tempId);
        if (localMessage) {
          Object.assign(localMessage, message);
        }
        
        // 清除草稿
        delete state.drafts[roomId];
      });
    
    // 翻译消息
    builder
      .addCase(translateMessage.fulfilled, (state, action) => {
        const { messageId, language, translation } = action.payload;
        
        if (!state.translations[messageId]) {
          state.translations[messageId] = {};
        }
        
        state.translations[messageId][language] = translation;
      });
  },
});

// 导出actions
export const {
  clearError,
  setCurrentRoom,
  addMessage,
  addMessages,
  updateMessageStatus,
  deleteMessage,
  setOnlineUsers,
  userJoined,
  userLeft,
  userStartedTyping,
  userStoppedTyping,
  setDraft,
  clearDraft,
  startRecording,
  stopRecording,
  startPlayingVoice,
  stopPlayingVoice,
  addTranslation,
  setConnected,
  setConnecting,
  incrementReconnectAttempts,
  updateChatSettings,
  setSearchQuery,
  setSearchResults,
  setSearching,
  addRecentEmoji,
  toggleFavoriteEmoji,
  clearChatData,
} = chatSlice.actions;

// 选择器
export const selectChat = (state) => state.chat;
export const selectChatRooms = (state) => state.chat.rooms;
export const selectCurrentRoom = (state) => state.chat.currentRoom;
export const selectMessages = (roomId) => (state) => state.chat.messages[roomId]?.messages || [];
export const selectOnlineUsers = (roomId) => (state) => state.chat.onlineUsers[roomId] || [];
export const selectTypingUsers = (roomId) => (state) => state.chat.typingUsers[roomId] || [];
export const selectUnreadCount = (roomId) => (state) => state.chat.unreadCounts[roomId] || 0;
export const selectDraft = (roomId) => (state) => state.chat.drafts[roomId] || '';
export const selectVoiceMessages = (state) => state.chat.voiceMessages;
export const selectTranslation = (messageId, language) => (state) => 
  state.chat.translations[messageId]?.[language];
export const selectConnection = (state) => state.chat.connection;
export const selectChatSettings = (state) => state.chat.settings;
export const selectChatSearch = (state) => state.chat.search;
export const selectEmojis = (state) => state.chat.emojis;

// 计算总未读消息数
export const selectTotalUnreadCount = (state) => {
  return Object.values(state.chat.unreadCounts).reduce((total, count) => total + count, 0);
};

// 检查是否有更多历史消息
export const selectHasMoreMessages = (roomId) => (state) => {
  return state.chat.messages[roomId]?.hasMore || false;
};

// 检查是否正在加载历史消息
export const selectIsLoadingMessages = (roomId) => (state) => {
  return state.chat.messages[roomId]?.isLoading || false;
};

export default chatSlice.reducer;

