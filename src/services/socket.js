/**
 * Socket.IO 服务
 * 提供实时通信功能，包括聊天、通知、状态同步等
 */

import { io } from 'socket.io-client';
import config from '../utils/config';
import { store } from '../store';
import {
  setConnected,
  setConnecting,
  incrementReconnectAttempts,
  addMessage,
  userJoined,
  userLeft,
  userStartedTyping,
  userStoppedTyping,
  setOnlineUsers,
} from '../store/slices/chatSlice';
import {
  updateTokenBalance,
  updateTransactionStatus,
  addPendingTransaction,
} from '../store/slices/blockchainSlice';
import {
  addNotification,
  addError,
} from '../store/slices/uiSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.eventListeners = new Map();
  }

  /**
   * 连接到Socket.IO服务器
   */
  connect() {
    if (this.socket?.connected) {
      return;
    }

    const socketConfig = config.getSocketConfig();
    
    store.dispatch(setConnecting(true));

    this.socket = io(socketConfig.url, {
      timeout: socketConfig.timeout,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      auth: {
        token: localStorage.getItem('auth_token'),
      },
    });

    this.setupEventListeners();
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.clearHeartbeat();
    store.dispatch(setConnected(false));
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (!this.socket) return;

    // 连接事件
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      store.dispatch(setConnected(true));
      store.dispatch(addNotification({
        type: 'success',
        title: '连接成功',
        message: '实时通信已连接',
        duration: 3000,
      }));

      this.startHeartbeat();
      this.authenticateUser();
    });

    // 断开连接事件
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.clearHeartbeat();
      
      store.dispatch(setConnected(false));
      
      if (reason === 'io server disconnect') {
        // 服务器主动断开，需要重新连接
        this.socket.connect();
      }
    });

    // 连接错误事件
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      store.dispatch(incrementReconnectAttempts());
      store.dispatch(addError({
        type: 'connection',
        title: '连接失败',
        message: `连接失败，正在重试... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      }));

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        store.dispatch(addError({
          type: 'connection',
          title: '连接失败',
          message: '无法连接到服务器，请检查网络连接',
        }));
      }
    });

    // 重新连接事件
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      
      store.dispatch(addNotification({
        type: 'success',
        title: '重新连接成功',
        message: '实时通信已恢复',
        duration: 3000,
      }));
    });

    // 认证事件
    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      this.joinUserRooms();
    });

    this.socket.on('authentication_error', (error) => {
      console.error('Socket authentication error:', error);
      store.dispatch(addError({
        type: 'auth',
        title: '认证失败',
        message: '实时通信认证失败，请重新登录',
      }));
    });

    // 聊天相关事件
    this.setupChatEvents();
    
    // 区块链相关事件
    this.setupBlockchainEvents();
    
    // 通知相关事件
    this.setupNotificationEvents();
    
    // 系统相关事件
    this.setupSystemEvents();
  }

  /**
   * 设置聊天相关事件
   */
  setupChatEvents() {
    if (!this.socket) return;

    // 新消息
    this.socket.on('new_message', (message) => {
      store.dispatch(addMessage({
        roomId: message.roomId,
        message,
      }));
    });

    // 用户加入房间
    this.socket.on('user_joined', (data) => {
      store.dispatch(userJoined({
        roomId: data.roomId,
        user: data.user,
      }));
    });

    // 用户离开房间
    this.socket.on('user_left', (data) => {
      store.dispatch(userLeft({
        roomId: data.roomId,
        userId: data.userId,
      }));
    });

    // 用户开始输入
    this.socket.on('user_typing', (data) => {
      store.dispatch(userStartedTyping({
        roomId: data.roomId,
        userId: data.userId,
      }));
    });

    // 用户停止输入
    this.socket.on('user_stop_typing', (data) => {
      store.dispatch(userStoppedTyping({
        roomId: data.roomId,
        userId: data.userId,
      }));
    });

    // 在线用户更新
    this.socket.on('online_users_updated', (data) => {
      store.dispatch(setOnlineUsers({
        roomId: data.roomId,
        users: data.users,
      }));
    });

    // 消息状态更新
    this.socket.on('message_status_updated', (data) => {
      // 处理消息状态更新（已读、已发送等）
    });
  }

  /**
   * 设置区块链相关事件
   */
  setupBlockchainEvents() {
    if (!this.socket) return;

    // 余额更新
    this.socket.on('balance_updated', (data) => {
      store.dispatch(updateTokenBalance({
        symbol: data.symbol,
        balance: data.balance,
      }));
    });

    // 交易状态更新
    this.socket.on('transaction_updated', (data) => {
      store.dispatch(updateTransactionStatus({
        hash: data.hash,
        status: data.status,
        blockNumber: data.blockNumber,
      }));
    });

    // 新的待处理交易
    this.socket.on('pending_transaction', (data) => {
      store.dispatch(addPendingTransaction(data));
    });

    // 奖励通知
    this.socket.on('reward_received', (data) => {
      store.dispatch(addNotification({
        type: 'success',
        title: '获得奖励',
        message: `您获得了 ${data.amount} ${data.symbol} 奖励`,
        duration: 5000,
      }));
    });
  }

  /**
   * 设置通知相关事件
   */
  setupNotificationEvents() {
    if (!this.socket) return;

    // 系统通知
    this.socket.on('system_notification', (notification) => {
      store.dispatch(addNotification({
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        duration: notification.duration || 5000,
      }));
    });

    // 成就解锁通知
    this.socket.on('achievement_unlocked', (achievement) => {
      store.dispatch(addNotification({
        type: 'success',
        title: '成就解锁',
        message: `恭喜您解锁了成就：${achievement.name}`,
        duration: 8000,
      }));
    });

    // 好友请求
    this.socket.on('friend_request', (data) => {
      store.dispatch(addNotification({
        type: 'info',
        title: '好友请求',
        message: `${data.fromUser.name} 想要添加您为好友`,
        duration: 10000,
        actions: [
          { label: '接受', action: () => this.acceptFriendRequest(data.requestId) },
          { label: '拒绝', action: () => this.rejectFriendRequest(data.requestId) },
        ],
      }));
    });
  }

  /**
   * 设置系统相关事件
   */
  setupSystemEvents() {
    if (!this.socket) return;

    // 服务器维护通知
    this.socket.on('server_maintenance', (data) => {
      store.dispatch(addNotification({
        type: 'warning',
        title: '服务器维护',
        message: `服务器将在 ${data.time} 进行维护，预计持续 ${data.duration}`,
        duration: 0, // 不自动消失
      }));
    });

    // 版本更新通知
    this.socket.on('version_update', (data) => {
      store.dispatch(addNotification({
        type: 'info',
        title: '版本更新',
        message: `新版本 ${data.version} 已发布，请刷新页面获取最新功能`,
        duration: 0,
        actions: [
          { label: '立即更新', action: () => window.location.reload() },
          { label: '稍后提醒', action: () => {} },
        ],
      }));
    });

    // 心跳响应
    this.socket.on('pong', () => {
      // 心跳响应，保持连接活跃
    });
  }

  /**
   * 用户认证
   */
  authenticateUser() {
    const token = localStorage.getItem('auth_token');
    if (token && this.socket) {
      this.socket.emit('authenticate', { token });
    }
  }

  /**
   * 加入用户相关的房间
   */
  joinUserRooms() {
    const state = store.getState();
    const user = state.auth.user;
    
    if (user && this.socket) {
      // 加入用户个人房间（用于接收个人通知）
      this.socket.emit('join_user_room', { userId: user.id });
      
      // 加入用户当前的聊天室
      const currentRoom = state.chat.currentRoom;
      if (currentRoom) {
        this.joinChatRoom(currentRoom);
      }
    }
  }

  /**
   * 开始心跳
   */
  startHeartbeat() {
    this.clearHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // 每30秒发送一次心跳
  }

  /**
   * 清除心跳
   */
  clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 加入聊天室
   */
  joinChatRoom(roomId) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', { roomId });
    }
  }

  /**
   * 离开聊天室
   */
  leaveChatRoom(roomId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', { roomId });
    }
  }

  /**
   * 发送消息
   */
  sendMessage(roomId, message) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        roomId,
        message,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 发送输入状态
   */
  sendTypingStatus(roomId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit(isTyping ? 'start_typing' : 'stop_typing', { roomId });
    }
  }

  /**
   * 发送语音消息
   */
  sendVoiceMessage(roomId, audioBlob) {
    if (this.socket?.connected) {
      // 将音频转换为base64
      const reader = new FileReader();
      reader.onload = () => {
        this.socket.emit('send_voice_message', {
          roomId,
          audioData: reader.result,
          timestamp: Date.now(),
        });
      };
      reader.readAsDataURL(audioBlob);
    }
  }

  /**
   * 接受好友请求
   */
  acceptFriendRequest(requestId) {
    if (this.socket?.connected) {
      this.socket.emit('accept_friend_request', { requestId });
    }
  }

  /**
   * 拒绝好友请求
   */
  rejectFriendRequest(requestId) {
    if (this.socket?.connected) {
      this.socket.emit('reject_friend_request', { requestId });
    }
  }

  /**
   * 订阅区块链事件
   */
  subscribeToBlockchainEvents(address) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_blockchain', { address });
    }
  }

  /**
   * 取消订阅区块链事件
   */
  unsubscribeFromBlockchainEvents(address) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_blockchain', { address });
    }
  }

  /**
   * 添加自定义事件监听器
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // 保存监听器引用以便后续清理
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }
  }

  /**
   * 移除事件监听器
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // 从保存的引用中移除
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  /**
   * 发送自定义事件
   */
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  /**
   * 获取连接状态
   */
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  /**
   * 获取Socket ID
   */
  getSocketId() {
    return this.socket?.id || null;
  }
}

// 创建全局Socket服务实例
const socketService = new SocketService();

export default socketService;

