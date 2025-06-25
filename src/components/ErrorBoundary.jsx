/**
 * 错误边界组件
 * 捕获和处理React组件树中的JavaScript错误
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import config from '../utils/config';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 更新state以显示错误UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo,
    });

    // 发送错误报告
    this.reportError(error, errorInfo);
    
    // 控制台输出详细错误信息
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  reportError = async (error, errorInfo) => {
    if (!config.get('VITE_ENABLE_ERROR_REPORTING')) {
      return;
    }

    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(),
        errorId: this.state.errorId,
        appVersion: config.get('VITE_APP_VERSION'),
        environment: config.get('VITE_APP_ENVIRONMENT'),
      };

      // 这里可以发送到错误报告服务
      // await errorReportingService.report(errorReport);
      
      console.log('Error report prepared:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  getUserId = () => {
    try {
      const authData = localStorage.getItem('auth_token');
      // 这里可以解析token获取用户ID
      return authData ? 'authenticated_user' : 'anonymous_user';
    } catch {
      return 'unknown_user';
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const bugReportUrl = `mailto:support@culturebridge.app?subject=Bug Report - ${errorId}&body=${encodeURIComponent(
      `Error ID: ${errorId}\n\n` +
      `Error Message: ${error?.message || 'Unknown error'}\n\n` +
      `URL: ${window.location.href}\n\n` +
      `User Agent: ${navigator.userAgent}\n\n` +
      `Please describe what you were doing when this error occurred:\n\n`
    )}`;
    
    window.open(bugReportUrl);
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;
      const isDevelopment = config.isDevelopment();

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-800 dark:text-red-200">
                哎呀，出现了错误！
              </CardTitle>
              <CardDescription className="text-lg">
                应用程序遇到了意外错误，我们正在努力修复这个问题。
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 错误ID */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>错误ID:</strong> {errorId}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    如需技术支持，请提供此错误ID
                  </span>
                </AlertDescription>
              </Alert>

              {/* 开发环境下显示详细错误信息 */}
              {isDevelopment && error && (
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      错误详情 (开发模式)
                    </h4>
                    <div className="text-sm font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap break-all">
                      {error.message}
                    </div>
                  </div>

                  {error.stack && (
                    <details className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <summary className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                        错误堆栈
                      </summary>
                      <pre className="mt-2 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </details>
                  )}

                  {errorInfo?.componentStack && (
                    <details className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <summary className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                        组件堆栈
                      </summary>
                      <pre className="mt-2 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重试
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新页面
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </div>

              {/* 报告错误按钮 */}
              <div className="text-center">
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  报告此错误
                </Button>
              </div>

              {/* 帮助信息 */}
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>
                  如果问题持续存在，请尝试：
                </p>
                <ul className="text-left space-y-1 max-w-md mx-auto">
                  <li>• 清除浏览器缓存和Cookie</li>
                  <li>• 使用无痕/隐私模式</li>
                  <li>• 更新浏览器到最新版本</li>
                  <li>• 检查网络连接</li>
                  <li>• 联系技术支持</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

