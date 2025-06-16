import React, { useState, useEffect, useCallback } from 'react';
import { useMessaging } from '../../hooks/useMessaging';
import MessageThread from './MessageThread';
import ContactList from './ContactList';
import MessageComposer from './MessageComposer';
import './MessagingSystem.css';

/**
 * 消息系统组件
 * 提供完整的即时通讯功能
 */
const MessagingSystem = ({
  currentUser,
  className = ""
}) => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    conversations,
    messages,
    onlineUsers,
    loading,
    error,
    sendMessage,
    createConversation,
    markAsRead,
    deleteConversation,
    blockUser,
    unblockUser,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useMessaging(currentUser?.address);

  // 初始化消息系统
  useEffect(() => {
    if (currentUser?.address) {
      subscribeToMessages();
      
      return () => {
        unsubscribeFromMessages();
      };
    }
  }, [currentUser?.address, subscribeToMessages, unsubscribeFromMessages]);

  // 处理发送消息
  const handleSendMessage = useCallback(async (conversationId, content, type = 'text', attachments = []) => {
    try {
      await sendMessage(conversationId, {
        content,
        type,
        attachments,
        sender: currentUser.address,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('发送消息失败:', err);
    }
  }, [sendMessage, currentUser?.address]);

  // 处理创建新对话
  const handleCreateConversation = useCallback(async (participants, initialMessage) => {
    try {
      const conversation = await createConversation({
        participants: [currentUser.address, ...participants],
        type: participants.length > 1 ? 'group' : 'direct',
        createdBy: currentUser.address
      });

      if (initialMessage) {
        await handleSendMessage(conversation.id, initialMessage);
      }

      setActiveConversation(conversation.id);
      setShowNewMessage(false);
    } catch (err) {
      console.error('创建对话失败:', err);
    }
  }, [createConversation, currentUser?.address, handleSendMessage]);

  // 处理标记已读
  const handleMarkAsRead = useCallback(async (conversationId) => {
    try {
      await markAsRead(conversationId);
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  }, [markAsRead]);

  // 筛选对话
  const getFilteredConversations = () => {
    if (!searchQuery.trim()) return conversations;

    return conversations.filter(conversation => {
      const otherParticipants = conversation.participants.filter(p => p.address !== currentUser?.address);
      return otherParticipants.some(participant => 
        participant.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  // 获取当前对话的消息
  const getCurrentMessages = () => {
    if (!activeConversation) return [];
    return messages[activeConversation] || [];
  };

  // 获取当前对话信息
  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation);
  };

  // 渲染侧边栏
  const renderSidebar = () => (
    <div className="messaging-sidebar">
      {/* 搜索栏 */}
      <div className="search-section">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
        <button
          className="new-message-button"
          onClick={() => setShowNewMessage(true)}
        >
          ✏️ 新消息
        </button>
      </div>

      {/* 对话列表 */}
      <ContactList
        conversations={getFilteredConversations()}
        activeConversation={activeConversation}
        currentUser={currentUser}
        onlineUsers={onlineUsers}
        onSelectConversation={setActiveConversation}
        onDeleteConversation={deleteConversation}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );

  // 渲染主要内容区域
  const renderMainContent = () => {
    if (!activeConversation) {
      return (
        <div className="no-conversation">
          <div className="no-conversation-icon">💬</div>
          <h3>选择一个对话开始聊天</h3>
          <p>从左侧选择一个对话，或者创建新的对话</p>
          <button
            className="start-conversation-button"
            onClick={() => setShowNewMessage(true)}
          >
            开始新对话
          </button>
        </div>
      );
    }

    const conversation = getCurrentConversation();
    const conversationMessages = getCurrentMessages();

    return (
      <div className="conversation-area">
        {/* 对话头部 */}
        <div className="conversation-header">
          <div className="conversation-info">
            <div className="conversation-avatar">
              {conversation?.type === 'group' ? (
                <div className="group-avatar">👥</div>
              ) : (
                <img 
                  src={conversation?.participants.find(p => p.address !== currentUser?.address)?.avatar || '/default-avatar.png'}
                  alt="Avatar"
                  className="avatar-image"
                />
              )}
            </div>
            <div className="conversation-details">
              <div className="conversation-name">
                {conversation?.type === 'group' 
                  ? conversation.name || '群聊'
                  : conversation?.participants.find(p => p.address !== currentUser?.address)?.displayName || '未知用户'
                }
              </div>
              <div className="conversation-status">
                {conversation?.type === 'group' 
                  ? `${conversation.participants.length} 位成员`
                  : onlineUsers.includes(conversation?.participants.find(p => p.address !== currentUser?.address)?.address)
                    ? '在线'
                    : '离线'
                }
              </div>
            </div>
          </div>

          <div className="conversation-actions">
            <button className="action-button" title="语音通话">📞</button>
            <button className="action-button" title="视频通话">📹</button>
            <button className="action-button" title="更多选项">⋯</button>
          </div>
        </div>

        {/* 消息线程 */}
        <MessageThread
          messages={conversationMessages}
          currentUser={currentUser}
          conversation={conversation}
          onSendMessage={(content, type, attachments) => 
            handleSendMessage(activeConversation, content, type, attachments)
          }
        />
      </div>
    );
  };

  // 渲染加载状态
  if (loading && conversations.length === 0) {
    return (
      <div className="messaging-loading">
        <div className="loading-spinner" />
        <p>正在加载消息...</p>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="messaging-error">
        <div className="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={`messaging-system ${className}`}>
      {/* 侧边栏 */}
      {renderSidebar()}

      {/* 主要内容 */}
      {renderMainContent()}

      {/* 新消息模态框 */}
      {showNewMessage && (
        <MessageComposer
          currentUser={currentUser}
          onCreateConversation={handleCreateConversation}
          onClose={() => setShowNewMessage(false)}
        />
      )}
    </div>
  );
};

export default MessagingSystem;

