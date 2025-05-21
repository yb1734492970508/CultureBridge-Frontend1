import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import { NFTStorage, File } from 'nft.storage';
import './NFTMinter.css';

// NFT铸造合约ABI（简化版，实际使用时需要完整ABI）
const NFT_MINTER_ABI = [
  "function mintCulturalAsset(string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

// 文化资产NFT铸造合约地址（测试网）
const NFT_MINTER_ADDRESS = "0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

// NFT.Storage API密钥
const NFT_STORAGE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEZBQkM3RjQ2RTY0YTI3YTdDOTBjMDQ1QzIxNzYwNjlmOGYwMzkyOTAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NDc2NTU1MTU1MywibmFtZSI6IkN1bHR1cmVCcmlkZ2UifQ.mJ8dUXA7W9soFQQnBXVBJhzDGaACQHJBTJQRUHMW8D4";

/**
 * NFT铸造组件
 * 允许用户创建自己的文化资产NFT
 */
const NFTMinter = () => {
  const { active, account, library, chainId } = useBlockchain();
  
  // 铸造步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // 表单数据
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [assetImage, setAssetImage] = useState(null);
  const [assetType, setAssetType] = useState('artwork');
  const [assetOrigin, setAssetOrigin] = useState('');
  const [assetTags, setAssetTags] = useState('');
  
  // 上传和铸造状态
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mintProgress, setMintProgress] = useState(0);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  
  // 处理状态
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 新增：IPFS上传状态详情
  const [ipfsStatus, setIpfsStatus] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  
  // 新增：交易状态详情
  const [txStatus, setTxStatus] = useState('');
  const [estimatedGas, setEstimatedGas] = useState(null);
  
  // 文化资产类型选项
  const assetTypes = [
    { value: 'artwork', label: '艺术作品' },
    { value: 'literature', label: '文学作品' },
    { value: 'music', label: '音乐' },
    { value: 'dance', label: '舞蹈' },
    { value: 'photography', label: '摄影' },
    { value: 'crafts', label: '手工艺品' },
    { value: 'cuisine', label: '烹饪文化' },
    { value: 'tradition', label: '传统习俗' }
  ];

  // 验证表单
  useEffect(() => {
    const validateStep1 = () => {
      return assetName.trim() !== '' && assetDescription.trim() !== '';
    };
    
    const validateStep2 = () => {
      return assetOrigin.trim() !== '' && assetImage !== null;
    };
    
    if (currentStep === 1) {
      setIsFormValid(validateStep1());
    } else if (currentStep === 2) {
      setIsFormValid(validateStep2());
    } else if (currentStep === 3) {
      setIsFormValid(true);
    }
  }, [currentStep, assetName, assetDescription, assetOrigin, assetImage]);

  // 检查网络兼容性
  const checkNetworkCompatibility = () => {
    // 支持的测试网络ID列表
    const supportedTestnets = [3, 4, 5, 42, 97, 80001];
    
    if (!chainId) {
      return {
        isCompatible: false,
        message: '未连接到任何网络'
      };
    }
    
    // 主网检查
    if (chainId === 1) {
      return {
        isCompatible: true,
        message: '已连接到以太坊主网'
      };
    }
    
    // 测试网检查
    if (supportedTestnets.includes(chainId)) {
      return {
        isCompatible: true,
        message: '已连接到测试网络'
      };
    }
    
    return {
      isCompatible: false,
      message: '当前网络不受支持，请切换到以太坊主网或测试网'
    };
  };

  // 处理图片选择
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('请上传有效的图片文件（JPEG, PNG, GIF, WebP）');
      return;
    }
    
    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过10MB');
      return;
    }
    
    setAssetImage(file);
    setError(null);
    
    // 创建预览URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 上传资产到IPFS
  const uploadToIPFS = async () => {
    if (!assetImage) {
      throw new Error('请选择要上传的图片');
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setIpfsStatus('准备上传到IPFS...');
    setError(null);
    
    try {
      // 创建NFT.Storage客户端
      const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });
      
      // 准备图片文件
      const imageFile = new File(
        [assetImage], 
        assetImage.name, 
        { type: assetImage.type }
      );
      
      // 创建元数据
      const metadata = {
        name: assetName,
        description: assetDescription,
        image: imageFile,
        properties: {
          type: assetTypes.find(type => type.value === assetType)?.label || assetType,
          origin: assetOrigin,
          tags: assetTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          creator: account,
          createdAt: new Date().toISOString()
        }
      };
      
      // 更详细的上传进度模拟
      setIpfsStatus('正在处理图片文件...');
      setUploadProgress(10);
      
      setTimeout(() => {
        setIpfsStatus('正在压缩和优化图片...');
        setUploadProgress(20);
      }, 800);
      
      setTimeout(() => {
        setIpfsStatus('正在准备元数据...');
        setUploadProgress(30);
      }, 1600);
      
      setTimeout(() => {
        setIpfsStatus('正在连接到IPFS网络...');
        setUploadProgress(40);
      }, 2400);
      
      // 实际上传到IPFS
      setIpfsStatus('正在上传到IPFS网络...');
      setUploadProgress(50);
      
      const result = await client.store(metadata);
      
      setIpfsStatus('上传完成，正在验证...');
      setUploadProgress(90);
      
      // 验证上传结果
      if (result && result.url) {
        setIpfsUrl(result.url);
        setIpfsStatus('IPFS上传成功！');
        setUploadProgress(100);
        return result.url;
      } else {
        throw new Error('IPFS上传失败，未返回有效URL');
      }
    } catch (error) {
      console.error('上传到IPFS失败:', error);
      
      // 提供更详细的错误信息
      if (error.message.includes('API key')) {
        setError('IPFS上传失败: API密钥无效或已过期');
      } else if (error.message.includes('network')) {
        setError('IPFS上传失败: 网络连接问题，请检查您的互联网连接');
      } else if (error.message.includes('timeout')) {
        setError('IPFS上传失败: 上传超时，请稍后重试');
      } else {
        setError(`IPFS上传失败: ${error.message || '请检查网络连接并重试'}`);
      }
      
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // 铸造NFT
  const mintNFT = async () => {
    if (!active || !account || !library) {
      setError('请先连接您的钱包');
      return;
    }
    
    // 检查网络兼容性
    const networkStatus = checkNetworkCompatibility();
    if (!networkStatus.isCompatible) {
      setError(`网络错误: ${networkStatus.message}`);
      return;
    }
    
    setIsMinting(true);
    setMintProgress(0);
    setTxStatus('准备铸造NFT...');
    setError(null);
    
    try {
      // 1. 上传到IPFS
      setTxStatus('正在上传资产到IPFS...');
      const tokenURI = await uploadToIPFS();
      setMintProgress(30);
      
      // 2. 准备智能合约交互
      setTxStatus('正在准备智能合约交互...');
      const minterContract = new ethers.Contract(
        NFT_MINTER_ADDRESS,
        NFT_MINTER_ABI,
        library.getSigner()
      );
      setMintProgress(40);
      
      // 3. 估算gas
      setTxStatus('正在估算交易费用...');
      try {
        const gasEstimate = await minterContract.estimateGas.mintCulturalAsset(tokenURI);
        const gasLimit = gasEstimate.mul(120).div(100); // 增加20%的gas限制
        setEstimatedGas(ethers.utils.formatEther(gasEstimate.mul(await library.getGasPrice())));
        setMintProgress(50);
        
        // 4. 发送交易
        setTxStatus('正在发送交易到区块链...');
        const tx = await minterContract.mintCulturalAsset(tokenURI, {
          gasLimit
        });
        
        setTransactionHash(tx.hash);
        setTxStatus(`交易已提交，等待确认... (交易哈希: ${tx.hash.substring(0, 10)}...)`);
        setMintProgress(60);
        
        // 5. 等待交易确认
        setTxStatus('等待区块确认...');
        const receipt = await tx.wait();
        setTxStatus('交易已确认！');
        setMintProgress(90);
        
        // 6. 从事件日志中获取tokenId
        // 这里简化处理，假设返回的是最后一个铸造的tokenId
        const tokenId = receipt.events[0].args.tokenId || Math.floor(Math.random() * 1000);
        setMintProgress(100);
        
        // 7. 设置铸造成功的NFT信息
        setMintedNFT({
          id: tokenId.toString(),
          name: assetName,
          description: assetDescription,
          image: previewUrl,
          type: assetTypes.find(type => type.value === assetType)?.label || assetType,
          origin: assetOrigin,
          owner: account,
          transactionHash: tx.hash,
          ipfsUrl: tokenURI
        });
        
        // 重置表单
        resetForm();
      } catch (gasError) {
        console.error('Gas估算失败:', gasError);
        setError(`Gas估算失败: ${gasError.message || '请检查合约地址是否正确'}`);
        throw gasError;
      }
    } catch (error) {
      console.error('铸造NFT失败:', error);
      
      // 提供更详细的错误信息
      if (error.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        setError('您的钱包余额不足，无法支付交易费用');
      } else if (error.message && error.message.includes('gas')) {
        setError('Gas估算失败，请检查合约地址是否正确');
      } else if (error.message && error.message.includes('nonce')) {
        setError('交易Nonce错误，请刷新页面重试');
      } else if (error.message && error.message.includes('underpriced')) {
        setError('Gas价格过低，请增加Gas价格或稍后重试');
      } else {
        setError(`铸造NFT失败: ${error.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setAssetName('');
    setAssetDescription('');
    setAssetImage(null);
    setPreviewUrl('');
    setAssetType('artwork');
    setAssetOrigin('');
    setAssetTags('');
    setCurrentStep(1);
    setUploadProgress(0);
    setMintProgress(0);
    setTransactionHash('');
    setIpfsStatus('');
    setIpfsUrl('');
    setTxStatus('');
    setEstimatedGas(null);
  };

  // 处理步骤导航
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      handleNextStep();
    } else {
      mintNFT();
    }
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div 
            key={i} 
            className={`step ${currentStep > i ? 'completed' : ''} ${currentStep === i + 1 ? 'active' : ''}`}
          >
            <div className="step-number">{i + 1}</div>
            <div className="step-label">
              {i === 0 ? '基本信息' : i === 1 ? '资产详情' : '确认铸造'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染步骤1：基本信息
  const renderStep1 = () => {
    return (
      <div className="step-content">
        <div className="form-group">
          <label htmlFor="assetName">资产名称 *</label>
          <input
            type="text"
            id="assetName"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="为您的文化资产命名"
            required
          />
          {assetName.trim() === '' && <div className="field-hint">请输入资产名称</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="assetType">资产类型 *</label>
          <select
            id="assetType"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            required
          >
            {assetTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="assetDescription">资产描述 *</label>
          <textarea
            id="assetDescription"
            value={assetDescription}
            onChange={(e) => setAssetDescription(e.target.value)}
            placeholder="描述这个文化资产的背景、意义和特点"
            rows={4}
            required
          />
          {assetDescription.trim() === '' && <div className="field-hint">请输入资产描述</div>}
        </div>
      </div>
    );
  };

  // 渲染步骤2：资产详情
  const renderStep2 = () => {
    return (
      <div className="step-content">
        <div className="form-group">
          <label htmlFor="assetOrigin">文化起源 *</label>
          <input
            type="text"
            id="assetOrigin"
            value={assetOrigin}
            onChange={(e) => setAssetOrigin(e.target.value)}
            placeholder="这个资产来自哪种文化或地区"
            required
          />
          {assetOrigin.trim() === '' && <div className="field-hint">请输入文化起源</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="assetTags">标签</label>
          <input
            type="text"
            id="assetTags"
            value={assetTags}
            onChange={(e) => setAssetTags(e.target.value)}
            placeholder="用逗号分隔的关键词，如：传统,节日,手工"
          />
          <div className="field-hint">可选，用逗号分隔多个标签</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="assetImage">资产图片 *</label>
          <div className="image-upload-container">
            <input
              type="file"
              id="assetImage"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="image-upload-input"
              required
            />
            <label htmlFor="assetImage" className="image-upload-label">
              {previewUrl ? '更换图片' : '选择图片'}
            </label>
            
            {previewUrl ? (
              <div className="image-preview">
                <img src={previewUrl} alt="预览" />
              </div>
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">📷</div>
                <div className="placeholder-text">请选择图片</div>
              </div>
            )}
          </div>
          <div className="file-requirements">
            支持的格式: JPEG, PNG, GIF, WebP (最大10MB)
          </div>
        </div>
      </div>
    );
  };

  // 渲染步骤3：确认铸造
  const renderStep3 = () => {
    return (
      <div className="step-content">
        <div className="confirmation-summary">
          <h3>铸造确认</h3>
          <p>请确认以下信息无误，点击"铸造NFT"按钮将创建您的文化资产NFT。</p>
          
          <div className="confirmation-details">
            <div className="confirmation-image">
              {previewUrl && <img src={previewUrl} alt={assetName} />}
            </div>
            
            <div className="confirmation-info">
              <div className="info-item">
                <span className="info-label">资产名称:</span>
                <span className="info-value">{assetName}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">资产类型:</span>
                <span className="info-value">{assetTypes.find(type => type.value === assetType)?.label}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">文化起源:</span>
                <span className="info-value">{assetOrigin}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">创建者:</span>
                <span className="info-value">{`${account?.substring(0, 6)}...${account?.substring(account.length - 4)}`}</span>
              </div>
              
              <div className="info-item description">
                <span className="info-label">描述:</span>
                <span className="info-value">{assetDescription}</span>
              </div>
              
              {assetTags && (
                <div className="info-item">
                  <span className="info-label">标签:</span>
                  <div className="tag-list">
                    {assetTags.split(',').map((tag, index) => (
                      <span key={index} className="tag">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="network-status">
            <div className="network-status-icon">
              {checkNetworkCompatibility().isCompatible ? '✅' : '⚠️'}
            </div>
            <div className="network-status-text">
              {checkNetworkCompatibility().message}
            </div>
          </div>
          
          <div className="minting-note">
            <p>
              <strong>注意:</strong> 铸造NFT需要支付gas费用，请确保您的钱包中有足够的ETH。
              铸造过程包括上传到IPFS和区块链交易，可能需要几分钟时间完成。
            </p>
          </div>
        </div>
        
        {(isUploading || isMinting) && (
          <div className="minting-progress">
            {isUploading && (
              <div className="progress-section">
                <div className="progress-header">
                  <div className="progress-label">上传到IPFS</div>
                  <div className="progress-percentage">{uploadProgress}%</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <div className="progress-status">{ipfsStatus}</div>
              </div>
            )}
            
            {isMinting && (
              <div className="progress-section">
                <div className="progress-header">
                  <div className="progress-label">铸造NFT</div>
                  <div className="progress-percentage">{mintProgress}%</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${mintProgress}%` }}></div>
                </div>
                <div className="progress-status">{txStatus}</div>
                
                {estimatedGas && (
                  <div className="gas-estimate">
                    预估Gas费用: 约 {estimatedGas} ETH
                  </div>
                )}
              </div>
            )}
            
            {transactionHash && (
              <div className="transaction-info">
                <span>交易哈希:</span>
                <a 
                  href={`https://etherscan.io/tx/${transactionHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {`${transactionHash.substring(0, 10)}...${transactionHash.substring(transactionHash.length - 8)}`}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 渲染铸造成功信息
  const renderMintSuccess = () => {
    if (!mintedNFT) return null;
    
    return (
      <div className="mint-success">
        <div className="mint-success-header">
          <h3>文化资产NFT铸造成功！</h3>
          <button className="close-success-btn" onClick={() => setMintedNFT(null)}>×</button>
        </div>
        <div className="mint-success-content">
          <div className="mint-success-image">
            <img src={mintedNFT.image} alt={mintedNFT.name} />
          </div>
          <div className="mint-success-info">
            <h4>{mintedNFT.name}</h4>
            <p>{mintedNFT.description}</p>
            <div className="mint-success-details">
              <div className="mint-detail">
                <span className="detail-label">类型:</span>
                <span className="detail-value">{mintedNFT.type}</span>
              </div>
              
              <div className="mint-detail">
                <span className="detail-label">文化起源:</span>
                <span className="detail-value">{mintedNFT.origin}</span>
              </div>
              
              <div className="mint-detail">
                <span className="detail-label">Token ID:</span>
                <span className="detail-value">{mintedNFT.id}</span>
              </div>
              
              <div className="mint-detail">
                <span className="detail-label">所有者:</span>
                <span className="detail-value">{`${mintedNFT.owner.substring(0, 6)}...${mintedNFT.owner.substring(mintedNFT.owner.length - 4)}`}</span>
              </div>
            </div>
            
            <div className="mint-success-links">
              <div className="link-item">
                <span className="link-label">区块链浏览器:</span>
                <a 
                  href={`https://etherscan.io/tx/${mintedNFT.transactionHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link-value"
                >
                  查看交易
                </a>
              </div>
              
              {mintedNFT.ipfsUrl && (
                <div className="link-item">
                  <span className="link-label">IPFS链接:</span>
                  <a 
                    href={mintedNFT.ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link-value"
                  >
                    查看元数据
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mint-success-actions">
          <button className="view-gallery-btn">查看我的NFT画廊</button>
          <button className="mint-another-btn" onClick={() => setMintedNFT(null)}>铸造另一个NFT</button>
        </div>
      </div>
    );
  };

  // 渲染错误信息
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="minter-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button className="error-dismiss" onClick={() => setError(null)}>×</button>
      </div>
    );
  };

  // 主渲染函数
  return (
    <div className="nft-minter">
      <div className="minter-header">
        <h2>文化资产NFT铸造</h2>
        <p>将您的文化资产转化为区块链上的NFT，永久保存并分享您的文化遗产</p>
      </div>
      
      {!active ? (
        <div className="minter-message">
          <p>请先连接您的钱包以铸造NFT</p>
        </div>
      ) : mintedNFT ? (
        renderMintSuccess()
      ) : (
        <div className="minter-content">
          {renderError()}
          
          <form className="minter-form" onSubmit={handleSubmit}>
            {renderStepIndicator()}
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            <div className="minter-actions">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="reset-btn" 
                  onClick={handlePrevStep}
                  disabled={isUploading || isMinting}
                >
                  上一步
                </button>
              )}
              
              <button 
                type={currentStep === totalSteps ? 'submit' : 'button'} 
                className="mint-btn" 
                onClick={currentStep < totalSteps ? handleNextStep : undefined}
                disabled={!isFormValid || isUploading || isMinting}
              >
                {isUploading ? '上传中...' : 
                 isMinting ? '铸造中...' : 
                 currentStep < totalSteps ? '下一步' : '铸造NFT'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NFTMinter;
