import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain/BlockchainContext';
import { 
  CBT_TOKEN_CONFIG,
  getContractAddresses,
  isBNBChain,
  formatCBT
} from '../../config/bnbChainConfig';
import './CBTTokenManager.css';

/**
 * CBT代币管理器组件
 * 提供CBT代币的转账、质押、查询等功能
 */
const CBTTokenManager = () => {
  const { account, chainId, active, library } = useBlockchain();

  // 状态管理
  const [cbtBalance, setCbtBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('transfer');
  
  // 转账相关状态
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  
  // 质押相关状态
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeLoading, setStakeLoading] = useState(false);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [stakingRewards, setStakingRewards] = useState('0');
  
  // 授权相关状态
  const [approveAmount, setApproveAmount] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);

  // 合约实例
  const [cbtContract, setCbtContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);

  // 检查是否在正确的网络
  const isCorrectNetwork = isBNBChain(chainId);

  // CBT代币ABI（简化版）
  const CBT_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
  ];

  // 质押合约ABI（简化版）
  const STAKING_ABI = [
    'function deposit(uint256 _pid, uint256 _amount)',
    'function withdraw(uint256 _pid, uint256 _amount)',
    'function harvest(uint256 _pid)',
    'function pendingCBT(uint256 _pid, address _user) view returns (uint256)',
    'function userInfo(uint256 _pid, address _user) view returns (uint256 amount, uint256 rewardDebt, uint256 stakeTime, uint256 lastClaimTime)',
    'function poolInfo(uint256 _pid) view returns (uint256 allocPoint, uint256 lastRewardBlock, uint256 accCBTPerShare, uint256 totalStaked, uint256 minStakeAmount, uint256 lockPeriod)'
  ];

  // 初始化合约
  useEffect(() => {
    if (active && library && isCorrectNetwork) {
      const cbtConfig = CBT_TOKEN_CONFIG[chainId === 56 ? 'mainnet' : 'testnet'];
      const contractAddresses = getContractAddresses(chainId);

      if (cbtConfig.address && cbtConfig.address !== '0x...') {
        const cbtContractInstance = new ethers.Contract(
          cbtConfig.address,
          CBT_ABI,
          library.getSigner()
        );
        setCbtContract(cbtContractInstance);

        if (contractAddresses.CBT_STAKING && contractAddresses.CBT_STAKING !== '0x...') {
          const stakingContractInstance = new ethers.Contract(
            contractAddresses.CBT_STAKING,
            STAKING_ABI,
            library.getSigner()
          );
          setStakingContract(stakingContractInstance);
        }
      }
    }
  }, [active, library, chainId, isCorrectNetwork]);

  // 获取CBT余额
  const fetchCBTBalance = useCallback(async () => {
    if (!cbtContract || !account) return;

    try {
      const balance = await cbtContract.balanceOf(account);
      const decimals = await cbtContract.decimals();
      setCbtBalance(ethers.utils.formatUnits(balance, decimals));
    } catch (error) {
      console.error('获取CBT余额失败:', error);
    }
  }, [cbtContract, account]);

  // 获取授权额度
  const fetchAllowance = useCallback(async () => {
    if (!cbtContract || !stakingContract || !account) return;

    try {
      const allowanceAmount = await cbtContract.allowance(account, stakingContract.address);
      const decimals = await cbtContract.decimals();
      setAllowance(ethers.utils.formatUnits(allowanceAmount, decimals));
    } catch (error) {
      console.error('获取授权额度失败:', error);
    }
  }, [cbtContract, stakingContract, account]);

  // 获取质押信息
  const fetchStakingInfo = useCallback(async () => {
    if (!stakingContract || !account) return;

    try {
      // 假设使用池ID 0
      const userInfo = await stakingContract.userInfo(0, account);
      const pendingRewards = await stakingContract.pendingCBT(0, account);
      
      setStakedAmount(ethers.utils.formatEther(userInfo.amount));
      setStakingRewards(ethers.utils.formatEther(pendingRewards));
    } catch (error) {
      console.error('获取质押信息失败:', error);
    }
  }, [stakingContract, account]);

  // 初始化数据
  useEffect(() => {
    if (cbtContract && account) {
      fetchCBTBalance();
      fetchAllowance();
      fetchStakingInfo();
    }
  }, [cbtContract, account, fetchCBTBalance, fetchAllowance, fetchStakingInfo]);

  // 转账CBT代币
  const handleTransfer = async () => {
    if (!cbtContract || !transferTo || !transferAmount) return;

    setTransferLoading(true);
    try {
      const decimals = await cbtContract.decimals();
      const amount = ethers.utils.parseUnits(transferAmount, decimals);
      
      const tx = await cbtContract.transfer(transferTo, amount);
      await tx.wait();
      
      // 刷新余额
      await fetchCBTBalance();
      
      // 清空表单
      setTransferTo('');
      setTransferAmount('');
      
      alert('转账成功！');
    } catch (error) {
      console.error('转账失败:', error);
      alert('转账失败: ' + error.message);
    } finally {
      setTransferLoading(false);
    }
  };

  // 授权CBT代币给质押合约
  const handleApprove = async () => {
    if (!cbtContract || !stakingContract || !approveAmount) return;

    setApproveLoading(true);
    try {
      const decimals = await cbtContract.decimals();
      const amount = ethers.utils.parseUnits(approveAmount, decimals);
      
      const tx = await cbtContract.approve(stakingContract.address, amount);
      await tx.wait();
      
      // 刷新授权额度
      await fetchAllowance();
      
      setApproveAmount('');
      alert('授权成功！');
    } catch (error) {
      console.error('授权失败:', error);
      alert('授权失败: ' + error.message);
    } finally {
      setApproveLoading(false);
    }
  };

  // 质押CBT代币
  const handleStake = async () => {
    if (!stakingContract || !stakeAmount) return;

    setStakeLoading(true);
    try {
      const amount = ethers.utils.parseEther(stakeAmount);
      
      // 检查授权额度
      if (parseFloat(allowance) < parseFloat(stakeAmount)) {
        alert('授权额度不足，请先授权');
        return;
      }
      
      const tx = await stakingContract.deposit(0, amount); // 使用池ID 0
      await tx.wait();
      
      // 刷新数据
      await fetchCBTBalance();
      await fetchAllowance();
      await fetchStakingInfo();
      
      setStakeAmount('');
      alert('质押成功！');
    } catch (error) {
      console.error('质押失败:', error);
      alert('质押失败: ' + error.message);
    } finally {
      setStakeLoading(false);
    }
  };

  // 领取质押奖励
  const handleHarvest = async () => {
    if (!stakingContract) return;

    setIsLoading(true);
    try {
      const tx = await stakingContract.harvest(0); // 使用池ID 0
      await tx.wait();
      
      // 刷新数据
      await fetchCBTBalance();
      await fetchStakingInfo();
      
      alert('领取奖励成功！');
    } catch (error) {
      console.error('领取奖励失败:', error);
      alert('领取奖励失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 取消质押
  const handleUnstake = async (amount) => {
    if (!stakingContract || !amount) return;

    setIsLoading(true);
    try {
      const unstakeAmount = ethers.utils.parseEther(amount);
      const tx = await stakingContract.withdraw(0, unstakeAmount); // 使用池ID 0
      await tx.wait();
      
      // 刷新数据
      await fetchCBTBalance();
      await fetchStakingInfo();
      
      alert('取消质押成功！');
    } catch (error) {
      console.error('取消质押失败:', error);
      alert('取消质押失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!active) {
    return (
      <div className="cbt-token-manager">
        <div className="not-connected">
          <h3>请先连接钱包</h3>
          <p>需要连接钱包才能使用CBT代币功能</p>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="cbt-token-manager">
        <div className="wrong-network">
          <h3>网络错误</h3>
          <p>请切换到BNB智能链以使用CBT代币功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cbt-token-manager">
      <div className="manager-header">
        <h2>CBT代币管理</h2>
        <div className="balance-display">
          <span className="balance-label">CBT余额:</span>
          <span className="balance-value">{formatCBT(cbtBalance)} CBT</span>
        </div>
      </div>

      <div className="manager-tabs">
        <button 
          className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          转账
        </button>
        <button 
          className={`tab-btn ${activeTab === 'staking' ? 'active' : ''}`}
          onClick={() => setActiveTab('staking')}
        >
          质押
        </button>
        <button 
          className={`tab-btn ${activeTab === 'approve' ? 'active' : ''}`}
          onClick={() => setActiveTab('approve')}
        >
          授权
        </button>
      </div>

      <div className="manager-content">
        {activeTab === 'transfer' && (
          <div className="transfer-section">
            <h3>转账CBT代币</h3>
            <div className="form-group">
              <label>接收地址:</label>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
                className="address-input"
              />
            </div>
            <div className="form-group">
              <label>转账数量:</label>
              <div className="amount-input-group">
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.0"
                  className="amount-input"
                />
                <span className="token-symbol">CBT</span>
              </div>
            </div>
            <button 
              className="action-button"
              onClick={handleTransfer}
              disabled={transferLoading || !transferTo || !transferAmount}
            >
              {transferLoading ? '转账中...' : '转账'}
            </button>
          </div>
        )}

        {activeTab === 'staking' && (
          <div className="staking-section">
            <h3>CBT代币质押</h3>
            
            <div className="staking-info">
              <div className="info-card">
                <div className="info-label">已质押数量</div>
                <div className="info-value">{formatCBT(stakedAmount)} CBT</div>
              </div>
              <div className="info-card">
                <div className="info-label">待领取奖励</div>
                <div className="info-value">{formatCBT(stakingRewards)} CBT</div>
              </div>
            </div>

            <div className="form-group">
              <label>质押数量:</label>
              <div className="amount-input-group">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="amount-input"
                />
                <span className="token-symbol">CBT</span>
              </div>
            </div>

            <div className="staking-actions">
              <button 
                className="action-button"
                onClick={handleStake}
                disabled={stakeLoading || !stakeAmount}
              >
                {stakeLoading ? '质押中...' : '质押'}
              </button>
              <button 
                className="action-button secondary"
                onClick={handleHarvest}
                disabled={isLoading || parseFloat(stakingRewards) === 0}
              >
                {isLoading ? '领取中...' : '领取奖励'}
              </button>
              <button 
                className="action-button danger"
                onClick={() => handleUnstake(stakedAmount)}
                disabled={isLoading || parseFloat(stakedAmount) === 0}
              >
                {isLoading ? '取消中...' : '取消质押'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'approve' && (
          <div className="approve-section">
            <h3>授权CBT代币</h3>
            <p className="approve-description">
              在质押CBT代币之前，需要先授权质押合约使用您的代币。
            </p>
            
            <div className="current-allowance">
              <span className="allowance-label">当前授权额度:</span>
              <span className="allowance-value">{formatCBT(allowance)} CBT</span>
            </div>

            <div className="form-group">
              <label>授权数量:</label>
              <div className="amount-input-group">
                <input
                  type="number"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  placeholder="0.0"
                  className="amount-input"
                />
                <span className="token-symbol">CBT</span>
              </div>
            </div>

            <div className="approve-actions">
              <button 
                className="action-button"
                onClick={handleApprove}
                disabled={approveLoading || !approveAmount}
              >
                {approveLoading ? '授权中...' : '授权'}
              </button>
              <button 
                className="action-button secondary"
                onClick={() => setApproveAmount(cbtBalance)}
              >
                授权全部
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CBTTokenManager;

