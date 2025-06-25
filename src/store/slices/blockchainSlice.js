/**
 * 区块链状态管理
 * 处理钱包连接、代币交易、智能合约交互等
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blockchainAPI } from '../services/api';

// 异步action：连接钱包
export const connectWallet = createAsyncThunk(
  'blockchain/connectWallet',
  async (walletType, { rejectWithValue }) => {
    try {
      const response = await blockchainAPI.connectWallet(walletType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：获取钱包余额
export const fetchWalletBalance = createAsyncThunk(
  'blockchain/fetchWalletBalance',
  async (address, { rejectWithValue }) => {
    try {
      const response = await blockchainAPI.getBalance(address);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：发送代币
export const sendTokens = createAsyncThunk(
  'blockchain/sendTokens',
  async ({ to, amount, memo }, { rejectWithValue }) => {
    try {
      const response = await blockchainAPI.sendTokens(to, amount, memo);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：获取交易历史
export const fetchTransactionHistory = createAsyncThunk(
  'blockchain/fetchTransactionHistory',
  async ({ address, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await blockchainAPI.getTransactionHistory(address, { page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：质押代币
export const stakeTokens = createAsyncThunk(
  'blockchain/stakeTokens',
  async ({ amount, duration }, { rejectWithValue }) => {
    try {
      const response = await blockchainAPI.stakeTokens(amount, duration);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：取消质押
export const unstakeTokens = createAsyncThunk(
  'blockchain/unstakeTokens',
  async (stakeId, { rejectWithValue }) => {
    try {
      const response = await blockchainAPI.unstakeTokens(stakeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 钱包连接状态
  wallet: {
    isConnected: false,
    address: null,
    type: null, // 'metamask', 'walletconnect', 'coinbase'
    chainId: null,
    isConnecting: false,
  },
  
  // 网络信息
  network: {
    chainId: 56, // BSC主网
    name: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  
  // 代币信息
  tokens: {
    CBT: {
      address: '0x742d35Cc6634C0532925a3b8D4C2F8b4C4b4b4b4',
      symbol: 'CBT',
      name: 'CultureBridge Token',
      decimals: 18,
      balance: '0',
      price: 0,
      priceChange24h: 0,
    },
    BNB: {
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
      balance: '0',
      price: 0,
      priceChange24h: 0,
    },
  },
  
  // 交易历史
  transactions: {
    list: [],
    pending: [],
    hasMore: true,
    isLoading: false,
  },
  
  // 质押信息
  staking: {
    totalStaked: '0',
    availableRewards: '0',
    stakingPools: [],
    userStakes: [],
    apy: 0,
  },
  
  // 奖励系统
  rewards: {
    totalEarned: '0',
    pendingRewards: '0',
    claimableRewards: '0',
    rewardHistory: [],
    multiplier: 1,
  },
  
  // 智能合约状态
  contracts: {
    CBT: {
      address: '0x742d35Cc6634C0532925a3b8D4C2F8b4C4b4b4b4',
      abi: null,
      instance: null,
    },
    Staking: {
      address: '0x...',
      abi: null,
      instance: null,
    },
    Rewards: {
      address: '0x...',
      abi: null,
      instance: null,
    },
  },
  
  // 交易状态
  transaction: {
    isProcessing: false,
    hash: null,
    status: null, // 'pending', 'confirmed', 'failed'
    gasPrice: null,
    gasLimit: null,
  },
  
  // 价格信息
  prices: {
    CBT: {
      usd: 0,
      bnb: 0,
      change24h: 0,
      volume24h: 0,
      marketCap: 0,
    },
    BNB: {
      usd: 0,
      change24h: 0,
      volume24h: 0,
    },
  },
  
  // DeFi功能
  defi: {
    liquidityPools: [],
    userLiquidity: [],
    farming: {
      pools: [],
      userFarms: [],
    },
    lending: {
      markets: [],
      userPositions: [],
    },
  },
  
  // NFT相关
  nfts: {
    collections: [],
    userNFTs: [],
    marketplace: {
      listings: [],
      offers: [],
    },
  },
  
  // 治理
  governance: {
    proposals: [],
    userVotes: [],
    votingPower: '0',
    delegatedTo: null,
  },
  
  // 错误和加载状态
  isLoading: false,
  error: null,
  
  // 设置
  settings: {
    autoApprove: false,
    slippageTolerance: 0.5, // %
    gasPrice: 'standard', // 'slow', 'standard', 'fast'
    notifications: {
      transactions: true,
      rewards: true,
      governance: true,
    },
  },
};

// 创建slice
const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 断开钱包连接
    disconnectWallet: (state) => {
      state.wallet = {
        isConnected: false,
        address: null,
        type: null,
        chainId: null,
        isConnecting: false,
      };
      
      // 清除相关数据
      Object.keys(state.tokens).forEach(key => {
        state.tokens[key].balance = '0';
      });
      state.transactions.list = [];
      state.staking.userStakes = [];
      state.rewards.pendingRewards = '0';
    },
    
    // 切换网络
    switchNetwork: (state, action) => {
      const networkConfig = action.payload;
      state.network = { ...state.network, ...networkConfig };
    },
    
    // 更新代币余额
    updateTokenBalance: (state, action) => {
      const { symbol, balance } = action.payload;
      if (state.tokens[symbol]) {
        state.tokens[symbol].balance = balance;
      }
    },
    
    // 更新代币价格
    updateTokenPrice: (state, action) => {
      const { symbol, price, priceChange24h } = action.payload;
      if (state.tokens[symbol]) {
        state.tokens[symbol].price = price;
        state.tokens[symbol].priceChange24h = priceChange24h;
      }
    },
    
    // 添加待处理交易
    addPendingTransaction: (state, action) => {
      const transaction = {
        ...action.payload,
        status: 'pending',
        timestamp: Date.now(),
      };
      state.transactions.pending.push(transaction);
    },
    
    // 更新交易状态
    updateTransactionStatus: (state, action) => {
      const { hash, status, blockNumber } = action.payload;
      
      // 更新待处理交易
      const pendingIndex = state.transactions.pending.findIndex(tx => tx.hash === hash);
      if (pendingIndex >= 0) {
        if (status === 'confirmed') {
          // 移动到历史记录
          const transaction = {
            ...state.transactions.pending[pendingIndex],
            status,
            blockNumber,
            confirmedAt: Date.now(),
          };
          state.transactions.list.unshift(transaction);
          state.transactions.pending.splice(pendingIndex, 1);
        } else {
          state.transactions.pending[pendingIndex].status = status;
        }
      }
      
      // 更新当前交易状态
      if (state.transaction.hash === hash) {
        state.transaction.status = status;
        if (status !== 'pending') {
          state.transaction.isProcessing = false;
        }
      }
    },
    
    // 开始交易
    startTransaction: (state, action) => {
      state.transaction = {
        isProcessing: true,
        hash: null,
        status: 'pending',
        gasPrice: action.payload.gasPrice,
        gasLimit: action.payload.gasLimit,
      };
    },
    
    // 设置交易哈希
    setTransactionHash: (state, action) => {
      state.transaction.hash = action.payload;
    },
    
    // 完成交易
    completeTransaction: (state, action) => {
      state.transaction = {
        isProcessing: false,
        hash: null,
        status: null,
        gasPrice: null,
        gasLimit: null,
      };
    },
    
    // 更新质押信息
    updateStakingInfo: (state, action) => {
      state.staking = { ...state.staking, ...action.payload };
    },
    
    // 添加用户质押
    addUserStake: (state, action) => {
      const stake = action.payload;
      const existingIndex = state.staking.userStakes.findIndex(s => s.id === stake.id);
      
      if (existingIndex >= 0) {
        state.staking.userStakes[existingIndex] = stake;
      } else {
        state.staking.userStakes.push(stake);
      }
    },
    
    // 移除用户质押
    removeUserStake: (state, action) => {
      const stakeId = action.payload;
      state.staking.userStakes = state.staking.userStakes.filter(s => s.id !== stakeId);
    },
    
    // 更新奖励信息
    updateRewards: (state, action) => {
      state.rewards = { ...state.rewards, ...action.payload };
    },
    
    // 领取奖励
    claimRewards: (state, action) => {
      const { amount, txHash } = action.payload;
      state.rewards.claimableRewards = '0';
      state.rewards.totalEarned = (parseFloat(state.rewards.totalEarned) + parseFloat(amount)).toString();
      
      // 添加到奖励历史
      state.rewards.rewardHistory.unshift({
        amount,
        txHash,
        timestamp: Date.now(),
        type: 'claim',
      });
    },
    
    // 更新价格信息
    updatePrices: (state, action) => {
      state.prices = { ...state.prices, ...action.payload };
    },
    
    // 更新DeFi信息
    updateDefiInfo: (state, action) => {
      const { type, data } = action.payload;
      if (state.defi[type]) {
        state.defi[type] = { ...state.defi[type], ...data };
      }
    },
    
    // 添加NFT
    addNFT: (state, action) => {
      const nft = action.payload;
      const exists = state.nfts.userNFTs.find(n => n.tokenId === nft.tokenId && n.contract === nft.contract);
      if (!exists) {
        state.nfts.userNFTs.push(nft);
      }
    },
    
    // 移除NFT
    removeNFT: (state, action) => {
      const { tokenId, contract } = action.payload;
      state.nfts.userNFTs = state.nfts.userNFTs.filter(
        n => !(n.tokenId === tokenId && n.contract === contract)
      );
    },
    
    // 更新治理信息
    updateGovernance: (state, action) => {
      state.governance = { ...state.governance, ...action.payload };
    },
    
    // 投票
    vote: (state, action) => {
      const { proposalId, choice, votingPower } = action.payload;
      
      // 更新用户投票记录
      const existingVote = state.governance.userVotes.find(v => v.proposalId === proposalId);
      if (existingVote) {
        existingVote.choice = choice;
        existingVote.votingPower = votingPower;
      } else {
        state.governance.userVotes.push({
          proposalId,
          choice,
          votingPower,
          timestamp: Date.now(),
        });
      }
    },
    
    // 更新设置
    updateBlockchainSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // 设置合约实例
    setContractInstance: (state, action) => {
      const { name, instance, abi } = action.payload;
      if (state.contracts[name]) {
        state.contracts[name].instance = instance;
        state.contracts[name].abi = abi;
      }
    },
    
    // 更新Gas价格
    updateGasPrice: (state, action) => {
      state.transaction.gasPrice = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 连接钱包
    builder
      .addCase(connectWallet.pending, (state) => {
        state.wallet.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.wallet = {
          isConnected: true,
          address: action.payload.address,
          type: action.payload.type,
          chainId: action.payload.chainId,
          isConnecting: false,
        };
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.wallet.isConnecting = false;
        state.error = action.payload;
      });
    
    // 获取钱包余额
    builder
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        const balances = action.payload;
        Object.keys(balances).forEach(symbol => {
          if (state.tokens[symbol]) {
            state.tokens[symbol].balance = balances[symbol];
          }
        });
      });
    
    // 发送代币
    builder
      .addCase(sendTokens.pending, (state) => {
        state.transaction.isProcessing = true;
      })
      .addCase(sendTokens.fulfilled, (state, action) => {
        const { txHash, from, to, amount, symbol } = action.payload;
        
        // 更新余额
        if (state.tokens[symbol]) {
          const currentBalance = parseFloat(state.tokens[symbol].balance);
          state.tokens[symbol].balance = (currentBalance - parseFloat(amount)).toString();
        }
        
        // 添加到交易历史
        state.transactions.list.unshift({
          hash: txHash,
          from,
          to,
          amount,
          symbol,
          type: 'send',
          status: 'pending',
          timestamp: Date.now(),
        });
        
        state.transaction.hash = txHash;
      })
      .addCase(sendTokens.rejected, (state, action) => {
        state.transaction.isProcessing = false;
        state.error = action.payload;
      });
    
    // 获取交易历史
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.transactions.isLoading = true;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        const { transactions, hasMore } = action.payload;
        state.transactions.list = [...state.transactions.list, ...transactions];
        state.transactions.hasMore = hasMore;
        state.transactions.isLoading = false;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.transactions.isLoading = false;
        state.error = action.payload;
      });
    
    // 质押代币
    builder
      .addCase(stakeTokens.fulfilled, (state, action) => {
        const stake = action.payload;
        state.staking.userStakes.push(stake);
        
        // 更新总质押量
        const totalStaked = parseFloat(state.staking.totalStaked) + parseFloat(stake.amount);
        state.staking.totalStaked = totalStaked.toString();
      });
    
    // 取消质押
    builder
      .addCase(unstakeTokens.fulfilled, (state, action) => {
        const { stakeId, amount } = action.payload;
        
        // 移除质押记录
        state.staking.userStakes = state.staking.userStakes.filter(s => s.id !== stakeId);
        
        // 更新总质押量
        const totalStaked = parseFloat(state.staking.totalStaked) - parseFloat(amount);
        state.staking.totalStaked = Math.max(0, totalStaked).toString();
      });
  },
});

// 导出actions
export const {
  clearError,
  disconnectWallet,
  switchNetwork,
  updateTokenBalance,
  updateTokenPrice,
  addPendingTransaction,
  updateTransactionStatus,
  startTransaction,
  setTransactionHash,
  completeTransaction,
  updateStakingInfo,
  addUserStake,
  removeUserStake,
  updateRewards,
  claimRewards,
  updatePrices,
  updateDefiInfo,
  addNFT,
  removeNFT,
  updateGovernance,
  vote,
  updateBlockchainSettings,
  setContractInstance,
  updateGasPrice,
} = blockchainSlice.actions;

// 选择器
export const selectBlockchain = (state) => state.blockchain;
export const selectWallet = (state) => state.blockchain.wallet;
export const selectNetwork = (state) => state.blockchain.network;
export const selectTokens = (state) => state.blockchain.tokens;
export const selectTransactions = (state) => state.blockchain.transactions;
export const selectStaking = (state) => state.blockchain.staking;
export const selectRewards = (state) => state.blockchain.rewards;
export const selectPrices = (state) => state.blockchain.prices;
export const selectDefi = (state) => state.blockchain.defi;
export const selectNFTs = (state) => state.blockchain.nfts;
export const selectGovernance = (state) => state.blockchain.governance;
export const selectBlockchainSettings = (state) => state.blockchain.settings;

// 计算选择器
export const selectTotalPortfolioValue = (state) => {
  const tokens = state.blockchain.tokens;
  let total = 0;
  
  Object.values(tokens).forEach(token => {
    if (token.balance && token.price) {
      total += parseFloat(token.balance) * token.price;
    }
  });
  
  return total;
};

export const selectStakingAPY = (state) => {
  return state.blockchain.staking.apy || 0;
};

export const selectPendingTransactionCount = (state) => {
  return state.blockchain.transactions.pending.length;
};

export const selectIsWalletConnected = (state) => {
  return state.blockchain.wallet.isConnected;
};

export const selectCanClaim = (state) => {
  return parseFloat(state.blockchain.rewards.claimableRewards) > 0;
};

export default blockchainSlice.reducer;

