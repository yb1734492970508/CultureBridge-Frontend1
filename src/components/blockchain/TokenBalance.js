import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './TokenBalance.css';

// ERC20代币ABI（简化版，只包含查询余额所需的函数）
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)"
];

/**
 * 代币余额组件
 * 显示用户的ERC20代币余额
 */
const TokenBalance = ({ tokenAddresses = [] }) => {
  const { active, account, library, chainId } = useBlockchain();
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 常用代币列表（按链ID分组）
  const commonTokens = {
    // 以太坊主网
    1: [
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether', symbol: 'USDT', decimals: 6 },
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
      { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai', symbol: 'DAI', decimals: 18 },
      { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', name: 'Chainlink', symbol: 'LINK', decimals: 18 },
      { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: 'Uniswap', symbol: 'UNI', decimals: 18 }
    ],
    // 币安智能链
    56: [
      { address: '0x55d398326f99059fF775485246999027B3197955', name: 'Binance-Peg USDT', symbol: 'USDT', decimals: 18 },
      { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', name: 'Binance-Peg USDC', symbol: 'USDC', decimals: 18 },
      { address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', name: 'Binance-Peg DAI', symbol: 'DAI', decimals: 18 },
      { address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402', name: 'Binance-Peg LINK', symbol: 'LINK', decimals: 18 },
      { address: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1', name: 'Binance-Peg UNI', symbol: 'UNI', decimals: 18 }
    ],
    // 测试网络使用模拟代币
    3: [], // Ropsten
    4: [], // Rinkeby
    5: [], // Goerli
    42: [], // Kovan
    97: [] // BSC Testnet
  };
  
  // 获取代币信息和余额
  const fetchTokenBalances = async () => {
    if (!active || !account || !library) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 确定要查询的代币列表
      let tokensToQuery = [];
      
      // 如果提供了特定的代币地址，则使用这些地址
      if (tokenAddresses && tokenAddresses.length > 0) {
        tokensToQuery = tokenAddresses;
      } 
      // 否则使用当前链的常用代币
      else if (commonTokens[chainId]) {
        tokensToQuery = commonTokens[chainId].map(token => token.address);
      }
      
      // 如果没有代币可查询，则使用模拟数据
      if (tokensToQuery.length === 0) {
        // 为测试网络创建模拟代币数据
        const mockTokens = [
          { address: '0x1111111111111111111111111111111111111111', name: 'Test Token A', symbol: 'TTA', decimals: 18, balance: ethers.utils.parseEther('1000') },
          { address: '0x2222222222222222222222222222222222222222', name: 'Test Token B', symbol: 'TTB', decimals: 6, balance: ethers.utils.parseUnits('500', 6) },
          { address: '0x3333333333333333333333333333333333333333', name: 'Test Token C', symbol: 'TTC', decimals: 8, balance: ethers.utils.parseUnits('750', 8) },
          { address: '0x4444444444444444444444444444444444444444', name: 'Test Token D', symbol: 'TTD', decimals: 18, balance: ethers.utils.parseEther('250') }
        ];
        
        setTokens(mockTokens);
        setIsLoading(false);
        return;
      }
      
      // 查询每个代币的信息和余额
      const tokenPromises = tokensToQuery.map(async (tokenAddress) => {
        try {
          // 创建代币合约实例
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI,
            library
          );
          
          // 并行获取代币信息
          const [name, symbol, decimals, balance] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals(),
            tokenContract.balanceOf(account)
          ]);
          
          return {
            address: tokenAddress,
            name,
            symbol,
            decimals,
            balance
          };
        } catch (err) {
          console.error(`获取代币信息失败 (${tokenAddress}):`, err);
          // 如果是常见代币，使用预定义的信息
          const predefinedToken = (commonTokens[chainId] || []).find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
          if (predefinedToken) {
            try {
              // 至少尝试获取余额
              const tokenContract = new ethers.Contract(
                tokenAddress,
                ["function balanceOf(address owner) view returns (uint256)"],
                library
              );
              const balance = await tokenContract.balanceOf(account);
              return {
                ...predefinedToken,
                balance
              };
            } catch (balanceErr) {
              console.error(`获取代币余额失败 (${tokenAddress}):`, balanceErr);
              return {
                ...predefinedToken,
                balance: ethers.BigNumber.from(0)
              };
            }
          }
          // 如果获取失败且不是常见代币，则跳过
          return null;
        }
      });
      
      // 等待所有查询完成
      const tokenResults = await Promise.all(tokenPromises);
      
      // 过滤掉null结果并按余额排序
      const validTokens = tokenResults
        .filter(token => token !== null)
        .sort((a, b) => {
          // 将余额转换为相同单位进行比较
          const aValue = parseFloat(ethers.utils.formatUnits(a.balance, a.decimals));
          const bValue = parseFloat(ethers.utils.formatUnits(b.balance, b.decimals));
          return bValue - aValue; // 降序排列
        });
      
      setTokens(validTokens);
    } catch (err) {
      console.error('获取代币余额失败:', err);
      setError('无法加载代币余额，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 当账户或链ID变化时重新获取代币余额
  useEffect(() => {
    if (active && account) {
      fetchTokenBalances();
    } else {
      setTokens([]);
    }
  }, [active, account, chainId]);
  
  // 格式化代币余额
  const formatTokenBalance = (balance, decimals) => {
    if (!balance) return '0';
    
    const formatted = ethers.utils.formatUnits(balance, decimals);
    const value = parseFloat(formatted);
    
    // 根据值的大小决定显示的小数位数
    if (value < 0.001 && value > 0) {
      return '< 0.001';
    } else if (value < 1) {
      return value.toFixed(4);
    } else if (value < 1000) {
      return value.toFixed(2);
    } else {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  };
  
  // 获取代币图标URL（实际应用中应使用真实的代币图标API）
  const getTokenIconUrl = (address, symbol) => {
    // 这里使用一个占位图标服务，实际应用中应替换为真实的代币图标API
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  };
  
  // 渲染代币列表
  const renderTokens = () => {
    if (!active) {
      return (
        <div className="token-message">
          <p>请连接您的钱包以查看代币余额</p>
        </div>
      );
    }
    
    if (isLoading && tokens.length === 0) {
      return (
        <div className="token-loading">
          <div className="token-loading-spinner"></div>
          <p>加载代币余额...</p>
        </div>
      );
    }
    
    if (error && tokens.length === 0) {
      return (
        <div className="token-error">
          <p>{error}</p>
          <button onClick={fetchTokenBalances}>重试</button>
        </div>
      );
    }
    
    if (tokens.length === 0) {
      return (
        <div className="token-empty">
          <p>没有找到代币</p>
        </div>
      );
    }
    
    return (
      <div className="token-list">
        {tokens.map((token) => (
          <div key={token.address} className="token-item">
            <div className="token-icon">
              <img 
                src={getTokenIconUrl(token.address, token.symbol)} 
                alt={token.symbol}
                onError={(e) => {
                  // 如果图标加载失败，显示首字母作为备用
                  e.target.onerror = null;
                  e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%234A6FA5"/><text x="50%" y="50%" font-size="16" fill="white" text-anchor="middle" dy=".3em">${token.symbol[0]}</text></svg>`;
                }}
              />
            </div>
            
            <div className="token-info">
              <div className="token-name">{token.name}</div>
              <div className="token-symbol">{token.symbol}</div>
            </div>
            
            <div className="token-balance">
              <div className="balance-value">{formatTokenBalance(token.balance, token.decimals)}</div>
              <div className="balance-symbol">{token.symbol}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="token-balance">
      <div className="token-header">
        <h2>代币余额</h2>
        <p>查看您的ERC20代币余额</p>
      </div>
      
      <div className="token-content">
        {renderTokens()}
      </div>
      
      {active && tokens.length > 0 && (
        <div className="token-refresh">
          <button 
            onClick={fetchTokenBalances}
            disabled={isLoading}
          >
            {isLoading ? '刷新中...' : '刷新余额'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenBalance;
