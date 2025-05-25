// 文化知识产权保护系统组件设计文档

/**
 * CopyrightProtection.js - 文化知识产权保护系统
 * 
 * 该组件实现基于区块链的文化作品版权保护功能，包括：
 * 1. 文化作品链上版权登记
 * 2. 时间戳证明与数字签名验证
 * 3. 版权查询与验证
 * 4. 侵权举报与处理
 * 
 * 与现有系统集成：
 * - 与DID系统集成，确保创作者身份可验证
 * - 与NFT系统协同，支持版权作品NFT化
 * - 与声誉系统关联，版权行为影响创作者声誉
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import { useNavigate } from 'react-router-dom';
import { Steps, Button, Spin, Alert, Progress, Tooltip, Modal, Tabs, Badge } from 'antd';
import { 
  FileAddOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CopyrightOutlined,
  FileSearchOutlined,
  WarningOutlined,
  BlockOutlined,
  HistoryOutlined,
  UserOutlined,
  LinkOutlined
} from '@ant-design/icons';
import './CopyrightProtection.css';

// IPFS配置
const projectId = process.env.REACT_APP_INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID';
const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET || 'YOUR_INFURA_PROJECT_SECRET';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const ipfsClient = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// 版权保护智能合约ABI
const copyrightABI = [
  "function registerCopyright(string memory contentHash, string memory title, string memory description, string memory contentType, string memory metadataURI) external returns (uint256)",
  "function verifyCopyright(string memory contentHash) external view returns (bool, address, uint256)",
  "function getCopyrightDetails(uint256 copyrightId) external view returns (string memory, string memory, string memory, string memory, address, uint256, string memory)",
  "function reportInfringement(uint256 copyrightId, string memory evidenceURI, string memory description) external returns (uint256)",
  "function getInfringementReports(uint256 copyrightId) external view returns (uint256[] memory)",
  "function getReportDetails(uint256 reportId) external view returns (uint256, address, string memory, string memory, uint8, uint256)",
  "function getUserCopyrights(address user) external view returns (uint256[] memory)",
  "function getUserReports(address user) external view returns (uint256[] memory)",
  "function getReceivedReports(address user) external view returns (uint256[] memory)",
  "function mintCopyrightNFT(uint256 copyrightId, string memory tokenURI) external",
  "function verifyCopyrightWithSignature(string memory contentHash, bytes memory signature) external view returns (bool, address, uint256)",
  "function getCopyrightHistory(uint256 copyrightId) external view returns (uint256[] memory, address[] memory, string[] memory)",
  "event CopyrightRegistered(uint256 indexed copyrightId, address indexed creator, string contentHash, uint256 timestamp)",
  "event InfringementReported(uint256 indexed reportId, uint256 indexed copyrightId, address reporter, uint256 timestamp)",
  "event CopyrightNFTMinted(uint256 indexed copyrightId, uint256 indexed tokenId, address indexed creator)"
];

// 版权类型选项
const contentTypes = [
  { value: 'text', label: '文本作品', icon: '📄', description: '包括文章、书籍、诗歌等文字创作' },
  { value: 'image', label: '图像作品', icon: '🖼️', description: '包括照片、插画、绘画等视觉创作' },
  { value: 'audio', label: '音频作品', icon: '🎵', description: '包括音乐、播客、有声读物等听觉创作' },
  { value: 'video', label: '视频作品', icon: '🎬', description: '包括电影、短视频、动画等视听创作' },
  { value: 'software', label: '软件作品', icon: '💻', description: '包括应用程序、代码库等软件创作' },
  { value: 'other', label: '其他作品', icon: '📦', description: '不属于上述类别的其他创意作品' }
];

// 侵权报告状态
const reportStatuses = [
  '待处理',
  '审核中',
  '已确认',
  '已驳回',
  '已解决'
];

// 文件类型限制
const allowedFileTypes = {
  text: ['.txt', '.doc', '.docx', '.pdf', '.md', '.rtf'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  audio: ['.mp3', '.wav', '.ogg', '.flac', '.aac'],
  video: ['.mp4', '.webm', '.avi', '.mov', '.mkv'],
  software: ['.zip', '.rar', '.tar.gz', '.js', '.py', '.java', '.cpp'],
  other: ['*']
};

// 最大文件大小 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 文化知识产权保护系统组件
 */
const CopyrightProtection = () => {
  const navigate = useNavigate();
  const { TabPane } = Tabs;
  const { Step } = Steps;
  
  // 区块链上下文
  const { account, provider, isConnected, connectWallet, getSigner, chainId } = useBlockchain();
  
  // 组件状态
  const [activeTab, setActiveTab] = useState('register');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  
  // 版权登记状态
  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('text');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [additionalMetadata, setAdditionalMetadata] = useState('');
  const [canMintNFT, setCanMintNFT] = useState(false);
  const [mintingNFT, setMintingNFT] = useState(false);
  const [contentHash, setContentHash] = useState('');
  const [didSignature, setDidSignature] = useState(null);
  const [registrationSummary, setRegistrationSummary] = useState(null);
  
  // 版权查询状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('hash');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCopyright, setSelectedCopyright] = useState(null);
  const [userCopyrights, setUserCopyrights] = useState([]);
  const [copyrightHistory, setCopyrightHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // 版权验证状态
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifySignature, setVerifySignature] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  
  // 侵权举报状态
  const [reportCopyrightId, setReportCopyrightId] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportEvidence, setReportEvidence] = useState(null);
  const [reportEvidencePreview, setReportEvidencePreview] = useState(null);
  const [reportStep, setReportStep] = useState(0);
  const [myReports, setMyReports] = useState([]);
  const [receivedReports, setReceivedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // 合约实例
  const [copyrightContract, setCopyrightContract] = useState(null);
  const contractAddressRef = useRef(process.env.REACT_APP_COPYRIGHT_CONTRACT_ADDRESS || "0x...");

  // 初始化合约
  useEffect(() => {
    if (provider) {
      try {
        const signer = getSigner();
        const contract = new ethers.Contract(contractAddressRef.current, copyrightABI, signer || provider);
        setCopyrightContract(contract);
      } catch (error) {
        console.error("初始化合约失败:", error);
        setErrorMessage("初始化合约失败，请检查网络或刷新页面");
      }
    }
  }, [provider, getSigner]);
  
  // 加载用户相关的版权数据
  useEffect(() => {
    if (isConnected && account && copyrightContract) {
      loadUserCopyrights();
      loadUserReports();
    }
  }, [isConnected, account, copyrightContract, activeTab]);
  
  // 加载用户版权
  const loadUserCopyrights = useCallback(async () => {
    if (!account || !copyrightContract) return;
    setIsLoading(true);
    try {
      const copyrightIds = await copyrightContract.getUserCopyrights(account);
      const copyrights = await Promise.all(
        copyrightIds.map(id => copyrightContract.getCopyrightDetails(id))
      );
      setUserCopyrights(copyrights.map((c, index) => ({ 
        id: copyrightIds[index].toString(),
        contentHash: c[0],
        title: c[1],
        description: c[2],
        contentType: c[3],
        creator: c[4],
        timestamp: c[5].toNumber() * 1000,
        metadataURI: c[6]
      })));
    } catch (error) {
      console.error("加载用户版权失败:", error);
      setErrorMessage("加载用户版权失败");
    } finally {
      setIsLoading(false);
    }
  }, [account, copyrightContract]);
  
  // 加载用户侵权报告
  const loadUserReports = useCallback(async () => {
    if (!account || !copyrightContract) return;
    setIsLoading(true);
    try {
      const myReportIds = await copyrightContract.getUserReports(account);
      const myReportDetails = await Promise.all(
        myReportIds.map(id => copyrightContract.getReportDetails(id))
      );
      setMyReports(myReportDetails.map((r, index) => ({ 
        id: myReportIds[index].toString(),
        copyrightId: r[0].toString(),
        reporter: r[1],
        evidenceURI: r[2],
        description: r[3],
        status: r[4],
        timestamp: r[5].toNumber() * 1000
      })));
      
      const receivedReportIds = await copyrightContract.getReceivedReports(account);
      const receivedReportDetails = await Promise.all(
        receivedReportIds.map(id => copyrightContract.getReportDetails(id))
      );
      setReceivedReports(receivedReportDetails.map((r, index) => ({ 
        id: receivedReportIds[index].toString(),
        copyrightId: r[0].toString(),
        reporter: r[1],
        evidenceURI: r[2],
        description: r[3],
        status: r[4],
        timestamp: r[5].toNumber() * 1000
      })));
    } catch (error) {
      console.error("加载用户报告失败:", error);
      setErrorMessage("加载用户报告失败");
    } finally {
      setIsLoading(false);
    }
  }, [account, copyrightContract]);
  
  // 加载版权历史
  const loadCopyrightHistory = async (copyrightId) => {
    if (!copyrightContract) return;
    
    setIsLoading(true);
    try {
      const [timestamps, actors, actions] = await copyrightContract.getCopyrightHistory(copyrightId);
      
      const history = [];
      for (let i = 0; i < timestamps.length; i++) {
        history.push({
          timestamp: timestamps[i].toNumber() * 1000,
          actor: actors[i],
          action: actions[i]
        });
      }
      
      // 按时间排序（降序）
      history.sort((a, b) => b.timestamp - a.timestamp);
      
      setCopyrightHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("加载版权历史失败:", error);
      setErrorMessage("无法加载版权历史");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理文件选择
  const handleFileChange = (e, isEvidence = false) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // 检查文件大小
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(`文件大小超过限制 (${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB)`);
      return;
    }
    
    // 检查文件类型
    if (!isEvidence && contentType !== 'other') {
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      if (!allowedFileTypes[contentType].includes(fileExtension) && !allowedFileTypes[contentType].includes('*')) {
        setErrorMessage(`不支持的文件类型。请上传以下格式: ${allowedFileTypes[contentType].join(', ')}`);
        return;
      }
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEvidence) {
        setReportEvidence(selectedFile);
        setReportEvidencePreview(reader.result);
      } else {
        setFile(selectedFile);
        setFilePreview(reader.result);
        // 自动计算文件哈希
        calculateFileHash(selectedFile).then(hash => {
          setContentHash(hash);
        }).catch(error => {
          console.error("计算文件哈希失败:", error);
        });
      }
    };
    reader.readAsDataURL(selectedFile);
  };
  
  // 计算文件哈希 (SHA-256)
  const calculateFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = Buffer.from(event.target.result);
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve('0x' + hashHex); // 返回带0x前缀的哈希
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  
  // 上传文件到IPFS
  const uploadToIPFS = async (file, progressCallback) => {
    try {
      // 创建一个可以跟踪进度的上传
      let lastProgress = 0;
      const added = await ipfsClient.add(file, {
        progress: (prog) => {
          const percent = Math.round((prog / file.size) * 100);
          if (percent > lastProgress) {
            lastProgress = percent;
            progressCallback(percent);
          }
        }
      });
      return added.path;
    } catch (error) {
      console.error('IPFS上传错误:', error);
      throw new Error('IPFS上传失败');
    }
  };
  
  // 创建元数据并上传到IPFS
  const createAndUploadMetadata = async (contentHash, contentURI, progressCallback) => {
    let parsedMetadata = {};
    try {
      if (additionalMetadata) {
        parsedMetadata = JSON.parse(additionalMetadata);
      }
    } catch (e) {
      console.warn("附加元数据格式错误，将忽略");
    }
    
    const metadata = {
      title,
      description,
      contentType,
      contentHash,
      contentURI: `ipfs://${contentURI}`,
      creator: account,
      createdAt: new Date().toISOString(),
      chainId: chainId,
      signature: didSignature ? didSignature : null,
      additionalMetadata: parsedMetadata
    };
    
    try {
      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json');
      const added = await ipfsClient.add(metadataFile, { progress: progressCallback });
      return added.path;
    } catch (error) {
      console.error('元数据上传错误:', error);
      throw new Error('元数据上传失败');
    }
  };
  
  // 请求DID签名
  const requestDIDSignature = async () => {
    if (!contentHash) {
      setErrorMessage('请先上传文件以生成内容哈希');
      return null;
    }
    
    setIsLoading(true);
    setProgressMessage('正在请求DID签名...');
    
    try {
      // 构建要签名的消息
      const message = `我确认我是作品"${title}"的创作者，内容哈希: ${contentHash}，时间戳: ${Date.now()}`;
      
      // 请求用户签名
      const signer = getSigner();
      const signature = await signer.signMessage(message);
      
      setProgressMessage('DID签名成功');
      setDidSignature(signature);
      return signature;
    } catch (error) {
      console.error('DID签名错误:', error);
      setErrorMessage(`DID签名失败: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // 注册版权 - 步骤1：基本信息
  const handleStep1 = () => {
    if (!title || !description || !contentType) {
      setErrorMessage('请填写所有必填字段');
      return;
    }
    setCurrentStep(1);
    setErrorMessage('');
  };
  
  // 注册版权 - 步骤2：上传资产
  const handleStep2 = () => {
    if (!file) {
      setErrorMessage('请上传文件');
      return;
    }
    
    // 准备注册摘要
    setRegistrationSummary({
      title,
      description,
      contentType: contentTypes.find(t => t.value === contentType).label,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      contentHash,
      creationTime: new Date().toLocaleString()
    });
    
    setCurrentStep(2);
    setErrorMessage('');
  };
  
  // 注册版权 - 步骤3：确认并提交
  const registerCopyright = async () => {
    if (!isConnected) {
      setErrorMessage('请先连接钱包');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setProgressMessage('');
    setProgressPercent(0);
    setCanMintNFT(false);
    
    try {
      // 1. 上传文件到IPFS
      setProgressMessage('正在上传文件到IPFS...');
      const contentURI = await uploadToIPFS(file, (percent) => {
        setProgressPercent(percent * 0.4); // 文件上传占总进度的40%
        setProgressMessage(`文件上传进度: ${percent}%`);
      });
      setProgressMessage(`文件上传成功: ipfs://${contentURI}`);
      
      // 2. 创建并上传元数据
      setProgressMessage('正在创建并上传元数据到IPFS...');
      const metadataURI = await createAndUploadMetadata(contentHash, contentURI, (prog) => {
        setProgressPercent(40 + (prog / 100) * 20); // 元数据上传占总进度的20%
        setProgressMessage(`元数据上传进度: ${prog}%`);
      });
      setProgressMessage(`元数据上传成功: ipfs://${metadataURI}`);
      
      // 3. 调用智能合约注册版权
      setProgressMessage('正在请求钱包签名并发送交易...');
      setProgressPercent(60);
      const tx = await copyrightContract.registerCopyright(
        contentHash,
        title,
        description,
        contentType,
        `ipfs://${metadataURI}`
      );
      setProgressMessage(`交易已发送，等待确认... TxHash: ${formatAddress(tx.hash)}`);
      setProgressPercent(80);
      
      // 4. 等待交易确认
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'CopyrightRegistered');
      const copyrightId = event?.args?.copyrightId;
      setProgressMessage('');
      setProgressPercent(100);
      
      // 5. 更新UI
      setSuccessMessage(`版权登记成功！版权ID: ${copyrightId?.toString() || 'N/A'}. 您的作品已受到区块链保护`);
      setCanMintNFT(true);
      setSelectedCopyright({
        id: copyrightId.toString(),
        metadataURI: `ipfs://${metadataURI}`,
        contentHash,
        title,
        description,
        contentType
      });
      
      // 6. 生成版权证书数据
      setCertificateData({
        id: copyrightId.toString(),
        title,
        description,
        contentType: contentTypes.find(t => t.value === contentType).label,
        creator: account,
        contentHash,
        registrationDate: new Date().toISOString(),
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        metadataURI: `ipfs://${metadataURI}`,
        chainId: chainId
      });
      
      // 7. 重置表单但保留成功状态
      // 不立即重置，让用户有机会查看结果和铸造NFT
      
      // 8. 刷新用户版权列表
      loadUserCopyrights();
      
    } catch (error) {
      console.error('版权登记错误:', error);
      setErrorMessage(`版权登记失败: ${error.message}`);
      setProgressMessage('');
      setProgressPercent(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 重置注册表单
  const resetRegistrationForm = () => {
    setCurrentStep(0);
    setTitle('');
    setDescription('');
    setContentType('text');
    setFile(null);
    setFilePreview(null);
    setAdditionalMetadata('');
    setContentHash('');
    setDidSignature(null);
    setRegistrationSummary(null);
    setSuccessMessage('');
    setErrorMessage('');
    setProgressMessage('');
    setProgressPercent(0);
    setCanMintNFT(false);
    setSelectedCopyright(null);
    setCertificateData(null);
  };
  
  // 铸造版权NFT
  const mintCopyrightNFT = async () => {
    if (!selectedCopyright || !selectedCopyright.id || !selectedCopyright.metadataURI) {
      setErrorMessage('无法铸造NFT，版权信息不完整');
      return;
    }
    
    setMintingNFT(true);
    setErrorMessage('');
    setSuccessMessage('');
    setProgressMessage('');
    setProgressPercent(0);
    
    try {
      setProgressMessage('正在请求钱包签名并发送NFT铸造交易...');
      setProgressPercent(30);
      const tx = await copyrightContract.mintCopyrightNFT(selectedCopyright.id, selectedCopyright.metadataURI);
      setProgressMessage(`NFT铸造交易已发送，等待确认... TxHash: ${formatAddress(tx.hash)}`);
      setProgressPercent(60);
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'CopyrightNFTMinted');
      const tokenId = event?.args?.tokenId;
      
      setProgressMessage('');
      setProgressPercent(100);
      setSuccessMessage(`版权NFT铸造成功！Token ID: ${tokenId?.toString() || 'N/A'}`);
      setCanMintNFT(false);
      
      // 可选：导航到NFT详情页面
      // navigate(`/nft/${tokenId.toString()}`);
      
    } catch (error) {
      console.error('NFT铸造错误:', error);
      setErrorMessage(`NFT铸造失败: ${error.message}`);
      setProgressMessage('');
      setProgressPercent(0);
    } finally {
      setMintingNFT(false);
    }
  };

  // 搜索版权
  const searchCopyright = async (e) => {
    e.preventDefault();
    
    if (!searchQuery) {
      setErrorMessage('请输入搜索内容');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSearchResults([]);
    setSelectedCopyright(null);
    
    try {
      let results = [];
      if (searchType === 'hash') {
        const [isRegistered, creator, timestamp] = await copyrightContract.verifyCopyright(searchQuery);
        if (isRegistered) {
          // 如果通过哈希找到，需要额外获取ID和详情
          // 这部分逻辑比较复杂，可能需要合约支持或链下索引
          results.push({
            contentHash: searchQuery,
            creator,
            timestamp: timestamp.toNumber() * 1000,
            isRegistered
          });
        }
      } else if (searchType === 'id') {
        const details = await copyrightContract.getCopyrightDetails(searchQuery);
        results.push({ 
          id: searchQuery,
          contentHash: details[0],
          title: details[1],
          description: details[2],
          contentType: details[3],
          creator: details[4],
          timestamp: details[5].toNumber() * 1000,
          metadataURI: details[6]
        });
      } else if (searchType === 'creator') {
        const copyrightIds = await copyrightContract.getUserCopyrights(searchQuery);
        const details = await Promise.all(
          copyrightIds.map(id => copyrightContract.getCopyrightDetails(id))
        );
        results = details.map((c, index) => ({ 
          id: copyrightIds[index].toString(),
          contentHash: c[0],
          title: c[1],
          description: c[2],
          contentType: c[3],
          creator: c[4],
          timestamp: c[5].toNumber() * 1000,
          metadataURI: c[6]
        }));
      }
      setSearchResults(results);
    } catch (error) {
      console.error('搜索错误:', error);
      setErrorMessage(`搜索失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 验证版权
  const verifyCopyright = async (e) => {
    e.preventDefault();
    
    if (!verifyFile) {
      setErrorMessage('请上传要验证的文件');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setVerifyResult(null);
    setProgressMessage('');
    setProgressPercent(0);
    
    try {
      // 1. 计算文件哈希
      setProgressMessage('正在计算文件哈希...');
      setProgressPercent(20);
      const contentHash = await calculateFileHash(verifyFile);
      setProgressMessage(`文件哈希计算完成: ${formatAddress(contentHash)}`);
      setProgressPercent(40);
      
      // 2. 调用智能合约验证版权
      setProgressMessage('正在查询区块链验证版权...');
      setProgressPercent(60);
      
      let isRegistered, creator, timestamp;
      
      // 如果提供了签名，使用签名验证
      if (verifySignature) {
        [isRegistered, creator, timestamp] = await copyrightContract.verifyCopyrightWithSignature(
          contentHash, 
          verifySignature
        );
      } else {
        [isRegistered, creator, timestamp] = await copyrightContract.verifyCopyright(contentHash);
      }
      
      setProgressMessage('');
      setProgressPercent(100);
      
      if (isRegistered) {
        // 尝试获取更详细的信息
        let copyrightDetails = null;
        try {
          // 这里需要一个额外的合约方法来通过哈希获取ID
          // 假设我们有一个方法或者通过事件日志查询
          const copyrightId = '1'; // 这里应该是实际查询的结果
          const details = await copyrightContract.getCopyrightDetails(copyrightId);
          copyrightDetails = {
            id: copyrightId,
            title: details[1],
            description: details[2],
            contentType: details[3],
            metadataURI: details[6]
          };
        } catch (detailsError) {
          console.warn('获取详细信息失败，仅显示基本验证结果', detailsError);
        }
        
        setVerifyResult({
          isRegistered: true,
          message: `文件已在区块链上登记版权！`,
          details: {
            creator: creator,
            timestamp: timestamp.toNumber() * 1000,
            contentHash: contentHash,
            ...copyrightDetails
          }
        });
        
        // 生成验证证书数据
        if (copyrightDetails) {
          setCertificateData({
            id: copyrightDetails.id,
            title: copyrightDetails.title,
            description: copyrightDetails.description,
            contentType: copyrightDetails.contentType,
            creator: creator,
            contentHash: contentHash,
            verificationDate: new Date().toISOString(),
            registrationDate: new Date(timestamp.toNumber() * 1000).toISOString(),
            metadataURI: copyrightDetails.metadataURI,
            chainId: chainId
          });
        }
      } else {
        setVerifyResult({
          isRegistered: false,
          message: '未在区块链上找到该文件的版权登记记录。'
        });
      }
    } catch (error) {
      console.error('验证错误:', error);
      setErrorMessage(`验证失败: ${error.message}`);
      setProgressMessage('');
      setProgressPercent(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 生成版权证书
  const generateCertificate = () => {
    if (!certificateData) return;
    
    setShowCertificateModal(true);
  };
  
  // 下载版权证书
  const downloadCertificate = () => {
    if (!certificateData) return;
    
    // 创建证书HTML
    const certificateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>版权证书 - ${certificateData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .certificate { max-width: 800px; margin: 20px auto; padding: 30px; border: 2px solid #1890ff; position: relative; }
          .certificate:before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="30" y="40" font-family="Arial" font-size="12" transform="rotate(45 50,50)" opacity="0.1">CultureBridge</text></svg>'); }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #1890ff; margin: 10px 0; }
          .subtitle { font-size: 18px; color: #333; }
          .content { margin: 20px 0; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          .value { display: inline-block; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          .qr-code { text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="title">区块链版权证书</div>
            <div class="subtitle">${certificateData.title}</div>
          </div>
          
          <div class="content">
            <div class="field"><span class="label">版权ID:</span> <span class="value">${certificateData.id}</span></div>
            <div class="field"><span class="label">作品标题:</span> <span class="value">${certificateData.title}</span></div>
            <div class="field"><span class="label">作品描述:</span> <span class="value">${certificateData.description}</span></div>
            <div class="field"><span class="label">作品类型:</span> <span class="value">${certificateData.contentType}</span></div>
            <div class="field"><span class="label">创作者地址:</span> <span class="value">${certificateData.creator}</span></div>
            <div class="field"><span class="label">内容哈希:</span> <span class="value">${certificateData.contentHash}</span></div>
            <div class="field"><span class="label">登记日期:</span> <span class="value">${new Date(certificateData.registrationDate).toLocaleString()}</span></div>
            ${certificateData.txHash ? `<div class="field"><span class="label">交易哈希:</span> <span class="value">${certificateData.txHash}</span></div>` : ''}
            ${certificateData.blockNumber ? `<div class="field"><span class="label">区块高度:</span> <span class="value">${certificateData.blockNumber}</span></div>` : ''}
            <div class="field"><span class="label">元数据URI:</span> <span class="value">${certificateData.metadataURI}</span></div>
            <div class="field"><span class="label">区块链网络:</span> <span class="value">ID: ${certificateData.chainId}</span></div>
          </div>
          
          <div class="qr-code">
            <!-- 这里可以添加二维码图片，包含证书验证链接 -->
            [证书验证二维码]
          </div>
          
          <div class="footer">
            <p>本证书由CultureBridge平台基于区块链技术生成，证明上述作品已在区块链上注册版权。</p>
            <p>证书生成时间: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // 创建Blob并下载
    const blob = new Blob([certificateHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `版权证书-${certificateData.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 侵权举报 - 步骤1：选择版权
  const handleReportStep1 = () => {
    if (!reportCopyrightId) {
      setErrorMessage('请输入版权ID');
      return;
    }
    setReportStep(1);
    setErrorMessage('');
  };
  
  // 侵权举报 - 步骤2：填写详情
  const handleReportStep2 = () => {
    if (!reportDescription) {
      setErrorMessage('请填写侵权描述');
      return;
    }
    setReportStep(2);
    setErrorMessage('');
  };
  
  // 提交侵权举报
  const submitInfringementReport = async () => {
    if (!isConnected) {
      setErrorMessage('请先连接钱包');
      return;
    }
    
    if (!reportCopyrightId || !reportDescription || !reportEvidence) {
      setErrorMessage('请填写所有必填字段并上传证据');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setProgressMessage('');
    setProgressPercent(0);
    
    try {
      // 1. 上传证据到IPFS
      setProgressMessage('正在上传证据到IPFS...');
      const evidenceURI = await uploadToIPFS(reportEvidence, (percent) => {
        setProgressPercent(percent * 0.6); // 文件上传占总进度的60%
        setProgressMessage(`证据上传进度: ${percent}%`);
      });
      setProgressMessage(`证据上传成功: ipfs://${evidenceURI}`);
      setProgressPercent(60);
      
      // 2. 调用智能合约提交举报
      setProgressMessage('正在请求钱包签名并发送交易...');
      const tx = await copyrightContract.reportInfringement(
        reportCopyrightId,
        `ipfs://${evidenceURI}`,
        reportDescription
      );
      setProgressMessage(`交易已发送，等待确认... TxHash: ${formatAddress(tx.hash)}`);
      setProgressPercent(80);
      
      // 3. 等待交易确认
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'InfringementReported');
      const reportId = event?.args?.reportId;
      setProgressMessage('');
      setProgressPercent(100);
      
      // 4. 更新UI
      setSuccessMessage(`侵权举报提交成功！举报ID: ${reportId?.toString() || 'N/A'}`);
      
      // 5. 重置表单
      setReportCopyrightId('');
      setReportDescription('');
      setReportEvidence(null);
      setReportEvidencePreview(null);
      setReportStep(0);
      
      // 6. 刷新用户举报列表
      loadUserReports();
      
    } catch (error) {
      console.error('举报提交错误:', error);
      setErrorMessage(`举报提交失败: ${error.message}`);
      setProgressMessage('');
      setProgressPercent(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 查看举报详情
  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };
  
  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // 获取文件类型图标
  const getFileTypeIcon = (type) => {
    const typeObj = contentTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : '📄';
  };
  
  // 渲染版权登记表单
  const renderRegistrationForm = () => {
    return (
      <div className="registration-form-container">
        <Steps current={currentStep} className="registration-steps">
          <Step title="基本信息" description="填写作品信息" icon={<FileAddOutlined />} />
          <Step title="上传资产" description="上传作品文件" icon={<FileSearchOutlined />} />
          <Step title="确认提交" description="确认并登记" icon={<CheckCircleOutlined />} />
        </Steps>
        
        {/* 步骤1：基本信息 */}
        {currentStep === 0 && (
          <div className="step-content">
            <h3>作品基本信息</h3>
            <div className="form-group">
              <label>作品标题 <span className="required">*</span></label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="输入作品标题"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>作品描述 <span className="required">*</span></label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="详细描述您的作品，包括创作背景、特点等"
                className="form-control"
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label>作品类型 <span className="required">*</span></label>
              <div className="content-type-options">
                {contentTypes.map((type) => (
                  <div 
                    key={type.value}
                    className={`content-type-option ${contentType === type.value ? 'selected' : ''}`}
                    onClick={() => setContentType(type.value)}
                  >
                    <div className="type-icon">{type.icon}</div>
                    <div className="type-label">{type.label}</div>
                  </div>
                ))}
              </div>
              <div className="type-description">
                {contentTypes.find(t => t.value === contentType)?.description}
              </div>
            </div>
            
            <div className="form-group">
              <label>附加元数据 (可选，JSON格式)</label>
              <textarea 
                value={additionalMetadata} 
                onChange={(e) => setAdditionalMetadata(e.target.value)} 
                placeholder='{"tags": ["文化", "艺术"], "language": "zh-CN", "region": "中国"}'
                className="form-control"
                rows={3}
              />
              <div className="form-hint">可添加自定义元数据，如标签、语言、地区等，必须使用有效的JSON格式</div>
            </div>
            
            <div className="step-actions">
              <Button type="primary" onClick={handleStep1}>下一步</Button>
            </div>
          </div>
        )}
        
        {/* 步骤2：上传资产 */}
        {currentStep === 1 && (
          <div className="step-content">
            <h3>上传作品文件</h3>
            
            <div className="form-group">
              <label>选择文件 <span className="required">*</span></label>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  onChange={(e) => handleFileChange(e)} 
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-button">
                  选择文件
                </label>
                {file && (
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({formatFileSize(file.size)})</span>
                  </div>
                )}
              </div>
              <div className="form-hint">
                支持的文件类型: {allowedFileTypes[contentType].join(', ')}
                <br />
                最大文件大小: {(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB
              </div>
            </div>
            
            {file && (
              <div className="form-group">
                <label>文件预览</label>
                <div className="file-preview-container">
                  {contentType === 'image' ? (
                    <img src={filePreview} alt="预览" className="image-preview" />
                  ) : (
                    <div className="generic-preview">
                      <div className="preview-icon">{getFileTypeIcon(contentType)}</div>
                      <div className="preview-name">{file.name}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {file && (
              <div className="form-group">
                <label>内容哈希 (SHA-256)</label>
                <div className="content-hash">
                  {contentHash || '计算中...'}
                </div>
                <div className="form-hint">
                  此哈希值唯一标识您的作品内容，用于版权验证
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label>DID身份签名 (可选)</label>
              <div className="did-signature-container">
                {didSignature ? (
                  <div className="signature-info">
                    <div className="signature-status success">
                      <CheckCircleOutlined /> 已签名
                    </div>
                    <div className="signature-value">
                      {formatAddress(didSignature)}
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={requestDIDSignature} 
                    disabled={!contentHash}
                    className="signature-button"
                  >
                    请求DID签名
                  </Button>
                )}
              </div>
              <div className="form-hint">
                添加DID签名可增强版权保护，证明您是作品的创作者
              </div>
            </div>
            
            <div className="step-actions">
              <Button onClick={() => setCurrentStep(0)}>上一步</Button>
              <Button type="primary" onClick={handleStep2} disabled={!file}>下一步</Button>
            </div>
          </div>
        )}
        
        {/* 步骤3：确认提交 */}
        {currentStep === 2 && (
          <div className="step-content">
            <h3>确认版权登记信息</h3>
            
            {registrationSummary && (
              <div className="registration-summary">
                <div className="summary-item">
                  <div className="summary-label">作品标题:</div>
                  <div className="summary-value">{registrationSummary.title}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">作品描述:</div>
                  <div className="summary-value description">{registrationSummary.description}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">作品类型:</div>
                  <div className="summary-value">{registrationSummary.contentType}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">文件名:</div>
                  <div className="summary-value">{registrationSummary.fileName}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">文件大小:</div>
                  <div className="summary-value">{registrationSummary.fileSize}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">内容哈希:</div>
                  <div className="summary-value hash">{registrationSummary.contentHash}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">创建时间:</div>
                  <div className="summary-value">{registrationSummary.creationTime}</div>
                </div>
                {didSignature && (
                  <div className="summary-item">
                    <div className="summary-label">DID签名:</div>
                    <div className="summary-value">已添加</div>
                  </div>
                )}
              </div>
            )}
            
            <div className="registration-notice">
              <Alert
                message="版权登记声明"
                description={
                  <div>
                    <p>点击"确认登记"按钮，即表示您确认：</p>
                    <ol>
                      <li>您是该作品的合法创作者或版权所有者</li>
                      <li>该作品不侵犯他人的知识产权</li>
                      <li>您同意将作品信息永久记录在区块链上</li>
                      <li>您了解区块链上的信息不可篡改或删除</li>
                    </ol>
                  </div>
                }
                type="info"
                showIcon
              />
            </div>
            
            <div className="step-actions">
              <Button onClick={() => setCurrentStep(1)}>上一步</Button>
              <Button 
                type="primary" 
                onClick={registerCopyright}
                disabled={isLoading}
              >
                确认登记
              </Button>
            </div>
          </div>
        )}
        
        {/* 成功信息 */}
        {successMessage && (
          <div className="success-container">
            <Alert
              message="版权登记成功"
              description={successMessage}
              type="success"
              showIcon
            />
            
            <div className="success-actions">
              <Button 
                type="primary" 
                onClick={generateCertificate}
                className="certificate-button"
              >
                查看版权证书
              </Button>
              
              {canMintNFT && (
                <Button 
                  onClick={mintCopyrightNFT} 
                  disabled={mintingNFT}
                  className="mint-button"
                >
                  铸造NFT
                </Button>
              )}
              
              <Button 
                onClick={resetRegistrationForm}
                className="reset-button"
              >
                注册新作品
              </Button>
            </div>
          </div>
        )}
        
        {/* 加载和进度 */}
        {isLoading && (
          <div className="loading-container">
            <Spin tip={progressMessage || "处理中..."} />
            {progressPercent > 0 && (
              <Progress percent={progressPercent} status="active" />
            )}
          </div>
        )}
        
        {/* 错误信息 */}
        {errorMessage && (
          <div className="error-container">
            <Alert
              message="错误"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
            />
          </div>
        )}
      </div>
    );
  };
  
  // 渲染版权验证表单
  const renderVerificationForm = () => {
    return (
      <div className="verification-form-container">
        <h3>版权验证</h3>
        
        <div className="form-group">
          <label>上传文件进行验证 <span className="required">*</span></label>
          <div className="file-upload-container">
            <input 
              type="file" 
              onChange={(e) => setVerifyFile(e.target.files[0])} 
              className="file-input"
              id="verify-file-upload"
            />
            <label htmlFor="verify-file-upload" className="file-upload-button">
              选择文件
            </label>
            {verifyFile && (
              <div className="file-info">
                <span className="file-name">{verifyFile.name}</span>
                <span className="file-size">({formatFileSize(verifyFile.size)})</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>DID签名 (可选)</label>
          <input 
            type="text" 
            value={verifySignature} 
            onChange={(e) => setVerifySignature(e.target.value)} 
            placeholder="输入DID签名以增强验证"
            className="form-control"
          />
          <div className="form-hint">
            如果有创作者的DID签名，可以提供更可靠的验证结果
          </div>
        </div>
        
        <div className="form-actions">
          <Button 
            type="primary" 
            onClick={verifyCopyright}
            disabled={!verifyFile || isLoading}
          >
            验证版权
          </Button>
        </div>
        
        {/* 验证结果 */}
        {verifyResult && (
          <div className={`verification-result ${verifyResult.isRegistered ? 'success' : 'failure'}`}>
            <div className="result-icon">
              {verifyResult.isRegistered ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            </div>
            <div className="result-message">{verifyResult.message}</div>
            
            {verifyResult.isRegistered && verifyResult.details && (
              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-label">创作者:</span>
                  <span className="detail-value">{formatAddress(verifyResult.details.creator)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">登记时间:</span>
                  <span className="detail-value">{formatTimestamp(verifyResult.details.timestamp)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">内容哈希:</span>
                  <span className="detail-value">{formatAddress(verifyResult.details.contentHash)}</span>
                </div>
                
                {verifyResult.details.title && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">作品标题:</span>
                      <span className="detail-value">{verifyResult.details.title}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">作品描述:</span>
                      <span className="detail-value">{verifyResult.details.description}</span>
                    </div>
                  </>
                )}
                
                <div className="detail-actions">
                  <Button 
                    type="primary" 
                    onClick={generateCertificate}
                    disabled={!certificateData}
                  >
                    生成验证证书
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 加载和进度 */}
        {isLoading && (
          <div className="loading-container">
            <Spin tip={progressMessage || "验证中..."} />
            {progressPercent > 0 && (
              <Progress percent={progressPercent} status="active" />
            )}
          </div>
        )}
      </div>
    );
  };
  
  // 渲染侵权举报表单
  const renderReportForm = () => {
    return (
      <div className="report-form-container">
        <Steps current={reportStep} className="report-steps">
          <Step title="选择版权" description="输入版权ID" />
          <Step title="填写详情" description="描述侵权情况" />
          <Step title="提交证据" description="上传侵权证据" />
        </Steps>
        
        {/* 步骤1：选择版权 */}
        {reportStep === 0 && (
          <div className="step-content">
            <h3>选择被侵权的版权</h3>
            
            <div className="form-group">
              <label>版权ID <span className="required">*</span></label>
              <input 
                type="text" 
                value={reportCopyrightId} 
                onChange={(e) => setReportCopyrightId(e.target.value)} 
                placeholder="输入被侵权作品的版权ID"
                className="form-control"
              />
              <div className="form-hint">
                请输入在区块链上已登记的版权ID，您可以在"我的版权"或通过搜索找到
              </div>
            </div>
            
            <div className="step-actions">
              <Button type="primary" onClick={handleReportStep1}>下一步</Button>
            </div>
          </div>
        )}
        
        {/* 步骤2：填写详情 */}
        {reportStep === 1 && (
          <div className="step-content">
            <h3>填写侵权详情</h3>
            
            <div className="form-group">
              <label>侵权描述 <span className="required">*</span></label>
              <textarea 
                value={reportDescription} 
                onChange={(e) => setReportDescription(e.target.value)} 
                placeholder="详细描述侵权情况，包括侵权方式、发现时间、侵权链接等"
                className="form-control"
                rows={5}
              />
            </div>
            
            <div className="step-actions">
              <Button onClick={() => setReportStep(0)}>上一步</Button>
              <Button type="primary" onClick={handleReportStep2}>下一步</Button>
            </div>
          </div>
        )}
        
        {/* 步骤3：提交证据 */}
        {reportStep === 2 && (
          <div className="step-content">
            <h3>上传侵权证据</h3>
            
            <div className="form-group">
              <label>证据文件 <span className="required">*</span></label>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  onChange={(e) => handleFileChange(e, true)} 
                  className="file-input"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="file-upload-button">
                  选择证据文件
                </label>
                {reportEvidence && (
                  <div className="file-info">
                    <span className="file-name">{reportEvidence.name}</span>
                    <span className="file-size">({formatFileSize(reportEvidence.size)})</span>
                  </div>
                )}
              </div>
              <div className="form-hint">
                请上传能证明侵权行为的证据，如截图、链接、对比图等
              </div>
            </div>
            
            {reportEvidencePreview && reportEvidence.type.startsWith('image/') && (
              <div className="form-group">
                <label>证据预览</label>
                <div className="evidence-preview">
                  <img src={reportEvidencePreview} alt="证据预览" />
                </div>
              </div>
            )}
            
            <div className="report-notice">
              <Alert
                message="侵权举报声明"
                description={
                  <div>
                    <p>提交侵权举报前，请确认：</p>
                    <ol>
                      <li>您提供的信息真实准确</li>
                      <li>您有足够证据证明侵权行为的存在</li>
                      <li>您了解恶意举报可能导致声誉损失和法律责任</li>
                    </ol>
                  </div>
                }
                type="warning"
                showIcon
              />
            </div>
            
            <div className="step-actions">
              <Button onClick={() => setReportStep(1)}>上一步</Button>
              <Button 
                type="primary" 
                onClick={submitInfringementReport}
                disabled={!reportEvidence || isLoading}
                danger
              >
                提交举报
              </Button>
            </div>
          </div>
        )}
        
        {/* 成功信息 */}
        {successMessage && (
          <div className="success-container">
            <Alert
              message="举报提交成功"
              description={successMessage}
              type="success"
              showIcon
            />
          </div>
        )}
        
        {/* 加载和进度 */}
        {isLoading && (
          <div className="loading-container">
            <Spin tip={progressMessage || "处理中..."} />
            {progressPercent > 0 && (
              <Progress percent={progressPercent} status="active" />
            )}
          </div>
        )}
        
        {/* 错误信息 */}
        {errorMessage && (
          <div className="error-container">
            <Alert
              message="错误"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
            />
          </div>
        )}
      </div>
    );
  };
  
  // 渲染我的版权列表
  const renderMyCopyrights = () => {
    return (
      <div className="my-copyrights-container">
        <h3>我的版权作品</h3>
        
        {!isConnected ? (
          <div className="connect-wallet-prompt">
            <p>请连接钱包以查看您的版权作品</p>
            <Button type="primary" onClick={connectWallet}>连接钱包</Button>
          </div>
        ) : isLoading ? (
          <div className="loading-container">
            <Spin tip="加载中..." />
          </div>
        ) : userCopyrights.length === 0 ? (
          <div className="no-data-message">
            <p>您还没有登记任何版权作品</p>
            <Button type="primary" onClick={() => setActiveTab('register')}>登记新作品</Button>
          </div>
        ) : (
          <div className="copyrights-list">
            {userCopyrights.map((copyright) => (
              <div key={copyright.id} className="copyright-item">
                <div className="copyright-header">
                  <div className="copyright-title">
                    <span className="title-text">{copyright.title}</span>
                    <span className="copyright-id">ID: {copyright.id}</span>
                  </div>
                  <div className="copyright-type">
                    {getFileTypeIcon(copyright.contentType)} {contentTypes.find(t => t.value === copyright.contentType)?.label || copyright.contentType}
                  </div>
                </div>
                
                <div className="copyright-content">
                  <div className="copyright-description">{copyright.description}</div>
                  
                  <div className="copyright-details">
                    <div className="detail-item">
                      <span className="detail-label">登记时间:</span>
                      <span className="detail-value">{formatTimestamp(copyright.timestamp)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">内容哈希:</span>
                      <span className="detail-value hash">{formatAddress(copyright.contentHash)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">元数据:</span>
                      <span className="detail-value">
                        <a href={copyright.metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/')} target="_blank" rel="noopener noreferrer">
                          查看元数据
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="copyright-actions">
                  <Button 
                    onClick={() => loadCopyrightHistory(copyright.id)}
                    className="history-button"
                  >
                    <HistoryOutlined /> 历史记录
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setSelectedCopyright(copyright);
                      setCertificateData({
                        id: copyright.id,
                        title: copyright.title,
                        description: copyright.description,
                        contentType: contentTypes.find(t => t.value === copyright.contentType)?.label || copyright.contentType,
                        creator: copyright.creator,
                        contentHash: copyright.contentHash,
                        registrationDate: new Date(copyright.timestamp).toISOString(),
                        metadataURI: copyright.metadataURI,
                        chainId: chainId
                      });
                      generateCertificate();
                    }}
                    className="certificate-button"
                  >
                    <FileSearchOutlined /> 查看证书
                  </Button>
                  
                  <Button 
                    type="primary"
                    onClick={() => {
                      setSelectedCopyright(copyright);
                      setCanMintNFT(true);
                      setActiveTab('register');
                      setCurrentStep(2);
                      setSuccessMessage(`版权ID: ${copyright.id} 已选择，可以铸造为NFT`);
                    }}
                    className="mint-button"
                  >
                    <BlockOutlined /> 铸造NFT
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // 渲染我的举报列表
  const renderMyReports = () => {
    return (
      <div className="my-reports-container">
        <Tabs defaultActiveKey="submitted">
          <TabPane 
            tab={
              <span>
                <Badge count={myReports.length}>我提交的举报</Badge>
              </span>
            } 
            key="submitted"
          >
            {!isConnected ? (
              <div className="connect-wallet-prompt">
                <p>请连接钱包以查看您提交的举报</p>
                <Button type="primary" onClick={connectWallet}>连接钱包</Button>
              </div>
            ) : isLoading ? (
              <div className="loading-container">
                <Spin tip="加载中..." />
              </div>
            ) : myReports.length === 0 ? (
              <div className="no-data-message">
                <p>您还没有提交任何侵权举报</p>
                <Button type="primary" onClick={() => setActiveTab('report')}>提交举报</Button>
              </div>
            ) : (
              <div className="reports-list">
                {myReports.map((report) => (
                  <div key={report.id} className="report-item">
                    <div className="report-header">
                      <div className="report-id">举报ID: {report.id}</div>
                      <div className={`report-status status-${report.status}`}>
                        {reportStatuses[report.status]}
                      </div>
                    </div>
                    
                    <div className="report-content">
                      <div className="report-description">{report.description}</div>
                      
                      <div className="report-details">
                        <div className="detail-item">
                          <span className="detail-label">版权ID:</span>
                          <span className="detail-value">{report.copyrightId}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">提交时间:</span>
                          <span className="detail-value">{formatTimestamp(report.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="report-actions">
                      <Button 
                        onClick={() => viewReportDetails(report)}
                        className="view-button"
                      >
                        查看详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <Badge count={receivedReports.length}>我收到的举报</Badge>
              </span>
            } 
            key="received"
          >
            {!isConnected ? (
              <div className="connect-wallet-prompt">
                <p>请连接钱包以查看您收到的举报</p>
                <Button type="primary" onClick={connectWallet}>连接钱包</Button>
              </div>
            ) : isLoading ? (
              <div className="loading-container">
                <Spin tip="加载中..." />
              </div>
            ) : receivedReports.length === 0 ? (
              <div className="no-data-message">
                <p>您没有收到任何侵权举报</p>
              </div>
            ) : (
              <div className="reports-list">
                {receivedReports.map((report) => (
                  <div key={report.id} className="report-item received">
                    <div className="report-header">
                      <div className="report-id">举报ID: {report.id}</div>
                      <div className={`report-status status-${report.status}`}>
                        {reportStatuses[report.status]}
                      </div>
                    </div>
                    
                    <div className="report-content">
                      <div className="report-description">{report.description}</div>
                      
                      <div className="report-details">
                        <div className="detail-item">
                          <span className="detail-label">版权ID:</span>
                          <span className="detail-value">{report.copyrightId}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">举报者:</span>
                          <span className="detail-value">{formatAddress(report.reporter)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">提交时间:</span>
                          <span className="detail-value">{formatTimestamp(report.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="report-actions">
                      <Button 
                        onClick={() => viewReportDetails(report)}
                        className="view-button"
                      >
                        查看详情
                      </Button>
                      
                      <Button 
                        type="primary" 
                        danger
                        className="respond-button"
                        disabled={report.status !== 0} // 只有待处理状态可以回应
                      >
                        回应举报
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  };
  
  // 渲染版权证书模态框
  const renderCertificateModal = () => {
    if (!showCertificateModal || !certificateData) return null;
    
    return (
      <Modal
        title="版权证书"
        visible={showCertificateModal}
        onCancel={() => setShowCertificateModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowCertificateModal(false)}>
            关闭
          </Button>,
          <Button key="download" type="primary" onClick={downloadCertificate}>
            下载证书
          </Button>
        ]}
        width={800}
        className="certificate-modal"
      >
        <div className="certificate-container">
          <div className="certificate-header">
            <div className="certificate-title">区块链版权证书</div>
            <div className="certificate-subtitle">{certificateData.title}</div>
          </div>
          
          <div className="certificate-content">
            <div className="certificate-field">
              <span className="field-label">版权ID:</span>
              <span className="field-value">{certificateData.id}</span>
            </div>
            <div className="certificate-field">
              <span className="field-label">作品标题:</span>
              <span className="field-value">{certificateData.title}</span>
            </div>
            <div className="certificate-field">
              <span className="field-label">作品描述:</span>
              <span className="field-value">{certificateData.description}</span>
            </div>
            <div className="certificate-field">
              <span className="field-label">作品类型:</span>
              <span className="field-value">{certificateData.contentType}</span>
            </div>
            <div className="certificate-field">
              <span className="field-label">创作者地址:</span>
              <span className="field-value">{certificateData.creator}</span>
            </div>
            <div className="certificate-field">
              <span className="field-label">内容哈希:</span>
              <span className="field-value">{certificateData.contentHash}</span>
            </div>
            <div className="certificate-field">
              <span className="field-label">登记日期:</span>
              <span className="field-value">{new Date(certificateData.registrationDate).toLocaleString()}</span>
            </div>
            {certificateData.txHash && (
              <div className="certificate-field">
                <span className="field-label">交易哈希:</span>
                <span className="field-value">{certificateData.txHash}</span>
              </div>
            )}
            {certificateData.blockNumber && (
              <div className="certificate-field">
                <span className="field-label">区块高度:</span>
                <span className="field-value">{certificateData.blockNumber}</span>
              </div>
            )}
            <div className="certificate-field">
              <span className="field-label">元数据URI:</span>
              <span className="field-value">{certificateData.metadataURI}</span>
            </div>
            <div className="certificate-field">
              <span className="field-label">区块链网络:</span>
              <span className="field-value">ID: {certificateData.chainId}</span>
            </div>
          </div>
          
          <div className="certificate-footer">
            <p>本证书由CultureBridge平台基于区块链技术生成，证明上述作品已在区块链上注册版权。</p>
            <p>证书生成时间: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </Modal>
    );
  };
  
  // 渲染版权历史模态框
  const renderHistoryModal = () => {
    if (!showHistoryModal) return null;
    
    return (
      <Modal
        title="版权历史记录"
        visible={showHistoryModal}
        onCancel={() => setShowHistoryModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowHistoryModal(false)}>
            关闭
          </Button>
        ]}
        width={700}
        className="history-modal"
      >
        {isLoading ? (
          <div className="loading-container">
            <Spin tip="加载中..." />
          </div>
        ) : copyrightHistory.length === 0 ? (
          <div className="no-data-message">
            <p>没有找到历史记录</p>
          </div>
        ) : (
          <div className="history-timeline">
            {copyrightHistory.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-time">{formatTimestamp(event.timestamp)}</div>
                <div className="timeline-content">
                  <div className="timeline-action">{event.action}</div>
                  <div className="timeline-actor">操作者: {formatAddress(event.actor)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    );
  };
  
  // 渲染举报详情模态框
  const renderReportModal = () => {
    if (!showReportModal || !selectedReport) return null;
    
    return (
      <Modal
        title="举报详情"
        visible={showReportModal}
        onCancel={() => setShowReportModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowReportModal(false)}>
            关闭
          </Button>
        ]}
        width={700}
        className="report-modal"
      >
        <div className="report-detail-container">
          <div className="report-detail-header">
            <div className="report-id">举报ID: {selectedReport.id}</div>
            <div className={`report-status status-${selectedReport.status}`}>
              {reportStatuses[selectedReport.status]}
            </div>
          </div>
          
          <div className="report-detail-content">
            <div className="detail-section">
              <h4>基本信息</h4>
              <div className="detail-item">
                <span className="detail-label">版权ID:</span>
                <span className="detail-value">{selectedReport.copyrightId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">举报者:</span>
                <span className="detail-value">{formatAddress(selectedReport.reporter)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">提交时间:</span>
                <span className="detail-value">{formatTimestamp(selectedReport.timestamp)}</span>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>举报描述</h4>
              <div className="report-description">{selectedReport.description}</div>
            </div>
            
            <div className="detail-section">
              <h4>证据材料</h4>
              <div className="evidence-link">
                <a 
                  href={selectedReport.evidenceURI.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  查看证据材料
                </a>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };
  
  // 主渲染函数
  return (
    <div className="copyright-protection-container">
      <div className="copyright-header">
        <h2><CopyrightOutlined /> 文化知识产权保护系统</h2>
        <p className="system-description">
          基于区块链技术的文化作品版权保护系统，为创作者提供作品登记、版权验证和侵权举报服务
        </p>
      </div>
      
      {!isConnected && (
        <div className="connect-wallet-banner">
          <div className="banner-content">
            <div className="banner-text">
              <h3>连接钱包以使用完整功能</h3>
              <p>登记版权、验证作品和举报侵权需要连接区块链钱包</p>
            </div>
            <Button type="primary" size="large" onClick={connectWallet}>
              连接钱包
            </Button>
          </div>
        </div>
      )}
      
      <div className="copyright-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={<span><FileAddOutlined /> 版权登记</span>} 
            key="register"
          >
            {renderRegistrationForm()}
          </TabPane>
          
          <TabPane 
            tab={<span><FileSearchOutlined /> 版权验证</span>} 
            key="verify"
          >
            {renderVerificationForm()}
          </TabPane>
          
          <TabPane 
            tab={<span><WarningOutlined /> 侵权举报</span>} 
            key="report"
          >
            {renderReportForm()}
          </TabPane>
          
          <TabPane 
            tab={<span><UserOutlined /> 我的版权</span>} 
            key="my-copyrights"
          >
            {renderMyCopyrights()}
          </TabPane>
          
          <TabPane 
            tab={<span><LinkOutlined /> 我的举报</span>} 
            key="my-reports"
          >
            {renderMyReports()}
          </TabPane>
        </Tabs>
      </div>
      
      {/* 模态框 */}
      {renderCertificateModal()}
      {renderHistoryModal()}
      {renderReportModal()}
    </div>
  );
};

export default CopyrightProtection;
