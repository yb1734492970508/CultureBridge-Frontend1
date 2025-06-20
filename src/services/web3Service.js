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
      identity: process.env.REACT_APP_IDENTITY_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      asset: process.env.REACT_APP_ASSET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      exchange: process.env.REACT_APP_EXCHANGE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      token: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      marketplace: process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
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
        this.provider = new ethers.BrowserProvider(window.ethereum);
        // 使用Web3.js创建web3实例
        this.web3 = new Web3(window.ethereum);
        
        // 请求用户授权
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // 获取当前账户
        const accounts = await this.provider.listAccounts();
        this.account = accounts[0]?.address;
        
        // 获取网络ID
        const network = await this.provider.getNetwork();
        this.networkId = Number(network.chainId);
        
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
      return ethers.formatEther(balance);
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
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('获取代币余额失败:', error);
      return '0';
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
      
      const amountWei = ethers.parseEther(amount);
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
      return [];
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
        amount: ethers.formatEther(result[3]),
        purpose: result[4],
        timestamp: result[5].toString(),
        category: result[6]
      };
    } catch (error) {
      console.error('获取交易信息失败:', error);
      throw error;
    }
  }

  // 模拟方法，用于演示
  async getMockData() {
    return {
      balance: '1.234',
      tokenBalance: '567.89',
      userInfo: {
        name: '文化探索者',
        email: 'explorer@culturebridge.com',
        isVerified: true
      },
      transactions: [
        {
          id: '1',
          from: '0x1234...5678',
          to: '0x8765...4321',
          amount: '10.5',
          purpose: '文化交流奖励',
          timestamp: Date.now().toString(),
          category: 'reward'
        }
      ]
    };
  }
}

// 创建单例实例
const web3Service = new Web3Service();
export default web3Service;

