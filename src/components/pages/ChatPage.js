import React, { useState, useEffect } from 'react';
import TranslationChat from '../components/chat/TranslationChat';
import TranslationService from '../services/TranslationService';
import '../../styles/pages/ChatPage.css';

/**
 * 聊天页面组件
 * 集成翻译聊天功能和Manus AI助手
 */
const ChatPage = () => {
  // 语言选择状态
  const [sourceLanguage, setSourceLanguage] = useState('zh-CN');
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  // 支持的语言列表
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  // 翻译服务实例
  const [translationService, setTranslationService] = useState(null);
  // 页面加载状态
  const [isLoading, setIsLoading] = useState(true);
  // Manus AI启用状态
  const [manusAIEnabled, setManusAIEnabled] = useState(true);

  // 初始化翻译服务
  useEffect(() => {
    const initTranslationService = async () => {
      try {
        const service = new TranslationService({
          manusAIEnabled: true
        });
        
        setTranslationService(service);
        
        // 获取支持的语言列表
        const languages = await service.getSupportedLanguages();
        setSupportedLanguages(languages);
        
        setIsLoading(false);
      } catch (error) {
        console.error('初始化翻译服务错误:', error);
        setIsLoading(false);
      }
    };
    
    initTranslationService();
  }, []);

  // 切换源语言和目标语言
  const switchLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  // 处理语言选择变更
  const handleLanguageChange = (type, code) => {
    if (type === 'source') {
      setSourceLanguage(code);
    } else {
      setTargetLanguage(code);
    }
  };

  // 处理Manus AI开关变更
  const handleManusAIToggle = () => {
    setManusAIEnabled(!manusAIEnabled);
  };

  // 处理消息发送
  const handleSendMessage = (message) => {
    console.log('发送消息:', message);
    // 在实际应用中，这里可能会调用API或更新状态
  };

  // 渲染语言选择器
  const renderLanguageSelector = (type, selectedCode) => {
    return (
      <div className="language-selector">
        <label>{type === 'source' ? '源语言' : '目标语言'}</label>
        <select 
          value={selectedCode}
          onChange={(e) => handleLanguageChange(type, e.target.value)}
        >
          {supportedLanguages.map(lang => (
            <option key={`${type}-${lang.code}`} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading-container">加载中...</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>CultureBridge 翻译聊天</h1>
        <div className="language-controls">
          {renderLanguageSelector('source', sourceLanguage)}
          <button 
            className="switch-languages-button"
            onClick={switchLanguages}
            title="切换语言"
          >
            ⇄
          </button>
          {renderLanguageSelector('target', targetLanguage)}
        </div>
        <div className="manus-ai-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={manusAIEnabled}
              onChange={handleManusAIToggle}
            />
            启用 Manus AI 助手
          </label>
        </div>
      </div>
      
      <div className="chat-container">
        <TranslationChat 
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSendMessage={handleSendMessage}
          manusAIEnabled={manusAIEnabled}
        />
      </div>
    </div>
  );
};

export default ChatPage;
