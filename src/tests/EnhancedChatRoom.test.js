import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedChatRoom from '../components/EnhancedChatRoom';

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock audio recording
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve({
    getTracks: () => [{ stop: jest.fn() }]
  }))
};

describe('EnhancedChatRoom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat interface correctly', () => {
    render(<EnhancedChatRoom />);
    
    expect(screen.getByText('文化交流群')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/输入消息/)).toBeInTheDocument();
    expect(screen.getByText('12人在线')).toBeInTheDocument();
  });

  test('displays existing messages', () => {
    render(<EnhancedChatRoom />);
    
    expect(screen.getByText('田中さん')).toBeInTheDocument();
    expect(screen.getByText(/日本的文化/)).toBeInTheDocument();
  });

  test('handles message input and sending', async () => {
    render(<EnhancedChatRoom />);
    
    const messageInput = screen.getByPlaceholderText(/输入消息/);
    const sendButton = screen.getByRole('button', { name: /send/ });
    
    fireEvent.changeText(messageInput, '你好，大家！');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('你好，大家！')).toBeInTheDocument();
    });
  });

  test('toggles translation mode', () => {
    render(<EnhancedChatRoom />);
    
    const translateToggle = screen.getByRole('button', { name: /language/ });
    fireEvent.press(translateToggle);
    
    expect(screen.getByText('自动翻译模式已开启')).toBeInTheDocument();
  });

  test('handles voice recording', async () => {
    render(<EnhancedChatRoom />);
    
    const voiceButton = screen.getByRole('button', { name: /mic/ });
    fireEvent.press(voiceButton);
    
    await waitFor(() => {
      // Should show recording state
      expect(voiceButton).toHaveStyle({ backgroundColor: '#ffe7e7' });
    });
  });

  test('displays translation for messages', async () => {
    render(<EnhancedChatRoom />);
    
    const translateButton = screen.getAllByRole('button', { name: /language/ })[1];
    fireEvent.press(translateButton);
    
    await waitFor(() => {
      expect(screen.getByText('显示原文')).toBeInTheDocument();
    });
  });

  test('shows message timestamps', () => {
    render(<EnhancedChatRoom />);
    
    const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  test('handles voice message playback', async () => {
    render(<EnhancedChatRoom />);
    
    const voiceMessage = screen.getByText('语音消息 (点击播放)');
    fireEvent.press(voiceMessage);
    
    await waitFor(() => {
      // Should trigger audio playback
    });
  });

  test('displays online user count', () => {
    render(<EnhancedChatRoom />);
    
    expect(screen.getByText('12人在线')).toBeInTheDocument();
  });

  test('handles emoji and attachment buttons', () => {
    render(<EnhancedChatRoom />);
    
    const emojiButton = screen.getByRole('button', { name: /happy/ });
    const attachButton = screen.getByRole('button', { name: /add/ });
    
    expect(emojiButton).toBeInTheDocument();
    expect(attachButton).toBeInTheDocument();
  });

  test('shows translation hint when enabled', () => {
    render(<EnhancedChatRoom />);
    
    expect(screen.getByText('自动翻译模式已开启')).toBeInTheDocument();
  });
});

