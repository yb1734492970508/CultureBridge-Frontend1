/**
 * 聊天状态管理
 * 处理聊天消息、会话、联系人等相关状态
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步action：获取聊天列表
export const getChatList = createAsyncThunk(
  'chat/getChatList',
  async (_, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                id: 1,
                name: '文化交流群',
                type: 'group',
                avatar: '/api/placeholder/40/40',
                lastMessage: '大家好，今天我们来聊聊中国的传统节日',
                lastMessageTime: '10:30',
                unreadCount: 3,
                isOnline: true
              },
              {
                id: 2,
                name: '李小明',
                type: 'private',
                avatar: '/api/placeholder/40/40',
                lastMessage: '你好，我对日本文化很感兴趣',
                lastMessageTime: '09:45',
                unreadCount: 1,
                isOnline: true
              }
            ]
          });
        }, 500);
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步action：获取聊天消息
export const getChatMessages = createAsyncThunk(
  'chat/getChatMessages',
  async (chatId, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                id: 1,
                chatId,
                senderId: 'user1',
                senderName: '张文化',
                content: '大家好，今天我们来聊聊中国的传统节日',
                type: 'text',
                timestamp: '2024-06-25T10:30:00Z',
                isRead: true
              },
              {
                id: 2,
                chatId,
                senderId: 'user2',
                senderName: '李小明',
                content: '春节是我最喜欢的节日！',
                type: 'text',
                timestamp: '2024-06-25T10:32:00Z',
                isRead: true
              }
            ]
          });
        }, 500);
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步action：发送消息
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content, type = 'text' }, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: Date.now(),
              chatId,
              senderId: 'currentUser',
              senderName: '我',
              content,
              type,
              timestamp: new Date().toISOString(),
              isRead: false
            }
          });
        }, 300);
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 聊天列表
  chatList: [],
  isLoadingChatList: false,
  
  // 当前聊天
  currentChatId: null,
  currentChatMessages: [],
  isLoadingMessages: false,
  
  // 消息发送
  isSendingMessage: false,
  
  // 在线用户
  onlineUsers: [],
  
  // 输入状态
  inputText: '',
  isTyping: false,
  typingUsers: [],
  
  // 文件上传
  uploadingFiles: [],
  
  // 语音消息
  isRecording: false,
  recordingDuration: 0,
  
  // 搜索
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  
  // 设置
  chatSettings: {
    notifications: true,
    soundEnabled: true,
    autoTranslate: false,
    fontSize: 'medium'
  },
  
  // 错误状态
  error: null,
  
  // 表情包
  emojiPanelOpen: false,
  recentEmojis: ['😊', '👍', '❤️', '😂', '🎉'],
  
  // 消息状态
  messageStatus: {}, // messageId -> status (sending, sent, delivered, read)
  
  // 草稿
  drafts: {}, // chatId -> draft content
  
  // 置顶聊天
  pinnedChats: [],
  
  // 已删除消息
  deletedMessages: new Set(),
  
  // 聊天背景
  chatBackground: 'default'
};

// 创建slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // 设置当前聊天
    setCurrentChat: (state, action) => {
      state.currentChatId = action.payload;
      state.currentChatMessages = [];
    },
    
    // 清除当前聊天
    clearCurrentChat: (state) => {
      state.currentChatId = null;
      state.currentChatMessages = [];
    },
    
    // 设置输入文本
    setInputText: (state, action) => {
      state.inputText = action.payload;
    },
    
    // 清除输入文本
    clearInputText: (state) => {
      state.inputText = '';
    },
    
    // 添加消息到当前聊天
    addMessageToCurrentChat: (state, action) => {
      if (state.currentChatId) {
        state.currentChatMessages.push(action.payload);
      }
    },
    
    // 更新消息状态
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      state.messageStatus[messageId] = status;
    },
    
    // 标记消息为已读
    markMessagesAsRead: (state, action) => {
      const chatId = action.payload;
      const chat = state.chatList.find(c => c.id === chatId);
      if (chat) {
        chat.unreadCount = 0;
      }
      
      // 标记当前聊天的所有消息为已读
      if (state.currentChatId === chatId) {
        state.currentChatMessages.forEach(message => {
          message.isRead = true;
        });
      }
    },
    
    // 设置打字状态
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    
    // 添加打字用户
    addTypingUser: (state, action) => {
      const userId = action.payload;
      if (!state.typingUsers.includes(userId)) {
        state.typingUsers.push(userId);
      }
    },
    
    // 移除打字用户
    removeTypingUser: (state, action) => {
      const userId = action.payload;
      state.typingUsers = state.typingUsers.filter(id => id !== userId);
    },
    
    // 设置录音状态
    setRecording: (state, action) => {
      state.isRecording = action.payload;
      if (!action.payload) {
        state.recordingDuration = 0;
      }
    },
    
    // 更新录音时长
    updateRecordingDuration: (state, action) => {
      state.recordingDuration = action.payload;
    },
    
    // 设置表情面板状态
    setEmojiPanelOpen: (state, action) => {
      state.emojiPanelOpen = action.payload;
    },
    
    // 添加最近使用的表情
    addRecentEmoji: (state, action) => {
      const emoji = action.payload;
      state.recentEmojis = [emoji, ...state.recentEmojis.filter(e => e !== emoji)].slice(0, 10);
    },
    
    // 设置搜索查询
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    // 清除搜索结果
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    
    // 保存草稿
    saveDraft: (state, action) => {
      const { chatId, content } = action.payload;
      if (content.trim()) {
        state.drafts[chatId] = content;
      } else {
        delete state.drafts[chatId];
      }
    },
    
    // 清除草稿
    clearDraft: (state, action) => {
      const chatId = action.payload;
      delete state.drafts[chatId];
    },
    
    // 置顶聊天
    pinChat: (state, action) => {
      const chatId = action.payload;
      if (!state.pinnedChats.includes(chatId)) {
        state.pinnedChats.push(chatId);
      }
    },
    
    // 取消置顶
    unpinChat: (state, action) => {
      const chatId = action.payload;
      state.pinnedChats = state.pinnedChats.filter(id => id !== chatId);
    },
    
    // 删除消息
    deleteMessage: (state, action) => {
      const messageId = action.payload;
      state.deletedMessages.add(messageId);
      
      // 从当前聊天中移除消息
      state.currentChatMessages = state.currentChatMessages.filter(
        message => message.id !== messageId
      );
    },
    
    // 更新聊天设置
    updateChatSettings: (state, action) => {
      state.chatSettings = { ...state.chatSettings, ...action.payload };
    },
    
    // 设置聊天背景
    setChatBackground: (state, action) => {
      state.chatBackground = action.payload;
    },
    
    // 更新在线用户
    updateOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 添加文件上传
    addUploadingFile: (state, action) => {
      state.uploadingFiles.push(action.payload);
    },
    
    // 移除文件上传
    removeUploadingFile: (state, action) => {
      const fileId = action.payload;
      state.uploadingFiles = state.uploadingFiles.filter(file => file.id !== fileId);
    },
    
    // 更新文件上传进度
    updateFileUploadProgress: (state, action) => {
      const { fileId, progress } = action.payload;
      const file = state.uploadingFiles.find(f => f.id === fileId);
      if (file) {
        file.progress = progress;
      }
    }
  },
  extraReducers: (builder) => {
    // 获取聊天列表
    builder
      .addCase(getChatList.pending, (state) => {
        state.isLoadingChatList = true;
        state.error = null;
      })
      .addCase(getChatList.fulfilled, (state, action) => {
        state.isLoadingChatList = false;
        state.chatList = action.payload;
      })
      .addCase(getChatList.rejected, (state, action) => {
        state.isLoadingChatList = false;
        state.error = action.payload;
      });
    
    // 获取聊天消息
    builder
      .addCase(getChatMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        state.currentChatMessages = action.payload;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload;
      });
    
    // 发送消息
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        state.currentChatMessages.push(action.payload);
        state.inputText = '';
        
        // 更新聊天列表中的最后消息
        const chat = state.chatList.find(c => c.id === action.payload.chatId);
        if (chat) {
          chat.lastMessage = action.payload.content;
          chat.lastMessageTime = new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload;
      });
  },
});

// 导出actions
export const {
  setCurrentChat,
  clearCurrentChat,
  setInputText,
  clearInputText,
  addMessageToCurrentChat,
  updateMessageStatus,
  markMessagesAsRead,
  setTyping,
  addTypingUser,
  removeTypingUser,
  setRecording,
  updateRecordingDuration,
  setEmojiPanelOpen,
  addRecentEmoji,
  setSearchQuery,
  clearSearchResults,
  saveDraft,
  clearDraft,
  pinChat,
  unpinChat,
  deleteMessage,
  updateChatSettings,
  setChatBackground,
  updateOnlineUsers,
  clearError,
  addUploadingFile,
  removeUploadingFile,
  updateFileUploadProgress,
} = chatSlice.actions;

// 选择器
export const selectChat = (state) => state.chat;
export const selectChatList = (state) => state.chat.chatList;
export const selectCurrentChatId = (state) => state.chat.currentChatId;
export const selectCurrentChatMessages = (state) => state.chat.currentChatMessages;
export const selectInputText = (state) => state.chat.inputText;
export const selectIsTyping = (state) => state.chat.isTyping;
export const selectTypingUsers = (state) => state.chat.typingUsers;
export const selectIsRecording = (state) => state.chat.isRecording;
export const selectRecordingDuration = (state) => state.chat.recordingDuration;
export const selectEmojiPanelOpen = (state) => state.chat.emojiPanelOpen;
export const selectRecentEmojis = (state) => state.chat.recentEmojis;
export const selectSearchQuery = (state) => state.chat.searchQuery;
export const selectSearchResults = (state) => state.chat.searchResults;
export const selectChatSettings = (state) => state.chat.chatSettings;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectUploadingFiles = (state) => state.chat.uploadingFiles;
export const selectPinnedChats = (state) => state.chat.pinnedChats;
export const selectChatError = (state) => state.chat.error;
export const selectIsLoadingChatList = (state) => state.chat.isLoadingChatList;
export const selectIsLoadingMessages = (state) => state.chat.isLoadingMessages;
export const selectIsSendingMessage = (state) => state.chat.isSendingMessage;

// 计算选择器
export const selectCurrentChat = (state) => {
  const { chatList, currentChatId } = state.chat;
  return chatList.find(chat => chat.id === currentChatId) || null;
};

export const selectUnreadCount = (state) => {
  return state.chat.chatList.reduce((total, chat) => total + chat.unreadCount, 0);
};

export const selectSortedChatList = (state) => {
  const { chatList, pinnedChats } = state.chat;
  
  // 分离置顶和非置顶聊天
  const pinned = chatList.filter(chat => pinnedChats.includes(chat.id));
  const unpinned = chatList.filter(chat => !pinnedChats.includes(chat.id));
  
  // 按最后消息时间排序
  const sortByTime = (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  
  return [...pinned.sort(sortByTime), ...unpinned.sort(sortByTime)];
};

export const selectFilteredMessages = (state) => {
  const { currentChatMessages, deletedMessages } = state.chat;
  return currentChatMessages.filter(message => !deletedMessages.has(message.id));
};

// 导出reducer
export default chatSlice.reducer;

