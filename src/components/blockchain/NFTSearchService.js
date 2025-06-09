/**
 * NFT搜索服务
 * 提供增强的NFT搜索功能，包括搜索提示、历史记录和容错搜索
 */
class NFTSearchService {
  /**
   * 初始化搜索服务
   * @param {Object} options - 配置选项
   * @param {number} options.maxHistoryItems - 最大历史记录数量
   * @param {number} options.minSearchLength - 最小搜索长度触发提示
   * @param {boolean} options.enableFuzzySearch - 是否启用模糊搜索
   * @param {number} options.fuzzyThreshold - 模糊搜索阈值(0-1)
   */
  constructor(options = {}) {
    this.options = {
      maxHistoryItems: options.maxHistoryItems || 10,
      minSearchLength: options.minSearchLength || 2,
      enableFuzzySearch: options.enableFuzzySearch !== undefined ? options.enableFuzzySearch : true,
      fuzzyThreshold: options.fuzzyThreshold || 0.3
    };
    
    // 从本地存储加载搜索历史
    this.searchHistory = this.loadSearchHistory();
    
    // 搜索索引缓存
    this.searchIndex = null;
    
    // 常见NFT属性和类别，用于提示和自动补全
    this.commonTerms = [
      // 艺术类别
      '艺术', '绘画', '摄影', '雕塑', '动画', '插画', '像素艺术', '抽象艺术', '写实主义',
      // 收藏品类别
      '收藏品', '卡牌', '徽章', '虚拟物品', '游戏资产', '限量版',
      // 文化类别
      '文化遗产', '传统艺术', '民间艺术', '历史文物', '文化符号',
      // 音乐类别
      '音乐', '专辑', '单曲', '音乐视频', '演唱会',
      // 虚拟世界
      '虚拟世界', '虚拟土地', '虚拟建筑', '虚拟时装', '头像',
      // 稀有度
      '传奇', '史诗', '稀有', '普通', '限量', '独一无二',
      // 属性
      '3D', '动态', '交互式', '生成式', 'AI创作', '手工创作'
    ];
  }
  
  /**
   * 从本地存储加载搜索历史
   * @returns {Array} 搜索历史数组
   */
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('nftSearchHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('加载搜索历史失败:', error);
      return [];
    }
  }
  
  /**
   * 保存搜索历史到本地存储
   */
  saveSearchHistory() {
    try {
      localStorage.setItem('nftSearchHistory', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }
  
  /**
   * 添加搜索词到历史记录
   * @param {string} term - 搜索词
   */
  addToHistory(term) {
    if (!term || term.trim() === '') return;
    
    const trimmedTerm = term.trim();
    
    // 移除已存在的相同搜索词
    this.searchHistory = this.searchHistory.filter(item => item.toLowerCase() !== trimmedTerm.toLowerCase());
    
    // 添加到历史记录开头
    this.searchHistory.unshift(trimmedTerm);
    
    // 限制历史记录数量
    if (this.searchHistory.length > this.options.maxHistoryItems) {
      this.searchHistory = this.searchHistory.slice(0, this.options.maxHistoryItems);
    }
    
    // 保存到本地存储
    this.saveSearchHistory();
  }
  
  /**
   * 清除搜索历史
   */
  clearHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
  }
  
  /**
   * 获取搜索历史
   * @returns {Array} 搜索历史数组
   */
  getHistory() {
    return [...this.searchHistory];
  }
  
  /**
   * 删除特定搜索历史项
   * @param {string} term - 要删除的搜索词
   */
  removeFromHistory(term) {
    this.searchHistory = this.searchHistory.filter(item => item !== term);
    this.saveSearchHistory();
  }
  
  /**
   * 获取搜索提示
   * @param {string} query - 搜索查询
   * @param {Array} nfts - NFT数据数组
   * @param {number} limit - 最大提示数量
   * @returns {Array} 搜索提示数组
   */
  getSuggestions(query, nfts = [], limit = 5) {
    if (!query || query.length < this.options.minSearchLength) {
      return [];
    }
    
    const trimmedQuery = query.trim().toLowerCase();
    const suggestions = new Set();
    
    // 1. 添加匹配的历史记录
    this.searchHistory.forEach(term => {
      if (term.toLowerCase().includes(trimmedQuery) && suggestions.size < limit) {
        suggestions.add(term);
      }
    });
    
    // 2. 添加匹配的常用术语
    this.commonTerms.forEach(term => {
      if (term.toLowerCase().includes(trimmedQuery) && suggestions.size < limit) {
        suggestions.add(term);
      }
    });
    
    // 3. 从NFT数据中提取匹配项
    if (nfts && nfts.length > 0) {
      // 从NFT名称中提取
      nfts.forEach(nft => {
        if (nft.name && nft.name.toLowerCase().includes(trimmedQuery) && suggestions.size < limit) {
          suggestions.add(nft.name);
        }
        
        // 从创作者名称中提取
        if (nft.creator && nft.creator.toLowerCase().includes(trimmedQuery) && suggestions.size < limit) {
          suggestions.add(nft.creator);
        }
        
        // 从类别中提取
        if (nft.category && nft.category.toLowerCase().includes(trimmedQuery) && suggestions.size < limit) {
          suggestions.add(nft.category);
        }
        
        // 从标签中提取
        if (nft.tags && Array.isArray(nft.tags)) {
          nft.tags.forEach(tag => {
            if (tag.toLowerCase().includes(trimmedQuery) && suggestions.size < limit) {
              suggestions.add(tag);
            }
          });
        }
      });
    }
    
    return Array.from(suggestions).slice(0, limit);
  }
  
  /**
   * 计算两个字符串的相似度 (Levenshtein距离)
   * @param {string} a - 第一个字符串
   * @param {string} b - 第二个字符串
   * @returns {number} 相似度 (0-1)
   */
  stringSimilarity(a, b) {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;
    
    const matrix = [];
    
    // 初始化矩阵
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // 填充矩阵
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // 删除
          matrix[i][j - 1] + 1,      // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }
    
    // 计算相似度
    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    return 1 - distance / maxLength;
  }
  
  /**
   * 使用模糊搜索过滤NFT
   * @param {Array} nfts - NFT数据数组
   * @param {string} query - 搜索查询
   * @returns {Array} 过滤后的NFT数组
   */
  fuzzySearch(nfts, query) {
    if (!query || !nfts || !this.options.enableFuzzySearch) {
      return nfts;
    }
    
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery.length < this.options.minSearchLength) {
      return nfts;
    }
    
    return nfts.filter(nft => {
      // 检查名称相似度
      if (nft.name) {
        const nameSimilarity = this.stringSimilarity(nft.name.toLowerCase(), trimmedQuery);
        if (nameSimilarity >= this.options.fuzzyThreshold) {
          return true;
        }
      }
      
      // 检查描述相似度
      if (nft.description) {
        const descSimilarity = this.stringSimilarity(nft.description.toLowerCase(), trimmedQuery);
        if (descSimilarity >= this.options.fuzzyThreshold) {
          return true;
        }
      }
      
      // 检查创作者相似度
      if (nft.creator) {
        const creatorSimilarity = this.stringSimilarity(nft.creator.toLowerCase(), trimmedQuery);
        if (creatorSimilarity >= this.options.fuzzyThreshold) {
          return true;
        }
      }
      
      // 检查类别相似度
      if (nft.category) {
        const categorySimilarity = this.stringSimilarity(nft.category.toLowerCase(), trimmedQuery);
        if (categorySimilarity >= this.options.fuzzyThreshold) {
          return true;
        }
      }
      
      // 检查标签相似度
      if (nft.tags && Array.isArray(nft.tags)) {
        for (const tag of nft.tags) {
          const tagSimilarity = this.stringSimilarity(tag.toLowerCase(), trimmedQuery);
          if (tagSimilarity >= this.options.fuzzyThreshold) {
            return true;
          }
        }
      }
      
      return false;
    });
  }
  
  /**
   * 搜索NFT
   * @param {Array} nfts - NFT数据数组
   * @param {string} query - 搜索查询
   * @param {boolean} addToHistory - 是否添加到历史记录
   * @returns {Array} 搜索结果
   */
  search(nfts, query, addToHistory = true) {
    if (!query || !nfts) {
      return nfts;
    }
    
    const trimmedQuery = query.trim();
    if (trimmedQuery === '') {
      return nfts;
    }
    
    // 添加到历史记录
    if (addToHistory) {
      this.addToHistory(trimmedQuery);
    }
    
    // 如果启用了模糊搜索，使用模糊搜索
    if (this.options.enableFuzzySearch) {
      return this.fuzzySearch(nfts, trimmedQuery);
    }
    
    // 否则使用精确搜索
    const lowercaseQuery = trimmedQuery.toLowerCase();
    return nfts.filter(nft => 
      (nft.name && nft.name.toLowerCase().includes(lowercaseQuery)) ||
      (nft.description && nft.description.toLowerCase().includes(lowercaseQuery)) ||
      (nft.creator && nft.creator.toLowerCase().includes(lowercaseQuery)) ||
      (nft.category && nft.category.toLowerCase().includes(lowercaseQuery)) ||
      (nft.tags && Array.isArray(nft.tags) && nft.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }
  
  /**
   * 高亮搜索结果中的匹配文本
   * @param {string} text - 原始文本
   * @param {string} query - 搜索查询
   * @returns {string} 带有高亮标记的HTML
   */
  highlightText(text, query) {
    if (!text || !query) {
      return text;
    }
    
    const trimmedQuery = query.trim();
    if (trimmedQuery === '') {
      return text;
    }
    
    // 使用正则表达式进行不区分大小写的替换
    const regex = new RegExp(`(${trimmedQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

export default NFTSearchService;
