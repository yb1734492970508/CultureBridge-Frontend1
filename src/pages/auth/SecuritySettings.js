import React, { useState } from 'react';
import { useAuth } from '../../context/auth/AuthContext';
import '../../styles/auth/SecuritySettings.css';

const SecuritySettings = () => {
  const { user, updateProfile, logout } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    
    // 验证当前密码
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = '请输入当前密码';
    }
    
    // 验证新密码
    if (!passwordData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = '密码长度至少为6个字符';
    }
    
    // 验证确认密码
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理密码修改
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 验证当前密码（实际应用中应由后端验证）
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find(u => u.id === user.id);
      
      if (!currentUser || currentUser.password !== passwordData.currentPassword) {
        throw new Error('当前密码不正确');
      }
      
      // 更新密码
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, password: passwordData.newPassword } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // 清空表单
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({ type: 'success', text: '密码已成功修改' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '密码修改失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理账号注销
  const handleAccountDeactivation = async () => {
    if (window.confirm('您确定要注销账号吗？此操作不可逆。')) {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 从用户列表中移除
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.filter(u => u.id !== user.id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // 登出
        logout();
        
        // 跳转到首页
        window.location.href = '/';
      } catch (error) {
        setMessage({ type: 'error', text: error.message || '账号注销失败，请重试' });
      }
    }
  };

  return (
    <div className="security-settings-container">
      <div className="security-settings-card">
        <h2>安全设置</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="settings-section">
          <h3>修改密码</h3>
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">当前密码</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                placeholder="请输入当前密码"
                className={errors.currentPassword ? 'error' : ''}
              />
              {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">新密码</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                placeholder="请输入新密码（至少6个字符）"
                className={errors.newPassword ? 'error' : ''}
              />
              {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">确认新密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                placeholder="请再次输入新密码"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
            
            <button 
              type="submit" 
              className="change-password-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '提交中...' : '修改密码'}
            </button>
          </form>
        </div>
        
        <div className="settings-section">
          <h3>登录设备</h3>
          <div className="devices-list">
            <div className="device-item">
              <div className="device-info">
                <span className="device-name">当前设备</span>
                <span className="device-details">上次登录: {new Date().toLocaleString()}</span>
              </div>
              <button className="device-action current">当前会话</button>
            </div>
          </div>
        </div>
        
        <div className="settings-section danger-zone">
          <h3>危险操作</h3>
          <div className="danger-action">
            <div className="danger-info">
              <h4>注销账号</h4>
              <p>此操作将永久删除您的账号和所有相关数据，且不可恢复。</p>
            </div>
            <button 
              className="deactivate-button"
              onClick={handleAccountDeactivation}
            >
              注销账号
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
