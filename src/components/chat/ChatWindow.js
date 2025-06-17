import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { chatAPI, voiceAPI } from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler, useAsyncError } from '../../utils/errorHandler';
import { Mic, Send, Smile, Volume2, Translate, Trash2, ChevronLeft } from 'lucide-react';
import './ChatWindow.css';

const ChatWindow = () => {
  const { roomId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const { user } = useAuth();
  const throwAsyncError = useAsyncError();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch chat room info
    const fetchRoomInfo = async () => {
      try {
        const res = await chatAPI.getChatRoomInfo(roomId);
        setRoomInfo(res.data.data);
      } catch (err) {
        throwAsyncError(errorHandler(err));
      }
    };

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const res = await chatAPI.getChatMessages(roomId);
        setMessages(res.data.data);
      } catch (err) {
        throwAsyncError(errorHandler(err));
      }
    };

    fetchRoomInfo();
    fetchMessages();

    // Socket.IO listeners
    socketService.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socketService.on('roomUpdate', (updatedRoom) => {
      if (updatedRoom._id === roomId) {
        setRoomInfo(updatedRoom);
      }
    });

    return () => {
      socketService.off('message');
      socketService.off('roomUpdate');
    };
  }, [roomId, throwAsyncError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() || audioBlob) {
      try {
        const formData = new FormData();
        formData.append('content', message);
        formData.append('contentType', audioBlob ? 'audio' : 'text');
        if (audioBlob) {
          formData.append('file', audioBlob, 'audio.webm');
        }
        formData.append('roomId', roomId);

        await chatAPI.sendMessage(roomId, formData);
        setMessage('');
        setAudioBlob(null);
      } catch (err) {
        throwAsyncError(errorHandler(err));
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      throwAsyncError(new Error('无法访问麦克风，请检查权限。'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleTranslateVoice = async (audioUrl, sourceLang, targetLang) => {
    try {
      // In a real app, you'd fetch the audio from audioUrl and send it to the backend
      // For now, we'll simulate translation.
      console.log(`Translating audio from ${sourceLang} to ${targetLang}: ${audioUrl}`);
      const res = await voiceAPI.translateVoice({ audioUrl, sourceLanguage: sourceLang, targetLanguage: targetLang });
      // You might want to update the message object with the translation or display it elsewhere
      alert(`Translated: ${res.data.data.translatedText}`);
    } catch (err) {
      throwAsyncError(errorHandler(err));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId);
      setMessages(messages.filter(msg => msg._id !== messageId));
    } catch (err) {
      throwAsyncError(errorHandler(err));
    }
  };

  return (
    <div className="chat-window-container">
      {/* Chat Header */}
      <div className="chat-header">
        <button onClick={() => window.history.back()} className="back-button">
          <ChevronLeft size={24} />
        </button>
        <div className="room-info">
          <h2>{roomInfo ? roomInfo.name : '加载中...'}</h2>
          <p>{roomInfo ? `${roomInfo.members.length} 成员` : ''}</p>
        </div>
        <div className="header-actions">
          <button className="action-button"><Volume2 size={20} /></button>
          <button className="action-button"><Mic size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg._id} className={`message-bubble ${msg.sender._id === user.id ? 'own' : ''}`}>
            <div className="message-content">
              <div className="message-sender">{msg.sender.username}</div>
              <p className="message-text">{msg.content}</p>
              {msg.contentType === 'audio' && msg.fileUrl && (
                <audio controls src={msg.fileUrl} className="message-audio"></audio>
              )}
              {msg.translatedText && (
                <p className="message-translation">{msg.translatedText}</p>
              )}
              <div className="message-meta">
                <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                {msg.sender._id === user.id && (
                  <button onClick={() => handleDeleteMessage(msg._id)} className="delete-button">
                    <Trash2 size={16} />
                  </button>
                )}
                {msg.contentType === 'audio' && (
                  <button onClick={() => handleTranslateVoice(msg.fileUrl, msg.sourceLanguage, user.profile.learningLanguages[0] || 'en-US')} className="translate-button">
                    <Translate size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入消息..."
          className="message-input"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={toggleRecording} className={`record-button ${isRecording ? 'recording' : ''}`}>
          <Mic size={24} />
        </button>
        <button onClick={handleSendMessage} className="send-button">
          <Send size={24} />
        </button>
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-icon">🎤</div>
          <p>正在录音...</p>
          <p>实时翻译中</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;


