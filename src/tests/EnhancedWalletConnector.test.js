import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedWalletConnector from '../components/blockchain/EnhancedWalletConnector';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the API services
jest.mock('../services/api', () => ({
  blockchainAPI: {
    getWalletInfo: jest.fn(),
    getNetworkStatus: jest.fn()
  }
}));

// Mock window.ethereum
const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true
};

Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true
});

const MockAuthProvider = ({ children, isAuthenticated = false, walletInfo = null }) => {
  const mockValue = {
    user: { id: '1', username: 'testuser' },
    isAuthenticated,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn()
  };

  return (
    <AuthProvider value={mockValue}>
      {children}
    </AuthProvider>
  );
};

describe('EnhancedWalletConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEthereum.request.mockClear();
  });

  test('renders wallet connection options when not connected', () => {
    render(
      <MockAuthProvider>
        <EnhancedWalletConnector />
      </MockAuthProvider>
    );

    expect(screen.getByText('连接您的钱包')).toBeInTheDocument();
    expect(screen.getByText('MetaMask')).toBeInTheDocument();
    expect(screen.getByText('连接')).toBeInTheDocument();
  });

  test('shows wallet details when connected', async () => {
    const { blockchainAPI } = require('../services/api');
    
    blockchainAPI.getWalletInfo.mockResolvedValue({
      wallet: {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 56,
        bnbBalance: '1.5',
        cbtBalance: '1000',
        walletType: 'MetaMask'
      }
    });
    
    blockchainAPI.getNetworkStatus.mockResolvedValue({
      network: {
        isHealthy: true,
        blockNumber: 12345678,
        gasPrice: '5',
        latency: 150
      }
    });

    render(
      <MockAuthProvider isAuthenticated={true}>
        <EnhancedWalletConnector />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('已连接')).toBeInTheDocument();
    });

    expect(screen.getByText('网络: BNB Smart Chain (正常)')).toBeInTheDocument();
    expect(screen.getByText('1.5000 BNB')).toBeInTheDocument();
    expect(screen.getByText('1000.0000 CBT')).toBeInTheDocument();
  });

  test('handles wallet connection process', async () => {
    mockEthereum.request
      .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890']) // eth_requestAccounts
      .mockResolvedValueOnce('0x38') // eth_chainId
      .mockResolvedValueOnce('signature'); // personal_sign

    const mockConnectWallet = jest.fn();
    
    render(
      <MockAuthProvider>
        <EnhancedWalletConnector />
      </MockAuthProvider>
    );

    // Click connect button
    fireEvent.click(screen.getByText('连接'));

    await waitFor(() => {
      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts'
      });
    });
  });

  test('handles network switching', async () => {
    mockEthereum.request
      .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890']) // eth_requestAccounts
      .mockResolvedValueOnce('0x1') // eth_chainId (Ethereum mainnet)
      .mockResolvedValueOnce(undefined) // wallet_switchEthereumChain
      .mockResolvedValueOnce('signature'); // personal_sign

    render(
      <MockAuthProvider>
        <EnhancedWalletConnector />
      </MockAuthProvider>
    );

    // Click connect button
    fireEvent.click(screen.getByText('连接'));

    await waitFor(() => {
      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }]
      });
    });
  });

  test('shows error when wallet connection fails', async () => {
    mockEthereum.request.mockRejectedValue(new Error('User rejected request'));

    render(
      <MockAuthProvider>
        <EnhancedWalletConnector />
      </MockAuthProvider>
    );

    // Click connect button
    fireEvent.click(screen.getByText('连接'));

    await waitFor(() => {
      expect(screen.getByText(/User rejected request/)).toBeInTheDocument();
    });
  });

  test('handles disconnect wallet', async () => {
    const { blockchainAPI } = require('../services/api');
    
    blockchainAPI.getWalletInfo.mockResolvedValue({
      wallet: {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 56,
        bnbBalance: '1.5',
        cbtBalance: '1000'
      }
    });

    const mockDisconnectWallet = jest.fn();

    render(
      <MockAuthProvider isAuthenticated={true}>
        <EnhancedWalletConnector />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('断开连接')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('断开连接'));

    expect(mockDisconnectWallet).toHaveBeenCalled();
  });
});

