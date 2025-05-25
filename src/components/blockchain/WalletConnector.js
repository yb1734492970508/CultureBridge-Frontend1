import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../../context/blockchain/BlockchainContext';

/**
 * 增强版钱包连接组件
 * 支持多种网络和连接状态显示
 */
const WalletConnector = () => {
  const { active, account, library, chainId, activate, deactivate, error } = useWeb3React();
  
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  
  // 检查MetaMask是否已安装
  useEffect(() => {
    setIsMetaMaskInstalled(typeof window !== 'undefined' && !!window.ethereum);
  }, []);
  
  // 获取账户余额
  useEffect(() => {
    if (active && account && library) {
      let isMounted = true;
      
      library.getBalance(account)
        .then((balance) => {
          if (isMounted) {
            const etherBalance = parseFloat(library.utils.formatEther(balance)).toFixed(4);
            setBalance(etherBalance);
          }
        })
        .catch((error) => {
          console.error('获取余额失败:', error);
        });
      
      return () => {
        isMounted = false;
      };
    } else {
      setBalance(null);
    }
  }, [active, account, library]);
  
  // 获取网络名称
  useEffect(() => {
    if (chainId) {
      switch (chainId) {
        case 1:
          setNetworkName('以太坊主网');
          break;
        case 3:
          setNetworkName('Ropsten测试网');
          break;
        case 4:
          setNetworkName('Rinkeby测试网');
          break;
        case 5:
          setNetworkName('Goerli测试网');
          break;
        case 42:
          setNetworkName('Kovan测试网');
          break;
        case 56:
          setNetworkName('币安智能链');
          break;
        case 97:
          setNetworkName('币安测试网');
          break;
        case 11155111:
          setNetworkName('Sepolia测试网');
          break;
        case 80001:
          setNetworkName('Polygon Mumbai');
          break;
        default:
          setNetworkName(`未知网络 (ID: ${chainId})`);
      }
    } else {
      setNetworkName('');
    }
  }, [chainId]);
  
  // 连接钱包
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }
    
    setIsConnecting(true);
    try {
      await activate(injected);
    } catch (error) {
      console.error('连接钱包失败:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // 断开钱包连接
  const disconnectWallet = () => {
    try {
      deactivate();
    } catch (error) {
      console.error('断开钱包连接失败:', error);
    }
  };
  
  // 切换网络
  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;
    
    try {
      // 尝试切换到目标网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError) {
      // 如果网络不存在，尝试添加网络
      if (switchError.code === 4902) {
        try {
          let params;
          
          switch (targetChainId) {
            case 11155111: // Sepolia
              params = {
                chainId: '0xaa36a7',
                chainName: 'Sepolia测试网',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              };
              break;
            case 80001: // Mumbai
              params = {
                chainId: '0x13881',
                chainName: 'Polygon Mumbai',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
                blockExplorerUrls: ['https://mumbai.polygonscan.com']
              };
              break;
            default:
              throw new Error(`不支持添加chainId为${targetChainId}的网络`);
          }
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          });
        } catch (addError) {
          console.error('添加网络失败:', addError);
        }
      } else {
        console.error('切换网络失败:', switchError);
      }
    }
  };
  
  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="wallet-connector">
      {!active ? (
        <div className="wallet-connect-container">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="connect-wallet-btn"
          >
            {isConnecting ? '连接中...' : isMetaMaskInstalled ? '连接钱包' : '安装MetaMask'}
          </button>
          
          {error && (
            <div className="wallet-error">
              <p>连接错误: {error.message}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="wallet-info">
          <div className="wallet-account">
            <span className="account-address" title={account}>
              {formatAddress(account)}
            </span>
            {balance !== null && (
              <span className="account-balance">
                {balance} ETH
              </span>
            )}
          </div>
          
          <div className="wallet-network">
            <span className="network-badge" title={`网络ID: ${chainId}`}>
              {networkName}
            </span>
            
            <div className="network-switcher">
              <button
                onClick={() => switchNetwork(1)}
                className={`network-btn ${chainId === 1 ? 'active' : ''}`}
                title="以太坊主网"
              >
                主网
              </button>
              <button
                onClick={() => switchNetwork(11155111)}
                className={`network-btn ${chainId === 11155111 ? 'active' : ''}`}
                title="Sepolia测试网"
              >
                Sepolia
              </button>
              <button
                onClick={() => switchNetwork(80001)}
                className={`network-btn ${chainId === 80001 ? 'active' : ''}`}
                title="Polygon Mumbai测试网"
              >
                Mumbai
              </button>
            </div>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="disconnect-wallet-btn"
          >
            断开连接
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
