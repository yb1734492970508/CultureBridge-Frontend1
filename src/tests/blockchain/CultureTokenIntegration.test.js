import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockchainContext } from '../../context/blockchain';
import { TokenContext } from '../../context/blockchain/TokenContext';
import CultureTokenSystem from '../blockchain/CultureTokenSystem';
import TokenBalanceDisplay from '../blockchain/TokenBalanceDisplay';
import TokenTransferForm from '../blockchain/TokenTransferForm';
import StakingInterface from '../blockchain/StakingInterface';
import TokenTransactionHistory from '../blockchain/TokenTransactionHistory';

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

describe('文化通证系统集成测试', () => {
  // 测试与NFT市场集成
  describe('与NFT市场集成', () => {
    test('通证授权与NFT购买流程', async () => {
      // 模拟NFT市场组件和购买函数
      const mockBuyNFT = jest.fn().mockResolvedValue({ hash: '0xnftpurchase' });
      const mockNFTPrice = '10.0';
      const mockNFTMarketAddress = '0xNFTMarketAddress';
      
      const NFTMarketComponent = () => {
        const { approveContract } = React.useContext(TokenContext);
        
        const handleBuy = async () => {
          // 检查授权
          await approveContract(mockNFTMarketAddress, mockNFTPrice);
          // 购买NFT
          await mockBuyNFT();
        };
        
        return (
          <div>
            <h2>NFT市场</h2>
            <button onClick={handleBuy}>购买NFT</button>
          </div>
        );
      };
      
      render(
        <TestWrapper>
          <NFTMarketComponent />
        </TestWrapper>
      );
      
      // 点击购买按钮
      fireEvent.click(screen.getByText('购买NFT'));
      
      // 验证授权调用
      expect(mockTokenContext.approveContract).toHaveBeenCalledWith(
        mockNFTMarketAddress,
        mockNFTPrice
      );
      
      // 验证购买调用
      await waitFor(() => {
        expect(mockBuyNFT).toHaveBeenCalled();
      });
    });
  });
  
  // 测试与身份声誉系统集成
  describe('与身份声誉系统集成', () => {
    test('通证持有量影响声誉计算', () => {
      // 模拟声誉计算函数
      const calculateReputation = (tokenBalance, stakingAmount) => {
        return Math.floor(parseFloat(tokenBalance) * 0.3 + parseFloat(stakingAmount) * 0.7);
      };
      
      const ReputationComponent = () => {
        const { userBalance, stakedAmount } = React.useContext(TokenContext);
        const reputation = calculateReputation(userBalance, stakedAmount);
        
        return (
          <div>
            <h2>声誉系统</h2>
            <p>您的声誉分数: {reputation}</p>
          </div>
        );
      };
      
      render(
        <TestWrapper>
          <ReputationComponent />
        </TestWrapper>
      );
      
      // 验证声誉分数计算
      const expectedReputation = Math.floor(100.0 * 0.3 + 50.0 * 0.7);
      expect(screen.getByText(`您的声誉分数: ${expectedReputation}`)).toBeInTheDocument();
    });
  });
  
  // 测试异常流程处理
  describe('异常流程处理', () => {
    test('网络错误处理', async () => {
      // 模拟网络错误
      const errorTokenContext = {
        ...mockTokenContext,
        error: '网络连接失败',
        isLoading: false
      };
      
      render(
        <BlockchainContext.Provider value={mockBlockchainContext}>
          <TokenContext.Provider value={errorTokenContext}>
            <TokenBalanceDisplay />
          </TokenContext.Provider>
        </BlockchainContext.Provider>
      );
      
      // 验证错误显示
      expect(screen.getByText('获取余额失败: 网络连接失败')).toBeInTheDocument();
    });
    
    test('交易失败处理', async () => {
      // 模拟交易失败
      const failingTransferTokens = jest.fn().mockRejectedValue(new Error('交易被拒绝'));
      const errorTokenContext = {
        ...mockTokenContext,
        transferTokens: failingTransferTokens
      };
      
      render(
        <BlockchainContext.Provider value={mockBlockchainContext}>
          <TokenContext.Provider value={errorTokenContext}>
            <TokenTransferForm />
          </TokenContext.Provider>
        </BlockchainContext.Provider>
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
      
      // 验证错误显示
      await waitFor(() => {
        expect(screen.getByText('交易被拒绝')).toBeInTheDocument();
      });
    });
    
    test('未连接钱包状态', () => {
      // 模拟未连接钱包
      const disconnectedBlockchainContext = {
        ...mockBlockchainContext,
        isConnected: false,
        account: null
      };
      
      render(
        <BlockchainContext.Provider value={disconnectedBlockchainContext}>
          <TokenContext.Provider value={mockTokenContext}>
            <StakingInterface />
          </TokenContext.Provider>
        </BlockchainContext.Provider>
      );
      
      // 验证提示信息
      expect(screen.getByText('请连接钱包使用质押功能')).toBeInTheDocument();
    });
  });
  
  // 测试移动端响应式设计
  describe('响应式设计测试', () => {
    beforeAll(() => {
      // 模拟移动设备视口
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      window.dispatchEvent(new Event('resize'));
    });
    
    test('移动端布局适配', () => {
      render(
        <TestWrapper>
          <CultureTokenSystem />
        </TestWrapper>
      );
      
      // 验证组件存在
      expect(screen.getByText('文化通证系统')).toBeInTheDocument();
      
      // 这里可以添加更多针对移动端布局的断言
      // 例如检查特定的CSS类或样式属性
    });
    
    afterAll(() => {
      // 恢复默认视口
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
      window.dispatchEvent(new Event('resize'));
    });
  });
  
  // 性能测试
  describe('性能测试', () => {
    test('大量交易历史记录渲染性能', () => {
      // 生成大量交易记录
      const largeTransactionHistory = Array(100).fill(null).map((_, index) => ({
        hash: `0xtx${index}`,
        from: index % 2 === 0 ? mockBlockchainContext.account : '0xother',
        to: index % 2 === 0 ? '0xother' : mockBlockchainContext.account,
        value: `${(index + 1) * 0.1}`,
        timestamp: 1621234567 + index * 100,
        type: index % 2 === 0 ? 'sent' : 'received'
      }));
      
      const largeDataTokenContext = {
        ...mockTokenContext,
        transactionHistory: largeTransactionHistory
      };
      
      const startTime = performance.now();
      
      render(
        <BlockchainContext.Provider value={mockBlockchainContext}>
          <TokenContext.Provider value={largeDataTokenContext}>
            <TokenTransactionHistory />
          </TokenContext.Provider>
        </BlockchainContext.Provider>
      );
      
      const endTime = performance.now();
      
      // 验证渲染时间在可接受范围内（例如小于500ms）
      expect(endTime - startTime).toBeLessThan(500);
      
      // 验证分页功能
      expect(screen.getByText('1 / 10')).toBeInTheDocument(); // 假设每页10条记录
    });
  });
});
