import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import '../../styles/dao.css';
import './TemplateLibrary.css';

/**
 * 提案模板库组件
 * 提供浏览、搜索和选择提案模板的功能
 */
const TemplateLibrary = ({ onSelectTemplate, onClose }) => {
  const navigate = useNavigate();
  const { account, active } = useBlockchain();
  const { getProposalTemplates, isLoading, error } = useDAO();
  
  // 本地状态
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  // 加载模板
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templatesData = await getProposalTemplates();
        setTemplates(templatesData);
        setFilteredTemplates(templatesData);
      } catch (err) {
        console.error('加载提案模板失败:', err);
      }
    };
    
    loadTemplates();
  }, [getProposalTemplates]);
  
  // 模板类别
  const categories = useMemo(() => {
    const cats = new Set(templates.map(template => template.category));
    return ['all', ...Array.from(cats)];
  }, [templates]);
  
  // 处理搜索和筛选
  useEffect(() => {
    let result = [...templates];
    
    // 应用类别筛选
    if (selectedCategory !== 'all') {
      result = result.filter(template => template.category === selectedCategory);
    }
    
    // 应用搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        template => 
          template.title.toLowerCase().includes(term) || 
          template.description.toLowerCase().includes(term) ||
          template.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // 应用排序
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    setFilteredTemplates(result);
  }, [templates, selectedCategory, searchTerm, sortBy]);
  
  // 处理模板选择
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
  };
  
  // 处理模板确认
  const handleConfirmTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };
  
  // 处理搜索变更
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 处理类别变更
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  // 处理排序变更
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  // 渲染模板卡片
  const renderTemplateCard = (template) => {
    return (
      <div 
        key={template.id} 
        className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
        onClick={() => handleTemplateSelect(template)}
      >
        <div className="template-card-header">
          <h3>{template.title}</h3>
          {template.isOfficial && <span className="official-badge">官方</span>}
        </div>
        
        <div className="template-card-body">
          <p className="template-description">{template.description}</p>
          
          <div className="template-meta">
            <div className="template-stats">
              <span className="usage-count">
                <i className="icon-usage"></i> {template.usageCount} 次使用
              </span>
              <span className="rating">
                <i className="icon-star"></i> {template.rating.toFixed(1)}
              </span>
            </div>
            
            <div className="template-tags">
              {template.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
              {template.tags.length > 3 && <span className="more-tags">+{template.tags.length - 3}</span>}
            </div>
          </div>
        </div>
        
        <div className="template-card-footer">
          <span className="template-author">
            作者: {template.author.substring(0, 6)}...{template.author.substring(38)}
          </span>
          <span className="template-date">
            {new Date(template.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  };
  
  // 渲染模板预览
  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="template-preview-overlay">
        <div className="template-preview">
          <div className="preview-header">
            <h2>模板预览</h2>
            <button className="close-button" onClick={() => setPreviewMode(false)}>×</button>
          </div>
          
          <div className="preview-content">
            <div className="preview-section">
              <h3>基本信息</h3>
              <div className="preview-info">
                <div className="info-item">
                  <span className="info-label">标题:</span>
                  <span className="info-value">{selectedTemplate.title}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">类别:</span>
                  <span className="info-value">{selectedTemplate.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">版本:</span>
                  <span className="info-value">{selectedTemplate.version}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">作者:</span>
                  <span className="info-value">{selectedTemplate.author.substring(0, 6)}...{selectedTemplate.author.substring(38)}</span>
                </div>
              </div>
            </div>
            
            <div className="preview-section">
              <h3>描述</h3>
              <p className="preview-description">{selectedTemplate.description}</p>
            </div>
            
            <div className="preview-section">
              <h3>结构</h3>
              <div className="structure-preview">
                <div className="structure-item">
                  <h4>标题</h4>
                  <p className="structure-hint">{selectedTemplate.structure.title.hint}</p>
                  <div className="structure-placeholder">{selectedTemplate.structure.title.placeholder}</div>
                </div>
                
                {selectedTemplate.structure.sections.map((section, index) => (
                  <div key={index} className="structure-item">
                    <h4>{section.title}</h4>
                    <p className="structure-hint">{section.hint}</p>
                    <div className="structure-placeholder">{section.placeholder}</div>
                  </div>
                ))}
                
                {selectedTemplate.structure.actions.length > 0 && (
                  <div className="structure-item">
                    <h4>操作</h4>
                    <div className="actions-list">
                      {selectedTemplate.structure.actions.map((action, index) => (
                        <div key={index} className="action-item">
                          <p><strong>操作 #{index + 1}:</strong> {action.description}</p>
                          <p>目标: {action.target}</p>
                          <p>数量: {action.value} ETH</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="preview-actions">
            <button 
              className="dao-btn secondary-btn"
              onClick={() => setPreviewMode(false)}
            >
              返回
            </button>
            <button 
              className="dao-btn primary-btn"
              onClick={handleConfirmTemplate}
            >
              使用此模板
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="template-library">
      <div className="library-header">
        <h2>提案模板库</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="library-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <div className="category-filter">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category === 'all' ? '全部' : category}
              </button>
            ))}
          </div>
          
          <div className="sort-filter">
            <label htmlFor="sort-select">排序:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="popular">最受欢迎</option>
              <option value="newest">最新</option>
              <option value="rating">评分最高</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载模板中...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="dao-btn secondary-btn"
            onClick={() => getProposalTemplates()}
          >
            重试
          </button>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="empty-container">
          <p>没有找到匹配的模板</p>
          {searchTerm && (
            <button 
              className="dao-btn secondary-btn"
              onClick={() => setSearchTerm('')}
            >
              清除搜索
            </button>
          )}
        </div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map(renderTemplateCard)}
        </div>
      )}
      
      <div className="library-actions">
        <button 
          className="dao-btn secondary-btn"
          onClick={onClose}
        >
          取消
        </button>
        <button 
          className="dao-btn primary-btn"
          onClick={() => navigate('/create-template')}
          disabled={!active}
        >
          创建新模板
        </button>
      </div>
      
      {previewMode && renderTemplatePreview()}
    </div>
  );
};

export default TemplateLibrary;
