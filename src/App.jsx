import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, Space, notification } from 'antd';
import {
  HomeOutlined,
  MessageOutlined,
  BookOutlined,
  WalletOutlined,
  GlobalOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';

// 导入增强组件
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedChatRoom from './components/EnhancedChatRoom';
import LanguageLearning from './components/LanguageLearning';
import WalletConnect, { WalletProvider } from './components/WalletConnect';

import './App.css';

const { Header, Sider, Content } = Layout;

// 模拟用户数据
const mockUser = {
  id: 'user123',
  username: '文化探索者',
  avatar: '/api/placeholder/32/32',
  notifications: 5,
  level: 18,
  cbtBalance: 2847.5
};

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(mockUser);
  const [notifications, setNotifications] = useState([]);

  // 初始化通知
  useEffect(() => {
    // 模拟实时通知
    const notificationInterval = setInterval(() => {
      const randomNotifications = [
        { type: 'message', title: '新消息', description: '来自东京茶道师的消息' },
        { type: 'earning', title: 'CBT收益', description: '您获得了 +15.2 CBT' },
        { type: 'achievement', title: '成就解锁', description: '恭喜解锁"翻译达人"徽章' },
        { type: 'event', title: '文化活动', description: '日本茶道体验即将开始' }
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
  }, []);

  // 菜单项
  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: '实时聊天',
    },
    {
      key: 'learning',
      icon: <BookOutlined />,
      label: '语言学习',
    },
    {
      key: 'wallet',
      icon: <WalletOutlined />,
      label: 'CBT钱包',
    },
    {
      key: 'culture',
      icon: <GlobalOutlined />,
      label: '文化交流',
    },
  ];

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

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
            <h2>文化交流</h2>
            <p>文化交流功能正在开发中...</p>
          </div>
        );
      default:
        return <EnhancedDashboard />;
    }
  };

  return (
    <WalletProvider>
      <Layout style={{ minHeight: '100vh' }}>
        {/* 侧边栏 */}
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          style={{
            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ 
            height: 64, 
            margin: 16, 
            background: 'rgba(255, 255, 255, 0.15)', 
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: collapsed ? 14 : 16,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {collapsed ? 'CB' : 'CultureBridge'}
          </div>
          
          <Menu
            theme="dark"
            defaultSelectedKeys={['dashboard']}
            selectedKeys={[currentPage]}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key)}
            style={{ 
              background: 'transparent',
              border: 'none'
            }}
          />
        </Sider>

        <Layout>
          {/* 顶部导航 */}
          <Header style={{ 
            padding: '0 24px', 
            background: 'linear-gradient(90deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div>
              <h2 style={{ 
                margin: 0, 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {menuItems.find(item => item.key === currentPage)?.label || '首页'}
              </h2>
            </div>
            
            <Space size="large">
              {/* 通知 */}
              <Badge count={user.notifications} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  size="large"
                  style={{ 
                    borderRadius: 8,
                    transition: 'all 0.3s ease'
                  }}
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
                        message: '退出登录',
                        description: '您已安全退出系统',
                        placement: 'topRight',
                      });
                    }
                  }
                }}
                placement="bottomRight"
              >
                <Space style={{ 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 8,
                  transition: 'all 0.3s ease',
                  background: 'rgba(102, 126, 234, 0.05)'
                }}>
                  <Avatar 
                    src={user.avatar} 
                    icon={<UserOutlined />}
                    style={{ 
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user.username}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      Lv.{user.level} • {user.cbtBalance} CBT
                    </div>
                  </div>
                </Space>
              </Dropdown>
            </Space>
          </Header>

          {/* 主要内容区域 */}
          <Content style={{ 
            margin: 0,
            background: '#f5f7fa',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto'
          }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </WalletProvider>
  );
}

export default App;

