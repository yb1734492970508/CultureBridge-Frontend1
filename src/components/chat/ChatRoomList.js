import React from 'react';

const ChatRoomList = () => {
  const chatRooms = [
    {
      id: 1,
      name: '中英文化交流',
      lastMessage: '大家好！有人想练习中文吗？',
      time: '2分钟前',
      participants: 24,
      language: '🇨🇳🇺🇸'
    },
    {
      id: 2,
      name: '日语学习小组',
      lastMessage: 'こんにちは！今日はどうですか？',
      time: '5分钟前',
      participants: 18,
      language: '🇯🇵'
    },
    {
      id: 3,
      name: '西班牙语角',
      lastMessage: '¡Hola! ¿Alguien quiere practicar?',
      time: '10分钟前',
      participants: 31,
      language: '🇪🇸'
    },
    {
      id: 4,
      name: '法语沙龙',
      lastMessage: 'Bonjour tout le monde!',
      time: '15分钟前',
      participants: 12,
      language: '🇫🇷'
    }
  ];

  return (
    <div className="cultural-feed">
      <div className="feed-header">
        <h1 className="feed-title">聊天室</h1>
        <p className="feed-subtitle">加入全球文化交流对话</p>
      </div>

      {chatRooms.map((room) => (
        <div key={room.id} className="cultural-post" style={{ cursor: 'pointer' }}>
          <div className="post-header">
            <div className="user-avatar" style={{ background: '#10B981' }}>
              {room.language}
            </div>
            <div className="user-info" style={{ flex: 1 }}>
              <h4>{room.name}</h4>
              <p>{room.lastMessage}</p>
            </div>
            <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ fontSize: '0.8rem' }}>{room.time}</div>
              <div style={{ fontSize: '0.8rem' }}>👥 {room.participants}</div>
            </div>
          </div>
        </div>
      ))}

      <button 
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--secondary-orange)',
          border: 'none',
          color: 'white',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50
        }}
      >
        ➕
      </button>
    </div>
  );
};

export default ChatRoomList;

