import axios from 'axios';

/**
 * 翻译服务API
 * 提供文本翻译、语音识别和文化背景信息等功能
 */
class TranslationService {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://api.culturebridge.com/v1';
    this.apiKey = config.apiKey || 'demo_api_key';
    this.manusAIEnabled = config.manusAIEnabled !== undefined ? config.manusAIEnabled : true;
    
    // 创建axios实例
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    // 添加响应拦截器
    this.api.interceptors.response.use(
      response => response.data,
      error => {
        console.error('API错误:', error);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 翻译文本
   * @param {string} text - 要翻译的文本
   * @param {string} sourceLanguage - 源语言代码
   * @param {string} targetLanguage - 目标语言代码
   * @param {Object} options - 额外选项
   * @returns {Promise<Object>} 翻译结果
   */
  async translateText(text, sourceLanguage, targetLanguage, options = {}) {
    try {
      // 在实际应用中，这里会调用真实的API
      // 为演示目的，使用模拟数据
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 简单的中英文模拟翻译逻辑
      let translatedText = '';
      if (sourceLanguage.startsWith('zh') && targetLanguage.startsWith('en')) {
        // 中文到英文的简单映射
        const translations = {
          '你好': 'Hello',
          '早上好': 'Good morning',
          '晚上好': 'Good evening',
          '谢谢': 'Thank you',
          '再见': 'Goodbye',
          '我叫': 'My name is',
          '我喜欢': 'I like',
          '文化': 'culture',
          '语言': 'language',
          '学习': 'learning',
          '朋友': 'friend',
          '中国': 'China',
          '美国': 'America',
          '旅行': 'travel',
          '食物': 'food',
          '音乐': 'music',
          '电影': 'movie',
          '书籍': 'book',
          '工作': 'work',
          '学校': 'school'
        };
        
        translatedText = text;
        Object.keys(translations).forEach(key => {
          translatedText = translatedText.replace(new RegExp(key, 'g'), translations[key]);
        });
        
        // 如果没有匹配到任何词，添加模拟翻译前缀
        if (translatedText === text) {
          translatedText = '[EN] ' + text;
        }
      } else if (sourceLanguage.startsWith('en') && targetLanguage.startsWith('zh')) {
        // 英文到中文的简单映射
        const translations = {
          'Hello': '你好',
          'Good morning': '早上好',
          'Good evening': '晚上好',
          'Thank you': '谢谢',
          'Goodbye': '再见',
          'My name is': '我叫',
          'I like': '我喜欢',
          'culture': '文化',
          'language': '语言',
          'learning': '学习',
          'friend': '朋友',
          'China': '中国',
          'America': '美国',
          'travel': '旅行',
          'food': '食物',
          'music': '音乐',
          'movie': '电影',
          'book': '书籍',
          'work': '工作',
          'school': '学校'
        };
        
        translatedText = text;
        Object.keys(translations).forEach(key => {
          translatedText = translatedText.replace(new RegExp(key, 'gi'), translations[key]);
        });
        
        // 如果没有匹配到任何词，添加模拟翻译前缀
        if (translatedText === text) {
          translatedText = '[中文] ' + text;
        }
      } else {
        // 其他语言对的模拟翻译
        translatedText = `[${targetLanguage}] ${text}`;
      }
      
      // 构造响应
      const response = {
        translatedText,
        sourceLanguage,
        targetLanguage,
        confidence: 0.92,
        detectedLanguage: sourceLanguage
      };
      
      // 如果启用了Manus AI，添加增强功能
      if (this.manusAIEnabled) {
        response.manusAI = await this.getManusAIEnhancements(text, translatedText, sourceLanguage, targetLanguage);
      }
      
      return response;
    } catch (error) {
      console.error('翻译错误:', error);
      throw new Error('翻译服务暂时不可用');
    }
  }
  
  /**
   * 获取Manus AI增强功能
   * @param {string} sourceText - 源文本
   * @param {string} translatedText - 翻译后的文本
   * @param {string} sourceLanguage - 源语言代码
   * @param {string} targetLanguage - 目标语言代码
   * @returns {Promise<Object>} Manus AI增强功能
   */
  async getManusAIEnhancements(sourceText, translatedText, sourceLanguage, targetLanguage) {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 构造响应
      const response = {
        suggestions: [],
        culturalContext: null,
        learningTips: []
      };
      
      // 检测特定关键词来模拟文化背景信息
      const culturalKeywords = {
        '春节': {
          title: '春节 (Spring Festival)',
          content: '春节是中国最重要的传统节日，庆祝农历新年的开始。家人团聚、红包、年夜饭和烟花是其主要特色。',
          imageUrl: 'https://example.com/spring-festival.jpg'
        },
        'Spring Festival': {
          title: '春节 (Spring Festival)',
          content: 'Spring Festival is the most important traditional holiday in China, celebrating the beginning of the lunar new year. Family reunions, red envelopes, reunion dinner, and fireworks are its main features.',
          imageUrl: 'https://example.com/spring-festival.jpg'
        },
        '筷子': {
          title: '筷子 (Chopsticks)',
          content: '筷子是东亚地区传统的餐具，使用已有数千年历史。正确使用筷子被视为基本礼仪的一部分。',
          imageUrl: 'https://example.com/chopsticks.jpg'
        },
        'chopsticks': {
          title: '筷子 (Chopsticks)',
          content: 'Chopsticks are traditional utensils in East Asia with thousands of years of history. Proper use of chopsticks is considered part of basic etiquette.',
          imageUrl: 'https://example.com/chopsticks.jpg'
        }
      };
      
      // 检查文本中是否包含文化关键词
      Object.keys(culturalKeywords).forEach(keyword => {
        if (sourceText.toLowerCase().includes(keyword.toLowerCase()) || 
            translatedText.toLowerCase().includes(keyword.toLowerCase())) {
          response.culturalContext = culturalKeywords[keyword];
        }
      });
      
      // 模拟翻译建议
      if (sourceText.includes('你好') && translatedText.includes('Hello')) {
        response.suggestions.push({
          type: 'alternative',
          text: 'Hi there!',
          explanation: '更随意的问候'
        });
      }
      
      if (sourceText.includes('谢谢') && translatedText.includes('Thank you')) {
        response.suggestions.push({
          type: 'alternative',
          text: 'Thanks a lot!',
          explanation: '更热情的感谢'
        });
      }
      
      // 添加一些随机的语言学习建议
      const learningTips = [
        {
          tip: '点击任何单词查看详细解释和用法',
          language: 'zh-CN'
        },
        {
          tip: 'Click any word to see detailed explanation and usage',
          language: 'en-US'
        },
        {
          tip: '尝试用完整句子回复以提高语言能力',
          language: 'zh-CN'
        },
        {
          tip: 'Try replying with complete sentences to improve language skills',
          language: 'en-US'
        }
      ];
      
      // 根据目标语言筛选学习提示
      const filteredTips = learningTips.filter(tip => tip.language === targetLanguage);
      if (filteredTips.length > 0) {
        const randomTip = filteredTips[Math.floor(Math.random() * filteredTips.length)];
        response.learningTips.push({
          type: 'learning',
          text: randomTip.tip
        });
      }
      
      return response;
    } catch (error) {
      console.error('Manus AI增强功能错误:', error);
      return {
        suggestions: [],
        culturalContext: null,
        learningTips: []
      };
    }
  }
  
  /**
   * 语音识别
   * @param {Blob} audioBlob - 音频数据
   * @param {string} language - 语言代码
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeSpeech(audioBlob, language) {
    try {
      // 在实际应用中，这里会调用真实的API
      // 为演示目的，返回模拟数据
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        text: '这是语音识别的模拟结果',
        confidence: 0.85,
        language
      };
    } catch (error) {
      console.error('语音识别错误:', error);
      throw new Error('语音识别服务暂时不可用');
    }
  }
  
  /**
   * 语音合成
   * @param {string} text - 要合成的文本
   * @param {string} language - 语言代码
   * @param {Object} options - 额外选项
   * @returns {Promise<Blob>} 音频数据
   */
  async synthesizeSpeech(text, language, options = {}) {
    try {
      // 在实际应用中，这里会调用真实的API
      // 为演示目的，返回模拟数据
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 创建一个空的音频Blob作为模拟返回
      return new Blob([], { type: 'audio/mp3' });
    } catch (error) {
      console.error('语音合成错误:', error);
      throw new Error('语音合成服务暂时不可用');
    }
  }
  
  /**
   * 获取支持的语言列表
   * @returns {Promise<Array>} 语言列表
   */
  async getSupportedLanguages() {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 返回模拟数据
      return [
        { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
        { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
        { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
        { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
        { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
        { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
        { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
        { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
        { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' }
      ];
    } catch (error) {
      console.error('获取支持语言错误:', error);
      throw new Error('语言服务暂时不可用');
    }
  }
}

export default TranslationService;
