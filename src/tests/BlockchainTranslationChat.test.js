// Web3与BNB链翻译聊天功能前端集成测试
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import BlockchainTranslationChat from '../components/chat/BlockchainTranslationChat';
import AIServiceConnector from '../services/AIServiceConnector';

// Mock Web3 provider
jest.mock('@web3-react/core', () => ({
  ...jest.requireActual('@web3-react/core'),
  useWeb3React: () => ({
    library: new ethers.providers.JsonRpcProvider(),
    account: '0x123456789abcdef',
    active: true
  })
}));

// Mock AIServiceConnector
jest.mock('../services/AIServiceConnector', () => {
  return jest.fn().mockImplementation(() => ({
    findTranslationServices: jest.fn().mockResolvedValue([
      {
        id: '0',
        provider: '0xabcdef123456',
        languages: ['zh-CN', 'en-US'],
        performanceScore: '85',
        pricePerToken: '10',
        isActive: true,
        metadataURI: 'ipfs://QmTest'
      },
      {
        id: '1',
        provider: '0x654321fedcba',
        languages: ['zh-CN', 'en-US', 'ja-JP'],
        performanceScore: '92',
        pricePerToken: '15',
        isActive: true,
        metadataURI: 'ipfs://QmTest2'
      }
    ]),
    getAICapabilities: jest.fn().mockResolvedValue([
      {
        id: '0',
        type: 0, // Translation
        languages: ['zh-CN', 'en-US'],
        domains: ['general'],
        creator: '0xabcdef123456',
        owner: '0xabcdef123456',
        usageCount: '42',
        royaltyPercentage: '10',
        price: '50',
        isForSale: true,
        name: '通用中英翻译能力',
        description: '高质量的中英互译能力',
        image: 'ipfs://QmTestImage1'
      },
      {
        id: '1',
        type: 1, // Cultural
        languages: ['zh-CN', 'en-US'],
        domains: ['business', 'technical'],
        creator: '0x654321fedcba',
        owner: '0x654321fedcba',
        usageCount: '27',
        royaltyPercentage: '15',
        price: '75',
        isForSale: true,
        name: '商务技术领域翻译能力',
        description: '专注于商务和技术领域的翻译能力',
        image: 'ipfs://QmTestImage2'
      }
    ]),
    createTranslationRequest: jest.fn().mockResolvedValue('0'),
    getTranslationResult: jest.fn().mockImplementation((requestId) => {
      if (requestId === '0') {
        return Promise.resolve({
          text: 'This is a test translation result.',
          sourceLanguage: 'zh-CN',
          targetLanguage: 'en-US',
          qualityScore: '0',
          completedAt: new Date().toISOString()
        });
      }
      return Promise.resolve(null);
    }),
    verifyTranslation: jest.fn().mockResolvedValue(true),
    useAICapability: jest.fn().mockResolvedValue(true)
  }));
});

// Mock getLibrary function for Web3ReactProvider
function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

describe('BlockchainTranslationChat Component', () => {
  beforeEach(() => {
    AIServiceConnector.mockClear();
    
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <BlockchainTranslationChat />
      </Web3ReactProvider>
    );
  });

  test('renders the component with initial state', async () => {
    // Check for main elements
    expect(screen.getByText(/BNB链驱动的AI翻译/i)).toBeInTheDocument();
    expect(screen.getByText(/语言:/i)).toBeInTheDocument();
    expect(screen.getByText(/AI服务:/i)).toBeInTheDocument();
    expect(screen.getByText(/隐私级别:/i)).toBeInTheDocument();
    
    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByText(/服务 #0 - 评分: 85\/100/i)).toBeInTheDocument();
    });
    
    // Wait for capabilities to load
    await waitFor(() => {
      expect(screen.getByText(/通用中英翻译能力/i)).toBeInTheDocument();
      expect(screen.getByText(/商务技术领域翻译能力/i)).toBeInTheDocument();
    });
  });

  test('allows language selection', async () => {
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/BNB链驱动的AI翻译/i)).toBeInTheDocument();
    });
    
    // Find language selectors
    const sourceLanguageSelect = screen.getByLabelText(/源语言/i);
    const targetLanguageSelect = screen.getByLabelText(/目标语言/i);
    
    // Change source language
    fireEvent.change(sourceLanguageSelect, { target: { value: 'en-US' } });
    expect(sourceLanguageSelect.value).toBe('en-US');
    
    // Change target language
    fireEvent.change(targetLanguageSelect, { target: { value: 'ja-JP' } });
    expect(targetLanguageSelect.value).toBe('ja-JP');
    
    // Services should be reloaded with new language pair
    await waitFor(() => {
      expect(AIServiceConnector.mock.instances[0].findTranslationServices).toHaveBeenCalledWith(
        'en-US',
        'ja-JP',
        expect.any(Number)
      );
    });
  });

  test('allows service selection', async () => {
    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByText(/服务 #0 - 评分: 85\/100/i)).toBeInTheDocument();
    });
    
    // Find service selector
    const serviceSelect = screen.getByLabelText(/AI服务:/i);
    
    // Change selected service
    fireEvent.change(serviceSelect, { target: { value: '1' } });
    expect(serviceSelect.value).toBe('1');
  });

  test('allows capability selection', async () => {
    // Wait for capabilities to load
    await waitFor(() => {
      expect(screen.getByText(/通用中英翻译能力/i)).toBeInTheDocument();
    });
    
    // Find capability items
    const capabilityItems = screen.getAllByTestId('capability-item');
    expect(capabilityItems.length).toBe(2);
    
    // Select first capability
    fireEvent.click(capabilityItems[0]);
    expect(capabilityItems[0]).toHaveClass('selected');
    
    // Select second capability
    fireEvent.click(capabilityItems[1]);
    expect(capabilityItems[1]).toHaveClass('selected');
    
    // Deselect first capability
    fireEvent.click(capabilityItems[0]);
    expect(capabilityItems[0]).not.toHaveClass('selected');
  });

  test('performs translation', async () => {
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/BNB链驱动的AI翻译/i)).toBeInTheDocument();
    });
    
    // Find input textarea and translate button
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByText(/翻译$/i);
    
    // Enter text
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    expect(inputTextarea.value).toBe('这是一个测试。');
    
    // Click translate button
    fireEvent.click(translateButton);
    
    // Should show loading state
    expect(screen.getByText(/翻译中/i)).toBeInTheDocument();
    
    // Wait for translation result
    await waitFor(() => {
      expect(screen.getByText(/This is a test translation result./i)).toBeInTheDocument();
    });
    
    // Verify that createTranslationRequest was called
    expect(AIServiceConnector.mock.instances[0].createTranslationRequest).toHaveBeenCalled();
  });

  test('allows quality rating', async () => {
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/BNB链驱动的AI翻译/i)).toBeInTheDocument();
    });
    
    // Find input textarea and translate button
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByText(/翻译$/i);
    
    // Enter text and translate
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    fireEvent.click(translateButton);
    
    // Wait for translation result
    await waitFor(() => {
      expect(screen.getByText(/This is a test translation result./i)).toBeInTheDocument();
    });
    
    // Find quality rating slider and submit button
    const qualitySlider = screen.getByLabelText(/翻译质量评分/i);
    const submitButton = screen.getByText(/提交评分/i);
    
    // Set quality rating
    fireEvent.change(qualitySlider, { target: { value: '85' } });
    expect(qualitySlider.value).toBe('85');
    
    // Submit rating
    fireEvent.click(submitButton);
    
    // Verify that verifyTranslation was called
    await waitFor(() => {
      expect(AIServiceConnector.mock.instances[0].verifyTranslation).toHaveBeenCalledWith(
        '0',
        85
      );
    });
  });
});
