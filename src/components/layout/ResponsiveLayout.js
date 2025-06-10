/**
 * 移动端适配与响应式布局优化
 * 用于确保CultureBridge在各种设备上的良好体验
 */

import React, { useState, useEffect } from 'react';
import './ResponsiveLayout.css';

const ResponsiveLayout = ({ children }) => {
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('landscape');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [showSettings, setShowSettings] = useState(false);

  // 检测设备类型和方向
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 576) {
        setDeviceType('mobile');
      } else if (width < 992) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }

      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    // 检测暗色模式
    const detectDarkMode = () => {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDarkMode);
    };

    // 初始检测
    detectDevice();
    detectDarkMode();

    // 监听窗口大小变化
    window.addEventListener('resize', detectDevice);

    // 监听暗色模式变化
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', detectDarkMode);
    } else if (darkModeMediaQuery.addListener) {
      // 兼容旧版浏览器
      darkModeMediaQuery.addListener(detectDarkMode);
    }

    // 清理监听器
    return () => {
      window.removeEventListener('resize', detectDevice);
      if (darkModeMediaQuery.removeEventListener) {
        darkModeMediaQuery.removeEventListener('change', detectDarkMode);
      } else if (darkModeMediaQuery.removeListener) {
        darkModeMediaQuery.removeListener(detectDarkMode);
      }
    };
  }, []);

  // 从本地存储加载用户设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('culturebridge-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
        if (settings.fontSize) setFontSize(settings.fontSize);
      } catch (error) {
        console.error('加载设置错误:', error);
      }
    }
  }, []);

  // 保存设置到本地存储
  const saveSettings = (settings) => {
    try {
      localStorage.setItem('culturebridge-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('保存设置错误:', error);
    }
  };

  // 切换暗色模式
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveSettings({ darkMode: newDarkMode, fontSize });
    
    // 添加或移除暗色模式类
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  // 更改字体大小
  const changeFontSize = (size) => {
    setFontSize(size);
    saveSettings({ darkMode, fontSize: size });
    
    // 更新根元素的字体大小
    const rootFontSize = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'x-large': '20px'
    }[size] || '16px';
    
    document.documentElement.style.fontSize = rootFontSize;
  };

  // 应用暗色模式
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // 应用字体大小
  useEffect(() => {
    const rootFontSize = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'x-large': '20px'
    }[fontSize] || '16px';
    
    document.documentElement.style.fontSize = rootFontSize;
  }, [fontSize]);

  return (
    <div className={`responsive-layout ${deviceType} ${orientation}`}>
      <div className="responsive-content">
        {children}
      </div>
      
      <button 
        className="settings-toggle"
        onClick={() => setShowSettings(!showSettings)}
        aria-label="显示设置"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
        </svg>
      </button>
      
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>显示设置</h3>
            <button 
              className="close-settings"
              onClick={() => setShowSettings(false)}
              aria-label="关闭设置"
            >
              ×
            </button>
          </div>
          
          <div className="settings-content">
            <div className="settings-group">
              <label>主题模式</label>
              <div className="theme-toggle">
                <button 
                  className={`theme-option ${!darkMode ? 'active' : ''}`}
                  onClick={() => darkMode && toggleDarkMode()}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                  </svg>
                  <span>浅色</span>
                </button>
                <button 
                  className={`theme-option ${darkMode ? 'active' : ''}`}
                  onClick={() => !darkMode && toggleDarkMode()}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
                  </svg>
                  <span>深色</span>
                </button>
              </div>
            </div>
            
            <div className="settings-group">
              <label>字体大小</label>
              <div className="font-size-options">
                <button 
                  className={`font-size-option ${fontSize === 'small' ? 'active' : ''}`}
                  onClick={() => changeFontSize('small')}
                >
                  A<span className="size-label">小</span>
                </button>
                <button 
                  className={`font-size-option ${fontSize === 'medium' ? 'active' : ''}`}
                  onClick={() => changeFontSize('medium')}
                >
                  A<span className="size-label">中</span>
                </button>
                <button 
                  className={`font-size-option ${fontSize === 'large' ? 'active' : ''}`}
                  onClick={() => changeFontSize('large')}
                >
                  A<span className="size-label">大</span>
                </button>
                <button 
                  className={`font-size-option ${fontSize === 'x-large' ? 'active' : ''}`}
                  onClick={() => changeFontSize('x-large')}
                >
                  A<span className="size-label">特大</span>
                </button>
              </div>
            </div>
            
            <div className="settings-group">
              <label>当前设备</label>
              <div className="device-info">
                <div className="info-item">
                  <span className="info-label">设备类型:</span>
                  <span className="info-value">{
                    {
                      'mobile': '移动设备',
                      'tablet': '平板设备',
                      'desktop': '桌面设备'
                    }[deviceType] || '未知'
                  }</span>
                </div>
                <div className="info-item">
                  <span className="info-label">屏幕方向:</span>
                  <span className="info-value">{
                    {
                      'landscape': '横向',
                      'portrait': '纵向'
                    }[orientation] || '未知'
                  }</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveLayout;
