import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './StakingForm.css';

// 代币合约ABI（简化版）
const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

// 质押合约ABI（简化版）
const STAKING_ABI = [
  "function stake(uint256 amount, uint256 lockPeriod) external",
  "function calculateReward(uint256 amount, uint256 lockPeriod) external view returns (uint256)"
];

// 质押合约地址（测试网）
const STAKING_ADDRESS = "0x9C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

// 代币合约地址（测试网）
const TOKEN_ADDRESS = "0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

/**
 * 代币质押表单组件
 * 允许用户输入质押金额、选择质押期限，并执行质押操作
 */
const StakingForm = ({ onStakeSuccess }) => {
  const { active, account, library } = useBlockchain();
  
  // 表单状态
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakePeriod, setStakePeriod] = useState(30); // 默认30天
  const [estimatedReward, setEstimatedReward] = useState('0');
  const [annualizedReturn, setAnnualizedReturn] = useState('0');
  
  // 用户数据
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenAllowance, setTokenAllowance] = useState('0');
  
  // 处理状态
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
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

  // 加载用户代币数据
  useEffect(() => {
    if (!active || !account || !library) return;
    
    const loadTokenData = async () => {
      try {
        const tokenContract = getTokenContract();
        
        if (!tokenContract) return;
        
        // 获取用户代币余额
        const balance = await tokenContract.balanceOf(account);
        setTokenBalance(ethers.utils.formatEther(balance));
        
        // 获取代币授权额度
        const allowance = await tokenContract.allowance(account, STAKING_ADDRESS);
        setTokenAllowance(ethers.utils.formatEther(allowance));
      } catch (err) {
        console.error('加载代币数据失败:', err);
        setError('加载代币数据失败，请刷新页面重试');
      }
    };
    
    loadTokenData();
    
    // 设置定期刷新
    const intervalId = setInterval(loadTokenData, 30000); // 每30秒刷新一次
    
    return () => clearInterval(intervalId);
  }, [active, account, library]);

  // 计算预估奖励
  useEffect(() => {
    if (!active || !stakeAmount || isNaN(parseFloat(stakeAmount)) || parseFloat(stakeAmount) <= 0) {
      setEstimatedReward('0');
      setAnnualizedReturn('0');
      return;
    }
    
    const calculateEstimatedReward = async () => {
      try {
        const stakingContract = getStakingContract();
        
        if (!stakingContract) return;
        
        const amount = ethers.utils.parseEther(stakeAmount);
        const periodInSeconds = stakePeriod * 86400; // 转换为秒
        
        // 调用合约计算奖励
        const reward = await stakingContract.calculateReward(amount, periodInSeconds);
        const rewardEther = ethers.utils.formatEther(reward);
        setEstimatedReward(rewardEther);
        
        // 计算年化收益率
        const annualDays = 365;
        const stakeAmountFloat = parseFloat(stakeAmount);
        const rewardFloat = parseFloat(rewardEther);
        const annualRate = (rewardFloat / stakeAmountFloat) * (annualDays / stakePeriod) * 100;
        setAnnualizedReturn(annualRate.toFixed(2));
      } catch (err) {
        console.error('计算预估奖励失败:', err);
        setEstimatedReward('计算失败');
        setAnnualizedReturn('计算失败');
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
      const tokenContract = getTokenContract();
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.utils.formatEther(balance));
      
      setSuccessMessage('代币质押成功！');
      
      // 通知父组件质押成功
      if (onStakeSuccess && typeof onStakeSuccess === 'function') {
        onStakeSuccess();
      }
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

  // 处理质押金额输入
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setStakeAmount(value);
    }
  };

  // 处理最大金额按钮点击
  const handleMaxClick = () => {
    setStakeAmount(tokenBalance);
  };

  // 处理质押期限选择
  const handlePeriodSelect = (days) => {
    setStakePeriod(days);
  };

  // 渲染质押期限选择器
  const renderPeriodSelector = () => {
    return (
      <div className="period-selector">
        {stakePeriods.map((period) => (
          <button
            key={period.days}
            type="button"
            className={`period-button ${stakePeriod === period.days ? 'selected' : ''}`}
            onClick={() => handlePeriodSelect(period.days)}
            disabled={isApproving || isStaking}
          >
            {period.label}
            <span className="multiplier">×{period.multiplier}</span>
          </button>
        ))}
      </div>
    );
  };

  // 渲染奖励估算
  const renderRewardEstimate = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      return null;
    }
    
    return (
      <div className="reward-estimate">
        <div className="estimate-info">
          <div className="estimate-label">预计奖励</div>
          <div className="estimate-value">{parseFloat(estimatedReward).toFixed(4)} CBT</div>
        </div>
        <div className="estimate-info">
          <div className="estimate-label">年化收益率</div>
          <div className="estimate-value">{annualizedReturn}%</div>
        </div>
      </div>
    );
  };

  // 渲染错误消息
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="error-message">
        <div className="error-icon">⚠️</div>
        <div className="error-text">{error}</div>
      </div>
    );
  };

  // 渲染成功消息
  const renderSuccess = () => {
    if (!successMessage) return null;
    
    return (
      <div className="success-message">
        <div className="success-icon">✅</div>
        <div className="success-text">{successMessage}</div>
      </div>
    );
  };

  // 主渲染函数
  return (
    <div className="staking-form">
      <h3>质押代币</h3>
      
      <div className="form-group">
        <label htmlFor="stakeAmount">质押金额</label>
        <div className="input-with-max">
          <input
            type="text"
            id="stakeAmount"
            value={stakeAmount}
            onChange={handleAmountChange}
            placeholder="输入质押金额"
            disabled={isApproving || isStaking}
          />
          <button 
            className="max-button"
            onClick={handleMaxClick}
            disabled={isApproving || isStaking}
          >
            最大
          </button>
        </div>
        <div className="balance-display">余额: {parseFloat(tokenBalance).toLocaleString()} CBT</div>
      </div>
      
      <div className="form-group">
        <label htmlFor="stakePeriod">质押期限</label>
        {renderPeriodSelector()}
      </div>
      
      {renderRewardEstimate()}
      
      <div className="staking-actions">
        {parseFloat(stakeAmount || '0') > parseFloat(tokenAllowance) ? (
          <button 
            className="approve-button"
            onClick={approveTokens}
            disabled={isApproving || isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
          >
            {isApproving ? '授权中...' : '授权代币'}
          </button>
        ) : (
          <button 
            className="stake-button"
            onClick={stakeTokens}
            disabled={isApproving || isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
          >
            {isStaking ? '质押中...' : '质押代币'}
          </button>
        )}
      </div>
      
      {renderError()}
      {renderSuccess()}
    </div>
  );
};

export default StakingForm;
