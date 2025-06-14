import React, { useState, useRef, useEffect } from 'react';
import { voiceAPI, apiUtils } from '../../services/enhancedAPI';
import { useAuth } from '../../context/auth/EnhancedAuthContext';
import './EnhancedVoiceTranslation.css';

const EnhancedVoiceTranslation = () => {
  const { user, isAuthenticated } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState('auto');
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState(['zh-CN']);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // 初始化组件
  useEffect(() => {
    initializeComponent();
  }, []);

  /**
   * 初始化组件数据
   */
  const initializeComponent = async () => {
    try {
      // 获取支持的语言列表
      const languagesResponse = await voiceAPI.getSupportedLanguages();
      if (languagesResponse.success) {
        setSupportedLanguages(languagesResponse.data);
      }

      // 获取配置信息
      const configResponse = await voiceAPI.getConfig();
      if (configResponse.success) {
        setConfig(configResponse.data);
      }

      // 获取翻译历史
      if (isAuthenticated) {
        await fetchTranslationHistory();
      }
    } catch (error) {
      console.error('Failed to initialize voice translation component:', error);
      setError('初始化失败，请刷新页面重试');
    }
  };

  /**
   * 获取翻译历史
   */
  const fetchTranslationHistory = async () => {
    try {
      const response = await voiceAPI.getTranslationHistory({ limit: 10 });
      if (response.success) {
        setTranslationHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch translation history:', error);
    }
  };

  /**
   * 开始录音
   */
  const startRecording = async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('无法访问麦克风，请检查权限设置');
    }
  };

  /**
   * 停止录音
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * 播放录音
   */
  const playRecording = () => {
    if (audioBlob && audioPlayerRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
    }
  };

  /**
   * 处理语音翻译
   */
  const handleVoiceTranslation = async () => {
    if (!audioBlob) {
      setError('请先录制音频');
      return;
    }

    if (!isAuthenticated) {
      setError('请先登录');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sourceLanguage', selectedSourceLanguage);
      formData.append('targetLanguages', JSON.stringify(selectedTargetLanguages));

      const response = await voiceAPI.translateVoice(formData);

      if (response.success) {
        setTranslationResult(response.data);
        
        // 刷新翻译历史
        await fetchTranslationHistory();
        
        // 清除录音
        setAudioBlob(null);
      } else {
        setError(response.error || '翻译失败，请重试');
      }
    } catch (error) {
      console.error('Voice translation failed:', error);
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 处理文本翻译
   */
  const handleTextTranslation = async (text) => {
    if (!text.trim()) {
      setError('请输入要翻译的文本');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await voiceAPI.translateText({
        text: text.trim(),
        sourceLanguage: selectedSourceLanguage,
        targetLanguages: selectedTargetLanguages,
      });

      if (response.success) {
        setTranslationResult({
          originalText: response.data.originalText,
          sourceLanguage: response.data.sourceLanguage,
          translations: response.data.translations,
          type: 'text',
        });
      } else {
        setError(response.error || '翻译失败，请重试');
      }
    } catch (error) {
      console.error('Text translation failed:', error);
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 播放翻译结果语音
   */
  const playTranslationAudio = async (text, language) => {
    try {
      const response = await voiceAPI.synthesizeSpeech({
        text,
        language,
        voiceType: 'neutral',
      });

      if (response.success) {
        const audioData = response.data.audioData;
        const audioBlob = new Blob([
          Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Failed to play translation audio:', error);
    }
  };

  /**
   * 添加目标语言
   */
  const addTargetLanguage = (languageCode) => {
    if (!selectedTargetLanguages.includes(languageCode)) {
      setSelectedTargetLanguages([...selectedTargetLanguages, languageCode]);
    }
  };

  /**
   * 移除目标语言
   */
  const removeTargetLanguage = (languageCode) => {
    setSelectedTargetLanguages(
      selectedTargetLanguages.filter(lang => lang !== languageCode)
    );
  };

  /**
   * 清除结果
   */
  const clearResults = () => {
    setTranslationResult(null);
    setAudioBlob(null);
    setError(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="voice-translation-container">
        <div className="auth-required">
          <h3>请先登录</h3>
          <p>使用语音翻译功能需要登录账户</p>
          <a href="/login" className="login-link">前往登录</a>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-translation-container">
      <div className="voice-translation-header">
        <h2>🎤 AI语音翻译</h2>
        <p>支持多语言实时语音识别和翻译</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="translation-controls">
        {/* 语言选择 */}
        <div className="language-selection">
          <div className="source-language">
            <label>源语言：</label>
            <select
              value={selectedSourceLanguage}
              onChange={(e) => setSelectedSourceLanguage(e.target.value)}
            >
              <option value="auto">自动检测</option>
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="target-languages">
            <label>目标语言：</label>
            <div className="selected-languages">
              {selectedTargetLanguages.map(langCode => {
                const lang = supportedLanguages.find(l => l.code === langCode);
                return (
                  <span key={langCode} className="language-tag">
                    {lang?.name || langCode}
                    <button
                      onClick={() => removeTargetLanguage(langCode)}
                      className="remove-language"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
            
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addTargetLanguage(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">添加目标语言</option>
              {supportedLanguages
                .filter(lang => !selectedTargetLanguages.includes(lang.code))
                .map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* 录音控制 */}
        <div className="recording-controls">
          <div className="recording-section">
            <h3>语音录制</h3>
            <div className="recording-buttons">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="record-button"
                  disabled={isProcessing}
                >
                  🎤 开始录音
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="stop-button recording"
                >
                  ⏹️ 停止录音
                </button>
              )}

              {audioBlob && (
                <>
                  <button
                    onClick={playRecording}
                    className="play-button"
                    disabled={isProcessing}
                  >
                    ▶️ 播放录音
                  </button>
                  <button
                    onClick={handleVoiceTranslation}
                    className="translate-button"
                    disabled={isProcessing}
                  >
                    {isProcessing ? '🔄 翻译中...' : '🔄 开始翻译'}
                  </button>
                </>
              )}
            </div>
            
            <audio ref={audioPlayerRef} style={{ display: 'none' }} />
          </div>

          {/* 文本翻译 */}
          <div className="text-translation-section">
            <h3>文本翻译</h3>
            <div className="text-input-area">
              <textarea
                placeholder="输入要翻译的文本..."
                rows={4}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleTextTranslation(e.target.value);
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const textarea = e.target.parentElement.querySelector('textarea');
                  handleTextTranslation(textarea.value);
                }}
                className="text-translate-button"
                disabled={isProcessing}
              >
                {isProcessing ? '翻译中...' : '翻译文本'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 翻译结果 */}
      {translationResult && (
        <div className="translation-result">
          <div className="result-header">
            <h3>翻译结果</h3>
            <button onClick={clearResults} className="clear-button">
              清除结果
            </button>
          </div>

          <div className="original-text">
            <h4>原文 ({translationResult.sourceLanguage})：</h4>
            <p>{translationResult.originalText}</p>
            {translationResult.confidence && (
              <span className="confidence">
                识别准确度: {(translationResult.confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>

          <div className="translations">
            <h4>翻译结果：</h4>
            {Object.entries(translationResult.translations).map(([langCode, translation]) => {
              const lang = supportedLanguages.find(l => l.code === langCode);
              return (
                <div key={langCode} className="translation-item">
                  <div className="translation-header">
                    <span className="language-name">{lang?.name || langCode}</span>
                    {translation.confidence && (
                      <span className="confidence">
                        {(translation.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="translation-content">
                    <p>{translation.text}</p>
                    {lang?.hasVoice && (
                      <button
                        onClick={() => playTranslationAudio(translation.text, langCode)}
                        className="play-audio-button"
                      >
                        🔊 播放
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {translationResult.processingTime && (
            <div className="processing-info">
              处理时间: {translationResult.processingTime}ms
            </div>
          )}
        </div>
      )}

      {/* 翻译历史 */}
      {translationHistory.length > 0 && (
        <div className="translation-history">
          <h3>最近翻译</h3>
          <div className="history-list">
            {translationHistory.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-text">
                  <span className="original">{item.originalText}</span>
                  <span className="arrow">→</span>
                  <span className="translated">
                    {Object.values(item.translations)[0]?.text}
                  </span>
                </div>
                <div className="history-meta">
                  <span className="languages">
                    {item.sourceLanguage} → {Object.keys(item.translations).join(', ')}
                  </span>
                  <span className="time">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 配置信息 */}
      {config && (
        <div className="config-info">
          <h3>功能说明</h3>
          <div className="config-details">
            <p><strong>支持格式：</strong> {config.supportedFormats?.join(', ')}</p>
            <p><strong>最大文件大小：</strong> {config.maxFileSize}</p>
            <p><strong>最大文本长度：</strong> {config.maxTextLength} 字符</p>
            <p><strong>语音翻译奖励：</strong> {config.rewards?.voiceTranslation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVoiceTranslation;

