import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './SmartSearchBox.css';

/**
 * 智能搜索框组件
 * 支持智能建议、搜索历史、语音搜索等功能
 */
const SmartSearchBox = ({ 
  onSearch, 
  onSuggestionSelect,
  placeholder = "搜索NFT、创作者或收藏...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [searchHistory, setSearchHistory] = useLocalStorage('nft-search-history', []);
  const [popularSearches] = useState([
    '数字艺术', '像素艺术', '3D艺术', '摄影', '音乐NFT',
    '游戏道具', '虚拟土地', '头像NFT', '收藏卡牌', '元宇宙'
  ]);

  const debouncedQuery = useDebounce(query, 300);

  // 模拟搜索建议API
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    const mockSuggestions = [
      {
        type: 'nft',
        text: `${searchQuery} NFT`,
        description: '在NFT中搜索',
        icon: '🎨',
        count: Math.floor(Math.random() * 1000)
      },
      {
        type: 'creator',
        text: `创作者: ${searchQuery}`,
        description: '搜索相关创作者',
        icon: '👤',
        count: Math.floor(Math.random() * 100)
      },
      {
        type: 'collection',
        text: `收藏: ${searchQuery}`,
        description: '搜索相关收藏',
        icon: '📁',
        count: Math.floor(Math.random() * 50)
      },
      {
        type: 'tag',
        text: `标签: ${searchQuery}`,
        description: '搜索相关标签',
        icon: '🏷️',
        count: Math.floor(Math.random() * 200)
      }
    ];

    setSuggestions(mockSuggestions);
  }, []);

  // 处理搜索查询变化
  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery, fetchSuggestions]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);
  };

  // 处理搜索提交
  const handleSearch = useCallback((searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // 添加到搜索历史
    const newHistory = [
      searchQuery,
      ...searchHistory.filter(item => item !== searchQuery)
    ].slice(0, 10);
    setSearchHistory(newHistory);

    // 执行搜索
    onSearch(searchQuery);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  }, [query, searchHistory, setSearchHistory, onSearch]);

  // 处理建议选择
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  // 处理历史记录选择
  const handleHistorySelect = (historyItem) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  // 处理热门搜索选择
  const handlePopularSelect = (popularItem) => {
    setQuery(popularItem);
    handleSearch(popularItem);
  };

  // 处理键盘导航
  const handleKeyDown = (e) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    const totalItems = suggestions.length + searchHistory.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : -1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > -1 ? prev - 1 : totalItems - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < suggestions.length) {
            handleSuggestionSelect(suggestions[highlightedIndex]);
          } else {
            const historyIndex = highlightedIndex - suggestions.length;
            handleHistorySelect(searchHistory[historyIndex]);
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // 处理语音搜索
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('您的浏览器不支持语音搜索功能');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsVoiceRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      setIsVoiceRecording(false);
    };

    recognition.onend = () => {
      setIsVoiceRecording(false);
    };

    recognition.start();
  };

  // 处理图像搜索
  const handleImageSearch = () => {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // 这里可以实现图像搜索逻辑
        console.log('图像搜索文件:', file);
        // 模拟图像搜索
        setQuery('图像搜索结果');
        handleSearch('图像搜索结果');
      }
    };
    
    input.click();
  };

  // 清除搜索
  const handleClearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  // 删除历史记录项
  const removeHistoryItem = (itemToRemove) => {
    const newHistory = searchHistory.filter(item => item !== itemToRemove);
    setSearchHistory(newHistory);
  };

  // 处理焦点事件
  const handleFocus = () => {
    if (query || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // 延迟隐藏建议，允许点击建议项
    setTimeout(() => {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  // 计算显示的内容
  const displayContent = useMemo(() => {
    const content = [];
    
    if (query && suggestions.length > 0) {
      content.push({
        type: 'section',
        title: '搜索建议',
        items: suggestions.map((suggestion, index) => ({
          ...suggestion,
          index,
          highlighted: index === highlightedIndex
        }))
      });
    }

    if (searchHistory.length > 0 && (!query || query.length < 2)) {
      content.push({
        type: 'section',
        title: '搜索历史',
        items: searchHistory.slice(0, 5).map((item, index) => ({
          type: 'history',
          text: item,
          icon: '🕒',
          index: suggestions.length + index,
          highlighted: suggestions.length + index === highlightedIndex
        }))
      });
    }

    return content;
  }, [query, suggestions, searchHistory, highlightedIndex]);

  return (
    <div className={`smart-search-container ${className}`}>
      <div className={`smart-search-box ${showSuggestions ? 'focused' : ''}`}>
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="smart-search-input"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
          />
          <div className="search-actions">
            {query && (
              <button
                className="clear-search-button"
                onClick={handleClearSearch}
                title="清除搜索"
              >
                ✕
              </button>
            )}
            <button
              className={`voice-search-button ${isVoiceRecording ? 'recording' : ''}`}
              onClick={handleVoiceSearch}
              title="语音搜索"
            >
              🎤
            </button>
            <button
              className="camera-search-button"
              onClick={handleImageSearch}
              title="图像搜索"
            >
              📷
            </button>
          </div>
        </div>

        {showSuggestions && (
          <div className="search-suggestions">
            {displayContent.map((section, sectionIndex) => (
              <div key={sectionIndex} className="suggestions-section">
                <div className="suggestions-section-title">
                  {section.title}
                </div>
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`suggestion-item ${item.highlighted ? 'highlighted' : ''}`}
                    onClick={() => {
                      if (item.type === 'history') {
                        handleHistorySelect(item.text);
                      } else {
                        handleSuggestionSelect(item);
                      }
                    }}
                  >
                    <span className="suggestion-icon">{item.icon}</span>
                    <div className="suggestion-content">
                      <div className="suggestion-text">{item.text}</div>
                      {item.description && (
                        <div className="suggestion-description">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.count && (
                      <div className="suggestion-meta">
                        {item.count.toLocaleString()}
                      </div>
                    )}
                    {item.type === 'history' && (
                      <button
                        className="remove-history-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(item.text);
                        }}
                        title="删除历史记录"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {!query && popularSearches.length > 0 && (
              <div className="popular-searches">
                <div className="popular-searches-title">热门搜索</div>
                <div className="popular-tags">
                  {popularSearches.map((tag, index) => (
                    <span
                      key={index}
                      className="popular-tag"
                      onClick={() => handlePopularSelect(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearchBox;

