/**
 * 集成翻译请求状态通知的区块链翻译聊天组件
 * 用于连接前端界面与本地Hardhat网络部署的智能合约
 */

import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import BlockchainConnector from '../../utils/BlockchainConnector';
import RequestStatusTracker from '../translation/RequestStatusTracker';
import TranslationRequestDetail from '../translation/TranslationRequestDetail';
import ToastNotification from '../notifications/ToastNotification';
import './BlockchainTranslationChatLocal.css';

const BlockchainTranslationChatLocal = () => {
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
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // 翻译请求表单
  const [translationForm, setTranslationForm] = useState({
    content: '',
    sourceLanguage: 'en',
    targetLanguage: 'zh',
    reward: '10',
    deadline: '',
    isAIAssisted: false
  });

  // 语音识别
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  
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

        // 检测暗色模式偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setDarkMode(true);
        }

        // 监听暗色模式变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
          setDarkMode(e.matches);
        });
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
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
      const contractAddresses = BlockchainConnector.contracts[networkKey];
      
      // 初始化合约实例
      if (contractAddresses.CultureToken) {
        const tokenContract = new ethers.Contract(
          contractAddresses.CultureToken,
          BlockchainConnector.CultureTokenABI.abi,
          signer
        );
        setCultureToken(tokenContract);
      }
      
      if (contractAddresses.AIRegistry) {
        const registryContract = new ethers.Contract(
          contractAddresses.AIRegistry,
          BlockchainConnector.AIRegistryABI.abi,
          signer
        );
        setAIRegistry(registryContract);
      }
      
      if (contractAddresses.CulturalNFT) {
        const nftContract = new ethers.Contract(
          contractAddresses.CulturalNFT,
          BlockchainConnector.CulturalNFTABI.abi,
          signer
        );
        setCulturalNFT(nftContract);
      }
      
      if (contractAddresses.TranslationMarket) {
        const marketContract = new ethers.Contract(
          contractAddresses.TranslationMarket,
          BlockchainConnector.TranslationMarketABI.abi,
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
      setIsRefreshing(true);
      
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
      setIsRefreshing(false);
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
        imageUrl: 'https://example.com/nft1.jpg',
        price: '50',
        isForSale: true
      },
      {
        id: 2,
        name: '文化解释器NFT',
        type: 'CulturalExplanation',
        language: 'en-zh',
        imageUrl: 'https://example.com/nft2.jpg',
        price: '75',
        isForSale: false
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
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 86400000).toISOString() // 24小时后
      },
      {
        id: '0x456...',
        content: 'This is a test translation request',
        sourceLanguage: 'en',
        targetLanguage: 'zh',
        reward: '15',
        status: 'Completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 24小时前
        completedAt: new Date().toISOString(),
        translation: '这是一个测试翻译请求'
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
        performanceScore: 85,
        reputationScore: 4.2,
        reviewCount: 128
      },
      {
        id: 2,
        provider: '0x789...',
        serviceType: '文化解释',
        languages: ['en', 'zh'],
        pricePerToken: '0.2',
        performanceScore: 90,
        reputationScore: 4.7,
        reviewCount: 93
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

  // 处理请求状态变化
  const handleRequestStatusChange = (oldStatus, newStatus) => {
    showNotification(`翻译请求状态从 ${oldStatus} 变更为 ${newStatus}`, 'info');
    // 重新加载用户数据
    loadUserData(account);
  };

  // 开始语音识别
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showNotification('您的浏览器不支持语音识别功能', 'warning');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = translationForm.sourceLanguage === 'zh' ? 'zh-CN' : 'en-US';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      
      if (finalTranscript) {
        setTranslationForm(prev => ({
          ...prev,
          content: prev.content + finalTranscript
        }));
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      setIsListening(false);
      showNotification(`语音识别错误: ${event.error}`, 'error');
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  // 停止语音识别
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // 切换暗色模式
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
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
              {nft.isForSale && <span className="for-sale-badge">出售中</span>}
            </div>
            <div className="nft-info">
              <h3>{nft.name}</h3>
              <p>类型: {nft.type}</p>
              <p>语言: {nft.language}</p>
              {nft.isForSale ? (
                <div className="nft-price">
                  <span>价格: {nft.price} CULT</span>
                  <button className="btn-buy-nft">购买</button>
                </div>
              ) : (
                <div className="nft-actions">
                  <button className="btn-use-nft">使用此NFT</button>
                  <button className="btn-sell-nft">出售</button>
                </div>
              )}
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
          <div 
            key={request.id} 
            className={`request-card status-${request.status.toLowerCase()}`}
            onClick={() => {
              setSelectedRequestId(request.id);
              setShowRequestDetail(true);
            }}
          >
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
              <p>截止日期: {new Date(request.deadline).toLocaleDateString()}</p>
            </div>
            <div className="request-actions">
              <button 
                className="btn-view-details"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRequestId(request.id);
                  setShowRequestDetail(true);
                }}
              >
                查看详情
              </button>
              {request.status === 'Created' && (
                <button 
                  className="btn-cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('取消请求功能尚未实现');
                  }}
                >
                  取消请求
                </button>
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
              <div className="service-rating">
                <div className="rating-stars">
                  {Array(5).fill().map((_, i) => (
                    <span 
                      key={i} 
                      className={`star ${i < Math.floor(service.reputationScore) ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-score">{service.reputationScore.toFixed(1)}</span>
                <span className="rating-count">({service.reviewCount})</span>
              </div>
            </div>
            <div className="service-details">
              <p>提供者: {service.provider.substring(0, 6)}...{service.provider.substring(38)}</p>
              <p>支持语言: {service.languages.join(', ')}</p>
              <p>价格: {service.pricePerToken} CULT/token</p>
              <div className="performance-meter">
                <span className="performance-label">性能评分:</span>
                <div className="performance-bar-container">
                  <div 
                    className="performance-bar" 
                    style={{ width: `${service.performanceScore}%` }}
                  ></div>
                </div>
                <span className="performance-score">{service.performanceScore}/100</span>
              </div>
            </div>
            <div className="service-actions">
              <button className="btn-use-service">使用此服务</button>
              <button className="btn-compare">对比</button>
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
          <div className="content-input-container">
            <textarea
              id="content"
              name="content"
              value={translationForm.content}
              onChange={handleFormChange}
              placeholder="请输入需要翻译的内容"
              rows={5}
              required
            />
            <div className="voice-input-controls">
              {isListening ? (
                <button 
                  type="button" 
                  className="btn-voice-stop" 
                  onClick={stopListening}
                  title="停止语音输入"
                >
                  <span className="recording-indicator"></span>
                  停止
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn-voice-start" 
                  onClick={startListening}
                  title="开始语音输入"
                >
                  🎤
                </button>
              )}
            </div>
          </div>
          {isListening && transcript && (
            <div className="transcript-preview">
              <p>{transcript}</p>
            </div>
          )}
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
              min="1"
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
          type="button"
          className="btn-create-request"
          onClick={createTranslationRequest}
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : '创建翻译请求'}
        </button>
      </div>
    );
  };
  
  return (
    <div className={`blockchain-translation-chat ${darkMode ? 'dark-mode' : ''}`}>
      {/* 头部 */}
      <div className="chat-header">
        <h2>区块链翻译聊天</h2>
        
        <div className="header-actions">
          <button 
            className="btn-toggle-theme" 
            onClick={toggleDarkMode}
            title={darkMode ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {isConnected ? (
            <div className="account-info">
              <span className="token-balance">{tokenBalance} CULT</span>
              <span className="account-address">
                {account.substring(0, 6)}...{account.substring(38)}
              </span>
              <span className={`network-badge ${isLocalNetwork ? 'local' : 'testnet'}`}>
                {isLocalNetwork ? 'Local' : 'Testnet'}
              </span>
            </div>
          ) : (
            <button
              className="btn-connect-wallet"
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? '连接中...' : '连接钱包'}
            </button>
          )}
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="chat-content">
        {!isConnected ? (
          <div className="connect-wallet-prompt">
            <div className="prompt-icon">🔗</div>
            <h3>请连接您的钱包</h3>
            <p>连接钱包以使用区块链翻译服务</p>
            <button
              className="btn-connect-wallet"
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? '连接中...' : '连接钱包'}
            </button>
          </div>
        ) : (
          <>
            {/* 标签页 */}
            <div className="content-tabs">
              <button
                className={`tab-btn ${activeTab === 'translation' ? 'active' : ''}`}
                onClick={() => setActiveTab('translation')}
              >
                创建翻译请求
              </button>
              <button
                className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                我的请求
                <span className="badge">{translationRequests.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'nfts' ? 'active' : ''}`}
                onClick={() => setActiveTab('nfts')}
              >
                我的NFT
                <span className="badge">{ownedNFTs.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                AI服务
              </button>
            </div>
            
            {/* 标签页内容 */}
            <div className="tab-content">
              {activeTab === 'translation' && renderTranslationForm()}
              {activeTab === 'requests' && (
                <div className="requests-container">
                  <div className="section-header">
                    <h3>我的翻译请求</h3>
                    <button 
                      className={`btn-refresh ${isRefreshing ? 'spinning' : ''}`}
                      onClick={() => loadUserData(account)}
                      disabled={isRefreshing}
                      title="刷新数据"
                    >
                      ↻
                    </button>
                  </div>
                  {renderTranslationRequests()}
                </div>
              )}
              {activeTab === 'nfts' && (
                <div className="nfts-container">
                  <div className="section-header">
                    <h3>我的NFT资产</h3>
                    <button 
                      className={`btn-refresh ${isRefreshing ? 'spinning' : ''}`}
                      onClick={() => loadUserData(account)}
                      disabled={isRefreshing}
                      title="刷新数据"
                    >
                      ↻
                    </button>
                  </div>
                  {renderNFTList()}
                </div>
              )}
              {activeTab === 'services' && (
                <div className="services-container">
                  <div className="section-header">
                    <h3>可用的AI服务</h3>
                    <button 
                      className={`btn-refresh ${isRefreshing ? 'spinning' : ''}`}
                      onClick={() => loadUserData(account)}
                      disabled={isRefreshing}
                      title="刷新数据"
                    >
                      ↻
                    </button>
                  </div>
                  {renderAIServices()}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* 请求详情模态框 */}
      {showRequestDetail && selectedRequestId && (
        <div className="modal-overlay">
          <div className="modal-container">
            <TranslationRequestDetail 
              requestId={selectedRequestId}
              onClose={() => {
                setShowRequestDetail(false);
                setSelectedRequestId(null);
              }}
            />
          </div>
        </div>
      )}
      
      {/* 通知 */}
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

export default BlockchainTranslationChatLocal;
