import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler, useAsyncError } from '../../utils/errorHandler';
import './ChatRoomList.css';

function ChatRoomList() {
  const { user, isAuthenticated } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const { error, loading, executeAsync, clearError } = useAsyncError();

  useEffect(() => {
    if (isAuthenticated) {
      fetchChatRooms();

      // Listen for real-time updates
      socketService.on('chat:room_updated', handleRoomUpdate);
      socketService.on('chat:user_joined', handleUserJoined);
      socketService.on('chat:user_left', handleUserLeft);

      return () => {
        socketService.off('chat:room_updated', handleRoomUpdate);
        socketService.off('chat:user_joined', handleUserJoined);
        socketService.off('chat:user_left', handleUserLeft);
      };
    }
  }, [isAuthenticated]);

  const fetchChatRooms = async () => {
    await executeAsync(async () => {
      const response = await chatAPI.getRooms();
      setChatRooms(response.rooms);
    });
  };

  const handleRoomUpdate = (updatedRoom) => {
    setChatRooms(prevRooms =>
      prevRooms.map(room => (room._id === updatedRoom._id ? updatedRoom : room))
    );
  };

  const handleUserJoined = ({ roomId, userId, username }) => {
    setChatRooms(prevRooms =>
      prevRooms.map(room =>
        room._id === roomId
          ? { ...room, participants: [...room.participants, { _id: userId, username }] }
          : room
      )
    );
  };

  const handleUserLeft = ({ roomId, userId }) => {
    setChatRooms(prevRooms =>
      prevRooms.map(room =>
        room._id === roomId
          ? { ...room, participants: room.participants.filter(p => p._id !== userId) }
          : room
      )
    );
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    await executeAsync(async () => {
      const response = await chatAPI.createRoom({ name: newRoomName });
      setChatRooms(prevRooms => [...prevRooms, response.room]);
      setNewRoomName('');
    });
  };

  if (loading) return <div className="loading">加载聊天室...</div>;
  if (error) return <div className="error-message">错误: {error.message}</div>;
  if (!isAuthenticated) return <div className="not-authenticated">请登录以查看聊天室。</div>;

  return (
    <div className="chat-room-list-container">
      <h2>聊天室列表</h2>

      <form onSubmit={handleCreateRoom} className="create-room-form">
        <input
          type="text"
          placeholder="创建新聊天室..."
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button type="submit">创建</button>
      </form>

      <ul className="room-list">
        {chatRooms.length === 0 ? (
          <li className="no-rooms">暂无聊天室，快来创建一个吧！</li>
        ) : (
          chatRooms.map((room) => (
            <li key={room._id} className="room-item">
              <Link to={`/chat/${room._id}`}>
                <h3>{room.name}</h3>
                <p>在线人数: {room.participants.length}</p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ChatRoomList;


