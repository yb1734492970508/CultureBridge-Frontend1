import React, { useState, useEffect } from 'react';
import './AIContentAssistant.css';

const AIContentAssistant = ({ onContentChange, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inspirations, setInspirations] = useState([]);
  const [showInspiration, setShowInspiration] = useState(false);
  const [optimizations, setOptimizations] = useState([]);

  // 内容分析
  const analyzeContent = async (text) => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai-assistant/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalysis(result.data);
      }
    } catch (error) {
      console.error('内容分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 获取优化建议
  const getOptimizations = async (text) => {
    if (!text.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/ai-assistant/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setOptimizations(result.data.optimizations || []);
      }
    } catch (error) {
      console.error('获取优化建议失败:', error);
    }
  };

  // 获取创作灵感
  const getInspiration = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ai-assistant/inspiration?interests=文化,语言学习&trending=日本,韩国');
      
      if (response.ok) {
        const result = await response.json();
        setInspirations(result.data.inspirations || []);
        setShowInspiration(true);
      }
    } catch (error) {
      console.error('获取创作灵感失败:', error);
    }
  };

  // 内容变化处理
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
    
    // 防抖分析
    clearTimeout(window.contentAnalysisTimer);
    window.contentAnalysisTimer = setTimeout(() => {
      analyzeContent(newContent);
      getOptimizations(newContent);
    }, 1000);
  };

  // 应用优化建议
  const applyOptimization = (optimization) => {
    if (optimization.type === 'word_replacement') {
      const newContent = content.replace(
        new RegExp(optimization.original, 'gi'),
        optimization.suggestions[0]
      );
      setContent(newContent);
      onContentChange?.(newContent);
    }
  };

  // 使用灵感
  const useInspiration = (inspiration) => {
    const inspirationText = `\n\n💡 ${inspiration.title}\n${inspiration.description}\n\n预计用时：${inspiration.estimatedTime}\n难度：${inspiration.difficulty}\n\n`;
    const newContent = content + inspirationText;
    setContent(newContent);
    onContentChange?.(newContent);
    setShowInspiration(false);
  };

  return (
    <div className="ai-content-assistant">
      <div className="assistant-header">
        <h3>🤖 AI智能创作助手</h3>
        <div className="assistant-actions">
          <button 
            className="inspiration-btn"
            onClick={getInspiration}
          >
            💡 获取灵感
          </button>
        </div>
      </div>

      <div className="content-editor">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="开始创作您的内容，AI助手将实时为您提供建议..."
          className="content-textarea"
          rows={10}
        />
        
        {isAnalyzing && (
          <div className="analyzing-indicator">
            <div className="spinner"></div>
            <span>AI正在分析您的内容...</span>
          </div>
        )}
      </div>

      {/* 内容分析结果 */}
      {analysis && (
        <div className="analysis-panel">
          <div className="analysis-header">
            <h4>📊 内容分析</h4>
            <div className={`approval-status ${analysis.isApproved ? 'approved' : 'needs-review'}`}>
              {analysis.isApproved ? '✅ 内容通过' : '⚠️ 需要优化'}
            </div>
          </div>

          {/* 违禁词检测 */}
          {analysis.hasForbiddenWords && (
            <div className="forbidden-words-section">
              <h5>🚫 检测到敏感词汇</h5>
              <div className="forbidden-words-list">
                {analysis.forbiddenWords.map((item, index) => (
                  <div key={index} className="forbidden-word-item">
                    <span className="word">"{item.word}"</span>
                    {item.suggestions.length > 0 && (
                      <div className="suggestions">
                        建议替换为：
                        {item.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            className="suggestion-btn"
                            onClick={() => applyOptimization({
                              type: 'word_replacement',
                              original: item.word,
                              suggestions: [suggestion]
                            })}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 质量评估 */}
          <div className="quality-assessment">
            <h5>📈 内容质量评估</h5>
            <div className="quality-scores">
              <div className="score-item">
                <span className="score-label">语法</span>
                <div className="score-bar">
                  <div 
                    className="score-fill"
                    style={{ width: `${analysis.qualityAssessment.score.grammar}%` }}
                  ></div>
                </div>
                <span className="score-value">{analysis.qualityAssessment.score.grammar}</span>
              </div>
              <div className="score-item">
                <span className="score-label">可读性</span>
                <div className="score-bar">
                  <div 
                    className="score-fill"
                    style={{ width: `${analysis.qualityAssessment.score.readability}%` }}
                  ></div>
                </div>
                <span className="score-value">{analysis.qualityAssessment.score.readability}</span>
              </div>
              <div className="score-item">
                <span className="score-label">吸引力</span>
                <div className="score-bar">
                  <div 
                    className="score-fill"
                    style={{ width: `${analysis.qualityAssessment.score.engagement}%` }}
                  ></div>
                </div>
                <span className="score-value">{analysis.qualityAssessment.score.engagement}</span>
              </div>
              <div className="score-item overall">
                <span className="score-label">总分</span>
                <div className="score-bar">
                  <div 
                    className="score-fill"
                    style={{ width: `${analysis.qualityAssessment.score.overall}%` }}
                  ></div>
                </div>
                <span className="score-value">{analysis.qualityAssessment.score.overall}</span>
              </div>
            </div>

            {/* 改进建议 */}
            {analysis.qualityAssessment.suggestions.length > 0 && (
              <div className="improvement-suggestions">
                <h6>💡 改进建议</h6>
                <ul>
                  {analysis.qualityAssessment.suggestions.map((suggestion, index) => (
                    <li key={index} className={`suggestion-item ${suggestion.priority}`}>
                      <span className="suggestion-icon">
                        {suggestion.priority === 'high' ? '🔴' : 
                         suggestion.priority === 'medium' ? '🟡' : '🟢'}
                      </span>
                      {suggestion.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 优化建议面板 */}
      {optimizations.length > 0 && (
        <div className="optimizations-panel">
          <h4>🔧 优化建议</h4>
          <div className="optimizations-list">
            {optimizations.map((opt, index) => (
              <div key={index} className={`optimization-item ${opt.priority}`}>
                <div className="optimization-content">
                  <span className="optimization-type">{opt.type}</span>
                  <p className="optimization-message">{opt.message || opt.original}</p>
                  {opt.suggestions && (
                    <div className="optimization-suggestions">
                      {opt.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          className="apply-btn"
                          onClick={() => applyOptimization(opt)}
                        >
                          应用：{suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 创作灵感弹窗 */}
      {showInspiration && (
        <div className="inspiration-modal">
          <div className="modal-overlay" onClick={() => setShowInspiration(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>💡 创作灵感</h3>
              <button 
                className="close-btn"
                onClick={() => setShowInspiration(false)}
              >
                ×
              </button>
            </div>
            <div className="inspirations-grid">
              {inspirations.map((inspiration) => (
                <div key={inspiration.id} className="inspiration-card">
                  <div className="inspiration-header">
                    <h4>{inspiration.title}</h4>
                    <div className="inspiration-meta">
                      <span className={`difficulty ${inspiration.difficulty}`}>
                        {inspiration.difficulty}
                      </span>
                      <span className="time">{inspiration.estimatedTime}</span>
                    </div>
                  </div>
                  <p className="inspiration-description">{inspiration.description}</p>
                  <div className="inspiration-tags">
                    {inspiration.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                  <button 
                    className="use-inspiration-btn"
                    onClick={() => useInspiration(inspiration)}
                  >
                    使用这个灵感
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIContentAssistant;

