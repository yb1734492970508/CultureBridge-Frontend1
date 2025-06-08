import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import './NFTFilterPanel.css';
import NFTFilterService from './NFTFilterService';

/**
 * NFT筛选面板组件
 * 提供增强的筛选体验，包括多选筛选、筛选条件保存和高级筛选
 */
const NFTFilterPanel = ({
  nfts = [],
  onFilterChange,
  className = '',
  enableMultiSelect = true,
  enableSavedFilters = true,
  currentAccount = null
}) => {
  // 筛选服务实例
  const filterService = useMemo(() => new NFTFilterService({
    maxSavedFilters: 5,
    enableMultiSelect,
    rememberLastFilter: true
  }), [enableMultiSelect]);
  
  // 从NFT数据中提取筛选选项
  const categories = useMemo(() => filterService.extractCategories(nfts), [nfts, filterService]);
  const rarities = useMemo(() => filterService.extractRarities(nfts), [nfts, filterService]);
  const priceRange = useMemo(() => filterService.extractPriceRange(nfts), [nfts, filterService]);
  const attributesMap = useMemo(() => filterService.extractAttributes(nfts), [nfts, filterService]);
  
  // 状态管理
  const [filters, setFilters] = useState(filterService.getCurrentFilters());
  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeAttributeFilter, setActiveAttributeFilter] = useState(null);
  
  // 初始化保存的筛选条件
  useEffect(() => {
    if (enableSavedFilters) {
      setSavedFilters(filterService.getSavedFilters());
    }
  }, [enableSavedFilters, filterService]);
  
  // 更新当前账户
  useEffect(() => {
    if (currentAccount) {
      filterService.updateFilter('currentAccount', currentAccount);
      setFilters(filterService.getCurrentFilters());
    }
  }, [currentAccount, filterService]);
  
  // 处理筛选条件变化
  const handleFilterChange = (filterName, value) => {
    filterService.updateFilter(filterName, value);
    const updatedFilters = filterService.getCurrentFilters();
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // 处理类别切换
  const handleCategoryToggle = (category) => {
    filterService.toggleCategory(category);
    const updatedFilters = filterService.getCurrentFilters();
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // 处理稀有度切换
  const handleRarityToggle = (rarity) => {
    filterService.toggleRarity(rarity);
    const updatedFilters = filterService.getCurrentFilters();
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // 处理价格范围变化
  const handlePriceRangeChange = (min, max) => {
    filterService.setPriceRange([min, max]);
    const updatedFilters = filterService.getCurrentFilters();
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // 处理属性筛选变化
  const handleAttributeChange = (key, value) => {
    filterService.setAttribute(key, value);
    const updatedFilters = filterService.getCurrentFilters();
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // 处理移除属性筛选
  const handleRemoveAttribute = (key) => {
    filterService.removeAttribute(key);
    const updatedFilters = filterService.getCurrentFilters();
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // 处理重置筛选条件
  const handleResetFilters = () => {
    filterService.resetFilters();
    const updatedFilters = filterService.getCurrentFilters();
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // 处理保存筛选条件
  const handleSaveFilter = () => {
    if (!newFilterName.trim()) return;
    
    filterService.saveFilter(newFilterName);
    setSavedFilters(filterService.getSavedFilters());
    setNewFilterName('');
    setShowSaveFilterModal(false);
  };
  
  // 处理应用保存的筛选条件
  const handleApplyFilter = (name) => {
    filterService.applyFilter(name);
    const updatedFilters = filterService.getCurrentFilters();
    setFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // 处理删除保存的筛选条件
  const handleDeleteFilter = (e, name) => {
    e.stopPropagation();
    filterService.deleteFilter(name);
    setSavedFilters(filterService.getSavedFilters());
  };
  
  // 渲染保存的筛选条件
  const renderSavedFilters = () => {
    if (!enableSavedFilters || savedFilters.length === 0) {
      return null;
    }
    
    return (
      <div className="filter-section saved-filters-section">
        <h3>保存的筛选条件</h3>
        <ul className="saved-filters-list">
          {savedFilters.map((filter, index) => (
            <li 
              key={`saved-filter-${index}`}
              className="saved-filter-item"
              onClick={() => handleApplyFilter(filter.name)}
            >
              <span className="saved-filter-name">{filter.name}</span>
              <button
                type="button"
                className="delete-filter-button"
                onClick={(e) => handleDeleteFilter(e, filter.name)}
                aria-label={`删除筛选条件: ${filter.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // 渲染保存筛选条件模态框
  const renderSaveFilterModal = () => {
    if (!showSaveFilterModal) {
      return null;
    }
    
    return (
      <div className="save-filter-modal-overlay">
        <div className="save-filter-modal">
          <div className="modal-header">
            <h3>保存筛选条件</h3>
            <button 
              className="close-modal-button"
              onClick={() => setShowSaveFilterModal(false)}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              placeholder="输入筛选条件名称"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              className="filter-name-input"
              aria-label="筛选条件名称"
            />
          </div>
          <div className="modal-footer">
            <button 
              className="cancel-button"
              onClick={() => setShowSaveFilterModal(false)}
            >
              取消
            </button>
            <button 
              className="save-button"
              onClick={handleSaveFilter}
              disabled={!newFilterName.trim()}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染属性筛选模态框
  const renderAttributeFilterModal = () => {
    if (!activeAttributeFilter) {
      return null;
    }
    
    const attributeValues = attributesMap[activeAttributeFilter] || [];
    
    return (
      <div className="attribute-filter-modal-overlay">
        <div className="attribute-filter-modal">
          <div className="modal-header">
            <h3>{activeAttributeFilter}</h3>
            <button 
              className="close-modal-button"
              onClick={() => setActiveAttributeFilter(null)}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            <ul className="attribute-values-list">
              {attributeValues.map((value, index) => (
                <li 
                  key={`attribute-value-${index}`}
                  className={`attribute-value-item ${
                    filters.attributes && 
                    filters.attributes[activeAttributeFilter] === value ? 
                    'selected' : ''
                  }`}
                  onClick={() => {
                    handleAttributeChange(activeAttributeFilter, value);
                    setActiveAttributeFilter(null);
                  }}
                >
                  {value}
                </li>
              ))}
            </ul>
          </div>
          <div className="modal-footer">
            <button 
              className="clear-button"
              onClick={() => {
                handleRemoveAttribute(activeAttributeFilter);
                setActiveAttributeFilter(null);
              }}
            >
              清除
            </button>
            <button 
              className="cancel-button"
              onClick={() => setActiveAttributeFilter(null)}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染已选筛选条件标签
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    // 类别标签
    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach(category => {
        activeFilters.push({
          type: 'category',
          label: `类别: ${category}`,
          onRemove: () => handleCategoryToggle(category)
        });
      });
    }
    
    // 稀有度标签
    if (filters.rarity && filters.rarity.length > 0) {
      filters.rarity.forEach(rarity => {
        activeFilters.push({
          type: 'rarity',
          label: `稀有度: ${rarity}`,
          onRemove: () => handleRarityToggle(rarity)
        });
      });
    }
    
    // 价格范围标签
    if (
      filters.priceRange && 
      (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1])
    ) {
      activeFilters.push({
        type: 'price',
        label: `价格: ${filters.priceRange[0]} - ${filters.priceRange[1]} ETH`,
        onRemove: () => handlePriceRangeChange(priceRange[0], priceRange[1])
      });
    }
    
    // 属性标签
    if (filters.attributes) {
      Object.entries(filters.attributes).forEach(([key, value]) => {
        activeFilters.push({
          type: 'attribute',
          label: `${key}: ${value}`,
          onRemove: () => handleRemoveAttribute(key)
        });
      });
    }
    
    // 其他筛选标签
    if (filters.onlyVerified) {
      activeFilters.push({
        type: 'verified',
        label: '仅显示已验证',
        onRemove: () => handleFilterChange('onlyVerified', false)
      });
    }
    
    if (filters.showOwned) {
      activeFilters.push({
        type: 'owned',
        label: '仅显示我拥有的',
        onRemove: () => handleFilterChange('showOwned', false)
      });
    }
    
    if (activeFilters.length === 0) {
      return null;
    }
    
    return (
      <div className="active-filters-container">
        <div className="active-filters-header">
          <h3>已选筛选条件</h3>
          <button 
            className="clear-all-button"
            onClick={handleResetFilters}
          >
            清除全部
          </button>
        </div>
        <div className="active-filters-list">
          {activeFilters.map((filter, index) => (
            <div 
              key={`active-filter-${index}`}
              className={`active-filter-tag ${filter.type}`}
            >
              <span className="filter-label">{filter.label}</span>
              <button
                className="remove-filter-button"
                onClick={filter.onRemove}
                aria-label={`移除筛选条件: ${filter.label}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`nft-filter-panel ${className}`}>
      {/* 已选筛选条件 */}
      {renderActiveFilters()}
      
      {/* 保存的筛选条件 */}
      {renderSavedFilters()}
      
      {/* 类别筛选 */}
      <div className="filter-section">
        <h3>类别</h3>
        <div className="category-filters">
          {categories.map((category, index) => (
            <button
              key={`category-${index}`}
              className={`category-btn ${filters.categories.includes(category) ? 'active' : ''}`}
              onClick={() => handleCategoryToggle(category)}
              aria-pressed={filters.categories.includes(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* 价格范围筛选 */}
      <div className="filter-section">
        <h3>价格范围</h3>
        <div className="price-range-filter">
          <div className="price-inputs">
            <input
              type="number"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceRangeChange(
                parseFloat(e.target.value),
                filters.priceRange[1]
              )}
              aria-label="最低价格"
            />
            <span>至</span>
            <input
              type="number"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(
                filters.priceRange[0],
                parseFloat(e.target.value)
              )}
              aria-label="最高价格"
            />
          </div>
          <div className="price-slider-container">
            <input
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceRangeChange(
                parseFloat(e.target.value),
                filters.priceRange[1]
              )}
              className="price-slider min-slider"
              aria-label="最低价格滑块"
            />
            <input
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(
                filters.priceRange[0],
                parseFloat(e.target.value)
              )}
              className="price-slider max-slider"
              aria-label="最高价格滑块"
            />
          </div>
        </div>
      </div>
      
      {/* 稀有度筛选 */}
      {rarities.length > 0 && (
        <div className="filter-section">
          <h3>稀有度</h3>
          <div className="rarity-filters">
            {rarities.map((rarity, index) => (
              <button
                key={`rarity-${index}`}
                className={`rarity-btn ${filters.rarity.includes(rarity) ? 'active' : ''} ${rarity.toLowerCase()}`}
                onClick={() => handleRarityToggle(rarity)}
                aria-pressed={filters.rarity.includes(rarity)}
              >
                {rarity}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 排序方式 */}
      <div className="filter-section">
        <h3>排序方式</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          aria-label="排序方式"
          className="sort-select"
        >
          <option value="newest">最新上架</option>
          <option value="oldest">最早上架</option>
          <option value="priceAsc">价格从低到高</option>
          <option value="priceDesc">价格从高到低</option>
          <option value="popular">最受欢迎</option>
          <option value="nameAsc">名称 A-Z</option>
          <option value="nameDesc">名称 Z-A</option>
        </select>
      </div>
      
      {/* 其他筛选 */}
      <div className="filter-section">
        <h3>其他筛选</h3>
        <div className="checkbox-filters">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.onlyVerified}
              onChange={(e) => handleFilterChange('onlyVerified', e.target.checked)}
            />
            <span className="checkbox-text">仅显示已验证</span>
          </label>
          
          {currentAccount && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.showOwned}
                onChange={(e) => handleFilterChange('showOwned', e.target.checked)}
              />
              <span className="checkbox-text">仅显示我拥有的</span>
            </label>
          )}
        </div>
      </div>
      
      {/* 高级筛选 */}
      <div className="filter-section">
        <button
          className={`advanced-filters-toggle ${showAdvancedFilters ? 'active' : ''}`}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          aria-expanded={showAdvancedFilters}
        >
          高级筛选
          <span className="toggle-icon">{showAdvancedFilters ? '▲' : '▼'}</span>
        </button>
        
        {showAdvancedFilters && Object.keys(attributesMap).length > 0 && (
          <div className="advanced-filters">
            <h4>属性筛选</h4>
            <div className="attributes-list">
              {Object.keys(attributesMap).map((key, index) => (
                <button
                  key={`attribute-${index}`}
                  className={`attribute-btn ${
                    filters.attributes && key in filters.attributes ? 'active' : ''
                  }`}
                  onClick={() => setActiveAttributeFilter(key)}
                >
                  <span className="attribute-name">{key}</span>
                  {filters.attributes && key in filters.attributes && (
                    <span className="attribute-value">{filters.attributes[key]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 筛选操作按钮 */}
      <div className="filter-actions">
        <button
          className="reset-filters-btn"
          onClick={handleResetFilters}
        >
          重置筛选条件
        </button>
        
        {enableSavedFilters && (
          <button
            className="save-filters-btn"
            onClick={() => setShowSaveFilterModal(true)}
          >
            保存筛选条件
          </button>
        )}
      </div>
      
      {/* 模态框 */}
      {renderSaveFilterModal()}
      {renderAttributeFilterModal()}
    </div>
  );
};

NFTFilterPanel.propTypes = {
  nfts: PropTypes.array,
  onFilterChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  enableMultiSelect: PropTypes.bool,
  enableSavedFilters: PropTypes.bool,
  currentAccount: PropTypes.string
};

export default NFTFilterPanel;
