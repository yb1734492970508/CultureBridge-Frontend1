// 改进的钱包连接组件
import React, { useState, useEffect, useContext, createContext } from 'react';
import { ethers } from 'ethers';
import { Button, Card, Typography, Alert, Spin, Modal, Select, Badge } from 'antd';
import { WalletOutlined, DisconnectOutlined, SwapOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// 钱包上下文
const WalletContext = createContext();

// BNB链配置
const BNB_CHAIN_CONFIG = {
  chainId: '0x38', // 56 in hex
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

const BNB_TESTNET_CONFIG = {
  chainId: '0x61', // 97 in hex
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};

// CBT代币合约地址（需要部署后更新）
const CBT_CONTRACT_ADDRESS = {
  mainnet: '0x...', // 主网地址
  testnet: '0x...', // 测试网地址
};

// CBT代币ABI（简化版）
const CBT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function culturalTransfer(address to, uint256 amount, uint8 category, string description)",
  "function distributeReward(address recipient, uint8 category, string description)",
  "function claimDailyReward()",
  "function getUserStats(address user) view returns (uint256, uint256, uint256, uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event RewardDistributed(address indexed recipient, uint256 amount, uint8 category, string description)"
];

// 钱包提供者组件
export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [cbtBalance, setCbtBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [cbtContract, setCbtContract] = useState(null);
  const [userStats, setUserStats] = useState(null);

  // 检查钱包连接状态
  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  // 检查现有连接
  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0]);
          setChainId(network.chainId);
          
          await updateBalances(provider, accounts[0]);
          await initializeCbtContract(provider, signer);
        }
      } catch (error) {
        console.error('检查连接失败:', error);
      }
    }
  };

  // 设置事件监听器
  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }
  };

  // 处理账户变更
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      updateBalances(provider, accounts[0]);
    }
  };

  // 处理链变更
  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload(); // 简单处理，重新加载页面
  };

  // 处理断开连接
  const handleDisconnect = () => {
    disconnect();
  };

  // 连接钱包
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('请安装MetaMask或其他Web3钱包');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // 请求账户访问
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setChainId(network.chainId);

      // 检查是否在BNB链上
      if (network.chainId !== 56 && network.chainId !== 97) {
        await switchToBNBChain();
      }

      await updateBalances(provider, account);
      await initializeCbtContract(provider, signer);

    } catch (error) {
      setError(error.message);
      console.error('连接钱包失败:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // 切换到BNB链
  const switchToBNBChain = async (isTestnet = false) => {
    const config = isTestnet ? BNB_TESTNET_CONFIG : BNB_CHAIN_CONFIG;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }],
      });
    } catch (switchError) {
      // 如果链不存在，添加链
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config],
          });
        } catch (addError) {
          throw new Error('添加BNB链失败');
        }
      } else {
        throw switchError;
      }
    }
  };

  // 断开连接
  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    setCbtBalance('0');
    setCbtContract(null);
    setUserStats(null);
    setError(null);
  };

  // 更新余额
  const updateBalances = async (provider, account) => {
    try {
      // 获取BNB余额
      const bnbBalance = await provider.getBalance(account);
      setBalance(ethers.utils.formatEther(bnbBalance));

      // 获取CBT余额（如果合约已部署）
      if (cbtContract) {
        const cbtBalance = await cbtContract.balanceOf(account);
        setCbtBalance(ethers.utils.formatEther(cbtBalance));
      }
    } catch (error) {
      console.error('更新余额失败:', error);
    }
  };

  // 初始化CBT合约
  const initializeCbtContract = async (provider, signer) => {
    try {
      const isTestnet = chainId === 97;
      const contractAddress = isTestnet ? CBT_CONTRACT_ADDRESS.testnet : CBT_CONTRACT_ADDRESS.mainnet;
      
      if (contractAddress && contractAddress !== '0x...') {
        const contract = new ethers.Contract(contractAddress, CBT_ABI, signer);
        setCbtContract(contract);
        
        // 获取用户统计
        const stats = await contract.getUserStats(account);
        setUserStats({
          totalEarned: ethers.utils.formatEther(stats[0]),
          totalSpent: ethers.utils.formatEther(stats[1]),
          transactionCount: stats[2].toString(),
          lastActivityTime: new Date(stats[3].toNumber() * 1000)
        });
      }
    } catch (error) {
      console.error('初始化CBT合约失败:', error);
    }
  };

  // 文化交流转账
  const culturalTransfer = async (to, amount, category, description) => {
    if (!cbtContract) {
      throw new Error('CBT合约未初始化');
    }

    try {
      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await cbtContract.culturalTransfer(to, amountWei, category, description);
      await tx.wait();
      
      // 更新余额
      await updateBalances(provider, account);
      return tx.hash;
    } catch (error) {
      throw new Error(`转账失败: ${error.message}`);
    }
  };

  // 领取每日奖励
  const claimDailyReward = async () => {
    if (!cbtContract) {
      throw new Error('CBT合约未初始化');
    }

    try {
      const tx = await cbtContract.claimDailyReward();
      await tx.wait();
      
      // 更新余额
      await updateBalances(provider, account);
      return tx.hash;
    } catch (error) {
      throw new Error(`领取奖励失败: ${error.message}`);
    }
  };

  const value = {
    account,
    provider,
    signer,
    chainId,
    balance,
    cbtBalance,
    isConnecting,
    error,
    cbtContract,
    userStats,
    connectWallet,
    disconnect,
    switchToBNBChain,
    culturalTransfer,
    claimDailyReward,
    updateBalances
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// 使用钱包上下文的Hook
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet必须在WalletProvider内使用');
  }
  return context;
};

// 钱包连接组件
export const WalletConnect = () => {
  const {
    account,
    chainId,
    balance,
    cbtBalance,
    isConnecting,
    error,
    userStats,
    connectWallet,
    disconnect,
    switchToBNBChain,
    claimDailyReward
  } = useWallet();

  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // 获取链名称
  const getChainName = (chainId) => {
    switch (chainId) {
      case 56: return 'BNB Smart Chain';
      case 97: return 'BNB Testnet';
      default: return '未知网络';
    }
  };

  // 处理每日奖励领取
  const handleClaimReward = async () => {
    setClaiming(true);
    try {
      await claimDailyReward();
      Modal.success({
        title: '领取成功',
        content: '每日登录奖励已发放到您的账户！',
      });
    } catch (error) {
      Modal.error({
        title: '领取失败',
        content: error.message,
      });
    } finally {
      setClaiming(false);
    }
  };

  if (!account) {
    return (
      <Card className="wallet-connect-card" style={{ maxWidth: 400, margin: '20px auto' }}>
        <div style={{ textAlign: 'center' }}>
          <WalletOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>连接钱包</Title>
          <Text type="secondary">
            连接您的Web3钱包开始使用CultureBridge
          </Text>
          
          {error && (
            <Alert
              message={error}
              type="error"
              style={{ margin: '16px 0' }}
              closable
            />
          )}
          
          <Button
            type="primary"
            size="large"
            loading={isConnecting}
            onClick={connectWallet}
            style={{ marginTop: 16, width: '100%' }}
            icon={<WalletOutlined />}
          >
            {isConnecting ? '连接中...' : '连接钱包'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="wallet-info-card" style={{ maxWidth: 500, margin: '20px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>钱包信息</Title>
        <Button
          type="text"
          danger
          icon={<DisconnectOutlined />}
          onClick={disconnect}
        >
          断开连接
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>账户地址：</Text>
        <br />
        <Text code copyable>{account}</Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>网络：</Text>
        <Badge
          color={chainId === 56 || chainId === 97 ? 'green' : 'red'}
          text={getChainName(chainId)}
          style={{ marginLeft: 8 }}
        />
        {chainId !== 56 && chainId !== 97 && (
          <Button
            type="link"
            size="small"
            onClick={() => setShowNetworkModal(true)}
            icon={<SwapOutlined />}
          >
            切换网络
          </Button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>BNB余额：</Text>
        <Text style={{ marginLeft: 8 }}>{parseFloat(balance).toFixed(4)} BNB</Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>CBT余额：</Text>
        <Text style={{ marginLeft: 8 }}>{parseFloat(cbtBalance).toFixed(2)} CBT</Text>
      </div>

      {userStats && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>用户统计：</Text>
          <div style={{ marginLeft: 16, marginTop: 8 }}>
            <div>总收益：{parseFloat(userStats.totalEarned).toFixed(2)} CBT</div>
            <div>总支出：{parseFloat(userStats.totalSpent).toFixed(2)} CBT</div>
            <div>交易次数：{userStats.transactionCount}</div>
          </div>
        </div>
      )}

      <Button
        type="primary"
        loading={claiming}
        onClick={handleClaimReward}
        style={{ width: '100%' }}
      >
        {claiming ? '领取中...' : '领取每日奖励'}
      </Button>

      {/* 网络切换模态框 */}
      <Modal
        title="选择网络"
        open={showNetworkModal}
        onCancel={() => setShowNetworkModal(false)}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button
            type="primary"
            onClick={() => {
              switchToBNBChain(false);
              setShowNetworkModal(false);
            }}
          >
            BNB Smart Chain (主网)
          </Button>
          <Button
            onClick={() => {
              switchToBNBChain(true);
              setShowNetworkModal(false);
            }}
          >
            BNB Smart Chain (测试网)
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default WalletConnect;

