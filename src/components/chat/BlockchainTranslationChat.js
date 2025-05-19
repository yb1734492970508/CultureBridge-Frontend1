// Web3与区块链翻译聊天功能前端集成
import React, { useState, useEffect, useCallback } from 'react';
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
  const [translationMode, setTranslationMode] = useState('standard'); // 'quick', 'standard', 'professional', 'community'
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableNFTs, setAvailableNFTs] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [translatorInfo, setTranslatorInfo] = useState(null);
  const [balance, setBalance] = useState('0');
  
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
      // 获取与当前语言相关的NFT
      const nfts = await contracts.culturalNFT.getLanguageNFTs(targetLanguage);
      
      const nftDetails = await Promise.all(
        nfts.map(async (tokenId) => {
          const details = await contracts.culturalNFT.getNFTDetails(tokenId);
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
            owner: details.currentOwner
          };
        })
      );
      
      setAvailableNFTs(nftDetails);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    }
  }, [contracts.culturalNFT, account, targetLanguage]);
  
  // 初始化
  useEffect(() => {
    if (window.ethereum) {
      initWeb3();
    }
  }, [initWeb3]);
  
  // 加载翻译者信息和NFT
  useEffect(() => {
    if (connected) {
      loadTranslatorInfo();
      loadAvailableNFTs();
    }
  }, [connected, loadTranslatorInfo, loadAvailableNFTs]);
  
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
      const languages = [sourceLanguage, targetLanguage];
      const tx = await contracts.translationMarket.registerTranslator(languages);
      await tx.wait();
      
      await loadTranslatorInfo();
      alert("Successfully registered as translator!");
    } catch (error) {
      console.error("Error registering as translator:", error);
      alert("Failed to register as translator");
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
      await approveTx.wait();
      
      // 创建请求
      const tx = await contracts.translationMarket.createRequest(
        contentHash,
        sourceLanguage,
        targetLanguage,
        reward,
        deadline,
        translationMode === 'quick' // 是否AI辅助
      );
      
      const receipt = await tx.wait();
      
      // 从事件中获取请求ID
      const event = receipt.events.find(e => e.event === 'RequestCreated');
      const requestId = event.args.requestId;
      
      return requestId;
    } catch (error) {
      console.error("Error creating translation request:", error);
      return null;
    }
  };
  
  // 接受翻译请求
  const acceptTranslationRequest = async (requestId) => {
    if (!contracts.translationMarket) return false;
    
    try {
      const tx = await contracts.translationMarket.acceptRequest(requestId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error accepting translation request:", error);
      return false;
    }
  };
  
  // 提交翻译结果
  const submitTranslation = async (requestId, translatedText) => {
    if (!contracts.translationMarket) return false;
    
    try {
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
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error submitting translation:", error);
      return false;
    }
  };
  
  // 验证翻译质量
  const verifyTranslation = async (requestId, quality) => {
    if (!contracts.translationMarket) return false;
    
    try {
      const tx = await contracts.translationMarket.verifyTranslation(requestId, quality);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error verifying translation:", error);
      return false;
    }
  };
  
  // 铸造文化NFT
  const mintCulturalNFT = async (text, type, language, relatedLanguages, tags) => {
    if (!contracts.culturalNFT) return null;
    
    try {
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
      
      const receipt = await tx.wait();
      
      // 从事件中获取代币ID
      const event = receipt.events.find(e => e.event === 'NFTMinted');
      const tokenId = event.args.tokenId;
      
      await loadAvailableNFTs();
      
      return tokenId;
    } catch (error) {
      console.error("Error minting NFT:", error);
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
      await approveTx.wait();
      
      // 使用NFT
      const tx = await contracts.culturalNFT.useNFT(tokenId, account);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error using NFT:", error);
      return false;
    }
  };
  
  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !connected) return;
    
    setIsLoading(true);
    
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
      
      // 模拟翻译过程
      // 在实际应用中，这里应该等待翻译者接受并完成翻译
      // 或者使用AI自动翻译
      
      // 使用选定的NFT
      for (const nft of selectedNFTs) {
        await useNFT(nft.tokenId);
      }
      
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
        usedNFTs: selectedNFTs.map(nft => nft.tokenId)
      };
      
      setMessages(prev => [...prev, translationMessage]);
      
      // 更新余额
      const balance = await contracts.cultureToken.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理语音输入
  const handleVoiceInput = () => {
    if (!connected) return;
    
    if (isRecording) {
      // 停止录音
      setIsRecording(false);
      // 这里应该有停止录音并处理语音的逻辑
    } else {
      // 开始录音
      setIsRecording(true);
      // 这里应该有开始录音的逻辑
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
  
  // 渲染消息
  const renderMessages = () => {
    return messages.map(message => (
      <div 
        key={message.id} 
        className={`message ${message.sender === 'user' ? 'user-message' : 'translation-message'}`}
      >
        <div className="message-header">
          <span className="language-tag">{message.language}</span>
          <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="message-content">{message.text}</div>
        {message.sender === 'translation' && message.usedNFTs && message.usedNFTs.length > 0 && (
          <div className="nft-tags">
            {message.usedNFTs.map(tokenId => (
              <span key={tokenId} className="nft-tag">NFT #{tokenId}</span>
            ))}
          </div>
        )}
      </div>
    ));
  };
  
  // 渲染NFT列表
  const renderNFTs = () => {
    return availableNFTs.map(nft => (
      <div 
        key={nft.tokenId} 
        className={`nft-item ${selectedNFTs.some(selected => selected.tokenId === nft.tokenId) ? 'selected' : ''}`}
        onClick={() => handleSelectNFT(nft)}
      >
        <div className="nft-header">
          <span className="nft-id">#{nft.tokenId}</span>
          <span className="nft-type">
            {nft.type === 0 ? 'Translation' : nft.type === 1 ? 'Cultural' : 'Language'}
          </span>
        </div>
        <div className="nft-language">{nft.language}</div>
        <div className="nft-tags">
          {nft.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <div className="nft-footer">
          <span className="nft-usage">Used: {nft.usageCount}</span>
          <span className="nft-royalty">{nft.royaltyPercentage}%</span>
        </div>
      </div>
    ));
  };
  
  return (
    <div className="blockchain-translation-chat">
      <div className="chat-header">
        <h2>区块链驱动的翻译聊天</h2>
        {!connected ? (
          <button className="connect-wallet-btn" onClick={connectWallet}>
            连接钱包
          </button>
        ) : (
          <div className="wallet-info">
            <span className="account">{account.substring(0, 6)}...{account.substring(38)}</span>
            <span className="balance">{parseFloat(balance).toFixed(2)} CULT</span>
          </div>
        )}
      </div>
      
      <div className="chat-settings">
        <div className="language-selector">
          <select 
            value={sourceLanguage} 
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            <option value="zh-CN">中文</option>
            <option value="en-US">英语</option>
            <option value="ja-JP">日语</option>
            <option value="ko-KR">韩语</option>
            <option value="fr-FR">法语</option>
            <option value="de-DE">德语</option>
          </select>
          <span className="arrow-icon">→</span>
          <select 
            value={targetLanguage} 
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option value="en-US">英语</option>
            <option value="zh-CN">中文</option>
            <option value="ja-JP">日语</option>
            <option value="ko-KR">韩语</option>
            <option value="fr-FR">法语</option>
            <option value="de-DE">德语</option>
          </select>
        </div>
        
        <div className="translation-mode">
          <select 
            value={translationMode} 
            onChange={(e) => setTranslationMode(e.target.value)}
          >
            <option value="quick">快速模式 (AI优先)</option>
            <option value="standard">标准模式 (AI+人工)</option>
            <option value="professional">专业模式 (专家翻译)</option>
            <option value="community">社区模式 (众包翻译)</option>
          </select>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="messages-container">
          {renderMessages()}
        </div>
        
        <div className="nft-sidebar">
          <h3>文化知识NFT</h3>
          <div className="nft-list">
            {availableNFTs.length > 0 ? renderNFTs() : (
              <p className="no-nfts">没有可用的NFT</p>
            )}
          </div>
          <button className="mint-nft-btn" onClick={() => mintCulturalNFT(
            "示例文化解释",
            1, // 文化解释类型
            sourceLanguage,
            [targetLanguage],
            ["文化", "习俗", "示例"]
          )}>
            铸造新NFT
          </button>
        </div>
      </div>
      
      <div className="input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入要翻译的文本..."
          disabled={!connected || isLoading}
        />
        <div className="input-actions">
          <button 
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            onClick={handleVoiceInput}
            disabled={!connected || isLoading}
          >
            {isRecording ? '停止录音' : '语音输入'}
          </button>
          <button 
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!connected || !inputText.trim() || isLoading}
          >
            {isLoading ? '处理中...' : '发送'}
          </button>
        </div>
      </div>
      
      {!translatorInfo?.isActive && connected && (
        <div className="translator-registration">
          <p>成为翻译者，赚取代币奖励！</p>
          <button onClick={registerAsTranslator}>注册为翻译者</button>
        </div>
      )}
      
      {translatorInfo?.isActive && (
        <div className="translator-stats">
          <h3>翻译者信息</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">已完成工作:</span>
              <span className="stat-value">{translatorInfo.completedJobs}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">总收入:</span>
              <span className="stat-value">{translatorInfo.totalEarned} CULT</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">平均质量:</span>
              <span className="stat-value">{translatorInfo.averageQuality}/100</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">声誉分数:</span>
              <span className="stat-value">{translatorInfo.reputation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainTranslationChat;
