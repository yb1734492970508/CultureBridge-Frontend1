import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Languages,
  Download,
  Upload,
  Zap,
  Award,
  Globe,
  Headphones,
  FileAudio,
  Settings,
  Star,
  TrendingUp
} from 'lucide-react';

const VoiceTranslation = ({ onEarnTokens }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState('zh');
  const [targetLanguages, setTargetLanguages] = useState(['en']);
  const [originalText, setOriginalText] = useState('');
  const [translations, setTranslations] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [translationHistory, setTranslationHistory] = useState([]);
  const [selectedMode, setSelectedMode] = useState('voice'); // voice, text, file
  const [textInput, setTextInput] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  
  const recordingIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 支持的语言
  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳', voice: 'zh-CN-Wavenet-A' },
    { code: 'en', name: 'English', flag: '🇺🇸', voice: 'en-US-Wavenet-D' },
    { code: 'es', name: 'Español', flag: '🇪🇸', voice: 'es-ES-Wavenet-B' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', voice: 'fr-FR-Wavenet-A' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', voice: 'de-DE-Wavenet-A' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', voice: 'ja-JP-Wavenet-A' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', voice: 'ko-KR-Wavenet-A' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', voice: 'pt-BR-Wavenet-A' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', voice: 'ru-RU-Wavenet-A' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', voice: 'ar-XA-Wavenet-A' }
  ];

  // 模拟翻译历史
  const mockHistory = [
    {
      id: 1,
      originalText: '你好，很高兴认识你！',
      sourceLanguage: 'zh',
      translations: [
        { language: 'en', text: 'Hello, nice to meet you!', confidence: 0.95 },
        { language: 'es', text: '¡Hola, mucho gusto en conocerte!', confidence: 0.92 }
      ],
      timestamp: new Date(Date.now() - 3600000),
      processingTime: 1.2,
      earned: 0.5
    },
    {
      id: 2,
      originalText: 'How are you doing today?',
      sourceLanguage: 'en',
      translations: [
        { language: 'zh', text: '你今天过得怎么样？', confidence: 0.98 },
        { language: 'fr', text: 'Comment allez-vous aujourd\'hui?', confidence: 0.94 }
      ],
      timestamp: new Date(Date.now() - 7200000),
      processingTime: 0.8,
      earned: 0.5
    }
  ];

  useEffect(() => {
    setTranslationHistory(mockHistory);
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('录音失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // 模拟语音识别和翻译过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模拟识别结果
      const mockTexts = {
        zh: '你好，欢迎使用CultureBridge语音翻译功能！',
        en: 'Hello, welcome to CultureBridge voice translation feature!',
        es: '¡Hola, bienvenido a la función de traducción de voz de CultureBridge!',
        fr: 'Bonjour, bienvenue dans la fonction de traduction vocale de CultureBridge!',
        de: 'Hallo, willkommen bei der Sprachübersetzungsfunktion von CultureBridge!',
        ja: 'こんにちは、CultureBridgeの音声翻訳機能へようこそ！',
        ko: '안녕하세요, CultureBridge 음성 번역 기능에 오신 것을 환영합니다!',
        pt: 'Olá, bem-vindo ao recurso de tradução de voz do CultureBridge!',
        ru: 'Привет, добро пожаловать в функцию голосового перевода CultureBridge!',
        ar: 'مرحبا، مرحبا بكم في ميزة الترجمة الصوتية CultureBridge!'
      };

      const recognizedText = mockTexts[sourceLanguage];
      setOriginalText(recognizedText);

      // 生成翻译结果
      const translationResults = targetLanguages.map(lang => ({
        language: lang,
        text: mockTexts[lang],
        confidence: 0.90 + Math.random() * 0.09,
        audioUrl: null // 在实际应用中这里会是合成的音频URL
      }));

      setTranslations(translationResults);
      setConfidence(0.95);
      setProcessingTime((Date.now() - startTime) / 1000);

      // 奖励用户
      onEarnTokens && onEarnTokens(0.5, 'VOICE_TRANSLATION');

      // 添加到历史记录
      const newRecord = {
        id: Date.now(),
        originalText: recognizedText,
        sourceLanguage,
        translations: translationResults,
        timestamp: new Date(),
        processingTime: (Date.now() - startTime) / 1000,
        earned: 0.5
      };
      setTranslationHistory(prev => [newRecord, ...prev]);

    } catch (error) {
      console.error('处理音频失败:', error);
      alert('翻译失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const processTextTranslation = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTexts = {
        zh: textInput.includes('hello') ? '你好' : '这是翻译结果',
        en: textInput.includes('你好') ? 'Hello' : 'This is the translation result',
        es: textInput.includes('你好') ? 'Hola' : 'Este es el resultado de la traducción',
        fr: textInput.includes('你好') ? 'Bonjour' : 'Voici le résultat de la traduction'
      };

      setOriginalText(textInput);

      const translationResults = targetLanguages.map(lang => ({
        language: lang,
        text: mockTexts[lang] || `[${lang.toUpperCase()}] ${textInput}`,
        confidence: 0.90 + Math.random() * 0.09,
        audioUrl: null
      }));

      setTranslations(translationResults);
      setConfidence(0.98);
      setProcessingTime((Date.now() - startTime) / 1000);

      onEarnTokens && onEarnTokens(0.3, 'TEXT_TRANSLATION');

    } catch (error) {
      console.error('文本翻译失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (url) => {
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  };

  const toggleTargetLanguage = (langCode) => {
    setTargetLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(code => code !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageName = (code) => {
    return languages.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code) => {
    return languages.find(lang => lang.code === code)?.flag || '🌍';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 头部标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">智能语音翻译</h1>
        <p className="text-gray-600">支持16种语言的实时语音翻译，让沟通无国界</p>
      </div>

      {/* 模式选择 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setSelectedMode('voice')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
              selectedMode === 'voice' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Mic className="h-5 w-5" />
            <span>语音翻译</span>
          </button>
          <button
            onClick={() => setSelectedMode('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
              selectedMode === 'text' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Languages className="h-5 w-5" />
            <span>文本翻译</span>
          </button>
          <button
            onClick={() => setSelectedMode('file')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
              selectedMode === 'file' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileAudio className="h-5 w-5" />
            <span>文件翻译</span>
          </button>
        </div>

        {/* 语言选择 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 源语言 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">源语言</label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* 目标语言 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">目标语言（可多选）</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {languages.filter(lang => lang.code !== sourceLanguage).map(lang => (
                <label key={lang.code} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetLanguages.includes(lang.code)}
                    onChange={() => toggleTargetLanguage(lang.code)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{lang.flag} {lang.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 翻译界面 */}
        {selectedMode === 'voice' && (
          <div className="text-center">
            {/* 录音按钮 */}
            <div className="mb-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-medium transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>
            </div>

            {/* 录音状态 */}
            {isRecording && (
              <div className="mb-4">
                <div className="text-lg font-medium text-red-600">
                  正在录音... {formatTime(recordingTime)}
                </div>
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 处理状态 */}
            {isProcessing && (
              <div className="mb-4">
                <div className="text-lg font-medium text-blue-600 mb-2">正在处理...</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMode === 'text' && (
          <div className="space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="请输入要翻译的文本..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="text-center">
              <button
                onClick={processTextTranslation}
                disabled={!textInput.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
              >
                {isProcessing ? '翻译中...' : '开始翻译'}
              </button>
            </div>
          </div>
        )}

        {selectedMode === 'file' && (
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">拖拽音频文件到此处或点击上传</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                选择文件
              </button>
              <p className="text-xs text-gray-500 mt-2">支持 MP3, WAV, M4A 格式</p>
            </div>
          </div>
        )}
      </div>

      {/* 翻译结果 */}
      {(originalText || translations.length > 0) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">翻译结果</h3>
          
          {/* 原文 */}
          {originalText && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">原文</span>
                  <span className="text-sm">{getLanguageFlag(sourceLanguage)} {getLanguageName(sourceLanguage)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {confidence > 0 && (
                    <span className="text-xs text-green-600">
                      置信度: {(confidence * 100).toFixed(1)}%
                    </span>
                  )}
                  {audioUrl && (
                    <button
                      onClick={() => playAudio(audioUrl)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-900">{originalText}</p>
            </div>
          )}

          {/* 翻译结果 */}
          {translations.length > 0 && (
            <div className="space-y-4">
              {translations.map((translation, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">翻译</span>
                      <span className="text-sm">
                        {getLanguageFlag(translation.language)} {getLanguageName(translation.language)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600">
                        置信度: {(translation.confidence * 100).toFixed(1)}%
                      </span>
                      <button
                        onClick={() => playAudio(translation.audioUrl)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        disabled={!translation.audioUrl}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-700">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-900">{translation.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* 处理统计 */}
          {processingTime > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">处理时间: {processingTime.toFixed(1)}秒</span>
                <span className="text-green-700 flex items-center space-x-1">
                  <Coins className="h-4 w-4" />
                  <span>获得 0.5 CBT</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 翻译历史 */}
      {translationHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">翻译历史</h3>
          
          <div className="space-y-4">
            {translationHistory.slice(0, 5).map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {record.timestamp.toLocaleString()}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      +{record.earned} CBT
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {record.processingTime.toFixed(1)}s
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm text-gray-600 mb-1">
                    {getLanguageFlag(record.sourceLanguage)} {getLanguageName(record.sourceLanguage)}
                  </div>
                  <p className="text-gray-900">{record.originalText}</p>
                </div>
                
                <div className="space-y-2">
                  {record.translations.map((translation, index) => (
                    <div key={index} className="text-sm">
                      <div className="text-gray-600 mb-1">
                        {getLanguageFlag(translation.language)} {getLanguageName(translation.language)}
                      </div>
                      <p className="text-gray-800">{translation.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              查看全部历史记录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTranslation;

