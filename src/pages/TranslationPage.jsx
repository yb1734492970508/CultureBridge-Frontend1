/**
 * 翻译页面组件
 * 提供语音和文本翻译功能
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Share2, 
  RotateCcw,
  Languages,
  Zap,
  Globe,
  History,
  Star,
  Play,
  Pause,
  Download
} from 'lucide-react';

const TranslationPage = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('zh-CN');
  const [targetLang, setTargetLang] = useState('en-US');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [translationHistory, setTranslationHistory] = useState([
    {
      id: 1,
      source: '你好，很高兴认识你',
      target: 'Hello, nice to meet you',
      sourceLang: 'zh-CN',
      targetLang: 'en-US',
      time: '5分钟前',
      type: 'text'
    },
    {
      id: 2,
      source: 'Comment allez-vous?',
      target: '你好吗？',
      sourceLang: 'fr-FR',
      targetLang: 'zh-CN',
      time: '10分钟前',
      type: 'voice'
    }
  ]);

  const languages = [
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' }
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    
    // 模拟翻译API调用
    setTimeout(() => {
      const mockTranslations = {
        'zh-CN': {
          'en-US': 'Hello, this is a translation example.',
          'ja-JP': 'こんにちは、これは翻訳の例です。',
          'ko-KR': '안녕하세요, 이것은 번역 예시입니다.'
        },
        'en-US': {
          'zh-CN': '你好，这是一个翻译示例。',
          'ja-JP': 'こんにちは、これは翻訳の例です。',
          'ko-KR': '안녕하세요, 이것은 번역 예시입니다.'
        }
      };
      
      const result = mockTranslations[sourceLang]?.[targetLang] || '翻译结果将在这里显示...';
      setTranslatedText(result);
      
      // 添加到历史记录
      const newHistory = {
        id: Date.now(),
        source: sourceText,
        target: result,
        sourceLang,
        targetLang,
        time: '刚刚',
        type: activeTab
      };
      setTranslationHistory(prev => [newHistory, ...prev.slice(0, 9)]);
      
      setIsTranslating(false);
    }, 1500);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // 模拟语音识别
      setTimeout(() => {
        setSourceText('这是通过语音识别得到的文本');
        setIsRecording(false);
      }, 3000);
    }
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // 模拟音频播放
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // 这里可以添加提示消息
  };

  const TextTranslation = () => (
    <div className="space-y-6">
      {/* 语言选择器 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">源语言</label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={swapLanguages}
              className="mt-6"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">目标语言</label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 翻译区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {languages.find(l => l.code === sourceLang)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="输入要翻译的文本..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-32 resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                {sourceText.length}/5000
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSourceText('')}>
                  清空
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleTranslate}
                  disabled={!sourceText.trim() || isTranslating}
                >
                  {isTranslating ? (
                    <>
                      <Zap className="w-4 h-4 mr-1 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4 mr-1" />
                      翻译
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {languages.find(l => l.code === targetLang)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-32 p-3 bg-gray-50 rounded-md border">
              {translatedText || (
                <span className="text-gray-400">翻译结果将在这里显示...</span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                {translatedText.length} 字符
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handlePlayAudio}
                  disabled={!translatedText || isPlaying}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(translatedText)}
                  disabled={!translatedText}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={!translatedText}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const VoiceTranslation = () => (
    <div className="space-y-6">
      {/* 语音翻译控制 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">实时语音翻译</h2>
            <p className="text-gray-600">点击麦克风开始录音，松开自动翻译</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <Button
              size="lg"
              onClick={handleVoiceRecord}
              className={`w-24 h-24 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            {isRecording ? '正在录音...' : '点击开始录音'}
          </div>
        </CardContent>
      </Card>

      {/* 语音翻译结果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-blue-600">🎤</span>
              识别结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 rounded-lg min-h-24">
              {sourceText || (
                <span className="text-gray-400">语音识别结果将在这里显示...</span>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">
                <Play className="w-4 h-4 mr-1" />
                播放原音
              </Button>
              <Button size="sm" variant="outline">
                <Copy className="w-4 h-4 mr-1" />
                复制
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">🔊</span>
              翻译结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg min-h-24">
              {translatedText || (
                <span className="text-gray-400">翻译结果将在这里显示...</span>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={handlePlayAudio}>
                {isPlaying ? (
                  <Pause className="w-4 h-4 mr-1" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-1" />
                )}
                播放翻译
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                下载音频
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const TranslationHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">翻译历史</h3>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-1" />
          清空历史
        </Button>
      </div>
      
      {translationHistory.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.type === 'voice' ? '🎤 语音' : '📝 文本'}
                </Badge>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost">
                  <Star className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span>{languages.find(l => l.code === item.sourceLang)?.flag}</span>
                <span className="font-medium">{item.source}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>{languages.find(l => l.code === item.targetLang)?.flag}</span>
                <span className="text-gray-600">{item.target}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部横幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <Languages className="inline-block w-10 h-10 mr-3" />
            智能翻译
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            支持多种语言的文本和语音翻译，让沟通无国界
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">文本翻译</TabsTrigger>
            <TabsTrigger value="voice">语音翻译</TabsTrigger>
            <TabsTrigger value="history">翻译历史</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <TextTranslation />
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <VoiceTranslation />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <TranslationHistory />
          </TabsContent>
        </Tabs>

        {/* 功能特色 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">多语言支持</h3>
            <p className="text-sm text-gray-600">支持50+种语言的互译</p>
          </Card>
          
          <Card className="text-center p-6">
            <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">实时翻译</h3>
            <p className="text-sm text-gray-600">毫秒级响应，即时获得结果</p>
          </Card>
          
          <Card className="text-center p-6">
            <Mic className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">语音识别</h3>
            <p className="text-sm text-gray-600">高精度语音识别和合成</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TranslationPage;

