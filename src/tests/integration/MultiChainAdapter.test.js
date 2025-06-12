import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ethers } from 'ethers';
import MultiChainAdapter from '../../components/blockchain/MultiChainAdapter';
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

// 模拟集成测试环境
describe('MultiChainAdapter Integration Tests', () => {
  // 模拟Web3上下文
  const mockWeb3Context = {
    provider: new ethers.providers.JsonRpcProvider(),
    account: '0x1234567890123456789012345678901234567890',
    chainId: 1,
    isConnected: true,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn()
  };

  // 模拟通知上下文
  const mockNotificationContext = {
    addNotification: jest.fn(),
    notifications: [],
    clearNotifications: jest.fn()
  };

  // 模拟合约地址
  const mockAdapterAddress = '0x2345678901234567890123456789012345678901';

  // 测试前准备
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 测试组件渲染和基本功能
  test('renders and initializes correctly', async () => {
    await act(async () => {
      render(
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <MultiChainAdapter adapterAddress={mockAdapterAddress} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      );
    });

    // 验证组件标题渲染
    expect(screen.getByText(/跨链适配器/i)).toBeInTheDocument();
    
    // 验证标签页渲染
    expect(screen.getByText(/资产管理/i)).toBeInTheDocument();
    expect(screen.getByText(/交易历史/i)).toBeInTheDocument();
    expect(screen.getByText(/消息传递/i)).toBeInTheDocument();
  });

  // 测试跨链资产转移功能
  test('asset transfer form validation works correctly', async () => {
    await act(async () => {
      render(
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <MultiChainAdapter adapterAddress={mockAdapterAddress} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      );
    });

    // 查找发起跨链交易按钮
    const transferButton = screen.getByText(/发起跨链交易/i);
    
    // 按钮应该被禁用，因为表单未填写完整
    expect(transferButton).toBeDisabled();
    
    // 模拟填写表单
    // 注意：由于我们使用了模拟的antd组件，这里的测试可能需要根据实际实现调整
    await act(async () => {
      // 填写目标链
      const targetChainSelect = screen.getAllByTestId('mock-select')[1];
      fireEvent.change(targetChainSelect, { target: { value: '137' } });
      
      // 填写资产
      const assetSelect = screen.getAllByTestId('mock-select')[2];
      fireEvent.change(assetSelect, { target: { value: '0x1234567890123456789012345678901234567890' } });
      
      // 填写接收地址
      const recipientInput = screen.getAllByTestId('mock-input')[0];
      fireEvent.change(recipientInput, { target: { value: '0x9876543210987654321098765432109876543210' } });
      
      // 填写金额
      const amountInput = screen.getAllByTestId('mock-input')[1];
      fireEvent.change(amountInput, { target: { value: '10' } });
    });
    
    // 按钮应该被启用，因为表单已填写完整
    await waitFor(() => {
      expect(transferButton).not.toBeDisabled();
    });
  });

  // 测试跨链消息功能
  test('message sending form validation works correctly', async () => {
    await act(async () => {
      render(
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <MultiChainAdapter adapterAddress={mockAdapterAddress} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      );
    });

    // 切换到消息传递标签页
    await act(async () => {
      fireEvent.click(screen.getByText(/消息传递/i));
    });

    // 查找发送跨链消息按钮
    const messageButton = screen.getByText(/发送跨链消息/i);
    
    // 按钮应该被禁用，因为表单未填写完整
    expect(messageButton).toBeDisabled();
    
    // 模拟填写表单
    await act(async () => {
      // 填写目标链
      const targetChainSelect = screen.getAllByTestId('mock-select')[3];
      fireEvent.change(targetChainSelect, { target: { value: '137' } });
      
      // 填写接收地址
      const recipientInput = screen.getAllByTestId('mock-input')[2];
      fireEvent.change(recipientInput, { target: { value: '0x9876543210987654321098765432109876543210' } });
      
      // 填写消息内容
      const messageInput = screen.getAllByTestId('mock-input')[3];
      fireEvent.change(messageInput, { target: { value: 'Hello, cross-chain world!' } });
    });
    
    // 按钮应该被启用，因为表单已填写完整
    await waitFor(() => {
      expect(messageButton).not.toBeDisabled();
    });
  });

  // 测试交易历史和消息历史的加载
  test('transaction and message history loads correctly', async () => {
    await act(async () => {
      render(
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <MultiChainAdapter adapterAddress={mockAdapterAddress} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      );
    });

    // 切换到交易历史标签页
    await act(async () => {
      fireEvent.click(screen.getByText(/交易历史/i));
    });

    // 验证交易历史表格渲染
    expect(screen.getByText(/跨链交易历史/i)).toBeInTheDocument();
    
    // 切换到消息传递标签页
    await act(async () => {
      fireEvent.click(screen.getByText(/消息传递/i));
    });

    // 验证消息历史表格渲染
    expect(screen.getByText(/消息历史/i)).toBeInTheDocument();
  });

  // 测试刷新功能
  test('refresh button works correctly', async () => {
    await act(async () => {
      render(
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <MultiChainAdapter adapterAddress={mockAdapterAddress} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      );
    });

    // 查找刷新按钮
    const refreshButton = screen.getByText(/刷新/i);
    
    // 点击刷新按钮
    await act(async () => {
      fireEvent.click(refreshButton);
    });
    
    // 验证刷新状态
    expect(refreshButton).toBeDisabled();
    
    // 等待刷新完成
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    }, { timeout: 2000 });
  });

  // 测试钱包未连接状态
  test('shows connect wallet message when wallet is not connected', async () => {
    await act(async () => {
      render(
        <Web3Context.Provider value={{ ...mockWeb3Context, isConnected: false }}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <MultiChainAdapter adapterAddress={mockAdapterAddress} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      );
    });

    // 验证显示连接钱包提示
    expect(screen.getByText(/请连接钱包/i)).toBeInTheDocument();
    expect(screen.getByText(/请连接钱包以使用跨链适配器功能/i)).toBeInTheDocument();
  });

  // 测试响应式设计
  test('responsive design works correctly', async () => {
    // 模拟移动设备视口
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    await act(async () => {
      render(
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <MultiChainAdapter adapterAddress={mockAdapterAddress} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      );
    });

    // 验证组件在移动设备上正确渲染
    expect(screen.getByText(/跨链适配器/i)).toBeInTheDocument();

    // 恢复视口大小
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });
});
