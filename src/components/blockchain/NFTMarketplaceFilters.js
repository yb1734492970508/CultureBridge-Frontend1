import React, { useState } from 'react';
import { ethers } from 'ethers';
import './NFTMarketplace.css';

/**
 * NFT市场筛选组件
 * 提供多维度筛选控件，支持按文化类别、价格范围、创作者等筛选
 */
const NFTMarketplaceFilters = ({ filters, onFilterChange, onSearch }) => {
  // 本地状态管理
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange.min,
    max: filters.priceRange.max
  });

  // 处理搜索提交
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // 处理价格范围变更
  const handlePriceRangeChange = (e, type) => {
    const value = parseFloat(e.target.value);
    setPriceRange(prev => ({
      ...prev,
      [type]: isNaN(value) ? 0 : value
    }));
  };

  // 应用价格范围筛选
  const applyPriceRange = () => {
    onFilterChange({ priceRange });
  };

  // 切换筛选面板展开/折叠状态
  const toggleFilters = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // 文化类别选项
  const categories = [
    { id: 'all', name: '所有类别' },
    { id: 'visual-art', name: '视觉艺术' },
    { id: 'sculpture', name: '雕塑' },
    { id: 'photography', name: '摄影' },
    { id: 'music', name: '音乐' },
    { id: 'literature', name: '文学' },
    { id: 'performance', name: '表演艺术' },
    { id: 'traditional-craft', name: '传统工艺' }
  ];

  // 销售类型选项
  const saleTypes = [
    { id: 'all', name: '所有类型' },
    { id: 'fixed', name: '固定价格' },
    { id: 'auction', name: '拍卖' }
  ];

  return (
    <div className="nft-marketplace-filters">
      {/* 搜索栏 */}
      <div className="search-bar">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="搜索NFT名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            搜索
          </button>
        </form>
      </div>

      {/* 移动端筛选器切换按钮 */}
      <div className="mobile-filter-toggle">
        <button onClick={toggleFilters} className="filter-toggle-button">
          {isFilterExpanded ? '隐藏筛选' : '显示筛选'} 
          <span className={`toggle-icon ${isFilterExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
      </div>

      {/* 筛选面板 */}
      <div className={`filters-panel ${isFilterExpanded ? 'expanded' : ''}`}>
        {/* 类别筛选 */}
        <div className="filter-section">
          <h3 className="filter-title">文化类别</h3>
          <div className="category-filters">
            {categories.map(category => (
              <label key={category.id} className="category-option">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={filters.category === category.id}
                  onChange={() => onFilterChange({ category: category.id })}
                />
                <span className="category-name">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 价格范围筛选 */}
        <div className="filter-section">
          <h3 className="filter-title">价格范围 (ETH)</h3>
          <div className="price-range-inputs">
            <div className="price-input-group">
              <label>最低价</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceRange.min}
                onChange={(e) => handlePriceRangeChange(e, 'min')}
                className="price-input"
              />
            </div>
            <div className="price-input-group">
              <label>最高价</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceRange.max}
                onChange={(e) => handlePriceRangeChange(e, 'max')}
                className="price-input"
              />
            </div>
            <button 
              onClick={applyPriceRange}
              className="apply-price-button"
            >
              应用
            </button>
          </div>
        </div>

        {/* 销售类型筛选 */}
        <div className="filter-section">
          <h3 className="filter-title">销售类型</h3>
          <div className="sale-type-filters">
            {saleTypes.map(type => (
              <label key={type.id} className="sale-type-option">
                <input
                  type="radio"
                  name="saleType"
                  value={type.id}
                  checked={filters.saleType === type.id}
                  onChange={() => onFilterChange({ saleType: type.id })}
                />
                <span className="sale-type-name">{type.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 创作者筛选 */}
        <div className="filter-section">
          <h3 className="filter-title">创作者</h3>
          <input
            type="text"
            placeholder="输入创作者名称..."
            value={filters.creator}
            onChange={(e) => onFilterChange({ creator: e.target.value })}
            className="creator-input"
          />
        </div>

        {/* 重置筛选按钮 */}
        <div className="filter-actions">
          <button
            className="reset-filters-button"
            onClick={() => onFilterChange({
              category: 'all',
              priceRange: { min: 0, max: 0 },
              saleType: 'all',
              creator: '',
              searchQuery: ''
            })}
          >
            重置所有筛选
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketplaceFilters;
