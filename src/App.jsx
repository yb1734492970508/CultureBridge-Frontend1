/**
 * CultureBridge 主应用文件 - 增强版 v3.0
 * 集成Redux、React Query、Socket.IO等现代化功能
 */

import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

// Store和配置
import { store, persistor } from './store';
import queryClient from './lib/queryClient';
import config from './utils/config';
import socketService from './services/socket';

// 组件
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import NotificationManager from './components/NotificationManager';
import PerformanceMonitor from './components/PerformanceMonitor';

// 页面组件 - 懒加载
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const LearningPage = React.lazy(() => import('./pages/LearningPage'));
const CulturePage = React.lazy(() => import('./pages/CulturePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const BlockchainPage = React.lazy(() => import('./pages/BlockchainPage'));
const TranslationPage = React.lazy(() => import('./pages/TranslationPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// 全局样式
import './styles/globals.css';
import './styles/animations.css';
import './styles/themes.css';

/**
 * 应用初始化组件
 */
const AppInitializer = ({ children }) => {
  useEffect(() => {
    // 初始化配置验证
    try {
      config.validateConfig();
      console.log('✅ Configuration validated successfully');
    } catch (error) {
      console.error('❌ Configuration validation failed:', error);
    }

    // 初始化Socket连接
    const initializeSocket = () => {
      if (config.isFeatureEnabled('REAL_TIME_COMMUNICATION')) {
        socketService.connect();
        console.log('🔌 Socket service initialized');
      }
    };

    // 延迟初始化Socket以确保认证状态已加载
    const timer = setTimeout(initializeSocket, 1000);

    // 性能监控
    if (config.get('VITE_ENABLE_PERFORMANCE_MONITORING')) {
      console.log('📊 Performance monitoring enabled');
    }

    // 错误报告
    if (config.get('VITE_ENABLE_ERROR_REPORTING')) {
      window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // 这里可以集成错误报告服务
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // 这里可以集成错误报告服务
      });
    }

    // 清理函数
    return () => {
      clearTimeout(timer);
      socketService.disconnect();
    };
  }, []);

  return children;
};

/**
 * 路由配置
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* 受保护的路由 */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <Layout>
            <DashboardPage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/chat" element={
        <AuthGuard>
          <Layout>
            <ChatPage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/chat/:roomId" element={
        <AuthGuard>
          <Layout>
            <ChatPage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/learning" element={
        <AuthGuard>
          <Layout>
            <LearningPage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/learning/:courseId" element={
        <AuthGuard>
          <Layout>
            <LearningPage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/culture" element={
        <AuthGuard>
          <Layout>
            <CulturePage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/culture/:topicId" element={
        <AuthGuard>
          <Layout>
            <CulturePage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/translation" element={
        <AuthGuard>
          <Layout>
            <TranslationPage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/blockchain" element={
        <AuthGuard>
          <Layout>
            <BlockchainPage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/profile" element={
        <AuthGuard>
          <Layout>
            <ProfilePage />
          </Layout>
        </AuthGuard>
      } />
      
      <Route path="/settings" element={
        <AuthGuard>
          <Layout>
            <SettingsPage />
          </Layout>
        </AuthGuard>
      } />
      
      {/* 重定向和404 */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

/**
 * 加载组件
 */
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
        正在加载 CultureBridge...
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        连接世界，交流文化
      </div>
    </div>
  </div>
);

/**
 * 主应用组件
 */
const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingFallback />} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme={config.getUIConfig().defaultTheme}
              enableSystem
              disableTransitionOnChange
            >
              <Router>
                <AppInitializer>
                  <div className="app">
                    {/* 主要内容 */}
                    <Suspense fallback={<LoadingFallback />}>
                      <AppRoutes />
                    </Suspense>
                    
                    {/* 全局组件 */}
                    <NotificationManager />
                    
                    {/* 性能监控 */}
                    {config.get('VITE_ENABLE_PERFORMANCE_MONITORING') && (
                      <PerformanceMonitor />
                    )}
                    
                    {/* 通知系统 */}
                    <Toaster
                      position="top-right"
                      expand={true}
                      richColors
                      closeButton
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: 'var(--background)',
                          color: 'var(--foreground)',
                          border: '1px solid var(--border)',
                        },
                      }}
                    />
                    
                    {/* React Query 开发工具 */}
                    {config.isDevelopment() && (
                      <ReactQueryDevtools
                        initialIsOpen={false}
                        position="bottom-right"
                      />
                    )}
                  </div>
                </AppInitializer>
              </Router>
            </ThemeProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;

