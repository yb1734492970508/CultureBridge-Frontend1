import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, voiceAPI, apiUtils } from '../../services/enhancedAPI';
import socketService from '../../services/enhancedSocketService';
import { useAuth } from '../../context/auth/EnhancedAuthContext';
import './EnhancedRealTimeChat.css';

const EnhancedRealTimeChat = () => {
  const { user, isAuthenticated } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',
    language: 'zh-CN',
    isPrivate: false,
  });

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);

  // 初始化组件
  useEffect(() => {
    if (isAuthenticated) {
      initializeChat();
    }

    return () => {
      if (currentRoom) {
        socketService.leaveRoom(currentRoom.id);
      }
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  // 设置Socket事件监听
  useEffect(() => {
    if (isAuthenticated) {
      setupSocketListeners();
    }
  }, [isAuthenticated]);

  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * 初始化聊天功能
   */
  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // 获取聊天室列表
      await fetchChatRooms();
      
      // 连接Socket
      socketService.connect(user);
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError('初始化聊天功能失败');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 设置Socket事件监听器
   */
  const setupSocketListeners = () => {
    // 连接状态
    socketService.on('socket:connected', () => {
      setIsConnected(true);
      setError(null);
    });

    socketService.on('socket:disconnected', () => {
      setIsConnected(false);
    });

    socketService.on('socket:error', (data) => {
      setError(`连接错误: ${data.error}`);
    });

    // 聊天消息
    socketService.on('chat:new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketService.on('chat:voice_message', (voiceMessage) => {
      setMessages(prev => [...prev, voiceMessage]);
    });

    // 用户状态
    socketService.on('room:user_joined', (data) => {
      setOnlineUsers(prev => [...prev, data.user]);
    });

    socketService.on('room:user_left', (data) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== data.user.id));
    });

    socketService.on('room:online_users_updated', (users) => {
      setOnlineUsers(users);
    });

    // 输入状态
    socketService.on('chat:user_typing', (data) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });

    socketService.on('chat:user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // 语音翻译完成
    socketService.on('voice:translation_complete', (translation) => {
      // 更新对应的语音消息
      setMessages(prev => prev.map(msg => 
        msg.id === translation.messageId 
          ? { ...msg, translation: translation.result }
          : msg
      ));
    });
  };

  /**
   * 获取聊天室列表
   */
  const fetchChatRooms = async () => {
    try {
      const response = await chatAPI.getChatRooms();
      if (response.success) {
        setChatRooms(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    }
  };

  /**
   * 创建聊天室
   */
  const createChatRoom = async () => {
    try {
      setIsLoading(true);
      
      const response = await chatAPI.createChatRoom(newRoomData);
      
      if (response.success) {
        setChatRooms(prev => [...prev, response.data]);
        setShowCreateRoom(false);
        setNewRoomData({
          name: '',
          description: '',
          language: 'zh-CN',
          isPrivate: false,
        });
        
        // 自动加入新创建的房间
        await joinRoom(response.data);
      } else {
        setError(response.error);
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 加入聊天室
   */
  const joinRoom = async (room) => {
    try {
      setIsLoading(true);
      
      // 离开当前房间
      if (currentRoom) {
        socketService.leaveRoom(currentRoom.id);
      }
      
      // 加入新房间
      const response = await chatAPI.joinChatRoom(room.id);
      
      if (response.success) {
        setCurrentRoom(room);
        setMessages([]);
        setOnlineUsers([]);
        setTypingUsers([]);
        
        // Socket加入房间
        socketService.joinRoom(room.id, { roomName: room.name });
        
        // 获取房间消息
        await fetchRoomMessages(room.id);
        
        // 获取在线用户
        socketService.getOnlineUsers(room.id);
      } else {
        setError(response.error);
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 获取房间消息
   */
  const fetchRoomMessages = async (roomId) => {
    try {
      const response = await chatAPI.getMessages(roomId, { limit: 50 });
      if (response.success) {
        setMessages(response.data.reverse());
      }
    } catch (error) {
      console.error('Failed to fetch room messages:', error);
    }
  };

  /**
   * 发送文本消息
   */
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        type: 'text',
      };

      // 通过Socket发送消息
      socketService.sendMessage(currentRoom.id, messageData);
      
      // 清空输入框
      setNewMessage('');
      
      // 停止输入状态
      socketService.sendTypingStatus(currentRoom.id, false);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('发送消息失败');
    }
  };

  /**
   * 开始录音
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('无法访问麦克风');
    }
  };

  /**
   * 停止录音
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * 发送语音消息
   */
  const sendVoiceMessage = async () => {
    if (!audioBlob || !currentRoom) return;

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');
      formData.append('roomId', currentRoom.id);

      const response = await chatAPI.uploadVoiceMessage(currentRoom.id, formData);
      
      if (response.success) {
        // 通过Socket发送语音消息
        socketService.sendVoiceMessage(currentRoom.id, {
          audioUrl: response.data.audioUrl,
          duration: response.data.duration,
          originalLanguage: 'auto',
          targetLanguages: ['zh-CN', 'en-US'],
        });
        
        setAudioBlob(null);
      } else {
        setError(response.error);
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // 发送输入状态
    if (currentRoom) {
      socketService.sendTypingStatus(currentRoom.id, true);
      
      // 清除之前的定时器
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // 设置新的定时器，3秒后停止输入状态
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTypingStatus(currentRoom.id, false);
      }, 3000);
    }
  };

  /**
   * 处理键盘事件
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * 播放语音消息
   */
  const playVoiceMessage = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
    });
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="chat-container">
        <div className="auth-required">
          <h3>请先登录</h3>
          <p>使用实时聊天功能需要登录账户</p>
          <a href="/login" className="login-link">前往登录</a>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 实时聊天</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 已连接' : '🔴 未连接'}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      <div className="chat-layout">
        {/* 聊天室列表 */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h3>聊天室</h3>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="create-room-button"
            >
              ➕
            </button>
          </div>

          <div className="room-list">
            {chatRooms.map(room => (
              <div
                key={room.id}
                className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => joinRoom(room)}
              >
                <div className="room-info">
                  <h4>{room.name}</h4>
                  <p>{room.description}</p>
                  <span className="room-language">{room.language}</span>
                </div>
                <div className="room-stats">
                  <span className="member-count">👥 {room.memberCount}</span>
                  {room.isPrivate && <span className="private-badge">🔒</span>}
                </div>
              </div>
            ))}
          </div>

          {/* 在线用户 */}
          {currentRoom && onlineUsers.length > 0 && (
            <div className="online-users">
              <h4>在线用户 ({onlineUsers.length})</h4>
              <div className="user-list">
                {onlineUsers.map(user => (
                  <div key={user.id} className="user-item">
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{user.username}</span>
                    <span className="online-indicator">🟢</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 聊天区域 */}
        <div className="chat-main">
          {currentRoom ? (
            <>
              <div className="chat-room-header">
                <h3>{currentRoom.name}</h3>
                <p>{currentRoom.description}</p>
              </div>

              <div className="messages-container">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.sender?.id === user.id ? 'own' : 'other'}`}
                  >
                    <div className="message-header">
                      <span className="sender-name">{message.sender?.username}</span>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    
                    <div className="message-content">
                      {message.type === 'text' ? (
                        <p>{message.content}</p>
                      ) : message.type === 'voice' ? (
                        <div className="voice-message">
                          <button
                            onClick={() => playVoiceMessage(message.audioUrl)}
                            className="play-voice-button"
                          >
                            🎤 播放语音 ({message.duration}s)
                          </button>
                          {message.translation && (
                            <div className="voice-translation">
                              <p><strong>翻译:</strong> {message.translation.text}</p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                
                {/* 输入状态指示 */}
                {typingUsers.length > 0 && (
                  <div className="typing-indicator">
                    {typingUsers.map(user => user.username).join(', ')} 正在输入...
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-area">
                {audioBlob && (
                  <div className="voice-preview">
                    <span>🎤 语音已录制</span>
                    <button onClick={sendVoiceMessage} className="send-voice-button">
                      发送语音
                    </button>
                    <button onClick={() => setAudioBlob(null)} className="cancel-voice-button">
                      取消
                    </button>
                  </div>
                )}

                <div className="input-controls">
                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className={`voice-button ${isRecording ? 'recording' : ''}`}
                    disabled={isLoading}
                  >
                    {isRecording ? '🔴' : '🎤'}
                  </button>

                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                    rows={1}
                    disabled={isLoading}
                  />

                  <button
                    onClick={sendMessage}
                    className="send-button"
                    disabled={!newMessage.trim() || isLoading}
                  >
                    📤
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-room-selected">
              <h3>选择一个聊天室开始对话</h3>
              <p>从左侧选择一个聊天室，或创建新的聊天室</p>
            </div>
          )}
        </div>
      </div>

      {/* 创建聊天室模态框 */}
      {showCreateRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>创建聊天室</h3>
              <button
                onClick={() => setShowCreateRoom(false)}
                className="close-modal"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>房间名称:</label>
                <input
                  type="text"
                  value={newRoomData.name}
                  onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                  placeholder="输入房间名称"
                />
              </div>

              <div className="form-group">
                <label>房间描述:</label>
                <textarea
                  value={newRoomData.description}
                  onChange={(e) => setNewRoomData({...newRoomData, description: e.target.value})}
                  placeholder="输入房间描述"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>主要语言:</label>
                <select
                  value={newRoomData.language}
                  onChange={(e) => setNewRoomData({...newRoomData, language: e.target.value})}
                >
                  <option value="zh-CN">中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                  <option value="ko-KR">한국어</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newRoomData.isPrivate}
                    onChange={(e) => setNewRoomData({...newRoomData, isPrivate: e.target.checked})}
                  />
                  私人房间
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowCreateRoom(false)}
                className="cancel-button"
              >
                取消
              </button>
              <button
                onClick={createChatRoom}
                className="create-button"
                disabled={!newRoomData.name.trim() || isLoading}
              >
                {isLoading ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRealTimeChat;

