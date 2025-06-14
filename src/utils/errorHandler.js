// 错误处理工具类
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

// 错误类型常量
export const ERROR_CODES = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // 认证错误
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // 验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // 业务逻辑错误
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  
  // 区块链错误
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INSUFFICIENT_GAS: 'INSUFFICIENT_GAS',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  
  // 文件错误
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // 语音翻译错误
  VOICE_RECOGNITION_FAILED: 'VOICE_RECOGNITION_FAILED',
  TRANSLATION_FAILED: 'TRANSLATION_FAILED',
  UNSUPPORTED_LANGUAGE: 'UNSUPPORTED_LANGUAGE',
  AUDIO_FORMAT_ERROR: 'AUDIO_FORMAT_ERROR',
};

// 错误消息映射
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查您的网络设置',
  [ERROR_CODES.TIMEOUT_ERROR]: '请求超时，请稍后重试',
  [ERROR_CODES.CONNECTION_ERROR]: '连接服务器失败，请稍后重试',
  
  [ERROR_CODES.AUTH_REQUIRED]: '请先登录后再进行此操作',
  [ERROR_CODES.INVALID_TOKEN]: '登录状态无效，请重新登录',
  [ERROR_CODES.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: '您没有权限执行此操作',
  
  [ERROR_CODES.VALIDATION_ERROR]: '输入数据格式不正确',
  [ERROR_CODES.INVALID_INPUT]: '输入内容无效，请检查后重试',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: '请填写所有必填字段',
  
  [ERROR_CODES.RESOURCE_NOT_FOUND]: '请求的资源不存在',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: '资源已存在，无法重复创建',
  [ERROR_CODES.OPERATION_NOT_ALLOWED]: '当前状态下不允许此操作',
  [ERROR_CODES.INSUFFICIENT_BALANCE]: 'CBT代币余额不足',
  
  [ERROR_CODES.WALLET_NOT_CONNECTED]: '请先连接您的钱包',
  [ERROR_CODES.TRANSACTION_FAILED]: '区块链交易失败，请重试',
  [ERROR_CODES.INSUFFICIENT_GAS]: 'Gas费用不足，请增加Gas限制',
  [ERROR_CODES.CONTRACT_ERROR]: '智能合约执行错误',
  
  [ERROR_CODES.FILE_TOO_LARGE]: '文件大小超出限制',
  [ERROR_CODES.INVALID_FILE_TYPE]: '不支持的文件类型',
  [ERROR_CODES.UPLOAD_FAILED]: '文件上传失败，请重试',
  
  [ERROR_CODES.VOICE_RECOGNITION_FAILED]: '语音识别失败，请重新录制',
  [ERROR_CODES.TRANSLATION_FAILED]: '翻译失败，请稍后重试',
  [ERROR_CODES.UNSUPPORTED_LANGUAGE]: '不支持的语言',
  [ERROR_CODES.AUDIO_FORMAT_ERROR]: '音频格式错误，请使用支持的格式',
};

// 错误处理器类
export class ErrorHandler {
  constructor() {
    this.errorListeners = new Set();
    this.setupGlobalErrorHandlers();
  }

  // 设置全局错误处理器
  setupGlobalErrorHandlers() {
    // 处理未捕获的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
      event.preventDefault();
    });

    // 处理JavaScript运行时错误
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.handleError(event.error);
    });
  }

  // 添加错误监听器
  addErrorListener(listener) {
    this.errorListeners.add(listener);
  }

  // 移除错误监听器
  removeErrorListener(listener) {
    this.errorListeners.delete(listener);
  }

  // 处理错误
  handleError(error) {
    const processedError = this.processError(error);
    
    // 通知所有监听器
    this.errorListeners.forEach(listener => {
      try {
        listener(processedError);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });

    // 记录错误
    this.logError(processedError);
    
    return processedError;
  }

  // 处理和标准化错误
  processError(error) {
    if (error instanceof AppError) {
      return error;
    }

    // 处理网络错误
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        ERROR_CODES.NETWORK_ERROR,
        0
      );
    }

    // 处理超时错误
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
        ERROR_CODES.TIMEOUT_ERROR,
        408
      );
    }

    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
      const code = data?.code || this.getErrorCodeByStatus(status);
      
      return new AppError(message, code, status);
    }

    // 处理其他错误
    return new AppError(
      error.message || '发生未知错误',
      ERROR_CODES.UNKNOWN_ERROR,
      500
    );
  }

  // 根据HTTP状态码获取错误代码
  getErrorCodeByStatus(status) {
    switch (status) {
      case 400:
        return ERROR_CODES.VALIDATION_ERROR;
      case 401:
        return ERROR_CODES.AUTH_REQUIRED;
      case 403:
        return ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      case 404:
        return ERROR_CODES.RESOURCE_NOT_FOUND;
      case 409:
        return ERROR_CODES.RESOURCE_ALREADY_EXISTS;
      case 422:
        return ERROR_CODES.INVALID_INPUT;
      case 500:
      default:
        return ERROR_CODES.NETWORK_ERROR;
    }
  }

  // 记录错误
  logError(error) {
    const errorLog = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // 在开发环境中打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', errorLog);
    }

    // 在生产环境中可以发送错误日志到服务器
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToServer(errorLog);
    }
  }

  // 发送错误日志到服务器
  async sendErrorToServer(errorLog) {
    try {
      await fetch('/api/v1/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
    } catch (logError) {
      console.error('Failed to send error log to server:', logError);
    }
  }

  // 创建特定类型的错误
  createError(code, customMessage = null) {
    const message = customMessage || ERROR_MESSAGES[code] || '发生未知错误';
    return new AppError(message, code);
  }

  // 检查是否为特定类型的错误
  isErrorType(error, code) {
    return error instanceof AppError && error.code === code;
  }

  // 获取用户友好的错误消息
  getUserFriendlyMessage(error) {
    if (error instanceof AppError) {
      return error.message;
    }
    
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
  }
}

// 创建全局错误处理器实例
export const errorHandler = new ErrorHandler();

// 错误处理装饰器
export function withErrorHandling(asyncFunction) {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      throw errorHandler.handleError(error);
    }
  };
}

// React错误边界组件
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    errorHandler.handleError(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>出现了一些问题</h2>
          <p>页面遇到错误，请刷新页面重试。</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 异步错误处理Hook
import { useState, useCallback } from 'react';

export function useAsyncError() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeAsync = useCallback(async (asyncFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      return result;
    } catch (error) {
      const processedError = errorHandler.handleError(error);
      setError(processedError);
      throw processedError;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    loading,
    executeAsync,
    clearError,
  };
}

