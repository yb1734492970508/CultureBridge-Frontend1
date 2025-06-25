/**
 * 翻译状态管理
 * 处理实时翻译、语音识别、语音合成等功能
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { translationAPI } from '../services/api';

// 异步action：文本翻译
export const translateText = createAsyncThunk(
  'translation/translateText',
  async ({ text, sourceLang, targetLang }, { rejectWithValue }) => {
    try {
      const response = await translationAPI.translateText(text, sourceLang, targetLang);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：语音识别
export const speechToText = createAsyncThunk(
  'translation/speechToText',
  async ({ audioBlob, language }, { rejectWithValue }) => {
    try {
      const response = await translationAPI.speechToText(audioBlob, language);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：语音合成
export const textToSpeech = createAsyncThunk(
  'translation/textToSpeech',
  async ({ text, language, voice }, { rejectWithValue }) => {
    try {
      const response = await translationAPI.textToSpeech(text, language, voice);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：检测语言
export const detectLanguage = createAsyncThunk(
  'translation/detectLanguage',
  async (text, { rejectWithValue }) => {
    try {
      const response = await translationAPI.detectLanguage(text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：批量翻译
export const batchTranslate = createAsyncThunk(
  'translation/batchTranslate',
  async ({ texts, sourceLang, targetLang }, { rejectWithValue }) => {
    try {
      const response = await translationAPI.batchTranslate(texts, sourceLang, targetLang);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 支持的语言列表
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  ],
  
  // 当前翻译设置
  currentTranslation: {
    sourceLang: 'auto',
    targetLang: 'en',
    sourceText: '',
    translatedText: '',
    confidence: 0,
    detectedLang: null,
  },
  
  // 翻译历史
  history: [],
  
  // 收藏的翻译
  favorites: [],
  
  // 语音识别状态
  speechRecognition: {
    isListening: false,
    isSupported: false,
    recognizedText: '',
    confidence: 0,
    language: 'en',
    continuous: false,
    interimResults: true,
  },
  
  // 语音合成状态
  speechSynthesis: {
    isPlaying: false,
    isSupported: false,
    currentText: '',
    language: 'en',
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
  },
  
  // 实时翻译
  realTimeTranslation: {
    isEnabled: false,
    sourceLang: 'auto',
    targetLang: 'en',
    translations: [], // 实时翻译结果队列
    maxQueueSize: 50,
  },
  
  // 翻译缓存
  cache: {}, // { "text|sourceLang|targetLang": { translation, timestamp } }
  
  // 翻译统计
  statistics: {
    totalTranslations: 0,
    charactersTranslated: 0,
    languagePairs: {},
    mostUsedLanguages: [],
    dailyUsage: {},
  },
  
  // 翻译设置
  settings: {
    autoDetectLanguage: true,
    enableCache: true,
    cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
    enableRealTime: false,
    showConfidence: true,
    enableSpeech: true,
    speechRate: 1,
    speechPitch: 1,
    speechVolume: 1,
    preferredVoices: {},
  },
  
  // 语言检测
  languageDetection: {
    isDetecting: false,
    detectedLanguage: null,
    confidence: 0,
    alternatives: [],
  },
  
  // 翻译质量评估
  quality: {
    currentScore: 0,
    feedback: [],
    improvements: [],
  },
  
  // 离线翻译
  offline: {
    isSupported: false,
    downloadedLanguages: [],
    availableLanguages: [],
    isDownloading: false,
    downloadProgress: {},
  },
  
  // 错误和加载状态
  isLoading: false,
  isTranslating: false,
  error: null,
  
  // 批量翻译
  batch: {
    isProcessing: false,
    queue: [],
    results: [],
    progress: 0,
  },
};

// 创建slice
const translationSlice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置源语言
    setSourceLanguage: (state, action) => {
      state.currentTranslation.sourceLang = action.payload;
      state.realTimeTranslation.sourceLang = action.payload;
    },
    
    // 设置目标语言
    setTargetLanguage: (state, action) => {
      state.currentTranslation.targetLang = action.payload;
      state.realTimeTranslation.targetLang = action.payload;
    },
    
    // 交换语言
    swapLanguages: (state) => {
      const { sourceLang, targetLang } = state.currentTranslation;
      if (sourceLang !== 'auto') {
        state.currentTranslation.sourceLang = targetLang;
        state.currentTranslation.targetLang = sourceLang;
        
        // 交换文本
        const sourceText = state.currentTranslation.sourceText;
        const translatedText = state.currentTranslation.translatedText;
        state.currentTranslation.sourceText = translatedText;
        state.currentTranslation.translatedText = sourceText;
      }
    },
    
    // 设置源文本
    setSourceText: (state, action) => {
      state.currentTranslation.sourceText = action.payload;
    },
    
    // 清除翻译
    clearTranslation: (state) => {
      state.currentTranslation.sourceText = '';
      state.currentTranslation.translatedText = '';
      state.currentTranslation.confidence = 0;
      state.currentTranslation.detectedLang = null;
    },
    
    // 添加到历史记录
    addToHistory: (state, action) => {
      const translation = {
        ...action.payload,
        id: Date.now(),
        timestamp: Date.now(),
      };
      
      // 避免重复
      const exists = state.history.find(h => 
        h.sourceText === translation.sourceText &&
        h.translatedText === translation.translatedText &&
        h.sourceLang === translation.sourceLang &&
        h.targetLang === translation.targetLang
      );
      
      if (!exists) {
        state.history.unshift(translation);
        
        // 限制历史记录数量
        if (state.history.length > 1000) {
          state.history = state.history.slice(0, 1000);
        }
        
        // 更新统计
        state.statistics.totalTranslations += 1;
        state.statistics.charactersTranslated += translation.sourceText.length;
        
        // 更新语言对统计
        const langPair = `${translation.sourceLang}-${translation.targetLang}`;
        state.statistics.languagePairs[langPair] = (state.statistics.languagePairs[langPair] || 0) + 1;
      }
    },
    
    // 添加到收藏
    addToFavorites: (state, action) => {
      const translation = action.payload;
      const exists = state.favorites.find(f => f.id === translation.id);
      
      if (!exists) {
        state.favorites.unshift({
          ...translation,
          favoriteId: Date.now(),
          favoritedAt: Date.now(),
        });
      }
    },
    
    // 从收藏中移除
    removeFromFavorites: (state, action) => {
      const translationId = action.payload;
      state.favorites = state.favorites.filter(f => f.id !== translationId);
    },
    
    // 清除历史记录
    clearHistory: (state) => {
      state.history = [];
    },
    
    // 语音识别控制
    startSpeechRecognition: (state, action) => {
      state.speechRecognition.isListening = true;
      state.speechRecognition.language = action.payload?.language || state.speechRecognition.language;
      state.speechRecognition.recognizedText = '';
    },
    
    stopSpeechRecognition: (state) => {
      state.speechRecognition.isListening = false;
    },
    
    setSpeechRecognitionResult: (state, action) => {
      const { text, confidence, isFinal } = action.payload;
      state.speechRecognition.recognizedText = text;
      state.speechRecognition.confidence = confidence;
      
      if (isFinal) {
        state.currentTranslation.sourceText = text;
      }
    },
    
    setSpeechRecognitionSupport: (state, action) => {
      state.speechRecognition.isSupported = action.payload;
    },
    
    // 语音合成控制
    startSpeechSynthesis: (state, action) => {
      state.speechSynthesis.isPlaying = true;
      state.speechSynthesis.currentText = action.payload.text;
      state.speechSynthesis.language = action.payload.language;
    },
    
    stopSpeechSynthesis: (state) => {
      state.speechSynthesis.isPlaying = false;
      state.speechSynthesis.currentText = '';
    },
    
    setSpeechSynthesisSettings: (state, action) => {
      state.speechSynthesis = { ...state.speechSynthesis, ...action.payload };
    },
    
    setSpeechSynthesisSupport: (state, action) => {
      state.speechSynthesis.isSupported = action.payload;
    },
    
    // 实时翻译
    enableRealTimeTranslation: (state) => {
      state.realTimeTranslation.isEnabled = true;
    },
    
    disableRealTimeTranslation: (state) => {
      state.realTimeTranslation.isEnabled = false;
      state.realTimeTranslation.translations = [];
    },
    
    addRealTimeTranslation: (state, action) => {
      const translation = {
        ...action.payload,
        id: Date.now(),
        timestamp: Date.now(),
      };
      
      state.realTimeTranslation.translations.unshift(translation);
      
      // 限制队列大小
      if (state.realTimeTranslation.translations.length > state.realTimeTranslation.maxQueueSize) {
        state.realTimeTranslation.translations = state.realTimeTranslation.translations.slice(
          0, 
          state.realTimeTranslation.maxQueueSize
        );
      }
    },
    
    // 缓存管理
    addToCache: (state, action) => {
      const { text, sourceLang, targetLang, translation } = action.payload;
      const key = `${text}|${sourceLang}|${targetLang}`;
      
      state.cache[key] = {
        translation,
        timestamp: Date.now(),
      };
    },
    
    clearCache: (state) => {
      state.cache = {};
    },
    
    cleanExpiredCache: (state) => {
      const now = Date.now();
      const expiry = state.settings.cacheExpiry;
      
      Object.keys(state.cache).forEach(key => {
        if (now - state.cache[key].timestamp > expiry) {
          delete state.cache[key];
        }
      });
    },
    
    // 语言检测
    startLanguageDetection: (state) => {
      state.languageDetection.isDetecting = true;
    },
    
    setDetectedLanguage: (state, action) => {
      const { language, confidence, alternatives } = action.payload;
      state.languageDetection = {
        isDetecting: false,
        detectedLanguage: language,
        confidence,
        alternatives: alternatives || [],
      };
      
      state.currentTranslation.detectedLang = language;
    },
    
    // 翻译设置
    updateTranslationSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // 翻译质量
    setTranslationQuality: (state, action) => {
      state.quality = { ...state.quality, ...action.payload };
    },
    
    addQualityFeedback: (state, action) => {
      state.quality.feedback.push({
        ...action.payload,
        timestamp: Date.now(),
      });
    },
    
    // 离线翻译
    setOfflineSupport: (state, action) => {
      state.offline.isSupported = action.payload;
    },
    
    setDownloadedLanguages: (state, action) => {
      state.offline.downloadedLanguages = action.payload;
    },
    
    startLanguageDownload: (state, action) => {
      const language = action.payload;
      state.offline.isDownloading = true;
      state.offline.downloadProgress[language] = 0;
    },
    
    updateDownloadProgress: (state, action) => {
      const { language, progress } = action.payload;
      state.offline.downloadProgress[language] = progress;
    },
    
    completeLanguageDownload: (state, action) => {
      const language = action.payload;
      state.offline.isDownloading = false;
      delete state.offline.downloadProgress[language];
      
      if (!state.offline.downloadedLanguages.includes(language)) {
        state.offline.downloadedLanguages.push(language);
      }
    },
    
    // 批量翻译
    startBatchTranslation: (state, action) => {
      state.batch.isProcessing = true;
      state.batch.queue = action.payload;
      state.batch.results = [];
      state.batch.progress = 0;
    },
    
    updateBatchProgress: (state, action) => {
      state.batch.progress = action.payload;
    },
    
    addBatchResult: (state, action) => {
      state.batch.results.push(action.payload);
    },
    
    completeBatchTranslation: (state) => {
      state.batch.isProcessing = false;
      state.batch.progress = 100;
    },
    
    // 统计更新
    updateDailyUsage: (state) => {
      const today = new Date().toDateString();
      state.statistics.dailyUsage[today] = (state.statistics.dailyUsage[today] || 0) + 1;
    },
    
    updateMostUsedLanguages: (state) => {
      const langCounts = {};
      
      state.history.forEach(translation => {
        langCounts[translation.sourceLang] = (langCounts[translation.sourceLang] || 0) + 1;
        langCounts[translation.targetLang] = (langCounts[translation.targetLang] || 0) + 1;
      });
      
      state.statistics.mostUsedLanguages = Object.entries(langCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([lang, count]) => ({ language: lang, count }));
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
        const { translatedText, confidence, detectedLanguage } = action.payload;
        
        state.currentTranslation.translatedText = translatedText;
        state.currentTranslation.confidence = confidence;
        
        if (detectedLanguage) {
          state.currentTranslation.detectedLang = detectedLanguage;
        }
        
        // 添加到缓存
        if (state.settings.enableCache) {
          const { sourceText, sourceLang, targetLang } = state.currentTranslation;
          const key = `${sourceText}|${sourceLang}|${targetLang}`;
          state.cache[key] = {
            translation: translatedText,
            timestamp: Date.now(),
          };
        }
      })
      .addCase(translateText.rejected, (state, action) => {
        state.isTranslating = false;
        state.error = action.payload;
      });
    
    // 语音识别
    builder
      .addCase(speechToText.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(speechToText.fulfilled, (state, action) => {
        state.isLoading = false;
        const { text, confidence } = action.payload;
        state.speechRecognition.recognizedText = text;
        state.speechRecognition.confidence = confidence;
        state.currentTranslation.sourceText = text;
      })
      .addCase(speechToText.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // 语音合成
    builder
      .addCase(textToSpeech.pending, (state) => {
        state.speechSynthesis.isPlaying = true;
      })
      .addCase(textToSpeech.fulfilled, (state, action) => {
        // 语音合成完成后的处理
      })
      .addCase(textToSpeech.rejected, (state, action) => {
        state.speechSynthesis.isPlaying = false;
        state.error = action.payload;
      });
    
    // 语言检测
    builder
      .addCase(detectLanguage.pending, (state) => {
        state.languageDetection.isDetecting = true;
      })
      .addCase(detectLanguage.fulfilled, (state, action) => {
        const { language, confidence, alternatives } = action.payload;
        state.languageDetection = {
          isDetecting: false,
          detectedLanguage: language,
          confidence,
          alternatives: alternatives || [],
        };
        state.currentTranslation.detectedLang = language;
      })
      .addCase(detectLanguage.rejected, (state, action) => {
        state.languageDetection.isDetecting = false;
        state.error = action.payload;
      });
    
    // 批量翻译
    builder
      .addCase(batchTranslate.pending, (state) => {
        state.batch.isProcessing = true;
      })
      .addCase(batchTranslate.fulfilled, (state, action) => {
        state.batch.isProcessing = false;
        state.batch.results = action.payload.translations;
        state.batch.progress = 100;
      })
      .addCase(batchTranslate.rejected, (state, action) => {
        state.batch.isProcessing = false;
        state.error = action.payload;
      });
  },
});

// 导出actions
export const {
  clearError,
  setSourceLanguage,
  setTargetLanguage,
  swapLanguages,
  setSourceText,
  clearTranslation,
  addToHistory,
  addToFavorites,
  removeFromFavorites,
  clearHistory,
  startSpeechRecognition,
  stopSpeechRecognition,
  setSpeechRecognitionResult,
  setSpeechRecognitionSupport,
  startSpeechSynthesis,
  stopSpeechSynthesis,
  setSpeechSynthesisSettings,
  setSpeechSynthesisSupport,
  enableRealTimeTranslation,
  disableRealTimeTranslation,
  addRealTimeTranslation,
  addToCache,
  clearCache,
  cleanExpiredCache,
  startLanguageDetection,
  setDetectedLanguage,
  updateTranslationSettings,
  setTranslationQuality,
  addQualityFeedback,
  setOfflineSupport,
  setDownloadedLanguages,
  startLanguageDownload,
  updateDownloadProgress,
  completeLanguageDownload,
  startBatchTranslation,
  updateBatchProgress,
  addBatchResult,
  completeBatchTranslation,
  updateDailyUsage,
  updateMostUsedLanguages,
} = translationSlice.actions;

// 选择器
export const selectTranslation = (state) => state.translation;
export const selectSupportedLanguages = (state) => state.translation.supportedLanguages;
export const selectCurrentTranslation = (state) => state.translation.currentTranslation;
export const selectTranslationHistory = (state) => state.translation.history;
export const selectFavoriteTranslations = (state) => state.translation.favorites;
export const selectSpeechRecognition = (state) => state.translation.speechRecognition;
export const selectSpeechSynthesis = (state) => state.translation.speechSynthesis;
export const selectRealTimeTranslation = (state) => state.translation.realTimeTranslation;
export const selectTranslationCache = (state) => state.translation.cache;
export const selectTranslationStatistics = (state) => state.translation.statistics;
export const selectTranslationSettings = (state) => state.translation.settings;
export const selectLanguageDetection = (state) => state.translation.languageDetection;
export const selectTranslationQuality = (state) => state.translation.quality;
export const selectOfflineTranslation = (state) => state.translation.offline;
export const selectBatchTranslation = (state) => state.translation.batch;

// 计算选择器
export const selectCachedTranslation = (text, sourceLang, targetLang) => (state) => {
  const key = `${text}|${sourceLang}|${targetLang}`;
  const cached = state.translation.cache[key];
  
  if (cached) {
    const isExpired = Date.now() - cached.timestamp > state.translation.settings.cacheExpiry;
    return isExpired ? null : cached.translation;
  }
  
  return null;
};

export const selectLanguageByCode = (code) => (state) => {
  return state.translation.supportedLanguages.find(lang => lang.code === code);
};

export const selectRecentTranslations = (limit = 10) => (state) => {
  return state.translation.history.slice(0, limit);
};

export const selectTranslationsByLanguagePair = (sourceLang, targetLang) => (state) => {
  return state.translation.history.filter(
    t => t.sourceLang === sourceLang && t.targetLang === targetLang
  );
};

export const selectIsLanguageDownloaded = (language) => (state) => {
  return state.translation.offline.downloadedLanguages.includes(language);
};

export default translationSlice.reducer;

