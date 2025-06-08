import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import './NFTSearchBar.css';
import NFTSearchService from './NFTSearchService';

/**
 * NFT搜索栏组件
 * 提供增强的搜索体验，包括搜索提示、历史记录和高亮显示
 */
const NFTSearchBar = ({ 
  onSearch, 
  nfts = [], 
  placeholder = '搜索NFT、创作者、类别...',
  autoFocus = false,
  className = '',
  enableHistory = true,
  enableSuggestions = true,
  maxSuggestions = 5
}) => {
  // 状态管理
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  
  // 引用
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // 搜索服务实例
  const searchService = useMemo(() => new NFTSearchService({
    maxHistoryItems: 10,
    minSearchLength: 2,
    enableFuzzySearch: true,
    fuzzyThreshold: 0.3
  }), []);
  
  // 初始化搜索历史
  useEffect(() => {
    if (enableHistory) {
      setSearchHistory(searchService.getHistory());
    }
  }, [enableHistory, searchService]);
  
  // 处理点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current && 
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (enableSuggestions && value.length >= 2) {
      const newSuggestions = searchService.getSuggestions(value, nfts, maxSuggestions);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  };
  
  // 处理搜索提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (query.trim()) {
      performSearch(query);
    }
  };
  
  // 执行搜索
  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    // 添加到历史记录
    if (enableHistory) {
      searchService.addToHistory(searchQuery);
      setSearchHistory(searchService.getHistory());
    }
    
    // 调用搜索回调
    if (onSearch) {
      onSearch(searchQuery);
    }
    
    // 关闭建议
    setShowSuggestions(false);
  };
  
  // 处理建议点击
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };
  
  // 处理历史记录点击
  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    performSearch(historyItem);
  };
  
  // 处理删除历史记录
  const handleDeleteHistory = (e, historyItem) => {
    e.stopPropagation();
    searchService.removeFromHistory(historyItem);
    setSearchHistory(searchService.getHistory());
  };
  
  // 处理清空历史记录
  const handleClearHistory = (e) => {
    e.stopPropagation();
    searchService.clearHistory();
    setSearchHistory([]);
  };
  
  // 处理键盘导航
  const handleKeyDown = (e) => {
    // 如果没有显示建议，不处理
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : -1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };
  
  // 高亮显示匹配文本
  const highlightMatch = (text, query) => {
    if (!query || query.trim() === '') {
      return text;
    }
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <mark key={index}>{part}</mark> : 
            part
        )}
      </>
    );
  };
  
  return (
    <div className={`nft-search-bar ${className}`}>
      <form onSubmit={handleSubmit} role="search">
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(query.length >= 2 && suggestions.length > 0);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="搜索NFT"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions}
            aria-activedescendant={
              selectedSuggestionIndex >= 0 ? 
              `suggestion-${selectedSuggestionIndex}` : 
              undefined
            }
            className="search-input"
          />
          
          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="清除搜索"
            >
              ×
            </button>
          )}
          
          <button
            type="submit"
            className="search-button"
            aria-label="搜索"
          >
            <span className="search-icon">🔍</span>
          </button>
        </div>
        
        {/* 搜索建议和历史记录 */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="search-suggestions"
            id="search-suggestions"
            role="listbox"
          >
            {/* 搜索建议 */}
            {suggestions.length > 0 && (
              <div className="suggestions-section">
                <h3 className="suggestions-title">搜索建议</h3>
                <ul className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={`suggestion-${index}`}
                      id={`suggestion-${index}`}
                      className={`suggestion-item ${selectedSuggestionIndex === index ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      role="option"
                      aria-selected={selectedSuggestionIndex === index}
                    >
                      <span className="suggestion-icon">🔍</span>
                      <span className="suggestion-text">
                        {highlightMatch(suggestion, query)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 搜索历史 */}
            {enableHistory && searchHistory.length > 0 && (
              <div className="history-section">
                <div className="history-header">
                  <h3 className="history-title">搜索历史</h3>
                  <button
                    type="button"
                    className="clear-history-button"
                    onClick={handleClearHistory}
                    aria-label="清空搜索历史"
                  >
                    清空
                  </button>
                </div>
                <ul className="history-list">
                  {searchHistory.map((historyItem, index) => (
                    <li 
                      key={`history-${index}`}
                      className="history-item"
                      onClick={() => handleHistoryClick(historyItem)}
                    >
                      <span className="history-icon">⏱️</span>
                      <span className="history-text">{historyItem}</span>
                      <button
                        type="button"
                        className="delete-history-button"
                        onClick={(e) => handleDeleteHistory(e, historyItem)}
                        aria-label={`删除历史记录: ${historyItem}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

NFTSearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  nfts: PropTypes.array,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  enableHistory: PropTypes.bool,
  enableSuggestions: PropTypes.bool,
  maxSuggestions: PropTypes.number
};

export default NFTSearchBar;
