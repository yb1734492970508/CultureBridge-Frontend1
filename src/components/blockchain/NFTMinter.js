import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './NFTMinter.css';

// NFT铸造合约ABI（简化版，实际使用时需要完整ABI）
const NFT_MINTER_ABI = [
  "function mintCulturalAsset(string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

// 文化资产NFT铸造合约地址（测试网）
const NFT_MINTER_ADDRESS = "0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

// IPFS网关URL
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

/**
 * NFT铸造组件
 * 允许用户创建自己的文化资产NFT
 */
const NFTMinter = () => {
  const { active, account, library } = useBlockchain();
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [assetImage, setAssetImage] = useState(null);
  const [assetType, setAssetType] = useState('artwork');
  const [assetOrigin, setAssetOrigin] = useState('');
  const [assetTags, setAssetTags] = useState('');
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  
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

  // 处理图片选择
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAssetImage(file);
    
    // 创建预览URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 上传资产到IPFS（模拟）
  const uploadToIPFS = async () => {
    // 实际项目中，这里应该使用真实的IPFS上传服务
    // 例如使用NFT.Storage、Pinata或Infura的IPFS API
    
    // 这里我们模拟上传过程
    setIsUploading(true);
    setError(null);
    
    try {
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成随机CID模拟IPFS哈希
      const mockImageCID = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      // 创建元数据对象
      const metadata = {
        name: assetName,
        description: assetDescription,
        image: `ipfs://${mockImageCID}`,
        attributes: [
          {
            trait_type: '类型',
            value: assetTypes.find(type => type.value === assetType)?.label || assetType
          },
          {
            trait_type: '文化起源',
            value: assetOrigin
          },
          {
            trait_type: '标签',
            value: assetTags
          },
          {
            trait_type: '创建者',
            value: account.substring(0, 6) + '...' + account.substring(account.length - 4)
          }
        ]
      };
      
      // 模拟元数据CID
      const mockMetadataCID = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      return `ipfs://${mockMetadataCID}`;
    } catch (error) {
      console.error('上传到IPFS失败:', error);
      setError('上传资产失败，请重试');
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
    
    if (!assetName || !assetDescription || !assetImage || !assetOrigin) {
      setError('请填写所有必填字段');
      return;
    }
    
    setIsMinting(true);
    setError(null);
    
    try {
      // 1. 上传到IPFS
      const tokenURI = await uploadToIPFS();
      
      // 2. 调用智能合约铸造NFT
      const minterContract = new ethers.Contract(
        NFT_MINTER_ADDRESS,
        NFT_MINTER_ABI,
        library.getSigner()
      );
      
      // 发送交易
      const tx = await minterContract.mintCulturalAsset(tokenURI);
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 从事件日志中获取tokenId（实际项目中需要根据合约事件定义解析）
      // 这里简化处理，假设返回的是最后一个铸造的tokenId
      const tokenId = receipt.events[0].args.tokenId || Math.floor(Math.random() * 1000);
      
      // 设置铸造成功的NFT信息
      setMintedNFT({
        id: tokenId.toString(),
        name: assetName,
        description: assetDescription,
        image: previewUrl,
        type: assetTypes.find(type => type.value === assetType)?.label || assetType,
        origin: assetOrigin,
        owner: account
      });
      
      // 重置表单
      resetForm();
    } catch (error) {
      console.error('铸造NFT失败:', error);
      setError('铸造NFT失败，请检查您的钱包连接并重试');
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
          </div>
        </div>
        <div className="mint-success-actions">
          <button className="view-gallery-btn">查看我的NFT画廊</button>
          <button className="mint-another-btn" onClick={() => setMintedNFT(null)}>铸造另一个NFT</button>
        </div>
      </div>
    );
  };

  // 渲染组件
  return (
    <div className="nft-minter">
      <div className="minter-header">
        <h2>创建文化资产NFT</h2>
        <p>将您的文化作品转化为区块链上的数字资产</p>
      </div>
      
      {!active ? (
        <div className="minter-message">
          <p>请连接您的钱包以创建文化资产NFT</p>
        </div>
      ) : (
        <div className="minter-content">
          {mintedNFT ? (
            renderMintSuccess()
          ) : (
            <div className="minter-form">
              <div className="form-row">
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
              </div>
              
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
              </div>
              
              <div className="form-group">
                <label htmlFor="assetImage">资产图片 *</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="assetImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-upload-input"
                    required
                  />
                  <label htmlFor="assetImage" className="image-upload-label">
                    {previewUrl ? '更换图片' : '选择图片'}
                  </label>
                  
                  {previewUrl && (
                    <div className="image-preview">
                      <img src={previewUrl} alt="预览" />
                    </div>
                  )}
                </div>
              </div>
              
              {error && <div className="minter-error">{error}</div>}
              
              <div className="minter-actions">
                <button 
                  className="mint-btn" 
                  onClick={mintNFT}
                  disabled={isUploading || isMinting || !assetName || !assetDescription || !assetImage || !assetOrigin}
                >
                  {isUploading ? '上传中...' : isMinting ? '铸造中...' : '铸造NFT'}
                </button>
                <button 
                  className="reset-btn" 
                  onClick={resetForm}
                  disabled={isUploading || isMinting}
                >
                  重置
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTMinter;
