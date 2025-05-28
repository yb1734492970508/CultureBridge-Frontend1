import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockchainContext } from '../../context/blockchain';
import { TokenProvider, TokenContext } from '../../context/blockchain/TokenContext';
import TokenBalanceDisplay from '../blockchain/TokenBalanceDisplay';
import TokenTransferForm from '../blockchain/TokenTransferForm';
import StakingInterface from '../blockchain/StakingInterface';
import CultureTokenSystem from '../blockchain/CultureTokenSystem';

// 模拟区块链上下文
const mockBlockchainContext = {
  account: '0x1234567890123456789012345678901234567890',
  provider: {},
  isConnected: true,
};

// 模拟通证上下文
const mockTokenContext = {
  userBalance: '100.0',
  stakedAmount: '50.0',
  pendingRewards: '5.0',
  allowance: '20.0',
  transactionHistory: [
    {
      hash: '0xabcdef1234567890',
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: '10.0',
      timestamp: 1621234567,
      type: 'sent'
    },
    {
      hash: '0x0987654321abcdef',
      from: '0x0987654321098765432109876543210987654321',
      to: '0x1234567890123456789012345678901234567890',
      value: '5.0',
      timestamp: 1621234568,
      type: 'received'
    }
  ],
  isLoading: false,
  error: null,
  fetchUserData: jest.fn(),
  transferTokens: jest.fn().mockResolvedValue({ hash: '0xnewtransaction' }),
  approveContract: jest.fn().mockResolvedValue({ hash: '0xnewapproval' }),
  stakeTokens: jest.fn().mockResolvedValue({ hash: '0xnewstake' }),
  unstakeTokens: jest.fn().mockResolvedValue({ hash: '0xnewunstake' }),
  claimStakingRewards: jest.fn().mockResolvedValue({ hash: '0xnewclaim' }),
  fetchTransactionHistory: jest.fn()
};

// 测试包装器组件
const TestWrapper = ({ children }) => (
  <BlockchainContext.Provider value={mockBlockchainContext}>
    <TokenContext.Provider value={mockTokenContext}>
      {children}
    </TokenContext.Provider>
  </BlockchainContext.Provider>
);

describe('文化通证系统组件测试', () => {
  // TokenBalanceDisplay 组件测试
  describe('TokenBalanceDisplay', () => {
    test('正确显示用户余额', () => {
      render(
        <TestWrapper>
          <TokenBalanceDisplay />
        </TestWrapper>
      );
      
      expect(screen.getByText('100.00')).toBeInTheDocument();
      expect(screen.getByText('CULT')).toBeInTheDocument();
    });
    
    test('点击刷新按钮调用fetchUserData', () => {
      render(
        <TestWrapper>
          <TokenBalanceDisplay />
        </TestWrapper>
      );
      
      fireEvent.click(screen.getByText('刷新'));
      expect(mockTokenContext.fetchUserData).toHaveBeenCalled();
    });
  });
  
  // TokenTransferForm 组件测试
  describe('TokenTransferForm', () => {
    test('提交有效表单调用transferTokens', async () => {
      render(
        <TestWrapper>
          <TokenTransferForm />
        </TestWrapper>
      );
      
      // 填写表单
      fireEvent.change(screen.getByLabelText('接收地址'), {
        target: { value: '0x0987654321098765432109876543210987654321' }
      });
      
      fireEvent.change(screen.getByLabelText('转账金额'), {
        target: { value: '10' }
      });
      
      // 提交表单
      fireEvent.click(screen.getByText('转账'));
      
      // 验证调用
      expect(mockTokenContext.transferTokens).toHaveBeenCalledWith(
        '0x0987654321098765432109876543210987654321',
        '10'
      );
      
      // 等待成功消息显示
      await waitFor(() => {
        expect(screen.getByText('转账成功!')).toBeInTheDocument();
      });
    });
    
    test('余额不足时显示错误', () => {
      render(
        <TestWrapper>
          <TokenTransferForm />
        </TestWrapper>
      );
      
      // 填写表单
      fireEvent.change(screen.getByLabelText('接收地址'), {
        target: { value: '0x0987654321098765432109876543210987654321' }
      });
      
      fireEvent.change(screen.getByLabelText('转账金额'), {
        target: { value: '200' }
      });
      
      // 提交表单
      fireEvent.click(screen.getByText('转账'));
      
      // 验证错误消息
      expect(screen.getByText('余额不足')).toBeInTheDocument();
    });
  });
  
  // StakingInterface 组件测试
  describe('StakingInterface', () => {
    test('显示质押信息', () => {
      render(
        <TestWrapper>
          <StakingInterface />
        </TestWrapper>
      );
      
      expect(screen.getByText('100.00 CULT')).toBeInTheDocument(); // 可用余额
      expect(screen.getByText('50.00 CULT')).toBeInTheDocument(); // 已质押
      expect(screen.getByText('5.00 CULT')).toBeInTheDocument(); // 待领取奖励
    });
    
    test('质押功能', async () => {
      render(
        <TestWrapper>
          <StakingInterface />
        </TestWrapper>
      );
      
      // 切换到质押标签
      fireEvent.click(screen.getByText('质押'));
      
      // 填写质押金额
      fireEvent.change(screen.getByLabelText('质押金额'), {
        target: { value: '10' }
      });
      
      // 提交质押
      fireEvent.click(screen.getByText('质押'));
      
      // 验证调用
      expect(mockTokenContext.stakeTokens).toHaveBeenCalledWith('10');
      
      // 等待成功消息显示
      await waitFor(() => {
        expect(screen.getByText('操作成功!')).toBeInTheDocument();
      });
    });
    
    test('解除质押功能', async () => {
      render(
        <TestWrapper>
          <StakingInterface />
        </TestWrapper>
      );
      
      // 切换到解除质押标签
      fireEvent.click(screen.getByText('解除质押'));
      
      // 填写解除质押金额
      fireEvent.change(screen.getByLabelText('解除质押金额'), {
        target: { value: '10' }
      });
      
      // 提交解除质押
      fireEvent.click(screen.getByText('解除质押'));
      
      // 验证调用
      expect(mockTokenContext.unstakeTokens).toHaveBeenCalledWith('10');
      
      // 等待成功消息显示
      await waitFor(() => {
        expect(screen.getByText('操作成功!')).toBeInTheDocument();
      });
    });
    
    test('领取奖励功能', async () => {
      render(
        <TestWrapper>
          <StakingInterface />
        </TestWrapper>
      );
      
      // 切换到奖励标签
      fireEvent.click(screen.getByText('奖励'));
      
      // 点击领取奖励
      fireEvent.click(screen.getByText('领取奖励'));
      
      // 验证调用
      expect(mockTokenContext.claimStakingRewards).toHaveBeenCalled();
      
      // 等待成功消息显示
      await waitFor(() => {
        expect(screen.getByText('操作成功!')).toBeInTheDocument();
      });
    });
  });
  
  // 集成测试
  describe('CultureTokenSystem集成', () => {
    test('所有组件正确渲染', () => {
      render(
        <BlockchainContext.Provider value={mockBlockchainContext}>
          <TokenProvider>
            <CultureTokenSystem />
          </TokenProvider>
        </BlockchainContext.Provider>
      );
      
      // 验证标题和描述
      expect(screen.getByText('文化通证系统')).toBeInTheDocument();
      expect(screen.getByText(/文化通证\(CULT\)是CultureBridge平台的核心经济激励机制/)).toBeInTheDocument();
      
      // 验证各组件存在
      expect(screen.getByText('文化通证余额')).toBeInTheDocument();
      expect(screen.getByText('转账文化通证')).toBeInTheDocument();
      expect(screen.getByText('文化通证质押')).toBeInTheDocument();
      expect(screen.getByText('交易历史')).toBeInTheDocument();
    });
  });
});
