import Web3 from 'web3';
import { ethers } from 'ethers';

// 导入合约ABI
import CultureBridgeIdentityABI from '../contracts/CultureBridgeIdentity.json';
import CultureBridgeAssetABI from '../contracts/CultureBridgeAsset.json';
import CultureBridgeExchangeABI from '../contracts/CultureBridgeExchange.json';
import CultureBridgeTokenABI from '../contracts/CultureBridgeToken.json';
import CultureBridgeMarketplaceABI from '../contracts/CultureBridgeMarketplace.json';

/**
 * 前端Web3服务类，提供与区块链交互的接口
 */
class Web3Service {
  constructor() {
    this.web3 = null;
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.networkId = null;
    this.contracts = {};
    this.isConnected = false;
    
    // 合约地址配置（根据环境变量或配置文件加载）
    this.contractAddresses = {
      identity: process.env.REACT_APP_IDENTITY_CONTRACT_ADDRESS,
      asset: process.env.REACT_APP_ASSET_CONTRACT_ADDRESS,
      exchange: process.env.REACT_APP_EXCHANGE_CONTRACT_ADDRESS,
      token: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS,
      marketplace: process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS
    };
  }

  /**
   * 初始化Web3连接
   * @returns {Promise<boolean>} 连接是否成功
   */
  async init() {
    try {
      // 检查是否安装了MetaMask
      if (window.ethereum) {
        // 使用ethers.js创建provider
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        // 使用Web3.js创建web3实例
        this.web3 = new Web3(window.ethereum);
        
        // 请求用户授权
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // 获取当前账户
        const accounts = await this.provider.listAccounts();
        this.account = accounts[0];
        
        // 获取网络ID
        this.networkId = (await this.provider.getNetwork()).chainId;
        
        // 初始化合约
        this.initContracts();
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
          this.account = accounts[0];
          // 触发账户变化事件
          window.dispatchEvent(new CustomEvent('accountChanged', { detail: accounts[0] }));
        });
        
        // 监听网络变化
        window.ethereum.on('chainChanged', (chainId) => {
          window.location.reload();
        });
        
        this.isConnected = true;
        return true;
      } else {
        console.error('请安装MetaMask!');
        return false;
      }
    } catch (error) {
      console.error('Web3初始化失败:', error);
      return false;
    }
  }

  /**
   * 初始化智能合约实例
   */
  initContracts() {
    try {
      // 使用ethers.js创建合约实例
      this.contracts.identity = new ethers.Contract(
        this.contractAddresses.identity,
        CultureBridgeIdentityABI.abi,
        this.provider
      );
      
      this.contracts.asset = new ethers.Contract(
        this.contractAddresses.asset,
        CultureBridgeAssetABI.abi,
        this.provider
      );
      
      this.contracts.exchange = new ethers.Contract(
        this.contractAddresses.exchange,
        CultureBridgeExchangeABI.abi,
        this.provider
      );
      
      this.contracts.token = new ethers.Contract(
        this.contractAddresses.token,
        CultureBridgeTokenABI.abi,
        this.provider
      );
      
      this.contracts.marketplace = new ethers.Contract(
        this.contractAddresses.marketplace,
        CultureBridgeMarketplaceABI.abi,
        this.provider
      );
      
      // 创建可写入的合约实例（带签名）
      this.signer = this.provider.getSigner();
      
      this.contracts.identityWithSigner = this.contracts.identity.connect(this.signer);
      this.contracts.assetWithSigner = this.contracts.asset.connect(this.signer);
      this.contracts.exchangeWithSigner = this.contracts.exchange.connect(this.signer);
      this.contracts.tokenWithSigner = this.contracts.token.connect(this.signer);
      this.contracts.marketplaceWithSigner = this.contracts.marketplace.connect(this.signer);
    } catch (error) {
      console.error('合约初始化失败:', error);
    }
  }

  /**
   * 连接钱包
   * @returns {Promise<string>} 连接的钱包地址
   */
  async connectWallet() {
    try {
      if (!this.isConnected) {
        await this.init();
      }
      return this.account;
    } catch (error) {
      console.error('钱包连接失败:', error);
      throw error;
    }
  }

  /**
   * 断开钱包连接
   */
  disconnectWallet() {
    this.account = null;
    this.isConnected = false;
    // 触发断开连接事件
    window.dispatchEvent(new CustomEvent('walletDisconnected'));
  }

  /**
   * 获取当前账户
   * @returns {string} 当前账户地址
   */
  getAccount() {
    return this.account;
  }

  /**
   * 获取当前网络ID
   * @returns {number} 网络ID
   */
  getNetworkId() {
    return this.networkId;
  }

  /**
   * 获取账户余额
   * @returns {Promise<string>} 余额（以ETH为单位）
   */
  async getBalance() {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const balance = await this.provider.getBalance(this.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('获取余额失败:', error);
      throw error;
    }
  }

  /**
   * 获取代币余额
   * @returns {Promise<string>} 代币余额
   */
  async getTokenBalance() {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const balance = await this.contracts.token.balanceOf(this.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('获取代币余额失败:', error);
      throw error;
    }
  }

  // ===== 身份合约接口 =====

  /**
   * 注册用户
   * @param {string} name - 用户名
   * @param {string} email - 邮箱
   * @param {string} profileUri - 个人资料URI
   * @returns {Promise<object>} 交易收据
   */
  async registerUser(name, email, profileUri) {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const tx = await this.contracts.identityWithSigner.registerUser(name, email, profileUri);
      return await tx.wait();
    } catch (error) {
      console.error('用户注册失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户信息
   * @returns {Promise<object>} 用户信息
   */
  async getUserInfo() {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const result = await this.contracts.identity.getUserInfo(this.account);
      return {
        userId: result[0].toString(),
        name: result[1],
        email: result[2],
        profileUri: result[3],
        isVerified: result[4]
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户资料
   * @param {string} name - 新用户名
   * @param {string} email - 新邮箱
   * @param {string} profileUri - 新个人资料URI
   * @returns {Promise<object>} 交易收据
   */
  async updateProfile(name, email, profileUri) {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const tx = await this.contracts.identityWithSigner.updateProfile(name, email, profileUri);
      return await tx.wait();
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  }

  // ===== 资产合约接口 =====

  /**
   * 创建文化资产
   * @param {string} assetType - 资产类型
   * @param {string} culturalOrigin - 文化起源
   * @param {string} tokenUri - 代币URI
   * @param {string} metadataHash - 元数据哈希
   * @returns {Promise<object>} 交易收据
   */
  async createAsset(assetType, culturalOrigin, tokenUri, metadataHash) {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const tx = await this.contracts.assetWithSigner.createAsset(
        assetType, 
        culturalOrigin, 
        tokenUri, 
        metadataHash
      );
      return await tx.wait();
    } catch (error) {
      console.error('创建资产失败:', error);
      throw error;
    }
  }

  /**
   * 获取资产信息
   * @param {number} tokenId - 资产ID
   * @returns {Promise<object>} 资产信息
   */
  async getAssetInfo(tokenId) {
    try {
      const result = await this.contracts.asset.getAssetInfo(tokenId);
      return {
        id: result[0].toString(),
        assetType: result[1],
        culturalOrigin: result[2],
        creator: result[3],
        creationTime: result[4].toString(),
        isVerified: result[5],
        metadataHash: result[6]
      };
    } catch (error) {
      console.error('获取资产信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的资产
   * @returns {Promise<number[]>} 资产ID数组
   */
  async getUserAssets() {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const assets = await this.contracts.asset.getAssetsByCreator(this.account);
      return assets.map(id => id.toString());
    } catch (error) {
      console.error('获取用户资产失败:', error);
      throw error;
    }
  }

  // ===== 交流合约接口 =====

  /**
   * 创建文化交流
   * @param {string} title - 标题
   * @param {string} description - 描述
   * @param {number} startTime - 开始时间
   * @param {number} endTime - 结束时间
   * @param {string} category - 类别
   * @param {string[]} tags - 标签数组
   * @returns {Promise<object>} 交易收据
   */
  async createExchange(title, description, startTime, endTime, category, tags) {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const tx = await this.contracts.exchangeWithSigner.createExchange(
        title, 
        description, 
        startTime, 
        endTime, 
        category, 
        tags
      );
      return await tx.wait();
    } catch (error) {
      console.error('创建文化交流失败:', error);
      throw error;
    }
  }

  /**
   * 加入文化交流
   * @param {number} exchangeId - 交流ID
   * @returns {Promise<object>} 交易收据
   */
  async joinExchange(exchangeId) {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const tx = await this.contracts.exchangeWithSigner.joinExchange(exchangeId);
      return await tx.wait();
    } catch (error) {
      console.error('加入文化交流失败:', error);
      throw error;
    }
  }

  /**
   * 获取交流信息
   * @param {number} exchangeId - 交流ID
   * @returns {Promise<object>} 交流信息
   */
  async getExchangeInfo(exchangeId) {
    try {
      const result = await this.contracts.exchange.getExchangeInfo(exchangeId);
      return {
        id: result[0].toString(),
        title: result[1],
        description: result[2],
        organizer: result[3],
        startTime: result[4].toString(),
        endTime: result[5].toString(),
        isActive: result[6],
        participantCount: result[7].toString(),
        assetCount: result[8].toString(),
        category: result[9]
      };
    } catch (error) {
      console.error('获取交流信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取活跃的交流
   * @returns {Promise<number[]>} 交流ID数组
   */
  async getActiveExchanges() {
    try {
      const exchanges = await this.contracts.exchange.getActiveExchanges();
      return exchanges.map(id => id.toString());
    } catch (error) {
      console.error('获取活跃交流失败:', error);
      throw error;
    }
  }

  // ===== 代币合约接口 =====

  /**
   * 带有目的的代币转账
   * @param {string} to - 接收者地址
   * @param {string} amount - 代币数量
   * @param {string} purpose - 转账目的
   * @param {string} category - 交易类别
   * @param {string[]} tags - 交易标签数组
   * @returns {Promise<object>} 交易收据
   */
  async transferWithPurpose(to, amount, purpose, category, tags) {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await this.contracts.tokenWithSigner.transferWithPurpose(
        to, 
        amountWei, 
        purpose, 
        category, 
        tags
      );
      return await tx.wait();
    } catch (error) {
      console.error('代币转账失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的交易
   * @returns {Promise<number[]>} 交易ID数组
   */
  async getUserTransactions() {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const transactions = await this.contracts.token.getUserTransactions(this.account);
      return transactions.map(id => id.toString());
    } catch (error) {
      console.error('获取用户交易失败:', error);
      throw error;
    }
  }

  /**
   * 获取交易信息
   * @param {number} id - 交易ID
   * @returns {Promise<object>} 交易信息
   */
  async getTransaction(id) {
    try {
      const result = await this.contracts.token.getTransaction(id);
      return {
        id: result[0].toString(),
        from: result[1],
        to: result[2],
        amount: ethers.utils.formatEther(result[3]),
        purpose: result[4],
        timestamp: result[5].toString(),
        category: result[6]
      };
    } catch (error) {
      console.error('获取交易信息失败:', error);
      throw error;
    }
  }

  // ===== 市场合约接口 =====

  /**
   * 挂单出售资产
   * @param {number} tokenId - 资产ID
   * @param {string} price - 价格
   * @param {string} description - 描述
   * @returns {Promise<object>} 交易收据
   */
  async listAsset(tokenId, price, description) {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      const priceWei = ethers.utils.parseEther(price);
      
      // 先授权市场合约操作资产
      const approveTx = await this.contracts.assetWithSigner.approve(
        this.contractAddresses.marketplace, 
        tokenId
      );
      await approveTx.wait();
      
      // 然后挂单
      const tx = await this.contracts.marketplaceWithSigner.listAsset(
        tokenId, 
        priceWei, 
        description
      );
      return await tx.wait();
    } catch (error) {
      console.error('资产挂单失败:', error);
      throw error;
    }
  }

  /**
   * 购买资产
   * @param {number} tokenId - 资产ID
   * @returns {Promise<object>} 交易收据
   */
  async buyAsset(tokenId) {
    try {
      if (!this.account) throw new Error('未连接钱包');
      
      // 获取挂单信息
      const listing = await this.contracts.marketplace.getListing(tokenId);
      
      // 先授权市场合约操作代币
      const approveTx = await this.contracts.tokenWithSigner.approve(
        this.contractAddresses.marketplace, 
        listing.price
      );
      await approveTx.wait();
      
      // 然后购买
      const tx = await this.contracts.marketplaceWithSigner.buyAsset(tokenId);
      return await tx.wait();
    } catch (error) {
      console.error('购买资产失败:', error);
      throw error;
    }
  }

  /**
   * 获取活跃挂单
   * @param {number} start - 起始索引
   * @param {number} limit - 限制数量
   * @returns {Promise<object[]>} 挂单信息
   */
  async getActiveListings(start, limit) {
    try {
      const result = await this.contracts.marketplace.getActiveListings(start, limit);
      
      const listings = [];
      for (let i = 0; i < result[0].length; i++) {
        listings.push({
          tokenId: result[0][i].toString(),
          seller: result[1][i],
          price: ethers.utils.formatEther(result[2][i])
        });
      }
      
      return listings;
    } catch (error) {
      console.error('获取活跃挂单失败:', error);
      throw error;
    }
  }

  /**
   * 获取交易历史
   * @param {number} start - 起始索引
   * @param {number} limit - 限制数量
   * @returns {Promise<object[]>} 交易历史
   */
  async getTransactionHistory(start, limit) {
    try {
      const result = await this.contracts.marketplace.getTransactionHistory(start, limit);
      
      const history = [];
      for (let i = 0; i < result[0].length; i++) {
        history.push({
          tokenId: result[0][i].toString(),
          seller: result[1][i],
          buyer: result[2][i],
          price: ethers.utils.formatEther(result[3][i]),
          timestamp: result[4][i].toString()
        });
      }
      
      return history;
    } catch (error) {
      console.error('获取交易历史失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const web3Service = new Web3Service();
export default web3Service;
