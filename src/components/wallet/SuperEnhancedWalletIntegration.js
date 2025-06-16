import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/auth/EnhancedAuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import LoadingSpinner, { ButtonLoader } from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import './SuperEnhancedWalletIntegration.css';

// Web3 相关导入
import { ethers } from 'ethers';

// 支持的钱包类型
const WALLET_TYPES = {
  METAMASK: 'metamask',
  WALLETCONNECT: 'walletconnect',
  COINBASE: 'coinbase',
  TRUST: 'trust'
};

// 支持的网络
const SUPPORTED_NETWORKS = {
  BSC_MAINNET: {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/']
  },
  BSC_TESTNET: {
    chainId: '0x61',
    chainName: 'BNB Smart Chain Testnet',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com/']
  }
};

// CBT代币合约地址 (示例地址，实际部署时需要更新)
const CBT_CONTRACT_ADDRESS = '0x...'; // 实际合约地址

// CBT代币ABI (简化版)
const CBT_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// 钱包连接状态
const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
};

// 钱包图标组件
const WalletIcon = ({ type, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const icons = {
    [WALLET_TYPES.METAMASK]: '🦊',
    [WALLET_TYPES.WALLETCONNECT]: '🔗',
    [WALLET_TYPES.COINBASE]: '🔵',
    [WALLET_TYPES.TRUST]: '🛡️'
  };

  return (
    <div className={`wallet-icon ${sizeClasses[size]}`}>
      {icons[type] || '💼'}
    </div>
  );
};

// 网络状态指示器组件
const NetworkIndicator = ({ network, isCorrect }) => {
  return (
    <div className={`network-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="network-dot" />
      <span className="network-name">{network?.chainName || '未知网络'}</span>
    </div>
  );
};

// 代币余额显示组件
const TokenBalance = ({ balance, symbol, usdValue, isLoading }) => {
  const formatBalance = (balance) => {
    if (!balance) return '0.00';
    const num = parseFloat(balance);
    if (num < 0.01) return '< 0.01';
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const formatUSD = (value) => {
    if (!value) return '$0.00';
    return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="token-balance">
      <div className="balance-main">
        {isLoading ? (
          <LoadingSpinner variant="dots" size="sm" />
        ) : (
          <>
            <span className="balance-amount">{formatBalance(balance)}</span>
            <span className="balance-symbol">{symbol}</span>
          </>
        )}
      </div>
      {usdValue && !isLoading && (
        <div className="balance-usd">{formatUSD(usdValue)}</div>
      )}
    </div>
  );
};

// 交易历史组件
const TransactionHistory = ({ transactions, isLoading }) => {
  const formatTxHash = (hash) => {
    if (!hash) return '';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'send': return '📤';
      case 'receive': return '📥';
      case 'reward': return '🎁';
      case 'stake': return '🔒';
      default: return '💱';
    }
  };

  if (isLoading) {
    return (
      <div className="transaction-history loading">
        <LoadingSpinner variant="dots" size="md" />
        <span>加载交易历史...</span>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-history empty">
        <div className="empty-icon">📋</div>
        <h4>暂无交易记录</h4>
        <p>您的交易历史将在这里显示</p>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <h4>交易历史</h4>
      <div className="transaction-list">
        {transactions.map((tx, index) => (
          <div key={tx.hash || index} className="transaction-item">
            <div className="transaction-icon">
              {getTransactionIcon(tx.type)}
            </div>
            <div className="transaction-details">
              <div className="transaction-main">
                <span className="transaction-type">{tx.description}</span>
                <span className={`transaction-amount ${tx.type === 'send' ? 'negative' : 'positive'}`}>
                  {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.symbol}
                </span>
              </div>
              <div className="transaction-meta">
                <span className="transaction-hash">{formatTxHash(tx.hash)}</span>
                <span className="transaction-date">{formatDate(tx.timestamp)}</span>
              </div>
            </div>
            <div className="transaction-status">
              <span className={`status-badge ${tx.status}`}>
                {tx.status === 'confirmed' ? '✅' : tx.status === 'pending' ? '⏳' : '❌'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 代币转账组件
const TokenTransfer = ({ onTransfer, isLoading, balance }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!recipient.trim()) {
      newErrors.recipient = '请输入接收地址';
    } else if (!ethers.utils.isAddress(recipient)) {
      newErrors.recipient = '无效的钱包地址';
    }

    if (!amount.trim()) {
      newErrors.amount = '请输入转账金额';
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = '请输入有效金额';
      } else if (amountNum > parseFloat(balance || '0')) {
        newErrors.amount = '余额不足';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onTransfer({
        recipient: recipient.trim(),
        amount: amount.trim(),
        memo: memo.trim()
      });
    }
  };

  const setMaxAmount = () => {
    if (balance) {
      setAmount(balance);
    }
  };

  return (
    <div className="token-transfer">
      <h4>转账 CBT</h4>
      <form onSubmit={handleSubmit} className="transfer-form">
        <div className="form-group">
          <label>接收地址</label>
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            error={errors.recipient}
          />
        </div>

        <div className="form-group">
          <label>转账金额</label>
          <div className="amount-input-group">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              error={errors.amount}
              step="0.01"
              min="0"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={setMaxAmount}
              className="max-button"
            >
              最大
            </Button>
          </div>
          <div className="balance-hint">
            可用余额: {balance || '0'} CBT
          </div>
        </div>

        <div className="form-group">
          <label>备注 (可选)</label>
          <Input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="转账备注..."
            maxLength={100}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading || !recipient || !amount}
          className="transfer-button"
        >
          {isLoading ? <ButtonLoader /> : '确认转账'}
        </Button>
      </form>
    </div>
  );
};

// 主钱包集成组件
const SuperEnhancedWalletIntegration = () => {
  const { user, updateUser } = useAuth();
  const { theme, isDarkMode } = useTheme();

  // 状态管理
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.DISCONNECTED);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [cbtContract, setCbtContract] = useState(null);
  
  // 代币相关状态
  const [cbtBalance, setCbtBalance] = useState('0');
  const [bnbBalance, setBnbBalance] = useState('0');
  const [cbtUsdValue, setCbtUsdValue] = useState('0');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  
  // 交易相关状态
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  
  // UI状态
  const [error, setError] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // 检查钱包可用性
  const checkWalletAvailability = () => {
    const wallets = [];
    
    if (typeof window !== 'undefined') {
      if (window.ethereum?.isMetaMask) {
        wallets.push({ type: WALLET_TYPES.METAMASK, name: 'MetaMask' });
      }
      if (window.ethereum?.isCoinbaseWallet) {
        wallets.push({ type: WALLET_TYPES.COINBASE, name: 'Coinbase Wallet' });
      }
      if (window.ethereum?.isTrust) {
        wallets.push({ type: WALLET_TYPES.TRUST, name: 'Trust Wallet' });
      }
      // WalletConnect 需要单独处理
      wallets.push({ type: WALLET_TYPES.WALLETCONNECT, name: 'WalletConnect' });
    }
    
    return wallets;
  };

  // 连接钱包
  const connectWallet = async (type) => {
    try {
      setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      setError('');

      if (!window.ethereum) {
        throw new Error('请安装 MetaMask 或其他 Web3 钱包');
      }

      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('未找到钱包账户');
      }

      const address = accounts[0];
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();

      // 获取网络信息
      const network = await web3Provider.getNetwork();
      const networkInfo = Object.values(SUPPORTED_NETWORKS).find(
        n => parseInt(n.chainId, 16) === network.chainId
      );

      setWalletAddress(address);
      setWalletType(type);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setCurrentNetwork(networkInfo || { chainName: `Chain ${network.chainId}`, chainId: network.chainId });
      setIsCorrectNetwork(!!networkInfo);
      setConnectionStatus(CONNECTION_STATUS.CONNECTED);

      // 初始化CBT合约
      if (CBT_CONTRACT_ADDRESS && networkInfo) {
        const contract = new ethers.Contract(CBT_CONTRACT_ADDRESS, CBT_ABI, web3Signer);
        setCbtContract(contract);
      }

      // 更新用户信息
      updateUser({
        walletAddress: address,
        walletType: type
      });

      // 加载余额和交易历史
      await loadWalletData(web3Provider, address);

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error.message);
      setConnectionStatus(CONNECTION_STATUS.ERROR);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
    setWalletAddress('');
    setWalletType('');
    setProvider(null);
    setSigner(null);
    setCbtContract(null);
    setCurrentNetwork(null);
    setIsCorrectNetwork(false);
    setCbtBalance('0');
    setBnbBalance('0');
    setCbtUsdValue('0');
    setTransactions([]);
    setError('');
    
    updateUser({
      walletAddress: null,
      walletType: null
    });
  };

  // 切换网络
  const switchNetwork = async (networkKey) => {
    try {
      const network = SUPPORTED_NETWORKS[networkKey];
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }]
      });
    } catch (error) {
      // 如果网络不存在，尝试添加
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SUPPORTED_NETWORKS[networkKey]]
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          setError('添加网络失败');
        }
      } else {
        console.error('Failed to switch network:', error);
        setError('切换网络失败');
      }
    }
  };

  // 加载钱包数据
  const loadWalletData = async (web3Provider, address) => {
    try {
      setIsLoadingBalances(true);
      setIsLoadingTransactions(true);

      // 获取BNB余额
      const bnbBalance = await web3Provider.getBalance(address);
      setBnbBalance(ethers.utils.formatEther(bnbBalance));

      // 获取CBT余额 (如果合约可用)
      if (cbtContract) {
        try {
          const cbtBalance = await cbtContract.balanceOf(address);
          const decimals = await cbtContract.decimals();
          setCbtBalance(ethers.utils.formatUnits(cbtBalance, decimals));
        } catch (error) {
          console.error('Failed to load CBT balance:', error);
        }
      }

      // 模拟获取交易历史 (实际应用中应该从区块链或后端API获取)
      const mockTransactions = [
        {
          hash: '0x1234...5678',
          type: 'receive',
          description: '注册奖励',
          amount: '10.00',
          symbol: 'CBT',
          status: 'confirmed',
          timestamp: Date.now() - 86400000
        },
        {
          hash: '0x2345...6789',
          type: 'reward',
          description: '语音翻译奖励',
          amount: '2.50',
          symbol: 'CBT',
          status: 'confirmed',
          timestamp: Date.now() - 172800000
        }
      ];
      
      setTransactions(mockTransactions);

    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setError('加载钱包数据失败');
    } finally {
      setIsLoadingBalances(false);
      setIsLoadingTransactions(false);
    }
  };

  // 处理代币转账
  const handleTokenTransfer = async ({ recipient, amount, memo }) => {
    if (!cbtContract || !signer) {
      setError('钱包未连接或合约不可用');
      return;
    }

    try {
      setIsTransferring(true);
      setError('');

      // 转换金额到合约单位
      const decimals = await cbtContract.decimals();
      const transferAmount = ethers.utils.parseUnits(amount, decimals);

      // 执行转账
      const tx = await cbtContract.transfer(recipient, transferAmount);
      
      // 等待交易确认
      const receipt = await tx.wait();

      // 添加到交易历史
      const newTransaction = {
        hash: receipt.transactionHash,
        type: 'send',
        description: memo || '代币转账',
        amount: amount,
        symbol: 'CBT',
        status: 'confirmed',
        timestamp: Date.now()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      // 刷新余额
      await loadWalletData(provider, walletAddress);
      
      setShowTransfer(false);
      
    } catch (error) {
      console.error('Transfer failed:', error);
      setError(error.message || '转账失败');
    } finally {
      setIsTransferring(false);
    }
  };

  // 监听账户和网络变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          setWalletAddress(accounts[0]);
          if (provider) {
            loadWalletData(provider, accounts[0]);
          }
        }
      };

      const handleChainChanged = (chainId) => {
        window.location.reload(); // 简单处理：重新加载页面
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletAddress, provider]);

  // 可用钱包列表
  const availableWallets = useMemo(() => checkWalletAvailability(), []);

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <ErrorBoundary>
      <div className="super-enhanced-wallet">
        <div className="wallet-container">
          {/* 钱包头部 */}
          <div className="wallet-header">
            <h1 className="wallet-title">💼 钱包管理</h1>
            <p className="wallet-subtitle">
              管理您的 CBT 代币和区块链资产
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="error-banner">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setError('')}>
                ✕
              </Button>
            </div>
          )}

          {connectionStatus === CONNECTION_STATUS.DISCONNECTED ? (
            /* 钱包连接界面 */
            <div className="wallet-connect">
              <div className="connect-header">
                <div className="connect-icon">🔗</div>
                <h2>连接钱包</h2>
                <p>选择一个钱包来开始使用 CultureBridge</p>
              </div>

              <div className="wallet-options">
                {availableWallets.map((wallet) => (
                  <div
                    key={wallet.type}
                    className="wallet-option"
                    onClick={() => connectWallet(wallet.type)}
                  >
                    <WalletIcon type={wallet.type} size="lg" />
                    <div className="wallet-info">
                      <h3>{wallet.name}</h3>
                      <p>使用 {wallet.name} 连接</p>
                    </div>
                    <div className="connect-arrow">→</div>
                  </div>
                ))}
              </div>

              <div className="connect-footer">
                <p>连接钱包即表示您同意我们的服务条款</p>
              </div>
            </div>
          ) : connectionStatus === CONNECTION_STATUS.CONNECTING ? (
            /* 连接中状态 */
            <div className="wallet-connecting">
              <LoadingSpinner variant="circle" size="lg" />
              <h3>正在连接钱包...</h3>
              <p>请在钱包中确认连接请求</p>
            </div>
          ) : (
            /* 钱包已连接界面 */
            <div className="wallet-connected">
              {/* 钱包状态栏 */}
              <div className="wallet-status">
                <div className="status-left">
                  <WalletIcon type={walletType} size="md" />
                  <div className="wallet-info">
                    <h3>{formatAddress(walletAddress)}</h3>
                    <NetworkIndicator 
                      network={currentNetwork} 
                      isCorrect={isCorrectNetwork} 
                    />
                  </div>
                </div>
                
                <div className="status-actions">
                  {!isCorrectNetwork && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => switchNetwork('BSC_MAINNET')}
                    >
                      切换到 BSC
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    断开连接
                  </Button>
                </div>
              </div>

              {/* 标签页导航 */}
              <div className="wallet-tabs">
                <button
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  概览
                </button>
                <button
                  className={`tab-button ${activeTab === 'transfer' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transfer')}
                >
                  转账
                </button>
                <button
                  className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  历史
                </button>
              </div>

              {/* 标签页内容 */}
              <div className="wallet-content">
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    {/* 资产概览 */}
                    <div className="assets-overview">
                      <h3>我的资产</h3>
                      <div className="asset-cards">
                        <div className="asset-card primary">
                          <div className="asset-header">
                            <div className="asset-icon">🪙</div>
                            <div className="asset-info">
                              <h4>CultureBridge Token</h4>
                              <span className="asset-symbol">CBT</span>
                            </div>
                          </div>
                          <TokenBalance
                            balance={cbtBalance}
                            symbol="CBT"
                            usdValue={cbtUsdValue}
                            isLoading={isLoadingBalances}
                          />
                        </div>

                        <div className="asset-card">
                          <div className="asset-header">
                            <div className="asset-icon">💎</div>
                            <div className="asset-info">
                              <h4>BNB</h4>
                              <span className="asset-symbol">BNB</span>
                            </div>
                          </div>
                          <TokenBalance
                            balance={bnbBalance}
                            symbol="BNB"
                            isLoading={isLoadingBalances}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 快速操作 */}
                    <div className="quick-actions">
                      <h3>快速操作</h3>
                      <div className="action-buttons">
                        <Button
                          variant="primary"
                          onClick={() => setActiveTab('transfer')}
                          disabled={!isCorrectNetwork}
                        >
                          📤 转账
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => window.open(`https://bscscan.com/address/${walletAddress}`, '_blank')}
                        >
                          🔍 查看详情
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => loadWalletData(provider, walletAddress)}
                          disabled={isLoadingBalances}
                        >
                          🔄 刷新
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'transfer' && (
                  <div className="transfer-tab">
                    <TokenTransfer
                      onTransfer={handleTokenTransfer}
                      isLoading={isTransferring}
                      balance={cbtBalance}
                    />
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="history-tab">
                    <TransactionHistory
                      transactions={transactions}
                      isLoading={isLoadingTransactions}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SuperEnhancedWalletIntegration;

