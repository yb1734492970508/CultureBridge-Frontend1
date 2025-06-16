import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  Play, 
  Pause, 
  Square,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Zap,
  Award,
  Globe,
  MessageCircle,
  FileAudio,
  Waveform,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Star,
  TrendingUp
} from 'lucide-react';

const EnhancedVoiceTranslation = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [fromLanguage, setFromLanguage] = useState('zh-CN');
  const [toLanguage, setToLanguage] = useState('en');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [rewardEarned, setRewardEarned] = useState(null);
  const [qualityScore, setQualityScore] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // 支持的语言
  const languages = [
    { code: 'zh-CN', name: '中文（简体）', flag: '🇨🇳', voice: 'cmn-CN-Wavenet-A' },
    { code: 'zh-TW', name: '中文（繁体）', flag: '🇹🇼', voice: 'cmn-TW-Wavenet-A' },
    { code: 'en', name: 'English', flag: '🇺🇸', voice: 'en-US-Wavenet-D' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', voice: 'ja-JP-Wavenet-A' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', voice: 'ko-KR-Wavenet-A' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', voice: 'fr-FR-Wavenet-A' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', voice: 'de-DE-Wavenet-A' },
    { code: 'es', name: 'Español', flag: '🇪🇸', voice: 'es-ES-Wavenet-A' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', voice: 'it-IT-Wavenet-A' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', voice: 'pt-BR-Wavenet-A' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', voice: 'ru-RU-Wavenet-A' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', voice: 'ar-XA-Wavenet-A' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', voice: 'hi-IN-Wavenet-A' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭', voice: 'th-TH-Wavenet-A' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', voice: 'vi-VN-Wavenet-A' }
  ];

  // 初始化历史记录
  useEffect(() => {
    const mockHistory = [
      {
        id: 1,
        originalText: '你好，很高兴认识你！',
        translatedText: 'Hello, nice to meet you!',
        fromLang: 'zh-CN',
        toLang: 'en',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        qualityScore: 0.95,
        reward: 1.0
      },
      {
        id: 2,
        originalText: 'How are you today?',
        translatedText: '你今天怎么样？',
        fromLang: 'en',
        toLang: 'zh-CN',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        qualityScore: 0.88,
        reward: 0.8
      }
    ];
    setHistory(mockHistory);
  }, []);

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // 设置音频分析
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // 开始音频级别监控
      monitorAudioLevel();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
        
        // 清理音频上下文
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // 开始计时
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('录音失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // 监控音频级别
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  // 播放音频
  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // 重新录音
  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranslationResult(null);
    setRecordingTime(0);
    setAudioLevel(0);
    setQualityScore(null);
    setRewardEarned(null);
  };

  // 执行翻译
  const translateAudio = async () => {
    if (!audioBlob) return;

    setIsTranslating(true);
    setTranslationResult(null);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模拟翻译结果
      const mockResult = {
        originalText: fromLanguage === 'zh-CN' ? '你好，很高兴认识你！' : 'Hello, nice to meet you!',
        translatedText: toLanguage === 'zh-CN' ? '你好，很高兴认识你！' : 'Hello, nice to meet you!',
        confidence: 0.92,
        audioUrl: audioUrl, // 模拟翻译后的音频
        processingTime: 1.8
      };

      setTranslationResult(mockResult);
      setQualityScore(0.92);
      setRewardEarned(1.5);

      // 添加到历史记录
      const newRecord = {
        id: Date.now(),
        originalText: mockResult.originalText,
        translatedText: mockResult.translatedText,
        fromLang: fromLanguage,
        toLang: toLanguage,
        timestamp: new Date(),
        qualityScore: mockResult.confidence,
        reward: 1.5
      };
      
      setHistory(prev => [newRecord, ...prev]);

    } catch (error) {
      console.error('翻译失败:', error);
      alert('翻译失败，请重试');
    } finally {
      setIsTranslating(false);
    }
  };

  // 文件上传
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
    } else {
      alert('请选择音频文件');
    }
  };

  // 下载音频
  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `translation_${Date.now()}.webm`;
      a.click();
    }
  };

  // 交换语言
  const swapLanguages = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取语言信息
  const getLanguageInfo = (code) => {
    return languages.find(lang => lang.code === code) || languages[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">语音翻译</h1>
          <p className="text-gray-600">AI驱动的实时语音翻译，支持多种语言</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主翻译区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 语言选择 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">选择语言</h2>
              <div className="flex items-center gap-4">
                {/* 源语言 */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">从</label>
                  <select
                    value={fromLanguage}
                    onChange={(e) => setFromLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 交换按钮 */}
                <button
                  onClick={swapLanguages}
                  className="mt-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="交换语言"
                >
                  <RotateCcw size={20} className="text-gray-500" />
                </button>

                {/* 目标语言 */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">到</label>
                  <select
                    value={toLanguage}
                    onChange={(e) => setToLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 录音区域 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">录音翻译</h2>
              
              <div className="text-center">
                {/* 录音按钮 */}
                <div className="relative inline-block mb-6">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 scale-110' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white shadow-lg`}
                  >
                    {isRecording ? <Square size={32} /> : <Mic size={32} />}
                  </button>
                  
                  {/* 音频级别指示器 */}
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                  )}
                </div>

                {/* 录音状态 */}
                <div className="mb-4">
                  {isRecording ? (
                    <div className="text-red-600">
                      <div className="text-lg font-semibold">正在录音...</div>
                      <div className="text-sm">{formatTime(recordingTime)}</div>
                      <div className="mt-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
                          <div 
                            className="h-full bg-red-500 rounded-full transition-all duration-100"
                            style={{ width: `${audioLevel * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : audioBlob ? (
                    <div className="text-green-600">
                      <div className="text-lg font-semibold">录音完成</div>
                      <div className="text-sm">时长: {formatTime(recordingTime)}</div>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <div className="text-lg font-semibold">点击开始录音</div>
                      <div className="text-sm">支持最长60秒录音</div>
                    </div>
                  )}
                </div>

                {/* 音频控制 */}
                {audioBlob && (
                  <div className="flex justify-center gap-3 mb-4">
                    <button
                      onClick={playAudio}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      播放
                    </button>
                    <button
                      onClick={resetRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <RotateCcw size={16} />
                      重录
                    </button>
                    <button
                      onClick={downloadAudio}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download size={16} />
                      下载
                    </button>
                  </div>
                )}

                {/* 翻译按钮 */}
                {audioBlob && !isTranslating && (
                  <button
                    onClick={translateAudio}
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    开始翻译
                  </button>
                )}

                {/* 翻译中状态 */}
                {isTranslating && (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Loader className="animate-spin" size={20} />
                    <span>正在翻译...</span>
                  </div>
                )}

                {/* 隐藏的音频元素 */}
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    style={{ display: 'none' }}
                  />
                )}
              </div>
            </div>

            {/* 文件上传 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">上传音频文件</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileAudio className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-gray-600 mb-4">
                  <p className="text-lg font-medium">拖拽音频文件到这里</p>
                  <p className="text-sm">或点击选择文件</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  选择文件
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  支持 MP3, WAV, M4A, OGG 等格式，最大 10MB
                </p>
              </div>
            </div>

            {/* 翻译结果 */}
            {translationResult && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">翻译结果</h2>
                
                <div className="space-y-4">
                  {/* 原文 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">原文</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {getLanguageInfo(fromLanguage).flag} {getLanguageInfo(fromLanguage).name}
                      </span>
                    </div>
                    <p className="text-gray-900">{translationResult.originalText}</p>
                  </div>

                  {/* 译文 */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">译文</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {getLanguageInfo(toLanguage).flag} {getLanguageInfo(toLanguage).name}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{translationResult.translatedText}</p>
                  </div>

                  {/* 质量评分和奖励 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-500" size={16} />
                        <span className="text-sm text-gray-600">质量评分:</span>
                        <span className="font-semibold text-gray-900">
                          {(qualityScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="text-green-500" size={16} />
                        <span className="text-sm text-gray-600">获得奖励:</span>
                        <span className="font-semibold text-green-600">
                          +{rewardEarned} CBT
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                        <Volume2 size={14} />
                        播放译文
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                        <Download size={14} />
                        下载
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 翻译统计 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">今日统计</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">翻译次数</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">获得奖励</span>
                  <span className="font-semibold text-green-600">15.5 CBT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">平均质量</span>
                  <span className="font-semibold text-blue-600">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">使用时长</span>
                  <span className="font-semibold text-gray-900">45分钟</span>
                </div>
              </div>
            </div>

            {/* 翻译历史 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">翻译历史</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  查看全部
                </button>
              </div>
              
              <div className="space-y-3">
                {history.slice(0, 5).map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {getLanguageInfo(record.fromLang).flag} → {getLanguageInfo(record.toLang).flag}
                      </span>
                      <span className="text-xs text-gray-500">
                        {record.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{record.originalText}</p>
                    <p className="text-sm text-gray-900 font-medium mb-2">{record.translatedText}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        质量: {(record.qualityScore * 100).toFixed(0)}%
                      </span>
                      <span className="text-green-600 font-medium">
                        +{record.reward} CBT
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <MessageCircle className="text-blue-600" size={20} />
                  <span className="text-blue-700 font-medium">加入聊天室</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Globe className="text-green-600" size={20} />
                  <span className="text-green-700 font-medium">文化交流</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <TrendingUp className="text-purple-600" size={20} />
                  <span className="text-purple-700 font-medium">学习统计</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVoiceTranslation;

