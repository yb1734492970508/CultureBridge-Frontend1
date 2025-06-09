/**
 * NFT筛选服务
 * 提供增强的NFT筛选功能，包括多选筛选、筛选条件保存和高级筛选
 */
class NFTFilterService {
  /**
   * 初始化筛选服务
   * @param {Object} options - 配置选项
   * @param {number} options.maxSavedFilters - 最大保存的筛选条件数量
   * @param {boolean} options.enableMultiSelect - 是否启用多选筛选
   * @param {boolean} options.rememberLastFilter - 是否记住上次筛选条件
   */
  constructor(options = {}) {
    this.options = {
      maxSavedFilters: options.maxSavedFilters || 5,
      enableMultiSelect: options.enableMultiSelect !== undefined ? options.enableMultiSelect : true,
      rememberLastFilter: options.rememberLastFilter !== undefined ? options.rememberLastFilter : true
    };
    
    // 默认筛选条件
    this.defaultFilters = {
      categories: [],
      priceRange: [0, 1000],
      sortBy: 'newest',
      onlyVerified: false,
      showOwned: false,
      rarity: [],
      creationDate: null,
      attributes: {}
    };
    
    // 当前筛选条件
    this.currentFilters = this.loadLastFilter() || { ...this.defaultFilters };
    
    // 保存的筛选条件
    this.savedFilters = this.loadSavedFilters();
  }
  
  /**
   * 从本地存储加载上次的筛选条件
   * @returns {Object|null} 筛选条件对象
   */
  loadLastFilter() {
    if (!this.options.rememberLastFilter) {
      return null;
    }
    
    try {
      const lastFilter = localStorage.getItem('nftLastFilter');
      return lastFilter ? JSON.parse(lastFilter) : null;
    } catch (error) {
      console.error('加载上次筛选条件失败:', error);
      return null;
    }
  }
  
  /**
   * 保存当前筛选条件到本地存储
   */
  saveLastFilter() {
    if (!this.options.rememberLastFilter) {
      return;
    }
    
    try {
      localStorage.setItem('nftLastFilter', JSON.stringify(this.currentFilters));
    } catch (error) {
      console.error('保存筛选条件失败:', error);
    }
  }
  
  /**
   * 从本地存储加载保存的筛选条件
   * @returns {Array} 保存的筛选条件数组
   */
  loadSavedFilters() {
    try {
      const savedFilters = localStorage.getItem('nftSavedFilters');
      return savedFilters ? JSON.parse(savedFilters) : [];
    } catch (error) {
      console.error('加载保存的筛选条件失败:', error);
      return [];
    }
  }
  
  /**
   * 保存筛选条件到本地存储
   */
  saveSavedFilters() {
    try {
      localStorage.setItem('nftSavedFilters', JSON.stringify(this.savedFilters));
    } catch (error) {
      console.error('保存筛选条件失败:', error);
    }
  }
  
  /**
   * 获取当前筛选条件
   * @returns {Object} 当前筛选条件
   */
  getCurrentFilters() {
    return { ...this.currentFilters };
  }
  
  /**
   * 设置当前筛选条件
   * @param {Object} filters - 筛选条件对象
   */
  setCurrentFilters(filters) {
    this.currentFilters = { ...filters };
    this.saveLastFilter();
  }
  
  /**
   * 更新特定筛选条件
   * @param {string} filterName - 筛选条件名称
   * @param {any} value - 筛选条件值
   */
  updateFilter(filterName, value) {
    if (filterName in this.currentFilters) {
      this.currentFilters[filterName] = value;
      this.saveLastFilter();
    }
  }
  
  /**
   * 重置筛选条件为默认值
   */
  resetFilters() {
    this.currentFilters = { ...this.defaultFilters };
    this.saveLastFilter();
  }
  
  /**
   * 保存当前筛选条件
   * @param {string} name - 筛选条件名称
   * @returns {boolean} 是否保存成功
   */
  saveFilter(name) {
    if (!name || name.trim() === '') {
      return false;
    }
    
    // 检查是否已存在同名筛选条件
    const existingIndex = this.savedFilters.findIndex(filter => filter.name === name);
    
    if (existingIndex !== -1) {
      // 更新已存在的筛选条件
      this.savedFilters[existingIndex] = {
        name,
        filters: { ...this.currentFilters },
        timestamp: Date.now()
      };
    } else {
      // 添加新的筛选条件
      this.savedFilters.push({
        name,
        filters: { ...this.currentFilters },
        timestamp: Date.now()
      });
      
      // 限制保存的筛选条件数量
      if (this.savedFilters.length > this.options.maxSavedFilters) {
        this.savedFilters.sort((a, b) => b.timestamp - a.timestamp);
        this.savedFilters = this.savedFilters.slice(0, this.options.maxSavedFilters);
      }
    }
    
    this.saveSavedFilters();
    return true;
  }
  
  /**
   * 删除保存的筛选条件
   * @param {string} name - 筛选条件名称
   * @returns {boolean} 是否删除成功
   */
  deleteFilter(name) {
    const initialLength = this.savedFilters.length;
    this.savedFilters = this.savedFilters.filter(filter => filter.name !== name);
    
    if (this.savedFilters.length !== initialLength) {
      this.saveSavedFilters();
      return true;
    }
    
    return false;
  }
  
  /**
   * 应用保存的筛选条件
   * @param {string} name - 筛选条件名称
   * @returns {boolean} 是否应用成功
   */
  applyFilter(name) {
    const filter = this.savedFilters.find(filter => filter.name === name);
    
    if (filter) {
      this.currentFilters = { ...filter.filters };
      this.saveLastFilter();
      return true;
    }
    
    return false;
  }
  
  /**
   * 获取保存的筛选条件列表
   * @returns {Array} 保存的筛选条件数组
   */
  getSavedFilters() {
    return [...this.savedFilters];
  }
  
  /**
   * 添加类别筛选
   * @param {string} category - 类别名称
   */
  addCategory(category) {
    if (!this.options.enableMultiSelect) {
      this.currentFilters.categories = [category];
    } else if (!this.currentFilters.categories.includes(category)) {
      this.currentFilters.categories.push(category);
    }
    
    this.saveLastFilter();
  }
  
  /**
   * 移除类别筛选
   * @param {string} category - 类别名称
   */
  removeCategory(category) {
    this.currentFilters.categories = this.currentFilters.categories.filter(c => c !== category);
    this.saveLastFilter();
  }
  
  /**
   * 切换类别筛选
   * @param {string} category - 类别名称
   */
  toggleCategory(category) {
    if (this.currentFilters.categories.includes(category)) {
      this.removeCategory(category);
    } else {
      this.addCategory(category);
    }
  }
  
  /**
   * 添加稀有度筛选
   * @param {string} rarity - 稀有度名称
   */
  addRarity(rarity) {
    if (!this.options.enableMultiSelect) {
      this.currentFilters.rarity = [rarity];
    } else if (!this.currentFilters.rarity.includes(rarity)) {
      this.currentFilters.rarity.push(rarity);
    }
    
    this.saveLastFilter();
  }
  
  /**
   * 移除稀有度筛选
   * @param {string} rarity - 稀有度名称
   */
  removeRarity(rarity) {
    this.currentFilters.rarity = this.currentFilters.rarity.filter(r => r !== rarity);
    this.saveLastFilter();
  }
  
  /**
   * 切换稀有度筛选
   * @param {string} rarity - 稀有度名称
   */
  toggleRarity(rarity) {
    if (this.currentFilters.rarity.includes(rarity)) {
      this.removeRarity(rarity);
    } else {
      this.addRarity(rarity);
    }
  }
  
  /**
   * 设置价格范围
   * @param {Array} range - [最小价格, 最大价格]
   */
  setPriceRange(range) {
    if (Array.isArray(range) && range.length === 2) {
      this.currentFilters.priceRange = range;
      this.saveLastFilter();
    }
  }
  
  /**
   * 设置创建日期筛选
   * @param {Object} dateRange - 日期范围对象 {start: Date, end: Date}
   */
  setCreationDate(dateRange) {
    this.currentFilters.creationDate = dateRange;
    this.saveLastFilter();
  }
  
  /**
   * 设置属性筛选
   * @param {string} key - 属性名
   * @param {any} value - 属性值
   */
  setAttribute(key, value) {
    if (!this.currentFilters.attributes) {
      this.currentFilters.attributes = {};
    }
    
    this.currentFilters.attributes[key] = value;
    this.saveLastFilter();
  }
  
  /**
   * 移除属性筛选
   * @param {string} key - 属性名
   */
  removeAttribute(key) {
    if (this.currentFilters.attributes && key in this.currentFilters.attributes) {
      delete this.currentFilters.attributes[key];
      this.saveLastFilter();
    }
  }
  
  /**
   * 应用筛选条件到NFT数组
   * @param {Array} nfts - NFT数据数组
   * @returns {Array} 筛选后的NFT数组
   */
  applyFilters(nfts) {
    if (!nfts || !Array.isArray(nfts)) {
      return [];
    }
    
    return nfts.filter(nft => {
      // 类别筛选
      if (this.currentFilters.categories.length > 0) {
        if (!nft.category || !this.currentFilters.categories.includes(nft.category)) {
          return false;
        }
      }
      
      // 价格范围筛选
      const price = parseFloat(nft.price);
      if (
        isNaN(price) || 
        price < this.currentFilters.priceRange[0] || 
        price > this.currentFilters.priceRange[1]
      ) {
        return false;
      }
      
      // 仅显示已验证筛选
      if (this.currentFilters.onlyVerified && !nft.isVerified) {
        return false;
      }
      
      // 仅显示拥有的NFT
      if (this.currentFilters.showOwned && nft.owner !== this.currentFilters.currentAccount) {
        return false;
      }
      
      // 稀有度筛选
      if (this.currentFilters.rarity.length > 0) {
        if (!nft.rarity || !this.currentFilters.rarity.includes(nft.rarity)) {
          return false;
        }
      }
      
      // 创建日期筛选
      if (this.currentFilters.creationDate) {
        const createdAt = new Date(nft.createdAt);
        if (
          !createdAt || 
          createdAt < this.currentFilters.creationDate.start || 
          createdAt > this.currentFilters.creationDate.end
        ) {
          return false;
        }
      }
      
      // 属性筛选
      if (this.currentFilters.attributes && Object.keys(this.currentFilters.attributes).length > 0) {
        if (!nft.attributes) {
          return false;
        }
        
        for (const [key, value] of Object.entries(this.currentFilters.attributes)) {
          const attribute = nft.attributes.find(attr => attr.trait_type === key);
          if (!attribute || attribute.value !== value) {
            return false;
          }
        }
      }
      
      return true;
    });
  }
  
  /**
   * 排序NFT数组
   * @param {Array} nfts - NFT数据数组
   * @returns {Array} 排序后的NFT数组
   */
  sortNFTs(nfts) {
    if (!nfts || !Array.isArray(nfts)) {
      return [];
    }
    
    const sortedNFTs = [...nfts];
    
    switch (this.currentFilters.sortBy) {
      case 'newest':
        sortedNFTs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sortedNFTs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priceAsc':
        sortedNFTs.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'priceDesc':
        sortedNFTs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'popular':
        sortedNFTs.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'nameAsc':
        sortedNFTs.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        sortedNFTs.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    
    return sortedNFTs;
  }
  
  /**
   * 提取NFT数据中的所有可用类别
   * @param {Array} nfts - NFT数据数组
   * @returns {Array} 类别数组
   */
  extractCategories(nfts) {
    if (!nfts || !Array.isArray(nfts)) {
      return [];
    }
    
    const categories = new Set();
    
    nfts.forEach(nft => {
      if (nft.category) {
        categories.add(nft.category);
      }
    });
    
    return Array.from(categories);
  }
  
  /**
   * 提取NFT数据中的所有可用稀有度
   * @param {Array} nfts - NFT数据数组
   * @returns {Array} 稀有度数组
   */
  extractRarities(nfts) {
    if (!nfts || !Array.isArray(nfts)) {
      return [];
    }
    
    const rarities = new Set();
    
    nfts.forEach(nft => {
      if (nft.rarity) {
        rarities.add(nft.rarity);
      }
    });
    
    return Array.from(rarities);
  }
  
  /**
   * 提取NFT数据中的价格范围
   * @param {Array} nfts - NFT数据数组
   * @returns {Array} [最小价格, 最大价格]
   */
  extractPriceRange(nfts) {
    if (!nfts || !Array.isArray(nfts) || nfts.length === 0) {
      return [0, 1000];
    }
    
    let min = Infinity;
    let max = -Infinity;
    
    nfts.forEach(nft => {
      const price = parseFloat(nft.price);
      if (!isNaN(price)) {
        min = Math.min(min, price);
        max = Math.max(max, price);
      }
    });
    
    if (min === Infinity || max === -Infinity) {
      return [0, 1000];
    }
    
    return [Math.floor(min), Math.ceil(max)];
  }
  
  /**
   * 提取NFT数据中的所有可用属性
   * @param {Array} nfts - NFT数据数组
   * @returns {Object} 属性映射 {属性名: [可能的值数组]}
   */
  extractAttributes(nfts) {
    if (!nfts || !Array.isArray(nfts)) {
      return {};
    }
    
    const attributesMap = {};
    
    nfts.forEach(nft => {
      if (nft.attributes && Array.isArray(nft.attributes)) {
        nft.attributes.forEach(attr => {
          if (attr.trait_type && attr.value) {
            if (!attributesMap[attr.trait_type]) {
              attributesMap[attr.trait_type] = new Set();
            }
            attributesMap[attr.trait_type].add(attr.value);
          }
        });
      }
    });
    
    // 转换Set为数组
    Object.keys(attributesMap).forEach(key => {
      attributesMap[key] = Array.from(attributesMap[key]);
    });
    
    return attributesMap;
  }
}

export default NFTFilterService;
