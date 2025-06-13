import io from 'socket.io-client';

class EnhancedSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.currentRoom = null;
    this.user = null;
  }

  /**
   * 连接到Socket.IO服务器
   */
  connect(user) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    this.user = user;
    const token = localStorage.getItem('token');

    this.socket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: {
        token,
        userId: user?.id,
        username: user?.username,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
    this.setupReconnection();

    console.log('Connecting to Socket.IO server...');
  }

  /**
   * 设置基础事件监听器
   */
  setupEventListeners() {
    if (!this.socket) return;

    // 连接成功
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket:connected', { socketId: this.socket.id });
    });

    // 连接断开
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('socket:disconnected', { reason });
    });

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('socket:error', { error: error.message });
    });

    // 认证成功
    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
      this.emit('socket:authenticated', data);
    });

    // 认证失败
    this.socket.on('authentication_error', (error) => {
      console.error('❌ Socket authentication failed:', error);
      this.emit('socket:auth_error', error);
    });

    // 用户加入房间
    this.socket.on('user_joined', (data) => {
      console.log('👤 User joined room:', data);
      this.emit('room:user_joined', data);
    });

    // 用户离开房间
    this.socket.on('user_left', (data) => {
      console.log('👤 User left room:', data);
      this.emit('room:user_left', data);
    });

    // 接收新消息
    this.socket.on('new_message', (message) => {
      console.log('💬 New message received:', message);
      this.emit('chat:new_message', message);
    });

    // 接收语音消息
    this.socket.on('voice_message', (voiceMessage) => {
      console.log('🎤 Voice message received:', voiceMessage);
      this.emit('chat:voice_message', voiceMessage);
    });

    // 消息状态更新
    this.socket.on('message_status', (status) => {
      console.log('📝 Message status updated:', status);
      this.emit('chat:message_status', status);
    });

    // 用户正在输入
    this.socket.on('user_typing', (data) => {
      this.emit('chat:user_typing', data);
    });

    // 用户停止输入
    this.socket.on('user_stop_typing', (data) => {
      this.emit('chat:user_stop_typing', data);
    });

    // 在线用户列表更新
    this.socket.on('online_users_updated', (users) => {
      console.log('👥 Online users updated:', users);
      this.emit('room:online_users_updated', users);
    });

    // 代币转账通知
    this.socket.on('token_transfer', (transfer) => {
      console.log('💰 Token transfer received:', transfer);
      this.emit('blockchain:token_transfer', transfer);
    });

    // 奖励通知
    this.socket.on('reward_received', (reward) => {
      console.log('🎁 Reward received:', reward);
      this.emit('blockchain:reward_received', reward);
    });

    // 语音翻译完成
    this.socket.on('voice_translation_complete', (translation) => {
      console.log('🔄 Voice translation complete:', translation);
      this.emit('voice:translation_complete', translation);
    });

    // 系统通知
    this.socket.on('system_notification', (notification) => {
      console.log('🔔 System notification:', notification);
      this.emit('system:notification', notification);
    });
  }

  /**
   * 设置重连机制
   */
  setupReconnection() {
    if (!this.socket) return;

    this.socket.on('disconnect', () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          this.socket.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
      } else {
        console.error('❌ Max reconnection attempts reached');
        this.emit('socket:max_reconnect_reached');
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from Socket.IO server...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentRoom = null;
    }
  }

  /**
   * 加入聊天室
   */
  joinRoom(roomId, roomData = {}) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    console.log(`🚪 Joining room: ${roomId}`);
    this.currentRoom = roomId;
    this.socket.emit('join_room', {
      roomId,
      ...roomData,
    });
  }

  /**
   * 离开聊天室
   */
  leaveRoom(roomId) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    console.log(`🚪 Leaving room: ${roomId}`);
    this.socket.emit('leave_room', { roomId });
    
    if (this.currentRoom === roomId) {
      this.currentRoom = null;
    }
  }

  /**
   * 发送文本消息
   */
  sendMessage(roomId, messageData) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    const message = {
      roomId,
      type: 'text',
      content: messageData.content,
      timestamp: new Date().toISOString(),
      sender: this.user,
      ...messageData,
    };

    console.log('📤 Sending message:', message);
    this.socket.emit('send_message', message);
  }

  /**
   * 发送语音消息
   */
  sendVoiceMessage(roomId, voiceData) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    const voiceMessage = {
      roomId,
      type: 'voice',
      audioData: voiceData.audioData,
      duration: voiceData.duration,
      originalLanguage: voiceData.originalLanguage,
      targetLanguages: voiceData.targetLanguages,
      timestamp: new Date().toISOString(),
      sender: this.user,
      ...voiceData,
    };

    console.log('🎤 Sending voice message:', voiceMessage);
    this.socket.emit('send_voice_message', voiceMessage);
  }

  /**
   * 发送输入状态
   */
  sendTypingStatus(roomId, isTyping) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit(isTyping ? 'start_typing' : 'stop_typing', {
      roomId,
      userId: this.user?.id,
      username: this.user?.username,
    });
  }

  /**
   * 发送代币转账
   */
  sendTokenTransfer(transferData) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    console.log('💰 Sending token transfer:', transferData);
    this.socket.emit('token_transfer', transferData);
  }

  /**
   * 请求语音翻译
   */
  requestVoiceTranslation(translationData) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    console.log('🔄 Requesting voice translation:', translationData);
    this.socket.emit('voice_translation_request', translationData);
  }

  /**
   * 获取在线用户列表
   */
  getOnlineUsers(roomId) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('get_online_users', { roomId });
  }

  /**
   * 添加事件监听器
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * 移除事件监听器
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      currentRoom: this.currentRoom,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * 健康检查
   */
  healthCheck() {
    if (!this.socket || !this.isConnected) {
      return {
        status: 'disconnected',
        message: 'Socket not connected',
      };
    }

    return {
      status: 'connected',
      socketId: this.socket.id,
      currentRoom: this.currentRoom,
      message: 'Socket connection healthy',
    };
  }
}

// 创建单例实例
const socketService = new EnhancedSocketService();

export default socketService;

