// Web3与BNB链翻译聊天功能前端集成测试
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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

// Mock SpeechRecognition API
window.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

window.webkitSpeechRecognition = window.SpeechRecognition;

// Mock ethers Contract
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  
  return {
    ...originalModule,
    Contract: jest.fn().mockImplementation(() => ({
      balanceOf: jest.fn().mockResolvedValue(originalModule.utils.parseEther('100')),
      getTranslatorInfo: jest.fn().mockResolvedValue({
        wallet: '0x123456789abcdef',
        languages: ['zh-CN', 'en-US'],
        completedJobs: originalModule.BigNumber.from(15),
        totalEarned: originalModule.utils.parseEther('500'),
        averageQuality: originalModule.BigNumber.from(92),
        reputation: originalModule.BigNumber.from(4),
        isVerified: true,
        isActive: true
      }),
      getLanguageNFTs: jest.fn().mockResolvedValue([0, 1]),
      getNFTDetails: jest.fn().mockImplementation((tokenId) => {
        if (tokenId.toString() === '0') {
          return Promise.resolve({
            nftType: 0,
            creator: '0xabcdef123456',
            language: 'zh-CN',
            relatedLanguages: ['en-US'],
            tags: ['general', 'conversation'],
            usageCount: originalModule.BigNumber.from(42),
            royaltyPercentage: originalModule.BigNumber.from(10),
            price: originalModule.utils.parseEther('50'),
            isForSale: true,
            currentOwner: '0xabcdef123456',
            tokenURI: 'ipfs://QmTest1'
          });
        }
        return Promise.resolve({
          nftType: 1,
          creator: '0x654321fedcba',
          language: 'zh-CN',
          relatedLanguages: ['en-US', 'ja-JP'],
          tags: ['business', 'technical'],
          usageCount: originalModule.BigNumber.from(27),
          royaltyPercentage: originalModule.BigNumber.from(15),
          price: originalModule.utils.parseEther('75'),
          isForSale: true,
          currentOwner: '0x654321fedcba',
          tokenURI: 'ipfs://QmTest2'
        });
      }),
      getAvailableServices: jest.fn().mockResolvedValue([0, 1]),
      getServiceDetails: jest.fn().mockImplementation((serviceId) => {
        if (serviceId.toString() === '0') {
          return Promise.resolve({
            provider: '0xabcdef123456',
            languages: ['zh-CN', 'en-US'],
            performanceScore: originalModule.BigNumber.from(85),
            pricePerToken: originalModule.utils.parseEther('10'),
            isActive: true,
            metadataURI: 'ipfs://QmTest'
          });
        }
        return Promise.resolve({
          provider: '0x654321fedcba',
          languages: ['zh-CN', 'en-US', 'ja-JP'],
          performanceScore: originalModule.BigNumber.from(92),
          pricePerToken: originalModule.utils.parseEther('15'),
          isActive: true,
          metadataURI: 'ipfs://QmTest2'
        });
      }),
      approve: jest.fn().mockImplementation(() => ({
        hash: '0xapprovetxhash',
        wait: jest.fn().mockResolvedValue({
          status: 1
        })
      })),
      createRequest: jest.fn().mockImplementation(() => ({
        hash: '0xrequesttxhash',
        wait: jest.fn().mockResolvedValue({
          status: 1,
          events: [
            {
              event: 'RequestCreated',
              args: {
                requestId: '0'
              }
            }
          ]
        })
      })),
      useNFT: jest.fn().mockImplementation(() => ({
        hash: '0xusenfttxhash',
        wait: jest.fn().mockResolvedValue({
          status: 1
        })
      })),
      verifyTranslation: jest.fn().mockImplementation(() => ({
        hash: '0xverifytxhash',
        wait: jest.fn().mockResolvedValue({
          status: 1
        })
      }))
    }))
  };
});

// Mock Web3Modal
jest.mock('web3modal', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      on: jest.fn(),
      request: jest.fn().mockResolvedValue(['0x123456789abcdef'])
    })
  }));
});

// Mock IPFS client
jest.mock('ipfs-http-client', () => ({
  create: jest.fn().mockReturnValue({
    add: jest.fn().mockResolvedValue({ path: 'QmTestHash' }),
    cat: jest.fn().mockImplementation(() => {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      return {
        [Symbol.asyncIterator]: async function* () {
          yield encoder.encode(JSON.stringify({
            name: 'Test NFT',
            description: 'Test description',
            image: 'ipfs://QmTestImage'
          }));
        }
      };
    })
  })
}));

// Mock getLibrary function for Web3ReactProvider
function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

// Mock window.ethereum
global.window.ethereum = {
  isMetaMask: true,
  request: jest.fn().mockResolvedValue(['0x123456789abcdef']),
  on: jest.fn(),
  removeListener: jest.fn()
};

// Mock window.matchMedia
window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

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
    expect(screen.getByText(/源语言:/i)).toBeInTheDocument();
    expect(screen.getByText(/目标语言:/i)).toBeInTheDocument();
    expect(screen.getByText(/翻译模式:/i)).toBeInTheDocument();
    expect(screen.getByText(/隐私级别:/i)).toBeInTheDocument();
    expect(screen.getByText(/AI服务:/i)).toBeInTheDocument();
    
    // Check for wallet connection status
    expect(screen.getByText(/BNB链已连接/i)).toBeInTheDocument();
    
    // Check for wallet address display
    const walletAddressElement = screen.getByText(/0x1234...cdef/i);
    expect(walletAddressElement).toBeInTheDocument();
    
    // Check for token balance
    const tokenBalanceElement = screen.getByText(/100.00 CULT/i);
    expect(tokenBalanceElement).toBeInTheDocument();
    
    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByText(/服务 #0 - 评分: 85\/100/i)).toBeInTheDocument();
    });
  });

  test('allows language selection', async () => {
    // Find language selectors
    const sourceLanguageSelect = screen.getByLabelText(/源语言:/i);
    const targetLanguageSelect = screen.getByLabelText(/目标语言:/i);
    
    // Change source language
    fireEvent.change(sourceLanguageSelect, { target: { value: 'en-US' } });
    expect(sourceLanguageSelect.value).toBe('en-US');
    
    // Change target language
    fireEvent.change(targetLanguageSelect, { target: { value: 'ja-JP' } });
    expect(targetLanguageSelect.value).toBe('ja-JP');
    
    // Services should be reloaded with new language pair
    await waitFor(() => {
      const mockContract = ethers.Contract.mock.results[0].value;
      expect(mockContract.getAvailableServices).toHaveBeenCalledWith(
        'en-US',
        'ja-JP',
        expect.any(Boolean)
      );
    });
  });

  test('allows translation mode selection', async () => {
    // Find translation mode selector
    const translationModeSelect = screen.getByLabelText(/翻译模式:/i);
    
    // Change translation mode
    fireEvent.change(translationModeSelect, { target: { value: 'professional' } });
    expect(translationModeSelect.value).toBe('professional');
    
    // Services should be reloaded with new mode
    await waitFor(() => {
      const mockContract = ethers.Contract.mock.results[0].value;
      expect(mockContract.getAvailableServices).toHaveBeenCalled();
    });
  });

  test('allows privacy level selection', async () => {
    // Find privacy level selector
    const privacyLevelSelect = screen.getByLabelText(/隐私级别:/i);
    
    // Change privacy level
    fireEvent.change(privacyLevelSelect, { target: { value: 'private' } });
    expect(privacyLevelSelect.value).toBe('private');
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

  test('toggles NFT selection panel', async () => {
    // Find NFT button
    const nftButton = screen.getByTitle(/选择文化NFT/i);
    
    // NFT panel should be closed initially
    const nftPanel = document.querySelector('.nft-selection-panel');
    expect(nftPanel).not.toHaveClass('open');
    
    // Open NFT panel
    fireEvent.click(nftButton);
    
    // NFT panel should be open
    expect(nftPanel).toHaveClass('open');
    
    // Close NFT panel
    const closeButton = within(nftPanel).getByRole('button');
    fireEvent.click(closeButton);
    
    // NFT panel should be closed
    expect(nftPanel).not.toHaveClass('open');
  });

  test('allows NFT selection', async () => {
    // Open NFT panel
    const nftButton = screen.getByTitle(/选择文化NFT/i);
    fireEvent.click(nftButton);
    
    // Wait for NFTs to load
    await waitFor(() => {
      const nftItems = document.querySelectorAll('.nft-item');
      expect(nftItems.length).toBe(2);
    });
    
    // Find NFT items
    const nftItems = document.querySelectorAll('.nft-item');
    
    // Select first NFT
    fireEvent.click(nftItems[0]);
    expect(nftItems[0]).toHaveClass('selected');
    
    // Select second NFT
    fireEvent.click(nftItems[1]);
    expect(nftItems[1]).toHaveClass('selected');
    
    // Deselect first NFT
    fireEvent.click(nftItems[0]);
    expect(nftItems[0]).not.toHaveClass('selected');
  });

  test('performs translation', async () => {
    // Find input textarea and translate button
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByTitle(/翻译$/i);
    
    // Enter text
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    expect(inputTextarea.value).toBe('这是一个测试。');
    
    // Click translate button
    fireEvent.click(translateButton);
    
    // Should show loading state
    expect(screen.getByText(/处理中/i)).toBeInTheDocument();
    
    // Wait for translation result
    await waitFor(() => {
      expect(screen.getByText(/\[Translated\] 这是一个测试。/i)).toBeInTheDocument();
    });
    
    // Verify that blockchain transactions were initiated
    const mockContract = ethers.Contract.mock.results[0].value;
    expect(mockContract.approve).toHaveBeenCalled();
    expect(mockContract.createRequest).toHaveBeenCalled();
  });

  test('toggles original/translated text display', async () => {
    // Perform translation first
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByTitle(/翻译$/i);
    
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    fireEvent.click(translateButton);
    
    // Wait for translation result
    await waitFor(() => {
      expect(screen.getByText(/\[Translated\] 这是一个测试。/i)).toBeInTheDocument();
    });
    
    // Find translation message
    const translationMessage = screen.getByText(/\[Translated\] 这是一个测试。/i).closest('.translation-message');
    
    // Click to toggle original/translated text
    fireEvent.click(translationMessage);
    
    // Check if original text is displayed
    await waitFor(() => {
      const swipeableInner = translationMessage.querySelector('.swipeable-message-inner');
      expect(swipeableInner.style.transform).toBe('translateX(-50%)');
    });
    
    // Click again to toggle back
    fireEvent.click(translationMessage);
    
    // Check if translated text is displayed
    await waitFor(() => {
      const swipeableInner = translationMessage.querySelector('.swipeable-message-inner');
      expect(swipeableInner.style.transform).toBe('');
    });
  });

  test('allows quality rating submission', async () => {
    // Perform translation first
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByTitle(/翻译$/i);
    
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    fireEvent.click(translateButton);
    
    // Wait for translation result and quality rating to appear
    await waitFor(() => {
      expect(screen.getByText(/翻译质量评分/i)).toBeInTheDocument();
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
      const mockContract = ethers.Contract.mock.results[0].value;
      expect(mockContract.verifyTranslation).toHaveBeenCalledWith(
        '0',
        85
      );
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/感谢您的评分/i)).toBeInTheDocument();
    });
  });

  test('handles voice input', async () => {
    // Find voice button
    const voiceButton = screen.getByTitle(/语音输入/i);
    
    // Click voice button to start recording
    fireEvent.click(voiceButton);
    
    // Should show recording state
    expect(voiceButton).toHaveClass('recording');
    
    // Verify that SpeechRecognition was started
    expect(window.SpeechRecognition).toHaveBeenCalled();
    expect(window.SpeechRecognition.mock.instances[0].start).toHaveBeenCalled();
    
    // Click voice button again to stop recording
    fireEvent.click(voiceButton);
    
    // Should not show recording state
    expect(voiceButton).not.toHaveClass('recording');
    
    // Verify that SpeechRecognition was stopped
    expect(window.SpeechRecognition.mock.instances[0].stop).toHaveBeenCalled();
  });

  test('handles keyboard shortcuts', async () => {
    // Find input textarea
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    
    // Enter text
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    
    // Press Enter to send
    fireEvent.keyPress(inputTextarea, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Wait for translation result
    await waitFor(() => {
      expect(screen.getByText(/\[Translated\] 这是一个测试。/i)).toBeInTheDocument();
    });
    
    // Press Shift+Enter should not send
    fireEvent.change(inputTextarea, { target: { value: '第二个测试。' } });
    fireEvent.keyPress(inputTextarea, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });
    
    // Should not create a new message
    const messages = document.querySelectorAll('.message');
    expect(messages.length).toBe(3); // User message + translation + system message
  });

  test('displays pending transactions', async () => {
    // Perform translation to trigger transactions
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByTitle(/翻译$/i);
    
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    fireEvent.click(translateButton);
    
    // Wait for pending transactions to appear
    await waitFor(() => {
      const pendingTx = document.querySelector('.pending-transaction');
      expect(pendingTx).toBeInTheDocument();
    });
    
    // Check for transaction link
    const txLink = document.querySelector('.tx-link');
    expect(txLink).toHaveAttribute('href', expect.stringContaining('https://testnet.bscscan.com/tx/'));
  });

  test('handles dark mode', async () => {
    // Mock dark mode preference
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));
    
    // Re-render component
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <BlockchainTranslationChat />
      </Web3ReactProvider>
    );
    
    // Check if dark mode class is applied
    const container = document.querySelector('.blockchain-chat-container');
    expect(container).toHaveClass('dark-mode');
  });
});

// Additional tests for specific blockchain interactions
describe('BlockchainTranslationChat Blockchain Interactions', () => {
  beforeEach(() => {
    AIServiceConnector.mockClear();
    
    render(
      <Web3ReactProvider getLibrary={getLibrary}>
        <BlockchainTranslationChat />
      </Web3ReactProvider>
    );
  });

  test('handles transaction failures gracefully', async () => {
    // Mock a failed transaction
    const mockContract = ethers.Contract.mock.results[0].value;
    mockContract.approve.mockImplementationOnce(() => {
      throw new Error('Transaction failed');
    });
    
    // Perform translation
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByTitle(/翻译$/i);
    
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    fireEvent.click(translateButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/发送消息失败/i)).toBeInTheDocument();
    });
  });

  test('displays cultural context hints when available', async () => {
    // Perform translation
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByTitle(/翻译$/i);
    
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    fireEvent.click(translateButton);
    
    // Wait for translation result
    await waitFor(() => {
      expect(screen.getByText(/\[Translated\] 这是一个测试。/i)).toBeInTheDocument();
    });
    
    // Check if cultural context hint is displayed (depends on random factor in component)
    const culturalContextHint = document.querySelector('.cultural-context-hint');
    if (culturalContextHint) {
      expect(culturalContextHint).toBeInTheDocument();
      expect(screen.getByText(/文化上下文/i)).toBeInTheDocument();
    }
  });

  test('displays learning suggestions when available', async () => {
    // Perform translation
    const inputTextarea = screen.getByPlaceholderText(/输入要翻译的文本/i);
    const translateButton = screen.getByTitle(/翻译$/i);
    
    fireEvent.change(inputTextarea, { target: { value: '这是一个测试。' } });
    fireEvent.click(translateButton);
    
    // Wait for translation result
    await waitFor(() => {
      expect(screen.getByText(/\[Translated\] 这是一个测试。/i)).toBeInTheDocument();
    });
    
    // Check if learning suggestion is displayed (depends on random factor in component)
    const learningSuggestion = document.querySelector('.language-learning-suggestion');
    if (learningSuggestion) {
      expect(learningSuggestion).toBeInTheDocument();
      expect(screen.getByText(/学习建议/i)).toBeInTheDocument();
    }
  });
});
