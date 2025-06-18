import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './RealTimeInteraction.css';

const RealTimeInteraction = () => {
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userStatus, setUserStatus] = useState('online');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 初始化Socket连接
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      upgrade: true
    });

    newSocket.on('connect', () => {
      console.log('Socket连接成功');
      setIsConnected(true);
      setSocket(newSocket);
      
      // 加入默认房间
      newSocket.emit('join_room', { roomId: 'global_chat', roomType: 'public' });
      setCurrentRoom('global_chat');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket连接断开');
      setIsConnected(false);
    });

    // 监听活跃用户更新
    newSocket.on('active_users_update', (users) => {
      setActiveUsers(users);
    });

    // 监听实时通知
    newSocket.on('real_time_notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      
      // 显示浏览器通知
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    // 监听直播事件
    newSocket.on('live_event_update', (event) => {
      setLiveEvents(prev => {
        const existingIndex = prev.findIndex(e => e.id === event.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = event;
          return updated;
        } else {
          return [event, ...prev];
        }
      });
    });

    // 监听消息
    newSocket.on('message_received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // 监听用户状态更新
    newSocket.on('user_status_update', (statusUpdate) => {
      setActiveUsers(prev => prev.map(user => 
        user.id === statusUpdate.userId 
          ? { ...user, status: statusUpdate.status, lastSeen: statusUpdate.lastSeen }
          : user
      ));
    });

    // 监听打字状态
    newSocket.on('user_typing', (data) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    // 监听用户停止打字
    newSocket.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // 请求通知权限
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 清理打字超时
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // 发送消息
  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !currentRoom) return;

    const messageData = {
      roomId: currentRoom,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
    
    // 停止打字状态
    socket.emit('stop_typing', { roomId: currentRoom });
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !currentRoom) return;

    // 发送打字状态
    socket.emit('start_typing', { roomId: currentRoom });
    
    // 设置停止打字的超时
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId: currentRoom });
    }, 1000);
  };

  // 处理按键事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 更新用户状态
  const updateUserStatus = (status) => {
    if (!socket) return;
    
    setUserStatus(status);
    socket.emit('update_status', { status });
  };

  // 加入房间
  const joinRoom = (roomId, roomType = 'public') => {
    if (!socket) return;
    
    socket.emit('leave_room', { roomId: currentRoom });
    socket.emit('join_room', { roomId, roomType });
    setCurrentRoom(roomId);
    setMessages([]);
  };

  // 创建直播事件
  const createLiveEvent = () => {
    if (!socket) return;
    
    const eventData = {
      title: '文化交流直播',
      description: '实时分享日本茶道文化',
      type: 'cultural_sharing',
      maxParticipants: 100
    };
    
    socket.emit('create_live_event', eventData);
  };

  // 加入直播事件
  const joinLiveEvent = (eventId) => {
    if (!socket) return;
    
    socket.emit('join_live_event', { eventId });
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取用户状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#48bb78';
      case 'away': return '#ed8936';
      case 'busy': return '#f56565';
      case 'offline': return '#a0aec0';
      default: return '#a0aec0';
    }
  };

  return (
    <div className="real-time-interaction">
      <div className="interaction-header">
        <h2>⚡ 实时互动</h2>
        <div className="header-controls">
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{isConnected ? '已连接' : '连接中...'}</span>
          </div>
          <div className="user-status-selector">
            <select 
              value={userStatus} 
              onChange={(e) => updateUserStatus(e.target.value)}
              className="status-select"
            >
              <option value="online">🟢 在线</option>
              <option value="away">🟡 离开</option>
              <option value="busy">🔴 忙碌</option>
              <option value="offline">⚫ 离线</option>
            </select>
          </div>
          <button 
            className="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔 通知 {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
          </button>
        </div>
      </div>

      <div className="interaction-content">
        {/* 左侧面板 */}
        <div className="left-panel">
          {/* 活跃用户 */}
          <div className="active-users-section">
            <h3>👥 在线用户 ({activeUsers.length})</h3>
            <div className="users-list">
              {activeUsers.map((user) => (
                <div key={user.id} className="user-item">
                  <div className="user-avatar-container">
                    <img src={user.avatar || '/api/placeholder/32/32'} alt="" className="user-avatar" />
                    <div 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(user.status) }}
                    ></div>
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    <span className="user-country">📍 {user.country}</span>
                  </div>
                  <button className="chat-btn" onClick={() => joinRoom(`private_${user.id}`, 'private')}>
                    💬
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 直播事件 */}
          <div className="live-events-section">
            <div className="section-header">
              <h3>🔴 直播活动</h3>
              <button className="create-live-btn" onClick={createLiveEvent}>
                + 创建
              </button>
            </div>
            <div className="events-list">
              {liveEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <span className="participant-count">👥 {event.participantCount}</span>
                  </div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-actions">
                    <button 
                      className="join-event-btn"
                      onClick={() => joinLiveEvent(event.id)}
                    >
                      加入直播
                    </button>
                  </div>
                </div>
              ))}
              {liveEvents.length === 0 && (
                <div className="no-events">
                  <p>暂无直播活动</p>
                  <button onClick={createLiveEvent}>创建第一个直播</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 中间聊天区域 */}
        <div className="chat-area">
          <div className="chat-header">
            <h3>💬 {currentRoom === 'global_chat' ? '全球聊天室' : '私聊'}</h3>
            <div className="room-controls">
              <button 
                className={`room-btn ${currentRoom === 'global_chat' ? 'active' : ''}`}
                onClick={() => joinRoom('global_chat', 'public')}
              >
                全球聊天
              </button>
              <button 
                className={`room-btn ${currentRoom === 'language_exchange' ? 'active' : ''}`}
                onClick={() => joinRoom('language_exchange', 'public')}
              >
                语言交换
              </button>
              <button 
                className={`room-btn ${currentRoom === 'cultural_sharing' ? 'active' : ''}`}
                onClick={() => joinRoom('cultural_sharing', 'public')}
              >
                文化分享
              </button>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isOwn ? 'own' : 'other'}`}>
                <div className="message-header">
                  <img src={message.user?.avatar || '/api/placeholder/24/24'} alt="" className="message-avatar" />
                  <span className="message-username">{message.user?.username}</span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            
            {/* 打字指示器 */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">
                  {typingUsers.map(u => u.username).join(', ')} 正在输入...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-area">
            <div className="input-container">
              <textarea
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                className="message-input"
                rows={1}
              />
              <button 
                className="send-btn"
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
              >
                📤
              </button>
            </div>
          </div>
        </div>

        {/* 右侧通知面板 */}
        {showNotifications && (
          <div className="notifications-panel">
            <div className="panel-header">
              <h3>🔔 实时通知</h3>
              <button 
                className="close-panel-btn"
                onClick={() => setShowNotifications(false)}
              >
                ×
              </button>
            </div>
            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div key={index} className={`notification-item ${notification.type}`}>
                  <div className="notification-icon">
                    {notification.type === 'message' ? '💬' :
                     notification.type === 'friend_request' ? '👥' :
                     notification.type === 'event' ? '🎉' :
                     notification.type === 'system' ? '⚙️' : '📢'}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  {notification.actionUrl && (
                    <button className="notification-action">
                      查看
                    </button>
                  )}
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="no-notifications">
                  <p>暂无新通知</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeInteraction;

