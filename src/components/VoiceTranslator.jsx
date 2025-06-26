/**
 * 语音翻译组件
 * 支持实时语音识别、翻译和语音合成
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  RotateCcw,
  Copy,
  Download,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

const VoiceTranslator = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [sourceLanguage, setSourceLanguage] = useState('auto')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [originalText, setOriginalText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [translationHistory, setTranslationHistory] = useState([])
  const [currentMode, setCurrentMode] = useState('voice') // voice, text, conversation

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingTimerRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)

  // 支持的语言
  const languages = [
    { code: 'auto', name: 'Auto Detect', flag: '🌐', voice: false },
    { code: 'en', name: 'English', flag: '🇺🇸', voice: true },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', voice: true },
    { code: 'fr', name: 'French', flag: '🇫🇷', voice: true },
    { code: 'de', name: 'German', flag: '🇩🇪', voice: true },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', voice: true },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', voice: true },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', voice: true },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', voice: true },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', voice: true },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', voice: true },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', voice: true },
    { code: 'it', name: 'Italian', flag: '🇮🇹', voice: true },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', voice: true },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', voice: true }
  ]

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      // 设置音频分析
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      // 开始录音
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(100) // 收集数据每100ms
      setIsRecording(true)
      setRecordingTime(0)
      
      // 开始计时
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      // 开始音频级别监控
      monitorAudioLevel()

    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Microphone access denied or not available')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      setAudioLevel(0)
    }
  }

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateLevel = () => {
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      setAudioLevel(Math.min(100, (average / 255) * 100))
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevel)
      }
    }
    
    updateLevel()
  }

  const processAudio = async (audioBlob) => {
    setIsTranslating(true)
    
    try {
      // 模拟语音识别
      const mockTranscriptions = [
        "Hello, how are you today?",
        "I would like to order some food please.",
        "What time is it now?",
        "Can you help me find the nearest hospital?",
        "Thank you very much for your help.",
        "Where is the train station?",
        "I don't understand, can you repeat that?",
        "Good morning, nice to meet you."
      ]
      
      const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]
      
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setOriginalText(randomText)
      setConfidence(Math.floor(Math.random() * 20) + 80) // 80-99%
      
      // 自动翻译
      if (targetLanguage !== 'auto') {
        await translateText(randomText)
      }
      
    } catch (error) {
      console.error('Speech recognition failed:', error)
      setOriginalText('Speech recognition failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const translateText = async (text = originalText) => {
    if (!text.trim()) return
    
    setIsTranslating(true)
    
    try {
      // 模拟翻译API
      const mockTranslations = {
        es: {
          "Hello, how are you today?": "Hola, ¿cómo estás hoy?",
          "I would like to order some food please.": "Me gustaría pedir algo de comida, por favor.",
          "What time is it now?": "¿Qué hora es ahora?",
          "Can you help me find the nearest hospital?": "¿Puedes ayudarme a encontrar el hospital más cercano?",
          "Thank you very much for your help.": "Muchas gracias por tu ayuda.",
          "Where is the train station?": "¿Dónde está la estación de tren?",
          "I don't understand, can you repeat that?": "No entiendo, ¿puedes repetir eso?",
          "Good morning, nice to meet you.": "Buenos días, mucho gusto en conocerte."
        },
        fr: {
          "Hello, how are you today?": "Bonjour, comment allez-vous aujourd'hui?",
          "I would like to order some food please.": "J'aimerais commander de la nourriture s'il vous plaît.",
          "What time is it now?": "Quelle heure est-il maintenant?",
          "Can you help me find the nearest hospital?": "Pouvez-vous m'aider à trouver l'hôpital le plus proche?",
          "Thank you very much for your help.": "Merci beaucoup pour votre aide.",
          "Where is the train station?": "Où est la gare?",
          "I don't understand, can you repeat that?": "Je ne comprends pas, pouvez-vous répéter?",
          "Good morning, nice to meet you.": "Bonjour, ravi de vous rencontrer."
        },
        ja: {
          "Hello, how are you today?": "こんにちは、今日はいかがですか？",
          "I would like to order some food please.": "食べ物を注文したいのですが。",
          "What time is it now?": "今何時ですか？",
          "Can you help me find the nearest hospital?": "最寄りの病院を見つけるのを手伝ってもらえますか？",
          "Thank you very much for your help.": "ご親切にありがとうございます。",
          "Where is the train station?": "駅はどこですか？",
          "I don't understand, can you repeat that?": "わかりません、もう一度言ってもらえますか？",
          "Good morning, nice to meet you.": "おはようございます、はじめまして。"
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const translated = mockTranslations[targetLanguage]?.[text] || `[Translated to ${targetLanguage}: ${text}]`
      setTranslatedText(translated)
      
      // 添加到历史记录
      const historyItem = {
        id: Date.now(),
        originalText: text,
        translatedText: translated,
        sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage,
        timestamp: new Date(),
        confidence
      }
      
      setTranslationHistory(prev => [historyItem, ...prev.slice(0, 9)]) // 保留最近10条
      
    } catch (error) {
      console.error('Translation failed:', error)
      setTranslatedText('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const speakText = (text, language) => {
    if (!text || !('speechSynthesis' in window)) return
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'zh' ? 'zh-CN' : language
    utterance.rate = 0.9
    utterance.pitch = 1
    
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    
    speechSynthesis.speak(utterance)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // 可以添加成功提示
    })
  }

  const swapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      const temp = sourceLanguage
      setSourceLanguage(targetLanguage)
      setTargetLanguage(temp)
      
      // 交换文本
      const tempText = originalText
      setOriginalText(translatedText)
      setTranslatedText(tempText)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🗣️ Voice Translator</h1>
        <p className="text-gray-600">Speak in any language, get instant translations</p>
      </div>

      {/* Mode Selector */}
      <Tabs value={currentMode} onValueChange={setCurrentMode} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voice">Voice Translation</TabsTrigger>
          <TabsTrigger value="text">Text Translation</TabsTrigger>
          <TabsTrigger value="conversation">Conversation Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-6">
          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="w-5 h-5 mr-2" />
                Language Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">From</label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center">
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
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
                  disabled={sourceLanguage === 'auto'}
                  className="mt-6"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">To</label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center">
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recording Interface */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                {/* Recording Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTranslating}
                    className="w-24 h-24 rounded-full"
                  >
                    {isRecording ? (
                      <Square className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </Button>
                </motion.div>

                {/* Recording Status */}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      />
                      <span className="text-red-500 font-medium">Recording</span>
                      <Badge variant="secondary">{formatTime(recordingTime)}</Badge>
                    </div>

                    {/* Audio Level Indicator */}
                    <div className="w-64 mx-auto">
                      <Progress value={audioLevel} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Audio Level</p>
                    </div>
                  </motion.div>
                )}

                {isTranslating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing audio...</span>
                  </motion.div>
                )}

                <p className="text-gray-600">
                  {isRecording 
                    ? "Speak now... Click to stop recording" 
                    : "Click the microphone to start recording"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {(originalText || translatedText) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Text */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      {languages.find(l => l.code === (sourceLanguage === 'auto' ? 'en' : sourceLanguage))?.flag}
                      <span className="ml-2">Original</span>
                    </span>
                    {confidence > 0 && (
                      <Badge variant="secondary">{confidence}% confident</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg mb-4">{originalText}</p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speakText(originalText, sourceLanguage === 'auto' ? 'en' : sourceLanguage)}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(originalText)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Translated Text */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {languages.find(l => l.code === targetLanguage)?.flag}
                    <span className="ml-2">Translation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg mb-4">{translatedText}</p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speakText(translatedText, targetLanguage)}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(translatedText)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Text Translation</CardTitle>
              <CardDescription>Type or paste text to translate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text to translate..."
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                className="min-h-32"
              />
              <Button onClick={() => translateText()} disabled={!originalText.trim() || isTranslating}>
                {isTranslating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    Translate
                  </>
                )}
              </Button>
              {translatedText && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg">{translatedText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Mode</CardTitle>
              <CardDescription>Real-time conversation with automatic language detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Conversation mode coming soon...</p>
                <p className="text-sm text-gray-400 mt-2">
                  This feature will enable real-time bidirectional translation for conversations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Translation History */}
      {translationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Translations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {translationHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span>{languages.find(l => l.code === item.sourceLanguage)?.flag}</span>
                      <span>→</span>
                      <span>{languages.find(l => l.code === item.targetLanguage)?.flag}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Original:</p>
                      <p>{item.originalText}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Translation:</p>
                      <p>{item.translatedText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default VoiceTranslator

