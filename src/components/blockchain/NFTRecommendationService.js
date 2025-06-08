/**
 * NFT推荐服务
 * 提供基于用户行为和偏好的NFT推荐功能
 */
class NFTRecommendationService {
  /**
   * 初始化推荐服务
   * @param {Object} options - 配置选项
   * @param {number} options.maxRecommendations - 最大推荐数量
   * @param {boolean} options.enablePersonalization - 是否启用个性化推荐
   * @param {number} options.similarityThreshold - 相似度阈值(0-1)
   * @param {number} options.maxHistoryItems - 最大历史记录数量
   */
  constructor(options = {}) {
    this.options = {
      maxRecommendations: options.maxRecommendations || 10,
      enablePersonalization: options.enablePersonalization !== undefined ? options.enablePersonalization : true,
      similarityThreshold: options.similarityThreshold || 0.3,
      maxHistoryItems: options.maxHistoryItems || 50
    };
    
    // 从本地存储加载用户行为数据
    this.viewHistory = this.loadViewHistory();
    this.favoriteItems = this.loadFavoriteItems();
    this.purchaseHistory = this.loadPurchaseHistory();
    
    // 用户偏好模型
    this.userPreferences = this.buildUserPreferenceModel();
  }
  
  /**
   * 从本地存储加载浏览历史
   * @returns {Array} 浏览历史数组
   */
  loadViewHistory() {
    try {
      const history = localStorage.getItem('nftViewHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('加载浏览历史失败:', error);
      return [];
    }
  }
  
  /**
   * 从本地存储加载收藏项目
   * @returns {Array} 收藏项目数组
   */
  loadFavoriteItems() {
    try {
      const favorites = localStorage.getItem('nftFavorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('加载收藏项目失败:', error);
      return [];
    }
  }
  
  /**
   * 从本地存储加载购买历史
   * @returns {Array} 购买历史数组
   */
  loadPurchaseHistory() {
    try {
      const history = localStorage.getItem('nftPurchaseHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('加载购买历史失败:', error);
      return [];
    }
  }
  
  /**
   * 保存浏览历史到本地存储
   */
  saveViewHistory() {
    try {
      localStorage.setItem('nftViewHistory', JSON.stringify(this.viewHistory));
    } catch (error) {
      console.error('保存浏览历史失败:', error);
    }
  }
  
  /**
   * 记录NFT浏览
   * @param {Object} nft - NFT对象
   */
  recordView(nft) {
    if (!nft || !nft.id) return;
    
    // 检查是否已存在
    const existingIndex = this.viewHistory.findIndex(item => item.id === nft.id);
    
    if (existingIndex !== -1) {
      // 更新现有记录
      this.viewHistory[existingIndex].count += 1;
      this.viewHistory[existingIndex].lastViewed = Date.now();
    } else {
      // 添加新记录
      this.viewHistory.push({
        id: nft.id,
        count: 1,
        lastViewed: Date.now(),
        category: nft.category,
        creator: nft.creator,
        price: nft.price,
        rarity: nft.rarity,
        attributes: nft.attributes
      });
    }
    
    // 限制历史记录数量
    if (this.viewHistory.length > this.options.maxHistoryItems) {
      this.viewHistory.sort((a, b) => b.lastViewed - a.lastViewed);
      this.viewHistory = this.viewHistory.slice(0, this.options.maxHistoryItems);
    }
    
    // 保存到本地存储
    this.saveViewHistory();
    
    // 更新用户偏好模型
    this.userPreferences = this.buildUserPreferenceModel();
  }
  
  /**
   * 构建用户偏好模型
   * @returns {Object} 用户偏好模型
   */
  buildUserPreferenceModel() {
    const preferences = {
      categories: {},
      creators: {},
      priceRanges: {
        low: 0,
        medium: 0,
        high: 0
      },
      rarities: {},
      attributes: {}
    };
    
    // 处理浏览历史
    this.viewHistory.forEach(item => {
      // 类别偏好
      if (item.category) {
        preferences.categories[item.category] = (preferences.categories[item.category] || 0) + item.count * 1;
      }
      
      // 创作者偏好
      if (item.creator) {
        preferences.creators[item.creator] = (preferences.creators[item.creator] || 0) + item.count * 1;
      }
      
      // 价格范围偏好
      const price = parseFloat(item.price);
      if (!isNaN(price)) {
        if (price < 0.1) {
          preferences.priceRanges.low += item.count * 1;
        } else if (price < 1) {
          preferences.priceRanges.medium += item.count * 1;
        } else {
          preferences.priceRanges.high += item.count * 1;
        }
      }
      
      // 稀有度偏好
      if (item.rarity) {
        preferences.rarities[item.rarity] = (preferences.rarities[item.rarity] || 0) + item.count * 1;
      }
      
      // 属性偏好
      if (item.attributes && Array.isArray(item.attributes)) {
        item.attributes.forEach(attr => {
          if (attr.trait_type && attr.value) {
            if (!preferences.attributes[attr.trait_type]) {
              preferences.attributes[attr.trait_type] = {};
            }
            
            preferences.attributes[attr.trait_type][attr.value] = 
              (preferences.attributes[attr.trait_type][attr.value] || 0) + item.count * 1;
          }
        });
      }
    });
    
    // 处理收藏项目
    this.favoriteItems.forEach(id => {
      const item = this.viewHistory.find(view => view.id === id);
      if (item) {
        // 类别偏好
        if (item.category) {
          preferences.categories[item.category] = (preferences.categories[item.category] || 0) + 3;
        }
        
        // 创作者偏好
        if (item.creator) {
          preferences.creators[item.creator] = (preferences.creators[item.creator] || 0) + 3;
        }
        
        // 价格范围偏好
        const price = parseFloat(item.price);
        if (!isNaN(price)) {
          if (price < 0.1) {
            preferences.priceRanges.low += 3;
          } else if (price < 1) {
            preferences.priceRanges.medium += 3;
          } else {
            preferences.priceRanges.high += 3;
          }
        }
        
        // 稀有度偏好
        if (item.rarity) {
          preferences.rarities[item.rarity] = (preferences.rarities[item.rarity] || 0) + 3;
        }
        
        // 属性偏好
        if (item.attributes && Array.isArray(item.attributes)) {
          item.attributes.forEach(attr => {
            if (attr.trait_type && attr.value) {
              if (!preferences.attributes[attr.trait_type]) {
                preferences.attributes[attr.trait_type] = {};
              }
              
              preferences.attributes[attr.trait_type][attr.value] = 
                (preferences.attributes[attr.trait_type][attr.value] || 0) + 3;
            }
          });
        }
      }
    });
    
    // 处理购买历史
    this.purchaseHistory.forEach(id => {
      const item = this.viewHistory.find(view => view.id === id);
      if (item) {
        // 类别偏好
        if (item.category) {
          preferences.categories[item.category] = (preferences.categories[item.category] || 0) + 5;
        }
        
        // 创作者偏好
        if (item.creator) {
          preferences.creators[item.creator] = (preferences.creators[item.creator] || 0) + 5;
        }
        
        // 价格范围偏好
        const price = parseFloat(item.price);
        if (!isNaN(price)) {
          if (price < 0.1) {
            preferences.priceRanges.low += 5;
          } else if (price < 1) {
            preferences.priceRanges.medium += 5;
          } else {
            preferences.priceRanges.high += 5;
          }
        }
        
        // 稀有度偏好
        if (item.rarity) {
          preferences.rarities[item.rarity] = (preferences.rarities[item.rarity] || 0) + 5;
        }
        
        // 属性偏好
        if (item.attributes && Array.isArray(item.attributes)) {
          item.attributes.forEach(attr => {
            if (attr.trait_type && attr.value) {
              if (!preferences.attributes[attr.trait_type]) {
                preferences.attributes[attr.trait_type] = {};
              }
              
              preferences.attributes[attr.trait_type][attr.value] = 
                (preferences.attributes[attr.trait_type][attr.value] || 0) + 5;
            }
          });
        }
      }
    });
    
    return preferences;
  }
  
  /**
   * 计算NFT与用户偏好的匹配度
   * @param {Object} nft - NFT对象
   * @returns {number} 匹配度分数(0-1)
   */
  calculateMatchScore(nft) {
    if (!nft || !this.options.enablePersonalization) {
      return 0;
    }
    
    let score = 0;
    let maxScore = 0;
    
    // 类别匹配
    if (nft.category && this.userPreferences.categories[nft.category]) {
      const categoryScore = this.userPreferences.categories[nft.category];
      const maxCategoryScore = Math.max(...Object.values(this.userPreferences.categories));
      if (maxCategoryScore > 0) {
        score += (categoryScore / maxCategoryScore) * 0.3;
        maxScore += 0.3;
      }
    }
    
    // 创作者匹配
    if (nft.creator && this.userPreferences.creators[nft.creator]) {
      const creatorScore = this.userPreferences.creators[nft.creator];
      const maxCreatorScore = Math.max(...Object.values(this.userPreferences.creators));
      if (maxCreatorScore > 0) {
        score += (creatorScore / maxCreatorScore) * 0.2;
        maxScore += 0.2;
      }
    }
    
    // 价格范围匹配
    const price = parseFloat(nft.price);
    if (!isNaN(price)) {
      let priceRangeScore = 0;
      if (price < 0.1 && this.userPreferences.priceRanges.low > 0) {
        priceRangeScore = this.userPreferences.priceRanges.low;
      } else if (price < 1 && this.userPreferences.priceRanges.medium > 0) {
        priceRangeScore = this.userPreferences.priceRanges.medium;
      } else if (this.userPreferences.priceRanges.high > 0) {
        priceRangeScore = this.userPreferences.priceRanges.high;
      }
      
      const maxPriceRangeScore = Math.max(
        this.userPreferences.priceRanges.low,
        this.userPreferences.priceRanges.medium,
        this.userPreferences.priceRanges.high
      );
      
      if (maxPriceRangeScore > 0) {
        score += (priceRangeScore / maxPriceRangeScore) * 0.1;
        maxScore += 0.1;
      }
    }
    
    // 稀有度匹配
    if (nft.rarity && this.userPreferences.rarities[nft.rarity]) {
      const rarityScore = this.userPreferences.rarities[nft.rarity];
      const maxRarityScore = Math.max(...Object.values(this.userPreferences.rarities));
      if (maxRarityScore > 0) {
        score += (rarityScore / maxRarityScore) * 0.2;
        maxScore += 0.2;
      }
    }
    
    // 属性匹配
    if (nft.attributes && Array.isArray(nft.attributes)) {
      let attributeScore = 0;
      let attributeMaxScore = 0;
      
      nft.attributes.forEach(attr => {
        if (
          attr.trait_type && 
          attr.value && 
          this.userPreferences.attributes[attr.trait_type] && 
          this.userPreferences.attributes[attr.trait_type][attr.value]
        ) {
          const score = this.userPreferences.attributes[attr.trait_type][attr.value];
          const maxScore = Math.max(...Object.values(this.userPreferences.attributes[attr.trait_type]));
          if (maxScore > 0) {
            attributeScore += score / maxScore;
            attributeMaxScore += 1;
          }
        }
      });
      
      if (attributeMaxScore > 0) {
        score += (attributeScore / attributeMaxScore) * 0.2;
        maxScore += 0.2;
      }
    }
    
    // 归一化分数
    return maxScore > 0 ? score / maxScore : 0;
  }
  
  /**
   * 获取推荐的NFT
   * @param {Array} nfts - 所有NFT数组
   * @param {Object} currentNFT - 当前查看的NFT(可选)
   * @param {number} limit - 最大推荐数量
   * @returns {Array} 推荐的NFT数组
   */
  getRecommendations(nfts, currentNFT = null, limit = null) {
    if (!nfts || !Array.isArray(nfts) || nfts.length === 0) {
      return [];
    }
    
    const maxResults = limit || this.options.maxRecommendations;
    
    // 计算所有NFT的匹配分数
    const scoredNFTs = nfts.map(nft => ({
      ...nft,
      matchScore: this.calculateMatchScore(nft)
    }));
    
    // 如果有当前NFT，计算相似度
    if (currentNFT) {
      scoredNFTs.forEach(nft => {
        if (nft.id === currentNFT.id) {
          nft.similarityScore = 0; // 排除自身
        } else {
          nft.similarityScore = this.calculateSimilarity(currentNFT, nft);
        }
      });
      
      // 基于相似度和匹配分数排序
      scoredNFTs.sort((a, b) => {
        // 优先考虑相似度
        const similarityDiff = b.similarityScore - a.similarityScore;
        if (Math.abs(similarityDiff) > 0.2) {
          return similarityDiff;
        }
        // 其次考虑匹配分数
        return b.matchScore - a.matchScore;
      });
    } else {
      // 仅基于匹配分数排序
      scoredNFTs.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // 过滤掉当前NFT和已购买的NFT
    const filteredNFTs = scoredNFTs.filter(nft => 
      (!currentNFT || nft.id !== currentNFT.id) && 
      !this.purchaseHistory.includes(nft.id)
    );
    
    return filteredNFTs.slice(0, maxResults);
  }
  
  /**
   * 计算两个NFT之间的相似度
   * @param {Object} nft1 - 第一个NFT
   * @param {Object} nft2 - 第二个NFT
   * @returns {number} 相似度分数(0-1)
   */
  calculateSimilarity(nft1, nft2) {
    if (!nft1 || !nft2) {
      return 0;
    }
    
    let score = 0;
    let maxScore = 0;
    
    // 类别相似度
    if (nft1.category && nft2.category) {
      if (nft1.category === nft2.category) {
        score += 0.3;
      }
      maxScore += 0.3;
    }
    
    // 创作者相似度
    if (nft1.creator && nft2.creator) {
      if (nft1.creator === nft2.creator) {
        score += 0.2;
      }
      maxScore += 0.2;
    }
    
    // 价格范围相似度
    const price1 = parseFloat(nft1.price);
    const price2 = parseFloat(nft2.price);
    if (!isNaN(price1) && !isNaN(price2)) {
      const priceDiff = Math.abs(price1 - price2) / Math.max(price1, price2);
      score += (1 - priceDiff) * 0.1;
      maxScore += 0.1;
    }
    
    // 稀有度相似度
    if (nft1.rarity && nft2.rarity) {
      if (nft1.rarity === nft2.rarity) {
        score += 0.2;
      }
      maxScore += 0.2;
    }
    
    // 属性相似度
    if (nft1.attributes && Array.isArray(nft1.attributes) && nft2.attributes && Array.isArray(nft2.attributes)) {
      const attr1Map = {};
      nft1.attributes.forEach(attr => {
        if (attr.trait_type && attr.value) {
          attr1Map[attr.trait_type] = attr.value;
        }
      });
      
      let matchCount = 0;
      nft2.attributes.forEach(attr => {
        if (
          attr.trait_type && 
          attr.value && 
          attr1Map[attr.trait_type] === attr.value
        ) {
          matchCount++;
        }
      });
      
      const totalAttributes = Math.max(nft1.attributes.length, nft2.attributes.length);
      if (totalAttributes > 0) {
        score += (matchCount / totalAttributes) * 0.2;
      }
      maxScore += 0.2;
    }
    
    // 归一化分数
    return maxScore > 0 ? score / maxScore : 0;
  }
  
  /**
   * 获取"猜你喜欢"推荐
   * @param {Array} nfts - 所有NFT数组
   * @param {number} limit - 最大推荐数量
   * @returns {Array} 推荐的NFT数组
   */
  getYouMayLikeRecommendations(nfts, limit = null) {
    return this.getRecommendations(nfts, null, limit);
  }
  
  /**
   * 获取"类似NFT"推荐
   * @param {Array} nfts - 所有NFT数组
   * @param {Object} currentNFT - 当前查看的NFT
   * @param {number} limit - 最大推荐数量
   * @returns {Array} 推荐的NFT数组
   */
  getSimilarNFTs(nfts, currentNFT, limit = null) {
    if (!currentNFT) {
      return [];
    }
    
    return this.getRecommendations(nfts, currentNFT, limit);
  }
  
  /**
   * 获取"热门NFT"推荐
   * @param {Array} nfts - 所有NFT数组
   * @param {number} limit - 最大推荐数量
   * @returns {Array} 推荐的NFT数组
   */
  getTrendingNFTs(nfts, limit = null) {
    if (!nfts || !Array.isArray(nfts) || nfts.length === 0) {
      return [];
    }
    
    const maxResults = limit || this.options.maxRecommendations;
    
    // 基于浏览量和最近上架时间排序
    const sortedNFTs = [...nfts].sort((a, b) => {
      // 优先考虑浏览量
      const viewsDiff = (b.views || 0) - (a.views || 0);
      if (Math.abs(viewsDiff) > 5) {
        return viewsDiff;
      }
      
      // 其次考虑最近上架时间
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return sortedNFTs.slice(0, maxResults);
  }
  
  /**
   * 获取"新上架"推荐
   * @param {Array} nfts - 所有NFT数组
   * @param {number} limit - 最大推荐数量
   * @returns {Array} 推荐的NFT数组
   */
  getNewlyListedNFTs(nfts, limit = null) {
    if (!nfts || !Array.isArray(nfts) || nfts.length === 0) {
      return [];
    }
    
    const maxResults = limit || this.options.maxRecommendations;
    
    // 基于上架时间排序
    const sortedNFTs = [...nfts].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return sortedNFTs.slice(0, maxResults);
  }
  
  /**
   * 获取"即将结束"推荐
   * @param {Array} nfts - 所有NFT数组
   * @param {number} limit - 最大推荐数量
   * @returns {Array} 推荐的NFT数组
   */
  getEndingSoonNFTs(nfts, limit = null) {
    if (!nfts || !Array.isArray(nfts) || nfts.length === 0) {
      return [];
    }
    
    const maxResults = limit || this.options.maxRecommendations;
    const now = Date.now();
    
    // 筛选有结束时间且未结束的NFT
    const activeNFTs = nfts.filter(nft => 
      nft.endTime && new Date(nft.endTime) > now
    );
    
    // 基于结束时间排序
    const sortedNFTs = activeNFTs.sort((a, b) => 
      new Date(a.endTime) - new Date(b.endTime)
    );
    
    return sortedNFTs.slice(0, maxResults);
  }
}

export default NFTRecommendationService;
