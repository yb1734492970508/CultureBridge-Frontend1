import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import NFTDerivatives from '../../components/blockchain/NFTDerivatives';
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

// Mock providers
const mockWeb3Context = {
  account: '0x1234567890123456789012345678901234567890',
  library: {},
  isConnected: true,
  connect: jest.fn(),
  disconnect: jest.fn()
};

const mockNotificationContext = {
  addNotification: jest.fn()
};

// Mock contracts
const mockDerivativesContract = {
  getUserDerivativesAsCreator: jest.fn().mockResolvedValue([ethers.BigNumber.from('0')]),
  getUserDerivativesAsBuyer: jest.fn().mockResolvedValue([]),
  derivatives: jest.fn().mockResolvedValue({
    creator: '0x1234567890123456789012345678901234567890',
    buyer: ethers.constants.AddressZero,
    derivType: 0, // CALL_OPTION
    nftContract: '0x1234567890123456789012345678901234567890',
    tokenId: ethers.BigNumber.from('1'),
    indexNFTContracts: [],
    indexTokenIds: [],
    indexWeights: [],
    strikePrice: ethers.utils.parseEther('0.5'),
    premium: ethers.utils.parseEther('0.05'),
    collateral: ethers.constants.Zero,
    expirationTime: ethers.BigNumber.from(Math.floor(Date.now() / 1000) + 86400), // 1 day from now
    settlementPrice: ethers.constants.Zero,
    status: 0, // ACTIVE
    paymentToken: ethers.constants.AddressZero
  }),
  getDerivativeCount: jest.fn().mockResolvedValue(ethers.BigNumber.from('1')),
  createCallOption: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  createPutOption: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  createFuture: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  purchaseDerivative: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  exerciseCallOption: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  exercisePutOption: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  settleFuture: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  cancelDerivative: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  })
};

const mockPriceOracle = {
  getNFTLatestPrice: jest.fn().mockResolvedValue([
    ethers.utils.parseEther('1.5'), // price
    ethers.BigNumber.from(Math.floor(Date.now() / 1000)), // timestamp
    ethers.BigNumber.from('8000') // confidence 80%
  ])
};

// Mock getLibrary function for Web3ReactProvider
function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

// Test wrapper component
function TestWrapper({ children }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3Context.Provider value={mockWeb3Context}>
        <NotificationContext.Provider value={mockNotificationContext}>
          {children}
        </NotificationContext.Provider>
      </Web3Context.Provider>
    </Web3ReactProvider>
  );
}

describe('NFTDerivatives Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component title and description', () => {
    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('NFT衍生品市场')).toBeInTheDocument();
    expect(screen.getByText(/创建、交易和管理NFT期权、期货和指数等金融工具/)).toBeInTheDocument();
  });

  test('displays wallet not connected message when not connected', () => {
    const disconnectedWeb3Context = { ...mockWeb3Context, isConnected: false };
    
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={disconnectedWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    expect(screen.getByText('请连接钱包以使用NFT衍生品市场。')).toBeInTheDocument();
  });

  test('loads user NFTs and derivatives when connected', async () => {
    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('我的NFT')).toBeInTheDocument();
    });

    expect(screen.getByText('市场')).toBeInTheDocument();
    expect(screen.getByText('我的衍生品')).toBeInTheDocument();
  });

  test('shows tabs and switches between them', async () => {
    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('市场')).toBeInTheDocument();
    });

    expect(screen.getByText('我的衍生品')).toBeInTheDocument();

    fireEvent.click(screen.getByText('我的衍生品'));
    expect(screen.getByText('我的衍生品')).toHaveClass('active');
  });

  test('opens create derivative modal when NFT card is clicked', async () => {
    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const nftCards = screen.getAllByText(/数字艺术品/);
      if (nftCards.length > 0) {
        fireEvent.click(nftCards[0]);
        expect(screen.getByText(/创建NFT衍生品/)).toBeInTheDocument();
      }
    });
  });

  test('opens create derivative dropdown menu', async () => {
    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const createButton = screen.getByText(/创建衍生品/);
      fireEvent.click(createButton);
      expect(screen.getByText('看涨期权')).toBeInTheDocument();
      expect(screen.getByText('看跌期权')).toBeInTheDocument();
      expect(screen.getByText('期货')).toBeInTheDocument();
    });
  });

  test('submits create call option form correctly', async () => {
    const onSuccessMock = jest.fn();
    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={onSuccessMock} />
      </TestWrapper>
    );

    await waitFor(() => {
      const nftCards = screen.getAllByText(/数字艺术品/);
      if (nftCards.length > 0) {
        fireEvent.click(nftCards[0]);
        expect(screen.getByText(/创建NFT衍生品/)).toBeInTheDocument();
      }
    });

    // Select call option type
    const typeSelect = screen.getByLabelText('衍生品类型');
    fireEvent.change(typeSelect, { target: { value: 'CALL_OPTION' } });

    // Fill form fields
    const strikePriceInput = screen.getByLabelText('行权价格 (ETH)');
    const premiumInput = screen.getByLabelText('期权费 (ETH)');
    
    fireEvent.change(strikePriceInput, { target: { value: '0.5' } });
    fireEvent.change(premiumInput, { target: { value: '0.05' } });
    
    // Submit form
    fireEvent.click(screen.getByText('确认创建'));
    
    await waitFor(() => {
      expect(mockDerivativesContract.createCallOption).toHaveBeenCalled();
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  test('handles purchase derivative action', async () => {
    // Mock a derivative that can be purchased
    mockDerivativesContract.derivatives.mockResolvedValue({
      creator: '0x0000000000000000000000000000000000000001', // Different from current user
      buyer: ethers.constants.AddressZero,
      derivType: 0, // CALL_OPTION
      nftContract: '0x1234567890123456789012345678901234567890',
      tokenId: ethers.BigNumber.from('1'),
      strikePrice: ethers.utils.parseEther('0.5'),
      premium: ethers.utils.parseEther('0.05'),
      expirationTime: ethers.BigNumber.from(Math.floor(Date.now() / 1000) + 86400),
      status: 0, // ACTIVE
      paymentToken: ethers.constants.AddressZero
    });

    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const purchaseButtons = screen.getAllByText('购买');
      if (purchaseButtons.length > 0) {
        fireEvent.click(purchaseButtons[0]);
        expect(mockDerivativesContract.purchaseDerivative).toHaveBeenCalled();
      }
    });
  });

  test('handles cancel derivative action', async () => {
    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const cancelButtons = screen.getAllByText('取消');
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
        expect(mockDerivativesContract.cancelDerivative).toHaveBeenCalled();
      }
    });
  });

  test('opens derivative detail modal when detail button is clicked', async () => {
    render(
      <TestWrapper>
        <NFTDerivatives contract={mockDerivativesContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const detailButtons = screen.getAllByText('详情');
      if (detailButtons.length > 0) {
        fireEvent.click(detailButtons[0]);
        expect(screen.getByText('衍生品详情')).toBeInTheDocument();
      }
    });
  });
});
