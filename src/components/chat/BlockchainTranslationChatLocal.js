/**
 * 区块链翻译聊天前端与本地合约集成组件
 * 用于连接前端界面与本地Hardhat网络部署的智能合约
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contracts from '../../config/contracts';
import CultureTokenABI from '../../contracts/abis/CultureToken.json';
import AIRegistryABI from '../../contracts/abis/AIRegistry.json';
import CulturalNFTABI from '../../contracts/abis/CulturalNFT.json';
import TranslationMarketABI from '../../contracts/abis/TranslationMarket.json';
import ToastNotification from '../notifications/ToastNotification';
import './BlockchainTranslationChat.css';

const BlockchainTranslationChat = () => {
  // 状态变量
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLocalNetwork, setIsLocalNetwork] = useState(false);
  
  // 合约实例
  const [cultureToken, setCultureToken] = useState(null);
  const [aiRegistry, setAIRegistry] = useState(null);
  const [culturalNFT, setCulturalNFT] = useState(null);
  const [translationMarket, setTranslationMarket] = useState(null);
  
  // 用户数据
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [translationRequests, setTranslationRequests] = useState([]);
  const [aiServices, setAIServices] = useState([]);
  
  // UI状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [activeTab, setActiveTab] = useState('translation');
  
  // 翻译请求表单
  const [translationForm, setTranslationForm] = useState({
    content: '',
    sourceLanguage: 'en',
    targetLanguage: 'zh',
    reward: '10',
    deadline: '',
    isAIAssisted: false
  });
  
  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        // 检查是否有MetaMask
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);
          
          // 获取网络ID
          const network = await web3Provider.getNetwork();
          setNetworkId(network.chainId);
          
          // 判断是否是本地网络
          setIsLocalNetwork(network.chainId === 31337);
          
          // 监听账户变化
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
          
          // 尝试获取已连接的账户
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            handleAccountsChanged(accounts);
          }
        } else {
          showNotification('请安装MetaMask钱包以使用区块链功能', 'warning');
        }
      } catch (err) {
        console.error('初始化错误:', err);
        setError('初始化Web3连接失败');
      }
    };
    
    init();
    
    // 清理函数
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);
  
  // 账户变化处理
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // 用户断开了连接
      setAccount('');
      setSigner(null);
      setIsConnected(false);
      resetContractInstances();
    } else {
      // 用户切换了账户
      const newAccount = accounts[0];
      setAccount(newAccount);
      
      if (provider) {
        const newSigner = provider.getSigner();
        setSigner(newSigner);
        setIsConnected(true);
        
        // 初始化合约实例
        initContractInstances(newSigner);
        
        // 加载用户数据
        loadUserData(newAccount);
      }
    }
  };
  
  // 网络变化处理
  const handleChainChanged = (chainId) => {
    window.location.reload();
  };
  
  // 连接钱包
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        handleAccountsChanged(accounts);
        showNotification('钱包连接成功', 'success');
      } else {
        showNotification('请安装MetaMask钱包', 'warning');
      }
    } catch (err) {
      console.error('连接钱包错误:', err);
      setError('连接钱包失败');
      showNotification('连接钱包失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 初始化合约实例
  const initContractInstances = async (signer) => {
    try {
      // 获取当前网络的合约地址
      const networkKey = isLocalNetwork ? 'hardhat' : 'bscTestnet';
      const contractAddresses = contracts[networkKey];
      
      // 初始化合约实例
      if (contractAddresses.CultureToken) {
        const tokenContract = new ethers.Contract(
          contractAddresses.CultureToken,
          CultureTokenABI.abi,
          signer
        );
        setCultureToken(tokenContract);
      }
      
      if (contractAddresses.AIRegistry) {
        const registryContract = new ethers.Contract(
          contractAddresses.AIRegistry,
          AIRegistryABI.abi,
          signer
        );
        setAIRegistry(registryContract);
      }
      
      if (contractAddresses.CulturalNFT) {
        const nftContract = new ethers.Contract(
          contractAddresses.CulturalNFT,
          CulturalNFTABI.abi,
          signer
        );
        setCulturalNFT(nftContract);
      }
      
      if (contractAddresses.TranslationMarket) {
        const marketContract = new ethers.Contract(
          contractAddresses.TranslationMarket,
          TranslationMarketABI.abi,
          signer
        );
        setTranslationMarket(marketContract);
      }
    } catch (err) {
      console.error('初始化合约实例错误:', err);
      setError('初始化合约实例失败');
    }
  };
  
  // 重置合约实例
  const resetContractInstances = () => {
    setCultureToken(null);
    setAIRegistry(null);
    setCulturalNFT(null);
    setTranslationMarket(null);
    setTokenBalance('0');
    setOwnedNFTs([]);
    setTranslationRequests([]);
    setAIServices([]);
  };
  
  // 加载用户数据
  const loadUserData = async (userAccount) => {
    try {
      setIsLoading(true);
      
      // 加载代币余额
      if (cultureToken) {
        const balance = await cultureToken.balanceOf(userAccount);
        setTokenBalance(ethers.utils.formatEther(balance));
      }
      
      // 加载用户拥有的NFT
      if (culturalNFT) {
        // 这里需要根据实际合约方法获取用户NFT
        // 示例实现，实际需要根据合约方法调整
        const nfts = await loadUserNFTs(userAccount);
        setOwnedNFTs(nfts);
      }
      
      // 加载用户的翻译请求
      if (translationMarket) {
        // 这里需要根据实际合约方法获取用户翻译请求
        // 示例实现，实际需要根据合约方法调整
        const requests = await loadUserTranslationRequests(userAccount);
        setTranslationRequests(requests);
      }
      
      // 加载AI服务
      if (aiRegistry) {
        // 这里需要根据实际合约方法获取AI服务
        // 示例实现，实际需要根据合约方法调整
        const services = await loadAIServices();
        setAIServices(services);
      }
      
      showNotification('用户数据加载成功', 'success');
    } catch (err) {
      console.error('加载用户数据错误:', err);
      setError('加载用户数据失败');
      showNotification('加载用户数据失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 加载用户NFT（示例实现）
  const loadUserNFTs = async (userAccount) => {
    // 模拟数据，实际应从合约获取
    return [
      {
        id: 1,
        name: '中英翻译专家NFT',
        type: 'TranslationMemory',
        language: 'en-zh',
        imageUrl: 'https://example.com/nft1.jpg'
      },
      {
        id: 2,
        name: '文化解释器NFT',
        type: 'CulturalExplanation',
        language: 'en-zh',
        imageUrl: 'https://example.com/nft2.jpg'
      }
    ];
  };
  
  // 加载用户翻译请求（示例实现）
  const loadUserTranslationRequests = async (userAccount) => {
    // 模拟数据，实际应从合约获取
    return [
      {
        id: '0x123...',
        content: '这是一个测试翻译请求',
        sourceLanguage: 'zh',
        targetLanguage: 'en',
        reward: '10',
        status: 'Created',
        createdAt: new Date().toISOString()
      }
    ];
  };
  
  // 加载AI服务（示例实现）
  const loadAIServices = async () => {
    // 模拟数据，实际应从合约获取
    return [
      {
        id: 1,
        provider: '0x456...',
        serviceType: '机器翻译',
        languages: ['en', 'zh', 'ja'],
        pricePerToken: '0.1',
        performanceScore: 85
      },
      {
        id: 2,
        provider: '0x789...',
        serviceType: '文化解释',
        languages: ['en', 'zh'],
        pricePerToken: '0.2',
        performanceScore: 90
      }
    ];
  };
  
  // 创建翻译请求
  const createTranslationRequest = async () => {
    try {
      setIsLoading(true);
      
      if (!translationMarket || !cultureToken) {
        throw new Error('合约实例未初始化');
      }
      
      const { content, sourceLanguage, targetLanguage, reward, deadline, isAIAssisted } = translationForm;
      
      // 验证表单
      if (!content || !sourceLanguage || !targetLanguage || !reward || !deadline) {
        throw new Error('请填写所有必填字段');
      }
      
      // 计算截止时间（Unix时间戳）
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
      
      // 将奖励金额转换为wei
      const rewardInWei = ethers.utils.parseEther(reward);
      
      // 授权TranslationMarket合约使用代币
      const approveTx = await cultureToken.approve(translationMarket.address, rewardInWei);
      await approveTx.wait();
      
      // 创建翻译请求
      // 注意：这里使用了IPFS哈希作为内容标识，实际应用中需要先将内容上传到IPFS
      const contentHash = 'QmTest' + Date.now(); // 模拟IPFS哈希
      
      const tx = await translationMarket.createRequest(
        contentHash,
        sourceLanguage,
        targetLanguage,
        rewardInWei,
        deadlineTimestamp,
        isAIAssisted
      );
      
      await tx.wait();
      
      // 重新加载用户数据
      await loadUserData(account);
      
      // 重置表单
      setTranslationForm({
        content: '',
        sourceLanguage: 'en',
        targetLanguage: 'zh',
        reward: '10',
        deadline: '',
        isAIAssisted: false
      });
      
      showNotification('翻译请求创建成功', 'success');
    } catch (err) {
      console.error('创建翻译请求错误:', err);
      setError('创建翻译请求失败');
      showNotification('创建翻译请求失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTranslationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // 显示通知
  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // 3秒后自动关闭
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // 渲染NFT列表
  const renderNFTList = () => {
    if (ownedNFTs.length === 0) {
      return <p className="empty-message">您还没有拥有任何NFT</p>;
    }
    
    return (
      <div className="nft-grid">
        {ownedNFTs.map(nft => (
          <div key={nft.id} className="nft-card">
            <div className="nft-image">
              <img src={nft.imageUrl} alt={nft.name} />
            </div>
            <div className="nft-info">
              <h3>{nft.name}</h3>
              <p>类型: {nft.type}</p>
              <p>语言: {nft.language}</p>
              <button className="btn-use-nft">使用此NFT</button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染翻译请求列表
  const renderTranslationRequests = () => {
    if (translationRequests.length === 0) {
      return <p className="empty-message">您还没有创建任何翻译请求</p>;
    }
    
    return (
      <div className="requests-list">
        {translationRequests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <span className={`status-badge status-${request.status.toLowerCase()}`}>
                {request.status}
              </span>
              <span className="request-date">{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="request-content">
              <p>{request.content}</p>
            </div>
            <div className="request-details">
              <p>从 {request.sourceLanguage} 翻译到 {request.targetLanguage}</p>
              <p>奖励: {request.reward} CULT</p>
            </div>
            <div className="request-actions">
              <button className="btn-view-details">查看详情</button>
              {request.status === 'Created' && (
                <button className="btn-cancel">取消请求</button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染AI服务列表
  const renderAIServices = () => {
    if (aiServices.length === 0) {
      return <p className="empty-message">暂无可用的AI服务</p>;
    }
    
    return (
      <div className="services-list">
        {aiServices.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <h3>{service.serviceType}</h3>
              <span className="performance-score">
                评分: {service.performanceScore}/100
              </span>
            </div>
            <div className="service-details">
              <p>提供者: {service.provider.substring(0, 6)}...{service.provider.substring(38)}</p>
              <p>支持语言: {service.languages.join(', ')}</p>
              <p>价格: {service.pricePerToken} CULT/token</p>
            </div>
            <div className="service-actions">
              <button className="btn-use-service">使用此服务</button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染创建翻译请求表单
  const renderTranslationForm = () => {
    return (
      <div className="translation-form">
        <h3>创建新的翻译请求</h3>
        
        <div className="form-group">
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            name="content"
            value={translationForm.content}
            onChange={handleFormChange}
            placeholder="请输入需要翻译的内容"
            rows={5}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sourceLanguage">源语言</label>
            <select
              id="sourceLanguage"
              name="sourceLanguage"
              value={translationForm.sourceLanguage}
              onChange={handleFormChange}
              required
            >
              <option value="en">英语</option>
              <option value="zh">中文</option>
              <option value="ja">日语</option>
              <option value="ko">韩语</option>
              <option value="fr">法语</option>
              <option value="de">德语</option>
              <option value="es">西班牙语</option>
              <option value="ru">俄语</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="targetLanguage">目标语言</label>
            <select
              id="targetLanguage"
              name="targetLanguage"
              value={translationForm.targetLanguage}
              onChange={handleFormChange}
              required
            >
              <option value="zh">中文</option>
              <option value="en">英语</option>
              <option value="ja">日语</option>
              <option value="ko">韩语</option>
              <option value="fr">法语</option>
              <option value="de">德语</option>
              <option value="es">西班牙语</option>
              <option value="ru">俄语</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reward">奖励 (CULT代币)</label>
            <input
              type="number"
              id="reward"
              name="reward"
              value={translationForm.reward}
              onChange={handleFormChange}
              min="10"
              step="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="deadline">截止日期</label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={translationForm.deadline}
              onChange={handleFormChange}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isAIAssisted"
            name="isAIAssisted"
            checked={translationForm.isAIAssisted}
            onChange={handleFormChange}
          />
          <label htmlFor="isAIAssisted">允许AI辅助翻译</label>
        </div>
        
        <button
          className="btn-create-request"
          onClick={createTranslationRequest}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? '处理中...' : '创建翻译请求'}
        </button>
      </div>
    );
  };
  
  return (
    <div className="blockchain-translation-chat">
      <div className="header">
        <h2>区块链翻译聊天</h2>
        
        <div className="wallet-info">
          {isConnected ? (
            <>
              <div className="account-info">
                <span className="network-badge">
                  {isLocalNetwork ? '本地网络' : '测试网'}
                </span>
                <span className="account-address">
                  {account.substring(0, 6)}...{account.substring(38)}
                </span>
                <span className="token-balance">
                  {tokenBalance} CULT
                </span>
              </div>
              <button className="btn-disconnect" onClick={() => window.location.reload()}>
                断开连接
              </button>
            </>
          ) : (
            <button className="btn-connect" onClick={connectWallet} disabled={isLoading}>
              {isLoading ? '连接中...' : '连接钱包'}
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {isConnected ? (
        <div className="main-content">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'translation' ? 'active' : ''}`}
              onClick={() => setActiveTab('translation')}
            >
              翻译请求
            </button>
            <button
              className={`tab ${activeTab === 'nfts' ? 'active' : ''}`}
              onClick={() => setActiveTab('nfts')}
            >
              我的NFT
            </button>
            <button
              className={`tab ${activeTab === 'ai-services' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-services')}
            >
              AI服务
            </button>
            <button
              className={`tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              创建请求
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'translation' && (
              <div className="translation-requests-tab">
                <h3>我的翻译请求</h3>
                {renderTranslationRequests()}
              </div>
            )}
            
            {activeTab === 'nfts' && (
              <div className="nfts-tab">
                <h3>我的NFT资产</h3>
                {renderNFTList()}
              </div>
            )}
            
            {activeTab === 'ai-services' && (
              <div className="ai-services-tab">
                <h3>可用的AI服务</h3>
                {renderAIServices()}
              </div>
            )}
            
            {activeTab === 'create' && (
              <div className="create-request-tab">
                {renderTranslationForm()}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="connect-prompt">
          <p>请连接您的钱包以使用区块链翻译服务</p>
          <button className="btn-connect-large" onClick={connectWallet} disabled={isLoading}>
            {isLoading ? '连接中...' : '连接钱包'}
          </button>
        </div>
      )}
      
      {notification.show && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default BlockchainTranslationChat;
