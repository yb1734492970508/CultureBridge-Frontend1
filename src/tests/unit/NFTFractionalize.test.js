import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import NFTFractionalize from '../../components/blockchain/NFTFractionalize';
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
  getUserFractions: jest.fn().mockResolvedValue([]),
  fractions: jest.fn().mockResolvedValue({
    originalOwner: '0x1234567890123456789012345678901234567890',
    nftContract: '0x1234567890123456789012345678901234567890',
    tokenId: ethers.BigNumber.from('1'),
    fractionToken: '0x1234567890123456789012345678901234567890',
    name: 'Test Fraction',
    symbol: 'TFRAC',
    totalSupply: ethers.utils.parseEther('1000000'),
    reservePrice: ethers.utils.parseEther('0.1'),
    active: true
  }),
  fractionalize: jest.fn().mockResolvedValue({
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

describe('NFTFractionalize Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component title and description', () => {
    render(
      <TestWrapper>
        <NFTFractionalize contract={mockContract} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('NFT分数化')).toBeInTheDocument();
    expect(screen.getByText(/将您的NFT分割为可交易的ERC20代币/)).toBeInTheDocument();
  });

  test('displays wallet not connected message when not connected', () => {
    const disconnectedWeb3Context = { ...mockWeb3Context, isConnected: false };
    
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={disconnectedWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTFractionalize contract={mockContract} onSuccess={jest.fn()} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    expect(screen.getByText('请连接钱包')).toBeInTheDocument();
  });

  test('loads user NFTs and fractions when connected', async () => {
    render(
      <TestWrapper>
        <NFTFractionalize contract={mockContract} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    // Check if NFT section is rendered
    expect(screen.getByText('我的NFT')).toBeInTheDocument();
    expect(screen.getByText('我的分数化NFT')).toBeInTheDocument();
  });

  test('opens NFT detail modal when NFT card is clicked', async () => {
    render(
      <TestWrapper>
        <NFTFractionalize contract={mockContract} onSuccess={jest.fn()} />
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

  test('opens fractionalize modal from NFT detail modal', async () => {
    render(
      <TestWrapper>
        <NFTFractionalize contract={mockContract} onSuccess={jest.fn()} />
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
      
      // Click on fractionalize button
      fireEvent.click(screen.getByText('分数化此NFT'));
      
      // Check if fractionalize modal is opened
      await waitFor(() => {
        expect(screen.getByText('分数化NFT')).toBeInTheDocument();
      });
    }
  });

  test('submits fractionalize form correctly', async () => {
    const onSuccessMock = jest.fn();
    
    render(
      <TestWrapper>
        <NFTFractionalize contract={mockContract} onSuccess={onSuccessMock} />
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
      
      // Click on fractionalize button
      fireEvent.click(screen.getByText('分数化此NFT'));
      
      // Wait for fractionalize modal
      await waitFor(() => {
        expect(screen.getByText('分数化NFT')).toBeInTheDocument();
      });
      
      // Fill the form
      const nameInput = screen.getByLabelText('代币名称');
      const symbolInput = screen.getByLabelText('代币符号');
      const totalSupplyInput = screen.getByLabelText('总供应量');
      const reservePriceInput = screen.getByLabelText('回购价格 (ETH)');
      
      fireEvent.change(nameInput, { target: { value: 'Test Fraction' } });
      fireEvent.change(symbolInput, { target: { value: 'TFRAC' } });
      fireEvent.change(totalSupplyInput, { target: { value: '1000000' } });
      fireEvent.change(reservePriceInput, { target: { value: '0.1' } });
      
      // Submit the form
      fireEvent.click(screen.getByText('确认分数化'));
      
      // Check if contract method was called
      await waitFor(() => {
        expect(mockContract.fractionalize).toHaveBeenCalled();
        expect(onSuccessMock).toHaveBeenCalled();
      });
    }
  });
});
