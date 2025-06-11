import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3Context } from '../../../context/Web3Context';
import { NotificationContext } from '../../../context/NotificationContext';
import MultiChainAdapter from '../../../components/blockchain/MultiChainAdapter';
import { ethers } from 'ethers';

// 模拟上下文
const mockWeb3Context = {
  provider: {
    getSigner: jest.fn().mockReturnValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    })
  },
  account: '0x1234567890123456789012345678901234567890',
  chainId: 1,
  isConnected: true
};

const mockNotificationContext = {
  addNotification: jest.fn()
};

// 模拟合约
const mockContract = {
  getSupportedChains: jest.fn().mockResolvedValue([1, 137]),
  chainIdToName: jest.fn().mockImplementation((id) => {
    if (id.toNumber() === 1) return Promise.resolve('Ethereum');
    if (id.toNumber() === 137) return Promise.resolve('Polygon');
    return Promise.resolve('Unknown');
  }),
  initiateTransaction: jest.fn().mockResolvedValue({
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    wait: jest.fn().mockResolvedValue({})
  }),
  sendMessage: jest.fn().mockResolvedValue({
    hash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    wait: jest.fn().mockResolvedValue({})
  })
};

// 模拟ethers库
jest.mock('ethers', () => {
  const originalEthers = jest.requireActual('ethers');
  return {
    ...originalEthers,
    Contract: jest.fn().mockImplementation(() => mockContract),
    utils: {
      ...originalEthers.utils,
      parseEther: jest.fn().mockImplementation(value => value + '000000000000000000'),
      formatEther: jest.fn().mockImplementation(value => value.toString().replace('000000000000000000', '')),
      isAddress: jest.fn().mockImplementation(address => address.startsWith('0x') && address.length === 42),
      toUtf8Bytes: jest.fn().mockImplementation(text => Buffer.from(text)),
      hexlify: jest.fn().mockImplementation(bytes => '0x' + Buffer.from(bytes).toString('hex')),
      id: jest.fn().mockImplementation(text => '0x' + Buffer.from(text).toString('hex').padStart(64, '0'))
    }
  };
});

// 模拟antd组件
jest.mock('antd', () => {
  const originalAntd = jest.requireActual('antd');
  return {
    ...originalAntd,
    Card: ({ children, title, extra }) => (
      <div data-testid="mock-card">
        {title && <div data-testid="mock-card-title">{title}</div>}
        {extra && <div data-testid="mock-card-extra">{extra}</div>}
        {children}
      </div>
    ),
    Button: ({ children, onClick, type, loading, disabled, icon }) => (
      <button 
        data-testid={`mock-button-${type || 'default'}`} 
        onClick={onClick} 
        disabled={loading || disabled}
      >
        {icon && <span data-testid="mock-icon"></span>}
        {children}
      </button>
    ),
    Form: {
      Item: ({ children, label }) => (
        <div data-testid="mock-form-item">
          {label && <label>{label}</label>}
          {children}
        </div>
      )
    },
    Select: ({ children, placeholder, value, onChange, disabled }) => (
      <select 
        data-testid="mock-select" 
        value={value || ''} 
        onChange={e => onChange && onChange(e.target.value)}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    ),
    Input: ({ placeholder, value, onChange, disabled, type }) => (
      <input 
        data-testid="mock-input" 
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange && onChange(e)}
        disabled={disabled}
        type={type || 'text'}
      />
    ),
    Table: ({ dataSource, columns }) => (
      <div data-testid="mock-table">
        <span>Rows: {dataSource?.length || 0}</span>
        <span>Columns: {columns?.length || 0}</span>
      </div>
    ),
    Tabs: ({ children, activeKey, onChange }) => (
      <div data-testid="mock-tabs">
        <div data-testid="mock-tabs-nav">
          {React.Children.map(children, child => (
            <button 
              key={child.key} 
              onClick={() => onChange && onChange(child.key)}
              data-active={activeKey === child.key}
            >
              {child.props.tab}
            </button>
          ))}
        </div>
        <div data-testid="mock-tabs-content">
          {React.Children.toArray(children).find(child => child.key === activeKey)}
        </div>
      </div>
    ),
    Alert: ({ message, description, type, showIcon }) => (
      <div data-testid={`mock-alert-${type}`}>
        {showIcon && <span data-testid="mock-alert-icon"></span>}
        <h4>{message}</h4>
        <p>{description}</p>
      </div>
    ),
    Badge: ({ status, text, count, children }) => (
      <span data-testid={`mock-badge-${status || 'count'}`}>
        {children}
        {text && <span>{text}</span>}
        {count !== undefined && <span>{count}</span>}
      </span>
    ),
    Modal: ({ title, visible, onCancel, footer, children }) => (
      visible ? (
        <div data-testid="mock-modal">
          <div data-testid="mock-modal-title">{title}</div>
          <div data-testid="mock-modal-content">{children}</div>
          <div data-testid="mock-modal-footer">{footer}</div>
          <button data-testid="mock-modal-close" onClick={onCancel}>Close</button>
        </div>
      ) : null
    ),
    Tooltip: ({ title, children }) => (
      <div data-testid="mock-tooltip" title={title}>
        {children}
      </div>
    )
  };
});

// 模拟antd图标
jest.mock('@ant-design/icons', () => ({
  SwapOutlined: () => <span data-testid="mock-icon-swap">SwapIcon</span>,
  LinkOutlined: () => <span data-testid="mock-icon-link">LinkIcon</span>,
  CheckCircleOutlined: () => <span data-testid="mock-icon-check">CheckIcon</span>,
  CloseCircleOutlined: () => <span data-testid="mock-icon-close">CloseIcon</span>,
  LoadingOutlined: () => <span data-testid="mock-icon-loading">LoadingIcon</span>,
  InfoCircleOutlined: () => <span data-testid="mock-icon-info">InfoIcon</span>
}));

describe('MultiChainAdapter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Web3Context.Provider value={mockWeb3Context}>
        <NotificationContext.Provider value={mockNotificationContext}>
          <MultiChainAdapter adapterAddress="0xadapter" />
        </NotificationContext.Provider>
      </Web3Context.Provider>
    );
  };

  test('renders correctly when wallet is connected', async () => {
    renderComponent();
    
    // 检查标题是否正确渲染
    expect(screen.getByText('跨链适配器')).toBeInTheDocument();
    
    // 检查标签页是否正确渲染
    expect(screen.getByText('资产管理')).toBeInTheDocument();
    expect(screen.getByText('交易历史')).toBeInTheDocument();
    expect(screen.getByText('消息传递')).toBeInTheDocument();
    
    // 检查表单是否正确渲染
    expect(screen.getByText('源链')).toBeInTheDocument();
    expect(screen.getByText('目标链')).toBeInTheDocument();
    expect(screen.getByText('资产')).toBeInTheDocument();
    expect(screen.getByText('接收地址')).toBeInTheDocument();
    expect(screen.getByText('金额')).toBeInTheDocument();
    
    // 检查按钮是否正确渲染
    expect(screen.getByText('发起跨链交易')).toBeInTheDocument();
  });

  test('renders alert when wallet is not connected', () => {
    render(
      <Web3Context.Provider value={{ ...mockWeb3Context, isConnected: false }}>
        <NotificationContext.Provider value={mockNotificationContext}>
          <MultiChainAdapter adapterAddress="0xadapter" />
        </NotificationContext.Provider>
      </Web3Context.Provider>
    );
    
    expect(screen.getByText('请连接钱包')).toBeInTheDocument();
    expect(screen.getByText('请连接钱包以使用跨链适配器功能。')).toBeInTheDocument();
  });

  test('initializes contract and loads supported chains', async () => {
    renderComponent();
    
    // 验证合约初始化
    expect(ethers.Contract).toHaveBeenCalledWith(
      '0xadapter',
      expect.any(Array),
      expect.any(Object)
    );
    
    // 验证加载支持的链
    await waitFor(() => {
      expect(mockContract.getSupportedChains).toHaveBeenCalled();
    });
  });

  test('handles tab switching', async () => {
    renderComponent();
    
    // 默认显示资产管理标签页
    expect(screen.getByText('跨链资产转移')).toBeInTheDocument();
    
    // 切换到交易历史标签页
    fireEvent.click(screen.getByText('交易历史'));
    expect(screen.getByText('跨链交易历史')).toBeInTheDocument();
    
    // 切换到消息传递标签页
    fireEvent.click(screen.getByText('消息传递'));
    expect(screen.getByText('跨链消息')).toBeInTheDocument();
  });

  test('handles form input changes', async () => {
    renderComponent();
    
    // 等待链数据加载
    await waitFor(() => {
      expect(mockContract.getSupportedChains).toHaveBeenCalled();
    });
    
    // 模拟选择目标链
    const targetChainSelect = screen.getAllByTestId('mock-select')[1];
    fireEvent.change(targetChainSelect, { target: { value: '137' } });
    
    // 模拟输入接收地址
    const recipientInput = screen.getAllByTestId('mock-input')[0];
    fireEvent.change(recipientInput, { target: { value: '0x9876543210987654321098765432109876543210' } });
    
    // 模拟输入金额
    const amountInput = screen.getAllByTestId('mock-input')[1];
    fireEvent.change(amountInput, { target: { value: '10' } });
  });

  test('handles transaction initiation', async () => {
    renderComponent();
    
    // 等待链数据加载
    await waitFor(() => {
      expect(mockContract.getSupportedChains).toHaveBeenCalled();
    });
    
    // 模拟选择目标链
    const targetChainSelect = screen.getAllByTestId('mock-select')[1];
    fireEvent.change(targetChainSelect, { target: { value: '137' } });
    
    // 模拟选择资产
    const assetSelect = screen.getAllByTestId('mock-select')[2];
    fireEvent.change(assetSelect, { target: { value: '0x1234567890123456789012345678901234567890' } });
    
    // 模拟输入接收地址
    const recipientInput = screen.getAllByTestId('mock-input')[0];
    fireEvent.change(recipientInput, { target: { value: '0x9876543210987654321098765432109876543210' } });
    
    // 模拟输入金额
    const amountInput = screen.getAllByTestId('mock-input')[1];
    fireEvent.change(amountInput, { target: { value: '10' } });
    
    // 点击发起交易按钮
    const transactionButton = screen.getByText('发起跨链交易');
    fireEvent.click(transactionButton);
    
    // 验证合约调用
    await waitFor(() => {
      expect(mockContract.initiateTransaction).toHaveBeenCalledWith(
        '137',
        '0x1234567890123456789012345678901234567890',
        '0x9876543210987654321098765432109876543210',
        '10000000000000000000'
      );
    });
    
    // 验证通知
    expect(mockNotificationContext.addNotification).toHaveBeenCalledWith(
      'info',
      '交易已提交',
      '跨链交易已提交，等待确认...'
    );
    
    // 验证交易确认后的通知
    await waitFor(() => {
      expect(mockNotificationContext.addNotification).toHaveBeenCalledWith(
        'success',
        '交易已确认',
        '跨链交易已成功发起，等待跨链处理'
      );
    });
  });

  test('handles message sending', async () => {
    renderComponent();
    
    // 切换到消息传递标签页
    fireEvent.click(screen.getByText('消息传递'));
    
    // 等待链数据加载
    await waitFor(() => {
      expect(mockContract.getSupportedChains).toHaveBeenCalled();
    });
    
    // 模拟选择目标链
    const targetChainSelect = screen.getAllByTestId('mock-select')[3]; // 消息标签页中的目标链选择器
    fireEvent.change(targetChainSelect, { target: { value: '137' } });
    
    // 模拟输入接收地址
    const recipientInput = screen.getAllByTestId('mock-input')[2]; // 消息标签页中的接收地址输入框
    fireEvent.change(recipientInput, { target: { value: '0x9876543210987654321098765432109876543210' } });
    
    // 模拟输入消息内容
    const messageInput = screen.getAllByTestId('mock-input')[3]; // 消息标签页中的消息内容输入框
    fireEvent.change(messageInput, { target: { value: 'Hello, cross-chain world!' } });
    
    // 点击发送消息按钮
    const messageButton = screen.getByText('发送跨链消息');
    fireEvent.click(messageButton);
    
    // 验证合约调用
    await waitFor(() => {
      expect(mockContract.sendMessage).toHaveBeenCalled();
    });
    
    // 验证通知
    expect(mockNotificationContext.addNotification).toHaveBeenCalledWith(
      'info',
      '消息已提交',
      '跨链消息已提交，等待确认...'
    );
    
    // 验证消息确认后的通知
    await waitFor(() => {
      expect(mockNotificationContext.addNotification).toHaveBeenCalledWith(
        'success',
        '消息已确认',
        '跨链消息已成功发送，等待跨链处理'
      );
    });
  });

  test('handles refresh button click', async () => {
    renderComponent();
    
    // 切换到交易历史标签页
    fireEvent.click(screen.getByText('交易历史'));
    
    // 点击刷新按钮
    const refreshButton = screen.getByText('刷新');
    fireEvent.click(refreshButton);
    
    // 验证刷新状态
    expect(refreshButton).toBeDisabled();
    
    // 等待刷新完成
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    }, { timeout: 2000 });
  });
});
