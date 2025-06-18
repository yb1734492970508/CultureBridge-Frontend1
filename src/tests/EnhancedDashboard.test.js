import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedDashboard from '../components/EnhancedDashboard';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../services/blockchainService', () => ({
  connectWallet: jest.fn(),
  getBalance: jest.fn(),
  sendTransaction: jest.fn(),
}));

describe('EnhancedDashboard', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders dashboard with user information', () => {
    render(<EnhancedDashboard />);
    
    expect(screen.getByText('CultureBridge')).toBeInTheDocument();
    expect(screen.getByText('文化探索者')).toBeInTheDocument();
    expect(screen.getByText(/CBT/)).toBeInTheDocument();
  });

  test('displays quick action buttons', () => {
    render(<EnhancedDashboard />);
    
    expect(screen.getByText('开始聊天')).toBeInTheDocument();
    expect(screen.getByText('学习语言')).toBeInTheDocument();
    expect(screen.getByText('分享动态')).toBeInTheDocument();
    expect(screen.getByText('CBT钱包')).toBeInTheDocument();
  });

  test('shows trending posts', () => {
    render(<EnhancedDashboard />);
    
    expect(screen.getByText('热门动态')).toBeInTheDocument();
    expect(screen.getByText('东京茶道师')).toBeInTheDocument();
    expect(screen.getByText('巴黎美食家')).toBeInTheDocument();
  });

  test('handles quick action clicks', async () => {
    render(<EnhancedDashboard />);
    
    const chatButton = screen.getByText('开始聊天');
    fireEvent.click(chatButton);
    
    // Should navigate or show some feedback
    await waitFor(() => {
      // Add specific assertions based on expected behavior
    });
  });

  test('displays user stats correctly', () => {
    render(<EnhancedDashboard />);
    
    expect(screen.getByText('1234')).toBeInTheDocument(); // followers
    expect(screen.getByText('567')).toBeInTheDocument();  // following
    expect(screen.getByText('89')).toBeInTheDocument();   // posts
  });

  test('shows notification badge', () => {
    render(<EnhancedDashboard />);
    
    const notificationBadge = screen.getByText('5');
    expect(notificationBadge).toBeInTheDocument();
  });

  test('renders post actions correctly', () => {
    render(<EnhancedDashboard />);
    
    // Check for like, comment, share, and translate buttons
    const likeButtons = screen.getAllByText(/\d+/); // Like counts
    const translateButtons = screen.getAllByText('翻译');
    
    expect(translateButtons.length).toBeGreaterThan(0);
  });

  test('handles post interaction', async () => {
    render(<EnhancedDashboard />);
    
    const firstTranslateButton = screen.getAllByText('翻译')[0];
    fireEvent.click(firstTranslateButton);
    
    await waitFor(() => {
      // Should show translation or loading state
    });
  });

  test('responsive design elements', () => {
    render(<EnhancedDashboard />);
    
    const dashboard = screen.getByTestId('enhanced-dashboard');
    expect(dashboard).toHaveClass('enhanced-dashboard');
  });

  test('handles wallet connection', async () => {
    const mockConnectWallet = jest.fn();
    jest.doMock('../services/blockchainService', () => ({
      connectWallet: mockConnectWallet,
    }));

    render(<EnhancedDashboard />);
    
    const walletButton = screen.getByText('CBT钱包');
    fireEvent.click(walletButton);
    
    await waitFor(() => {
      expect(mockConnectWallet).toHaveBeenCalled();
    });
  });
});

