import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { chatAPI, voiceAPI } from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler, useAsyncError } from '../../utils/errorHandler';
import { Mic, Send, Smile, Volume2, Translate, Trash2 } from 'lucide-react';
import './ChatWindow.css';

function ChatWindow() {
  const { roomId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const { error, loading, executeAsync, clearError } = useAsyncError();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = useCallback(async () => {
    await executeAsync(async () => {
      const response = await chatAPI.getMessages(roomId);
      setMessages(response.messages);
      scrollToBottom();
    });
  }, [roomId, executeAsync]);

  useEffect(() => {
    if (!isAuthenticated || !roomId) return;

    // Join chat room and fetch history
    socketService.joinRoom(roomId);
    fetchChatHistory();

    // Set up socket listeners
    socketService.on('chat:message', handleNewMessage);
    socketService.on('chat:message_deleted', handleMessageDeleted);
    socketService.on('chat:message_reaction', handleMessageReaction);
    socketService.on('chat:typing', handleTyping);
    socketService.on('chat:stop_typing', handleStopTyping);
    socketService.on('voice:translation_complete', handleVoiceTranslationComplete);

    return () => {
      // Clean up socket listeners and leave room
      socketService.off('chat:message', handleNewMessage);
      socketService.off('chat:message_deleted', handleMessageDeleted);
      socketService.off('chat:message_reaction', handleMessageReaction);
      socketService.off('chat:typing', handleTyping);
      socketService.off('chat:stop_typing', handleStopTyping);
      socketService.off('voice:translation_complete', handleVoiceTranslationComplete);
      socketService.leaveRoom(roomId);
    };
  }, [isAuthenticated, roomId, fetchChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleMessageDeleted = ({ messageId }) => {
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg._id !== messageId)
    );
  };

  const handleMessageReaction = ({ messageId, reaction, userId }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId
          ? { ...msg, reactions: { ...msg.reactions, [reaction]: (msg.reactions[reaction] || 0) + 1 } }
          : msg
      )
    );
  };

  const handleTyping = ({ userId, username }) => {
    if (userId !== user._id) {
      setTypingUsers((prev) => ({ ...prev, [userId]: username }));
    }
  };

  const handleStopTyping = ({ userId }) => {
    setTypingUsers((prev) => {
      const newTypingUsers = { ...prev };
      delete newTypingUsers[userId];
      return newTypingUsers;
    });
  };

  const handleVoiceTranslationComplete = (data) => {
    // Handle the translated message, e.g., add it to chat or display separately
    console.log('Voice translation complete:', data);
    // For now, let's just add it as a regular message from the system or sender
    setMessages((prevMessages) => [
      ...prevMessages,
      { 
        _id: data.messageId || Date.now(), 
        sender: { _id: data.senderId, username: data.senderUsername || 'System' }, 
        content: `[语音翻译] ${data.translatedText}`, 
        timestamp: new Date().toISOString(),
        isTranslated: true,
        originalAudioUrl: data.audioUrl,
      },
    ]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await executeAsync(async () => {
      socketService.sendMessage(roomId, newMessage);
      setNewMessage('');
      socketService.stopTyping(roomId);
    });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value.length > 0) {
      socketService.startTyping(roomId);
    } else {
      socketService.stopTyping(roomId);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioChunks([]);
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        formData.append('sourceLanguage', 'auto'); // Auto-detect
        formData.append('targetLanguage', 'en'); // Example target language
        formData.append('roomId', roomId);

        await executeAsync(async () => {
          const response = await voiceAPI.translateVoice(formData);
          console.log('Voice translation initiated:', response);
          // The actual translated text will come via socket 'voice:translation_complete'
        });
      };
      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
    } catch (err) {
      errorHandler.handleError(new Error('无法访问麦克风: ' + err.message));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  const deleteMessage = async (messageId) => {
    await executeAsync(async () => {
      await chatAPI.deleteMessage(roomId, messageId);
      // Message will be removed via socket 'chat:message_deleted'
    });
  };

  const reactToMessage = async (messageId, reaction) => {
    await executeAsync(async () => {
      await chatAPI.reactToMessage(roomId, messageId, reaction);
      // Reaction will be updated via socket 'chat:message_reaction'
    });
  };

  if (loading) return <div className="loading">加载聊天记录...</div>;
  if (error) return <div className="error-message">错误: {error.message}</div>;
  if (!isAuthenticated) return <div className="not-authenticated">请登录以查看聊天。</div>;

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <h3>聊天室: {roomId}</h3> {/* Replace with actual room name later */}
      </div>
      <div className="messages-list">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message-item ${msg.sender._id === user._id ? 'my-message' : 'other-message'}`}
          >
            <div className="message-bubble">
              <span className="sender-name">{msg.sender.username || '未知用户'}</span>
              <p>{msg.content}</p>
              {msg.isTranslated && msg.originalAudioUrl && (
                <button onClick={() => playAudio(msg.originalAudioUrl)} className="play-audio-btn">
                  <VolumeUp size={16} /> 播放原文
                </button>
              )}
              <div className="message-meta">
                <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <div className="message-actions">
                  <button onClick={() => reactToMessage(msg._id, '👍')}><Smile size={16} /> 👍 ({msg.reactions?.['👍'] || 0})</button>
                  <button onClick={() => reactToMessage(msg._id, '❤️')}><Smile size={16} /> ❤️ ({msg.reactions?.['❤️'] || 0})</button>
                  {msg.sender._id === user._id && (
                    <button onClick={() => deleteMessage(msg._id)}><Trash2 size={16} /> 删除</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="typing-indicator">
        {Object.values(typingUsers).length > 0 && (
          <span>{Object.values(typingUsers).join(', ')} 正在输入...</span>
        )}
      </div>
      <form onSubmit={sendMessage} className="message-input-form">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`mic-button ${isRecording ? 'recording' : ''}`}
        >
          <Mic size={24} />
        </button>
        <input
          type="text"
          placeholder="输入消息..."
          value={newMessage}
          onChange={handleInputChange}
        />
        <button type="submit" className="send-button">
          <Send size={24} />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;


