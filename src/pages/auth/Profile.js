import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth/AuthContext';
import '../../styles/auth/Profile.css';

const Profile = () => {
  const { user, updateProfile, linkWallet, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewUrl, setPreviewUrl] = useState('');

  // 当用户数据加载完成后，更新表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: null
      });
      
      if (user.avatar) {
        setPreviewUrl(user.avatar);
      }
    }
  }, [user]);

  // 如果未登录，显示提示信息
  if (!loading && !isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>请先登录</h2>
          <p>您需要登录才能查看个人资料</p>
          <a href="/login" className="login-link">前往登录</a>
        </div>
      </div>
    );
  }

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理头像上传
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        avatar: file
      });
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 准备更新数据
      const updateData = {
        name: formData.name,
        bio: formData.bio
      };
      
      // 如果有新头像，处理头像上传
      if (formData.avatar) {
        // 在实际应用中，这里应该上传头像到服务器
        // 这里我们简单地将其转换为base64字符串
        const reader = new FileReader();
        const avatarPromise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(formData.avatar);
        });
        
        updateData.avatar = await avatarPromise;
      }
      
      // 更新用户资料
      await updateProfile(updateData);
      
      setIsEditing(false);
      setMessage({ type: 'success', text: '个人资料已更新' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '更新失败，请重试' });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理钱包绑定
  const handleWalletLink = async () => {
    try {
      // 模拟钱包连接
      const mockWalletAddress = '0x' + Math.random().toString(16).substr(2, 40);
      
      await linkWallet(mockWalletAddress);
      
      setMessage({ type: 'success', text: '钱包已成功绑定' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '钱包绑定失败，请重试' });
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>个人资料</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="profile-header">
          <div className="avatar-container">
            {isEditing ? (
              <>
                <div className="avatar-preview" style={{ backgroundImage: `url(${previewUrl || '/images/default-avatar.png'})` }}></div>
                <label htmlFor="avatar" className="avatar-upload-label">
                  更换头像
                  <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="avatar-upload-input"
                  />
                </label>
              </>
            ) : (
              <div className="avatar-display" style={{ backgroundImage: `url(${user.avatar || '/images/default-avatar.png'})` }}></div>
            )}
          </div>
          
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                编辑资料
              </button>
            ) : (
              <button 
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    avatar: null
                  });
                  setPreviewUrl(user.avatar || '');
                }}
              >
                取消
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">姓名</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入您的姓名"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="disabled"
              />
              <span className="field-note">邮箱地址不可更改</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">个人简介</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="请输入您的个人简介"
                rows="4"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="save-button"
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '保存更改'}
            </button>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <h3>姓名</h3>
              <p>{user.name || '未设置'}</p>
            </div>
            
            <div className="info-group">
              <h3>邮箱</h3>
              <p>{user.email}</p>
            </div>
            
            <div className="info-group">
              <h3>个人简介</h3>
              <p>{user.bio || '未设置个人简介'}</p>
            </div>
            
            <div className="info-group">
              <h3>钱包地址</h3>
              {user.walletAddress ? (
                <p className="wallet-address">{user.walletAddress}</p>
              ) : (
                <div className="wallet-link">
                  <p>未绑定钱包</p>
                  <button 
                    className="link-wallet-button"
                    onClick={handleWalletLink}
                  >
                    绑定钱包
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
