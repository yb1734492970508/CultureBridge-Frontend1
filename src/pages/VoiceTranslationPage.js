import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import Button from '../components/ui/Button';
import { Input, SearchInput } from '../components/ui/Input';
import LoadingSpinner, { ButtonLoader } from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import './VoiceTranslationPage.css';

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '中文(简体)', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th-TH', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi-VN', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl-NL', name: 'Nederlands', flag: '🇳🇱' }
];

// 录音状态
const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

// 语音翻译页面组件
const VoiceTranslationPage = () => {
  const { theme, isDarkMode } = useTheme();
  
  // 状态管理
  const [sourceLanguage, setSourceLanguage] = useState('zh-CN');
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  const [recordingState, setRecordingState] = useState(RECORDING_STATES.IDLE);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [translationHistory, setTranslationHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioLevelTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // 初始化音频上下文
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 过滤翻译历史
  useEffect(() => {
    if (searchQuery) {
      const filtered = translationHistory.filter(item =>
        item.transcription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(translationHistory);
    }
  }, [searchQuery, translationHistory]);

  // 获取麦克风权限
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      audioStreamRef.current = stream;
      
      // 连接音频分析器
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }
      
      return stream;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      throw new Error('无法访问麦克风，请检查权限设置');
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      setRecordingState(RECORDING_STATES.RECORDING);
      setRecordingTime(0);
      
      const stream = await requestMicrophonePermission();
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        processAudio(blob);
      };
      
      mediaRecorderRef.current.start();
      
      // 开始录音计时
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // 开始音频级别监控
      startAudioLevelMonitoring();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingState(RECORDING_STATES.ERROR);
      alert(error.message);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === RECORDING_STATES.RECORDING) {
      mediaRecorderRef.current.stop();
      setRecordingState(RECORDING_STATES.PROCESSING);
      
      // 停止计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // 停止音频级别监控
      stopAudioLevelMonitoring();
      
      // 停止音频流
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // 音频级别监控
  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255); // 归一化到0-1
    };
    
    audioLevelTimerRef.current = setInterval(updateAudioLevel, 100);
  };

  const stopAudioLevelMonitoring = () => {
    if (audioLevelTimerRef.current) {
      clearInterval(audioLevelTimerRef.current);
      setAudioLevel(0);
    }
  };

  // 处理音频
  const processAudio = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('sourceLanguage', sourceLanguage);
      formData.append('targetLanguage', targetLanguage);
      
      const response = await fetch('/api/voice/translate', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('翻译请求失败');
      }
      
      const result = await response.json();
      
      setTranscription(result.transcription);
      setTranslation(result.translation);
      setAudioUrl(result.audioUrl);
      setRecordingState(RECORDING_STATES.COMPLETED);
      
      // 添加到历史记录
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sourceLanguage,
        targetLanguage,
        transcription: result.transcription,
        translation: result.translation,
        audioUrl: result.audioUrl,
        originalAudioBlob: blob
      };
      
      setTranslationHistory(prev => [historyItem, ...prev]);
      
    } catch (error) {
      console.error('Failed to process audio:', error);
      setRecordingState(RECORDING_STATES.ERROR);
      alert('音频处理失败，请重试');
    }
  };

  // 播放音频
  const playAudio = async (audioUrl, id) => {
    try {
      if (isPlaying && playingId === id) {
        // 停止播放
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setPlayingId(null);
        return;
      }
      
      setIsPlaying(true);
      setPlayingId(id);
      
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
        setPlayingId(null);
      };
      
      await audioPlayerRef.current.play();
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
      setPlayingId(null);
      alert('音频播放失败');
    }
  };

  // 交换语言
  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  // 清除结果
  const clearResults = () => {
    setTranscription('');
    setTranslation('');
    setAudioUrl('');
    setAudioBlob(null);
    setRecordingState(RECORDING_STATES.IDLE);
  };

  // 删除历史记录项
  const deleteHistoryItem = (id) => {
    setTranslationHistory(prev => prev.filter(item => item.id !== id));
  };

  // 清空历史记录
  const clearHistory = () => {
    if (window.confirm('确定要清空所有翻译历史吗？')) {
      setTranslationHistory([]);
      setSearchQuery('');
    }
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取语言名称
  const getLanguageName = (code) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  // 图标组件
  const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <path d="M12 19v4"/>
      <path d="M8 23h8"/>
    </svg>
  );

  const StopIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  );

  const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  );

  const PauseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  );

  const SwapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 3l4 4-4 4"/>
      <path d="M20 7H4"/>
      <path d="M8 21l-4-4 4-4"/>
      <path d="M4 17h16"/>
    </svg>
  );

  const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  );

  return (
    <ErrorBoundary>
      <div className="voice-translation-page">
        <div className="voice-translation-container">
          {/* 页面标题 */}
          <div className="voice-translation-header">
            <h1 className="voice-translation-title">
              🎤 智能语音翻译
            </h1>
            <p className="voice-translation-subtitle">
              支持16种语言的实时语音识别和翻译，让沟通无国界
            </p>
          </div>

          {/* 语言选择器 */}
          <div className="language-selector">
            <div className="language-select-group">
              <label className="language-label">源语言</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="language-select"
                disabled={recordingState === RECORDING_STATES.RECORDING}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={swapLanguages}
              className="language-swap-button"
              disabled={recordingState === RECORDING_STATES.RECORDING}
            >
              <SwapIcon />
            </Button>

            <div className="language-select-group">
              <label className="language-label">目标语言</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="language-select"
                disabled={recordingState === RECORDING_STATES.RECORDING}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 录音控制区 */}
          <div className="recording-control">
            <div className="recording-visualizer">
              {/* 音频级别可视化 */}
              <div className="audio-level-bars">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`audio-level-bar ${
                      audioLevel > (i / 20) ? 'active' : ''
                    }`}
                    style={{
                      height: `${Math.max(4, audioLevel * 100)}px`,
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>

              {/* 录音按钮 */}
              <div className="recording-button-container">
                <Button
                  variant={recordingState === RECORDING_STATES.RECORDING ? 'error' : 'primary'}
                  size="xl"
                  onClick={recordingState === RECORDING_STATES.RECORDING ? stopRecording : startRecording}
                  disabled={recordingState === RECORDING_STATES.PROCESSING}
                  className={`recording-button ${
                    recordingState === RECORDING_STATES.RECORDING ? 'recording' : ''
                  }`}
                >
                  {recordingState === RECORDING_STATES.PROCESSING ? (
                    <ButtonLoader />
                  ) : recordingState === RECORDING_STATES.RECORDING ? (
                    <StopIcon />
                  ) : (
                    <MicIcon />
                  )}
                </Button>
              </div>

              {/* 录音状态 */}
              <div className="recording-status">
                {recordingState === RECORDING_STATES.IDLE && (
                  <span className="status-text">点击开始录音</span>
                )}
                {recordingState === RECORDING_STATES.RECORDING && (
                  <div className="recording-info">
                    <span className="status-text recording-indicator">
                      🔴 录音中...
                    </span>
                    <span className="recording-time">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                )}
                {recordingState === RECORDING_STATES.PROCESSING && (
                  <span className="status-text">处理中，请稍候...</span>
                )}
                {recordingState === RECORDING_STATES.COMPLETED && (
                  <span className="status-text success">翻译完成！</span>
                )}
                {recordingState === RECORDING_STATES.ERROR && (
                  <span className="status-text error">处理失败，请重试</span>
                )}
              </div>
            </div>
          </div>

          {/* 翻译结果 */}
          {(transcription || translation) && (
            <div className="translation-results">
              <div className="result-section">
                <div className="result-header">
                  <h3 className="result-title">
                    识别结果 ({getLanguageName(sourceLanguage)})
                  </h3>
                </div>
                <div className="result-content">
                  {transcription || '识别中...'}
                </div>
              </div>

              <div className="result-section">
                <div className="result-header">
                  <h3 className="result-title">
                    翻译结果 ({getLanguageName(targetLanguage)})
                  </h3>
                  {audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudio(audioUrl, 'current')}
                      className="play-button"
                    >
                      {isPlaying && playingId === 'current' ? <PauseIcon /> : <PlayIcon />}
                      播放
                    </Button>
                  )}
                </div>
                <div className="result-content">
                  {translation || '翻译中...'}
                </div>
              </div>

              <div className="result-actions">
                <Button
                  variant="outline"
                  onClick={clearResults}
                  className="clear-button"
                >
                  清除结果
                </Button>
              </div>
            </div>
          )}

          {/* 翻译历史 */}
          <div className="translation-history">
            <div className="history-header">
              <h2 className="history-title">翻译历史</h2>
              <div className="history-actions">
                <SearchInput
                  placeholder="搜索历史记录..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="history-search"
                />
                {translationHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="clear-history-button"
                  >
                    清空历史
                  </Button>
                )}
              </div>
            </div>

            <div className="history-list">
              {filteredHistory.length === 0 ? (
                <div className="history-empty">
                  {translationHistory.length === 0 ? (
                    <p>暂无翻译历史</p>
                  ) : (
                    <p>没有找到匹配的记录</p>
                  )}
                </div>
              ) : (
                filteredHistory.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-header">
                      <div className="history-languages">
                        {getLanguageName(item.sourceLanguage)} → {getLanguageName(item.targetLanguage)}
                      </div>
                      <div className="history-item-actions">
                        <span className="history-timestamp">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        {item.audioUrl && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => playAudio(item.audioUrl, item.id)}
                            className="history-play-button"
                          >
                            {isPlaying && playingId === item.id ? <PauseIcon /> : <PlayIcon />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => deleteHistoryItem(item.id)}
                          className="history-delete-button"
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    </div>
                    <div className="history-item-content">
                      <div className="history-transcription">
                        <strong>原文：</strong>{item.transcription}
                      </div>
                      <div className="history-translation">
                        <strong>译文：</strong>{item.translation}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default VoiceTranslationPage;

