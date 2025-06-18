import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPage = ({ user, theme }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Yuki',
      avatar: '/api/placeholder/32/32',
      message: 'こんにちは！日本の文化について話しましょう！',
      translation: '你好！让我们聊聊日本文化吧！',
      timestamp: new Date(Date.now() - 300000),
      country: 'Japan',
      isOwn: false
    },
    {
      id: 2,
      sender: user.username,
      avatar: user.avatar,
      message: '你好！我对日本茶道很感兴趣',
      translation: 'Hello! I\'m very interested in Japanese tea ceremony',
      timestamp: new Date(Date.now() - 240000),
      country: 'China',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Marie',
      avatar: '/api/placeholder/32/32',
      message: 'Bonjour! Je peux vous parler de la culture française aussi!',
      translation: '你好！我也可以和你们聊聊法国文化！',
      timestamp: new Date(Date.now() - 180000),
      country: 'France',
      isOwn: false
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [showTranslation, setShowTranslation] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([
    { name: 'Yuki', country: 'Japan', avatar: '/api/placeholder/32/32', status: 'online' },
    { name: 'Marie', country: 'France', avatar: '/api/placeholder/32/32', status: 'online' },
    { name: 'Carlos', country: 'Spain', avatar: '/api/placeholder/32/32', status: 'away' },
    { name: 'Ahmed', country: 'Egypt', avatar: '/api/placeholder/32/32', status: 'online' }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: user.username,
        avatar: user.avatar,
        message: newMessage,
        translation: '', // 实际应用中会调用翻译API
        timestamp: new Date(),
        country: 'China',
        isOwn: true
      };

      setMessages([...messages, message]);
      setNewMessage('');

      // 模拟其他用户回复
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const responses = [
            { sender: 'Yuki', message: 'とても興味深いですね！', translation: '非常有趣呢！', country: 'Japan' },
            { sender: 'Marie', message: 'C\'est fascinant!', translation: '太迷人了！', country: 'France' }
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            sender: randomResponse.sender,
            avatar: '/api/placeholder/32/32',
            message: randomResponse.message,
            translation: randomResponse.translation,
            timestamp: new Date(),
            country: randomResponse.country,
            isOwn: false
          }]);
        }, 2000);
      }, 1000);
    }
  };

  const toggleTranslation = (messageId) => {
    setShowTranslation(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const getCountryFlag = (country) => {
    const flags = {
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Egypt': '🇪🇬'
    };
    return flags[country] || '🌍';
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-page" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: 'var(--spacing-lg)',
      height: 'calc(100vh - 140px)'
    }}>
      {/* 主聊天区域 */}
      <div className="chat-main glass-card" style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden'
      }}>
        {/* 聊天头部 */}
        <div style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            🌍 全球文化交流室
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            {onlineUsers.filter(u => u.status === 'online').length} 人在线
          </p>
        </div>

        {/* 消息列表 */}
        <div style={{
          flex: 1,
          padding: 'var(--spacing-lg)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)'
        }}>
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  display: 'flex',
                  justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                  gap: 'var(--spacing-sm)'
                }}
              >
                {!message.isOwn && (
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '2px solid var(--border-color)'
                    }}
                  />
                )}

                <div style={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-xs)'
                }}>
                  {!message.isOwn && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      <span>{getCountryFlag(message.country)}</span>
                      <span>{message.sender}</span>
                      <span>•</span>
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  )}

                  <motion.div
                    className="message-bubble"
                    style={{
                      background: message.isOwn 
                        ? 'var(--primary-gradient)' 
                        : 'var(--glass-bg)',
                      color: message.isOwn ? 'white' : 'var(--text-primary)',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-lg)',
                      border: message.isOwn ? 'none' : '1px solid var(--border-color)',
                      backdropFilter: message.isOwn ? 'none' : 'var(--glass-backdrop)',
                      position: 'relative'
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                      {message.message}
                    </p>

                    {message.translation && (
                      <motion.button
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: 'none',
                          background: '#f59e0b',
                          color: 'white',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => toggleTranslation(message.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        🌐
                      </motion.button>
                    )}

                    <AnimatePresence>
                      {showTranslation[message.id] && message.translation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{
                            marginTop: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.75rem',
                            fontStyle: 'italic',
                            color: message.isOwn ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)'
                          }}
                        >
                          💬 {message.translation}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {message.isOwn && (
                    <div style={{
                      textAlign: 'right',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {formatTime(message.timestamp)}
                    </div>
                  )}
                </div>

                {message.isOwn && (
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '2px solid var(--border-color)'
                    }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 正在输入指示器 */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}
              >
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                有人正在输入...
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* 消息输入区域 */}
        <div style={{
          padding: 'var(--spacing-lg)',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)'
        }}>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            alignItems: 'flex-end'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入消息... (支持自动翻译)"
              className="input"
              style={{
                flex: 1,
                resize: 'none',
                minHeight: '40px'
              }}
            />
            <motion.button
              className="btn btn-primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                minWidth: '80px',
                opacity: newMessage.trim() ? 1 : 0.5
              }}
            >
              发送 📤
            </motion.button>
          </div>
        </div>
      </div>

      {/* 在线用户侧边栏 */}
      <div className="online-users glass-card">
        <h3 style={{
          margin: '0 0 var(--spacing-lg) 0',
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          👥 在线用户
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)'
        }}>
          {onlineUsers.map((user, index) => (
            <motion.div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)'
              }}
              whileHover={{ 
                background: 'var(--glass-bg)',
                x: 4
              }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid var(--border-color)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: user.status === 'online' ? '#10b981' : '#f59e0b',
                  border: '2px solid var(--bg-primary)'
                }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  {user.name}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <span>{getCountryFlag(user.country)}</span>
                  <span>{user.country}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 输入指示器样式 */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
        }
        
        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;

