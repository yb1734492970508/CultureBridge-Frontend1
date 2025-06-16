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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

      <Tabs defaultValue="voice" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="voice">语音翻译</TabsTrigger>
          <TabsTrigger value="text">文本翻译</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-4">
          {/* 语音录制区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-5 w-5" />
                <span>语音录制</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className={`w-24 h-24 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
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
                  </Button>
                  
                  {isRecording && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <Badge variant="destructive">
                        {formatTime(recordingTime)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600">
                {isRecording ? '正在录音...' : '按住按钮开始录音'}
              </p>
              
              {isTranslating && (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">正在识别语音...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          {/* 文本输入区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Languages className="h-5 w-5" />
                <span>文本翻译</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="请输入要翻译的文本..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 语言选择和控制 */}
      <Card>
        <CardContent className="pt-6">
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={swapLanguages}
                className="mx-2"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              
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
              <Button
                onClick={() => translateText()}
                disabled={!sourceText.trim() || isTranslating}
                size="sm"
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
              </Button>
              
              <Button
                variant="outline"
                onClick={clearAll}
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 翻译结果 */}
      {(sourceText || translatedText) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 源文本 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getLanguageFlag(sourceLanguage)}</span>
                  <span className="font-medium">{getLanguageName(sourceLanguage)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(sourceText)}
                  disabled={!sourceText}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">
                {sourceText || '等待输入...'}
              </p>
            </CardContent>
          </Card>

          {/* 翻译结果 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getLanguageFlag(targetLanguage)}</span>
                  <span className="font-medium">{getLanguageName(targetLanguage)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(translatedText)}
                    disabled={!translatedText}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => synthesizeSpeech()}
                    disabled={!translatedText || isSynthesizing}
                  >
                    {isSynthesizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">
                {translatedText || '等待翻译...'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 音频播放控制 */}
      {audioUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={playAudio}
                  className="flex items-center space-x-2"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{isPlaying ? '暂停' : '播放'}</span>
                </Button>
                
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
              
              <Button
                variant="outline"
                onClick={downloadAudio}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                下载音频
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceTranslation;

