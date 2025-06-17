import React, { useState, useEffect, useRef } from 'react';
import { voiceAPI } from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler, useAsyncError } from '../../utils/errorHandler';
import { Mic, Volume2, Languages, History, Trash2 } from "lucide-react";
import './VoiceTranslator.css';

function VoiceTranslator() {
  const { isAuthenticated } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto'); // 'auto' for auto-detection
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [translationHistory, setTranslationHistory] = useState([]);
  const { error, loading, executeAsync, clearError } = useAsyncError();
  const audioRef = useRef(null);

  // Mock languages for initial display if API not ready
  const mockLanguages = [
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchSupportedLanguages();
      fetchTranslationHistory();

      socketService.on('voice:translation_complete', handleTranslationComplete);
      socketService.on('voice:translation_error', handleTranslationError);
      socketService.on('voice:recognition_progress', handleRecognitionProgress);

      return () => {
        socketService.off('voice:translation_complete', handleTranslationComplete);
        socketService.off('voice:translation_error', handleTranslationError);
        socketService.off('voice:recognition_progress', handleRecognitionProgress);
      };
    }
  }, [isAuthenticated]);

  const fetchSupportedLanguages = async () => {
    await executeAsync(async () => {
      try {
        const response = await voiceAPI.getSupportedLanguages();
        setSupportedLanguages(Object.values(response.data.languages));
      } catch (err) {
        console.error("Failed to fetch supported languages:", err);
        // Fallback to mock languages if API fails
        setSupportedLanguages(mockLanguages);
      }
    });
  };

  const fetchTranslationHistory = async () => {
    await executeAsync(async () => {
      try {
        const response = await voiceAPI.getTranslationHistory();
        setTranslationHistory(response.data.data);
      } catch (err) {
        console.error("Failed to fetch translation history:", err);
        setTranslationHistory([]); // Clear history on error
      }
    });
  };

  const handleTranslationComplete = (data) => {
    setTranslatedText(data.translatedText);
    fetchTranslationHistory(); // Refresh history
  };

  const handleTranslationError = (data) => {
    errorHandler.handleError(new Error(`翻译错误: ${data.error}`));
    setTranslatedText('翻译失败，请重试。');
  };

  const handleRecognitionProgress = (data) => {
    // Display real-time recognition progress if needed
    console.log('Recognition progress:', data.transcript);
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
        formData.append('sourceLanguage', sourceLanguage === 'auto' ? '' : sourceLanguage); // Send empty string for auto-detect
        formData.append('targetLanguage', targetLanguage);

        await executeAsync(async () => {
          const response = await voiceAPI.translateVoice(formData);
          console.log('Voice translation initiated:', response);
          // Translated text will come via socket 'voice:translation_complete'
        });
      };
      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
      setTranslatedText('正在录音和识别...');
    } catch (err) {
      errorHandler.handleError(new Error('无法访问麦克风: ' + err.message));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  const getLanguageName = (code) => {
    const lang = supportedLanguages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  const playAudio = (audioUrl) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  const deleteTranslation = async (id) => {
    await executeAsync(async () => {
      try {
        await voiceAPI.deleteTranslation(id);
        fetchTranslationHistory();
      } catch (err) {
        console.error("Failed to delete translation:", err);
      }
    });
  };

  return (
    <div className="cultural-feed">
      <div className="feed-header">
        <h1 className="feed-title">语音翻译</h1>
        <p className="feed-subtitle">实时语音翻译，无障碍沟通</p>
      </div>

      {/* Language Selection */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--border-radius)',
              padding: '0.75rem',
              color: 'white',
              fontSize: '1rem'
            }}
          >
            <option value="auto">自动检测</option>
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code} style={{ background: '#1E3A8A' }}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={swapLanguages}
            style={{
              background: 'var(--secondary-orange)',
              border: 'none',
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            🔄
          </button>

          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--border-radius)',
              padding: '0.75rem',
              color: 'white',
              fontSize: '1rem'
            }}
          >
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code} style={{ background: '#1E3A8A' }}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recording Interface */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '2rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: isRecording ? 'var(--accent-green)' : 'var(--secondary-orange)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          cursor: 'pointer',
          fontSize: '3rem',
          transition: 'var(--transition)',
          animation: isRecording ? 'pulse 1.5s infinite' : 'none'
        }}
        onClick={toggleRecording}>
          <Mic size={48} />
        </div>

        <h3 style={{ marginBottom: '0.5rem' }}>
          {isRecording ? '正在录音...' : '点击开始录音'}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          {isRecording ? '说话时会自动翻译' : '按住麦克风按钮开始语音翻译'}
        </p>

        {translatedText && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--accent-green)'
          }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              识别结果: "{translatedText}"
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-green)' }}>
              翻译结果: "{translatedText}"
            </div>
          </div>
        )}
      </div>

      {/* Translation History */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          翻译历史
        </h2>
        
        {translationHistory.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>暂无翻译历史</p>
        ) : (
          translationHistory.map((item) => (
            <div key={item._id} style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 'var(--border-radius)',
              padding: '1rem',
              marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  {getLanguageName(item.sourceLanguage)} → {getLanguageName(item.targetLanguage)}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  📢 {item.originalText}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent-green)' }}>
                  🔄 {item.translatedText}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {item.audioInfo && item.audioInfo.outputAudioUrl && (
                  <button onClick={() => playAudio(item.audioInfo.outputAudioUrl)} style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 'var(--border-radius)',
                    padding: '0.25rem 0.5rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}>
                    <Volume2 size={16} /> 播放
                  </button>
                )}
                <button onClick={() => copyToClipboard(item.translatedText)} style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 'var(--border-radius)',
                  padding: '0.25rem 0.5rem',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}>
                  📋 复制
                </button>
                <button onClick={() => deleteTranslation(item._id)} style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 'var(--border-radius)',
                  padding: '0.25rem 0.5rem',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}>
                  <Trash2 size={16} /> 删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <audio ref={audioRef} />
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VoiceTranslator;


