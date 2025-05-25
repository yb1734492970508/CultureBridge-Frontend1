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

import React, { useState, useEffect, useCallback } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import './CopyrightProtection.css';

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

// 版权保护智能合约ABI（示例）
const copyrightABI = [
  "function registerCopyright(string memory contentHash, string memory title, string memory description, string memory contentType, string memory metadataURI) external returns (uint256)",
  "function verifyCopyright(string memory contentHash) external view returns (bool, address, uint256)",
  "function getCopyrightDetails(uint256 copyrightId) external view returns (string memory, string memory, string memory, string memory, address, uint256, string memory)",
  "function reportInfringement(uint256 copyrightId, string memory evidence, string memory description) external returns (uint256)",
  "function getInfringementReports(uint256 copyrightId) external view returns (uint256[] memory)",
  "function getReportDetails(uint256 reportId) external view returns (uint256, address, string memory, string memory, uint8, uint256)",
  "event CopyrightRegistered(uint256 indexed copyrightId, address indexed creator, string contentHash, uint256 timestamp)",
  "event InfringementReported(uint256 indexed reportId, uint256 indexed copyrightId, address reporter, uint256 timestamp)"
];

// 版权类型选项
const contentTypes = [
  { value: 'text', label: '文本作品' },
  { value: 'image', label: '图像作品' },
  { value: 'audio', label: '音频作品' },
  { value: 'video', label: '视频作品' },
  { value: 'software', label: '软件作品' },
  { value: 'other', label: '其他作品' }
];

// 侵权报告状态
const reportStatuses = [
  '待处理',
  '审核中',
  '已确认',
  '已驳回',
  '已解决'
];

/**
 * 文化知识产权保护系统组件
 */
const CopyrightProtection = () => {
  // 区块链上下文
  const { account, provider, isConnected, connectWallet } = useBlockchain();
  
  // 组件状态
  const [activeTab, setActiveTab] = useState('register');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 版权登记状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('text');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [additionalMetadata, setAdditionalMetadata] = useState('');
  
  // 版权查询状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('hash'); // 'hash', 'id', 'creator'
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCopyright, setSelectedCopyright] = useState(null);
  
  // 版权验证状态
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  
  // 侵权举报状态
  const [reportCopyrightId, setReportCopyrightId] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportEvidence, setReportEvidence] = useState(null);
  const [reportEvidencePreview, setReportEvidencePreview] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [receivedReports, setReceivedReports] = useState([]);
  
  // 合约实例
  const [copyrightContract, setCopyrightContract] = useState(null);
  
  // 初始化合约
  useEffect(() => {
    if (isConnected && provider) {
      try {
        // 这里应该使用实际部署的合约地址
        const contractAddress = "0x..."; // 替换为实际合约地址
        const contract = new ethers.Contract(contractAddress, copyrightABI, provider.getSigner());
        setCopyrightContract(contract);
      } catch (error) {
        console.error("初始化合约失败:", error);
        setErrorMessage("初始化合约失败，请刷新页面重试");
      }
    }
  }, [isConnected, provider]);
  
  // 加载用户相关的版权数据
  useEffect(() => {
    if (isConnected && account && copyrightContract) {
      loadUserCopyrights();
      loadUserReports();
    }
  }, [isConnected, account, copyrightContract]);
  
  // 加载用户版权
  const loadUserCopyrights = async () => {
    // 实际实现中应该调用合约方法获取用户的版权列表
    // 这里使用模拟数据
    setSearchResults([
      {
        id: 1,
        title: "传统文化插画集",
        description: "中国传统节日主题插画系列",
        contentType: "image",
        creator: account,
        timestamp: Date.now() - 86400000 * 10,
        contentHash: "QmXgZAUWd8Ua9vQVZ7GWhrky3GVZURHgg4SRNHrNAeUprC",
        metadataURI: "ipfs://QmXgZAUWd8Ua9vQVZ7GWhrky3GVZURHgg4SRNHrNAeUprC/metadata.json"
      },
      {
        id: 2,
        title: "民族音乐采集",
        description: "西南少数民族传统音乐现场录制",
        contentType: "audio",
        creator: account,
        timestamp: Date.now() - 86400000 * 5,
        contentHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        metadataURI: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/metadata.json"
      }
    ]);
  };
  
  // 加载用户侵权报告
  const loadUserReports = async () => {
    // 实际实现中应该调用合约方法获取用户的侵权报告
    // 这里使用模拟数据
    setMyReports([
      {
        id: 1,
        copyrightId: 3,
        reporter: account,
        description: "在某网站发现未授权使用我的作品",
        evidence: "QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D",
        status: 2,
        timestamp: Date.now() - 86400000 * 3
      }
    ]);
    
    setReceivedReports([
      {
        id: 2,
        copyrightId: 1,
        reporter: "0x1234567890123456789012345678901234567890",
        description: "质疑作品原创性",
        evidence: "QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D",
        status: 0,
        timestamp: Date.now() - 86400000 * 1
      }
    ]);
  };
  
  // 处理文件选择
  const handleFileChange = (e, isEvidence = false) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (isEvidence) {
      setReportEvidence(selectedFile);
      
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportEvidencePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(selectedFile);
      
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  // 计算文件哈希
  const calculateFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = Buffer.from(event.target.result);
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  
  // 上传文件到IPFS
  const uploadToIPFS = async (file) => {
    try {
      const added = await ipfsClient.add(file, {
        progress: (prog) => console.log(`上传进度: ${prog}`)
      });
      return added.path;
    } catch (error) {
      console.error('IPFS上传错误:', error);
      throw new Error('IPFS上传失败');
    }
  };
  
  // 创建元数据并上传到IPFS
  const createAndUploadMetadata = async (contentHash, contentURI) => {
    const metadata = {
      title,
      description,
      contentType,
      contentHash,
      contentURI,
      creator: account,
      createdAt: new Date().toISOString(),
      additionalMetadata: additionalMetadata ? JSON.parse(additionalMetadata) : {}
    };
    
    try {
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json');
      const added = await ipfsClient.add(metadataFile);
      return added.path;
    } catch (error) {
      console.error('元数据上传错误:', error);
      throw new Error('元数据上传失败');
    }
  };
  
  // 注册版权
  const registerCopyright = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setErrorMessage('请先连接钱包');
      return;
    }
    
    if (!title || !description || !contentType || !file) {
      setErrorMessage('请填写所有必填字段并上传文件');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // 1. 计算文件哈希
      const contentHash = await calculateFileHash(file);
      
      // 2. 上传文件到IPFS
      const contentURI = await uploadToIPFS(file);
      
      // 3. 创建并上传元数据
      const metadataURI = await createAndUploadMetadata(contentHash, contentURI);
      
      // 4. 调用智能合约注册版权
      const tx = await copyrightContract.registerCopyright(
        contentHash,
        title,
        description,
        contentType,
        `ipfs://${metadataURI}`
      );
      
      // 5. 等待交易确认
      await tx.wait();
      
      // 6. 更新UI
      setSuccessMessage('版权登记成功！您的作品已受到区块链保护');
      
      // 7. 重置表单
      setTitle('');
      setDescription('');
      setContentType('text');
      setFile(null);
      setFilePreview(null);
      setAdditionalMetadata('');
      
      // 8. 刷新用户版权列表
      loadUserCopyrights();
      
    } catch (error) {
      console.error('版权登记错误:', error);
      setErrorMessage(`版权登记失败: ${error.message}`);
    } finally {
      setIsLoading(false);
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
    
    try {
      // 实际实现中应该调用合约方法搜索版权
      // 这里使用模拟数据
      setTimeout(() => {
        setSearchResults([
          {
            id: 3,
            title: "古代建筑研究论文",
            description: "中国古代建筑风格与技术分析",
            contentType: "text",
            creator: "0x9876543210987654321098765432109876543210",
            timestamp: Date.now() - 86400000 * 15,
            contentHash: "QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D",
            metadataURI: "ipfs://QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D/metadata.json"
          },
          {
            id: 4,
            title: "传统工艺教程",
            description: "非物质文化遗产工艺制作详解",
            contentType: "video",
            creator: "0x5432109876543210987654321098765432109876",
            timestamp: Date.now() - 86400000 * 20,
            contentHash: "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
            metadataURI: "ipfs://QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz/metadata.json"
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('搜索错误:', error);
      setErrorMessage(`搜索失败: ${error.message}`);
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
    
    try {
      // 1. 计算文件哈希
      const contentHash = await calculateFileHash(verifyFile);
      
      // 2. 调用智能合约验证版权
      // 实际实现中应该调用合约方法验证版权
      // 这里使用模拟数据
      setTimeout(() => {
        // 模拟找到匹配的版权
        setVerifyResult({
          isRegistered: true,
          copyright: {
            id: 1,
            title: "传统文化插画集",
            description: "中国传统节日主题插画系列",
            contentType: "image",
            creator: "0x1234567890123456789012345678901234567890",
            timestamp: Date.now() - 86400000 * 10,
            contentHash: contentHash,
            metadataURI: "ipfs://QmXgZAUWd8Ua9vQVZ7GWhrky3GVZURHgg4SRNHrNAeUprC/metadata.json"
          }
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('验证错误:', error);
      setErrorMessage(`验证失败: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  // 提交侵权举报
  const submitInfringementReport = async (e) => {
    e.preventDefault();
    
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
    
    try {
      // 1. 上传证据到IPFS
      const evidenceURI = await uploadToIPFS(reportEvidence);
      
      // 2. 调用智能合约提交侵权举报
      const tx = await copyrightContract.reportInfringement(
        reportCopyrightId,
        `ipfs://${evidenceURI}`,
        reportDescription
      );
      
      // 3. 等待交易确认
      await tx.wait();
      
      // 4. 更新UI
      setSuccessMessage('侵权举报提交成功！我们将尽快处理');
      
      // 5. 重置表单
      setReportCopyrightId('');
      setReportDescription('');
      setReportEvidence(null);
      setReportEvidencePreview(null);
      
      // 6. 刷新用户侵权报告列表
      loadUserReports();
      
    } catch (error) {
      console.error('侵权举报错误:', error);
      setErrorMessage(`侵权举报失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 查看版权详情
  const viewCopyrightDetails = (copyright) => {
    setSelectedCopyright(copyright);
  };
  
  // 关闭版权详情
  const closeDetails = () => {
    setSelectedCopyright(null);
  };
  
  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 渲染版权登记表单
  const renderRegisterForm = () => {
    return (
      <form className="copyright-form" onSubmit={registerCopyright}>
        <div className="form-group">
          <label htmlFor="title">作品标题 *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入作品标题"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">作品描述 *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="详细描述您的作品"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contentType">作品类型 *</label>
          <select
            id="contentType"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            required
          >
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="file">上传作品文件 *</label>
          <input
            type="file"
            id="file"
            onChange={(e) => handleFileChange(e)}
            required
          />
          {filePreview && (
            <div className="file-preview">
              {contentType === 'image' ? (
                <img src={filePreview} alt="预览" />
              ) : (
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="additionalMetadata">附加元数据 (JSON格式)</label>
          <textarea
            id="additionalMetadata"
            value={additionalMetadata}
            onChange={(e) => setAdditionalMetadata(e.target.value)}
            placeholder='{"creator_info": {"name": "张三", "contact": "email@example.com"}, "license": "CC BY-NC-SA 4.0"}'
          />
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : '登记版权'}
          </button>
        </div>
      </form>
    );
  };
  
  // 渲染版权搜索表单
  const renderSearchForm = () => {
    return (
      <div className="search-section">
        <form className="search-form" onSubmit={searchCopyright}>
          <div className="search-inputs">
            <div className="search-type">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="hash">按内容哈希</option>
                <option value="id">按版权ID</option>
                <option value="creator">按创作者</option>
                <option value="title">按标题</option>
              </select>
            </div>
            <div className="search-query">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`输入${
                  searchType === 'hash' ? '内容哈希' :
                  searchType === 'id' ? '版权ID' :
                  searchType === 'creator' ? '创作者地址' : '作品标题'
                }`}
              />
            </div>
            <button
              type="submit"
              className="search-button"
              disabled={isLoading}
            >
              {isLoading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </form>
        
        <div className="search-results">
          <h3>搜索结果</h3>
          {searchResults.length === 0 ? (
            <p className="no-results">暂无结果</p>
          ) : (
            <div className="results-list">
              {searchResults.map((copyright) => (
                <div key={copyright.id} className="copyright-card">
                  <div className="copyright-info">
                    <h4>{copyright.title}</h4>
                    <p className="copyright-description">{copyright.description}</p>
                    <div className="copyright-meta">
                      <span className="copyright-type">{contentTypes.find(t => t.value === copyright.contentType)?.label || copyright.contentType}</span>
                      <span className="copyright-date">{formatTimestamp(copyright.timestamp)}</span>
                    </div>
                    <div className="copyright-creator">
                      创作者: {formatAddress(copyright.creator)}
                    </div>
                  </div>
                  <div className="copyright-actions">
                    <button
                      className="view-details-button"
                      onClick={() => viewCopyrightDetails(copyright)}
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染版权验证表单
  const renderVerifyForm = () => {
    return (
      <div className="verify-section">
        <form className="verify-form" onSubmit={verifyCopyright}>
          <div className="form-group">
            <label htmlFor="verifyFile">上传要验证的文件 *</label>
            <input
              type="file"
              id="verifyFile"
              onChange={(e) => setVerifyFile(e.target.files[0])}
              required
            />
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? '验证中...' : '验证版权'}
            </button>
          </div>
        </form>
        
        {verifyResult && (
          <div className={`verify-result ${verifyResult.isRegistered ? 'registered' : 'not-registered'}`}>
            <div className="result-icon">
              {verifyResult.isRegistered ? '✓' : '✗'}
            </div>
            <div className="result-message">
              {verifyResult.isRegistered ? (
                <>
                  <h3>已注册版权</h3>
                  <p>该文件已在区块链上注册版权</p>
                  <div className="copyright-details">
                    <p><strong>标题:</strong> {verifyResult.copyright.title}</p>
                    <p><strong>创作者:</strong> {formatAddress(verifyResult.copyright.creator)}</p>
                    <p><strong>注册时间:</strong> {formatTimestamp(verifyResult.copyright.timestamp)}</p>
                    <button
                      className="view-details-button"
                      onClick={() => viewCopyrightDetails(verifyResult.copyright)}
                    >
                      查看完整详情
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>未注册版权</h3>
                  <p>该文件在区块链上没有找到版权记录</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染侵权举报表单
  const renderReportForm = () => {
    return (
      <div className="report-section">
        <div className="report-tabs">
          <button
            className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            提交举报
          </button>
          <button
            className={`tab-btn ${activeTab === 'my-reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-reports')}
          >
            我的举报
          </button>
          <button
            className={`tab-btn ${activeTab === 'received-reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('received-reports')}
          >
            收到的举报
          </button>
        </div>
        
        {activeTab === 'report' && (
          <form className="report-form" onSubmit={submitInfringementReport}>
            <div className="form-group">
              <label htmlFor="reportCopyrightId">版权ID *</label>
              <input
                type="text"
                id="reportCopyrightId"
                value={reportCopyrightId}
                onChange={(e) => setReportCopyrightId(e.target.value)}
                placeholder="输入被侵权的版权ID"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reportDescription">侵权描述 *</label>
              <textarea
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="详细描述侵权情况"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reportEvidence">上传证据 *</label>
              <input
                type="file"
                id="reportEvidence"
                onChange={(e) => handleFileChange(e, true)}
                required
              />
              {reportEvidencePreview && (
                <div className="file-preview">
                  {reportEvidence.type.startsWith('image/') ? (
                    <img src={reportEvidencePreview} alt="证据预览" />
                  ) : (
                    <div className="file-info">
                      <span className="file-name">{reportEvidence.name}</span>
                      <span className="file-size">{(reportEvidence.size / 1024).toFixed(2)} KB</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? '提交中...' : '提交举报'}
              </button>
            </div>
          </form>
        )}
        
        {activeTab === 'my-reports' && (
          <div className="reports-list">
            <h3>我提交的举报</h3>
            {myReports.length === 0 ? (
              <p className="no-results">暂无举报记录</p>
            ) : (
              myReports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <span className="report-id">举报ID: {report.id}</span>
                    <span className={`report-status status-${report.status}`}>
                      {reportStatuses[report.status]}
                    </span>
                  </div>
                  <div className="report-content">
                    <p><strong>版权ID:</strong> {report.copyrightId}</p>
                    <p><strong>描述:</strong> {report.description}</p>
                    <p><strong>提交时间:</strong> {formatTimestamp(report.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'received-reports' && (
          <div className="reports-list">
            <h3>收到的举报</h3>
            {receivedReports.length === 0 ? (
              <p className="no-results">暂无收到的举报</p>
            ) : (
              receivedReports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <span className="report-id">举报ID: {report.id}</span>
                    <span className={`report-status status-${report.status}`}>
                      {reportStatuses[report.status]}
                    </span>
                  </div>
                  <div className="report-content">
                    <p><strong>版权ID:</strong> {report.copyrightId}</p>
                    <p><strong>举报者:</strong> {formatAddress(report.reporter)}</p>
                    <p><strong>描述:</strong> {report.description}</p>
                    <p><strong>提交时间:</strong> {formatTimestamp(report.timestamp)}</p>
                  </div>
                  <div className="report-actions">
                    <button className="view-evidence-button">查看证据</button>
                    {report.status === 0 && (
                      <>
                        <button className="accept-button">接受举报</button>
                        <button className="reject-button">驳回举报</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };
  
  // 渲染版权详情模态框
  const renderCopyrightDetails = () => {
    if (!selectedCopyright) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>版权详情</h3>
            <button className="close-button" onClick={closeDetails}>×</button>
          </div>
          <div className="modal-body">
            <div className="detail-item">
              <span className="detail-label">版权ID:</span>
              <span className="detail-value">{selectedCopyright.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">标题:</span>
              <span className="detail-value">{selectedCopyright.title}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">描述:</span>
              <span className="detail-value">{selectedCopyright.description}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">类型:</span>
              <span className="detail-value">
                {contentTypes.find(t => t.value === selectedCopyright.contentType)?.label || selectedCopyright.contentType}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">创作者:</span>
              <span className="detail-value">{selectedCopyright.creator}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">注册时间:</span>
              <span className="detail-value">{formatTimestamp(selectedCopyright.timestamp)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">内容哈希:</span>
              <span className="detail-value hash-value">{selectedCopyright.contentHash}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">元数据URI:</span>
              <span className="detail-value uri-value">{selectedCopyright.metadataURI}</span>
            </div>
            
            <div className="detail-actions">
              <button className="view-content-button">
                查看内容
              </button>
              <button className="report-button" onClick={() => {
                setReportCopyrightId(selectedCopyright.id);
                setActiveTab('report');
                closeDetails();
              }}>
                举报侵权
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 主渲染函数
  return (
    <div className="copyright-protection">
      <div className="copyright-header">
        <h2>文化知识产权保护系统</h2>
        <p className="subtitle">基于区块链的文化作品版权保护与验证平台</p>
      </div>
      
      {!isConnected ? (
        <div className="connect-wallet-prompt">
          <p>请连接钱包以使用文化知识产权保护系统</p>
          <button className="connect-wallet-btn" onClick={connectWallet}>
            连接钱包
          </button>
        </div>
      ) : (
        <>
          <div className="copyright-tabs">
            <button
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              版权登记
            </button>
            <button
              className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              版权查询
            </button>
            <button
              className={`tab-btn ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveTab('verify')}
            >
              版权验证
            </button>
            <button
              className={`tab-btn ${['report', 'my-reports', 'received-reports'].includes(activeTab) ? 'active' : ''}`}
              onClick={() => setActiveTab('report')}
            >
              侵权举报
            </button>
          </div>
          
          {errorMessage && (
            <div className="error-message">
              <i className="error-icon">!</i> {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              <i className="success-icon">✓</i> {successMessage}
            </div>
          )}
          
          <div className="copyright-content">
            {activeTab === 'register' && renderRegisterForm()}
            {activeTab === 'search' && renderSearchForm()}
            {activeTab === 'verify' && renderVerifyForm()}
            {['report', 'my-reports', 'received-reports'].includes(activeTab) && renderReportForm()}
          </div>
          
          {renderCopyrightDetails()}
        </>
      )}
    </div>
  );
};

export default CopyrightProtection;
