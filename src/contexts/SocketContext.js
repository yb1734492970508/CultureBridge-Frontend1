import React, { createContext, useContext, useReducer, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

// 创建Socket上下文
const SocketContext = createContext();

// 初始状态
const initialState = {
  socket: null,
  isConnected: false,
  onlineUsers: [],
  currentRoom: null,
  messages: [],
  typingUsers: [],
  error: null
};

// Socket reducer
const socketReducer = (state, action) => {
  switch (action.type) {
    case 'SOCKET_CONNECTED':
      return {
        ...state,
        socket: action.payload,
        isConnected: true,
        error: null
      };
    case 'SOCKET_DISCONNECTED':
      return {
        ...state,
        socket: null,
        isConnected: false,
        currentRoom: null,
        messages: [],
        typingUsers: []
      };
    case 'ROOM_JOINED':
      return {
        ...state,
        currentRoom: action.payload.roomId,
        messages: action.payload.recentMessages || []
      };
    case 'ROOM_LEFT':
      return {
        ...state,
        currentRoom: null,
        messages: [],
        typingUsers: []
      };
    case 'MESSAGE_RECEIVED':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'VOICE_MESSAGE_RECEIVED':
      return {
        ...state,
        messages: [...state.messages, {
          ...action.payload,
          messageType: 'voice'
        }]
      };
    case 'TYPING_UPDATE':
      const { userId, isTyping } = action.payload;
      let newTypingUsers = [...state.typingUsers];
      
      if (isTyping) {
        if (!newTypingUsers.includes(userId)) {
          newTypingUsers.push(userId);
        }
      } else {
        newTypingUsers = newTypingUsers.filter(id => id !== userId);
      }
      
      return {
        ...state,
        typingUsers: newTypingUsers
      };
    case 'ONLINE_USERS_UPDATED':
      return {
        ...state,
        onlineUsers: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
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

// SocketProvider组件
export const SocketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(socketReducer, initialState);
  const { user, isAuthenticated, token } = useAuth();

  // 连接Socket
  const connectSocket = () => {
    if (!isAuthenticated || !user || state.socket) return;

    try {
      const socket = io(process.env.REACT_APP_SOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      // 连接成功
      socket.on('connect', () => {
        console.log('Socket连接成功');
        dispatch({
          type: 'SOCKET_CONNECTED',
          payload: socket
        });

        // 认证用户
        socket.emit('authenticate', {
          userId: user._id,
          username: user.username,
          token
        });
      });

      // 认证成功
      socket.on('authenticated', (data) => {
        if (data.success) {
          console.log('Socket认证成功');
        } else {
          console.error('Socket认证失败:', data.message);
          dispatch({
            type: 'SET_ERROR',
            payload: data.message
          });
        }
      });

      // 连接断开
      socket.on('disconnect', (reason) => {
        console.log('Socket连接断开:', reason);
        dispatch({ type: 'SOCKET_DISCONNECTED' });
      });

      // 接收消息
      socket.on('chat:message', (message) => {
        dispatch({
          type: 'MESSAGE_RECEIVED',
          payload: message
        });
      });

      // 接收语音消息
      socket.on('voice:message', (voiceMessage) => {
        dispatch({
          type: 'VOICE_MESSAGE_RECEIVED',
          payload: voiceMessage
        });
      });

      // 用户加入房间
      socket.on('user:joined', (data) => {
        console.log(`用户 ${data.username} 加入房间`);
      });

      // 用户离开房间
      socket.on('user:left', (data) => {
        console.log(`用户 ${data.username} 离开房间`);
      });

      // 输入状态更新
      socket.on('chat:typing', (data) => {
        dispatch({
          type: 'TYPING_UPDATE',
          payload: data
        });
      });

      // 在线用户更新
      socket.on('users:online', (data) => {
        dispatch({
          type: 'ONLINE_USERS_UPDATED',
          payload: data.users
        });
      });

      // 用户状态更新
      socket.on('user:status', (data) => {
        console.log(`用户 ${data.username} 状态更新为 ${data.status}`);
      });

      // 错误处理
      socket.on('error', (error) => {
        console.error('Socket错误:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error.message
        });
      });

      // 语音处理状态
      socket.on('voice:processing', (data) => {
        console.log('语音处理中:', data.message, data.progress);
      });

      // 语音处理错误
      socket.on('voice:error', (error) => {
        console.error('语音处理错误:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error.message
        });
      });

    } catch (error) {
      console.error('Socket连接失败:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: '连接服务器失败'
      });
    }
  };

  // 断开Socket连接
  const disconnectSocket = () => {
    if (state.socket) {
      state.socket.disconnect();
      dispatch({ type: 'SOCKET_DISCONNECTED' });
    }
  };

  // 加入聊天室
  const joinRoom = (roomId, password = null) => {
    if (!state.socket) return;

    state.socket.emit('chat:join', { roomId, password });
    
    // 监听加入成功事件
    state.socket.once('chat:joined', (data) => {
      dispatch({
        type: 'ROOM_JOINED',
        payload: data
      });
    });
  };

  // 离开聊天室
  const leaveRoom = (roomId) => {
    if (!state.socket) return;

    state.socket.emit('chat:leave', { roomId });
    dispatch({ type: 'ROOM_LEFT' });
  };

  // 发送消息
  const sendMessage = (roomId, content, messageType = 'text', targetLanguages = []) => {
    if (!state.socket) return;

    state.socket.emit('chat:message', {
      roomId,
      content,
      messageType,
      targetLanguages,
      language: 'zh' // 默认中文
    });
  };

  // 发送语音消息
  const sendVoiceMessage = (roomId, audioData, targetLanguages = ['en'], sourceLanguage = 'auto') => {
    if (!state.socket) return;

    state.socket.emit('voice:message', {
      roomId,
      audioData,
      targetLanguages,
      sourceLanguage
    });
  };

  // 发送输入状态
  const sendTypingStatus = (roomId, isTyping) => {
    if (!state.socket) return;

    state.socket.emit('chat:typing', {
      roomId,
      isTyping
    });
  };

  // 更新用户状态
  const updateUserStatus = (status) => {
    if (!state.socket) return;

    state.socket.emit('user:status', { status });
  };

  // 获取在线用户
  const getOnlineUsers = () => {
    if (!state.socket) return;

    state.socket.emit('users:online');
  };

  // 发送私聊消息
  const sendPrivateMessage = (targetUserId, content, messageType = 'text') => {
    if (!state.socket) return;

    state.socket.emit('private:message', {
      targetUserId,
      content,
      messageType
    });
  };

  // 开始语音流
  const startVoiceStream = (roomId, targetLanguage, sourceLanguage = 'auto') => {
    if (!state.socket) return;

    state.socket.emit('voice:stream:start', {
      roomId,
      targetLanguage,
      sourceLanguage
    });
  };

  // 发送语音流数据
  const sendVoiceChunk = (chunk) => {
    if (!state.socket) return;

    state.socket.emit('voice:stream:chunk', { chunk });
  };

  // 结束语音流
  const endVoiceStream = () => {
    if (!state.socket) return;

    state.socket.emit('voice:stream:end');
  };

  // 清除错误
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 当用户认证状态改变时连接/断开Socket
  useEffect(() => {
    if (isAuthenticated && user && !state.socket) {
      connectSocket();
    } else if (!isAuthenticated && state.socket) {
      disconnectSocket();
    }

    return () => {
      if (state.socket) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated, user]);

  const value = {
    ...state,
    connectSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendVoiceMessage,
    sendTypingStatus,
    updateUserStatus,
    getOnlineUsers,
    sendPrivateMessage,
    startVoiceStream,
    sendVoiceChunk,
    endVoiceStream,
    clearError
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// 使用Socket上下文的Hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;

