// Web3与区块链翻译聊天功能前端集成
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import CultureTokenABI from '../contracts/abis/CultureToken.json';
import TranslationMarketABI from '../contracts/abis/TranslationMarket.json';
import CulturalNFTABI from '../contracts/abis/CulturalNFT.json';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import '../styles/components/chat/BlockchainTranslationChat.css';

// IPFS配置
const projectId = 'YOUR_INFURA_PROJECT_ID';
const projectSecret = 'YOUR_INFURA_PROJECT_SECRET';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const ipfsClient = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// 合约地址 - 测试网
const CONTRACT_ADDRESSES = {
  cultureToken: '0x123...', // 替换为实际部署地址
  translationMarket: '0x456...', // 替换为实际部署地址
  culturalNFT: '0x789...', // 替换为实际部署地址
};

// 语言选项
const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: '英语' },
  { value: 'ja-JP', label: '日语' },
  { value: 'ko-KR', label: '韩语' },
  { value: 'fr-FR', label: '法语' },
  { value: 'de-DE', label: '德语' },
  { value: 'es-ES', label: '西班牙语' },
  { value: 'ru-RU', label: '俄语' },
  { value: 'ar-SA', label: '阿拉伯语' },
];

// 翻译模式选项
const TRANSLATION_MODES = [
  { value: 'quick', label: '快速翻译', description: '使用AI快速翻译，无需等待人工' },
  { value: 'standard', label: '标准翻译', description: '平衡AI和人工翻译，质量与速度兼顾' },
  { value: 'professional', label: '专业翻译', description: '由专业翻译者审核，质量更高' },
  { value: 'community', label: '社区翻译', description: '由社区成员协作翻译，成本更低' },
];

// 隐私级别选项
const PRIVACY_LEVELS = [
  { value: 'public', label: '公开', description: '翻译内容公开，任何人可查看' },
  { value: 'protected', label: '受保护', description: '翻译内容仅对参与者可见' },
  { value: 'private', label: '私密', description: '使用零知识证明保护隐私' },
];

const BlockchainTranslationChat = () => {
  // 状态变量
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [contracts, setContracts] = useState({});
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('zh-CN');
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  const [translationMode, setTranslationMode] = useState('standard');
  const [privacyLevel, setPrivacyLevel] = useState('protected');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableNFTs, setAvailableNFTs] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [translatorInfo, setTranslatorInfo] = useState(null);
  const [balance, setBalance] = useState('0');
  const [showNFTPanel, setShowNFTPanel] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState({});
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [qualityRating, setQualityRating] = useState(null);
  const [ratingRequestId, setRatingRequestId] = useState(null);
  const [voiceRecognitionText, setVoiceRecognitionText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatContentRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  
  // 初始化Web3
  const initWeb3 = useCallback(async () => {
    try {
      const web3Modal = new Web3Modal({
        network: "testnet",
        cacheProvider: true,
      });
      
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setConnected(true);
      
      // 初始化合约
      const cultureToken = new ethers.Contract(
        CONTRACT_ADDRESSES.cultureToken,
        CultureTokenABI.abi,
        signer
      );
      
      const translationMarket = new ethers.Contract(
        CONTRACT_ADDRESSES.translationMarket,
        TranslationMarketABI.abi,
        signer
      );
      
      const culturalNFT = new ethers.Contract(
        CONTRACT_ADDRESSES.culturalNFT,
        CulturalNFTABI.abi,
        signer
      );
      
      setContracts({
        cultureToken,
        translationMarket,
        culturalNFT
      });
      
      // 获取代币余额
      const balance = await cultureToken.balanceOf(accounts[0]);
      setBalance(ethers.utils.formatEther(balance));
      
      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        window.location.reload();
      });
      
      // 监听链变化
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
    } catch (error) {
      console.error("Error initializing web3:", error);
    }
  }, []);
  
  // 连接钱包
  const connectWallet = useCallback(async () => {
    try {
      await initWeb3();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }, [initWeb3]);
  
  // 加载翻译者信息
  const loadTranslatorInfo = useCallback(async () => {
    if (!contracts.translationMarket || !account) return;
    
    try {
      const info = await contracts.translationMarket.getTranslatorInfo(account);
      setTranslatorInfo({
        wallet: info.wallet,
        languages: info.languages,
        completedJobs: info.completedJobs.toString(),
        totalEarned: ethers.utils.formatEther(info.totalEarned),
        averageQuality: info.averageQuality.toString(),
        reputation: info.reputation.toString(),
        isVerified: info.isVerified,
        isActive: info.isActive
      });
    } catch (error) {
      console.error("Error loading translator info:", error);
    }
  }, [contracts.translationMarket, account]);
  
  // 加载可用的文化NFT
  const loadAvailableNFTs = useCallback(async () => {
    if (!contracts.culturalNFT || !account) return;
    
    try {
      setIsLoading(true);
      
      // 获取与当前语言相关的NFT
      const nfts = await contracts.culturalNFT.getLanguageNFTs(targetLanguage);
      
      const nftDetails = await Promise.all(
        nfts.map(async (tokenId) => {
          const details = await contracts.culturalNFT.getNFTDetails(tokenId);
          
          // 获取元数据
          let metadata = {};
          try {
            if (details.tokenURI.startsWith('ipfs://')) {
              const cid = details.tokenURI.replace('ipfs://', '');
              metadata = await getFromIPFS(cid);
            }
          } catch (error) {
            console.error(`Error fetching metadata for NFT ${tokenId}:`, error);
          }
          
          return {
            tokenId: tokenId.toString(),
            type: details.nftType,
            creator: details.creator,
            language: details.language,
            relatedLanguages: details.relatedLanguages,
            tags: details.tags,
            usageCount: details.usageCount.toString(),
            royaltyPercentage: details.royaltyPercentage.toString(),
            price: ethers.utils.formatEther(details.price),
            isForSale: details.isForSale,
            owner: details.currentOwner,
            name: metadata.name || `NFT #${tokenId}`,
            description: metadata.description || '',
            image: metadata.image || ''
          };
        })
      );
      
      setAvailableNFTs(nftDetails);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setIsLoading(false);
    }
  }, [contracts.culturalNFT, account, targetLanguage, getFromIPFS]);
  
  // 加载可用的翻译服务
  const loadAvailableServices = useCallback(async () => {
    if (!contracts.translationMarket || !account) return;
    
    try {
      setIsLoading(true);
      
      // 获取与当前语言对相关的服务
      const services = await contracts.translationMarket.getAvailableServices(
        sourceLanguage,
        targetLanguage,
        translationMode === 'quick' // 是否AI辅助
      );
      
      const serviceDetails = await Promise.all(
        services.map(async (serviceId) => {
          const details = await contracts.translationMarket.getServiceDetails(serviceId);
          
          return {
            id: serviceId.toString(),
            provider: details.provider,
            languages: details.languages,
            performanceScore: details.performanceScore.toString(),
            pricePerToken: ethers.utils.formatEther(details.pricePerToken),
            isActive: details.isActive,
            metadataURI: details.metadataURI
          };
        })
      );
      
      setAvailableServices(serviceDetails);
      
      // 如果有可用服务，默认选择第一个
      if (serviceDetails.length > 0 && !selectedService) {
        setSelectedService(serviceDetails[0].id);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading services:", error);
      setIsLoading(false);
    }
  }, [contracts.translationMarket, account, sourceLanguage, targetLanguage, translationMode, selectedService]);
  
  // 初始化
  useEffect(() => {
    if (window.ethereum) {
      initWeb3();
    }
    
    // 检测暗色模式
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
    
    // 监听暗色模式变化
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e) => {
      setIsDarkMode(e.matches);
    };
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
      
      // 清理语音识别
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [initWeb3]);
  
  // 加载翻译者信息和NFT
  useEffect(() => {
    if (connected) {
      loadTranslatorInfo();
      loadAvailableNFTs();
      loadAvailableServices();
    }
  }, [connected, loadTranslatorInfo, loadAvailableNFTs, loadAvailableServices]);
  
  // 当语言或翻译模式变化时重新加载服务
  useEffect(() => {
    if (connected) {
      loadAvailableServices();
    }
  }, [sourceLanguage, targetLanguage, translationMode, connected, loadAvailableServices]);
  
  // 消息滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 上传内容到IPFS
  const uploadToIPFS = async (content) => {
    try {
      const added = await ipfsClient.add(JSON.stringify(content));
      return added.path;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      return null;
    }
  };
  
  // 从IPFS获取内容
  const getFromIPFS = async (cid) => {
    try {
      const stream = ipfsClient.cat(cid);
      let data = '';
      
      for await (const chunk of stream) {
        data += new TextDecoder().decode(chunk);
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting from IPFS:', error);
      return null;
    }
  };
  
  // 注册为翻译者
  const registerAsTranslator = async () => {
    if (!contracts.translationMarket) return;
    
    try {
      setIsLoading(true);
      
      const languages = [sourceLanguage, targetLanguage];
      const tx = await contracts.translationMarket.registerTranslator(languages);
      
      // 添加到待处理交易
      const txId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          hash: tx.hash,
          description: '注册为翻译者',
          status: 'pending'
        }
      }));
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          ...prev[txId],
          status: receipt.status === 1 ? 'confirmed' : 'failed'
        }
      }));
      
      await loadTranslatorInfo();
      
      // 添加系统消息
      addSystemMessage('您已成功注册为翻译者！现在可以接受翻译请求并获得奖励。');
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error registering as translator:", error);
      
      // 添加错误消息
      addSystemMessage('注册翻译者失败，请稍后再试。', 'error');
      
      setIsLoading(false);
    }
  };
  
  // 创建翻译请求
  const createTranslationRequest = async (text) => {
    if (!contracts.translationMarket || !contracts.cultureToken) return null;
    
    try {
      // 上传内容到IPFS
      const content = {
        text,
        sourceLanguage,
        timestamp: Date.now()
      };
      
      const contentHash = await uploadToIPFS(content);
      if (!contentHash) throw new Error("Failed to upload content to IPFS");
      
      // 设置奖励和截止时间
      const reward = ethers.utils.parseEther("10"); // 10个代币
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时后
      
      // 批准代币转移
      const approveTx = await contracts.cultureToken.approve(
        CONTRACT_ADDRESSES.translationMarket,
        reward
      );
      
      // 添加到待处理交易
      const approveTxId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [approveTxId]: {
          hash: approveTx.hash,
          description: '批准代币转移',
          status: 'pending'
        }
      }));
      
      await approveTx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [approveTxId]: {
          ...prev[approveTxId],
          status: 'confirmed'
        }
      }));
      
      // 创建请求
      const tx = await contracts.translationMarket.createRequest(
        contentHash,
        sourceLanguage,
        targetLanguage,
        reward,
        deadline,
        translationMode === 'quick', // 是否AI辅助
        selectedService || '0', // 服务ID
        privacyLevel === 'private' // 是否使用隐私保护
      );
      
      // 添加到待处理交易
      const txId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          hash: tx.hash,
          description: '创建翻译请求',
          status: 'pending'
        }
      }));
      
      const receipt = await tx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          ...prev[txId],
          status: receipt.status === 1 ? 'confirmed' : 'failed'
        }
      }));
      
      // 从事件中获取请求ID
      const event = receipt.events.find(e => e.event === 'RequestCreated');
      const requestId = event.args.requestId;
      
      // 更新余额
      const balance = await contracts.cultureToken.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));
      
      return requestId;
    } catch (error) {
      console.error("Error creating translation request:", error);
      
      // 添加错误消息
      addSystemMessage('创建翻译请求失败，请稍后再试。', 'error');
      
      return null;
    }
  };
  
  // 接受翻译请求
  const acceptTranslationRequest = async (requestId) => {
    if (!contracts.translationMarket) return false;
    
    try {
      setIsLoading(true);
      
      const tx = await contracts.translationMarket.acceptRequest(requestId);
      
      // 添加到待处理交易
      const txId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          hash: tx.hash,
          description: '接受翻译请求',
          status: 'pending'
        }
      }));
      
      const receipt = await tx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          ...prev[txId],
          status: receipt.status === 1 ? 'confirmed' : 'failed'
        }
      }));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error accepting translation request:", error);
      
      // 添加错误消息
      addSystemMessage('接受翻译请求失败，请稍后再试。', 'error');
      
      setIsLoading(false);
      return false;
    }
  };
  
  // 提交翻译结果
  const submitTranslation = async (requestId, translatedText) => {
    if (!contracts.translationMarket) return false;
    
    try {
      setIsLoading(true);
      
      // 上传翻译结果到IPFS
      const content = {
        text: translatedText,
        targetLanguage,
        timestamp: Date.now()
      };
      
      const translationHash = await uploadToIPFS(content);
      if (!translationHash) throw new Error("Failed to upload translation to IPFS");
      
      // 提交翻译
      const tx = await contracts.translationMarket.submitTranslation(requestId, translationHash);
      
      // 添加到待处理交易
      const txId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          hash: tx.hash,
          description: '提交翻译结果',
          status: 'pending'
        }
      }));
      
      const receipt = await tx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          ...prev[txId],
          status: receipt.status === 1 ? 'confirmed' : 'failed'
        }
      }));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error submitting translation:", error);
      
      // 添加错误消息
      addSystemMessage('提交翻译结果失败，请稍后再试。', 'error');
      
      setIsLoading(false);
      return false;
    }
  };
  
  // 验证翻译质量
  const verifyTranslation = async (requestId, quality) => {
    if (!contracts.translationMarket) return false;
    
    try {
      setIsLoading(true);
      
      const tx = await contracts.translationMarket.verifyTranslation(requestId, quality);
      
      // 添加到待处理交易
      const txId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          hash: tx.hash,
          description: '验证翻译质量',
          status: 'pending'
        }
      }));
      
      const receipt = await tx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          ...prev[txId],
          status: receipt.status === 1 ? 'confirmed' : 'failed'
        }
      }));
      
      // 清除评分状态
      setQualityRating(null);
      setRatingRequestId(null);
      
      // 添加系统消息
      addSystemMessage('感谢您的评分！您的反馈将帮助提高翻译质量。');
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error verifying translation:", error);
      
      // 添加错误消息
      addSystemMessage('提交评分失败，请稍后再试。', 'error');
      
      setIsLoading(false);
      return false;
    }
  };
  
  // 铸造文化NFT
  const mintCulturalNFT = async (text, type, language, relatedLanguages, tags) => {
    if (!contracts.culturalNFT) return null;
    
    try {
      setIsLoading(true);
      
      // 准备元数据
      const metadata = {
        name: `Cultural ${type === 0 ? 'Translation' : type === 1 ? 'Explanation' : 'Resource'}`,
        description: text,
        language,
        relatedLanguages,
        tags,
        creator: account,
        creationDate: Date.now()
      };
      
      // 上传到IPFS
      const tokenURI = await uploadToIPFS(metadata);
      if (!tokenURI) throw new Error("Failed to upload metadata to IPFS");
      
      // 铸造NFT
      const royaltyPercentage = 10; // 10%
      const price = ethers.utils.parseEther("5"); // 5个代币
      const isForSale = true;
      
      const tx = await contracts.culturalNFT.mintNFT(
        account,
        tokenURI,
        type,
        language,
        relatedLanguages,
        tags,
        royaltyPercentage,
        price,
        isForSale
      );
      
      // 添加到待处理交易
      const txId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          hash: tx.hash,
          description: '铸造文化NFT',
          status: 'pending'
        }
      }));
      
      const receipt = await tx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          ...prev[txId],
          status: receipt.status === 1 ? 'confirmed' : 'failed'
        }
      }));
      
      // 从事件中获取代币ID
      const event = receipt.events.find(e => e.event === 'NFTMinted');
      const tokenId = event.args.tokenId;
      
      await loadAvailableNFTs();
      
      // 添加系统消息
      addSystemMessage(`恭喜！您已成功铸造文化NFT #${tokenId}。`);
      
      setIsLoading(false);
      return tokenId;
    } catch (error) {
      console.error("Error minting NFT:", error);
      
      // 添加错误消息
      addSystemMessage('铸造NFT失败，请稍后再试。', 'error');
      
      setIsLoading(false);
      return null;
    }
  };
  
  // 使用NFT
  const useNFT = async (tokenId) => {
    if (!contracts.culturalNFT || !contracts.cultureToken) return false;
    
    try {
      // 获取NFT详情
      const details = await contracts.culturalNFT.getNFTDetails(tokenId);
      
      // 批准代币转移
      const royaltyAmount = ethers.utils.parseEther("1").mul(details.royaltyPercentage).div(100);
      const approveTx = await contracts.cultureToken.approve(
        CONTRACT_ADDRESSES.culturalNFT,
        royaltyAmount
      );
      
      // 添加到待处理交易
      const approveTxId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [approveTxId]: {
          hash: approveTx.hash,
          description: '批准代币转移',
          status: 'pending'
        }
      }));
      
      await approveTx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [approveTxId]: {
          ...prev[approveTxId],
          status: 'confirmed'
        }
      }));
      
      // 使用NFT
      const tx = await contracts.culturalNFT.useNFT(tokenId, account);
      
      // 添加到待处理交易
      const txId = Date.now().toString();
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          hash: tx.hash,
          description: '使用文化NFT',
          status: 'pending'
        }
      }));
      
      const receipt = await tx.wait();
      
      // 更新交易状态
      setPendingTransactions(prev => ({
        ...prev,
        [txId]: {
          ...prev[txId],
          status: receipt.status === 1 ? 'confirmed' : 'failed'
        }
      }));
      
      // 更新余额
      const balance = await contracts.cultureToken.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));
      
      return true;
    } catch (error) {
      console.error("Error using NFT:", error);
      
      // 添加错误消息
      addSystemMessage('使用NFT失败，请稍后再试。', 'error');
      
      return false;
    }
  };
  
  // 添加系统消息
  const addSystemMessage = (text, type = 'info') => {
    const systemMessage = {
      id: Date.now(),
      text,
      sender: 'system',
      type,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };
  
  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !connected) return;
    
    setIsTranslating(true);
    
    try {
      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        text: inputText,
        sender: 'user',
        language: sourceLanguage,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      
      // 创建翻译请求
      const requestId = await createTranslationRequest(inputText);
      
      if (!requestId) {
        throw new Error("Failed to create translation request");
      }
      
      // 使用选定的NFT
      for (const nft of selectedNFTs) {
        await useNFT(nft.tokenId);
      }
      
      // 模拟翻译过程
      // 在实际应用中，这里应该等待翻译者接受并完成翻译
      // 或者使用AI自动翻译
      
      // 模拟翻译结果
      const translatedText = `[Translated] ${inputText}`;
      
      // 添加翻译消息
      const translationMessage = {
        id: Date.now() + 1,
        text: translatedText,
        sender: 'translation',
        language: targetLanguage,
        requestId,
        timestamp: new Date().toISOString(),
        usedNFTs: selectedNFTs.map(nft => nft.tokenId),
        originalText: inputText
      };
      
      setMessages(prev => [...prev, translationMessage]);
      
      // 设置评分请求ID
      setRatingRequestId(requestId);
      
      // 更新余额
      const balance = await contracts.cultureToken.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));
      
      // 如果有文化上下文，添加提示
      if (Math.random() > 0.7) {
        const culturalContext = {
          id: Date.now() + 2,
          text: '这个表达在目标语言文化中有特殊含义，通常用于正式场合。',
          sender: 'cultural-context',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, culturalContext]);
      }
      
      // 如果有学习建议，添加提示
      if (Math.random() > 0.8) {
        const learningSuggestion = {
          id: Date.now() + 3,
          text: '建议学习相关词汇："business meeting", "appointment", "schedule"',
          sender: 'learning-suggestion',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, learningSuggestion]);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // 添加错误消息
      addSystemMessage('发送消息失败: ' + error.message, 'error');
    } finally {
      setIsTranslating(false);
    }
  };
  
  // 处理语音输入
  const handleVoiceInput = () => {
    if (!connected) return;
    
    if (isRecording) {
      // 停止录音
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
      setIsRecording(false);
    } else {
      // 开始录音
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
          addSystemMessage('您的浏览器不支持语音识别功能。', 'error');
          return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.lang = sourceLanguage;
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setInputText(prev => prev + ' ' + finalTranscript);
          }
          
          setVoiceRecognitionText(interimTranscript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          addSystemMessage(`语音识别错误: ${event.error}`, 'error');
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          setVoiceRecognitionText('');
        };
        
        recognition.start();
        speechRecognitionRef.current = recognition;
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        addSystemMessage('启动语音识别失败，请稍后再试。', 'error');
      }
    }
  };
  
  // 选择NFT
  const handleSelectNFT = (nft) => {
    if (selectedNFTs.some(selected => selected.tokenId === nft.tokenId)) {
      setSelectedNFTs(prev => prev.filter(selected => selected.tokenId !== nft.tokenId));
    } else {
      setSelectedNFTs(prev => [...prev, nft]);
    }
  };
  
  // 切换NFT面板
  const toggleNFTPanel = () => {
    setShowNFTPanel(prev => !prev);
  };
  
  // 切换原文/译文显示
  const toggleOriginalText = (messageId) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, showOriginal: !message.showOriginal } 
          : message
      )
    );
  };
  
  // 提交翻译质量评分
  const handleSubmitRating = async () => {
    if (qualityRating === null || ratingRequestId === null) return;
    
    await verifyTranslation(ratingRequestId, qualityRating);
  };
  
  // 渲染区块链状态指示器
  const renderBlockchainStatus = () => {
    return (
      <div className="blockchain-status">
        <div className={`blockchain-status-indicator ${connected ? '' : 'disconnected'}`}></div>
        <span>{connected ? 'BNB链已连接' : '未连接'}</span>
      </div>
    );
  };
  
  // 渲染钱包信息
  const renderWalletInfo = () => {
    if (!connected) {
      return (
        <button className="wallet-connect-button" onClick={connectWallet}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M21 8h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4" />
          </svg>
          连接钱包
        </button>
      );
    }
    
    return (
      <div className="wallet-info">
        <div className="wallet-address">
          {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </div>
        <div className="token-balance">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" />
          </svg>
          {parseFloat(balance).toFixed(2)} CULT
        </div>
      </div>
    );
  };
  
  // 渲染消息
  const renderMessages = () => {
    return messages.map(message => {
      // 用户消息
      if (message.sender === 'user') {
        return (
          <div 
            key={message.id} 
            className="message user-message"
          >
            <div className="message-header">
              <span className="language-tag">{LANGUAGE_OPTIONS.find(l => l.value === message.language)?.label || message.language}</span>
              <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="message-content">{message.text}</div>
          </div>
        );
      }
      
      // 翻译消息
      if (message.sender === 'translation') {
        return (
          <div 
            key={message.id} 
            className="message translation-message"
            onClick={() => toggleOriginalText(message.id)}
          >
            <div className="message-header">
              <span className="language-tag">{LANGUAGE_OPTIONS.find(l => l.value === message.language)?.label || message.language}</span>
              <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            
            {message.showOriginal ? (
              <div className="swipeable-message">
                <div className="swipeable-message-inner" style={{ transform: 'translateX(-50%)' }}>
                  <div className="swipeable-message-original">{message.originalText}</div>
                  <div className="swipeable-message-translated">{message.text}</div>
                </div>
                <div className="swipeable-message-indicator">
                  <div className="swipeable-message-dot active"></div>
                  <div className="swipeable-message-dot"></div>
                </div>
              </div>
            ) : (
              <div className="swipeable-message">
                <div className="swipeable-message-inner">
                  <div className="swipeable-message-original">{message.originalText}</div>
                  <div className="swipeable-message-translated">{message.text}</div>
                </div>
                <div className="swipeable-message-indicator">
                  <div className="swipeable-message-dot"></div>
                  <div className="swipeable-message-dot active"></div>
                </div>
              </div>
            )}
            
            {message.usedNFTs && message.usedNFTs.length > 0 && (
              <div className="nft-tags">
                {message.usedNFTs.map(tokenId => {
                  const nft = availableNFTs.find(n => n.tokenId === tokenId);
                  return (
                    <span key={tokenId} className="nft-tag">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-10-8h12v2H6V6z" />
                      </svg>
                      {nft ? nft.name : `NFT #${tokenId}`}
                    </span>
                  );
                })}
              </div>
            )}
            
            {message.requestId && ratingRequestId === message.requestId && (
              <div className="quality-rating">
                <div className="quality-rating-header">
                  <h4>翻译质量评分</h4>
                  <span>{qualityRating || 0}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={qualityRating || 0}
                  onChange={(e) => setQualityRating(parseInt(e.target.value))}
                  className="quality-rating-slider"
                  aria-label="翻译质量评分"
                />
                <div className="quality-rating-labels">
                  <span>较差</span>
                  <span>一般</span>
                  <span>优秀</span>
                </div>
                <button 
                  className="quality-rating-submit"
                  onClick={handleSubmitRating}
                  disabled={qualityRating === null}
                >
                  提交评分
                </button>
              </div>
            )}
          </div>
        );
      }
      
      // 系统消息
      if (message.sender === 'system') {
        return (
          <div 
            key={message.id} 
            className={`message system-message ${message.type}`}
          >
            <div className="message-content">{message.text}</div>
          </div>
        );
      }
      
      // 文化上下文提示
      if (message.sender === 'cultural-context') {
        return (
          <div key={message.id} className="cultural-context-hint">
            <div className="cultural-context-hint-header">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              文化上下文
            </div>
            {message.text}
          </div>
        );
      }
      
      // 学习建议
      if (message.sender === 'learning-suggestion') {
        return (
          <div key={message.id} className="language-learning-suggestion">
            <div className="language-learning-suggestion-header">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
              </svg>
              学习建议
            </div>
            {message.text}
          </div>
        );
      }
      
      return null;
    });
  };
  
  // 渲染NFT列表
  const renderNFTs = () => {
    if (availableNFTs.length === 0) {
      return <div className="empty-nft-message">暂无可用的文化NFT</div>;
    }
    
    return availableNFTs.map(nft => (
      <div 
        key={nft.tokenId} 
        className={`nft-item ${selectedNFTs.some(selected => selected.tokenId === nft.tokenId) ? 'selected' : ''}`}
        onClick={() => handleSelectNFT(nft)}
        data-testid="capability-item"
      >
        <div className="nft-header">
          <span className="nft-id">#{nft.tokenId}</span>
          <span className="nft-type">
            {nft.type === 0 ? '翻译' : nft.type === 1 ? '文化' : '语言'}
          </span>
        </div>
        <div className="nft-language">{LANGUAGE_OPTIONS.find(l => l.value === nft.language)?.label || nft.language}</div>
        <div className="nft-tags">
          {nft.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <div className="nft-footer">
          <span className="nft-usage">使用: {nft.usageCount}</span>
          <span className="nft-price">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" />
            </svg>
            {nft.price}
          </span>
        </div>
      </div>
    ));
  };
  
  // 渲染服务列表
  const renderServices = () => {
    if (availableServices.length === 0) {
      return <option value="">暂无可用服务</option>;
    }
    
    return [
      <option key="default" value="">选择服务</option>,
      ...availableServices.map(service => (
        <option key={service.id} value={service.id}>
          服务 #{service.id} - 评分: {service.performanceScore}/100
        </option>
      ))
    ];
  };
  
  // 渲染待处理交易
  const renderPendingTransactions = () => {
    const pendingTxs = Object.entries(pendingTransactions).filter(([_, tx]) => tx.status === 'pending');
    
    if (pendingTxs.length === 0) return null;
    
    return (
      <div className="pending-transactions">
        {pendingTxs.map(([id, tx]) => (
          <div key={id} className="pending-transaction">
            <div className="tx-confirmation-animation">
              <div className="tx-confirmation-circle"></div>
              <div className="tx-confirmation-circle"></div>
            </div>
            <span>{tx.description}...</span>
            <a 
              href={`https://testnet.bscscan.com/tx/${tx.hash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="tx-link"
            >
              查看
            </a>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染语音识别动画
  const renderVoiceRecognition = () => {
    if (!isRecording) return null;
    
    return (
      <div className="voice-recognition-animation">
        <div className="voice-recognition-circle">
          <svg className="voice-recognition-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        {voiceRecognitionText && (
          <div className="voice-recognition-text">{voiceRecognitionText}</div>
        )}
      </div>
    );
  };
  
  // 渲染隐私级别指示器
  const renderPrivacyLevel = () => {
    const level = PRIVACY_LEVELS.find(l => l.value === privacyLevel);
    const dots = PRIVACY_LEVELS.map((_, index) => {
      const isActive = index <= PRIVACY_LEVELS.findIndex(l => l.value === privacyLevel);
      return <div key={index} className={`privacy-level-dot ${isActive ? 'active' : ''}`}></div>;
    });
    
    return (
      <div className={`privacy-level privacy-level-${privacyLevel}`}>
        <label>隐私级别:</label>
        <select
          value={privacyLevel}
          onChange={(e) => setPrivacyLevel(e.target.value)}
        >
          {PRIVACY_LEVELS.map(level => (
            <option key={level.value} value={level.value}>{level.label}</option>
          ))}
        </select>
        <div className="privacy-level-indicator">
          {dots}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`blockchain-chat-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* 头部 */}
      <div className="blockchain-chat-header">
        <h2>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M21 14.5v-2.5c0-1.1-.9-2-2-2h-1v-1c0-1.1-.9-2-2-2h-1v-1c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-1h1c1.1 0 2-.9 2-2z" />
          </svg>
          BNB链驱动的AI翻译
        </h2>
        <div className="header-actions">
          {renderBlockchainStatus()}
          {renderWalletInfo()}
        </div>
      </div>
      
      {/* 聊天内容 */}
      <div className="blockchain-chat-content" ref={chatContentRef}>
        {renderMessages()}
        {renderVoiceRecognition()}
        {renderPendingTransactions()}
        <div ref={messagesEndRef} />
      </div>
      
      {/* NFT选择面板 */}
      <div className={`nft-selection-panel ${showNFTPanel ? 'open' : ''}`}>
        <div className="nft-panel-header">
          <h3>选择文化NFT增强翻译</h3>
          <button onClick={toggleNFTPanel}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="nft-list">
          {renderNFTs()}
        </div>
      </div>
      
      {/* 输入区域 */}
      <div className="blockchain-chat-input">
        <div className="input-options">
          <div className="language-selector">
            <label htmlFor="source-language">源语言:</label>
            <select
              id="source-language"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 12h8M12 8l4 4-4 4" />
            </svg>
            
            <label htmlFor="target-language">目标语言:</label>
            <select
              id="target-language"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="translation-mode">
            <label htmlFor="translation-mode">翻译模式:</label>
            <select
              id="translation-mode"
              value={translationMode}
              onChange={(e) => setTranslationMode(e.target.value)}
            >
              {TRANSLATION_MODES.map(mode => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>
          
          {renderPrivacyLevel()}
          
          <div className="service-selector">
            <label htmlFor="ai-service">AI服务:</label>
            <select
              id="ai-service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {renderServices()}
            </select>
          </div>
        </div>
        
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入要翻译的文本..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <div className="input-actions">
            <button 
              className="nft-button"
              onClick={toggleNFTPanel}
              title="选择文化NFT"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
            
            <button 
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceInput}
              title={isRecording ? "停止录音" : "语音输入"}
            >
              {isRecording ? (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              )}
            </button>
            
            <button 
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || !connected || isTranslating}
              title="翻译"
            >
              {isTranslating ? (
                <div className="voice-waveform">
                  <div className="voice-waveform-bar"></div>
                  <div className="voice-waveform-bar"></div>
                  <div className="voice-waveform-bar"></div>
                  <div className="voice-waveform-bar"></div>
                  <div className="voice-waveform-bar"></div>
                </div>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">处理中，请稍候...</div>
        </div>
      )}
    </div>
  );
};

export default BlockchainTranslationChat;
