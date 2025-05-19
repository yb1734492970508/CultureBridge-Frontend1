import React from 'react';
import '../../styles/components/chat/ManusAIIntegration.css';

/**
 * Manus AI集成组件
 * 提供AI驱动的翻译增强、文化解释和学习建议
 */
const ManusAIIntegration = ({
  isEnabled = true,
  suggestions = [],
  culturalContext = null,
  onSuggestionSelect,
  onClose,
  sourceLanguage = 'zh-CN',
  targetLanguage = 'en-US'
}) => {
  if (!isEnabled || (suggestions.length === 0 && !culturalContext)) {
    return null;
  }

  // 渲染文化背景信息卡片
  const renderCulturalContext = () => {
    if (!culturalContext) return null;

    return (
      <div className="manus-cultural-context">
        <div className="context-header">
          <h3>{culturalContext.title}</h3>
          <button className="close-button" onClick={() => onClose('culturalContext')}>×</button>
        </div>
        <div className="context-content">
          <p>{culturalContext.content}</p>
        </div>
      </div>
    );
  };

  // 渲染AI建议列表
  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <div className="manus-suggestions">
        <div className="suggestions-header">
          <h3>翻译建议</h3>
          <button className="close-button" onClick={() => onClose('suggestions')}>×</button>
        </div>
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className={`suggestion-item ${suggestion.type}`}
              onClick={() => onSuggestionSelect(suggestion)}
            >
              {suggestion.type === 'alternative' && <span className="suggestion-icon">💬</span>}
              {suggestion.type === 'learning' && <span className="suggestion-icon">📚</span>}
              <div className="suggestion-content">
                <span className="suggestion-text">{suggestion.text}</span>
                {suggestion.explanation && (
                  <span className="suggestion-explanation">{suggestion.explanation}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="manus-ai-integration">
      <div className="manus-ai-header">
        <div className="manus-ai-avatar"></div>
        <div className="manus-ai-title">Manus AI 助手</div>
      </div>
      <div className="manus-ai-content">
        {renderCulturalContext()}
        {renderSuggestions()}
      </div>
    </div>
  );
};

export default ManusAIIntegration;
