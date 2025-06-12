import { ethers } from 'ethers';

/**
 * 区块链智能合约集成服务
 * 提供与治理和委托合约的交互功能
 */
class BlockchainIntegrationService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.networkConfig = {
      chainId: 1, // 主网
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      blockExplorer: 'https://etherscan.io'
    };
  }

  /**
   * 初始化区块链连接
   */
  async initialize() {
    try {
      // 检查是否有MetaMask或其他钱包
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // 请求连接钱包
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = this.provider.getSigner();
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
        window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
        
        // 初始化合约
        await this.initializeContracts();
        
        return true;
      } else {
        throw new Error('请安装MetaMask或其他Web3钱包');
      }
    } catch (error) {
      console.error('区块链初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化智能合约
   */
  async initializeContracts() {
    // 治理合约ABI（简化版）
    const governanceABI = [
      "function createProposal(string memory title, string memory description, uint256 votingPeriod) external returns (uint256)",
      "function vote(uint256 proposalId, bool support) external",
      "function getProposal(uint256 proposalId) external view returns (tuple(string title, string description, uint256 forVotes, uint256 againstVotes, uint256 startTime, uint256 endTime, bool executed))",
      "function executeProposal(uint256 proposalId) external",
      "function getVotingPower(address voter) external view returns (uint256)",
      "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title)",
      "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight)"
    ];

    // 委托合约ABI（简化版）
    const delegationABI = [
      "function delegate(address delegatee, uint256 amount, uint256 duration) external",
      "function revokeDelegation(address delegatee) external",
      "function getDelegatedVotes(address delegatee) external view returns (uint256)",
      "function getDelegations(address delegator) external view returns (tuple(address delegatee, uint256 amount, uint256 startTime, uint256 endTime)[])",
      "function canVote(address voter, uint256 proposalId) external view returns (bool, uint256)",
      "event DelegationCreated(address indexed delegator, address indexed delegatee, uint256 amount)",
      "event DelegationRevoked(address indexed delegator, address indexed delegatee)"
    ];

    // NFT合约ABI（简化版）
    const nftABI = [
      "function balanceOf(address owner) external view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
      "function tokenURI(uint256 tokenId) external view returns (string)",
      "function getTokenMetadata(uint256 tokenId) external view returns (tuple(string name, string description, string image, uint256 rarity, uint256 votingPower))",
      "function transferFrom(address from, address to, uint256 tokenId) external",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    ];

    // 合约地址（需要替换为实际部署的地址）
    const contractAddresses = {
      governance: '0x1234567890123456789012345678901234567890',
      delegation: '0x2345678901234567890123456789012345678901',
      nft: '0x3456789012345678901234567890123456789012'
    };

    // 初始化合约实例
    this.contracts.governance = new ethers.Contract(
      contractAddresses.governance,
      governanceABI,
      this.signer
    );

    this.contracts.delegation = new ethers.Contract(
      contractAddresses.delegation,
      delegationABI,
      this.signer
    );

    this.contracts.nft = new ethers.Contract(
      contractAddresses.nft,
      nftABI,
      this.signer
    );
  }

  /**
   * 创建治理提案
   */
  async createProposal(proposalData) {
    try {
      const { title, description, votingPeriod = 7 * 24 * 60 * 60 } = proposalData; // 默认7天投票期
      
      // 估算Gas费用
      const gasEstimate = await this.contracts.governance.estimateGas.createProposal(
        title,
        description,
        votingPeriod
      );

      // 执行交易
      const tx = await this.contracts.governance.createProposal(
        title,
        description,
        votingPeriod,
        {
          gasLimit: gasEstimate.mul(120).div(100) // 增加20%的Gas缓冲
        }
      );

      // 等待交易确认
      const receipt = await tx.wait();
      
      // 解析事件获取提案ID
      const proposalCreatedEvent = receipt.events?.find(
        event => event.event === 'ProposalCreated'
      );
      
      const proposalId = proposalCreatedEvent?.args?.proposalId;

      return {
        proposalId: proposalId.toString(),
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('创建提案失败:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * 投票
   */
  async vote(proposalId, support) {
    try {
      // 检查投票权
      const votingPower = await this.getVotingPower();
      if (votingPower.eq(0)) {
        throw new Error('您没有投票权');
      }

      // 估算Gas费用
      const gasEstimate = await this.contracts.governance.estimateGas.vote(
        proposalId,
        support
      );

      // 执行投票
      const tx = await this.contracts.governance.vote(proposalId, support, {
        gasLimit: gasEstimate.mul(120).div(100)
      });

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('投票失败:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * 创建委托
   */
  async createDelegation(delegationData) {
    try {
      const { delegatee, amount, duration } = delegationData;
      
      // 检查可用投票权
      const availablePower = await this.getAvailableVotingPower();
      if (availablePower.lt(amount)) {
        throw new Error('可用投票权不足');
      }

      // 估算Gas费用
      const gasEstimate = await this.contracts.delegation.estimateGas.delegate(
        delegatee,
        amount,
        duration
      );

      // 执行委托
      const tx = await this.contracts.delegation.delegate(
        delegatee,
        amount,
        duration,
        {
          gasLimit: gasEstimate.mul(120).div(100)
        }
      );

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('创建委托失败:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * 撤销委托
   */
  async revokeDelegation(delegatee) {
    try {
      const gasEstimate = await this.contracts.delegation.estimateGas.revokeDelegation(delegatee);
      
      const tx = await this.contracts.delegation.revokeDelegation(delegatee, {
        gasLimit: gasEstimate.mul(120).div(100)
      });

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('撤销委托失败:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * 获取用户投票权
   */
  async getVotingPower(address = null) {
    try {
      const userAddress = address || await this.signer.getAddress();
      return await this.contracts.governance.getVotingPower(userAddress);
    } catch (error) {
      console.error('获取投票权失败:', error);
      return ethers.BigNumber.from(0);
    }
  }

  /**
   * 获取可用投票权（未委托的）
   */
  async getAvailableVotingPower(address = null) {
    try {
      const userAddress = address || await this.signer.getAddress();
      const totalPower = await this.getVotingPower(userAddress);
      const delegations = await this.getDelegations(userAddress);
      
      const delegatedPower = delegations.reduce((sum, delegation) => {
        return sum.add(delegation.amount);
      }, ethers.BigNumber.from(0));

      return totalPower.sub(delegatedPower);
    } catch (error) {
      console.error('获取可用投票权失败:', error);
      return ethers.BigNumber.from(0);
    }
  }

  /**
   * 获取用户委托列表
   */
  async getDelegations(address = null) {
    try {
      const userAddress = address || await this.signer.getAddress();
      return await this.contracts.delegation.getDelegations(userAddress);
    } catch (error) {
      console.error('获取委托列表失败:', error);
      return [];
    }
  }

  /**
   * 获取提案详情
   */
  async getProposal(proposalId) {
    try {
      return await this.contracts.governance.getProposal(proposalId);
    } catch (error) {
      console.error('获取提案详情失败:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * 获取用户NFT列表
   */
  async getUserNFTs(address = null) {
    try {
      const userAddress = address || await this.signer.getAddress();
      const balance = await this.contracts.nft.balanceOf(userAddress);
      const nfts = [];

      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await this.contracts.nft.tokenOfOwnerByIndex(userAddress, i);
        const metadata = await this.contracts.nft.getTokenMetadata(tokenId);
        
        nfts.push({
          tokenId: tokenId.toString(),
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          rarity: metadata.rarity.toString(),
          votingPower: metadata.votingPower.toString()
        });
      }

      return nfts;
    } catch (error) {
      console.error('获取NFT列表失败:', error);
      return [];
    }
  }

  /**
   * 监听区块链事件
   */
  setupEventListeners() {
    // 监听提案创建事件
    this.contracts.governance.on('ProposalCreated', (proposalId, proposer, title, event) => {
      this.emit('proposalCreated', {
        proposalId: proposalId.toString(),
        proposer,
        title,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    });

    // 监听投票事件
    this.contracts.governance.on('VoteCast', (proposalId, voter, support, weight, event) => {
      this.emit('voteCast', {
        proposalId: proposalId.toString(),
        voter,
        support,
        weight: weight.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    });

    // 监听委托事件
    this.contracts.delegation.on('DelegationCreated', (delegator, delegatee, amount, event) => {
      this.emit('delegationCreated', {
        delegator,
        delegatee,
        amount: amount.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    });

    // 监听委托撤销事件
    this.contracts.delegation.on('DelegationRevoked', (delegator, delegatee, event) => {
      this.emit('delegationRevoked', {
        delegator,
        delegatee,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    });
  }

  /**
   * 处理账户变化
   */
  async handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // 用户断开连接
      this.emit('disconnected');
    } else {
      // 账户切换
      this.signer = this.provider.getSigner();
      this.emit('accountChanged', accounts[0]);
    }
  }

  /**
   * 处理网络变化
   */
  async handleChainChanged(chainId) {
    // 重新初始化合约
    await this.initializeContracts();
    this.emit('chainChanged', parseInt(chainId, 16));
  }

  /**
   * 处理合约错误
   */
  handleContractError(error) {
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      return new Error('交易可能失败，请检查参数');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      return new Error('余额不足，无法支付Gas费用');
    } else if (error.code === 'USER_REJECTED') {
      return new Error('用户取消了交易');
    } else if (error.message.includes('revert')) {
      // 解析revert原因
      const reason = error.message.match(/revert (.+)/)?.[1] || '交易被拒绝';
      return new Error(reason);
    } else {
      return error;
    }
  }

  /**
   * 事件发射器
   */
  emit(event, data) {
    if (this.eventListeners && this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * 添加事件监听器
   */
  on(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = {};
    }
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * 移除事件监听器
   */
  off(event, callback) {
    if (this.eventListeners && this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * 获取当前网络信息
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name,
        blockNumber: await this.provider.getBlockNumber()
      };
    } catch (error) {
      console.error('获取网络信息失败:', error);
      return null;
    }
  }

  /**
   * 格式化金额
   */
  formatAmount(amount, decimals = 18) {
    return ethers.utils.formatUnits(amount, decimals);
  }

  /**
   * 解析金额
   */
  parseAmount(amount, decimals = 18) {
    return ethers.utils.parseUnits(amount.toString(), decimals);
  }
}

// 创建单例实例
const blockchainService = new BlockchainIntegrationService();

export default blockchainService;

