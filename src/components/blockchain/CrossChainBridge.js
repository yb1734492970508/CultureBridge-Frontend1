import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './CrossChainBridge.css';

// 跨链桥ABI（简化版）
const BRIDGE_ABI = [
  "function bridgeToken(address token, uint256 amount, uint256 targetChainId) payable returns (uint256)",
  "function claimToken(bytes32 txHash, uint256 amount, address token, uint256 sourceChainId) returns (bool)",
  "function getBridgeFee(uint256 targetChainId) view returns (uint256)",
  "function getSupportedTokens(uint256 chainId) view returns (address[])",
  "function getTokenInfo(address token) view returns (string name, string symbol, uint8 decimals)",
  "function getPendingTransactions(address user) view returns (bytes32[])",
  "event TokenBridged(address indexed user, address indexed token, uint256 amount, uint256 targetChainId, bytes32 txHash)",
  "event TokenClaimed(address indexed user, address indexed token, uint256 amount, uint256 sourceChainId, bytes32 txHash)"
];

// 跨链桥合约地址（测试网）
const BRIDGE_ADDRESS = "0x8B3d9F0653D3e4aC0A9C7bEB5a5503A6E25D99E2";

/**
 * 跨链桥组件
 * 允许用户在不同区块链网络间转移资产
 */
const CrossChainBridge = () => {
  const { active, account, library, chainId } = useBlockchain();
  
  // 跨链状态
  const [sourceChainId, setSourceChainId] = useState(chainId || 1);
  const [targetChainId, setTargetChainId] = useState(56); // 默认目标链为BSC
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [bridgeFee, setBridgeFee] = useState('0');
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [tokenInfo, setTokenInfo] = useState({});
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isApproved, setIsApproved] = useState(false);
  
  // 交易状态
  const [pendingTxs, setPendingTxs] = useState([]);
  const [isBridging, setIsBridging] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [bridgeError, setBridgeError] = useState(null);
  const [claimError, setClaimError] = useState(null);
  const [approveError, setApproveError] = useState(null);
  
  // 显示状态
  const [activeTab, setActiveTab] = useState('bridge'); // 'bridge' 或 'history'
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  
  // 支持的区块链网络
  const supportedNetworks = [
    { id: 1, name: '以太坊主网', icon: '🔷', currency: 'ETH' },
    { id: 56, name: '币安智能链', icon: '🟡', currency: 'BNB' },
    { id: 137, name: 'Polygon', icon: '🟣', currency: 'MATIC' },
    { id: 42161, name: 'Arbitrum', icon: '🔶', currency: 'ETH' },
    { id: 10, name: 'Optimism', icon: '🔴', currency: 'ETH' },
    { id: 43114, name: 'Avalanche', icon: '❄️', currency: 'AVAX' },
    // 测试网络
    { id: 5, name: 'Goerli测试网', icon: '🔷', currency: 'ETH' },
    { id: 97, name: 'BSC测试网', icon: '🟡', currency: 'BNB' },
    { id: 80001, name: 'Mumbai测试网', icon: '🟣', currency: 'MATIC' }
  ];
  
  // 获取网络信息
  const getNetworkInfo = (id) => {
    return supportedNetworks.find(network => network.id === id) || { name: '未知网络', icon: '❓', currency: 'ETH' };
  };
  
  // 获取跨链桥合约实例
  const getBridgeContract = () => {
    if (!active || !library) return null;
    
    try {
      return new ethers.Contract(
        BRIDGE_ADDRESS,
        BRIDGE_ABI,
        library.getSigner()
      );
    } catch (err) {
      console.error('创建跨链桥合约实例失败:', err);
      return null;
    }
  };
  
  // 获取ERC20代币合约实例
  const getTokenContract = (tokenAddress) => {
    if (!active || !library || !tokenAddress) return null;
    
    try {
      const tokenAbi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function name() view returns (string)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
      ];
      
      return new ethers.Contract(
        tokenAddress,
        tokenAbi,
        library.getSigner()
      );
    } catch (err) {
      console.error('创建代币合约实例失败:', err);
      return null;
    }
  };
  
  // 当链ID变化时更新源链
  useEffect(() => {
    if (chainId) {
      setSourceChainId(chainId);
      
      // 如果目标链与源链相同，则切换到另一个常用链
      if (targetChainId === chainId) {
        setTargetChainId(chainId === 1 ? 56 : 1);
      }
    }
  }, [chainId]);
  
  // 加载支持的代币列表
  useEffect(() => {
    const loadSupportedTokens = async () => {
      if (!active || !library) return;
      
      try {
        const bridgeContract = getBridgeContract();
        if (!bridgeContract) return;
        
        // 在实际应用中，这里应该调用合约获取支持的代币列表
        // 这里我们使用模拟数据
        
        // 以太坊主网支持的代币
        const ethereumTokens = [
          { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether', symbol: 'USDT', decimals: 6 },
          { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
          { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai', symbol: 'DAI', decimals: 18 },
          { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: 'Uniswap', symbol: 'UNI', decimals: 18 }
        ];
        
        // BSC支持的代币
        const bscTokens = [
          { address: '0x55d398326f99059fF775485246999027B3197955', name: 'Binance-Peg USDT', symbol: 'USDT', decimals: 18 },
          { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', name: 'Binance-Peg USDC', symbol: 'USDC', decimals: 18 },
          { address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', name: 'Binance-Peg DAI', symbol: 'DAI', decimals: 18 },
          { address: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1', name: 'Binance-Peg UNI', symbol: 'UNI', decimals: 18 }
        ];
        
        // Polygon支持的代币
        const polygonTokens = [
          { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', name: 'Polygon USDT', symbol: 'USDT', decimals: 6 },
          { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', name: 'Polygon USDC', symbol: 'USDC', decimals: 6 },
          { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', name: 'Polygon DAI', symbol: 'DAI', decimals: 18 },
          { address: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f', name: 'Polygon UNI', symbol: 'UNI', decimals: 18 }
        ];
        
        // 测试网支持的代币（模拟数据）
        const testnetTokens = [
          { address: '0x1111111111111111111111111111111111111111', name: 'Test USDT', symbol: 'USDT', decimals: 6 },
          { address: '0x2222222222222222222222222222222222222222', name: 'Test USDC', symbol: 'USDC', decimals: 6 },
          { address: '0x3333333333333333333333333333333333333333', name: 'Test DAI', symbol: 'DAI', decimals: 18 },
          { address: '0x4444444444444444444444444444444444444444', name: 'Test UNI', symbol: 'UNI', decimals: 18 }
        ];
        
        // 根据当前链ID选择对应的代币列表
        let tokens = [];
        switch (sourceChainId) {
          case 1:
            tokens = ethereumTokens;
            break;
          case 56:
            tokens = bscTokens;
            break;
          case 137:
            tokens = polygonTokens;
            break;
          case 5:
          case 97:
          case 80001:
            tokens = testnetTokens;
            break;
          default:
            tokens = testnetTokens;
        }
        
        // 更新状态
        setSupportedTokens(tokens);
        
        // 构建代币信息映射
        const tokenInfoMap = {};
        tokens.forEach(token => {
          tokenInfoMap[token.address] = token;
        });
        setTokenInfo(tokenInfoMap);
        
        // 如果已选择代币不在支持列表中，重置选择
        if (selectedToken && !tokens.find(t => t.address === selectedToken)) {
          setSelectedToken('');
          setTokenBalance('0');
        }
        
      } catch (err) {
        console.error('加载支持的代币失败:', err);
      }
    };
    
    loadSupportedTokens();
  }, [sourceChainId, active, library]);
  
  // 加载桥接费用
  useEffect(() => {
    const loadBridgeFee = async () => {
      if (!active || !library || !targetChainId) return;
      
      try {
        const bridgeContract = getBridgeContract();
        if (!bridgeContract) return;
        
        // 在实际应用中，这里应该调用合约获取桥接费用
        // 这里我们使用模拟数据
        
        // 模拟不同目标链的费用（以wei为单位）
        let fee;
        switch (targetChainId) {
          case 1:
            fee = ethers.utils.parseEther('0.005'); // 以太坊主网费用较高
            break;
          case 56:
            fee = ethers.utils.parseEther('0.001'); // BSC费用适中
            break;
          case 137:
            fee = ethers.utils.parseEther('0.0005'); // Polygon费用较低
            break;
          default:
            fee = ethers.utils.parseEther('0.001'); // 默认费用
        }
        
        setBridgeFee(fee.toString());
        
      } catch (err) {
        console.error('加载桥接费用失败:', err);
      }
    };
    
    loadBridgeFee();
  }, [targetChainId, active, library]);
  
  // 加载代币余额
  useEffect(() => {
    const loadTokenBalance = async () => {
      if (!active || !account || !library || !selectedToken) {
        setTokenBalance('0');
        return;
      }
      
      try {
        const tokenContract = getTokenContract(selectedToken);
        if (!tokenContract) {
          setTokenBalance('0');
          return;
        }
        
        const balance = await tokenContract.balanceOf(account);
        setTokenBalance(balance.toString());
        
        // 检查授权状态
        const allowance = await tokenContract.allowance(account, BRIDGE_ADDRESS);
        const requiredAmount = ethers.utils.parseUnits(
          amount || '0',
          tokenInfo[selectedToken]?.decimals || 18
        );
        
        setIsApproved(allowance.gte(requiredAmount) && requiredAmount.gt(0));
        
      } catch (err) {
        console.error('加载代币余额失败:', err);
        setTokenBalance('0');
      }
    };
    
    loadTokenBalance();
    
    // 设置定时器定期刷新余额
    const intervalId = setInterval(loadTokenBalance, 15000);
    
    return () => clearInterval(intervalId);
  }, [selectedToken, account, active, library, amount]);
  
  // 加载待处理交易
  useEffect(() => {
    const loadPendingTransactions = async () => {
      if (!active || !account || !library) {
        setPendingTxs([]);
        return;
      }
      
      try {
        const bridgeContract = getBridgeContract();
        if (!bridgeContract) {
          setPendingTxs([]);
          return;
        }
        
        // 在实际应用中，这里应该调用合约获取待处理交易
        // 这里我们使用模拟数据
        
        // 模拟待处理交易
        const mockPendingTxs = [
          {
            txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            sourceChainId: 1,
            targetChainId: 56,
            token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            tokenSymbol: 'USDT',
            amount: ethers.utils.parseUnits('100', 6).toString(),
            timestamp: Math.floor(Date.now() / 1000) - 3600,
            status: 'pending', // pending, completed, failed
            canClaim: true
          },
          {
            txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            sourceChainId: 56,
            targetChainId: 1,
            token: '0x55d398326f99059fF775485246999027B3197955',
            tokenSymbol: 'USDT',
            amount: ethers.utils.parseUnits('50', 18).toString(),
            timestamp: Math.floor(Date.now() / 1000) - 7200,
            status: 'completed',
            canClaim: false
          },
          {
            txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            sourceChainId: 137,
            targetChainId: 1,
            token: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            tokenSymbol: 'USDT',
            amount: ethers.utils.parseUnits('75', 6).toString(),
            timestamp: Math.floor(Date.now() / 1000) - 10800,
            status: 'pending',
            canClaim: true
          }
        ];
        
        setPendingTxs(mockPendingTxs);
        
      } catch (err) {
        console.error('加载待处理交易失败:', err);
        setPendingTxs([]);
      }
    };
    
    loadPendingTransactions();
    
    // 设置定时器定期刷新待处理交易
    const intervalId = setInterval(loadPendingTransactions, 30000);
    
    return () => clearInterval(intervalId);
  }, [active, account, library]);
  
  // 授权代币
  const approveToken = async () => {
    if (!active || !account || !library || !selectedToken || !amount) {
      setApproveError('请先连接钱包并选择代币和金额');
      return;
    }
    
    setIsApproving(true);
    setApproveError(null);
    
    try {
      const tokenContract = getTokenContract(selectedToken);
      if (!tokenContract) {
        throw new Error('无法连接代币合约');
      }
      
      const decimals = tokenInfo[selectedToken]?.decimals || 18;
      const amountToApprove = ethers.utils.parseUnits(amount, decimals);
      
      // 授权代币
      const tx = await tokenContract.approve(BRIDGE_ADDRESS, amountToApprove);
      
      // 等待交易确认
      await tx.wait();
      
      // 更新授权状态
      setIsApproved(true);
      
    } catch (err) {
      console.error('授权代币失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setApproveError('您拒绝了交易签名');
      } else {
        setApproveError(`授权失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsApproving(false);
    }
  };
  
  // 桥接代币
  const bridgeToken = async () => {
    if (!active || !account || !library || !selectedToken || !amount || !targetChainId) {
      setBridgeError('请先连接钱包并填写所有必要信息');
      return;
    }
    
    if (!isApproved) {
      setBridgeError('请先授权代币');
      return;
    }
    
    setIsBridging(true);
    setBridgeError(null);
    
    try {
      const bridgeContract = getBridgeContract();
      if (!bridgeContract) {
        throw new Error('无法连接跨链桥合约');
      }
      
      const decimals = tokenInfo[selectedToken]?.decimals || 18;
      const amountToBridge = ethers.utils.parseUnits(amount, decimals);
      
      // 桥接代币
      const tx = await bridgeContract.bridgeToken(
        selectedToken,
        amountToBridge,
        targetChainId,
        { value: bridgeFee }
      );
      
      // 等待交易确认
      await tx.wait();
      
      // 重置表单
      setAmount('');
      setIsApproved(false);
      
      // 切换到历史记录标签
      setActiveTab('history');
      
    } catch (err) {
      console.error('桥接代币失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setBridgeError('您拒绝了交易签名');
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setBridgeError('余额不足，无法支付桥接费用');
      } else {
        setBridgeError(`桥接失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsBridging(false);
    }
  };
  
  // 领取代币
  const claimToken = async (tx) => {
    if (!active || !account || !library) {
      setClaimError('请先连接钱包');
      return;
    }
    
    setIsClaiming(true);
    setClaimError(null);
    
    try {
      const bridgeContract = getBridgeContract();
      if (!bridgeContract) {
        throw new Error('无法连接跨链桥合约');
      }
      
      // 领取代币
      const claimTx = await bridgeContract.claimToken(
        tx.txHash,
        tx.amount,
        tx.token,
        tx.sourceChainId
      );
      
      // 等待交易确认
      await claimTx.wait();
      
      // 更新交易状态
      setPendingTxs(prev => prev.map(t => {
        if (t.txHash === tx.txHash) {
          return { ...t, status: 'completed', canClaim: false };
        }
        return t;
      }));
      
    } catch (err) {
      console.error('领取代币失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setClaimError('您拒绝了交易签名');
      } else {
        setClaimError(`领取失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsClaiming(false);
    }
  };
  
  // 格式化金额
  const formatAmount = (amount, decimals = 18) => {
    if (!amount) return '0';
    
    try {
      const formattedAmount = ethers.utils.formatUnits(amount, decimals);
      return parseFloat(formattedAmount).toFixed(6);
    } catch (err) {
      console.error('格式化金额失败:', err);
      return '0';
    }
  };
  
  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };
  
  // 获取交易浏览器URL
  const getExplorerUrl = (txHash, chainId) => {
    let baseUrl;
    
    switch (chainId) {
      case 1:
        baseUrl = 'https://etherscan.io';
        break;
      case 56:
        baseUrl = 'https://bscscan.com';
        break;
      case 137:
        baseUrl = 'https://polygonscan.com';
        break;
      case 42161:
        baseUrl = 'https://arbiscan.io';
        break;
      case 10:
        baseUrl = 'https://optimistic.etherscan.io';
        break;
      case 43114:
        baseUrl = 'https://snowtrace.io';
        break;
      case 5:
        baseUrl = 'https://goerli.etherscan.io';
        break;
      case 97:
        baseUrl = 'https://testnet.bscscan.com';
        break;
      case 80001:
        baseUrl = 'https://mumbai.polygonscan.com';
        break;
      default:
        baseUrl = 'https://etherscan.io';
    }
    
    return `${baseUrl}/tx/${txHash}`;
  };
  
  // 渲染网络选择器
  const renderNetworkSelector = (isSource) => {
    const currentChainId = isSource ? sourceChainId : targetChainId;
    const currentNetwork = getNetworkInfo(currentChainId);
    
    return (
      <div className="network-selector">
        <div 
          className="selected-network"
          onClick={() => setShowNetworkSelector(isSource ? 'source' : 'target')}
        >
          <span className="network-icon">{currentNetwork.icon}</span>
          <span className="network-name">{currentNetwork.name}</span>
          <span className="network-arrow">▼</span>
        </div>
        
        {showNetworkSelector === (isSource ? 'source' : 'target') && (
          <div className="network-dropdown">
            {supportedNetworks.map(network => (
              <div 
                key={network.id}
                className={`network-option ${network.id === currentChainId ? 'active' : ''}`}
                onClick={() => {
                  if (isSource) {
                    // 源链需要切换钱包网络
                    // 这里只是模拟，实际应用中应该调用钱包API切换网络
                    setSourceChainId(network.id);
                  } else {
                    // 目标链直接设置
                    setTargetChainId(network.id);
                  }
                  setShowNetworkSelector(false);
                }}
              >
                <span className="network-icon">{network.icon}</span>
                <span className="network-name">{network.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // 渲染代币选择器
  const renderTokenSelector = () => {
    return (
      <div className="token-selector">
        <label>选择代币</label>
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          disabled={!active || supportedTokens.length === 0}
        >
          <option value="">请选择代币</option>
          {supportedTokens.map(token => (
            <option key={token.address} value={token.address}>
              {token.symbol} - {token.name}
            </option>
          ))}
        </select>
        
        {selectedToken && (
          <div className="token-balance">
            <span>余额: </span>
            <span>
              {formatAmount(
                tokenBalance,
                tokenInfo[selectedToken]?.decimals || 18
              )} {tokenInfo[selectedToken]?.symbol}
            </span>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染金额输入
  const renderAmountInput = () => {
    return (
      <div className="amount-input">
        <label>转账金额</label>
        <div className="input-with-max">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              // 只允许数字和小数点
              const value = e.target.value.replace(/[^0-9.]/g, '');
              setAmount(value);
              
              // 更新授权状态
              if (selectedToken) {
                const decimals = tokenInfo[selectedToken]?.decimals || 18;
                try {
                  const inputAmount = value ? ethers.utils.parseUnits(value, decimals) : ethers.BigNumber.from(0);
                  const currentAllowance = ethers.BigNumber.from(0); // 实际应用中应该从合约获取
                  setIsApproved(currentAllowance.gte(inputAmount) && inputAmount.gt(0));
                } catch (err) {
                  // 解析错误，可能是输入的数字格式不正确
                  setIsApproved(false);
                }
              }
            }}
            placeholder="输入金额"
            disabled={!active || !selectedToken}
          />
          <button
            className="max-button"
            onClick={() => {
              if (selectedToken && tokenBalance) {
                const decimals = tokenInfo[selectedToken]?.decimals || 18;
                const maxAmount = ethers.utils.formatUnits(tokenBalance, decimals);
                setAmount(maxAmount);
                setIsApproved(false); // 需要重新授权
              }
            }}
            disabled={!active || !selectedToken || tokenBalance === '0'}
          >
            最大
          </button>
        </div>
        
        {bridgeFee && (
          <div className="bridge-fee">
            <span>桥接费用: </span>
            <span>
              {formatAmount(bridgeFee)} {getNetworkInfo(sourceChainId).currency}
            </span>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染桥接表单
  const renderBridgeForm = () => {
    if (!active) {
      return (
        <div className="bridge-message">
          <p>请连接您的钱包以使用跨链桥</p>
        </div>
      );
    }
    
    return (
      <div className="bridge-form">
        <div className="bridge-networks">
          <div className="source-network">
            <h3>从</h3>
            {renderNetworkSelector(true)}
          </div>
          
          <div className="network-arrow">
            →
          </div>
          
          <div className="target-network">
            <h3>到</h3>
            {renderNetworkSelector(false)}
          </div>
        </div>
        
        {renderTokenSelector()}
        {renderAmountInput()}
        
        {bridgeError && (
          <div className="error-message">{bridgeError}</div>
        )}
        
        {approveError && (
          <div className="error-message">{approveError}</div>
        )}
        
        <div className="bridge-actions">
          {selectedToken && amount && !isApproved ? (
            <button
              className="approve-button"
              onClick={approveToken}
              disabled={isApproving || !selectedToken || !amount}
            >
              {isApproving ? '授权中...' : '授权'}
            </button>
          ) : (
            <button
              className="bridge-button"
              onClick={bridgeToken}
              disabled={isBridging || !selectedToken || !amount || !isApproved || sourceChainId === targetChainId}
            >
              {isBridging ? '处理中...' : '桥接'}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染交易历史
  const renderTransactionHistory = () => {
    if (!active) {
      return (
        <div className="history-message">
          <p>请连接您的钱包以查看交易历史</p>
        </div>
      );
    }
    
    if (pendingTxs.length === 0) {
      return (
        <div className="history-empty">
          <p>暂无交易记录</p>
        </div>
      );
    }
    
    return (
      <div className="transaction-list">
        {pendingTxs.map((tx, index) => {
          const sourceNetwork = getNetworkInfo(tx.sourceChainId);
          const targetNetwork = getNetworkInfo(tx.targetChainId);
          const decimals = tx.tokenSymbol === 'USDT' ? (tx.sourceChainId === 56 ? 18 : 6) : 18;
          
          return (
            <div key={index} className={`transaction-item ${tx.status}`}>
              <div className="transaction-header">
                <div className="transaction-networks">
                  <span className="network-icon">{sourceNetwork.icon}</span>
                  <span className="network-name">{sourceNetwork.name}</span>
                  <span className="network-arrow">→</span>
                  <span className="network-icon">{targetNetwork.icon}</span>
                  <span className="network-name">{targetNetwork.name}</span>
                </div>
                
                <div className="transaction-status">
                  {tx.status === 'pending' ? '处理中' : 
                   tx.status === 'completed' ? '已完成' : '失败'}
                </div>
              </div>
              
              <div className="transaction-body">
                <div className="transaction-amount">
                  <span className="amount-value">
                    {formatAmount(tx.amount, decimals)} {tx.tokenSymbol}
                  </span>
                </div>
                
                <div className="transaction-time">
                  <span className="time-label">时间:</span>
                  <span className="time-value">{formatTimestamp(tx.timestamp)}</span>
                </div>
                
                <div className="transaction-hash">
                  <span className="hash-label">交易哈希:</span>
                  <a 
                    href={getExplorerUrl(tx.txHash, tx.sourceChainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hash-value"
                  >
                    {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 8)}
                  </a>
                </div>
              </div>
              
              <div className="transaction-footer">
                {tx.canClaim && chainId === tx.targetChainId ? (
                  <button
                    className="claim-button"
                    onClick={() => claimToken(tx)}
                    disabled={isClaiming}
                  >
                    {isClaiming ? '领取中...' : '领取代币'}
                  </button>
                ) : tx.status === 'pending' && chainId !== tx.targetChainId ? (
                  <div className="claim-message">
                    请切换到 {targetNetwork.name} 网络领取代币
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
        
        {claimError && (
          <div className="error-message">{claimError}</div>
        )}
      </div>
    );
  };
  
  return (
    <div className="cross-chain-bridge" onClick={() => showNetworkSelector && setShowNetworkSelector(false)}>
      <div className="bridge-header">
        <h2>跨链桥</h2>
        <p>在不同区块链网络间安全转移您的资产</p>
      </div>
      
      <div className="bridge-tabs">
        <div 
          className={`bridge-tab ${activeTab === 'bridge' ? 'active' : ''}`}
          onClick={() => setActiveTab('bridge')}
        >
          桥接
        </div>
        <div 
          className={`bridge-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          历史记录
        </div>
      </div>
      
      <div className="bridge-content">
        {activeTab === 'bridge' ? renderBridgeForm() : renderTransactionHistory()}
      </div>
    </div>
  );
};

export default CrossChainBridge;
