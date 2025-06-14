import React, { useState, useEffect, useRef } from 'react';
import { voiceAPI } from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler, useAsyncError } from '../../utils/errorHandler';
import { Mic, VolumeUp, Languages, History, Trash2 } from 'lucide-react';
import './VoiceTranslator.css';

function VoiceTranslator() {
  const { isAuthenticated } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto'); // 'auto' for auto-detection
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [translationHistory, setTranslationHistory] = useState([]);
  const { error, loading, executeAsync, clearError } = useAsyncError();
  const audioRef = useRef(null);

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
      const response = await voiceAPI.getSupportedLanguages();
      setSupportedLanguages(response.languages);
    });
  };

  const fetchTranslationHistory = async () => {
    await executeAsync(async () => {
      const response = await voiceAPI.getTranslationHistory();
      setTranslationHistory(response.history);
    });
  };

  const handleTranslationComplete = (data) => {
    setTranslatedText(data.translatedText);
    // Optionally, add to history immediately or refresh history
    fetchTranslationHistory();
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
        formData.append('sourceLanguage', sourceLanguage);
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
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playTranslatedAudio = async (text, lang) => {
    await executeAsync(async () => {
      const response = await voiceAPI.textToSpeech({ text, language: lang });
      if (response.audioUrl) {
        audioRef.current.src = response.audioUrl;
        audioRef.current.play();
      }
    });
  };

  const deleteTranslation = async (translationId) => {
    await executeAsync(async () => {
      await voiceAPI.deleteTranslation(translationId);
      setTranslationHistory(prev => prev.filter(item => item._id !== translationId));
    });
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error-message">错误: {error.message}</div>;
  if (!isAuthenticated) return <div className="not-authenticated">请登录以使用语音翻译功能。</div>;

  return (
    <div className="voice-translator-container">
      <h2>语音翻译</h2>

      <div className="language-selection">
        <label>
          源语言:
          <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
            <option value="auto">自动检测</option>
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </label>
        <label>
          目标语言:
          <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="recording-section">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`mic-button ${isRecording ? 'recording' : ''}`}
        >
          <Mic size={48} />
          {isRecording ? '停止录音' : '开始录音'}
        </button>
        <p className="recording-status">{isRecording ? '正在录音...' : '点击麦克风开始录音'}</p>
      </div>

      <div className="translation-output">
        <h3>翻译结果:</h3>
        <p className="translated-text">{translatedText || '等待翻译...'}</p>
        {translatedText && (
          <button onClick={() => playTranslatedAudio(translatedText, targetLanguage)} className="play-audio-btn">
            <VolumeUp size={24} /> 播放翻译
          </button>
        )}
        <audio ref={audioRef} controls className="hidden-audio"></audio>
      </div>

      <div className="translation-history">
        <h3><History size={20} /> 翻译历史</h3>
        {translationHistory.length === 0 ? (
          <p>暂无翻译历史。</p>
        ) : (
          <ul>
            {translationHistory.map(item => (
              <li key={item._id} className="history-item">
                <div className="history-content">
                  <p><strong>原文 ({item.sourceLanguage}):</strong> {item.originalText}</p>
                  <p><strong>译文 ({item.targetLanguage}):</strong> {item.translatedText}</p>
                  <span className="history-timestamp">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="history-actions">
                  {item.originalAudioUrl && (
                    <button onClick={() => playTranslatedAudio(item.originalText, item.sourceLanguage)} title="播放原文">
                      <VolumeUp size={18} />
                    </button>
                  )}
                  {item.translatedAudioUrl && (
                    <button onClick={() => playTranslatedAudio(item.translatedText, item.targetLanguage)} title="播放译文">
                      <VolumeUp size={18} />
                    </button>
                  )}
                  <button onClick={() => deleteTranslation(item._id)} title="删除记录">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default VoiceTranslator;


