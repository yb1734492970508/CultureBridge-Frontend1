import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceTranslator from '../components/voice/VoiceTranslator';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the API services
jest.mock('../services/api', () => ({
  voiceAPI: {
    getSupportedLanguages: jest.fn(),
    getTranslationHistory: jest.fn(),
    translateVoice: jest.fn(),
    textToSpeech: jest.fn(),
    deleteTranslation: jest.fn()
  }
}));

// Mock socket service
jest.mock('../services/socketService', () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
}));

// Mock MediaRecorder
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: null,
  onstop: null
}));

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn()
  },
  writable: true
});

const MockAuthProvider = ({ children, isAuthenticated = true }) => {
  const mockValue = {
    user: { id: '1', username: 'testuser' },
    isAuthenticated,
    login: jest.fn(),
    logout: jest.fn()
  };

  return (
    <AuthProvider value={mockValue}>
      {children}
    </AuthProvider>
  );
};

describe('VoiceTranslator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders not authenticated message when user is not logged in', () => {
    render(
      <MockAuthProvider isAuthenticated={false}>
        <VoiceTranslator />
      </MockAuthProvider>
    );

    expect(screen.getByText('请登录以使用语音翻译功能。')).toBeInTheDocument();
  });

  test('renders voice translator when authenticated', async () => {
    const { voiceAPI } = require('../services/api');
    
    voiceAPI.getSupportedLanguages.mockResolvedValue({
      languages: [
        { code: 'en', name: 'English' },
        { code: 'zh', name: 'Chinese' },
        { code: 'es', name: 'Spanish' }
      ]
    });
    
    voiceAPI.getTranslationHistory.mockResolvedValue({
      history: []
    });

    render(
      <MockAuthProvider>
        <VoiceTranslator />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('语音翻译')).toBeInTheDocument();
    });

    expect(screen.getByText('开始录音')).toBeInTheDocument();
    expect(screen.getByText('点击麦克风开始录音')).toBeInTheDocument();
  });

  test('handles language selection', async () => {
    const { voiceAPI } = require('../services/api');
    
    voiceAPI.getSupportedLanguages.mockResolvedValue({
      languages: [
        { code: 'en', name: 'English' },
        { code: 'zh', name: 'Chinese' }
      ]
    });
    
    voiceAPI.getTranslationHistory.mockResolvedValue({ history: [] });

    render(
      <MockAuthProvider>
        <VoiceTranslator />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('语音翻译')).toBeInTheDocument();
    });

    // Check if language options are available
    const sourceLanguageSelect = screen.getByDisplayValue('自动检测');
    const targetLanguageSelect = screen.getByDisplayValue('English');

    expect(sourceLanguageSelect).toBeInTheDocument();
    expect(targetLanguageSelect).toBeInTheDocument();

    // Change target language
    fireEvent.change(targetLanguageSelect, { target: { value: 'zh' } });
    expect(targetLanguageSelect.value).toBe('zh');
  });

  test('handles recording start and stop', async () => {
    const { voiceAPI } = require('../services/api');
    
    voiceAPI.getSupportedLanguages.mockResolvedValue({
      languages: [{ code: 'en', name: 'English' }]
    });
    voiceAPI.getTranslationHistory.mockResolvedValue({ history: [] });

    const mockStream = {
      getTracks: () => [{ stop: jest.fn() }]
    };
    navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

    render(
      <MockAuthProvider>
        <VoiceTranslator />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('开始录音')).toBeInTheDocument();
    });

    // Start recording
    fireEvent.click(screen.getByText('开始录音'));

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    await waitFor(() => {
      expect(screen.getByText('停止录音')).toBeInTheDocument();
    });

    // Stop recording
    fireEvent.click(screen.getByText('停止录音'));

    await waitFor(() => {
      expect(screen.getByText('开始录音')).toBeInTheDocument();
    });
  });

  test('displays translation history', async () => {
    const { voiceAPI } = require('../services/api');
    
    voiceAPI.getSupportedLanguages.mockResolvedValue({
      languages: [{ code: 'en', name: 'English' }]
    });
    
    voiceAPI.getTranslationHistory.mockResolvedValue({
      history: [
        {
          _id: '1',
          originalText: 'Hello',
          translatedText: '你好',
          sourceLanguage: 'en',
          targetLanguage: 'zh',
          timestamp: new Date().toISOString()
        }
      ]
    });

    render(
      <MockAuthProvider>
        <VoiceTranslator />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('翻译历史')).toBeInTheDocument();
    });

    expect(screen.getByText('原文 (en): Hello')).toBeInTheDocument();
    expect(screen.getByText('译文 (zh): 你好')).toBeInTheDocument();
  });

  test('handles translation deletion', async () => {
    const { voiceAPI } = require('../services/api');
    
    voiceAPI.getSupportedLanguages.mockResolvedValue({
      languages: [{ code: 'en', name: 'English' }]
    });
    
    voiceAPI.getTranslationHistory.mockResolvedValue({
      history: [
        {
          _id: '1',
          originalText: 'Hello',
          translatedText: '你好',
          sourceLanguage: 'en',
          targetLanguage: 'zh',
          timestamp: new Date().toISOString()
        }
      ]
    });

    voiceAPI.deleteTranslation.mockResolvedValue({ success: true });

    render(
      <MockAuthProvider>
        <VoiceTranslator />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('翻译历史')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByTitle('删除记录');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(voiceAPI.deleteTranslation).toHaveBeenCalledWith('1');
    });
  });
});

