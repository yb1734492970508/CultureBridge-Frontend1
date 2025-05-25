import React, { useState } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { NFTStorage } from 'nft.storage';
import { mintCultureNFT } from '../../contracts/NFT/CultureNFT';

// NFT.storage API密钥（实际应用中应从环境变量获取）
const NFT_STORAGE_API_KEY = 'YOUR_NFT_STORAGE_API_KEY';

/**
 * NFT铸造组件
 * 允许用户上传文化内容并铸造为NFT
 */
const NFTMinter = () => {
  const { account, active, library, chainId } = useBlockchain();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [category, setCategory] = useState('art');
  const [culture, setCulture] = useState('');
  const [attributes, setAttributes] = useState([{ trait_type: '', value: '' }]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenId, setTokenId] = useState(null);
  
  // 处理文件选择
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // 创建文件预览
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  // 添加新属性
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };
  
  // 更新属性
  const updateAttribute = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };
  
  // 删除属性
  const removeAttribute = (index) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
  };
  
  // 上传到IPFS并铸造NFT
  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!active) {
      setError('请先连接钱包');
      return;
    }
    
    if (!title || !description || !file || !culture) {
      setError('请填写所有必填字段');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setIsUploading(true);
      
      // 创建NFT.storage客户端
      const nftStorage = new NFTStorage({ token: NFT_STORAGE_API_KEY });
      
      // 过滤掉空属性
      const filteredAttributes = attributes.filter(attr => 
        attr.trait_type.trim() !== '' && attr.value.trim() !== ''
      );
      
      // 上传文件和元数据到IPFS
      const metadata = await nftStorage.store({
        name: title,
        description,
        image: file,
        properties: {
          category,
          culture,
          attributes: filteredAttributes
        }
      });
      
      setIsUploading(false);
      setIsMinting(true);
      
      // 铸造NFT
      const result = await mintCultureNFT(
        library,
        chainId,
        metadata.url
      );
      
      setIsMinting(false);
      
      if (result.success) {
        setSuccess(`NFT铸造成功！Token ID: ${result.tokenId}`);
        setTokenId(result.tokenId);
        
        // 重置表单
        setTitle('');
        setDescription('');
        setFile(null);
        setFilePreview('');
        setCategory('art');
        setCulture('');
        setAttributes([{ trait_type: '', value: '' }]);
      } else {
        setError(`铸造失败: ${result.error}`);
      }
    } catch (error) {
      setIsUploading(false);
      setIsMinting(false);
      setError(`操作失败: ${error.message}`);
      console.error(error);
    }
  };
  
  return (
    <div className="nft-minter">
      <h2>创建文化NFT</h2>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以铸造NFT</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
          {tokenId && (
            <p>
              <a href={`/nft/${tokenId}`} target="_blank" rel="noopener noreferrer">
                查看NFT详情
              </a>
            </p>
          )}
        </div>
      )}
      
      <form onSubmit={handleMint}>
        <div className="form-group">
          <label htmlFor="title">标题 *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading || isMinting}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">描述 *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading || isMinting}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="file">文件 *</label>
          <input
            type="file"
            id="file"
            accept="image/*,audio/*,video/*"
            onChange={handleFileChange}
            disabled={isUploading || isMinting}
            required
          />
          
          {filePreview && (
            <div className="file-preview">
              {file.type.startsWith('image/') ? (
                <img src={filePreview} alt="预览" />
              ) : file.type.startsWith('video/') ? (
                <video src={filePreview} controls />
              ) : file.type.startsWith('audio/') ? (
                <audio src={filePreview} controls />
              ) : (
                <p>文件已选择: {file.name}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="category">类别</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isUploading || isMinting}
          >
            <option value="art">艺术</option>
            <option value="music">音乐</option>
            <option value="literature">文学</option>
            <option value="photography">摄影</option>
            <option value="video">视频</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="culture">文化背景 *</label>
          <input
            type="text"
            id="culture"
            value={culture}
            onChange={(e) => setCulture(e.target.value)}
            disabled={isUploading || isMinting}
            required
            placeholder="例如：中国、日本、印度、法国..."
          />
        </div>
        
        <div className="form-group attributes-section">
          <label>属性</label>
          
          {attributes.map((attr, index) => (
            <div key={index} className="attribute-row">
              <input
                type="text"
                placeholder="属性名称"
                value={attr.trait_type}
                onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                disabled={isUploading || isMinting}
              />
              <input
                type="text"
                placeholder="属性值"
                value={attr.value}
                onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                disabled={isUploading || isMinting}
              />
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                disabled={isUploading || isMinting || attributes.length <= 1}
              >
                删除
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addAttribute}
            disabled={isUploading || isMinting}
            className="add-attribute-btn"
          >
            添加属性
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!active || isUploading || isMinting}
          className="mint-button"
        >
          {isUploading ? '上传到IPFS中...' : isMinting ? '铸造NFT中...' : '铸造NFT'}
        </button>
      </form>
    </div>
  );
};

export default NFTMinter;
