import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, Space } from 'antd';
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

// 导入组件
import ModernDashboard from './components/ModernDashboard';
import ChatRoom from './components/ChatRoom';
import LanguageLearning from './components/LanguageLearning';
import WalletConnect, { WalletProvider } from './components/WalletConnect';

import './App.css';

const { Header, Sider, Content } = Layout;

// 模拟用户数据
const mockUser = {
  id: 'user123',
  username: '文化探索者',
  avatar: '/api/placeholder/32/32',
  notifications: 3
};

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(mockUser);

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
        return <ModernDashboard />;
      case 'chat':
        return (
          <ChatRoom
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
        return <ModernDashboard />;
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
          }}
        >
          <div style={{ 
            height: 64, 
            margin: 16, 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: collapsed ? 14 : 16
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
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ margin: 0, color: '#1890ff' }}>
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
                    }
                  }
                }}
                placement="bottomRight"
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar src={user.avatar} icon={<UserOutlined />} />
                  <span style={{ fontWeight: 500 }}>{user.username}</span>
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

