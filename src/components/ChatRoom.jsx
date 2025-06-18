import React, { useState, useEffect, useRef } from 'react';
import './ChatRoom.css';

const ChatRoom = ({ roomId, roomName, user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Yuki',
      avatar: '🇯🇵',
      message: 'こんにちは！日本の文化について話しましょう！',
      translation: 'Hello! Let\'s talk about Japanese culture!',
      timestamp: new Date(Date.now() - 300000),
      showTranslation: false
    },
    {
      id: 2,
      user: 'Marie',
      avatar: '🇫🇷',
      message: 'Bonjour! Je suis intéressée par la cuisine japonaise.',
      translation: 'Hello! I\'m interested in Japanese cuisine.',
      timestamp: new Date(Date.now() - 240000),
      showTranslation: false
    },
    {
      id: 3,
      user: 'Carlos',
      avatar: '🇪🇸',
      message: '¡Hola! ¿Alguien puede ayudarme con el español?',
      translation: 'Hello! Can someone help me with Spanish?',
      timestamp: new Date(Date.now() - 180000),
      showTranslation: false
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([
    { id: 1, name: 'Yuki', avatar: '🇯🇵', status: 'online' },
    { id: 2, name: 'Marie', avatar: '🇫🇷', status: 'online' },
    { id: 3, name: 'Carlos', avatar: '🇪🇸', status: 'typing' },
    { id: 4, name: 'Anna', avatar: '🇩🇪', status: 'away' },
    { id: 5, name: 'Li Wei', avatar: '🇨🇳', status: 'online' }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(['Carlos']);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: user.name,
        avatar: '🌟',
        message: newMessage,
        timestamp: new Date(),
        showTranslation: false
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
      
      // 模拟其他用户回复
      setTimeout(() => {
        const responses = [
          { user: 'Yuki', avatar: '🇯🇵', message: 'とても興味深いですね！', translation: 'That\'s very interesting!' },
          { user: 'Marie', avatar: '🇫🇷', message: 'C\'est fantastique!', translation: 'That\'s fantastic!' },
          { user: 'Carlos', avatar: '🇪🇸', message: '¡Excelente punto!', translation: 'Excellent point!' }
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage = {
          id: messages.length + 2,
          ...randomResponse,
          timestamp: new Date(),
          showTranslation: false
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const toggleTranslation = (messageId) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, showTranslation: !msg.showTranslation }
        : msg
    ));
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'away': return '#F59E0B';
      case 'typing': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="room-info">
          <h2>{roomName}</h2>
          <span className="online-count">{onlineUsers.filter(u => u.status === 'online').length} 在线</span>
        </div>
        <button className="room-settings">⚙️</button>
      </div>

      <div className="chat-content">
        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.user === user.name ? 'own-message' : ''}`}>
                <div className="message-avatar">{message.avatar}</div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-user">{message.user}</span>
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="message-text">
                    {message.message}
                    {message.translation && (
                      <div className={`translation ${message.showTranslation ? 'show' : ''}`}>
                        {message.translation}
                      </div>
                    )}
                  </div>
                  <div className="message-actions">
                    {message.translation && (
                      <button 
                        className="translate-btn"
                        onClick={() => toggleTranslation(message.id)}
                      >
                        🌐
                      </button>
                    )}
                    <button className="react-btn">❤️</button>
                    <button className="reply-btn">↩️</button>
                  </div>
                </div>
              </div>
            ))}
            
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">
                  {typingUsers.join(', ')} 正在输入...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="online-users">
          <h3>在线用户</h3>
          <div className="users-list">
            {onlineUsers.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <div 
                    className="user-status"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chat-input">
        <div className="input-tools">
          <button className="tool-btn">😊</button>
          <button className="tool-btn">📎</button>
          <button className="tool-btn">🎤</button>
        </div>
        <div className="input-area">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... (支持多语言自动翻译)"
            rows="1"
          />
          <button 
            className="send-btn"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

