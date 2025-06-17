import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedCBTManager from '../components/token/EnhancedCBTManager';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the API services
jest.mock('../services/api', () => ({
  tokenAPI: {
    getBalance: jest.fn(),
    getTransactions: jest.fn(),
    getRewardHistory: jest.fn(),
    getTokenStats: jest.fn(),
    transfer: jest.fn(),
    stake: jest.fn(),
    unstake: jest.fn(),
    dailyCheckIn: jest.fn(),
    claimReward: jest.fn()
  },
  blockchainAPI: {
    getWalletInfo: jest.fn()
  }
}));

// Mock socket service
jest.mock('../services/socketService', () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
}));

const MockAuthProvider = ({ children, isAuthenticated = true }) => {
  const mockValue = {
    user: { id: '1', username: 'testuser' },
    isAuthenticated,
    login: jest.fn(),
    logout: jest.fn(),
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn()
  };

  return (
    <AuthProvider value={mockValue}>
      {children}
    </AuthProvider>
  );
};

describe('EnhancedCBTManager', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(
      <MockAuthProvider>
        <EnhancedCBTManager />
      </MockAuthProvider>
    );

    expect(screen.getByText('加载CBT代币信息...')).toBeInTheDocument();
  });

  test('renders not authenticated message when user is not logged in', () => {
    render(
      <MockAuthProvider isAuthenticated={false}>
        <EnhancedCBTManager />
      </MockAuthProvider>
    );

    expect(screen.getByText('请登录以查看CBT代币管理。')).toBeInTheDocument();
  });

  test('renders CBT token manager when authenticated', async () => {
    const { tokenAPI, blockchainAPI } = require('../services/api');
    
    tokenAPI.getBalance.mockResolvedValue({ balance: '1000', staked: '500', stakingRewards: '10' });
    blockchainAPI.getWalletInfo.mockResolvedValue({ wallet: { address: '0x123' } });
    tokenAPI.getTransactions.mockResolvedValue({ transactions: [] });
    tokenAPI.getRewardHistory.mockResolvedValue({ rewards: [] });
    tokenAPI.getTokenStats.mockResolvedValue({ stats: { price: 0.1 } });

    render(
      <MockAuthProvider>
        <EnhancedCBTManager />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('CBT代币管理中心')).toBeInTheDocument();
    });
  });

  test('handles transfer form submission', async () => {
    const { tokenAPI, blockchainAPI } = require('../services/api');
    
    tokenAPI.getBalance.mockResolvedValue({ balance: '1000' });
    blockchainAPI.getWalletInfo.mockResolvedValue({ wallet: { address: '0x123' } });
    tokenAPI.getTransactions.mockResolvedValue({ transactions: [] });
    tokenAPI.getRewardHistory.mockResolvedValue({ rewards: [] });
    tokenAPI.getTokenStats.mockResolvedValue({ stats: { price: 0.1 } });
    tokenAPI.transfer.mockResolvedValue({ success: true });

    render(
      <MockAuthProvider>
        <EnhancedCBTManager />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('CBT代币管理中心')).toBeInTheDocument();
    });

    // Click transfer tab
    fireEvent.click(screen.getByText('转账'));

    // Fill transfer form
    fireEvent.change(screen.getByPlaceholderText('输入钱包地址或用户名'), {
      target: { value: '0x456' }
    });
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '100' }
    });

    // Submit form
    fireEvent.click(screen.getByText('确认转账'));

    await waitFor(() => {
      expect(tokenAPI.transfer).toHaveBeenCalledWith({
        to: '0x456',
        amount: '100',
        note: ''
      });
    });
  });

  test('handles staking form submission', async () => {
    const { tokenAPI, blockchainAPI } = require('../services/api');
    
    tokenAPI.getBalance.mockResolvedValue({ balance: '1000' });
    blockchainAPI.getWalletInfo.mockResolvedValue({ wallet: { address: '0x123' } });
    tokenAPI.getTransactions.mockResolvedValue({ transactions: [] });
    tokenAPI.getRewardHistory.mockResolvedValue({ rewards: [] });
    tokenAPI.getTokenStats.mockResolvedValue({ stats: { price: 0.1 } });
    tokenAPI.stake.mockResolvedValue({ success: true });

    render(
      <MockAuthProvider>
        <EnhancedCBTManager />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('CBT代币管理中心')).toBeInTheDocument();
    });

    // Click staking tab
    fireEvent.click(screen.getByText('质押'));

    // Fill staking form
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, {
      target: { value: '500' }
    });

    // Submit form
    fireEvent.click(screen.getByText('开始质押'));

    await waitFor(() => {
      expect(tokenAPI.stake).toHaveBeenCalledWith({
        amount: '500',
        duration: 30
      });
    });
  });
});

