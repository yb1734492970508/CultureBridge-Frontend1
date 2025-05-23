import React, { useState, useEffect } from 'react';
import web3Service from '../services/web3Service';

/**
 * 资产管理组件
 * 提供文化资产的创建、查询和展示功能
 */
const AssetManagement = ({ account }) => {
  const [userAssets, setUserAssets] = useState([]);
  const [assetDetails, setAssetDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  
  // 创建资产表单数据
  const [formData, setFormData] = useState({
    assetType: '',
    culturalOrigin: '',
    tokenUri: '',
    metadataHash: ''
  });

  // 当账户变化时加载用户资产
  useEffect(() => {
    if (account) {
      loadUserAssets();
    } else {
      setUserAssets([]);
      setAssetDetails({});
    }
  }, [account]);

  // 加载用户资产
  const loadUserAssets = async () => {
    if (!account) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const assets = await web3Service.getUserAssets();
      setUserAssets(assets);
      
      // 加载每个资产的详细信息
      const details = {};
      for (const assetId of assets) {
        const info = await web3Service.getAssetInfo(assetId);
        details[assetId] = info;
      }
      setAssetDetails(details);
    } catch (err) {
      console.error('获取用户资产失败:', err);
      setError('获取用户资产失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 创建资产
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError('请先连接钱包');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      await web3Service.createAsset(
        formData.assetType,
        formData.culturalOrigin,
        formData.tokenUri,
        formData.metadataHash
      );
      
      // 创建成功后重置表单并重新加载资产
      setFormData({
        assetType: '',
        culturalOrigin: '',
        tokenUri: '',
        metadataHash: ''
      });
      
      await loadUserAssets();
    } catch (err) {
      console.error('创建资产失败:', err);
      setError('创建资产失败，请稍后再试');
    } finally {
      setIsCreating(false);
    }
  };

  // 如果未连接钱包，显示提示信息
  if (!account) {
    return (
      <div className="asset-management">
        <div className="notice">请先连接钱包以管理您的文化资产</div>
      </div>
    );
  }

  return (
    <div className="asset-management">
      <h2>文化资产管理</h2>
      
      <div className="create-asset">
        <h3>创建新资产</h3>
        <form onSubmit={handleCreateAsset}>
          <div className="form-group">
            <label htmlFor="assetType">资产类型</label>
            <select
              id="assetType"
              name="assetType"
              value={formData.assetType}
              onChange={handleInputChange}
              required
            >
              <option value="">请选择资产类型</option>
              <option value="ART">艺术品</option>
              <option value="MUSIC">音乐</option>
              <option value="LITERATURE">文学作品</option>
              <option value="CRAFT">手工艺品</option>
              <option value="HERITAGE">文化遗产</option>
              <option value="OTHER">其他</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="culturalOrigin">文化起源</label>
            <input
              type="text"
              id="culturalOrigin"
              name="culturalOrigin"
              value={formData.culturalOrigin}
              onChange={handleInputChange}
              placeholder="例如：中国、日本、印度等"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="tokenUri">资产URI</label>
            <input
              type="text"
              id="tokenUri"
              name="tokenUri"
              value={formData.tokenUri}
              onChange={handleInputChange}
              placeholder="IPFS或其他存储URI"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="metadataHash">元数据哈希</label>
            <input
              type="text"
              id="metadataHash"
              name="metadataHash"
              value={formData.metadataHash}
              onChange={handleInputChange}
              placeholder="资产元数据的哈希值"
            />
          </div>
          <button 
            type="submit" 
            className="create-button"
            disabled={isCreating}
          >
            {isCreating ? '创建中...' : '创建资产'}
          </button>
        </form>
      </div>
      
      <div className="user-assets">
        <h3>我的资产</h3>
        
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : userAssets.length > 0 ? (
          <div className="assets-list">
            {userAssets.map(assetId => {
              const asset = assetDetails[assetId];
              return asset ? (
                <div key={assetId} className="asset-item">
                  <h4>资产 #{assetId}</h4>
                  <div className="asset-info">
                    <div className="info-item">
                      <span className="label">类型:</span>
                      <span className="value">{asset.assetType}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">文化起源:</span>
                      <span className="value">{asset.culturalOrigin}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">创建时间:</span>
                      <span className="value">
                        {new Date(parseInt(asset.creationTime) * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">验证状态:</span>
                      <span className="value">{asset.isVerified ? '已验证' : '未验证'}</span>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className="no-assets">您还没有创建任何资产</div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AssetManagement;
