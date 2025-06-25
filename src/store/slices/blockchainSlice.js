/**
 * 区块链状态管理
 * 处理钱包、代币、质押等区块链相关状态
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步action：连接钱包
export const connectWallet = createAsyncThunk(
  'blockchain/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      // 模拟钱包连接
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            address: '0x1234567890abcdef1234567890abcdef12345678',
            balance: 2850,
            network: 'BSC Testnet'
          });
        }, 1000);
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步action：获取代币余额
export const getTokenBalance = createAsyncThunk(
  'blockchain/getTokenBalance',
  async (address, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            balance: 2850,
            usdValue: 142.50,
            stakingRewards: 125,
            totalEarned: 3200
          });
        }, 500);
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 钱包状态
  isConnected: false,
  walletAddress: null,
  network: null,
  isConnecting: false,
  
  // 代币信息
  balance: 0,
  usdValue: 0,
  stakingRewards: 0,
  totalEarned: 0,
  
  // 交易历史
  transactions: [
    {
      id: 1,
      type: 'reward',
      amount: 50,
      description: '完成文化学习任务',
      time: '2小时前',
      status: 'completed',
      hash: '0xabc123...'
    },
    {
      id: 2,
      type: 'stake',
      amount: -100,
      description: '质押代币获得奖励',
      time: '1天前',
      status: 'completed',
      hash: '0xdef456...'
    }
  ],
  
  // 质押池
  stakingPools: [
    {
      id: 1,
      name: '文化探索池',
      apy: 12.5,
      totalStaked: 150000,
      myStake: 500,
      rewards: 25,
      lockPeriod: '30天'
    },
    {
      id: 2,
      name: '语言学习池',
      apy: 15.2,
      totalStaked: 80000,
      myStake: 0,
      rewards: 0,
      lockPeriod: '60天'
    }
  ],
  
  // 奖励任务
  rewardTasks: [
    { id: 1, task: '每日签到', reward: 10, progress: 100, icon: '📅' },
    { id: 2, task: '完成文化学习', reward: 25, progress: 60, icon: '📚' },
    { id: 3, task: '参与社区讨论', reward: 15, progress: 80, icon: '💬' },
    { id: 4, task: '分享文化内容', reward: 20, progress: 40, icon: '📤' }
  ],
  
  // 加载状态
  isLoading: false,
  error: null,
  
  // 交易状态
  isTransacting: false,
  pendingTx: null,
};

// 创建slice
const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState,
  reducers: {
    // 断开钱包连接
    disconnectWallet: (state) => {
      state.isConnected = false;
      state.walletAddress = null;
      state.network = null;
      state.balance = 0;
      state.usdValue = 0;
      state.stakingRewards = 0;
      state.totalEarned = 0;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 添加交易记录
    addTransaction: (state, action) => {
      const newTx = {
        id: Date.now(),
        ...action.payload,
        time: '刚刚',
        status: 'pending'
      };
      state.transactions.unshift(newTx);
    },
    
    // 更新交易状态
    updateTransactionStatus: (state, action) => {
      const { id, status, hash } = action.payload;
      const tx = state.transactions.find(t => t.id === id);
      if (tx) {
        tx.status = status;
        if (hash) tx.hash = hash;
      }
    },
    
    // 更新质押池信息
    updateStakingPool: (state, action) => {
      const { poolId, updates } = action.payload;
      const pool = state.stakingPools.find(p => p.id === poolId);
      if (pool) {
        Object.assign(pool, updates);
      }
    },
    
    // 更新任务进度
    updateTaskProgress: (state, action) => {
      const { taskId, progress } = action.payload;
      const task = state.rewardTasks.find(t => t.id === taskId);
      if (task) {
        task.progress = progress;
      }
    },
    
    // 领取任务奖励
    claimTaskReward: (state, action) => {
      const taskId = action.payload;
      const task = state.rewardTasks.find(t => t.id === taskId);
      if (task && task.progress === 100) {
        state.balance += task.reward;
        state.totalEarned += task.reward;
        task.progress = 0; // 重置进度
      }
    },
    
    // 设置交易状态
    setTransacting: (state, action) => {
      state.isTransacting = action.payload;
    },
    
    // 设置待处理交易
    setPendingTx: (state, action) => {
      state.pendingTx = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 连接钱包
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.walletAddress = action.payload.address;
        state.balance = action.payload.balance;
        state.network = action.payload.network;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload;
      });
    
    // 获取代币余额
    builder
      .addCase(getTokenBalance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTokenBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
        state.usdValue = action.payload.usdValue;
        state.stakingRewards = action.payload.stakingRewards;
        state.totalEarned = action.payload.totalEarned;
      })
      .addCase(getTokenBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// 导出actions
export const {
  disconnectWallet,
  clearError,
  addTransaction,
  updateTransactionStatus,
  updateStakingPool,
  updateTaskProgress,
  claimTaskReward,
  setTransacting,
  setPendingTx,
} = blockchainSlice.actions;

// 选择器
export const selectBlockchain = (state) => state.blockchain;
export const selectWalletAddress = (state) => state.blockchain.walletAddress;
export const selectIsConnected = (state) => state.blockchain.isConnected;
export const selectBalance = (state) => state.blockchain.balance;
export const selectUsdValue = (state) => state.blockchain.usdValue;
export const selectStakingRewards = (state) => state.blockchain.stakingRewards;
export const selectTotalEarned = (state) => state.blockchain.totalEarned;
export const selectTransactions = (state) => state.blockchain.transactions;
export const selectStakingPools = (state) => state.blockchain.stakingPools;
export const selectRewardTasks = (state) => state.blockchain.rewardTasks;
export const selectIsConnecting = (state) => state.blockchain.isConnecting;
export const selectIsLoading = (state) => state.blockchain.isLoading;
export const selectBlockchainError = (state) => state.blockchain.error;
export const selectIsTransacting = (state) => state.blockchain.isTransacting;
export const selectPendingTx = (state) => state.blockchain.pendingTx;

// 导出reducer
export default blockchainSlice.reducer;

