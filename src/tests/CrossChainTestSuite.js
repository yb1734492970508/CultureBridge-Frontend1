// CrossChainTestSuite.js
// 跨链功能测试套件

import { ethers } from 'ethers';
import CrossChainBridgeABI from '../contracts/abis/CrossChainBridge.json';
import ERC20TokenABI from '../contracts/abis/ERC20Token.json';

/**
 * 跨链功能测试套件
 * 用于测试跨链桥合约和中继服务的功能
 */
class CrossChainTestSuite {
  constructor(config) {
    this.config = config;
    this.providers = {};
    this.contracts = {};
    this.tokenContracts = {};
    this.testAccounts = {};
    this.testResults = [];
  }
  
  /**
   * 初始化测试环境
   */
  async initialize() {
    console.log('初始化跨链测试环境...');
    
    // 初始化每个支持的链
    for (const chain of this.config.supportedChains) {
      console.log(`初始化 ${chain.name} 测试环境...`);
      
      // 创建提供者
      this.providers[chain.id] = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
      
      // 创建桥合约实例
      this.contracts[chain.id] = new ethers.Contract(
        chain.bridgeAddress,
        CrossChainBridgeABI,
        this.providers[chain.id]
      );
      
      // 创建代币合约实例
      this.tokenContracts[chain.id] = new ethers.Contract(
        chain.tokenAddress,
        ERC20TokenABI,
        this.providers[chain.id]
      );
      
      // 创建测试账户
      const wallet = new ethers.Wallet(this.config.testPrivateKey, this.providers[chain.id]);
      this.testAccounts[chain.id] = wallet;
      
      console.log(`${chain.name} 测试环境初始化完成`);
    }
    
    console.log('跨链测试环境初始化完成');
  }
  
  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('开始运行跨链功能测试...');
    
    this.testResults = [];
    
    // 基础功能测试
    await this.testContractDeployment();
    await this.testTokenApproval();
    await this.testLockTokens();
    await this.testReleaseTokens();
    
    // 跨链功能测试
    await this.testCrossChainTransfer();
    
    // 安全性测试
    await this.testTransferLimits();
    await this.testSignatureVerification();
    
    // 打印测试结果
    this.printTestResults();
    
    return this.testResults;
  }
  
  /**
   * 测试合约部署
   */
  async testContractDeployment() {
    console.log('测试合约部署...');
    
    try {
      for (const chain of this.config.supportedChains) {
        const contract = this.contracts[chain.id];
        
        // 检查合约是否已部署
        const currentChainId = await contract.currentChainId();
        console.log(`${chain.name} 合约已部署，当前链ID: ${currentChainId}`);
        
        this.addTestResult('合约部署', chain.id, true, `合约已部署，当前链ID: ${currentChainId}`);
      }
    } catch (error) {
      console.error('测试合约部署失败:', error);
      this.addTestResult('合约部署', 'all', false, error.message);
    }
  }
  
  /**
   * 测试代币授权
   */
  async testTokenApproval() {
    console.log('测试代币授权...');
    
    try {
      for (const chain of this.config.supportedChains) {
        const tokenContract = this.tokenContracts[chain.id];
        const bridgeContract = this.contracts[chain.id];
        const wallet = this.testAccounts[chain.id];
        
        // 授权代币
        const approvalAmount = ethers.utils.parseEther('1000');
        const tx = await tokenContract.connect(wallet).approve(
          bridgeContract.address,
          approvalAmount
        );
        
        await tx.wait();
        
        // 检查授权结果
        const allowance = await tokenContract.allowance(
          wallet.address,
          bridgeContract.address
        );
        
        console.log(`${chain.name} 代币授权成功，授权金额: ${ethers.utils.formatEther(allowance)} CBT`);
        
        this.addTestResult('代币授权', chain.id, true, `授权金额: ${ethers.utils.formatEther(allowance)} CBT`);
      }
    } catch (error) {
      console.error('测试代币授权失败:', error);
      this.addTestResult('代币授权', 'all', false, error.message);
    }
  }
  
  /**
   * 测试锁定代币
   */
  async testLockTokens() {
    console.log('测试锁定代币...');
    
    try {
      // 选择源链和目标链
      const sourceChain = this.config.supportedChains[0];
      const targetChain = this.config.supportedChains[1];
      
      const bridgeContract = this.contracts[sourceChain.id];
      const wallet = this.testAccounts[sourceChain.id];
      
      // 锁定代币
      const amount = ethers.utils.parseEther('10');
      const tx = await bridgeContract.connect(wallet).lockTokens(
        amount,
        targetChain.id,
        wallet.address
      );
      
      const receipt = await tx.wait();
      
      // 解析事件
      const event = receipt.events.find(e => e.event === 'TokensLocked');
      const transferId = event.args.transferId;
      
      console.log(`${sourceChain.name} 代币锁定成功，转账ID: ${transferId}`);
      
      // 检查转账状态
      const status = await bridgeContract.getTransferStatus(transferId);
      console.log(`转账状态: ${status}`);
      
      this.addTestResult('锁定代币', sourceChain.id, true, `转账ID: ${transferId}, 状态: ${status}`);
    } catch (error) {
      console.error('测试锁定代币失败:', error);
      this.addTestResult('锁定代币', 'all', false, error.message);
    }
  }
  
  /**
   * 测试释放代币
   */
  async testReleaseTokens() {
    console.log('测试释放代币...');
    
    try {
      // 选择源链
      const sourceChain = this.config.supportedChains[0];
      const targetChain = this.config.supportedChains[1];
      
      const bridgeContract = this.contracts[sourceChain.id];
      const wallet = this.testAccounts[sourceChain.id];
      
      // 锁定代币
      const amount = ethers.utils.parseEther('5');
      const lockTx = await bridgeContract.connect(wallet).lockTokens(
        amount,
        targetChain.id,
        wallet.address
      );
      
      const lockReceipt = await lockTx.wait();
      
      // 解析事件
      const event = lockReceipt.events.find(e => e.event === 'TokensLocked');
      const transferId = event.args.transferId;
      
      console.log(`${sourceChain.name} 代币锁定成功，转账ID: ${transferId}`);
      
      // 模拟锁定期过后
      console.log('等待锁定期...');
      
      // 在实际测试中，这里应该使用时间旅行或修改合约的锁定期
      // 这里简单等待几秒钟模拟
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 释放代币
      const releaseTx = await bridgeContract.connect(wallet).releaseTokens(transferId);
      const releaseReceipt = await releaseTx.wait();
      
      // 检查转账状态
      const status = await bridgeContract.getTransferStatus(transferId);
      console.log(`释放后转账状态: ${status}`);
      
      this.addTestResult('释放代币', sourceChain.id, true, `转账ID: ${transferId}, 状态: ${status}`);
    } catch (error) {
      console.error('测试释放代币失败:', error);
      this.addTestResult('释放代币', 'all', false, error.message);
    }
  }
  
  /**
   * 测试跨链转账
   */
  async testCrossChainTransfer() {
    console.log('测试跨链转账...');
    
    try {
      // 选择源链和目标链
      const sourceChain = this.config.supportedChains[0];
      const targetChain = this.config.supportedChains[1];
      
      const sourceBridgeContract = this.contracts[sourceChain.id];
      const targetBridgeContract = this.contracts[targetChain.id];
      const sourceWallet = this.testAccounts[sourceChain.id];
      const targetWallet = this.testAccounts[targetChain.id];
      
      // 锁定代币
      const amount = ethers.utils.parseEther('15');
      const lockTx = await sourceBridgeContract.connect(sourceWallet).lockTokens(
        amount,
        targetChain.id,
        targetWallet.address
      );
      
      const lockReceipt = await lockTx.wait();
      
      // 解析事件
      const event = lockReceipt.events.find(e => e.event === 'TokensLocked');
      const transferId = event.args.transferId;
      
      console.log(`${sourceChain.name} 代币锁定成功，转账ID: ${transferId}`);
      
      // 模拟中继服务
      console.log('模拟中继服务...');
      
      // 生成消息哈希
      const messageHash = ethers.utils.solidityKeccak256(
        ['address', 'uint256', 'string', 'string', 'bytes32'],
        [targetWallet.address, amount, sourceChain.id, targetChain.id, transferId]
      );
      
      // 签名
      const signatures = [];
      for (const relayer of this.config.relayers) {
        const relayerWallet = new ethers.Wallet(relayer.privateKey);
        const signature = await relayerWallet.signMessage(ethers.utils.arrayify(messageHash));
        signatures.push(signature);
      }
      
      // 合并签名
      const combinedSignatures = ethers.utils.hexConcat(signatures);
      
      // 在目标链上铸造代币
      const mintTx = await targetBridgeContract.connect(targetWallet).mintTokens(
        targetWallet.address,
        amount,
        sourceChain.id,
        transferId,
        combinedSignatures
      );
      
      const mintReceipt = await mintTx.wait();
      
      // 检查转账状态
      const status = await targetBridgeContract.getTransferStatus(transferId);
      console.log(`铸造后转账状态: ${status}`);
      
      // 检查目标链上的余额
      const targetTokenContract = this.tokenContracts[targetChain.id];
      const balance = await targetTokenContract.balanceOf(targetWallet.address);
      console.log(`${targetChain.name} 上的余额: ${ethers.utils.formatEther(balance)} CBT`);
      
      this.addTestResult('跨链转账', `${sourceChain.id}->${targetChain.id}`, true, 
        `转账ID: ${transferId}, 状态: ${status}, 余额: ${ethers.utils.formatEther(balance)} CBT`);
    } catch (error) {
      console.error('测试跨链转账失败:', error);
      this.addTestResult('跨链转账', 'all', false, error.message);
    }
  }
  
  /**
   * 测试转账限额
   */
  async testTransferLimits() {
    console.log('测试转账限额...');
    
    try {
      // 选择源链和目标链
      const sourceChain = this.config.supportedChains[0];
      const targetChain = this.config.supportedChains[1];
      
      const bridgeContract = this.contracts[sourceChain.id];
      const wallet = this.testAccounts[sourceChain.id];
      
      // 获取单笔限额
      const singleTransferLimit = await bridgeContract.singleTransferLimit();
      console.log(`单笔转账限额: ${ethers.utils.formatEther(singleTransferLimit)} CBT`);
      
      // 尝试超过限额转账
      const amount = singleTransferLimit.add(ethers.utils.parseEther('1'));
      
      try {
        await bridgeContract.connect(wallet).lockTokens(
          amount,
          targetChain.id,
          wallet.address
        );
        
        // 如果没有抛出异常，测试失败
        this.addTestResult('转账限额', sourceChain.id, false, '超过限额的转账未被拒绝');
      } catch (error) {
        // 预期会抛出异常
        console.log('超过限额的转账被正确拒绝');
        this.addTestResult('转账限额', sourceChain.id, true, '超过限额的转账被正确拒绝');
      }
    } catch (error) {
      console.error('测试转账限额失败:', error);
      this.addTestResult('转账限额', 'all', false, error.message);
    }
  }
  
  /**
   * 测试签名验证
   */
  async testSignatureVerification() {
    console.log('测试签名验证...');
    
    try {
      // 选择目标链
      const sourceChain = this.config.supportedChains[0];
      const targetChain = this.config.supportedChains[1];
      
      const targetBridgeContract = this.contracts[targetChain.id];
      const targetWallet = this.testAccounts[targetChain.id];
      
      // 生成随机转账ID
      const transferId = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const amount = ethers.utils.parseEther('5');
      
      // 生成消息哈希
      const messageHash = ethers.utils.solidityKeccak256(
        ['address', 'uint256', 'string', 'string', 'bytes32'],
        [targetWallet.address, amount, sourceChain.id, targetChain.id, transferId]
      );
      
      // 使用非授权账户签名
      const unauthorizedWallet = ethers.Wallet.createRandom();
      const invalidSignature = await unauthorizedWallet.signMessage(ethers.utils.arrayify(messageHash));
      
      try {
        await targetBridgeContract.connect(targetWallet).mintTokens(
          targetWallet.address,
          amount,
          sourceChain.id,
          transferId,
          invalidSignature
        );
        
        // 如果没有抛出异常，测试失败
        this.addTestResult('签名验证', targetChain.id, false, '无效签名未被拒绝');
      } catch (error) {
        // 预期会抛出异常
        console.log('无效签名被正确拒绝');
        this.addTestResult('签名验证', targetChain.id, true, '无效签名被正确拒绝');
      }
    } catch (error) {
      console.error('测试签名验证失败:', error);
      this.addTestResult('签名验证', 'all', false, error.message);
    }
  }
  
  /**
   * 添加测试结果
   * @param {string} testName 测试名称
   * @param {string} chainId 链ID
   * @param {boolean} success 是否成功
   * @param {string} message 消息
   */
  addTestResult(testName, chainId, success, message) {
    this.testResults.push({
      testName,
      chainId,
      success,
      message,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * 打印测试结果
   */
  printTestResults() {
    console.log('\n===== 跨链功能测试结果 =====');
    
    let passedCount = 0;
    let failedCount = 0;
    
    for (const result of this.testResults) {
      const status = result.success ? '✅ 通过' : '❌ 失败';
      console.log(`${status} | ${result.testName} | 链: ${result.chainId} | ${result.message}`);
      
      if (result.success) {
        passedCount++;
      } else {
        failedCount++;
      }
    }
    
    console.log(`\n总结: 通过 ${passedCount} 项, 失败 ${failedCount} 项`);
    console.log('===========================\n');
  }
}

export default CrossChainTestSuite;
