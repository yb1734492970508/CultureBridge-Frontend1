import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, Space, notification, Select } from 'antd';
import {
  HomeOutlined,
  MessageOutlined,
  BookOutlined,
  WalletOutlined,
  GlobalOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  TranslationOutlined
} from '@ant-design/icons';

// 导入增强组件
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedChatRoom from './components/EnhancedChatRoom';
import LanguageLearning from './components/LanguageLearning';
import WalletConnect from './components/WalletConnect';

// 导入国际化服务
import { I18nProvider, useI18n } from './services/I18nService';

import './App.css';
import './styles/Global.css'; // 引入新的全局样式
import './ModernCultureBridge.css'; // 引入ModernCultureBridge的特定样式

const { Header, Sider, Content } = Layout;
const { Option } = Select;

// 模拟用户数据
const mockUser = {
  id: 'user123',
  username: '文化探索者',
  avatar: '/api/placeholder/32/32',
  notifications: 5,
  level: 18,
  cbtBalance: 2847.5
};

function ModernCultureBridgeContent() {
  const { t, currentLanguage, changeLanguage, getAvailableLanguages } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(mockUser);
  const [notifications, setNotifications] = useState([]);

  // 初始化通知
  useEffect(() => {
    // 模拟实时通知
    const notificationInterval = setInterval(() => {
      const randomNotifications = [
        { type: 'message', title: t('common.newMessage'), description: t('notifications.messageFromTokyo') },
        { type: 'earning', title: t('wallet.cbtEarning'), description: t('notifications.earnedCBT', { amount: '15.2' }) },
        { type: 'achievement', title: t('notifications.achievementUnlocked'), description: t('notifications.translatorBadge') },
        { type: 'event', title: t('notifications.culturalEvent'), description: t('notifications.teaCeremonyStarting') }
      ];
      
      const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
      
      notification.open({
        message: randomNotification.title,
        description: randomNotification.description,
        placement: 'topRight',
        duration: 4,
      });
    }, 30000); // 每30秒一个通知

    return () => clearInterval(notificationInterval);
  }, [t]);

  // 菜单项
  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: t('navigation.home'),
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: t('navigation.chat'),
    },
    {
      key: 'learning',
      icon: <BookOutlined />,
      label: t('navigation.learning'),
    },
    {
      key: 'wallet',
      icon: <WalletOutlined />,
      label: t('navigation.wallet'),
    },
    {
      key: 'culture',
      icon: <GlobalOutlined />,
      label: t('navigation.community'),
    },
  ];

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('user.profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('user.settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('user.logout'),
    },
  ];

  // 语言选择器
  const LanguageSelector = () => (
    <Select
      value={currentLanguage}
      onChange={changeLanguage}
      style={{ width: 120 }}
      size="small"
      suffixIcon={<TranslationOutlined />}
    >
      {getAvailableLanguages().map(lang => (
        <Option key={lang.code} value={lang.code}>
          <Space>
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </Space>
        </Option>
      ))}
    </Select>
  );

  // 渲染页面内容
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <EnhancedDashboard />;
      case 'chat':
        return (
          <EnhancedChatRoom
            roomId="general"
            userInfo={user}
            onLeaveRoom={() => setCurrentPage('dashboard')}
          />
        );
      case 'learning':
        return <LanguageLearning />;
      case 'wallet':
        return (
          <div style={{ padding: 24 }}>
            <WalletConnect />
          </div>
        );
      case 'culture':
        return (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <h2>{t('navigation.community')}</h2>
            <p>{t('common.comingSoon')}</p>
          </div>
        );
      default:
        return <EnhancedDashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        className="cb-sider"
      >
        <div className="cb-logo-container">
          {collapsed ? 'CB' : 'CultureBridge'}
        </div>
        
        <Menu
          theme="dark"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[currentPage]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key)}
          className="cb-menu"
        />
      </Sider>

      <Layout>
        {/* 顶部导航 */}
        <Header className="cb-header">
          <div>
            <h2 className="cb-header-title">
              {menuItems.find(item => item.key === currentPage)?.label || t('navigation.home')}
            </h2>
          </div>
          
          <Space size="large">
            {/* 语言选择器 */}
            <LanguageSelector />

            {/* 通知 */}
            <Badge count={user.notifications} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                size="large"
                className="cb-header-button"
              />
            </Badge>

            {/* 用户菜单 */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    // 处理退出登录
                    console.log('退出登录');
                    notification.info({
                      message: t('user.logout'),
                      description: t('notifications.logoutSuccess'),
                      placement: 'topRight',
                    });
                  }
                }
              }}
              placement="bottomRight"
            >
              <Space className="cb-user-menu-trigger">
                <Avatar 
                  src={user.avatar} 
                  icon={<UserOutlined />}
                  className="cb-user-avatar"
                />
                <div className="cb-user-info">
                  <div className="cb-username">{user.username}</div>
                  <div className="cb-user-level">Lv.{user.level} • {user.cbtBalance} CBT</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 主要内容区域 */}
        <Content className="cb-content">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

function ModernCultureBridge() {
  return (
    <I18nProvider>
      <ModernCultureBridgeContent />
    </I18nProvider>
  );
}

export default ModernCultureBridge;

