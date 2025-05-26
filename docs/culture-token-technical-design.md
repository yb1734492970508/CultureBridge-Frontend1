# CultureBridge 文化通证(ERC-20)系统技术方案设计

## 1. 概述

本文档详细描述CultureBridge平台文化通证(ERC-20)系统的技术实现方案，包括智能合约接口设计、前端组件结构和数据流设计。文化通证系统将为平台提供经济激励基础，促进用户参与文化交流和创作。

## 2. 智能合约接口设计

### 2.1 文化通证合约接口

```javascript
// CultureToken.js - 文化通证智能合约接口

import { ethers } from 'ethers';

// 文化通证合约ABI
const CultureTokenABI = [
  // ERC-20标准接口
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
  
  // 扩展功能
  "function mint(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount) returns (bool)",
  "function burnFrom(address account, uint256 amount) returns (bool)",
  "function cap() view returns (uint256)",
  
  // 奖励功能
  "function rewardCreation(address creator, uint256 amount) returns (bool)",
  "function rewardParticipation(address participant, uint256 amount) returns (bool)",
  "function rewardCuration(address curator, uint256 amount) returns (bool)",
  
  // 质押功能
  "function stake(uint256 amount) returns (bool)",
  "function unstake(uint256 amount) returns (bool)",
  "function getStakedAmount(address account) view returns (uint256)",
  "function getStakingReward(address account) view returns (uint256)",
  "function claimStakingReward() returns (uint256)",
  
  // 治理功能
  "function getPastVotes(address account, uint256 blockNumber) view returns (uint256)",
  "function getVotes(address account) view returns (uint256)",
  "function delegates(address account) view returns (address)",
  "function delegate(address delegatee) returns (bool)",
  
  // 事件
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardPaid(address indexed user, uint256 reward)",
  "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)"
];

// 测试网络合约地址
const CULTURE_TOKEN_CONTRACT_ADDRESS = {
  1: "0x0000000000000000000000000000000000000000", // 以太坊主网（待部署）
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia测试网（待部署）
  80001: "0x0000000000000000000000000000000000000000" // Polygon Mumbai测试网（待部署）
};

/**
 * 获取文化通证合约实例
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 合约实例
 */
export const getCultureTokenContract = (provider, chainId) => {
  const address = CULTURE_TOKEN_CONTRACT_ADDRESS[chainId];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`当前网络(chainId: ${chainId})不支持CultureToken合约`);
  }
  
  return new ethers.Contract(address, CultureTokenABI, provider);
};

/**
 * 获取带签名的文化通证合约实例（用于写操作）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 带签名的合约实例
 */
export const getSignedCultureTokenContract = async (provider, chainId) => {
  const signer = provider.getSigner();
  const contract = getCultureTokenContract(provider, chainId);
  return contract.connect(signer);
};

/**
 * 获取用户代币余额
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} account - 用户地址
 * @returns {Promise<string>} 代币余额
 */
export const getTokenBalance = async (provider, chainId, account) => {
  try {
    const contract = getCultureTokenContract(provider, chainId);
    const balance = await contract.balanceOf(account);
    return ethers.utils.formatUnits(balance, 18); // 假设代币有18位小数
  } catch (error) {
    console.error("获取代币余额失败:", error);
    return "0";
  }
};

/**
 * 转账代币
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} recipient - 接收者地址
 * @param {string} amount - 转账金额
 * @returns {Promise<Object>} 交易结果
 */
export const transferTokens = async (provider, chainId, recipient, amount) => {
  try {
    const contract = await getSignedCultureTokenContract(provider, chainId);
    
    // 将金额转换为wei
    const amountInWei = ethers.utils.parseUnits(amount, 18);
    
    // 发送转账交易
    const tx = await contract.transfer(recipient, amountInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("转账代币失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 授权代币使用
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} spender - 被授权者地址
 * @param {string} amount - 授权金额
 * @returns {Promise<Object>} 交易结果
 */
export const approveTokens = async (provider, chainId, spender, amount) => {
  try {
    const contract = await getSignedCultureTokenContract(provider, chainId);
    
    // 将金额转换为wei
    const amountInWei = ethers.utils.parseUnits(amount, 18);
    
    // 发送授权交易
    const tx = await contract.approve(spender, amountInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("授权代币失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 质押代币
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} amount - 质押金额
 * @returns {Promise<Object>} 交易结果
 */
export const stakeTokens = async (provider, chainId, amount) => {
  try {
    const contract = await getSignedCultureTokenContract(provider, chainId);
    
    // 将金额转换为wei
    const amountInWei = ethers.utils.parseUnits(amount, 18);
    
    // 发送质押交易
    const tx = await contract.stake(amountInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("质押代币失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 解除质押
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} amount - 解除质押金额
 * @returns {Promise<Object>} 交易结果
 */
export const unstakeTokens = async (provider, chainId, amount) => {
  try {
    const contract = await getSignedCultureTokenContract(provider, chainId);
    
    // 将金额转换为wei
    const amountInWei = ethers.utils.parseUnits(amount, 18);
    
    // 发送解除质押交易
    const tx = await contract.unstake(amountInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("解除质押失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取质押金额
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} account - 用户地址
 * @returns {Promise<string>} 质押金额
 */
export const getStakedAmount = async (provider, chainId, account) => {
  try {
    const contract = getCultureTokenContract(provider, chainId);
    const amount = await contract.getStakedAmount(account);
    return ethers.utils.formatUnits(amount, 18);
  } catch (error) {
    console.error("获取质押金额失败:", error);
    return "0";
  }
};

/**
 * 获取质押奖励
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} account - 用户地址
 * @returns {Promise<string>} 质押奖励
 */
export const getStakingReward = async (provider, chainId, account) => {
  try {
    const contract = getCultureTokenContract(provider, chainId);
    const reward = await contract.getStakingReward(account);
    return ethers.utils.formatUnits(reward, 18);
  } catch (error) {
    console.error("获取质押奖励失败:", error);
    return "0";
  }
};

/**
 * 领取质押奖励
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {Promise<Object>} 交易结果
 */
export const claimStakingReward = async (provider, chainId) => {
  try {
    const contract = await getSignedCultureTokenContract(provider, chainId);
    
    // 发送领取奖励交易
    const tx = await contract.claimStakingReward();
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      reward: ethers.utils.formatUnits(receipt.events[0].args.reward, 18)
    };
  } catch (error) {
    console.error("领取质押奖励失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 委托投票权
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} delegatee - 被委托人地址
 * @returns {Promise<Object>} 交易结果
 */
export const delegateVotes = async (provider, chainId, delegatee) => {
  try {
    const contract = await getSignedCultureTokenContract(provider, chainId);
    
    // 发送委托交易
    const tx = await contract.delegate(delegatee);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("委托投票权失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取投票权
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} account - 用户地址
 * @returns {Promise<string>} 投票权数量
 */
export const getVotingPower = async (provider, chainId, account) => {
  try {
    const contract = getCultureTokenContract(provider, chainId);
    const votes = await contract.getVotes(account);
    return ethers.utils.formatUnits(votes, 18);
  } catch (error) {
    console.error("获取投票权失败:", error);
    return "0";
  }
};

export default {
  getCultureTokenContract,
  getSignedCultureTokenContract,
  getTokenBalance,
  transferTokens,
  approveTokens,
  stakeTokens,
  unstakeTokens,
  getStakedAmount,
  getStakingReward,
  claimStakingReward,
  delegateVotes,
  getVotingPower
};
```

### 2.2 与其他合约的集成

文化通证合约将与NFT市场合约和DAO治理合约集成，实现代币支付、奖励和投票等功能。

```javascript
// 在NFT市场合约中使用代币支付
export const buyNFTWithTokens = async (provider, chainId, nftContract, tokenId, price) => {
  try {
    // 1. 先授权市场合约使用代币
    const tokenContract = await getSignedCultureTokenContract(provider, chainId);
    const marketAddress = CULTURE_MARKET_CONTRACT_ADDRESS[chainId];
    
    // 将价格转换为wei
    const priceInWei = ethers.utils.parseUnits(price, 18);
    
    // 发送授权交易
    const approveTx = await tokenContract.approve(marketAddress, priceInWei);
    await approveTx.wait();
    
    // 2. 调用市场合约的代币购买方法
    const marketContract = await getSignedCultureMarketContract(provider, chainId);
    const buyTx = await marketContract.buyNFTWithTokens(nftContract, tokenId, priceInWei);
    
    // 等待交易确认
    const receipt = await buyTx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("使用代币购买NFT失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

## 3. 前端组件设计

### 3.1 组件结构

文化通证功能将包含以下主要组件：

```
src/
  ├── components/
  │   ├── token/
  │   │   ├── TokenWallet.js           # 代币钱包组件
  │   │   ├── TokenTransfer.js         # 代币转账组件
  │   │   ├── TokenStaking.js          # 代币质押组件
  │   │   ├── StakingRewards.js        # 质押奖励组件
  │   │   ├── TokenDelegation.js       # 投票权委托组件
  │   │   ├── RewardCenter.js          # 奖励中心组件
  │   │   ├── TokenHistory.js          # 代币交易历史
  │   │   └── TokenStats.js            # 代币统计信息
  ├── contracts/
  │   ├── token/
  │   │   └── CultureToken.js          # 文化通证合约接口
  ├── context/
  │   ├── token/
  │   │   └── TokenContext.js          # 代币上下文
  ├── styles/
  │   └── token.css                    # 代币相关样式
```

### 3.2 主要组件详细设计

#### 3.2.1 TokenWallet.js

代币钱包组件，展示用户的代币余额和基本操作。

```jsx
import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { getTokenBalance } from '../../contracts/token/CultureToken';
import TokenTransfer from './TokenTransfer';
import TokenHistory from './TokenHistory';

const TokenWallet = () => {
  const { account, active, library, chainId } = useBlockchain();
  
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // 加载代币余额
  useEffect(() => {
    const loadTokenBalance = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const tokenBalance = await getTokenBalance(library, chainId, account);
        setBalance(tokenBalance);
      } catch (error) {
        console.error('加载代币余额失败:', error);
        setError('加载代币余额时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadTokenBalance();
    
    // 设置定时刷新
    const intervalId = setInterval(loadTokenBalance, 30000);
    
    return () => clearInterval(intervalId);
  }, [active, account, library, chainId]);
  
  // 刷新余额
  const refreshBalance = async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const tokenBalance = await getTokenBalance(library, chainId, account);
      setBalance(tokenBalance);
    } catch (error) {
      console.error('刷新代币余额失败:', error);
      setError('刷新代币余额时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="token-wallet">
      <div className="wallet-header">
        <h2>文化通证钱包</h2>
        <button 
          onClick={refreshBalance} 
          disabled={loading || !active}
          className="refresh-btn"
        >
          {loading ? '加载中...' : '刷新'}
        </button>
      </div>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以查看您的代币余额</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {active && (
        <div className="balance-card">
          <div className="balance-info">
            <h3>您的余额</h3>
            <div className="token-balance">
              <span className="balance-amount">{balance}</span>
              <span className="token-symbol">CULT</span>
            </div>
          </div>
          
          <div className="wallet-actions">
            <button 
              onClick={() => setShowTransfer(!showTransfer)} 
              className="action-btn transfer-btn"
            >
              {showTransfer ? '取消' : '转账'}
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="action-btn history-btn"
            >
              {showHistory ? '隐藏历史' : '交易历史'}
            </button>
            <a 
              href="/token/staking" 
              className="action-btn stake-btn"
            >
              质押
            </a>
            <a 
              href="/token/rewards" 
              className="action-btn rewards-btn"
            >
              奖励中心
            </a>
          </div>
        </div>
      )}
      
      {showTransfer && (
        <div className="transfer-section">
          <TokenTransfer onTransferComplete={refreshBalance} />
        </div>
      )}
      
      {showHistory && (
        <div className="history-section">
          <TokenHistory />
        </div>
      )}
    </div>
  );
};

export default TokenWallet;
```

#### 3.2.2 TokenStaking.js

代币质押组件，允许用户质押代币获取奖励和权益。

```jsx
import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { 
  getTokenBalance, 
  getStakedAmount, 
  getStakingReward, 
  stakeTokens, 
  unstakeTokens, 
  claimStakingReward 
} from '../../contracts/token/CultureToken';

const TokenStaking = () => {
  const { account, active, library, chainId } = useBlockchain();
  
  const [balance, setBalance] = useState('0');
  const [stakedAmount, setStakedAmount] = useState('0');
  const [reward, setReward] = useState('0');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 加载代币数据
  useEffect(() => {
    const loadTokenData = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // 获取代币余额
        const tokenBalance = await getTokenBalance(library, chainId, account);
        setBalance(tokenBalance);
        
        // 获取质押金额
        const staked = await getStakedAmount(library, chainId, account);
        setStakedAmount(staked);
        
        // 获取质押奖励
        const stakingReward = await getStakingReward(library, chainId, account);
        setReward(stakingReward);
      } catch (error) {
        console.error('加载代币数据失败:', error);
        setError('加载代币数据时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadTokenData();
    
    // 设置定时刷新
    const intervalId = setInterval(loadTokenData, 30000);
    
    return () => clearInterval(intervalId);
  }, [active, account, library, chainId]);
  
  // 处理质押
  const handleStake = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('请输入有效的质押金额');
      return;
    }
    
    if (parseFloat(stakeAmount) > parseFloat(balance)) {
      setError('质押金额不能超过您的余额');
      return;
    }
    
    try {
      setStaking(true);
      setError('');
      setSuccess('');
      
      const result = await stakeTokens(library, chainId, stakeAmount);
      
      if (result.success) {
        setSuccess(`质押成功！交易哈希: ${result.transactionHash}`);
        setStakeAmount('');
        
        // 刷新数据
        const tokenBalance = await getTokenBalance(library, chainId, account);
        setBalance(tokenBalance);
        
        const staked = await getStakedAmount(library, chainId, account);
        setStakedAmount(staked);
      } else {
        setError(`质押失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setStaking(false);
    }
  };
  
  // 处理解除质押
  const handleUnstake = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError('请输入有效的解除质押金额');
      return;
    }
    
    if (parseFloat(unstakeAmount) > parseFloat(stakedAmount)) {
      setError('解除质押金额不能超过您的质押金额');
      return;
    }
    
    try {
      setUnstaking(true);
      setError('');
      setSuccess('');
      
      const result = await unstakeTokens(library, chainId, unstakeAmount);
      
      if (result.success) {
        setSuccess(`解除质押成功！交易哈希: ${result.transactionHash}`);
        setUnstakeAmount('');
        
        // 刷新数据
        const tokenBalance = await getTokenBalance(library, chainId, account);
        setBalance(tokenBalance);
        
        const staked = await getStakedAmount(library, chainId, account);
        setStakedAmount(staked);
      } else {
        setError(`解除质押失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setUnstaking(false);
    }
  };
  
  // 处理领取奖励
  const handleClaimReward = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (parseFloat(reward) <= 0) {
      setError('没有可领取的奖励');
      return;
    }
    
    try {
      setClaiming(true);
      setError('');
      setSuccess('');
      
      const result = await claimStakingReward(library, chainId);
      
      if (result.success) {
        setSuccess(`奖励领取成功！您获得了 ${result.reward} CULT。交易哈希: ${result.transactionHash}`);
        
        // 刷新数据
        const tokenBalance = await getTokenBalance(library, chainId, account);
        setBalance(tokenBalance);
        
        const stakingReward = await getStakingReward(library, chainId, account);
        setReward(stakingReward);
      } else {
        setError(`领取奖励失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setClaiming(false);
    }
  };
  
  return (
    <div className="token-staking">
      <h2>代币质押</h2>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以使用质押功能</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      
      {active && (
        <div className="staking-container">
          <div className="staking-info">
            <div className="info-card">
              <h3>可用余额</h3>
              <p className="info-value">{balance} CULT</p>
            </div>
            
            <div className="info-card">
              <h3>已质押金额</h3>
              <p className="info-value">{stakedAmount} CULT</p>
            </div>
            
            <div className="info-card">
              <h3>当前奖励</h3>
              <p className="info-value">{reward} CULT</p>
              <button 
                onClick={handleClaimReward} 
                disabled={claiming || parseFloat(reward) <= 0}
                className="claim-btn"
              >
                {claiming ? '领取中...' : '领取奖励'}
              </button>
            </div>
          </div>
          
          <div className="staking-actions">
            <div className="action-card">
              <h3>质押代币</h3>
              <form onSubmit={handleStake}>
                <div className="form-group">
                  <label htmlFor="stakeAmount">质押金额</label>
                  <div className="input-with-max">
                    <input
                      type="number"
                      id="stakeAmount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      min="0.000001"
                      step="0.000001"
                      disabled={staking}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setStakeAmount(balance)}
                      className="max-btn"
                    >
                      最大
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={staking || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > parseFloat(balance)}
                  className="stake-button"
                >
                  {staking ? '质押中...' : '质押'}
                </button>
              </form>
            </div>
            
            <div className="action-card">
              <h3>解除质押</h3>
              <form onSubmit={handleUnstake}>
                <div className="form-group">
                  <label htmlFor="unstakeAmount">解除金额</label>
                  <div className="input-with-max">
                    <input
                      type="number"
                      id="unstakeAmount"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      min="0.000001"
                      step="0.000001"
                      disabled={unstaking}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setUnstakeAmount(stakedAmount)}
                      className="max-btn"
                    >
                      最大
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={unstaking || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > parseFloat(stakedAmount)}
                  className="unstake-button"
                >
                  {unstaking ? '解除中...' : '解除质押'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="staking-benefits">
            <h3>质押收益</h3>
            <ul>
              <li>获得平台治理投票权</li>
              <li>每日获得质押奖励</li>
              <li>解锁平台高级功能</li>
              <li>参与社区决策</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenStaking;
```

#### 3.2.3 RewardCenter.js

奖励中心组件，展示用户可获取的代币奖励。

```jsx
import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { getTokenBalance } from '../../contracts/token/CultureToken';

const RewardCenter = () => {
  const { account, active, library, chainId } = useBlockchain();
  
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [claimingTask, setClaimingTask] = useState(null);
  const [success, setSuccess] = useState('');
  
  // 加载代币余额和任务
  useEffect(() => {
    const loadData = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // 获取代币余额
        const tokenBalance = await getTokenBalance(library, chainId, account);
        setBalance(tokenBalance);
        
        // 模拟获取任务列表
        // 实际应用中应从后端API或智能合约获取
        setTasks([
          {
            id: 1,
            title: '创建您的第一个NFT',
            description: '铸造一个文化NFT，获得奖励',
            reward: '10',
            completed: false,
            type: 'creation'
          },
          {
            id: 2,
            title: '参与社区讨论',
            description: '在论坛发表评论或回复',
            reward: '5',
            completed: false,
            type: 'participation'
          },
          {
            id: 3,
            title: '分享平台到社交媒体',
            description: '将CultureBridge分享到您的社交媒体账号',
            reward: '15',
            completed: false,
            type: 'promotion'
          },
          {
            id: 4,
            title: '质押代币',
            description: '质押至少100 CULT代币',
            reward: '20',
            completed: false,
            type: 'staking'
          },
          {
            id: 5,
            title: '购买NFT',
            description: '在市场购买一个NFT',
            reward: '25',
            completed: false,
            type: 'market'
          }
        ]);
      } catch (error) {
        console.error('加载数据失败:', error);
        setError('加载数据时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [active, account, library, chainId]);
  
  // 处理任务完成
  const handleCompleteTask = async (taskId) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setClaimingTask(taskId);
      setError('');
      setSuccess('');
      
      // 模拟任务完成和奖励发放
      // 实际应用中应调用智能合约或后端API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 更新任务状态
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // 更新余额（模拟）
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setBalance(prevBalance => (parseFloat(prevBalance) + parseFloat(task.reward)).toString());
        setSuccess(`任务完成！您获得了 ${task.reward} CULT 奖励`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setClaimingTask(null);
    }
  };
  
  return (
    <div className="reward-center">
      <div className="reward-header">
        <h2>奖励中心</h2>
        <div className="balance-display">
          <span>当前余额:</span>
          <span className="balance-amount">{balance} CULT</span>
        </div>
      </div>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以查看可获取的奖励</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <p>加载奖励任务中...</p>
        </div>
      ) : (
        <div className="tasks-container">
          <h3>可获取奖励的任务</h3>
          
          {tasks.length === 0 ? (
            <p className="no-tasks">当前没有可用的奖励任务</p>
          ) : (
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-reward">
                      <span>奖励:</span>
                      <span className="reward-amount">{task.reward} CULT</span>
                    </div>
                  </div>
                  
                  <div className="task-action">
                    {task.completed ? (
                      <span className="completed-badge">已完成</span>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={claimingTask === task.id}
                        className="complete-task-btn"
                      >
                        {claimingTask === task.id ? '处理中...' : '完成任务'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="reward-info">
        <h3>如何获取更多代币</h3>
        <ul>
          <li>创建和分享文化内容</li>
          <li>参与社区讨论和活动</li>
          <li>质押代币获取被动收益</li>
          <li>推广平台给其他用户</li>
          <li>参与DAO治理投票</li>
        </ul>
      </div>
    </div>
  );
};

export default RewardCenter;
```

### 3.3 代币上下文设计

创建代币上下文，管理代币状态和数据。

```jsx
// TokenContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useBlockchain } from '../blockchain';
import { 
  getTokenBalance, 
  getStakedAmount, 
  getStakingReward 
} from '../../contracts/token/CultureToken';

// 创建代币上下文
export const TokenContext = createContext({
  balance: '0',
  stakedAmount: '0',
  reward: '0',
  loading: false,
  error: null,
  refreshBalance: () => {},
  refreshStakedAmount: () => {},
  refreshReward: () => {}
});

// 代币上下文提供者组件
export const TokenProvider = ({ children }) => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [balance, setBalance] = useState('0');
  const [stakedAmount, setStakedAmount] = useState('0');
  const [reward, setReward] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 刷新代币余额
  const refreshBalance = async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const tokenBalance = await getTokenBalance(library, chainId, account);
      setBalance(tokenBalance);
    } catch (error) {
      console.error('刷新代币余额失败:', error);
      setError('刷新代币余额时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 刷新质押金额
  const refreshStakedAmount = async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const staked = await getStakedAmount(library, chainId, account);
      setStakedAmount(staked);
    } catch (error) {
      console.error('刷新质押金额失败:', error);
      setError('刷新质押金额时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 刷新质押奖励
  const refreshReward = async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const stakingReward = await getStakingReward(library, chainId, account);
      setReward(stakingReward);
    } catch (error) {
      console.error('刷新质押奖励失败:', error);
      setError('刷新质押奖励时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    if (active && account && library && chainId) {
      refreshBalance();
      refreshStakedAmount();
      refreshReward();
    }
  }, [active, account, library, chainId]);
  
  // 上下文值
  const contextValue = {
    balance,
    stakedAmount,
    reward,
    loading,
    error,
    refreshBalance,
    refreshStakedAmount,
    refreshReward
  };
  
  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用代币上下文
export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken必须在TokenProvider内部使用');
  }
  return context;
};
```

## 4. 路由与应用集成

### 4.1 路由设计

在App.js中添加文化通证相关路由。

```jsx
// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletConnector from './components/blockchain/WalletConnector';
import NFTMinter from './components/blockchain/NFTMinter';
import NFTGallery from './components/blockchain/NFTGallery';
import NFTDetail from './components/blockchain/NFTDetail';
import MarketplaceHome from './components/marketplace/MarketplaceHome';
import NFTListingForm from './components/marketplace/NFTListingForm';
import NFTAuctionForm from './components/marketplace/NFTAuctionForm';
import NFTMarketDetail from './components/marketplace/NFTMarketDetail';
import MyListings from './components/marketplace/MyListings';
import MyPurchases from './components/marketplace/MyPurchases';
import TokenWallet from './components/token/TokenWallet';
import TokenStaking from './components/token/TokenStaking';
import RewardCenter from './components/token/RewardCenter';
import { MarketplaceProvider } from './context/marketplace/MarketplaceContext';
import { TokenProvider } from './context/token/TokenContext';
import './App.css';
import './styles/blockchain.css';
import './styles/marketplace.css';
import './styles/token.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>CultureBridge</h1>
        <div className="wallet-section">
          <WalletConnector />
        </div>
      </header>
      
      <main className="App-main">
        <TokenProvider>
          <MarketplaceProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mint" element={<NFTMinter />} />
              <Route path="/gallery" element={<NFTGallery />} />
              <Route path="/nft/:tokenId" element={<NFTDetailWrapper />} />
              <Route path="/marketplace" element={<MarketplaceHome />} />
              <Route path="/list-nft" element={<NFTListingForm />} />
              <Route path="/list-auction" element={<NFTAuctionForm />} />
              <Route path="/market-item/:nftContract/:tokenId" element={<NFTMarketDetail />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/my-purchases" element={<MyPurchases />} />
              <Route path="/token/wallet" element={<TokenWallet />} />
              <Route path="/token/staking" element={<TokenStaking />} />
              <Route path="/token/rewards" element={<RewardCenter />} />
            </Routes>
          </MarketplaceProvider>
        </TokenProvider>
      </main>
      
      <footer className="App-footer">
        <p>CultureBridge - 基于区块链的跨文化交流平台</p>
      </footer>
    </div>
  );
}

// 首页组件
function Home() {
  return (
    <div className="home-container">
      <h2>欢迎来到CultureBridge</h2>
      <p>探索基于区块链的跨文化交流新体验</p>
      
      <div className="feature-cards">
        <div className="feature-card">
          <h3>创建文化NFT</h3>
          <p>将您的文化作品铸造为NFT，确保数字所有权</p>
          <a href="/mint" className="feature-link">开始创建</a>
        </div>
        
        <div className="feature-card">
          <h3>浏览NFT画廊</h3>
          <p>探索来自世界各地的文化艺术品</p>
          <a href="/gallery" className="feature-link">查看画廊</a>
        </div>
        
        <div className="feature-card">
          <h3>NFT市场</h3>
          <p>交易独特的文化NFT资产</p>
          <a href="/marketplace" className="feature-link">进入市场</a>
        </div>
        
        <div className="feature-card">
          <h3>文化通证</h3>
          <p>获取和使用CULT代币，参与平台生态</p>
          <a href="/token/wallet" className="feature-link">管理代币</a>
        </div>
      </div>
    </div>
  );
}

// NFT详情包装组件，用于获取路由参数
function NFTDetailWrapper() {
  const tokenId = window.location.pathname.split('/').pop();
  return <NFTDetail tokenId={tokenId} />;
}

export default App;
```

### 4.2 样式设计

创建token.css样式文件，为文化通证组件提供样式。

```css
/* token.css */

/* 代币钱包样式 */
.token-wallet {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.wallet-header h2 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.refresh-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.refresh-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.balance-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.balance-info {
  text-align: center;
  margin-bottom: 20px;
}

.balance-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 18px;
}

.token-balance {
  font-size: 36px;
  font-weight: 500;
  color: #007bff;
}

.balance-amount {
  margin-right: 10px;
}

.token-symbol {
  font-size: 24px;
  color: #6c757d;
}

.wallet-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}

.transfer-btn {
  background-color: #007bff;
  color: white;
}

.history-btn {
  background-color: #6c757d;
  color: white;
}

.stake-btn {
  background-color: #28a745;
  color: white;
}

.rewards-btn {
  background-color: #6f42c1;
  color: white;
}

.transfer-section,
.history-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

/* 代币转账表单样式 */
.token-transfer {
  margin-bottom: 20px;
}

.token-transfer h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.transfer-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.input-with-max {
  display: flex;
  gap: 10px;
}

.input-with-max input {
  flex: 1;
}

.max-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 10px;
  cursor: pointer;
}

.transfer-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 18px;
  cursor: pointer;
}

.transfer-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 代币交易历史样式 */
.token-history {
  margin-bottom: 20px;
}

.token-history h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.history-table th {
  font-weight: 500;
  color: #555;
}

.transaction-type {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.type-send {
  background-color: #f8d7da;
  color: #721c24;
}

.type-receive {
  background-color: #d4edda;
  color: #155724;
}

.type-stake {
  background-color: #e6f7ff;
  color: #0070f3;
}

.type-reward {
  background-color: #fff3cd;
  color: #856404;
}

.address-cell {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-link {
  color: #007bff;
  text-decoration: none;
}

.transaction-link:hover {
  text-decoration: underline;
}

/* 代币质押样式 */
.token-staking {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.token-staking h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 28px;
}

.staking-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.staking-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.info-card {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
}

.info-value {
  font-size: 24px;
  font-weight: 500;
  color: #007bff;
  margin-bottom: 10px;
}

.claim-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.claim-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.staking-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.action-card {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.action-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.stake-button,
.unstake-button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.stake-button {
  background-color: #28a745;
  color: white;
}

.stake-button:hover {
  background-color: #218838;
}

.unstake-button {
  background-color: #dc3545;
  color: white;
}

.unstake-button:hover {
  background-color: #c82333;
}

.stake-button:disabled,
.unstake-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.staking-benefits {
  background-color: #e6f7ff;
  padding: 20px;
  border-radius: 8px;
}

.staking-benefits h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.staking-benefits ul {
  margin: 0;
  padding-left: 20px;
}

.staking-benefits li {
  margin-bottom: 8px;
}

/* 奖励中心样式 */
.reward-center {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.reward-header h2 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.balance-display {
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 18px;
}

.balance-amount {
  font-weight: 500;
  color: #007bff;
  margin-left: 5px;
}

.tasks-container {
  margin-bottom: 30px;
}

.tasks-container h3 {
  margin-bottom: 15px;
  color: #333;
}

.no-tasks {
  text-align: center;
  color: #666;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.task-card.completed {
  border-left-color: #28a745;
  opacity: 0.7;
}

.task-info {
  flex: 1;
}

.task-info h4 {
  margin-top: 0;
  margin-bottom: 5px;
  color: #333;
}

.task-info p {
  margin-top: 0;
  margin-bottom: 10px;
  color: #666;
}

.task-reward {
  font-size: 14px;
}

.reward-amount {
  font-weight: 500;
  color: #007bff;
  margin-left: 5px;
}

.task-action {
  min-width: 120px;
  text-align: right;
}

.complete-task-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.complete-task-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.completed-badge {
  display: inline-block;
  background-color: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.reward-info {
  background-color: #e6f7ff;
  padding: 20px;
  border-radius: 8px;
}

.reward-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.reward-info ul {
  margin: 0;
  padding-left: 20px;
}

.reward-info li {
  margin-bottom: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .staking-info,
  .staking-actions {
    grid-template-columns: 1fr;
  }
  
  .wallet-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .task-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .task-action {
    width: 100%;
    margin-top: 15px;
    text-align: left;
  }
  
  .complete-task-btn {
    width: 100%;
  }
}
```

## 5. 数据流设计

### 5.1 文化通证数据流

```
用户操作 -> 前端组件 -> 代币上下文 -> 合约接口 -> 区块链网络
                                  -> 本地状态管理

区块链网络 -> 合约接口 -> 代币上下文 -> 前端组件 -> 用户界面
```

### 5.2 状态管理

- **全局状态**：通过TokenContext管理代币全局状态
- **组件状态**：各组件通过useState管理本地状态
- **区块链状态**：通过BlockchainContext管理钱包连接和网络状态

### 5.3 事件监听

监听区块链事件，实时更新代币状态。

```javascript
// 在TokenContext中添加事件监听
useEffect(() => {
  if (active && library && chainId) {
    const contract = getCultureTokenContract(library, chainId);
    
    // 监听转账事件
    const fromFilter = contract.filters.Transfer(account);
    const toFilter = contract.filters.Transfer(null, account);
    const stakedFilter = contract.filters.Staked(account);
    const unstakedFilter = contract.filters.Unstaked(account);
    const rewardFilter = contract.filters.RewardPaid(account);
    
    const handleTransfer = () => refreshBalance();
    const handleStaked = () => {
      refreshBalance();
      refreshStakedAmount();
    };
    const handleUnstaked = () => {
      refreshBalance();
      refreshStakedAmount();
    };
    const handleReward = () => {
      refreshBalance();
      refreshReward();
    };
    
    contract.on(fromFilter, handleTransfer);
    contract.on(toFilter, handleTransfer);
    contract.on(stakedFilter, handleStaked);
    contract.on(unstakedFilter, handleUnstaked);
    contract.on(rewardFilter, handleReward);
    
    return () => {
      contract.off(fromFilter, handleTransfer);
      contract.off(toFilter, handleTransfer);
      contract.off(stakedFilter, handleStaked);
      contract.off(unstakedFilter, handleUnstaked);
      contract.off(rewardFilter, handleReward);
    };
  }
}, [active, account, library, chainId]);
```

## 6. 实施计划

### 6.1 开发阶段

1. **第一阶段**：实现文化通证合约接口和基础组件
   - 开发CultureToken.js合约接口
   - 实现TokenContext上下文
   - 开发TokenWallet组件

2. **第二阶段**：实现代币转账和交易历史功能
   - 开发TokenTransfer组件
   - 开发TokenHistory组件
   - 集成到钱包页面

3. **第三阶段**：实现代币质押和奖励功能
   - 开发TokenStaking组件
   - 开发StakingRewards组件
   - 实现质押奖励计算和领取

4. **第四阶段**：实现奖励中心和任务系统
   - 开发RewardCenter组件
   - 实现任务完成和奖励发放
   - 集成到用户界面

### 6.2 测试计划

- **单元测试**：测试各合约接口函数
- **集成测试**：测试组件与合约的交互
- **用户流程测试**：测试完整的用户操作流程
- **兼容性测试**：测试不同浏览器和设备的兼容性

## 7. 总结

本技术方案详细设计了CultureBridge平台文化通证(ERC-20)系统的实现方案，包括智能合约接口、前端组件结构和数据流设计。通过实现代币钱包、转账、质押、奖励等功能，将为平台提供经济激励基础，促进用户参与文化交流和创作。

后续将按照实施计划逐步开发和测试各功能模块，确保文化通证系统的稳定性和用户体验。同时，将与NFT市场功能集成，实现代币支付和奖励机制，为平台生态提供更完善的经济模型。
