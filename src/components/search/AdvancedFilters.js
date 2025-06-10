import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './AdvancedFilters.css';

/**
 * 高级筛选器组件
 * 支持多维度筛选、筛选预设、实时预览等功能
 */
const AdvancedFilters = ({ 
  onFiltersChange, 
  onFiltersApply,
  initialFilters = {},
  className = ""
}) => {
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
    rarity: [],
    status: [],
    creators: [],
    collections: [],
    sortBy: 'newest',
    ...initialFilters
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filterPresets, setFilterPresets] = useLocalStorage('nft-filter-presets', []);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 筛选选项配置
  const filterOptions = {
    categories: [
      { id: 'visual-art', name: '视觉艺术', icon: '🎨', count: 1234 },
      { id: 'sculpture', name: '雕塑', icon: '🗿', count: 567 },
      { id: 'photography', name: '摄影', icon: '📸', count: 890 },
      { id: 'music', name: '音乐', icon: '🎵', count: 456 },
      { id: 'literature', name: '文学', icon: '📚', count: 234 },
      { id: 'digital-art', name: '数字艺术', icon: '💻', count: 2345 },
      { id: 'gaming', name: '游戏', icon: '🎮', count: 678 },
      { id: 'metaverse', name: '元宇宙', icon: '🌐', count: 345 }
    ],
    rarity: [
      { id: 'common', name: '普通', percentage: 60, color: '#a0aec0' },
      { id: 'rare', name: '稀有', percentage: 25, color: '#38b2ac' },
      { id: 'epic', name: '史诗', percentage: 10, color: '#805ad5' },
      { id: 'legendary', name: '传说', percentage: 5, color: '#d69e2e' }
    ],
    status: [
      { id: 'for-sale', name: '在售', icon: '💰' },
      { id: 'auction', name: '拍卖', icon: '🔨' },
      { id: 'new', name: '新品', icon: '✨' },
      { id: 'trending', name: '热门', icon: '🔥' },
      { id: 'verified', name: '已验证', icon: '✅' }
    ],
    sortOptions: [
      { id: 'newest', name: '最新上架', icon: '🕒' },
      { id: 'oldest', name: '最早上架', icon: '📅' },
      { id: 'price-low', name: '价格从低到高', icon: '📈' },
      { id: 'price-high', name: '价格从高到低', icon: '📉' },
      { id: 'popular', name: '最受欢迎', icon: '❤️' },
      { id: 'trending', name: '趋势上升', icon: '🚀' }
    ]
  };

  // 价格预设选项
  const pricePresets = [
    { label: '< 0.1 ETH', range: [0, 0.1] },
    { label: '0.1 - 1 ETH', range: [0.1, 1] },
    { label: '1 - 10 ETH', range: [1, 10] },
    { label: '10 - 100 ETH', range: [10, 100] },
    { label: '> 100 ETH', range: [100, 1000] }
  ];

  // 模拟获取筛选结果数量
  const fetchResultsCount = useCallback(async (currentFilters) => {
    setIsLoading(true);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 模拟计算结果数量
    let count = 5000;
    
    if (currentFilters.categories.length > 0) {
      count = Math.floor(count * 0.7);
    }
    
    if (currentFilters.rarity.length > 0) {
      count = Math.floor(count * 0.5);
    }
    
    if (currentFilters.status.length > 0) {
      count = Math.floor(count * 0.6);
    }
    
    const [minPrice, maxPrice] = currentFilters.priceRange;
    if (minPrice > 0 || maxPrice < 1000) {
      count = Math.floor(count * 0.4);
    }
    
    setResultsCount(Math.max(0, count + Math.floor(Math.random() * 100)));
    setIsLoading(false);
  }, []);

  // 处理筛选变化
  useEffect(() => {
    fetchResultsCount(filters);
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, fetchResultsCount, onFiltersChange]);

  // 更新筛选器
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 处理分类筛选
  const handleCategoryToggle = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    updateFilter('categories', newCategories);
  };

  // 处理稀有度筛选
  const handleRarityToggle = (rarityId) => {
    const newRarity = filters.rarity.includes(rarityId)
      ? filters.rarity.filter(id => id !== rarityId)
      : [...filters.rarity, rarityId];
    
    updateFilter('rarity', newRarity);
  };

  // 处理状态筛选
  const handleStatusToggle = (statusId) => {
    const newStatus = filters.status.includes(statusId)
      ? filters.status.filter(id => id !== statusId)
      : [...filters.status, statusId];
    
    updateFilter('status', newStatus);
  };

  // 处理价格范围变化
  const handlePriceRangeChange = (newRange) => {
    updateFilter('priceRange', newRange);
  };

  // 处理价格预设选择
  const handlePricePresetSelect = (preset) => {
    updateFilter('priceRange', preset.range);
  };

  // 处理排序变化
  const handleSortChange = (sortBy) => {
    updateFilter('sortBy', sortBy);
  };

  // 重置筛选器
  const handleResetFilters = () => {
    const resetFilters = {
      categories: [],
      priceRange: [0, 1000],
      rarity: [],
      status: [],
      creators: [],
      collections: [],
      sortBy: 'newest'
    };
    setFilters(resetFilters);
  };

  // 保存筛选预设
  const handleSavePreset = () => {
    const presetName = prompt('请输入预设名称:');
    if (presetName && presetName.trim()) {
      const newPreset = {
        id: Date.now().toString(),
        name: presetName.trim(),
        filters: { ...filters },
        createdAt: new Date().toISOString()
      };
      
      setFilterPresets(prev => [...prev, newPreset]);
    }
  };

  // 应用筛选预设
  const handleApplyPreset = (preset) => {
    setFilters(preset.filters);
  };

  // 删除筛选预设
  const handleDeletePreset = (presetId) => {
    setFilterPresets(prev => prev.filter(p => p.id !== presetId));
  };

  // 应用筛选
  const handleApplyFilters = () => {
    if (onFiltersApply) {
      onFiltersApply(filters);
    }
  };

  return (
    <div className={`advanced-filters ${className}`}>
      <div className="filters-header">
        <div className="filters-title">
          <span className="filters-icon">🔧</span>
          高级筛选
        </div>
        <div className="filters-actions">
          {filterPresets.length > 0 && (
            <div className="filter-presets-dropdown">
              <button className="filter-preset-button">
                预设筛选 ▼
              </button>
              <div className="presets-menu">
                {filterPresets.map(preset => (
                  <div key={preset.id} className="preset-item">
                    <span 
                      className="preset-name"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      {preset.name}
                    </span>
                    <button
                      className="delete-preset-button"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button 
            className="save-filter-button"
            onClick={handleSavePreset}
          >
            保存预设
          </button>
          <button 
            className="reset-filters-button"
            onClick={handleResetFilters}
          >
            重置
          </button>
        </div>
      </div>

      <div className="filters-content">
        <div className="filter-groups">
          {/* 分类筛选 */}
          <div className="filter-group">
            <div className="filter-group-title">
              <span className="filter-group-icon">🎨</span>
              分类
            </div>
            <div className="category-filter">
              {filterOptions.categories.map(category => (
                <div
                  key={category.id}
                  className={`category-option ${
                    filters.categories.includes(category.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <div className={`category-checkbox ${
                    filters.categories.includes(category.id) ? 'checked' : ''
                  }`} />
                  <div className="category-info">
                    <div className="category-name">{category.name}</div>
                    <div className="category-count">
                      {category.count.toLocaleString()} 个NFT
                    </div>
                  </div>
                  <span className="category-icon">{category.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 价格范围筛选 */}
          <div className="filter-group">
            <div className="filter-group-title">
              <span className="filter-group-icon">💰</span>
              价格范围
            </div>
            <div className="price-range-filter">
              <div className="price-range-inputs">
                <input
                  type="number"
                  className="price-input"
                  placeholder="最低价"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceRangeChange([
                    parseFloat(e.target.value) || 0,
                    filters.priceRange[1]
                  ])}
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  className="price-input"
                  placeholder="最高价"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange([
                    filters.priceRange[0],
                    parseFloat(e.target.value) || 1000
                  ])}
                />
              </div>
              
              <div className="price-presets">
                {pricePresets.map((preset, index) => (
                  <button
                    key={index}
                    className={`price-preset ${
                      filters.priceRange[0] === preset.range[0] &&
                      filters.priceRange[1] === preset.range[1] ? 'selected' : ''
                    }`}
                    onClick={() => handlePricePresetSelect(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 稀有度筛选 */}
          <div className="filter-group">
            <div className="filter-group-title">
              <span className="filter-group-icon">💎</span>
              稀有度
            </div>
            <div className="rarity-filter">
              {filterOptions.rarity.map(rarity => (
                <div
                  key={rarity.id}
                  className={`rarity-option ${
                    filters.rarity.includes(rarity.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleRarityToggle(rarity.id)}
                >
                  <div 
                    className={`rarity-badge ${rarity.id}`}
                    style={{ backgroundColor: rarity.color }}
                  >
                    {rarity.name}
                  </div>
                  <div className="rarity-info">
                    <div className="rarity-name">{rarity.name}</div>
                    <div className="rarity-percentage">
                      {rarity.percentage}% 的NFT
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 状态筛选 */}
          <div className="filter-group">
            <div className="filter-group-title">
              <span className="filter-group-icon">📊</span>
              状态
            </div>
            <div className="status-filter">
              {filterOptions.status.map(status => (
                <button
                  key={status.id}
                  className={`status-toggle ${
                    filters.status.includes(status.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleStatusToggle(status.id)}
                >
                  <span className="status-icon">{status.icon}</span>
                  {status.name}
                </button>
              ))}
            </div>
          </div>

          {/* 排序选项 */}
          <div className="filter-group">
            <div className="filter-group-title">
              <span className="filter-group-icon">🔄</span>
              排序方式
            </div>
            <div className="sort-options">
              {filterOptions.sortOptions.map(option => (
                <button
                  key={option.id}
                  className={`sort-option ${
                    filters.sortBy === option.id ? 'selected' : ''
                  }`}
                  onClick={() => handleSortChange(option.id)}
                >
                  <span className="sort-icon">{option.icon}</span>
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 筛选结果预览 */}
      <div className="filter-results-preview">
        <div className="results-count">
          {isLoading ? (
            <span>计算中...</span>
          ) : (
            <span>
              找到 <span className="results-count-number">
                {resultsCount.toLocaleString()}
              </span> 个NFT
            </span>
          )}
        </div>
        <button
          className="apply-filters-button"
          onClick={handleApplyFilters}
          disabled={isLoading}
        >
          应用筛选
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilters;

