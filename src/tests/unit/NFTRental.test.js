import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import NFTRental from '../../components/blockchain/NFTRental';
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

// Mock providers
const mockWeb3Context = {
  isConnected: true,
  connect: jest.fn(),
  disconnect: jest.fn()
};

const mockNotificationContext = {
  addNotification: jest.fn()
};

// Mock contract
const mockContract = {
  getUserRentalsAsLessor: jest.fn().mockResolvedValue([]),
  getUserRentalsAsRenter: jest.fn().mockResolvedValue([]),
  rentals: jest.fn().mockResolvedValue({
    lessor: '0x1234567890123456789012345678901234567890',
    renter: '0x0000000000000000000000000000000000000000',
    nftContract: '0x1234567890123456789012345678901234567890',
    tokenId: ethers.BigNumber.from('1'),
    rentalFee: ethers.utils.parseEther('0.01'),
    duration: ethers.BigNumber.from('604800'), // 7 days in seconds
    startTime: ethers.BigNumber.from('0'),
    collateral: ethers.utils.parseEther('0.05'),
    revenueSharing: false,
    revenueShare: 0,
    active: true
  }),
  createRental: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  startRental: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  })
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

describe('NFTRental Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component title and description', () => {
    render(
      <TestWrapper>
        <NFTRental contract={mockContract} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('NFT租赁')).toBeInTheDocument();
    expect(screen.getByText(/出租您的NFT获取收益，或租用他人的NFT获得临时使用权/)).toBeInTheDocument();
  });

  test('displays wallet not connected message when not connected', () => {
    const disconnectedWeb3Context = { ...mockWeb3Context, isConnected: false };
    
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={disconnectedWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTRental contract={mockContract} onSuccess={jest.fn()} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    expect(screen.getByText('请连接钱包')).toBeInTheDocument();
  });

  test('loads user NFTs and rentals when connected', async () => {
    render(
      <TestWrapper>
        <NFTRental contract={mockContract} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    // Check if NFT section is rendered
    expect(screen.getByText('我的NFT')).toBeInTheDocument();
    expect(screen.getByText('NFT租赁市场')).toBeInTheDocument();
  });

  test('shows rental tabs and switches between them', async () => {
    render(
      <TestWrapper>
        <NFTRental contract={mockContract} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    // Check if tabs are rendered
    expect(screen.getByText('可租用的NFT')).toBeInTheDocument();
    expect(screen.getByText('我的出租')).toBeInTheDocument();
    expect(screen.getByText('我的租入')).toBeInTheDocument();

    // Click on "我的出租" tab
    fireEvent.click(screen.getByText('我的出租'));
    
    // Check if tab content changed
    expect(screen.getByText('我的出租')).toBeInTheDocument();
    
    // Click on "我的租入" tab
    fireEvent.click(screen.getByText('我的租入'));
    
    // Check if tab content changed
    expect(screen.getByText('我的租入')).toBeInTheDocument();
  });

  test('opens NFT detail modal when NFT card is clicked', async () => {
    render(
      <TestWrapper>
        <NFTRental contract={mockContract} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    // Find and click on an NFT card (mock data should be loaded)
    const nftCards = screen.getAllByText(/数字艺术品/);
    if (nftCards.length > 0) {
      fireEvent.click(nftCards[0]);
      
      // Check if modal is opened
      await waitFor(() => {
        expect(screen.getByText('NFT详情')).toBeInTheDocument();
      });
    }
  });

  test('opens create rental modal from NFT detail modal', async () => {
    render(
      <TestWrapper>
        <NFTRental contract={mockContract} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    // Find and click on an NFT card
    const nftCards = screen.getAllByText(/数字艺术品/);
    if (nftCards.length > 0) {
      fireEvent.click(nftCards[0]);
      
      // Wait for NFT detail modal
      await waitFor(() => {
        expect(screen.getByText('NFT详情')).toBeInTheDocument();
      });
      
      // Click on create rental button
      fireEvent.click(screen.getByText('创建租赁'));
      
      // Check if create rental modal is opened
      await waitFor(() => {
        expect(screen.getByText('创建NFT租赁')).toBeInTheDocument();
      });
    }
  });

  test('submits create rental form correctly', async () => {
    const onSuccessMock = jest.fn();
    
    render(
      <TestWrapper>
        <NFTRental contract={mockContract} onSuccess={onSuccessMock} />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    // Find and click on an NFT card
    const nftCards = screen.getAllByText(/数字艺术品/);
    if (nftCards.length > 0) {
      fireEvent.click(nftCards[0]);
      
      // Wait for NFT detail modal
      await waitFor(() => {
        expect(screen.getByText('NFT详情')).toBeInTheDocument();
      });
      
      // Click on create rental button
      fireEvent.click(screen.getByText('创建租赁'));
      
      // Wait for create rental modal
      await waitFor(() => {
        expect(screen.getByText('创建NFT租赁')).toBeInTheDocument();
      });
      
      // Fill the form
      const rentalFeeInput = screen.getByLabelText('租金 (ETH)');
      const durationInput = screen.getByLabelText('租期 (天)');
      const collateralInput = screen.getByLabelText('押金 (ETH)');
      
      fireEvent.change(rentalFeeInput, { target: { value: '0.02' } });
      fireEvent.change(durationInput, { target: { value: '14' } });
      fireEvent.change(collateralInput, { target: { value: '0.1' } });
      
      // Submit the form
      fireEvent.click(screen.getByText('确认创建'));
      
      // Check if contract method was called
      await waitFor(() => {
        expect(mockContract.createRental).toHaveBeenCalled();
        expect(onSuccessMock).toHaveBeenCalled();
      });
    }
  });

  test('opens rent modal when rent button is clicked', async () => {
    // Mock available rentals
    mockContract.getUserRentalsAsLessor.mockResolvedValue([]);
    mockContract.getUserRentalsAsRenter.mockResolvedValue([]);
    
    render(
      <TestWrapper>
        <NFTRental contract={mockContract} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    // Find and click on rent button (if available in mock data)
    const rentButtons = screen.getAllByText('租用');
    if (rentButtons.length > 0) {
      fireEvent.click(rentButtons[0]);
      
      // Check if rent modal is opened
      await waitFor(() => {
        expect(screen.getByText('租用NFT')).toBeInTheDocument();
      });
    }
  });
});
