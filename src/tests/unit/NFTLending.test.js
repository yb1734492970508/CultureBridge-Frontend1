import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import NFTLending from '../../components/blockchain/NFTLending'; // Corrected path
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
const mockLendingContract = {
  getUserLoansAsBorrower: jest.fn().mockResolvedValue([]),
  getUserLoansAsLender: jest.fn().mockResolvedValue([]),
  loans: jest.fn().mockResolvedValue({
    borrower: '0x1234567890123456789012345678901234567890',
    lender: '0x0000000000000000000000000000000000000000',
    nftContract: '0x1234567890123456789012345678901234567890',
    tokenId: ethers.BigNumber.from('1'),
    loanAmount: ethers.utils.parseEther('0.1'),
    interestRate: ethers.BigNumber.from('1000'), // 10%
    duration: ethers.BigNumber.from('2592000'), // 30 days in seconds
    startTime: ethers.BigNumber.from('0'),
    collateralFactor: ethers.BigNumber.from('7000'), // 70%
    paymentToken: ethers.constants.AddressZero,
    status: 0, // PENDING
    liquidationThreshold: ethers.BigNumber.from('7500') // 75%
  }),
  calculateLoanStatus: jest.fn().mockResolvedValue([
    0, // PENDING status
    ethers.BigNumber.from('15000'), // healthFactor 150%
    ethers.utils.parseEther('0.11'), // repayAmount
    ethers.BigNumber.from('2592000') // timeRemaining 30 days
  ]),
  createLoan: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  provideLoan: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  repayLoan: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  liquidateLoan: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  cancelLoan: jest.fn().mockResolvedValue({
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

describe('NFTLending Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component title and description', () => {
    render(
      <TestWrapper>
        <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('NFT借贷')).toBeInTheDocument();
    expect(screen.getByText(/以NFT为抵押获取加密货币贷款，或为NFT所有者提供贷款并赚取利息/)).toBeInTheDocument();
  });

  test('displays wallet not connected message when not connected', () => {
    const disconnectedWeb3Context = { ...mockWeb3Context, isConnected: false };
    
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3Context.Provider value={disconnectedWeb3Context}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
          </NotificationContext.Provider>
        </Web3Context.Provider>
      </Web3ReactProvider>
    );

    expect(screen.getByText('请连接钱包')).toBeInTheDocument();
  });

  test('loads user NFTs and loans when connected', async () => {
    render(
      <TestWrapper>
        <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
      expect(screen.queryByText('加载贷款请求中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('我的NFT')).toBeInTheDocument();
    expect(screen.getByText('NFT借贷市场')).toBeInTheDocument();
  });

  test('shows loan tabs and switches between them', async () => {
    render(
      <TestWrapper>
        <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('加载贷款请求中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('可用贷款请求')).toBeInTheDocument();
    expect(screen.getByText('我的借款')).toBeInTheDocument();
    expect(screen.getByText('我的放款')).toBeInTheDocument();

    fireEvent.click(screen.getByText('我的借款'));
    expect(screen.getByText('我的借款')).toHaveClass('active');
    
    fireEvent.click(screen.getByText('我的放款'));
    expect(screen.getByText('我的放款')).toHaveClass('active');
  });

  test('opens NFT detail modal when NFT card is clicked', async () => {
    render(
      <TestWrapper>
        <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    const nftCards = screen.getAllByText(/数字艺术品/);
    if (nftCards.length > 0) {
      fireEvent.click(nftCards[0]);
      await waitFor(() => {
        expect(screen.getByText('NFT详情')).toBeInTheDocument();
      });
    }
  });

  test('opens create loan modal from NFT detail modal', async () => {
    render(
      <TestWrapper>
        <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('加载NFT中...')).not.toBeInTheDocument();
    });

    const nftCards = screen.getAllByText(/数字艺术品/);
    if (nftCards.length > 0) {
      fireEvent.click(nftCards[0]);
      await waitFor(() => screen.getByText('NFT详情'));
      fireEvent.click(screen.getByText('创建贷款请求'));
      await waitFor(() => {
        expect(screen.getByText('创建NFT贷款请求')).toBeInTheDocument();
      });
    }
  });

  test('submits create loan form correctly', async () => {
    const onSuccessMock = jest.fn();
    render(
      <TestWrapper>
        <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={onSuccessMock} />
      </TestWrapper>
    );

    await waitFor(() => screen.queryByText('加载NFT中...'));
    const nftCards = screen.getAllByText(/数字艺术品/);
    if (nftCards.length > 0) {
      fireEvent.click(nftCards[0]);
      await waitFor(() => screen.getByText('NFT详情'));
      fireEvent.click(screen.getByText('创建贷款请求'));
      await waitFor(() => screen.getByText('创建NFT贷款请求'));

      const minLoanAmountInput = screen.getByLabelText('最低贷款金额 (ETH)');
      const durationInput = screen.getByLabelText('最长贷款期限 (天)');
      
      fireEvent.change(minLoanAmountInput, { target: { value: '0.2' } });
      fireEvent.change(durationInput, { target: { value: '15' } });
      
      fireEvent.click(screen.getByText('确认创建'));
      
      await waitFor(() => {
        expect(mockLendingContract.createLoan).toHaveBeenCalled();
        expect(onSuccessMock).toHaveBeenCalled();
      });
    }
  });

  test('opens lend modal when provide loan button is clicked', async () => {
    // Mock available loans to ensure the button is present
    mockLendingContract.getUserLoansAsBorrower.mockResolvedValue([]);
    mockLendingContract.getUserLoansAsLender.mockResolvedValue([]);
    
    render(
      <TestWrapper>
        <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('加载贷款请求中...')).not.toBeInTheDocument();
    });
    
    // Ensure mock data for available loans is loaded and rendered
    const provideLoanButtons = screen.getAllByText('提供贷款');
    if (provideLoanButtons.length > 0) {
      fireEvent.click(provideLoanButtons[0]);
      await waitFor(() => {
        expect(screen.getByText('提供NFT贷款')).toBeInTheDocument();
      });
    }
  });

  test('submits provide loan form correctly', async () => {
    const onSuccessMock = jest.fn();
    mockLendingContract.getUserLoansAsBorrower.mockResolvedValue([]);
    mockLendingContract.getUserLoansAsLender.mockResolvedValue([]);

    render(
      <TestWrapper>
        <NFTLending contract={mockLendingContract} priceOracle={mockPriceOracle} onSuccess={onSuccessMock} />
      </TestWrapper>
    );

    await waitFor(() => screen.queryByText('加载贷款请求中...'));
    const provideLoanButtons = screen.getAllByText('提供贷款');
    if (provideLoanButtons.length > 0) {
      fireEvent.click(provideLoanButtons[0]);
      await waitFor(() => screen.getByText('提供NFT贷款'));

      const loanAmountInput = screen.getByLabelText('贷款金额 (ETH)');
      const interestRateInput = screen.getByLabelText('年化利率 (%)');
      const durationInput = screen.getByLabelText('贷款期限 (天)');
      const collateralFactorInput = screen.getByLabelText('抵押率 (%)');

      fireEvent.change(loanAmountInput, { target: { value: '0.6' } });
      fireEvent.change(interestRateInput, { target: { value: '12' } });
      fireEvent.change(durationInput, { target: { value: '20' } });
      fireEvent.change(collateralFactorInput, { target: { value: '75' } });

      fireEvent.click(screen.getByText(/确认提供贷款/));

      await waitFor(() => {
        expect(mockLendingContract.provideLoan).toHaveBeenCalled();
        expect(onSuccessMock).toHaveBeenCalled();
      });
    }
  });

});

