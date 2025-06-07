/**
 * 本地合约与前端集成工具
 * 用于连接本地Hardhat网络部署的智能合约与前端应用
 */

import { ethers } from 'ethers';
import contracts from '../config/contracts';
import CultureTokenABI from '../contracts/abis/CultureToken.json';
import AIRegistryABI from '../contracts/abis/AIRegistry.json';
import CulturalNFTABI from '../contracts/abis/CulturalNFT.json';
import TranslationMarketABI from '../contracts/abis/TranslationMarket.json';

/**
 * 区块链连接工具类
 * 提供与本地Hardhat网络交互的方法
 */
class BlockchainConnector {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.networkId = null;
    this.isLocalNetwork = false;
    
    // 合约实例
    this.cultureToken = null;
    this.aiRegistry = null;
    this.culturalNFT = null;
    this.translationMarket = null;
    
    // 事件监听器
    this.eventListeners = {
      accountsChanged: [],
      chainChanged: [],
      connect: [],
      disconnect: []
    };
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化区块链连接
   */
  async init() {
    try {
      // 检查是否有MetaMask
      if (window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // 获取网络ID
        const network = await this.provider.getNetwork();
        this.networkId = network.chainId;
        
        // 判断是否是本地网络
        this.isLocalNetwork = network.chainId === 31337;
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
          this.handleAccountsChanged(accounts);
          this.eventListeners.accountsChanged.forEach(listener => listener(accounts));
        });
        
        // 监听网络变化
        window.ethereum.on('chainChanged', (chainId) => {
          this.eventListeners.chainChanged.forEach(listener => listener(chainId));
        });
        
        // 尝试获取已连接的账户
        const accounts = await this.provider.listAccounts();
        if (accounts.length > 0) {
          await this.handleAccountsChanged(accounts);
          this.eventListeners.connect.forEach(listener => listener(accounts[0]));
        }
      }
    } catch (error) {
      console.error('初始化区块链连接失败:', error);
      throw new Error('初始化区块链连接失败');
    }
  }
  
  /**
   * 处理账户变化
   * @param {Array} accounts 账户数组
   */
  async handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // 用户断开了连接
      this.account = null;
      this.signer = null;
      this.resetContractInstances();
      this.eventListeners.disconnect.forEach(listener => listener());
    } else {
      // 用户切换了账户
      this.account = accounts[0];
      
      if (this.provider) {
        this.signer = this.provider.getSigner();
        
        // 初始化合约实例
        await this.initContractInstances();
      }
    }
  }
  
  /**
   * 连接钱包
   */
  async connectWallet() {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await this.handleAccountsChanged(accounts);
        this.eventListeners.connect.forEach(listener => listener(accounts[0]));
        return accounts[0];
      } else {
        throw new Error('请安装MetaMask钱包');
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  }
  
  /**
   * 初始化合约实例
   */
  async initContractInstances() {
    try {
      // 获取当前网络的合约地址
      const networkKey = this.isLocalNetwork ? 'hardhat' : 'bscTestnet';
      const contractAddresses = contracts[networkKey];
      
      // 初始化合约实例
      if (contractAddresses.CultureToken) {
        this.cultureToken = new ethers.Contract(
          contractAddresses.CultureToken,
          CultureTokenABI.abi,
          this.signer
        );
      }
      
      if (contractAddresses.AIRegistry) {
        this.aiRegistry = new ethers.Contract(
          contractAddresses.AIRegistry,
          AIRegistryABI.abi,
          this.signer
        );
      }
      
      if (contractAddresses.CulturalNFT) {
        this.culturalNFT = new ethers.Contract(
          contractAddresses.CulturalNFT,
          CulturalNFTABI.abi,
          this.signer
        );
      }
      
      if (contractAddresses.TranslationMarket) {
        this.translationMarket = new ethers.Contract(
          contractAddresses.TranslationMarket,
          TranslationMarketABI.abi,
          this.signer
        );
      }
    } catch (error) {
      console.error('初始化合约实例失败:', error);
      throw new Error('初始化合约实例失败');
    }
  }
  
  /**
   * 重置合约实例
   */
  resetContractInstances() {
    this.cultureToken = null;
    this.aiRegistry = null;
    this.culturalNFT = null;
    this.translationMarket = null;
  }
  
  /**
   * 添加事件监听器
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   */
  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }
  
  /**
   * 移除事件监听器
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   */
  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        listener => listener !== callback
      );
    }
  }
  
  /**
   * 获取代币余额
   * @param {string} address 地址
   * @returns {Promise<string>} 余额
   */
  async getTokenBalance(address) {
    try {
      if (!this.cultureToken) {
        throw new Error('CultureToken合约实例未初始化');
      }
      
      const balance = await this.cultureToken.balanceOf(address || this.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('获取代币余额失败:', error);
      throw error;
    }
  }
  
  /**
   * 创建翻译请求
   * @param {Object} requestData 请求数据
   * @returns {Promise<string>} 请求ID
   */
  async createTranslationRequest(requestData) {
    try {
      if (!this.translationMarket || !this.cultureToken) {
        throw new Error('合约实例未初始化');
      }
      
      const { contentHash, sourceLanguage, targetLanguage, reward, deadline, isAIAssisted } = requestData;
      
      // 验证参数
      if (!contentHash || !sourceLanguage || !targetLanguage || !reward || !deadline) {
        throw new Error('请填写所有必填字段');
      }
      
      // 将奖励金额转换为wei
      const rewardInWei = ethers.utils.parseEther(reward.toString());
      
      // 授权TranslationMarket合约使用代币
      const approveTx = await this.cultureToken.approve(this.translationMarket.address, rewardInWei);
      await approveTx.wait();
      
      // 创建翻译请求
      const tx = await this.translationMarket.createRequest(
        contentHash,
        sourceLanguage,
        targetLanguage,
        rewardInWei,
        deadline,
        isAIAssisted
      );
      
      const receipt = await tx.wait();
      
      // 从事件中获取请求ID
      const event = receipt.events.find(e => e.event === 'RequestCreated');
      return event ? event.args.requestId : null;
    } catch (error) {
      console.error('创建翻译请求失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取用户的翻译请求
   * @returns {Promise<Array>} 请求列表
   */
  async getUserTranslationRequests() {
    try {
      if (!this.translationMarket) {
        throw new Error('TranslationMarket合约实例未初始化');
      }
      
      // 获取用户请求ID列表
      const requestIds = await this.translationMarket.getUserRequests(this.account);
      
      // 获取请求详情
      const requests = [];
      for (const requestId of requestIds) {
        const request = await this.translationMarket.requests(requestId);
        requests.push({
          id: requestId,
          requester: request.requester,
          contentHash: request.contentHash,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage,
          reward: ethers.utils.formatEther(request.reward),
          deadline: new Date(request.deadline.toNumber() * 1000).toISOString(),
          translator: request.translator,
          translationHash: request.translationHash,
          status: this.getRequestStatusString(request.status),
          createdAt: new Date(request.createdAt.toNumber() * 1000).toISOString(),
          completedAt: request.completedAt.toNumber() > 0 
            ? new Date(request.completedAt.toNumber() * 1000).toISOString() 
            : null,
          quality: request.quality,
          isAIAssisted: request.isAIAssisted
        });
      }
      
      return requests;
    } catch (error) {
      console.error('获取用户翻译请求失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取请求状态字符串
   * @param {number} statusCode 状态码
   * @returns {string} 状态字符串
   */
  getRequestStatusString(statusCode) {
    const statusMap = {
      0: 'Created',
      1: 'Assigned',
      2: 'Completed',
      3: 'Verified',
      4: 'Disputed',
      5: 'Cancelled'
    };
    
    return statusMap[statusCode] || 'Unknown';
  }
  
  /**
   * 获取用户的NFT
   * @returns {Promise<Array>} NFT列表
   */
  async getUserNFTs() {
    try {
      if (!this.culturalNFT) {
        throw new Error('CulturalNFT合约实例未初始化');
      }
      
      // 获取用户拥有的NFT ID列表
      // 注意：这里需要根据实际合约方法调整
      const nftIds = await this.culturalNFT.getCreatorNFTs(this.account);
      
      // 获取NFT详情
      const nfts = [];
      for (const nftId of nftIds) {
        const details = await this.culturalNFT.getNFTDetails(nftId);
        
        nfts.push({
          id: nftId.toString(),
          nftType: this.getNFTTypeString(details.nftType),
          creator: details.creator,
          language: details.language,
          relatedLanguages: details.relatedLanguages,
          tags: details.tags,
          creationDate: new Date(details.creationDate.toNumber() * 1000).toISOString(),
          usageCount: details.usageCount.toString(),
          royaltyPercentage: details.royaltyPercentage.toString(),
          price: ethers.utils.formatEther(details.price),
          isForSale: details.isForSale,
          currentOwner: details.currentOwner
        });
      }
      
      return nfts;
    } catch (error) {
      console.error('获取用户NFT失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取NFT类型字符串
   * @param {number} typeCode 类型码
   * @returns {string} 类型字符串
   */
  getNFTTypeString(typeCode) {
    const typeMap = {
      0: 'TranslationMemory',
      1: 'CulturalExplanation',
      2: 'LanguageResource'
    };
    
    return typeMap[typeCode] || 'Unknown';
  }
  
  /**
   * 获取AI服务列表
   * @returns {Promise<Array>} 服务列表
   */
  async getAIServices() {
    try {
      if (!this.aiRegistry) {
        throw new Error('AIRegistry合约实例未初始化');
      }
      
      // 获取已批准的服务ID列表
      const serviceIds = await this.aiRegistry.getApprovedServices();
      
      // 获取服务详情
      const services = [];
      for (const serviceId of serviceIds) {
        const service = await this.aiRegistry.services(serviceId);
        
        services.push({
          id: serviceId.toString(),
          provider: service.provider,
          serviceType: service.serviceType,
          supportedLanguages: service.supportedLanguages,
          performanceScore: service.performanceScore.toString(),
          pricePerToken: ethers.utils.formatEther(service.pricePerToken),
          status: this.getServiceStatusString(service.status),
          metadataURI: service.metadataURI,
          reputationScore: service.reputationScore.toString(),
          registrationTime: new Date(service.registrationTime.toNumber() * 1000).toISOString(),
          lastUpdateTime: new Date(service.lastUpdateTime.toNumber() * 1000).toISOString()
        });
      }
      
      return services;
    } catch (error) {
      console.error('获取AI服务列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取服务状态字符串
   * @param {number} statusCode 状态码
   * @returns {string} 状态字符串
   */
  getServiceStatusString(statusCode) {
    const statusMap = {
      0: 'Pending',
      1: 'Approved',
      2: 'Rejected',
      3: 'Suspended'
    };
    
    return statusMap[statusCode] || 'Unknown';
  }
}

// 导出单例实例
export default new BlockchainConnector();
