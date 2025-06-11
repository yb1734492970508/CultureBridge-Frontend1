import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import NFTMarketAnalytics from '../../components/blockchain/NFTMarketAnalytics';
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

// 模拟合约
const mockDerivativesContract = {
  getDerivativeCount: jest.fn().mockResolvedValue(36)
};

const mockLendingContract = {
  getLoanCount: jest.fn().mockResolvedValue(22)
};

const mockPriceOracleContract = {
  getCollectionPriceData: jest.fn().mockResolvedValue({
    floorPrice: ethers.utils.parseEther('0.85'),
    averagePrice: ethers.utils.parseEther('1.25'),
    volumeETH: ethers.utils.parseEther('1250.75'),
    updateTimestamp: { toNumber: () => Math.floor(Date.now() / 1000) }
  })
};

// 模拟Web3Provider
function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

// 模拟Web3Context
const mockWeb3Context = {
  isConnected: true,
  account: '0x1234567890123456789012345678901234567890',
  chainId: 1
};

// 模拟NotificationContext
const mockNotificationContext = {
  addNotification: jest.fn()
};

describe('NFTMarketAnalytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component correctly when connected', async () => {
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTMarketAnalytics
              derivativesContract={mockDerivativesContract}
              lendingContract={mockLendingContract}
              priceOracleContract={mockPriceOracleContract}
            />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    // 检查标题是否正确渲染
    expect(screen.getByText('NFT市场数据分析')).toBeInTheDocument();
    
    // 检查控件是否正确渲染
    expect(screen.getByText('选择NFT集合')).toBeInTheDocument();
    expect(screen.getByText('时间范围')).toBeInTheDocument();
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('价格趋势')).toBeInTheDocument();
    });
  });

  test('shows warning when not connected', () => {
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={{ ...mockWeb3Context, isConnected: false }}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTMarketAnalytics
              derivativesContract={mockDerivativesContract}
              lendingContract={mockLendingContract}
              priceOracleContract={mockPriceOracleContract}
            />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    expect(screen.getByText('请连接钱包以使用NFT市场数据分析功能。')).toBeInTheDocument();
  });

  test('changes tab correctly', async () => {
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTMarketAnalytics
              derivativesContract={mockDerivativesContract}
              lendingContract={mockLendingContract}
              priceOracleContract={mockPriceOracleContract}
            />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('价格趋势')).toBeInTheDocument();
    });

    // 切换到交易量标签
    fireEvent.click(screen.getByText('交易量'));
    expect(screen.getByText('交易量')).toBeInTheDocument();

    // 切换到流动性标签
    fireEvent.click(screen.getByText('流动性'));
    expect(screen.getByText('市场流动性')).toBeInTheDocument();

    // 切换到衍生品标签
    fireEvent.click(screen.getByText('衍生品'));
    expect(screen.getByText('衍生品市场')).toBeInTheDocument();

    // 切换到借贷标签
    fireEvent.click(screen.getByText('借贷'));
    expect(screen.getByText('借贷市场')).toBeInTheDocument();

    // 切换到用户活动标签
    fireEvent.click(screen.getByText('用户活动'));
    expect(screen.getByText('用户活动')).toBeInTheDocument();
  });

  test('changes time range correctly', async () => {
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTMarketAnalytics
              derivativesContract={mockDerivativesContract}
              lendingContract={mockLendingContract}
              priceOracleContract={mockPriceOracleContract}
            />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('价格趋势')).toBeInTheDocument();
    });

    // 选择时间范围
    fireEvent.change(screen.getByLabelText('时间范围'), { target: { value: '7d' } });
    
    // 验证时间范围已更改
    await waitFor(() => {
      expect(screen.getByText('价格趋势 (7d)')).toBeInTheDocument();
    });
  });

  test('exports data correctly', async () => {
    const mockExport = jest.fn();
    
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTMarketAnalytics
              derivativesContract={mockDerivativesContract}
              lendingContract={mockLendingContract}
              priceOracleContract={mockPriceOracleContract}
              onExport={mockExport}
            />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('价格趋势')).toBeInTheDocument();
    });

    // 模拟URL.createObjectURL和document.createElement
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    const mockLink = {
      setAttribute: jest.fn(),
      style: {},
      click: jest.fn()
    };
    document.createElement = jest.fn().mockReturnValue(mockLink);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    // 点击导出按钮
    fireEvent.click(screen.getByText('导出数据'));
    
    // 验证导出函数被调用
    expect(mockNotificationContext.addNotification).toHaveBeenCalled();
  });

  test('handles collection change correctly', async () => {
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={mockWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTMarketAnalytics
              derivativesContract={mockDerivativesContract}
              lendingContract={mockLendingContract}
              priceOracleContract={mockPriceOracleContract}
            />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('价格趋势')).toBeInTheDocument();
    });

    // 选择不同的集合
    fireEvent.change(screen.getByLabelText('选择NFT集合'), { target: { value: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef' } });
    
    // 验证数据重新加载
    await waitFor(() => {
      expect(screen.getByText('价格趋势')).toBeInTheDocument();
    });
  });
});
