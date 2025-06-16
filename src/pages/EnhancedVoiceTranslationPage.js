import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

// 高级音频可视化组件
const AdvancedAudioVisualizer = ({ audioLevel, isRecording, className = '' }) => {
  const [waveformData, setWaveformData] = useState(Array(50).fill(0));
  
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setWaveformData(prev => {
          const newData = [...prev.slice(1)];
          newData.push(audioLevel + Math.random() * 0.3 - 0.15);
          return newData;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isRecording, audioLevel]);

  return (
    <div className={`advanced-audio-visualizer ${className}`}>
      {/* 波形图 */}
      <div className="waveform-container">
        <svg className="waveform-svg" viewBox="0 0 500 100">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-primary-300)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 50 ${waveformData.map((value, index) => 
              `L ${index * 10} ${50 - value * 40}`
            ).join(' ')}`}
            stroke="url(#waveGradient)"
            strokeWidth="2"
            fill="none"
            className={isRecording ? 'recording-wave' : ''}
          />
        </svg>
      </div>
      
      {/* 圆形音频级别指示器 */}
      <div className="circular-audio-level">
        <div className="audio-level-ring">
          <svg className="audio-level-circle" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-neutral-200)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-primary-500)"
              strokeWidth="4"
              strokeDasharray={`${audioLevel * 283} 283`}
              strokeLinecap="round"
              className="audio-level-progress"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="audio-level-text">
            {Math.round(audioLevel * 100)}%
          </div>
        </div>
      </div>
      
      {/* 频谱条 */}
      <div className="spectrum-bars">
        {Array.from({ length: 32 }, (_, i) => (
          <div
            key={i}
            className="spectrum-bar"
            style={{
              height: `${Math.max(2, (audioLevel + Math.sin(i * 0.5) * 0.3) * 60)}px`,
              animationDelay: `${i * 20}ms`,
              backgroundColor: `hsl(${200 + i * 5}, 70%, ${50 + audioLevel * 30}%)`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 翻译进度指示器组件
const TranslationProgress = ({ stage, progress }) => {
  const stages = [
    { key: 'upload', label: '上传音频', icon: '📤' },
    { key: 'transcribe', label: '语音识别', icon: '🎤' },
    { key: 'translate', label: '文本翻译', icon: '🔄' },
    { key: 'synthesize', label: '语音合成', icon: '🔊' },
    { key: 'complete', label: '完成', icon: '✅' }
  ];

  return (
    <div className="translation-progress">
      <div className="progress-header">
        <h3>处理进度</h3>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="progress-stages">
        {stages.map((stageItem, index) => (
          <div
            key={stageItem.key}
            className={`progress-stage ${
              stage === stageItem.key ? 'active' : 
              stages.findIndex(s => s.key === stage) > index ? 'completed' : ''
            }`}
          >
            <div className="stage-icon">{stageItem.icon}</div>
            <div className="stage-label">{stageItem.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 智能错误提示组件
const SmartErrorAlert = ({ error, onRetry, onDismiss }) => {
  const getErrorMessage = (error) => {
    if (error.includes('permission')) {
      return {
        title: '麦克风权限被拒绝',
        message: '请在浏览器设置中允许访问麦克风，然后重试。',
        action: '重新授权',
        icon: '🎤'
      };
    } else if (error.includes('network')) {
      return {
        title: '网络连接问题',
        message: '请检查网络连接是否正常，然后重试。',
        action: '重试',
        icon: '🌐'
      };
    } else if (error.includes('format')) {
      return {
        title: '音频格式不支持',
        message: '您的浏览器不支持当前音频格式，请尝试使用其他浏览器。',
        action: '重试',
        icon: '🎵'
      };
    } else {
      return {
        title: '翻译失败',
        message: '服务暂时不可用，请稍后重试。',
        action: '重试',
        icon: '⚠️'
      };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="smart-error-alert">
      <div className="error-content">
        <div className="error-icon">{errorInfo.icon}</div>
        <div className="error-text">
          <h4 className="error-title">{errorInfo.title}</h4>
          <p className="error-message">{errorInfo.message}</p>
        </div>
      </div>
      <div className="error-actions">
        <Button variant="primary" size="sm" onClick={onRetry}>
          {errorInfo.action}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          关闭
        </Button>
      </div>
    </div>
  );
};

// 翻译结果卡片组件
const TranslationResultCard = ({ 
  transcription, 
  translation, 
  sourceLanguage, 
  targetLanguage, 
  audioUrl, 
  onPlay, 
  isPlaying,
  onCopy,
  onShare 
}) => {
  const getLanguageName = (code) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  return (
    <div className="translation-result-card">
      <div className="result-header">
        <h3>翻译结果</h3>
        <div className="result-actions">
          <Button variant="ghost" size="sm" onClick={onCopy}>
            📋 复制
          </Button>
          <Button variant="ghost" size="sm" onClick={onShare}>
            📤 分享
          </Button>
        </div>
      </div>
      
      <div className="result-content">
        <div className="result-section">
          <div className="section-header">
            <span className="language-tag">{getLanguageName(sourceLanguage)}</span>
            <span className="section-label">原文</span>
          </div>
          <div className="result-text source-text">{transcription}</div>
        </div>
        
        <div className="result-divider">
          <div className="divider-icon">🔄</div>
        </div>
        
        <div className="result-section">
          <div className="section-header">
            <span className="language-tag">{getLanguageName(targetLanguage)}</span>
            <span className="section-label">译文</span>
          </div>
          <div className="result-text target-text">{translation}</div>
        </div>
      </div>
      
      {audioUrl && (
        <div className="result-audio">
          <Button
            variant="outline"
            size="sm"
            onClick={onPlay}
            className="audio-play-button"
          >
            {isPlaying ? '⏸️ 暂停' : '▶️ 播放译文'}
          </Button>
        </div>
      )}
    </div>
  );
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
  const [error, setError] = useState('');
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationStage, setTranslationStage] = useState('');
  
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
      throw new Error('permission denied');
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      setError('');
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
      setError(error.message);
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
      setTranslationProgress(0);
      setTranslationStage('upload');
      
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('sourceLanguage', sourceLanguage);
      formData.append('targetLanguage', targetLanguage);
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 500);
      
      setTranslationStage('transcribe');
      
      const response = await fetch('/api/voice/translate', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('network error');
      }
      
      setTranslationStage('translate');
      setTranslationProgress(70);
      
      const result = await response.json();
      
      setTranslationStage('synthesize');
      setTranslationProgress(90);
      
      setTimeout(() => {
        setTranscription(result.transcription);
        setTranslation(result.translation);
        setAudioUrl(result.audioUrl);
        setRecordingState(RECORDING_STATES.COMPLETED);
        setTranslationStage('complete');
        setTranslationProgress(100);
        
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
      }, 1000);
      
    } catch (error) {
      console.error('Failed to process audio:', error);
      setRecordingState(RECORDING_STATES.ERROR);
      setError(error.message);
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
      setError('audio playback failed');
    }
  };

  // 复制文本
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加成功提示
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  // 分享结果
  const shareResult = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CultureBridge 翻译结果',
          text: `原文: ${transcription}\n译文: ${translation}`,
          url: window.location.href
        });
      } else {
        // 降级到复制链接
        await copyToClipboard(`原文: ${transcription}\n译文: ${translation}`);
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  // 交换语言
  const swapLanguages = useCallback(() => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  }, [sourceLanguage, targetLanguage]);

  // 清除结果
  const clearResults = () => {
    setTranscription('');
    setTranslation('');
    setAudioUrl('');
    setAudioBlob(null);
    setRecordingState(RECORDING_STATES.IDLE);
    setError('');
    setTranslationProgress(0);
    setTranslationStage('');
  };

  // 重试操作
  const retryOperation = () => {
    setError('');
    if (recordingState === RECORDING_STATES.ERROR) {
      setRecordingState(RECORDING_STATES.IDLE);
    }
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
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"/>
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

          {/* 高级音频可视化 */}
          <AdvancedAudioVisualizer
            audioLevel={audioLevel}
            isRecording={recordingState === RECORDING_STATES.RECORDING}
            className="main-visualizer"
          />

          {/* 录音控制区 */}
          <div className="recording-control">
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
                <span className="status-text error">操作失败</span>
              )}
            </div>
          </div>

          {/* 翻译进度指示器 */}
          {recordingState === RECORDING_STATES.PROCESSING && (
            <TranslationProgress
              stage={translationStage}
              progress={translationProgress}
            />
          )}

          {/* 错误提示 */}
          {error && (
            <SmartErrorAlert
              error={error}
              onRetry={retryOperation}
              onDismiss={() => setError('')}
            />
          )}

          {/* 翻译结果 */}
          {recordingState === RECORDING_STATES.COMPLETED && transcription && translation && (
            <TranslationResultCard
              transcription={transcription}
              translation={translation}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              audioUrl={audioUrl}
              onPlay={() => playAudio(audioUrl, 'current')}
              isPlaying={isPlaying && playingId === 'current'}
              onCopy={() => copyToClipboard(`原文: ${transcription}\n译文: ${translation}`)}
              onShare={shareResult}
            />
          )}

          {/* 操作按钮 */}
          {recordingState === RECORDING_STATES.COMPLETED && (
            <div className="action-buttons">
              <Button variant="outline" onClick={clearResults}>
                🔄 重新录音
              </Button>
              <Button variant="primary" onClick={startRecording}>
                🎤 继续翻译
              </Button>
            </div>
          )}

          {/* 翻译历史 */}
          {translationHistory.length > 0 && (
            <div className="translation-history">
              <div className="history-header">
                <h3>翻译历史</h3>
                <div className="history-actions">
                  <SearchInput
                    placeholder="搜索历史记录..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="history-search"
                  />
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    🗑️ 清空
                  </Button>
                </div>
              </div>

              <div className="history-list">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-content">
                      <div className="history-languages">
                        {getLanguageName(item.sourceLanguage)} → {getLanguageName(item.targetLanguage)}
                      </div>
                      <div className="history-text">
                        <div className="history-source">{item.transcription}</div>
                        <div className="history-target">{item.translation}</div>
                      </div>
                      <div className="history-timestamp">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="history-actions">
                      {item.audioUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(item.audioUrl, item.id)}
                        >
                          {isPlaying && playingId === item.id ? '⏸️' : '▶️'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${item.transcription}\n${item.translation}`)}
                      >
                        📋
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHistoryItem(item.id)}
                        className="delete-button"
                      >
                        <DeleteIcon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default VoiceTranslationPage;

