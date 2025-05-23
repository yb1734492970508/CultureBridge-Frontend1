import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './StakingDashboard.css';

// 质押合约ABI（简化版，实际使用时需要完整ABI）
const STAKING_ABI = [
  "function stake(uint256 amount, uint256 lockPeriod) external",
  "function withdraw(uint256 stakeId) external",
  "function getReward(uint256 stakeId) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function getAPY() external view returns (uint256)",
  "function getUserStakes(address user) external view returns (tuple(uint256 id, uint256 amount, uint256 startTime, uint256 endTime, uint256 lockPeriod, uint256 reward, bool claimed)[])",
  "function calculateReward(uint256 amount, uint256 lockPeriod) external view returns (uint256)"
];

// 代币合约ABI（简化版）
const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

// 质押合约地址（测试网）
const STAKING_ADDRESS = "0x9C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

// 代币合约地址（测试网）
const TOKEN_ADDRESS = "0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

/**
 * 代币质押仪表盘组件
 * 显示质押统计数据、用户质押信息和质押操作界面
 */
const StakingDashboard = () => {
  const { active, account, library } = useBlockchain();
  
  // 质押统计数据
  const [totalStaked, setTotalStaked] = useState('0');
  const [apy, setApy] = useState('0');
  const [userStaked, setUserStaked] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenAllowance, setTokenAllowance] = useState('0');
  
  // 用户质押记录
  const [userStakes, setUserStakes] = useState([]);
  
  // 质押操作状态
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakePeriod, setStakePeriod] = useState(30); // 默认30天
  const [estimatedReward, setEstimatedReward] = useState('0');
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [selectedStakeId, setSelectedStakeId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // 质押期限选项
  const stakePeriods = [
    { days: 7, label: '7天', multiplier: 1.0 },
    { days: 30, label: '30天', multiplier: 1.2 },
    { days: 90, label: '90天', multiplier: 1.5 },
    { days: 180, label: '180天', multiplier: 1.8 },
    { days: 365, label: '365天', multiplier: 2.0 }
  ];

  // 初始化合约实例
  const getStakingContract = () => {
    if (!library || !active) return null;
    return new ethers.Contract(
      STAKING_ADDRESS,
      STAKING_ABI,
      library.getSigner()
    );
  };

  const getTokenContract = () => {
    if (!library || !active) return null;
    return new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_ABI,
      library.getSigner()
    );
  };

  // 加载质押统计数据
  useEffect(() => {
    if (!active || !account || !library) return;
    
    const loadStakingData = async () => {
      try {
        const stakingContract = getStakingContract();
        const tokenContract = getTokenContract();
        
        if (!stakingContract || !tokenContract) return;
        
        // 获取总质押量
        const totalSupply = await stakingContract.totalSupply();
        setTotalStaked(ethers.utils.formatEther(totalSupply));
        
        // 获取当前APY
        const currentApy = await stakingContract.getAPY();
        setApy(currentApy.toString() / 100); // 假设APY以基点返回（1% = 100）
        
        // 获取用户质押量
        const userBalance = await stakingContract.balanceOf(account);
        setUserStaked(ethers.utils.formatEther(userBalance));
        
        // 获取用户代币余额
        const balance = await tokenContract.balanceOf(account);
        setTokenBalance(ethers.utils.formatEther(balance));
        
        // 获取代币授权额度
        const allowance = await tokenContract.allowance(account, STAKING_ADDRESS);
        setTokenAllowance(ethers.utils.formatEther(allowance));
        
        // 获取用户质押记录
        const stakes = await stakingContract.getUserStakes(account);
        
        // 处理质押记录数据
        const formattedStakes = stakes.map(stake => ({
          id: stake.id.toString(),
          amount: ethers.utils.formatEther(stake.amount),
          startTime: new Date(stake.startTime.toNumber() * 1000),
          endTime: new Date(stake.endTime.toNumber() * 1000),
          lockPeriod: stake.lockPeriod.toNumber() / 86400, // 转换为天数
          reward: ethers.utils.formatEther(stake.reward),
          claimed: stake.claimed,
          isEnded: Date.now() > stake.endTime.toNumber() * 1000
        }));
        
        setUserStakes(formattedStakes);
      } catch (err) {
        console.error('加载质押数据失败:', err);
        setError('加载质押数据失败，请刷新页面重试');
      }
    };
    
    loadStakingData();
    
    // 设置定期刷新
    const intervalId = setInterval(loadStakingData, 30000); // 每30秒刷新一次
    
    return () => clearInterval(intervalId);
  }, [active, account, library]);

  // 计算预估奖励
  useEffect(() => {
    if (!active || !stakeAmount || isNaN(parseFloat(stakeAmount))) {
      setEstimatedReward('0');
      return;
    }
    
    const calculateEstimatedReward = async () => {
      try {
        const stakingContract = getStakingContract();
        
        if (!stakingContract) return;
        
        const amount = ethers.utils.parseEther(stakeAmount);
        const reward = await stakingContract.calculateReward(amount, stakePeriod * 86400); // 转换为秒
        
        setEstimatedReward(ethers.utils.formatEther(reward));
      } catch (err) {
        console.error('计算预估奖励失败:', err);
        setEstimatedReward('计算失败');
      }
    };
    
    calculateEstimatedReward();
  }, [active, stakeAmount, stakePeriod, library]);

  // 授权代币
  const approveTokens = async () => {
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    if (!stakeAmount || isNaN(parseFloat(stakeAmount)) || parseFloat(stakeAmount) <= 0) {
      setError('请输入有效的质押金额');
      return;
    }
    
    setIsApproving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const tokenContract = getTokenContract();
      
      if (!tokenContract) {
        throw new Error('无法连接代币合约');
      }
      
      // 授权金额（可以授权一个较大的金额，避免频繁授权）
      const amount = ethers.utils.parseEther('1000000'); // 授权100万代币
      
      const tx = await tokenContract.approve(STAKING_ADDRESS, amount);
      
      setSuccessMessage('授权交易已提交，请等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      // 更新授权额度
      const newAllowance = await tokenContract.allowance(account, STAKING_ADDRESS);
      setTokenAllowance(ethers.utils.formatEther(newAllowance));
      
      setSuccessMessage('代币授权成功！');
    } catch (err) {
      console.error('代币授权失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else {
        setError(`代币授权失败: ${err.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsApproving(false);
    }
  };

  // 质押代币
  const stakeTokens = async () => {
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    if (!stakeAmount || isNaN(parseFloat(stakeAmount)) || parseFloat(stakeAmount) <= 0) {
      setError('请输入有效的质押金额');
      return;
    }
    
    const stakeAmountFloat = parseFloat(stakeAmount);
    const tokenBalanceFloat = parseFloat(tokenBalance);
    
    if (stakeAmountFloat > tokenBalanceFloat) {
      setError('质押金额超过您的余额');
      return;
    }
    
    const tokenAllowanceFloat = parseFloat(tokenAllowance);
    
    if (stakeAmountFloat > tokenAllowanceFloat) {
      setError('请先授权代币');
      return;
    }
    
    setIsStaking(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const stakingContract = getStakingContract();
      
      if (!stakingContract) {
        throw new Error('无法连接质押合约');
      }
      
      // 质押代币
      const amount = ethers.utils.parseEther(stakeAmount);
      const lockPeriodInSeconds = stakePeriod * 86400; // 转换为秒
      
      const tx = await stakingContract.stake(amount, lockPeriodInSeconds);
      
      setSuccessMessage('质押交易已提交，请等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      // 重置表单
      setStakeAmount('');
      
      // 刷新数据
      const userBalance = await stakingContract.balanceOf(account);
      setUserStaked(ethers.utils.formatEther(userBalance));
      
      const tokenContract = getTokenContract();
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.utils.formatEther(balance));
      
      const stakes = await stakingContract.getUserStakes(account);
      const formattedStakes = stakes.map(stake => ({
        id: stake.id.toString(),
        amount: ethers.utils.formatEther(stake.amount),
        startTime: new Date(stake.startTime.toNumber() * 1000),
        endTime: new Date(stake.endTime.toNumber() * 1000),
        lockPeriod: stake.lockPeriod.toNumber() / 86400, // 转换为天数
        reward: ethers.utils.formatEther(stake.reward),
        claimed: stake.claimed,
        isEnded: Date.now() > stake.endTime.toNumber() * 1000
      }));
      
      setUserStakes(formattedStakes);
      
      setSuccessMessage('代币质押成功！');
    } catch (err) {
      console.error('代币质押失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else {
        setError(`代币质押失败: ${err.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsStaking(false);
    }
  };

  // 解除质押
  const withdrawStake = async (stakeId) => {
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    setIsWithdrawing(true);
    setSelectedStakeId(stakeId);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const stakingContract = getStakingContract();
      
      if (!stakingContract) {
        throw new Error('无法连接质押合约');
      }
      
      // 解除质押
      const tx = await stakingContract.withdraw(stakeId);
      
      setSuccessMessage('解除质押交易已提交，请等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新数据
      const userBalance = await stakingContract.balanceOf(account);
      setUserStaked(ethers.utils.formatEther(userBalance));
      
      const tokenContract = getTokenContract();
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.utils.formatEther(balance));
      
      const stakes = await stakingContract.getUserStakes(account);
      const formattedStakes = stakes.map(stake => ({
        id: stake.id.toString(),
        amount: ethers.utils.formatEther(stake.amount),
        startTime: new Date(stake.startTime.toNumber() * 1000),
        endTime: new Date(stake.endTime.toNumber() * 1000),
        lockPeriod: stake.lockPeriod.toNumber() / 86400, // 转换为天数
        reward: ethers.utils.formatEther(stake.reward),
        claimed: stake.claimed,
        isEnded: Date.now() > stake.endTime.toNumber() * 1000
      }));
      
      setUserStakes(formattedStakes);
      
      setSuccessMessage('解除质押成功！');
    } catch (err) {
      console.error('解除质押失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else {
        setError(`解除质押失败: ${err.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsWithdrawing(false);
      setSelectedStakeId(null);
    }
  };

  // 领取奖励
  const claimReward = async (stakeId) => {
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    setIsClaimingReward(true);
    setSelectedStakeId(stakeId);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const stakingContract = getStakingContract();
      
      if (!stakingContract) {
        throw new Error('无法连接质押合约');
      }
      
      // 领取奖励
      const tx = await stakingContract.getReward(stakeId);
      
      setSuccessMessage('领取奖励交易已提交，请等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新数据
      const tokenContract = getTokenContract();
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.utils.formatEther(balance));
      
      const stakes = await stakingContract.getUserStakes(account);
      const formattedStakes = stakes.map(stake => ({
        id: stake.id.toString(),
        amount: ethers.utils.formatEther(stake.amount),
        startTime: new Date(stake.startTime.toNumber() * 1000),
        endTime: new Date(stake.endTime.toNumber() * 1000),
        lockPeriod: stake.lockPeriod.toNumber() / 86400, // 转换为天数
        reward: ethers.utils.formatEther(stake.reward),
        claimed: stake.claimed,
        isEnded: Date.now() > stake.endTime.toNumber() * 1000
      }));
      
      setUserStakes(formattedStakes);
      
      setSuccessMessage('奖励领取成功！');
    } catch (err) {
      console.error('领取奖励失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else {
        setError(`领取奖励失败: ${err.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsClaimingReward(false);
      setSelectedStakeId(null);
    }
  };

  // 格式化日期
  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 计算剩余时间
  const calculateTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) {
      return '已结束';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  // 渲染质押统计卡片
  const renderStakingStats = () => {
    return (
      <div className="staking-stats">
        <div className="stat-card">
          <div className="stat-title">总质押量</div>
          <div className="stat-value">{parseFloat(totalStaked).toLocaleString()} CBT</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">当前APY</div>
          <div className="stat-value">{apy}%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">我的质押</div>
          <div className="stat-value">{parseFloat(userStaked).toLocaleString()} CBT</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">我的余额</div>
          <div className="stat-value">{parseFloat(tokenBalance).toLocaleString()} CBT</div>
        </div>
      </div>
    );
  };

  // 渲染质押表单
  const renderStakingForm = () => {
    const needsApproval = parseFloat(stakeAmount || '0') > parseFloat(tokenAllowance);
    
    return (
      <div className="staking-form">
        <h3>质押代币</h3>
        
        <div className="form-group">
          <label htmlFor="stakeAmount">质押金额</label>
          <div className="input-with-max">
            <input
              type="number"
              id="stakeAmount"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="输入质押金额"
              min="0"
              step="0.1"
            />
            <button 
              className="max-button"
              onClick={() => setStakeAmount(tokenBalance)}
              disabled={isApproving || isStaking}
            >
              最大
            </button>
          </div>
          <div className="balance-display">余额: {parseFloat(tokenBalance).toLocaleString()} CBT</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="stakePeriod">质押期限</label>
          <div className="period-selector">
            {stakePeriods.map((period) => (
              <button
                key={period.days}
                className={`period-button ${stakePeriod === period.days ? 'selected' : ''}`}
                onClick={() => setStakePeriod(period.days)}
                disabled={isApproving || isStaking}
              >
                {period.label}
                <span className="multiplier">x{period.multiplier}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="reward-estimate">
          <div className="estimate-label">预估奖励:</div>
          <div className="estimate-value">{parseFloat(estimatedReward).toLocaleString()} CBT</div>
        </div>
        
        <div className="staking-actions">
          {needsApproval ? (
            <button 
              className="approve-button" 
              onClick={approveTokens}
              disabled={isApproving || !stakeAmount || parseFloat(stakeAmount) <= 0}
            >
              {isApproving ? '授权中...' : '授权代币'}
            </button>
          ) : (
            <button 
              className="stake-button" 
              onClick={stakeTokens}
              disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > parseFloat(tokenBalance)}
            >
              {isStaking ? '质押中...' : '质押代币'}
            </button>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>
    );
  };

  // 渲染质押记录
  const renderStakingHistory = () => {
    if (userStakes.length === 0) {
      return (
        <div className="staking-history">
          <h3>我的质押记录</h3>
          <div className="no-stakes">您还没有质押记录</div>
        </div>
      );
    }
    
    return (
      <div className="staking-history">
        <h3>我的质押记录</h3>
        
        <div className="stakes-list">
          {userStakes.map((stake) => (
            <div key={stake.id} className="stake-item">
              <div className="stake-header">
                <div className="stake-id">质押 #{stake.id}</div>
                <div className={`stake-status ${stake.isEnded ? 'ended' : 'active'}`}>
                  {stake.isEnded ? '已结束' : '进行中'}
                </div>
              </div>
              
              <div className="stake-details">
                <div className="stake-detail">
                  <span className="detail-label">质押金额:</span>
                  <span className="detail-value">{parseFloat(stake.amount).toLocaleString()} CBT</span>
                </div>
                
                <div className="stake-detail">
                  <span className="detail-label">质押期限:</span>
                  <span className="detail-value">{stake.lockPeriod} 天</span>
                </div>
                
                <div className="stake-detail">
                  <span className="detail-label">开始时间:</span>
                  <span className="detail-value">{formatDate(stake.startTime)}</span>
                </div>
                
                <div className="stake-detail">
                  <span className="detail-label">结束时间:</span>
                  <span className="detail-value">{formatDate(stake.endTime)}</span>
                </div>
                
                <div className="stake-detail">
                  <span className="detail-label">剩余时间:</span>
                  <span className="detail-value">{calculateTimeRemaining(stake.endTime)}</span>
                </div>
                
                <div className="stake-detail">
                  <span className="detail-label">预计奖励:</span>
                  <span className="detail-value">{parseFloat(stake.reward).toLocaleString()} CBT</span>
                </div>
              </div>
              
              <div className="stake-actions">
                <button 
                  className="withdraw-button" 
                  onClick={() => withdrawStake(stake.id)}
                  disabled={isWithdrawing || isClaimingReward || (selectedStakeId === stake.id && (isWithdrawing || isClaimingReward))}
                >
                  {(isWithdrawing && selectedStakeId === stake.id) ? '处理中...' : '解除质押'}
                </button>
                
                {stake.isEnded && !stake.claimed && (
                  <button 
                    className="claim-button" 
                    onClick={() => claimReward(stake.id)}
                    disabled={isWithdrawing || isClaimingReward || (selectedStakeId === stake.id && (isWithdrawing || isClaimingReward))}
                  >
                    {(isClaimingReward && selectedStakeId === stake.id) ? '处理中...' : '领取奖励'}
                  </button>
                )}
                
                {stake.claimed && (
                  <div className="claimed-tag">已领取</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染组件
  return (
    <div className="staking-dashboard">
      <div className="dashboard-header">
        <h2>代币质押</h2>
        <p>质押CBT代币赚取收益，锁定期越长奖励越多</p>
      </div>
      
      {!active ? (
        <div className="connect-wallet-message">
          <p>请连接您的钱包以使用质押功能</p>
        </div>
      ) : (
        <div className="dashboard-content">
          {renderStakingStats()}
          
          <div className="dashboard-main">
            <div className="dashboard-left">
              {renderStakingForm()}
            </div>
            
            <div className="dashboard-right">
              {renderStakingHistory()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakingDashboard;
