/**
 * 翻译状态管理
 * 处理翻译相关的状态和操作
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步action：文本翻译
export const translateText = createAsyncThunk(
  'translation/translateText',
  async ({ text, sourceLang, targetLang }, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              translatedText: `翻译结果: ${text}`,
              sourceLang,
              targetLang,
              confidence: 0.95
            }
          });
        }, 1000);
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 翻译状态
  isTranslating: false,
  translatedText: '',
  sourceText: '',
  sourceLang: 'zh-CN',
  targetLang: 'en-US',
  
  // 历史记录
  history: [],
  
  // 错误信息
  error: null,
  
  // 语音翻译
  isRecording: false,
  isPlaying: false,
  
  // 支持的语言
  supportedLanguages: [
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' }
  ]
};

// 创建slice
const translationSlice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    // 设置源文本
    setSourceText: (state, action) => {
      state.sourceText = action.payload;
    },
    
    // 设置翻译文本
    setTranslatedText: (state, action) => {
      state.translatedText = action.payload;
    },
    
    // 设置源语言
    setSourceLang: (state, action) => {
      state.sourceLang = action.payload;
    },
    
    // 设置目标语言
    setTargetLang: (state, action) => {
      state.targetLang = action.payload;
    },
    
    // 交换语言
    swapLanguages: (state) => {
      const tempLang = state.sourceLang;
      state.sourceLang = state.targetLang;
      state.targetLang = tempLang;
      
      const tempText = state.sourceText;
      state.sourceText = state.translatedText;
      state.translatedText = tempText;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 添加到历史记录
    addToHistory: (state, action) => {
      const newItem = {
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.history.unshift(newItem);
      
      // 限制历史记录数量
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
    },
    
    // 清空历史记录
    clearHistory: (state) => {
      state.history = [];
    },
    
    // 设置录音状态
    setRecording: (state, action) => {
      state.isRecording = action.payload;
    },
    
    // 设置播放状态
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 文本翻译
    builder
      .addCase(translateText.pending, (state) => {
        state.isTranslating = true;
        state.error = null;
      })
      .addCase(translateText.fulfilled, (state, action) => {
        state.isTranslating = false;
        state.translatedText = action.payload.translatedText;
        
        // 添加到历史记录
        const historyItem = {
          id: Date.now(),
          sourceText: state.sourceText,
          translatedText: action.payload.translatedText,
          sourceLang: state.sourceLang,
          targetLang: state.targetLang,
          type: 'text',
          confidence: action.payload.confidence,
          timestamp: new Date().toISOString()
        };
        state.history.unshift(historyItem);
        
        // 限制历史记录数量
        if (state.history.length > 50) {
          state.history = state.history.slice(0, 50);
        }
      })
      .addCase(translateText.rejected, (state, action) => {
        state.isTranslating = false;
        state.error = action.payload;
      });
  },
});

// 导出actions
export const {
  setSourceText,
  setTranslatedText,
  setSourceLang,
  setTargetLang,
  swapLanguages,
  clearError,
  addToHistory,
  clearHistory,
  setRecording,
  setPlaying,
} = translationSlice.actions;

// 选择器
export const selectTranslation = (state) => state.translation;
export const selectSourceText = (state) => state.translation.sourceText;
export const selectTranslatedText = (state) => state.translation.translatedText;
export const selectSourceLang = (state) => state.translation.sourceLang;
export const selectTargetLang = (state) => state.translation.targetLang;
export const selectIsTranslating = (state) => state.translation.isTranslating;
export const selectTranslationHistory = (state) => state.translation.history;
export const selectSupportedLanguages = (state) => state.translation.supportedLanguages;
export const selectIsRecording = (state) => state.translation.isRecording;
export const selectIsPlaying = (state) => state.translation.isPlaying;
export const selectTranslationError = (state) => state.translation.error;

// 导出reducer
export default translationSlice.reducer;

