import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './VotingPower.css';

/**
 * 投票权重组件
 * 显示用户当前投票权重和增益因素
 */
const VotingPower = () => {
  const { active, account, library } = useBlockchain();
  
  // 用户数据
  const [baseVotingPower, setBaseVotingPower] = useState(0);
  const [stakingBoost, setStakingBoost] = useState(1.5);
  const [holdingBoost, setHoldingBoost] = useState(1.2);
  const [nftBoost, setNftBoost] = useState(1.0);
  const [totalVotingPower, setTotalVotingPower] = useState(0);
  const [votingLevel, setVotingLevel] = useState('');
  const [votingHistory, setVotingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 治理合约ABI（简化版）
  const GOVERNANCE_ABI = [
    "function getVotingPower(address account) external view returns (uint256)",
    "function getStakingBoost(address account) external view returns (uint256)",
    "function getHoldingBoost(address account) external view returns (uint256)",
    "function getNFTBoost(address account) external view returns (uint256)",
    "function getVotingHistory(address account) external view returns (tuple(uint256 timestamp, uint256 power)[])"
  ];
  
  // 治理合约地址（测试网）
  const GOVERNANCE_ADDRESS = "0xA3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";
  
  // 初始化合约实例
  const getGovernanceContract = () => {
    if (!library || !active) return null;
    return new ethers.Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      library.getSigner()
    );
  };
  
  // 加载投票权重数据
  useEffect(() => {
    if (!active || !account || !library) return;
    
    const loadVotingPowerData = async () => {
      setIsLoading(true);
      
      try {
        const governanceContract = getGovernanceContract();
        
        if (!governanceContract) {
          throw new Error('无法连接治理合约');
        }
        
        // 获取基础投票权重
        const basePower = await governanceContract.getVotingPower(account);
        const basePowerFormatted = parseFloat(ethers.utils.formatEther(basePower));
        setBaseVotingPower(basePowerFormatted);
        
        // 获取质押增益
        const stakingBoostValue = await governanceContract.getStakingBoost(account);
        const stakingBoostFormatted = parseFloat(ethers.utils.formatUnits(stakingBoostValue, 2));
        setStakingBoost(stakingBoostFormatted);
        
        // 获取持有增益
        const holdingBoostValue = await governanceContract.getHoldingBoost(account);
        const holdingBoostFormatted = parseFloat(ethers.utils.formatUnits(holdingBoostValue, 2));
        setHoldingBoost(holdingBoostFormatted);
        
        // 获取NFT增益
        const nftBoostValue = await governanceContract.getNFTBoost(account);
        const nftBoostFormatted = parseFloat(ethers.utils.formatUnits(nftBoostValue, 2));
        setNftBoost(nftBoostFormatted);
        
        // 计算总投票权重
        const total = basePowerFormatted * stakingBoostFormatted * holdingBoostFormatted * nftBoostFormatted;
        setTotalVotingPower(total);
        
        // 设置投票等级
        if (total >= 10000) {
          setVotingLevel('钻石');
        } else if (total >= 5000) {
          setVotingLevel('金');
        } else if (total >= 1000) {
          setVotingLevel('银');
        } else if (total >= 100) {
          setVotingLevel('铜');
        } else {
          setVotingLevel('基础');
        }
        
        // 获取投票历史
        const historyData = await governanceContract.getVotingHistory(account);
        const formattedHistory = historyData.map(item => ({
          timestamp: new Date(item.timestamp.toNumber() * 1000),
          power: parseFloat(ethers.utils.formatEther(item.power))
        }));
        
        setVotingHistory(formattedHistory);
      } catch (error) {
        console.error('加载投票权重数据失败:', error);
        
        // 使用模拟数据进行展示
        setBaseVotingPower(1250);
        setStakingBoost(1.5);
        setHoldingBoost(1.2);
        setNftBoost(1.1);
        setTotalVotingPower(1250 * 1.5 * 1.2 * 1.1);
        setVotingLevel('银');
        
        // 模拟投票历史数据
        const now = new Date();
        setVotingHistory([
          { timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), power: 800 },
          { timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), power: 950 },
          { timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), power: 1100 },
          { timestamp: now, power: 1250 * 1.5 * 1.2 * 1.1 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVotingPowerData();
  }, [active, account, library]);
  
  // 渲染投票权重历史图表
  const renderVotingHistory = () => {
    if (votingHistory.length === 0) {
      return (
        <div className="history-chart empty">
          <p>暂无投票权重历史数据</p>
        </div>
      );
    }
    
    return (
      <div className="history-chart">
        <p>投票权重历史图表将在此显示</p>
        {/* 实际项目中可以使用Chart.js或Recharts等库实现图表 */}
      </div>
    );
  };
  
  // 渲染组件
  return (
    <div className="voting-power">
      <div className="voting-power-header">
        <h3>我的投票权重</h3>
      </div>
      
      {!active ? (
        <div className="connect-wallet-message">
          <p>请连接您的钱包以查看投票权重</p>
        </div>
      ) : isLoading ? (
        <div className="loading-message">
          <p>正在加载投票权重数据...</p>
        </div>
      ) : (
        <div className="voting-power-content">
          <div className="total-power">
            <div className="power-label">总投票权重</div>
            <div className="power-value">{totalVotingPower.toLocaleString(undefined, { maximumFractionDigits: 2 })} 票</div>
            <div className="power-level">
              <span className="level-badge">{votingLevel}级</span>
              <span className="level-text">投票者</span>
            </div>
          </div>
          
          <div className="power-breakdown">
            <div className="breakdown-item">
              <div className="breakdown-label">基础投票权重</div>
              <div className="breakdown-value">{baseVotingPower.toLocaleString()} CBT</div>
              <div className="breakdown-formula">1 CBT = 1 票</div>
            </div>
            
            <div className="breakdown-item">
              <div className="breakdown-label">质押增益</div>
              <div className="breakdown-value">×{stakingBoost.toFixed(1)}</div>
              <div className="breakdown-formula">质押代币获得额外投票权重</div>
            </div>
            
            <div className="breakdown-item">
              <div className="breakdown-label">长期持有增益</div>
              <div className="breakdown-value">×{holdingBoost.toFixed(1)}</div>
              <div className="breakdown-formula">持有时间越长，投票权重越高</div>
            </div>
          </div>
          
          <div className="power-calculation">
            <div className="calculation-label">计算公式</div>
            <div className="calculation-formula">
              {baseVotingPower.toLocaleString()} × {stakingBoost.toFixed(1)} × {holdingBoost.toFixed(1)} × {nftBoost.toFixed(1)} = {totalVotingPower.toLocaleString(undefined, { maximumFractionDigits: 2 })} 票
            </div>
          </div>
          
          <div className="power-tips">
            <h4>如何增加投票权重?</h4>
            <ul>
              <li>质押更多CBT代币，获得最高1.5倍投票权重</li>
              <li>长期持有CBT，每3个月增加0.1倍权重（最高2倍）</li>
              <li>持有治理NFT，获得额外0.1-0.5倍投票权重</li>
              <li>参与社区提案投票，增加活跃度得分</li>
            </ul>
          </div>
          
          <div className="power-history">
            <h4>投票权重历史</h4>
            {renderVotingHistory()}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPower;
