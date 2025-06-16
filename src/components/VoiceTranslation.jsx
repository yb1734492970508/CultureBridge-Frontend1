/**
 * 语音翻译组件 - Voice Translation Component
 * 支持语音识别、文本翻译、语音合成等功能
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Languages,
  ArrowRightLeft,
  Copy,
  Download,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const VoiceTranslation = ({ onEarnTokens }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('zh');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState('voice');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // 支持的语言列表
  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳', voice: 'zh-CN' },
    { code: 'en', name: 'English', flag: '🇺🇸', voice: 'en-US' },
    { code: 'es', name: 'Español', flag: '🇪🇸', voice: 'es-ES' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', voice: 'fr-FR' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', voice: 'de-DE' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', voice: 'ja-JP' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', voice: 'ko-KR' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', voice: 'pt-PT' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', voice: 'ru-RU' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', voice: 'ar-SA' }
  ];

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // 每秒收集一次数据
      setIsRecording(true);
      
      // 开始计时
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('录音失败:', error);
      setError('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const processAudioRecording = async (audioBlob) => {
    try {
      setIsTranslating(true);
      
      // 模拟语音识别API调用
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', sourceLanguage);

      // 这里应该调用实际的语音识别API
      const response = await fetch('/api/v2/voice/speech-to-text', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSourceText(result.text);
        
        // 自动翻译识别的文本
        await translateText(result.text);
        
        // 奖励用户CBT代币
        onEarnTokens && onEarnTokens(10, 'voice_recognition');
        setSuccess('语音识别成功！');
      } else {
        throw new Error('语音识别失败');
      }
    } catch (error) {
      console.error('处理录音失败:', error);
      setError('语音识别失败，请重试');
      
      // 如果API不可用，使用模拟数据
      const mockText = '这是一段模拟的语音识别结果，用于演示功能。';
      setSourceText(mockText);
      await translateText(mockText);
    } finally {
      setIsTranslating(false);
    }
  };

  const translateText = async (text = sourceText) => {
    if (!text.trim()) {
      setError('请输入要翻译的文本');
      return;
    }

    try {
      setIsTranslating(true);
      setError(null);

      // 调用翻译API
      const response = await fetch('/api/v2/voice/translate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTranslatedText(result.translatedText);
        
        // 奖励用户CBT代币
        onEarnTokens && onEarnTokens(5, 'text_translation');
        setSuccess('翻译成功！');
      } else {
        throw new Error('翻译失败');
      }
    } catch (error) {
      console.error('翻译失败:', error);
      
      // 如果API不可用，使用模拟翻译
      const mockTranslations = {
        'zh-en': 'This is a simulated translation result for demonstration purposes.',
        'en-zh': '这是用于演示目的的模拟翻译结果。',
        'zh-es': 'Este es un resultado de traducción simulado con fines de demostración.',
        'en-es': 'Este es un resultado de traducción simulado con fines de demostración.'
      };
      
      const translationKey = `${sourceLanguage}-${targetLanguage}`;
      setTranslatedText(mockTranslations[translationKey] || '模拟翻译结果');
      setSuccess('翻译完成（演示模式）');
    } finally {
      setIsTranslating(false);
    }
  };

  const synthesizeSpeech = async (text = translatedText) => {
    if (!text.trim()) {
      setError('没有可合成的文本');
      return;
    }

    try {
      setIsSynthesizing(true);
      setError(null);

      const targetLang = languages.find(lang => lang.code === targetLanguage);
      
      // 调用语音合成API
      const response = await fetch('/api/v2/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          language: targetLang?.voice || 'en-US',
          voice: 'neural'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // 奖励用户CBT代币
        onEarnTokens && onEarnTokens(8, 'speech_synthesis');
        setSuccess('语音合成成功！');
      } else {
        throw new Error('语音合成失败');
      }
    } catch (error) {
      console.error('语音合成失败:', error);
      setError('语音合成失败，请重试');
      
      // 如果API不可用，使用浏览器内置的语音合成
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = languages.find(lang => lang.code === targetLanguage);
        utterance.lang = targetLang?.voice || 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
        setSuccess('语音播放成功（浏览器模式）');
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

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

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('已复制到剪贴板');
    } catch (error) {
      setError('复制失败');
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `translation_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const clearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setAudioUrl(null);
    setError(null);
    setSuccess(null);
    setRecordingTime(0);
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
    return languages.find(lang => lang.code === code)?.flag || '🌐';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 状态提示 */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* 标签页 */}
      <div className="w-full">
        <div className="grid grid-cols-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'voice' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            语音翻译
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'text' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            文本翻译
          </button>
        </div>

        {activeTab === 'voice' && (
          <div className="mt-4 space-y-4">
            {/* 语音录制区域 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Mic className="h-5 w-5" />
                <h3 className="text-lg font-semibold">语音录制</h3>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative">
                  <button
                    className={`w-24 h-24 rounded-full transition-all ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white flex items-center justify-center`}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    disabled={isTranslating}
                  >
                    {isRecording ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </button>
                  
                  {isRecording && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                {isRecording ? '正在录音...' : '按住按钮开始录音'}
              </p>
              
              {isTranslating && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">正在识别语音...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="mt-4 space-y-4">
            {/* 文本输入区域 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Languages className="h-5 w-5" />
                <h3 className="text-lg font-semibold">文本翻译</h3>
              </div>
              
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="请输入要翻译的文本..."
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 语言选择和控制 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">源语言</p>
            </div>
            
            <button
              onClick={swapLanguages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
            
            <div className="text-center">
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">目标语言</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => translateText()}
              disabled={!sourceText.trim() || isTranslating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  翻译中...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  翻译
                </>
              )}
            </button>
            
            <button
              onClick={clearAll}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              清空
            </button>
          </div>
        </div>
      </div>

      {/* 翻译结果 */}
      {(sourceText || translatedText) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 源文本 */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getLanguageFlag(sourceLanguage)}</span>
                  <span className="font-medium">{getLanguageName(sourceLanguage)}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(sourceText)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-900">{sourceText}</p>
            </div>
          </div>

          {/* 译文 */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getLanguageFlag(targetLanguage)}</span>
                  <span className="font-medium">{getLanguageName(targetLanguage)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(translatedText)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => synthesizeSpeech()}
                    disabled={!translatedText || isSynthesizing}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    {isSynthesizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-900">{translatedText}</p>
            </div>
          </div>
        </div>
      )}

      {/* 音频播放器 */}
      {audioUrl && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={playAudio}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <span className="text-sm text-gray-600">合成语音</span>
            </div>
            
            <button
              onClick={downloadAudio}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              下载
            </button>
          </div>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="w-full mt-4"
            controls
          />
        </div>
      )}
    </div>
  );
};

export default VoiceTranslation;

