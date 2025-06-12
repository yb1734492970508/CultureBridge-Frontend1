import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LiquidityPool from '../../components/blockchain/LiquidityPool';
import { Web3Provider } from '../../context/Web3Context';
import { DerivativesMarketProvider } from '../../context/blockchain/DerivativesMarketContext';

// 模拟依赖
jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn().mockImplementation(() => ({
      addLiquidity: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(true)
      }),
      removeLiquidity: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(true)
      }),
      swap: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(true)
      }),
      getSwapQuote: jest.fn().mockResolvedValue('1000000000000000000'),
      getUserLiquidity: jest.fn().mockResolvedValue(['1000000000000000000', '2000000000000000000']),
      getSupportedTokenCount: jest.fn().mockResolvedValue('3'),
      supportedTokens: jest.fn().mockImplementation((index) => {
        const tokens = [
          '0x1234567890123456789012345678901234567890',
          '0x2345678901234567890123456789012345678901',
          '0x3456789012345678901234567890123456789012'
        ];
        return tokens[index];
      }),
      pools: jest.fn().mockImplementation((address) => {
        return {
          tokenAddress: address,
          totalLiquidity: '10000000000000000000',
          totalShares: '10000000000000000000',
          feeRate: '300',
          lastUpdateTime: '1623456789',
          isActive: true
        };
      }),
      getActivePairCount: jest.fn().mockResolvedValue('2'),
      activePairs: jest.fn().mockImplementation((index) => {
        const pairs = [
          '0x1234567890123456789012345678901234567890123456789012345678901234',
          '0x2345678901234567890123456789012345678901234567890123456789012345'
        ];
        return pairs[index];
      }),
      getPairInfo: jest.fn().mockResolvedValue([
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901',
        '10000000000000000000',
        '20000000000000000000',
        '200000000000000000000000000000000000'
      ])
    })),
    providers: {
      Web3Provider: jest.fn().mockImplementation(() => ({
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
        })
      }))
    },
    utils: {
      formatEther: jest.fn().mockImplementation((value) => {
        return (Number(value) / 1e18).toString();
      }),
      parseEther: jest.fn().mockImplementation((value) => {
        return (Number(value) * 1e18).toString();
      }),
      formatUnits: jest.fn().mockImplementation((value, units) => {
        return (Number(value) / Math.pow(10, units)).toString();
      }),
      parseUnits: jest.fn().mockImplementation((value, units) => {
        return (Number(value) * Math.pow(10, units)).toString();
      })
    }
  }
}));

jest.mock('../../services/NFTMarketDataService', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getLiquidityPoolStats: jest.fn().mockResolvedValue({
      totalLiquidity: '10000000000000000000',
      totalVolume: '50000000000000000000',
      totalFees: '150000000000000000',
      activePools: 3,
      activePairs: 2,
      userLiquidity: '1000000000000000000'
    }),
    getTokenInfo: jest.fn().mockImplementation((address) => {
      const tokens = {
        '0x1234567890123456789012345678901234567890': {
          name: 'Token A',
          symbol: 'TOKA',
          decimals: 18,
          price: '1.5'
        },
        '0x2345678901234567890123456789012345678901': {
          name: 'Token B',
          symbol: 'TOKB',
          decimals: 18,
          price: '0.75'
        },
        '0x3456789012345678901234567890123456789012': {
          name: 'Token C',
          symbol: 'TOKC',
          decimals: 18,
          price: '2.25'
        }
      };
      return Promise.resolve(tokens[address]);
    }),
    getPairStats: jest.fn().mockResolvedValue({
      volume24h: '1000000000000000000',
      fees24h: '3000000000000000',
      transactions24h: 42,
      priceChange24h: 0.05
    })
  }))
}));

// 模拟上下文
const mockWeb3Context = {
  account: '0x1234567890123456789012345678901234567890',
  chainId: 1,
  connected: true,
  connecting: false,
  library: {},
  connect: jest.fn(),
  disconnect: jest.fn()
};

const mockDerivativesMarketContext = {
  liquidityPoolContract: {},
  loadingLiquidityPool: false,
  liquidityPoolError: null,
  refreshLiquidityPool: jest.fn()
};

// 测试套件
describe('LiquidityPool Component', () => {
  const renderComponent = () => {
    return render(
      <Web3Provider value={mockWeb3Context}>
        <DerivativesMarketProvider value={mockDerivativesMarketContext}>
          <LiquidityPool />
        </DerivativesMarketProvider>
      </Web3Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component correctly', async () => {
    renderComponent();
    
    // 验证标题和主要部分是否渲染
    expect(screen.getByText(/流动性池/i)).toBeInTheDocument();
    
    // 等待异步数据加载
    await waitFor(() => {
      expect(screen.getByText(/总流动性/i)).toBeInTheDocument();
    });
  });

  test('displays tabs correctly', async () => {
    renderComponent();
    
    // 验证标签页是否存在
    await waitFor(() => {
      expect(screen.getByText(/流动性池概览/i)).toBeInTheDocument();
      expect(screen.getByText(/提供流动性/i)).toBeInTheDocument();
      expect(screen.getByText(/交易对/i)).toBeInTheDocument();
      expect(screen.getByText(/跨链流动性/i)).toBeInTheDocument();
    });
  });

  test('handles tab switching', async () => {
    renderComponent();
    
    // 等待组件加载
    await waitFor(() => {
      expect(screen.getByText(/流动性池概览/i)).toBeInTheDocument();
    });
    
    // 切换到提供流动性标签页
    fireEvent.click(screen.getByText(/提供流动性/i));
    await waitFor(() => {
      expect(screen.getByText(/选择代币/i)).toBeInTheDocument();
    });
    
    // 切换到交易对标签页
    fireEvent.click(screen.getByText(/交易对/i));
    await waitFor(() => {
      expect(screen.getByText(/活跃交易对/i)).toBeInTheDocument();
    });
    
    // 切换到跨链流动性标签页
    fireEvent.click(screen.getByText(/跨链流动性/i));
    await waitFor(() => {
      expect(screen.getByText(/跨链流动性管理/i)).toBeInTheDocument();
    });
  });

  test('displays liquidity pool statistics', async () => {
    renderComponent();
    
    // 验证统计数据是否正确显示
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // 总流动性
      expect(screen.getByText('50')).toBeInTheDocument(); // 总交易量
      expect(screen.getByText('0.15')).toBeInTheDocument(); // 总手续费
      expect(screen.getByText('3')).toBeInTheDocument(); // 活跃池数量
      expect(screen.getByText('2')).toBeInTheDocument(); // 活跃交易对数量
    });
  });

  test('handles wallet not connected state', async () => {
    const disconnectedContext = {
      ...mockWeb3Context,
      connected: false,
      account: null
    };
    
    render(
      <Web3Provider value={disconnectedContext}>
        <DerivativesMarketProvider value={mockDerivativesMarketContext}>
          <LiquidityPool />
        </DerivativesMarketProvider>
      </Web3Provider>
    );
    
    // 验证未连接钱包提示
    await waitFor(() => {
      expect(screen.getByText(/请连接钱包/i)).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    const loadingContext = {
      ...mockDerivativesMarketContext,
      loadingLiquidityPool: true
    };
    
    render(
      <Web3Provider value={mockWeb3Context}>
        <DerivativesMarketProvider value={loadingContext}>
          <LiquidityPool />
        </DerivativesMarketProvider>
      </Web3Provider>
    );
    
    // 验证加载状态
    await waitFor(() => {
      expect(screen.getByText(/加载中/i)).toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    const errorContext = {
      ...mockDerivativesMarketContext,
      liquidityPoolError: '加载流动性池数据失败'
    };
    
    render(
      <Web3Provider value={mockWeb3Context}>
        <DerivativesMarketProvider value={errorContext}>
          <LiquidityPool />
        </DerivativesMarketProvider>
      </Web3Provider>
    );
    
    // 验证错误状态
    await waitFor(() => {
      expect(screen.getByText(/加载流动性池数据失败/i)).toBeInTheDocument();
    });
  });
});
