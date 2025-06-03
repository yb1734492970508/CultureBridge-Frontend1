/**
 * CrossChainRelayService.js
 * 跨链中继服务，负责监听链上事件并在目标链触发操作
 */

import Web3 from 'web3';
import { ethers } from 'ethers';
import CrossChainBridgeABI from '../contracts/abis/CrossChainBridge.json';
import { signMessage, verifySignature } from '../utils/cryptoUtils';

class CrossChainRelayService {
  constructor(config) {
    this.config = config;
    this.providers = {};
    this.contracts = {};
    this.relayers = [];
    this.isRunning = false;
    this.eventQueue = [];
    this.processedEvents = new Set();
    
    // 初始化提供者和合约
    this._initProviders();
  }
  
  /**
   * 初始化各链的提供者和合约
   */
  _initProviders() {
    // 初始化每个支持的链
    for (const chain of this.config.supportedChains) {
      // 创建提供者
      this.providers[chain.id] = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
      
      // 创建合约实例
      this.contracts[chain.id] = new ethers.Contract(
        chain.bridgeAddress,
        CrossChainBridgeABI,
        this.providers[chain.id]
      );
      
      console.log(`Initialized provider and contract for ${chain.name}`);
    }
    
    // 初始化中继器账户
    for (const relayer of this.config.relayers) {
      const wallet = new ethers.Wallet(relayer.privateKey);
      this.relayers.push({
        address: wallet.address,
        wallet: wallet
      });
    }
    
    console.log(`Initialized ${this.relayers.length} relayers`);
  }
  
  /**
   * 启动中继服务
   */
  async start() {
    if (this.isRunning) {
      console.log('Relay service is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Starting cross-chain relay service...');
    
    // 为每个链启动事件监听
    for (const chain of this.config.supportedChains) {
      this._listenForEvents(chain.id);
    }
    
    // 启动事件处理循环
    this._startEventProcessing();
  }
  
  /**
   * 停止中继服务
   */
  stop() {
    this.isRunning = false;
    console.log('Stopping cross-chain relay service...');
    
    // 清理事件监听器
    for (const chain of this.config.supportedChains) {
      const contract = this.contracts[chain.id];
      contract.removeAllListeners();
    }
  }
  
  /**
   * 监听指定链上的事件
   * @param {string} chainId 链ID
   */
  _listenForEvents(chainId) {
    const contract = this.contracts[chainId];
    
    // 监听TokensLocked事件
    contract.on('TokensLocked', (transferId, user, amount, targetChain, event) => {
      console.log(`[${chainId}] TokensLocked event detected: ${transferId}`);
      
      // 将事件添加到队列
      this.eventQueue.push({
        type: 'TokensLocked',
        chainId: chainId,
        transferId: transferId,
        user: user,
        amount: amount,
        targetChain: targetChain,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    });
    
    // 监听TokensBurned事件
    contract.on('TokensBurned', (transferId, user, amount, targetChain, event) => {
      console.log(`[${chainId}] TokensBurned event detected: ${transferId}`);
      
      // 将事件添加到队列
      this.eventQueue.push({
        type: 'TokensBurned',
        chainId: chainId,
        transferId: transferId,
        user: user,
        amount: amount,
        targetChain: targetChain,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    });
    
    console.log(`Started listening for events on ${chainId}`);
  }
  
  /**
   * 启动事件处理循环
   */
  async _startEventProcessing() {
    console.log('Starting event processing loop');
    
    while (this.isRunning) {
      try {
        // 处理队列中的事件
        if (this.eventQueue.length > 0) {
          const event = this.eventQueue.shift();
          
          // 检查是否已处理过该事件
          const eventKey = `${event.transactionHash}-${event.type}`;
          if (this.processedEvents.has(eventKey)) {
            console.log(`Event ${eventKey} already processed, skipping`);
            continue;
          }
          
          // 处理事件
          await this._processEvent(event);
          
          // 标记为已处理
          this.processedEvents.add(eventKey);
        }
        
        // 等待一段时间
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error in event processing loop:', error);
      }
    }
  }
  
  /**
   * 处理单个事件
   * @param {Object} event 事件对象
   */
  async _processEvent(event) {
    console.log(`Processing event: ${event.type} (${event.transferId})`);
    
    try {
      switch (event.type) {
        case 'TokensLocked':
          await this._processTokensLocked(event);
          break;
        case 'TokensBurned':
          await this._processTokensBurned(event);
          break;
        default:
          console.log(`Unknown event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing event ${event.transferId}:`, error);
    }
  }
  
  /**
   * 处理TokensLocked事件
   * @param {Object} event 事件对象
   */
  async _processTokensLocked(event) {
    // 查找目标链配置
    const targetChainConfig = this.config.supportedChains.find(chain => chain.id === event.targetChain);
    if (!targetChainConfig) {
      console.error(`Target chain ${event.targetChain} not supported`);
      return;
    }
    
    // 确认事件（等待足够的区块确认）
    await this._waitForConfirmations(event.chainId, event.blockNumber);
    
    // 验证源链上的锁定状态
    const sourceContract = this.contracts[event.chainId];
    const transferStatus = await sourceContract.getTransferStatus(event.transferId);
    
    if (transferStatus !== 1) { // 1 = Locked
      console.error(`Invalid transfer status for ${event.transferId}: ${transferStatus}`);
      return;
    }
    
    // 生成消息哈希
    const messageHash = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'string', 'string', 'bytes32'],
      [event.user, event.amount, event.chainId, event.targetChain, event.transferId]
    );
    
    // 收集中继器签名
    const signatures = await this._collectSignatures(messageHash);
    
    // 在目标链上执行铸造操作
    await this._mintTokensOnTargetChain(
      event.targetChain,
      event.user,
      event.amount,
      event.chainId,
      event.transferId,
      signatures
    );
  }
  
  /**
   * 处理TokensBurned事件
   * @param {Object} event 事件对象
   */
  async _processTokensBurned(event) {
    // 查找目标链配置
    const targetChainConfig = this.config.supportedChains.find(chain => chain.id === event.targetChain);
    if (!targetChainConfig) {
      console.error(`Target chain ${event.targetChain} not supported`);
      return;
    }
    
    // 确认事件（等待足够的区块确认）
    await this._waitForConfirmations(event.chainId, event.blockNumber);
    
    // 验证源链上的销毁状态
    const sourceContract = this.contracts[event.chainId];
    const transferStatus = await sourceContract.getTransferStatus(event.transferId);
    
    if (transferStatus !== 4) { // 4 = Burned
      console.error(`Invalid transfer status for ${event.transferId}: ${transferStatus}`);
      return;
    }
    
    // 生成消息哈希
    const messageHash = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'string', 'string', 'bytes32'],
      [event.user, event.amount, event.chainId, event.targetChain, event.transferId]
    );
    
    // 收集中继器签名
    const signatures = await this._collectSignatures(messageHash);
    
    // 在目标链上执行铸造操作
    await this._mintTokensOnTargetChain(
      event.targetChain,
      event.user,
      event.amount,
      event.chainId,
      event.transferId,
      signatures
    );
  }
  
  /**
   * 等待足够的区块确认
   * @param {string} chainId 链ID
   * @param {number} blockNumber 区块号
   */
  async _waitForConfirmations(chainId, blockNumber) {
    const chainConfig = this.config.supportedChains.find(chain => chain.id === chainId);
    const requiredConfirmations = chainConfig.requiredConfirmations || 12;
    
    const provider = this.providers[chainId];
    const currentBlock = await provider.getBlockNumber();
    
    if (currentBlock - blockNumber < requiredConfirmations) {
      const blocksToWait = requiredConfirmations - (currentBlock - blockNumber);
      console.log(`Waiting for ${blocksToWait} more confirmations on ${chainId}`);
      
      // 等待所需的确认数
      return new Promise((resolve) => {
        const checkInterval = setInterval(async () => {
          const newCurrentBlock = await provider.getBlockNumber();
          if (newCurrentBlock - blockNumber >= requiredConfirmations) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 15000); // 每15秒检查一次
      });
    }
  }
  
  /**
   * 收集中继器签名
   * @param {string} messageHash 消息哈希
   * @returns {string} 合并后的签名
   */
  async _collectSignatures(messageHash) {
    const signatures = [];
    
    for (const relayer of this.relayers) {
      const signature = await relayer.wallet.signMessage(ethers.utils.arrayify(messageHash));
      signatures.push(signature);
    }
    
    // 合并签名
    return ethers.utils.hexConcat(signatures);
  }
  
  /**
   * 在目标链上铸造代币
   * @param {string} targetChain 目标链ID
   * @param {string} user 用户地址
   * @param {string} amount 金额
   * @param {string} sourceChain 源链ID
   * @param {string} transferId 转账ID
   * @param {string} signatures 签名
   */
  async _mintTokensOnTargetChain(targetChain, user, amount, sourceChain, transferId, signatures) {
    try {
      // 获取目标链合约
      const targetContract = this.contracts[targetChain];
      
      // 使用第一个中继器的钱包连接合约
      const connectedContract = targetContract.connect(this.relayers[0].wallet);
      
      // 估算gas
      const gasEstimate = await connectedContract.estimateGas.mintTokens(
        user,
        amount,
        sourceChain,
        transferId,
        signatures
      );
      
      // 发送交易
      const tx = await connectedContract.mintTokens(
        user,
        amount,
        sourceChain,
        transferId,
        signatures,
        {
          gasLimit: Math.ceil(gasEstimate * 1.2) // 增加20%的gas限制
        }
      );
      
      console.log(`Mint transaction sent on ${targetChain}: ${tx.hash}`);
      
      // 等待交易确认
      const receipt = await tx.wait();
      console.log(`Mint transaction confirmed on ${targetChain}: ${receipt.transactionHash}`);
      
      return receipt;
    } catch (error) {
      console.error(`Error minting tokens on ${targetChain}:`, error);
      throw error;
    }
  }
}

export default CrossChainRelayService;
