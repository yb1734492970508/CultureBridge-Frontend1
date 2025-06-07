/**
 * 区块链翻译聊天组件测试文件
 * 用于测试前端与本地Hardhat网络部署的智能合约交互
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlockchainTranslationChatLocal from '../../components/chat/BlockchainTranslationChatLocal';

// 模拟ethers库
jest.mock('ethers', () => {
  const original = jest.requireActual('ethers');
  return {
    ...original,
    ethers: {
      ...original.ethers,
      providers: {
        Web3Provider: jest.fn().mockImplementation(() => ({
          getNetwork: jest.fn().mockResolvedValue({ chainId: 31337 }),
          listAccounts: jest.fn().mockResolvedValue(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']),
          getSigner: jest.fn().mockReturnValue({
            getAddress: jest.fn().mockResolvedValue('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
          })
        }))
      },
      Contract: jest.fn().mockImplementation(() => ({
        balanceOf: jest.fn().mockResolvedValue(ethers.utils.parseEther('100')),
        approve: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue(true)
        }),
        createRequest: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue(true)
        })
      })),
      utils: {
        parseEther: jest.fn().mockImplementation((value) => value + '000000000000000000'),
        formatEther: jest.fn().mockImplementation((value) => value.replace('000000000000000000', ''))
      }
    }
  };
});

// 模拟合约配置
jest.mock('../../config/contracts', () => ({
  hardhat: {
    networkName: 'Hardhat本地网络',
    chainId: 31337,
    blockExplorer: '',
    rpcUrl: 'http://localhost:8545',
    CultureToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    AIRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    CulturalNFT: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    TranslationMarket: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  }
}));

// 模拟合约ABI
jest.mock('../../contracts/abis/CultureToken.json', () => ({
  abi: [
    {
      name: 'balanceOf',
      type: 'function',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }]
    },
    {
      name: 'approve',
      type: 'function',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    }
  ]
}));

jest.mock('../../contracts/abis/AIRegistry.json', () => ({
  abi: []
}));

jest.mock('../../contracts/abis/CulturalNFT.json', () => ({
  abi: []
}));

jest.mock('../../contracts/abis/TranslationMarket.json', () => ({
  abi: [
    {
      name: 'createRequest',
      type: 'function',
      inputs: [
        { name: 'contentHash', type: 'string' },
        { name: 'sourceLanguage', type: 'string' },
        { name: 'targetLanguage', type: 'string' },
        { name: 'reward', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'isAIAssisted', type: 'bool' }
      ],
      outputs: [{ name: '', type: 'bytes32' }]
    }
  ]
}));

// 模拟ToastNotification组件
jest.mock('../../components/notifications/ToastNotification', () => {
  return function DummyToastNotification(props) {
    return (
      <div data-testid="toast-notification">
        {props.message} - {props.type}
      </div>
    );
  };
});

// 模拟window.ethereum
global.ethereum = {
  request: jest.fn().mockResolvedValue(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']),
  on: jest.fn(),
  removeListener: jest.fn()
};

describe('BlockchainTranslationChatLocal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('渲染连接钱包按钮', () => {
    render(<BlockchainTranslationChatLocal />);
    expect(screen.getByText(/连接钱包/i)).toBeInTheDocument();
  });

  test('连接钱包后显示账户信息', async () => {
    render(<BlockchainTranslationChatLocal />);
    
    // 点击连接钱包按钮
    fireEvent.click(screen.getByText(/连接钱包/i));
    
    // 等待账户信息显示
    await waitFor(() => {
      expect(screen.getByText(/本地网络/i)).toBeInTheDocument();
      expect(screen.getByText(/0xf39F/i)).toBeInTheDocument();
    });
  });

  test('连接钱包后显示标签页', async () => {
    render(<BlockchainTranslationChatLocal />);
    
    // 点击连接钱包按钮
    fireEvent.click(screen.getByText(/连接钱包/i));
    
    // 等待标签页显示
    await waitFor(() => {
      expect(screen.getByText(/翻译请求/i)).toBeInTheDocument();
      expect(screen.getByText(/我的NFT/i)).toBeInTheDocument();
      expect(screen.getByText(/AI服务/i)).toBeInTheDocument();
      expect(screen.getByText(/创建请求/i)).toBeInTheDocument();
    });
  });

  test('切换标签页显示对应内容', async () => {
    render(<BlockchainTranslationChatLocal />);
    
    // 点击连接钱包按钮
    fireEvent.click(screen.getByText(/连接钱包/i));
    
    // 等待标签页显示并点击"创建请求"标签
    await waitFor(() => {
      expect(screen.getByText(/创建请求/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText(/创建请求/i));
    
    // 验证创建请求表单显示
    expect(screen.getByText(/创建新的翻译请求/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/内容/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/源语言/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/目标语言/i)).toBeInTheDocument();
  });

  test('填写并提交翻译请求表单', async () => {
    render(<BlockchainTranslationChatLocal />);
    
    // 点击连接钱包按钮
    fireEvent.click(screen.getByText(/连接钱包/i));
    
    // 等待标签页显示并点击"创建请求"标签
    await waitFor(() => {
      expect(screen.getByText(/创建请求/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText(/创建请求/i));
    
    // 填写表单
    fireEvent.change(screen.getByLabelText(/内容/i), {
      target: { value: '这是一个测试翻译请求' }
    });
    
    fireEvent.change(screen.getByLabelText(/源语言/i), {
      target: { value: 'zh' }
    });
    
    fireEvent.change(screen.getByLabelText(/目标语言/i), {
      target: { value: 'en' }
    });
    
    fireEvent.change(screen.getByLabelText(/奖励/i), {
      target: { value: '20' }
    });
    
    // 设置截止日期（明天）
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 16);
    
    fireEvent.change(screen.getByLabelText(/截止日期/i), {
      target: { value: tomorrowStr }
    });
    
    // 勾选AI辅助选项
    fireEvent.click(screen.getByLabelText(/允许AI辅助翻译/i));
    
    // 提交表单
    fireEvent.click(screen.getByText(/创建翻译请求/i));
    
    // 验证成功通知显示
    await waitFor(() => {
      expect(screen.getByTestId('toast-notification')).toHaveTextContent(/翻译请求创建成功/i);
    });
  });
});
