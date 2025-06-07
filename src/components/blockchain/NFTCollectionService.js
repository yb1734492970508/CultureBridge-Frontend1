/**
 * NFT收藏夹服务
 * 提供收藏夹相关的API调用和本地存储管理
 */
class NFTCollectionService {
  /**
   * 获取用户的所有收藏夹
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 收藏夹列表
   */
  static async getUserCollections(userId) {
    try {
      // 优先从本地存储获取
      const localCollections = this.getLocalCollections();
      if (localCollections) {
        return localCollections;
      }
      
      // 如果本地没有，则从API获取
      // 实际项目中应替换为真实API调用
      // const response = await fetch(`/api/users/${userId}/collections`);
      // const data = await response.json();
      // return data.collections;
      
      // 模拟API返回数据
      const mockCollections = [
        { id: 'collection-1', name: '我喜欢的艺术品', count: 5 },
        { id: 'collection-2', name: '投资收藏', count: 3 },
        { id: 'collection-3', name: '稀有NFT', count: 2 }
      ];
      
      // 保存到本地存储
      this.saveLocalCollections(mockCollections);
      
      return mockCollections;
    } catch (error) {
      console.error('获取收藏夹失败:', error);
      return [];
    }
  }
  
  /**
   * 创建新收藏夹
   * @param {string} userId - 用户ID
   * @param {string} name - 收藏夹名称
   * @param {Array} nftIds - 初始NFT ID列表
   * @returns {Promise<Object>} - 新创建的收藏夹
   */
  static async createCollection(userId, name, nftIds = []) {
    try {
      // 实际项目中应替换为真实API调用
      // const response = await fetch(`/api/users/${userId}/collections`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, nftIds })
      // });
      // const data = await response.json();
      // return data.collection;
      
      // 模拟API返回数据
      const newCollection = {
        id: `collection-${Date.now()}`,
        name,
        count: nftIds.length,
        nftIds
      };
      
      // 更新本地存储
      const collections = this.getLocalCollections() || [];
      collections.push(newCollection);
      this.saveLocalCollections(collections);
      
      return newCollection;
    } catch (error) {
      console.error('创建收藏夹失败:', error);
      throw error;
    }
  }
  
  /**
   * 将NFT添加到收藏夹
   * @param {string} collectionId - 收藏夹ID
   * @param {Array} nftIds - NFT ID列表
   * @returns {Promise<Object>} - 更新后的收藏夹
   */
  static async addNFTsToCollection(collectionId, nftIds) {
    try {
      // 实际项目中应替换为真实API调用
      // const response = await fetch(`/api/collections/${collectionId}/nfts`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nftIds })
      // });
      // const data = await response.json();
      // return data.collection;
      
      // 更新本地存储
      const collections = this.getLocalCollections() || [];
      const collectionIndex = collections.findIndex(c => c.id === collectionId);
      
      if (collectionIndex === -1) {
        throw new Error('收藏夹不存在');
      }
      
      const collection = collections[collectionIndex];
      const existingNftIds = collection.nftIds || [];
      const uniqueNewIds = nftIds.filter(id => !existingNftIds.includes(id));
      
      collection.nftIds = [...existingNftIds, ...uniqueNewIds];
      collection.count = collection.nftIds.length;
      
      collections[collectionIndex] = collection;
      this.saveLocalCollections(collections);
      
      return collection;
    } catch (error) {
      console.error('添加NFT到收藏夹失败:', error);
      throw error;
    }
  }
  
  /**
   * 从收藏夹中移除NFT
   * @param {string} collectionId - 收藏夹ID
   * @param {Array} nftIds - NFT ID列表
   * @returns {Promise<Object>} - 更新后的收藏夹
   */
  static async removeNFTsFromCollection(collectionId, nftIds) {
    try {
      // 实际项目中应替换为真实API调用
      // const response = await fetch(`/api/collections/${collectionId}/nfts`, {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nftIds })
      // });
      // const data = await response.json();
      // return data.collection;
      
      // 更新本地存储
      const collections = this.getLocalCollections() || [];
      const collectionIndex = collections.findIndex(c => c.id === collectionId);
      
      if (collectionIndex === -1) {
        throw new Error('收藏夹不存在');
      }
      
      const collection = collections[collectionIndex];
      const existingNftIds = collection.nftIds || [];
      collection.nftIds = existingNftIds.filter(id => !nftIds.includes(id));
      collection.count = collection.nftIds.length;
      
      collections[collectionIndex] = collection;
      this.saveLocalCollections(collections);
      
      return collection;
    } catch (error) {
      console.error('从收藏夹移除NFT失败:', error);
      throw error;
    }
  }
  
  /**
   * 删除收藏夹
   * @param {string} collectionId - 收藏夹ID
   * @returns {Promise<boolean>} - 是否删除成功
   */
  static async deleteCollection(collectionId) {
    try {
      // 实际项目中应替换为真实API调用
      // await fetch(`/api/collections/${collectionId}`, {
      //   method: 'DELETE'
      // });
      
      // 更新本地存储
      const collections = this.getLocalCollections() || [];
      const updatedCollections = collections.filter(c => c.id !== collectionId);
      this.saveLocalCollections(updatedCollections);
      
      return true;
    } catch (error) {
      console.error('删除收藏夹失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取收藏夹详情
   * @param {string} collectionId - 收藏夹ID
   * @returns {Promise<Object>} - 收藏夹详情
   */
  static async getCollectionDetails(collectionId) {
    try {
      // 实际项目中应替换为真实API调用
      // const response = await fetch(`/api/collections/${collectionId}`);
      // const data = await response.json();
      // return data.collection;
      
      // 从本地存储获取
      const collections = this.getLocalCollections() || [];
      const collection = collections.find(c => c.id === collectionId);
      
      if (!collection) {
        throw new Error('收藏夹不存在');
      }
      
      return collection;
    } catch (error) {
      console.error('获取收藏夹详情失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取收藏夹中的NFT
   * @param {string} collectionId - 收藏夹ID
   * @returns {Promise<Array>} - NFT列表
   */
  static async getCollectionNFTs(collectionId) {
    try {
      // 实际项目中应替换为真实API调用
      // const response = await fetch(`/api/collections/${collectionId}/nfts`);
      // const data = await response.json();
      // return data.nfts;
      
      // 模拟API返回数据
      const collection = await this.getCollectionDetails(collectionId);
      const nftIds = collection.nftIds || [];
      
      // 实际项目中应根据ID获取NFT详情
      // 这里简单返回ID列表
      return nftIds;
    } catch (error) {
      console.error('获取收藏夹NFT失败:', error);
      return [];
    }
  }
  
  /**
   * 从本地存储获取收藏夹列表
   * @returns {Array|null} - 收藏夹列表
   */
  static getLocalCollections() {
    try {
      const collectionsJson = localStorage.getItem('nftCollections');
      return collectionsJson ? JSON.parse(collectionsJson) : null;
    } catch (error) {
      console.error('读取本地收藏夹失败:', error);
      return null;
    }
  }
  
  /**
   * 保存收藏夹列表到本地存储
   * @param {Array} collections - 收藏夹列表
   */
  static saveLocalCollections(collections) {
    try {
      localStorage.setItem('nftCollections', JSON.stringify(collections));
    } catch (error) {
      console.error('保存本地收藏夹失败:', error);
    }
  }
  
  /**
   * 获取NFT所属的收藏夹
   * @param {string} nftId - NFT ID
   * @returns {Promise<Array>} - 收藏夹列表
   */
  static async getNFTCollections(nftId) {
    try {
      const collections = this.getLocalCollections() || [];
      return collections.filter(collection => 
        collection.nftIds && collection.nftIds.includes(nftId)
      );
    } catch (error) {
      console.error('获取NFT所属收藏夹失败:', error);
      return [];
    }
  }
}

export default NFTCollectionService;
