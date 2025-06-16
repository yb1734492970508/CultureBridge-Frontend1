/**
 * 钱包连接组件 - Wallet Connect Component
 * 支持MetaMask、WalletConnect等多种钱包连接方式
 */

import React, { useState, useEffect } from 'react';
import { Wallet, ExternalLink, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const WalletConnect = ({ onWalletConnected, onDisconnect }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [cbtBalance, setCbtBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);
  const [copied, setCopied] = useState(false);

  // CBT代币合约地址 (BNB链测试网)
  const CBT_CONTRACT_ADDRESS = process.env.REACT_APP_CBT_CONTRACT_ADDRESS || '0x...';
  const CBT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
  ];

  useEffect(() => {
    checkWalletConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await updateBalances(accounts[0]);
          await getNetworkInfo();
          onWalletConnected && onWalletConnected(accounts[0]);
        }
      } catch (error) {
        console.error('检查钱包连接失败:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('请安装MetaMask钱包');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await updateBalances(accounts[0]);
        await getNetworkInfo();
        onWalletConnected && onWalletConnected(accounts[0]);
      }
    } catch (error) {
      setError('连接钱包失败: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setCbtBalance('0');
    setNetwork(null);
    setError(null);
    onDisconnect && onDisconnect();
  };

  const updateBalances = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // 获取BNB余额
      const bnbBalance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(bnbBalance));

      // 获取CBT代币余额
      if (CBT_CONTRACT_ADDRESS && CBT_CONTRACT_ADDRESS !== '0x...') {
        const contract = new ethers.Contract(CBT_CONTRACT_ADDRESS, CBT_ABI, provider);
        const tokenBalance = await contract.balanceOf(address);
        const decimals = await contract.decimals();
        setCbtBalance(ethers.utils.formatUnits(tokenBalance, decimals));
      }
    } catch (error) {
      console.error('更新余额失败:', error);
    }
  };

  const getNetworkInfo = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      setNetwork(network);
    } catch (error) {
      console.error('获取网络信息失败:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      updateBalances(accounts[0]);
      onWalletConnected && onWalletConnected(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const switchToBSC = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC Mainnet
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'Binance Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed1.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
        } catch (addError) {
          setError('添加BSC网络失败');
        }
      } else {
        setError('切换网络失败');
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      137: 'Polygon',
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  if (!account) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <CardTitle>连接钱包</CardTitle>
          <CardDescription>
            连接您的Web3钱包以开始使用CultureBridge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                连接中...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                连接MetaMask
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            请确保已安装MetaMask浏览器扩展
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">钱包已连接</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnectWallet}>
            断开
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 账户信息 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">账户地址</span>
            <div className="flex items-center space-x-2">
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {formatAddress(account)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0"
              >
                {copied ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* 网络信息 */}
          {network && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">网络</span>
              <Badge variant={network.chainId === 56 ? "default" : "secondary"}>
                {getNetworkName(network.chainId)}
              </Badge>
            </div>
          )}
        </div>

        {/* 余额信息 */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">B</span>
              </div>
              <span className="font-medium">BNB</span>
            </div>
            <span className="font-mono">{parseFloat(balance).toFixed(4)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-6 w-6 text-blue-600" />
              <span className="font-medium">CBT</span>
            </div>
            <span className="font-mono">{parseFloat(cbtBalance).toFixed(2)}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2 pt-3 border-t">
          {network && network.chainId !== 56 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={switchToBSC}
              className="w-full"
            >
              切换到BSC主网
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(`https://bscscan.com/address/${account}`, '_blank')}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            在BSCScan查看
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;

