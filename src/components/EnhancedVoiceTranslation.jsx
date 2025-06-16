import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download,
  Upload,
  Languages,
  Loader,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Headphones
} from 'lucide-react';

const VoiceTranslationComponent = ({ onEarnTokens }) => {
  // 状态管理
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [translatedAudio, setTranslatedAudio] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('zh');
  const [toLanguage, setToLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioQuality, setAudioQuality] = useState('high');
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const translatedAudioPlayerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);
  
  // 支持的语言列表
  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];
  
  // 清理函数
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);
  
  // 开始录音
  const startRecording = async () => {
    try {
      setError('');
      setSuccess('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: audioQuality === 'high' ? 48000 : 16000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop());
        
        // 自动翻译
        if (autoTranslate) {
          await handleTranslate(audioBlob);
        }
      };
      
      mediaRecorder.start(100); // 每100ms收集一次数据
      setIsRecording(true);
      setRecordingTime(0);
      
      // 开始计时
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('录音失败:', error);
      setError('无法访问麦克风，请检查权限设置');
    }
  };
  
  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };
  
  // 播放原始音频
  const playOriginalAudio = () => {
    if (audioBlob && audioPlayerRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.volume = isMuted ? 0 : volume;
      audioPlayerRef.current.play();
      setIsPlaying(true);
      
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };
  
  // 播放翻译音频
  const playTranslatedAudio = () => {
    if (translatedAudio && translatedAudioPlayerRef.current) {
      translatedAudioPlayerRef.current.src = translatedAudio;
      translatedAudioPlayerRef.current.volume = isMuted ? 0 : volume;
      translatedAudioPlayerRef.current.play();
    }
  };
  
  // 暂停播放
  const pauseAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (translatedAudioPlayerRef.current) {
      translatedAudioPlayerRef.current.pause();
    }
    setIsPlaying(false);
  };
  
  // 处理翻译
  const handleTranslate = async (audioData = audioBlob) => {
    if (!audioData) {
      setError('请先录制音频');
      return;
    }
    
    setIsTranslating(true);
    setError('');
    
    try {
      // 将音频转换为base64
      const arrayBuffer = await audioData.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const response = await fetch('http://localhost:5000/api/translation/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          audioData: base64Audio,
          from: fromLanguage,
          to: toLanguage
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOriginalText(result.originalText);
        setTranslatedText(result.translatedText);
        setTranslatedAudio(result.translatedAudio);
        setSuccess('翻译完成！');
        
        // 奖励用户
        if (onEarnTokens) {
          onEarnTokens(1.0, 'VOICE_TRANSLATION');
        }
      } else {
        setError(result.error || '翻译失败');
      }
    } catch (error) {
      console.error('翻译失败:', error);
      setError('翻译服务暂时不可用');
    } finally {
      setIsTranslating(false);
    }
  };
  
  // 交换语言
  const swapLanguages = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
    
    // 如果有翻译结果，交换文本
    if (originalText && translatedText) {
      setOriginalText(translatedText);
      setTranslatedText(originalText);
    }
  };
  
  // 下载音频
  const downloadAudio = (audioData, filename) => {
    if (audioData) {
      const url = audioData instanceof Blob ? URL.createObjectURL(audioData) : audioData;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (audioData instanceof Blob) {
        URL.revokeObjectURL(url);
      }
    }
  };
  
  // 上传音频文件
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioBlob(file);
      setOriginalText('');
      setTranslatedText('');
      setTranslatedAudio(null);
      setSuccess('音频文件已上传');
    } else {
      setError('请选择有效的音频文件');
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
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">智能语音翻译</h2>
        <p className="text-gray-600">实时语音识别与多语言翻译</p>
      </div>
      
      {/* 语言选择 */}
      <div className="flex items-center justify-center mb-8 space-x-4">
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2">源语言</label>
          <select
            value={fromLanguage}
            onChange={(e) => setFromLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={swapLanguages}
          className="mt-6 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          title="交换语言"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2">目标语言</label>
          <select
            value={toLanguage}
            onChange={(e) => setToLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* 录音控制 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <Mic className="h-5 w-5" />
              <span>开始录音</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <MicOff className="h-5 w-5" />
              <span>停止录音</span>
            </button>
          )}
          
          {/* 文件上传 */}
          <label className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium cursor-pointer transition-colors">
            <Upload className="h-5 w-5" />
            <span>上传音频</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
        
        {/* 录音时间 */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>
      
      {/* 音频播放控制 */}
      {audioBlob && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">音频控制</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {!isPlaying ? (
                <button
                  onClick={playOriginalAudio}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>播放原音</span>
                </button>
              ) : (
                <button
                  onClick={pauseAudio}
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  <span>暂停</span>
                </button>
              )}
              
              {translatedAudio && (
                <button
                  onClick={playTranslatedAudio}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Headphones className="h-4 w-4" />
                  <span>播放翻译</span>
                </button>
              )}
            </div>
            
            {/* 音量控制 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
          
          {/* 下载按钮 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => downloadAudio(audioBlob, `original_${Date.now()}.webm`)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>下载原音</span>
            </button>
            
            {translatedAudio && (
              <button
                onClick={() => downloadAudio(translatedAudio, `translated_${Date.now()}.mp3`)}
                className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-sm"
              >
                <Download className="h-4 w-4" />
                <span>下载翻译</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* 翻译按钮 */}
      {audioBlob && !isTranslating && (
        <div className="text-center mb-6">
          <button
            onClick={() => handleTranslate()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium mx-auto transition-colors"
          >
            <Languages className="h-5 w-5" />
            <span>开始翻译</span>
          </button>
        </div>
      )}
      
      {/* 翻译进度 */}
      {isTranslating && (
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader className="h-5 w-5 animate-spin" />
            <span>正在翻译中...</span>
          </div>
        </div>
      )}
      
      {/* 翻译结果 */}
      {(originalText || translatedText) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 原文 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <span className="mr-2">{getLanguageName(fromLanguage)}</span>
              <span className="text-sm text-blue-600">(原文)</span>
            </h4>
            <p className="text-gray-800 leading-relaxed">
              {originalText || '等待语音识别...'}
            </p>
          </div>
          
          {/* 译文 */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <span className="mr-2">{getLanguageName(toLanguage)}</span>
              <span className="text-sm text-green-600">(译文)</span>
            </h4>
            <p className="text-gray-800 leading-relaxed">
              {translatedText || '等待翻译结果...'}
            </p>
          </div>
        </div>
      )}
      
      {/* 设置选项 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          设置选项
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">音频质量</label>
            <select
              value={audioQuality}
              onChange={(e) => setAudioQuality(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="high">高质量 (48kHz)</option>
              <option value="standard">标准 (16kHz)</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">自动翻译</label>
            <button
              onClick={() => setAutoTranslate(!autoTranslate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoTranslate ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoTranslate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* 消息提示 */}
      {error && (
        <div className="flex items-center space-x-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center space-x-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}
      
      {/* 隐藏的音频播放器 */}
      <audio ref={audioPlayerRef} style={{ display: 'none' }} />
      <audio ref={translatedAudioPlayerRef} style={{ display: 'none' }} />
    </div>
  );
};

export default VoiceTranslationComponent;

