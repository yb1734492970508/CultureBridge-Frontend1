import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import Button from '../ui/Button';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // 更新state以显示错误UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo
    });

    // 发送错误报告到监控服务
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(), // 如果有用户ID
      sessionId: this.getSessionId() // 如果有会话ID
    };

    // 发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      }).catch(console.error);
    } else {
      console.error('Error Report:', errorReport);
    }
  };

  getUserId = () => {
    // 从认证上下文或本地存储获取用户ID
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  };

  getSessionId = () => {
    // 获取会话ID
    try {
      return sessionStorage.getItem('sessionId') || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          fallback={this.props.fallback}
        />
      );
    }

    return this.props.children;
  }
}

// 错误回退UI组件
const ErrorFallback = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReload,
  onGoHome,
  fallback
}) => {
  const { theme, isDarkMode } = useTheme();
  const [showDetails, setShowDetails] = React.useState(false);

  // 如果提供了自定义回退组件
  if (fallback) {
    return fallback({ error, errorInfo, onRetry });
  }

  const ErrorIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );

  const ChevronDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  );

  const ChevronUpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18,15 12,9 6,15"/>
    </svg>
  );

  const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );

  const copyErrorDetails = () => {
    const errorDetails = `
Error ID: ${errorId}
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      alert('错误详情已复制到剪贴板');
    }).catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = errorDetails;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('错误详情已复制到剪贴板');
    });
  };

  return (
    <div className="cb-error-boundary">
      <div className="cb-error-boundary__container">
        <div className="cb-error-boundary__icon">
          <ErrorIcon />
        </div>
        
        <div className="cb-error-boundary__content">
          <h1 className="cb-error-boundary__title">
            哎呀，出现了一些问题
          </h1>
          
          <p className="cb-error-boundary__description">
            我们遇到了一个意外错误。不用担心，我们的团队已经收到了错误报告，正在努力修复这个问题。
          </p>
          
          <div className="cb-error-boundary__error-id">
            错误ID: <code>{errorId}</code>
          </div>
          
          <div className="cb-error-boundary__actions">
            <Button
              variant="primary"
              onClick={onRetry}
              className="cb-error-boundary__action"
            >
              重试
            </Button>
            
            <Button
              variant="outline"
              onClick={onReload}
              className="cb-error-boundary__action"
            >
              刷新页面
            </Button>
            
            <Button
              variant="ghost"
              onClick={onGoHome}
              className="cb-error-boundary__action"
            >
              返回首页
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="cb-error-boundary__details">
              <button
                className="cb-error-boundary__details-toggle"
                onClick={() => setShowDetails(!showDetails)}
              >
                <span>错误详情</span>
                {showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
              
              {showDetails && (
                <div className="cb-error-boundary__details-content">
                  <div className="cb-error-boundary__details-header">
                    <span>技术详情</span>
                    <button
                      className="cb-error-boundary__copy-button"
                      onClick={copyErrorDetails}
                      title="复制错误详情"
                    >
                      <CopyIcon />
                    </button>
                  </div>
                  
                  <div className="cb-error-boundary__error-info">
                    <div className="cb-error-boundary__error-section">
                      <h4>错误消息:</h4>
                      <pre>{error?.message || 'Unknown error'}</pre>
                    </div>
                    
                    {error?.stack && (
                      <div className="cb-error-boundary__error-section">
                        <h4>错误堆栈:</h4>
                        <pre>{error.stack}</pre>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div className="cb-error-boundary__error-section">
                        <h4>组件堆栈:</h4>
                        <pre>{errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 高阶组件包装器
export const withErrorBoundary = (Component, fallback) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook版本的错误边界
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return { captureError, resetError };
};

export default ErrorBoundary;

