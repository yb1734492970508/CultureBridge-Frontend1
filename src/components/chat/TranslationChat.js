import React, { useState, useEffect, useRef } from 'react';
import '../../styles/components/chat/TranslationChat.css';

/**
 * 创新翻译聊天组件
 * 实现实时双模式翻译（语音和文字）功能
 */
const TranslationChat = ({ 
  sourceLanguage = 'zh-CN', 
  targetLanguage = 'en-US',
  initialMessages = [],
  onSendMessage,
  manusAIEnabled = true
}) => {
  // 聊天消息状态
  const [messages, setMessages] = useState(initialMessages);
  // 输入文本状态
  const [inputText, setInputText] = useState('');
  // 实时翻译状态
  const [liveTranslation, setLiveTranslation] = useState('');
  // 语音识别状态
  const [isRecording, setIsRecording] = useState(false);
  // 语音识别结果
  const [speechResult, setSpeechResult] = useState('');
  // 显示模式：'split'(分屏), 'source'(原文), 'target'(译文), 'both'(双语)
  const [displayMode, setDisplayMode] = useState('both');
  // 翻译模式：'auto'(自动), 'manual'(手动)
  const [translationMode, setTranslationMode] = useState('auto');
  // Manus AI助手状态
  const [showManusAI, setShowManusAI] = useState(false);
  // Manus AI建议
  const [manusSuggestions, setManusSuggestions] = useState([]);
  // 文化背景信息
  const [culturalContext, setCulturalContext] = useState(null);
  
  // 引用
  const messagesEndRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  
  // 初始化语音识别
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = sourceLanguage;
      
      speechRecognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setSpeechResult(transcript);
        
        // 如果是自动翻译模式，实时翻译语音内容
        if (translationMode === 'auto') {
          translateText(transcript);
        }
      };
      
      speechRecognitionRef.current.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        setIsRecording(false);
      };
    }
    
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [sourceLanguage, translationMode]);
  
  // 滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 模拟翻译功能
  const translateText = async (text) => {
    if (!text.trim()) {
      setLiveTranslation('');
      return;
    }
    
    // 这里应该调用实际的翻译API
    // 为演示目的，使用模拟翻译
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 简单的中英文模拟翻译逻辑
      let translatedText = '';
      if (sourceLanguage.startsWith('zh') && targetLanguage.startsWith('en')) {
        // 中文到英文的简单映射
        const translations = {
          '你好': 'Hello',
          '早上好': 'Good morning',
          '晚上好': 'Good evening',
          '谢谢': 'Thank you',
          '再见': 'Goodbye',
          '我叫': 'My name is',
          '我喜欢': 'I like',
          '文化': 'culture',
          '语言': 'language',
          '学习': 'learning',
          '朋友': 'friend',
          '中国': 'China',
          '美国': 'America',
          '旅行': 'travel',
          '食物': 'food',
          '音乐': 'music',
          '电影': 'movie',
          '书籍': 'book',
          '工作': 'work',
          '学校': 'school'
        };
        
        translatedText = text;
        Object.keys(translations).forEach(key => {
          translatedText = translatedText.replace(new RegExp(key, 'g'), translations[key]);
        });
        
        // 如果没有匹配到任何词，添加模拟翻译前缀
        if (translatedText === text) {
          translatedText = '[EN] ' + text;
        }
      } else if (sourceLanguage.startsWith('en') && targetLanguage.startsWith('zh')) {
        // 英文到中文的简单映射
        const translations = {
          'Hello': '你好',
          'Good morning': '早上好',
          'Good evening': '晚上好',
          'Thank you': '谢谢',
          'Goodbye': '再见',
          'My name is': '我叫',
          'I like': '我喜欢',
          'culture': '文化',
          'language': '语言',
          'learning': '学习',
          'friend': '朋友',
          'China': '中国',
          'America': '美国',
          'travel': '旅行',
          'food': '食物',
          'music': '音乐',
          'movie': '电影',
          'book': '书籍',
          'work': '工作',
          'school': '学校'
        };
        
        translatedText = text;
        Object.keys(translations).forEach(key => {
          translatedText = translatedText.replace(new RegExp(key, 'gi'), translations[key]);
        });
        
        // 如果没有匹配到任何词，添加模拟翻译前缀
        if (translatedText === text) {
          translatedText = '[中文] ' + text;
        }
      } else {
        // 其他语言对的模拟翻译
        translatedText = `[${targetLanguage}] ${text}`;
      }
      
      setLiveTranslation(translatedText);
      
      // 如果启用了Manus AI，模拟获取文化背景和建议
      if (manusAIEnabled) {
        generateManusAISuggestions(text, translatedText);
      }
      
      return translatedText;
    } catch (error) {
      console.error('翻译错误:', error);
      return '';
    }
  };
  
  // 模拟Manus AI建议和文化背景生成
  const generateManusAISuggestions = (sourceText, translatedText) => {
    // 检测特定关键词来模拟文化背景信息
    const culturalKeywords = {
      '春节': {
        title: '春节 (Spring Festival)',
        content: '春节是中国最重要的传统节日，庆祝农历新年的开始。家人团聚、红包、年夜饭和烟花是其主要特色。',
        imageUrl: 'https://example.com/spring-festival.jpg'
      },
      'Spring Festival': {
        title: '春节 (Spring Festival)',
        content: 'Spring Festival is the most important traditional holiday in China, celebrating the beginning of the lunar new year. Family reunions, red envelopes, reunion dinner, and fireworks are its main features.',
        imageUrl: 'https://example.com/spring-festival.jpg'
      },
      '筷子': {
        title: '筷子 (Chopsticks)',
        content: '筷子是东亚地区传统的餐具，使用已有数千年历史。正确使用筷子被视为基本礼仪的一部分。',
        imageUrl: 'https://example.com/chopsticks.jpg'
      },
      'chopsticks': {
        title: '筷子 (Chopsticks)',
        content: 'Chopsticks are traditional utensils in East Asia with thousands of years of history. Proper use of chopsticks is considered part of basic etiquette.',
        imageUrl: 'https://example.com/chopsticks.jpg'
      }
    };
    
    // 检查文本中是否包含文化关键词
    let detectedContext = null;
    Object.keys(culturalKeywords).forEach(keyword => {
      if (sourceText.toLowerCase().includes(keyword.toLowerCase()) || 
          translatedText.toLowerCase().includes(keyword.toLowerCase())) {
        detectedContext = culturalKeywords[keyword];
      }
    });
    
    if (detectedContext) {
      setCulturalContext(detectedContext);
    }
    
    // 模拟Manus AI翻译建议
    const suggestions = [];
    
    // 根据特定模式生成建议
    if (sourceText.includes('你好') && translatedText.includes('Hello')) {
      suggestions.push({
        type: 'alternative',
        text: 'Hi there! (更随意的问候)'
      });
    }
    
    if (sourceText.includes('谢谢') && translatedText.includes('Thank you')) {
      suggestions.push({
        type: 'alternative',
        text: 'Thanks a lot! (更热情的感谢)'
      });
    }
    
    // 添加一些随机的语言学习建议
    const learningTips = [
      '点击任何单词查看详细解释和用法',
      'Click any word to see detailed explanation and usage',
      '尝试用完整句子回复以提高语言能力',
      'Try replying with complete sentences to improve language skills'
    ];
    
    if (Math.random() > 0.7) {
      suggestions.push({
        type: 'learning',
        text: learningTips[Math.floor(Math.random() * learningTips.length)]
      });
    }
    
    setManusSuggestions(suggestions);
  };
  
  // 开始语音识别
  const startSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.start();
      setIsRecording(true);
      setSpeechResult('');
      setLiveTranslation('');
    }
  };
  
  // 停止语音识别
  const stopSpeechRecognition = async () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsRecording(false);
      
      if (speechResult) {
        // 获取最终翻译
        const translation = await translateText(speechResult);
        
        // 添加消息
        const newMessage = {
          id: Date.now(),
          text: speechResult,
          translation: translation,
          sender: 'user',
          timestamp: new Date(),
          type: 'voice'
        };
        
        setMessages(prev => [...prev, newMessage]);
        setSpeechResult('');
        setLiveTranslation('');
        
        // 调用外部发送消息回调
        if (onSendMessage) {
          onSendMessage(newMessage);
        }
      }
    }
  };
  
  // 发送文本消息
  const sendTextMessage = async () => {
    if (!inputText.trim()) return;
    
    // 获取最终翻译
    const translation = translationMode === 'auto' 
      ? liveTranslation 
      : await translateText(inputText);
    
    // 添加消息
    const newMessage = {
      id: Date.now(),
      text: inputText,
      translation: translation,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setLiveTranslation('');
    
    // 调用外部发送消息回调
    if (onSendMessage) {
      onSendMessage(newMessage);
    }
    
    // 模拟接收回复
    simulateReply(newMessage);
  };
  
  // 模拟接收回复
  const simulateReply = (userMessage) => {
    setTimeout(() => {
      // 简单的回复逻辑
      let replyText = '';
      let replyTranslation = '';
      
      if (targetLanguage.startsWith('en')) {
        // 回复英文
        if (userMessage.text.includes('你好') || userMessage.translation.includes('Hello')) {
          replyText = 'Hello! How can I help you today?';
          replyTranslation = '你好！今天我能帮你什么忙？';
        } else if (userMessage.text.includes('谢谢') || userMessage.translation.includes('Thank you')) {
          replyText = "You're welcome! Feel free to ask if you have more questions.";
          replyTranslation = '不客气！如果你有更多问题，随时问我。';
        } else {
          replyText = "I received your message. This is a demo of the translation chat feature.";
          replyTranslation = '我收到了你的消息。这是翻译聊天功能的演示。';
        }
      } else {
        // 回复中文
        if (userMessage.text.includes('Hello') || userMessage.translation.includes('你好')) {
          replyText = '你好！今天我能帮你什么忙？';
          replyTranslation = 'Hello! How can I help you today?';
        } else if (userMessage.text.includes('Thank you') || userMessage.translation.includes('谢谢')) {
          replyText = '不客气！如果你有更多问题，随时问我。';
          replyTranslation = "You're welcome! Feel free to ask if you have more questions.";
        } else {
          replyText = '我收到了你的消息。这是翻译聊天功能的演示。';
          replyTranslation = "I received your message. This is a demo of the translation chat feature.";
        }
      }
      
      const replyMessage = {
        id: Date.now(),
        text: replyText,
        translation: replyTranslation,
        sender: 'other',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, replyMessage]);
      
      // 随机触发Manus AI助手
      if (manusAIEnabled && Math.random() > 0.5) {
        setShowManusAI(true);
        generateManusAISuggestions(replyText, replyTranslation);
      }
    }, 1000);
  };
  
  // 处理输入变化
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    // 如果是自动翻译模式，实时翻译输入文本
    if (translationMode === 'auto' && e.target.value) {
      translateText(e.target.value);
    }
  };
  
  // 处理按键事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };
  
  // 切换显示模式
  const toggleDisplayMode = () => {
    const modes = ['both', 'source', 'target', 'split'];
    const currentIndex = modes.indexOf(displayMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setDisplayMode(modes[nextIndex]);
  };
  
  // 切换翻译模式
  const toggleTranslationMode = () => {
    setTranslationMode(prev => prev === 'auto' ? 'manual' : 'auto');
  };
  
  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 应用Manus AI建议
  const applyManusSuggestion = (suggestion) => {
    if (suggestion.type === 'alternative') {
      setInputText(suggestion.text);
      setLiveTranslation('');
      if (translationMode === 'auto') {
        translateText(suggestion.text);
      }
    }
  };
  
  // 关闭文化背景信息
  const closeCulturalContext = () => {
    setCulturalContext(null);
  };
  
  // 渲染消息气泡
  const renderMessageBubble = (message) => {
    const isUserMessage = message.sender === 'user';
    const bubbleClass = isUserMessage ? 'user-message' : 'other-message';
    const showSource = displayMode === 'source' || displayMode === 'both' || displayMode === 'split';
    const showTarget = displayMode === 'target' || displayMode === 'both' || displayMode === 'split';
    
    return (
      <div 
        className={`message-container ${isUserMessage ? 'user-container' : 'other-container'}`}
        key={message.id}
      >
        <div className={`message-bubble ${bubbleClass}`}>
          {message.type === 'voice' && (
            <div className="voice-indicator">
              <i className="voice-icon"></i>
            </div>
          )}
          
          {showSource && (
            <div className="message-text source-text">
              {message.text}
            </div>
          )}
          
          {showSource && showTarget && displayMode !== 'split' && (
            <div className="translation-divider"></div>
          )}
          
          {showTarget && (
            <div className="message-text target-text">
              {message.translation}
            </div>
          )}
          
          <div className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="translation-chat-container">
      {/* 聊天头部 */}
      <div className="chat-header">
        <div className="language-indicator">
          {sourceLanguage.includes('zh') ? '中文' : 'English'} → {targetLanguage.includes('en') ? 'English' : '中文'}
        </div>
        <div className="chat-controls">
          <button 
            className={`display-mode-toggle ${displayMode}`}
            onClick={toggleDisplayMode}
            title="切换显示模式"
          >
            {displayMode === 'both' ? '双语' : 
             displayMode === 'source' ? '原文' : 
             displayMode === 'target' ? '译文' : '分屏'}
          </button>
          <button 
            className={`translation-mode-toggle ${translationMode}`}
            onClick={toggleTranslationMode}
            title="切换翻译模式"
          >
            {translationMode === 'auto' ? '自动翻译' : '手动翻译'}
          </button>
        </div>
      </div>
      
      {/* 聊天消息区域 */}
      <div className={`chat-messages ${displayMode === 'split' ? 'split-view' : ''}`}>
        {displayMode === 'split' ? (
          <>
            <div className="source-column">
              <div className="column-header">{sourceLanguage.includes('zh') ? '中文' : 'English'}</div>
              <div className="messages-wrapper">
                {messages.map(message => (
                  <div 
                    className={`message-container ${message.sender === 'user' ? 'user-container' : 'other-container'}`}
                    key={`source-${message.id}`}
                  >
                    <div className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'other-message'}`}>
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="target-column">
              <div className="column-header">{targetLanguage.includes('en') ? 'English' : '中文'}</div>
              <div className="messages-wrapper">
                {messages.map(message => (
                  <div 
                    className={`message-container ${message.sender === 'user' ? 'user-container' : 'other-container'}`}
                    key={`target-${message.id}`}
                  >
                    <div className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'other-message'}`}>
                      <div className="message-text">{message.translation}</div>
                      <div className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          messages.map(renderMessageBubble)
        )}
        
        {/* 文化背景信息卡片 */}
        {culturalContext && (
          <div className="cultural-context-card">
            <div className="context-header">
              <h3>{culturalContext.title}</h3>
              <button className="close-button" onClick={closeCulturalContext}>×</button>
            </div>
            <div className="context-content">
              <p>{culturalContext.content}</p>
            </div>
          </div>
        )}
        
        {/* 语音识别结果显示 */}
        {isRecording && (
          <div className="speech-result-container">
            <div className="speech-result">
              <div className="recording-indicator">
                <span className="recording-dot"></span> 正在录音...
              </div>
              <div className="speech-text">{speechResult}</div>
              {liveTranslation && (
                <>
                  <div className="translation-divider"></div>
                  <div className="translation-text">{liveTranslation}</div>
                </>
              )}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Manus AI助手 */}
      {showManusAI && manusSuggestions.length > 0 && (
        <div className="manus-ai-container">
          <div className="manus-ai-header">
            <div className="manus-ai-avatar"></div>
            <div className="manus-ai-title">Manus AI 助手</div>
            <button className="close-button" onClick={() => setShowManusAI(false)}>×</button>
          </div>
          <div className="manus-ai-suggestions">
            {manusSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`suggestion-item ${suggestion.type}`}
                onClick={() => applyManusSuggestion(suggestion)}
              >
                {suggestion.type === 'alternative' && <span className="suggestion-icon">💬</span>}
                {suggestion.type === 'learning' && <span className="suggestion-icon">📚</span>}
                <span className="suggestion-text">{suggestion.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 输入区域 */}
      <div className="chat-input-container">
        {/* 实时翻译预览 */}
        {inputText && translationMode === 'auto' && liveTranslation && (
          <div className="live-translation">
            {liveTranslation}
          </div>
        )}
        
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            placeholder="输入消息..."
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isRecording}
          />
          
          <div className="input-actions">
            {!isRecording ? (
              <>
                <button 
                  className="voice-button"
                  onClick={startSpeechRecognition}
                  title="语音输入"
                >
                  <i className="mic-icon"></i>
                </button>
                <button 
                  className="send-button"
                  onClick={sendTextMessage}
                  disabled={!inputText.trim()}
                  title="发送消息"
                >
                  <i className="send-icon"></i>
                </button>
              </>
            ) : (
              <button 
                className="stop-voice-button"
                onClick={stopSpeechRecognition}
                title="停止录音"
              >
                <i className="stop-icon"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationChat;
