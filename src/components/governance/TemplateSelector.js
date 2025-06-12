import React, { useState, useEffect, useCallback } from 'react';
import { useTemplateLibrary } from '../../hooks/useTemplateLibrary';
import TemplateCard from './TemplateCard';
import TemplatePreview from './TemplatePreview';
import './TemplateSelector.css';

/**
 * 模板选择器组件
 * 提供模板浏览、筛选、预览和选择功能
 */
const TemplateSelector = ({ 
  onTemplateSelect, 
  selectedTemplateId = null,
  className = "",
  showPreview = true 
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showCreateCustom, setShowCreateCustom] = useState(false);

  const {
    templates,
    categories,
    loading,
    error,
    searchTemplates,
    getTemplatesByCategory,
    getTemplateUsageStats
  } = useTemplateLibrary();

  // 筛选和排序模板
  const filteredTemplates = React.useMemo(() => {
    let filtered = templates;

    // 按类别筛选
    if (activeCategory !== 'all') {
      filtered = filtered.filter(template => template.category === activeCategory);
    }

    // 按搜索查询筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'recent':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        default:
          return 0;
      }
    });

    return filtered;
  }, [templates, activeCategory, searchQuery, sortBy]);

  // 处理模板选择
  const handleTemplateSelect = useCallback((template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  }, [onTemplateSelect]);

  // 处理模板预览
  const handleTemplatePreview = useCallback((template) => {
    setPreviewTemplate(template);
  }, []);

  // 处理搜索
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchTemplates(query);
    }
  }, [searchTemplates]);

  // 获取类别统计
  const getCategoryStats = useCallback((categoryId) => {
    if (categoryId === 'all') {
      return templates.length;
    }
    return templates.filter(t => t.category === categoryId).length;
  }, [templates]);

  if (loading) {
    return (
      <div className="template-selector-loading">
        <div className="loading-spinner" />
        <p>正在加载模板库...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-selector-error">
        <div className="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={`template-selector ${className}`}>
      {/* 头部区域 */}
      <div className="template-selector-header">
        <div className="header-content">
          <h1 className="selector-title">选择提案模板</h1>
          <p className="selector-subtitle">
            选择合适的模板来创建您的治理提案，或创建自定义模板
          </p>
        </div>

        {/* 搜索和排序 */}
        <div className="selector-controls">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => handleSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="sort-container">
            <label htmlFor="sort-select" className="sort-label">排序：</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="popularity">热门度</option>
              <option value="recent">最新更新</option>
              <option value="name">名称</option>
              <option value="difficulty">难度</option>
            </select>
          </div>
        </div>
      </div>

      {/* 类别筛选 */}
      <div className="category-filters">
        <button
          className={`category-filter ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          全部 ({getCategoryStats('all')})
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-filter ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.name} ({getCategoryStats(category.id)})
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      <div className="template-grid-container">
        <div className="template-grid">
          {/* 自定义模板创建卡片 */}
          <div className="template-card custom-template-card">
            <div className="custom-template-content">
              <div className="custom-icon">✨</div>
              <h3 className="custom-title">创建自定义模板</h3>
              <p className="custom-description">
                根据您的特定需求创建个性化的提案模板
              </p>
              <button
                className="custom-create-button"
                onClick={() => setShowCreateCustom(true)}
              >
                开始创建
              </button>
            </div>
          </div>

          {/* 模板卡片 */}
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={() => handleTemplateSelect(template)}
              onPreview={() => handleTemplatePreview(template)}
              showUsageStats={true}
            />
          ))}
        </div>

        {/* 空状态 */}
        {filteredTemplates.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>未找到匹配的模板</h3>
            <p>
              {searchQuery 
                ? `没有找到包含"${searchQuery}"的模板`
                : '该类别下暂无可用模板'
              }
            </p>
            <div className="empty-actions">
              {searchQuery && (
                <button
                  className="clear-search-button"
                  onClick={() => handleSearch('')}
                >
                  清除搜索
                </button>
              )}
              <button
                className="create-custom-button"
                onClick={() => setShowCreateCustom(true)}
              >
                创建自定义模板
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 模板预览 */}
      {showPreview && previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={() => {
            handleTemplateSelect(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}

      {/* 快速操作栏 */}
      {selectedTemplateId && (
        <div className="quick-actions">
          <div className="actions-content">
            <div className="selected-info">
              <span className="selected-icon">✓</span>
              已选择模板
            </div>
            <div className="actions-buttons">
              <button
                className="action-button secondary"
                onClick={() => {
                  const template = templates.find(t => t.id === selectedTemplateId);
                  if (template) handleTemplatePreview(template);
                }}
              >
                预览
              </button>
              <button
                className="action-button primary"
                onClick={() => {
                  const template = templates.find(t => t.id === selectedTemplateId);
                  if (template) handleTemplateSelect(template);
                }}
              >
                使用此模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;

