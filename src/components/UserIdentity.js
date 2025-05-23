import React, { useState, useEffect } from 'react';
import web3Service from '../services/web3Service';

/**
 * 用户身份组件
 * 提供用户注册、信息查询和资料更新功能
 */
const UserIdentity = ({ account }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileUri: ''
  });

  // 当账户变化时加载用户信息
  useEffect(() => {
    if (account) {
      loadUserInfo();
    } else {
      setUserInfo(null);
    }
  }, [account]);

  // 加载用户信息
  const loadUserInfo = async () => {
    if (!account) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const info = await web3Service.getUserInfo();
      setUserInfo(info);
      
      // 如果用户已注册，预填表单数据
      if (info && info.userId !== '0') {
        setFormData({
          name: info.name,
          email: info.email,
          profileUri: info.profileUri
        });
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
      setError('获取用户信息失败，请稍后再试');
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

  // 注册用户
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError('请先连接钱包');
      return;
    }
    
    setIsRegistering(true);
    setError(null);
    
    try {
      await web3Service.registerUser(
        formData.name,
        formData.email,
        formData.profileUri
      );
      
      // 注册成功后重新加载用户信息
      await loadUserInfo();
    } catch (err) {
      console.error('用户注册失败:', err);
      setError('用户注册失败，请稍后再试');
    } finally {
      setIsRegistering(false);
    }
  };

  // 更新用户资料
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError('请先连接钱包');
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await web3Service.updateProfile(
        formData.name,
        formData.email,
        formData.profileUri
      );
      
      // 更新成功后重新加载用户信息
      await loadUserInfo();
    } catch (err) {
      console.error('更新用户资料失败:', err);
      setError('更新用户资料失败，请稍后再试');
    } finally {
      setIsUpdating(false);
    }
  };

  // 如果未连接钱包，显示提示信息
  if (!account) {
    return (
      <div className="user-identity">
        <div className="notice">请先连接钱包以管理您的身份信息</div>
      </div>
    );
  }

  return (
    <div className="user-identity">
      <h2>用户身份</h2>
      
      {isLoading ? (
        <div className="loading">加载中...</div>
      ) : userInfo && userInfo.userId !== '0' ? (
        <div className="user-info">
          <h3>当前身份信息</h3>
          <div className="info-item">
            <span className="label">用户ID:</span>
            <span className="value">{userInfo.userId}</span>
          </div>
          <div className="info-item">
            <span className="label">用户名:</span>
            <span className="value">{userInfo.name}</span>
          </div>
          <div className="info-item">
            <span className="label">邮箱:</span>
            <span className="value">{userInfo.email}</span>
          </div>
          <div className="info-item">
            <span className="label">资料URI:</span>
            <span className="value">{userInfo.profileUri}</span>
          </div>
          <div className="info-item">
            <span className="label">验证状态:</span>
            <span className="value">{userInfo.isVerified ? '已验证' : '未验证'}</span>
          </div>
          
          <h3>更新资料</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="name">用户名</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="profileUri">资料URI</label>
              <input
                type="text"
                id="profileUri"
                name="profileUri"
                value={formData.profileUri}
                onChange={handleInputChange}
                placeholder="IPFS或其他存储URI"
              />
            </div>
            <button 
              type="submit" 
              className="update-button"
              disabled={isUpdating}
            >
              {isUpdating ? '更新中...' : '更新资料'}
            </button>
          </form>
        </div>
      ) : (
        <div className="register-form">
          <h3>注册新用户</h3>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="name">用户名</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="profileUri">资料URI</label>
              <input
                type="text"
                id="profileUri"
                name="profileUri"
                value={formData.profileUri}
                onChange={handleInputChange}
                placeholder="IPFS或其他存储URI"
              />
            </div>
            <button 
              type="submit" 
              className="register-button"
              disabled={isRegistering}
            >
              {isRegistering ? '注册中...' : '注册'}
            </button>
          </form>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default UserIdentity;
