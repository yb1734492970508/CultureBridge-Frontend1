import React, { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './TemplateCard.css';

/**
 * 模板卡片组件
 * 展示单个模板的信息和操作
 */
const TemplateCard = ({ 
  template, 
  isSelected = false,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  showUsageStats = true,
  showActions = true,
  className = ""
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    id,
    name,
    description,
    category,
    icon,
    difficulty,
    estimatedTime,
    usageCount,
    successRate,
    tags,
    author,
    createdAt,
    updatedAt,
    isCustom,
    isOfficial,
    preview
  } = template;

  // 获取难度样式类
  const getDifficultyClass = (level) => {
    const classes = {
      easy: 'difficulty-easy',
      medium: 'difficulty-medium',
      hard: 'difficulty-hard'
    };
    return classes[level] || 'difficulty-medium';
  };

  // 获取难度标签
  const getDifficultyLabel = (level) => {
    const labels = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };
    return labels[level] || '中等';
  };

  // 格式化使用次数
  const formatUsageCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // 格式化成功率
  const formatSuccessRate = (rate) => {
    return `${Math.round(rate * 100)}%`;
  };

  // 处理图片加载
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // 处理卡片点击
  const handleCardClick = useCallback((e) => {
    // 如果点击的是操作按钮，不触发卡片选择
    if (e.target.closest('.template-actions')) {
      return;
    }
    
    if (onSelect) {
      onSelect(template);
    }
  }, [template, onSelect]);

  // 处理预览
  const handlePreview = useCallback((e) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(template);
    }
  }, [template, onPreview]);

  // 处理编辑
  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(template);
    }
  }, [template, onEdit]);

  // 处理删除
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`确定要删除模板"${name}"吗？`)) {
      onDelete(template);
    }
  }, [template, onDelete, name]);

  return (
    <div 
      className={`template-card ${isSelected ? 'selected' : ''} ${className}`}
      onClick={handleCardClick}
    >
      {/* 模板预览图 */}
      <div className="template-preview">
        {preview?.image && !imageError ? (
          <img
            src={preview.image}
            alt={`${name} 预览`}
            className={`preview-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="preview-placeholder">
            <span className="template-icon">{icon}</span>
          </div>
        )}

        {/* 模板标识 */}
        <div className="template-badges">
          {isOfficial && (
            <span className="template-badge official">官方</span>
          )}
          {isCustom && (
            <span className="template-badge custom">自定义</span>
          )}
          <span className={`template-badge difficulty ${getDifficultyClass(difficulty)}`}>
            {getDifficultyLabel(difficulty)}
          </span>
        </div>

        {/* 选中指示器 */}
        {isSelected && (
          <div className="selection-indicator">
            <span className="selection-icon">✓</span>
          </div>
        )}
      </div>

      {/* 模板信息 */}
      <div className="template-info">
        <div className="template-header">
          <h3 className="template-name">{name}</h3>
          {estimatedTime && (
            <span className="estimated-time">
              <span className="time-icon">⏱️</span>
              {estimatedTime}分钟
            </span>
          )}
        </div>

        <p className="template-description">{description}</p>

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <div className="template-tags">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="template-tag">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="template-tag more">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 统计信息 */}
        {showUsageStats && (
          <div className="template-stats">
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-value">{formatUsageCount(usageCount || 0)}</span>
              <span className="stat-label">使用</span>
            </div>
            {successRate !== undefined && (
              <div className="stat-item">
                <span className="stat-icon">✅</span>
                <span className="stat-value">{formatSuccessRate(successRate)}</span>
                <span className="stat-label">成功率</span>
              </div>
            )}
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <span className="stat-value">
                {formatDistanceToNow(new Date(updatedAt), { 
                  addSuffix: true, 
                  locale: zhCN 
                })}
              </span>
            </div>
          </div>
        )}

        {/* 作者信息 */}
        {author && (
          <div className="template-author">
            <img
              src={author.avatar}
              alt={author.name}
              className="author-avatar"
            />
            <span className="author-name">{author.name}</span>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {showActions && (
        <div className="template-actions">
          <button
            className="action-button preview"
            onClick={handlePreview}
            title="预览模板"
          >
            <span className="action-icon">👁️</span>
            预览
          </button>
          
          {isCustom && onEdit && (
            <button
              className="action-button edit"
              onClick={handleEdit}
              title="编辑模板"
            >
              <span className="action-icon">✏️</span>
              编辑
            </button>
          )}
          
          {isCustom && onDelete && (
            <button
              className="action-button delete"
              onClick={handleDelete}
              title="删除模板"
            >
              <span className="action-icon">🗑️</span>
              删除
            </button>
          )}
          
          <button
            className="action-button select primary"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect(template);
            }}
          >
            <span className="action-icon">✓</span>
            {isSelected ? '已选择' : '选择'}
          </button>
        </div>
      )}

      {/* 悬停效果 */}
      <div className="card-overlay" />
    </div>
  );
};

export default TemplateCard;

