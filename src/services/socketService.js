// Socket.IO客户端服务
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  // 连接到Socket.IO服务器
  connect(token = null) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      auth: {
        token: token || localStorage.getItem('authToken'),
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  // 设置基础事件监听器
  setupEventListeners() {
    if (!this.socket) return;

    // 连接成功
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket:connected', { socketId: this.socket.id });
    });

    // 连接断开
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('socket:disconnected', { reason });
      
      // 自动重连
      if (reason === 'io server disconnect') {
        this.reconnect();
      }
    });

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('socket:error', { error: error.message });
      this.reconnect();
    });

    // 认证错误
    this.socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error);
      this.emit('socket:auth_error', { error });
      this.disconnect();
    });

    // 聊天相关事件
    this.setupChatListeners();
    
    // 语音翻译相关事件
    this.setupVoiceListeners();
    
    // 代币相关事件
    this.setupTokenListeners();
  }

  // 设置聊天相关监听器
  setupChatListeners() {
    if (!this.socket) return;

    // 新消息
    this.socket.on('chat:message', (data) => {
      this.emit('chat:message', data);
    });

    // 消息删除
    this.socket.on('chat:message_deleted', (data) => {
      this.emit('chat:message_deleted', data);
    });

    // 消息反应
    this.socket.on('chat:message_reaction', (data) => {
      this.emit('chat:message_reaction', data);
    });

    // 用户加入聊天室
    this.socket.on('chat:user_joined', (data) => {
      this.emit('chat:user_joined', data);
    });

    // 用户离开聊天室
    this.socket.on('chat:user_left', (data) => {
      this.emit('chat:user_left', data);
    });

    // 用户正在输入
    this.socket.on('chat:typing', (data) => {
      this.emit('chat:typing', data);
    });

    // 用户停止输入
    this.socket.on('chat:stop_typing', (data) => {
      this.emit('chat:stop_typing', data);
    });

    // 聊天室更新
    this.socket.on('chat:room_updated', (data) => {
      this.emit('chat:room_updated', data);
    });
  }

  // 设置语音翻译相关监听器
  setupVoiceListeners() {
    if (!this.socket) return;

    // 翻译完成
    this.socket.on('voice:translation_complete', (data) => {
      this.emit('voice:translation_complete', data);
    });

    // 翻译错误
    this.socket.on('voice:translation_error', (data) => {
      this.emit('voice:translation_error', data);
    });

    // 语音识别进度
    this.socket.on('voice:recognition_progress', (data) => {
      this.emit('voice:recognition_progress', data);
    });
  }

  // 设置代币相关监听器
  setupTokenListeners() {
    if (!this.socket) return;

    // 代币余额更新
    this.socket.on('token:balance_updated', (data) => {
      this.emit('token:balance_updated', data);
    });

    // 新的代币奖励
    this.socket.on('token:reward_received', (data) => {
      this.emit('token:reward_received', data);
    });

    // 代币转账完成
    this.socket.on('token:transfer_complete', (data) => {
      this.emit('token:transfer_complete', data);
    });

    // 区块链交易状态更新
    this.socket.on('blockchain:transaction_update', (data) => {
      this.emit('blockchain:transaction_update', data);
    });
  }

  // 重连机制
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('socket:max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // 聊天相关方法
  joinRoom(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:join_room', { roomId });
    }
  }

  leaveRoom(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:leave_room', { roomId });
    }
  }

  sendMessage(roomId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:send_message', {
        roomId,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  deleteMessage(roomId, messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:delete_message', { roomId, messageId });
    }
  }

  reactToMessage(roomId, messageId, reaction) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:react_message', { roomId, messageId, reaction });
    }
  }

  startTyping(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:start_typing', { roomId });
    }
  }

  stopTyping(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:stop_typing', { roomId });
    }
  }

  // 语音翻译相关方法
  startVoiceTranslation(translationData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('voice:start_translation', translationData);
    }
  }

  cancelVoiceTranslation(translationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('voice:cancel_translation', { translationId });
    }
  }

  // 事件监听器管理
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // 发送心跳包
  sendHeartbeat() {
    if (this.socket && this.isConnected) {
      this.socket.emit('heartbeat', { timestamp: Date.now() });
    }
  }

  // 启动心跳检测
  startHeartbeat(interval = 30000) {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, interval);
  }

  // 停止心跳检测
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;

