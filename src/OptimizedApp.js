import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Layout from './components/layout/Layout';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const VoiceTranslationPage = lazy(() => import('./pages/VoiceTranslationPage'));
const BlockchainPage = lazy(() => import('./pages/BlockchainPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// 路由配置
const routes = [
  {
    path: '/',
    element: <HomePage />,
    preload: true // 预加载重要页面
  },
  {
    path: '/auth',
    element: <AuthPage />,
    preload: true
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    protected: true,
    preload: true
  },
  {
    path: '/chat',
    element: <ChatPage />,
    protected: true
  },
  {
    path: '/voice-translation',
    element: <VoiceTranslationPage />,
    protected: true
  },
  {
    path: '/blockchain',
    element: <BlockchainPage />,
    protected: true
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    protected: true
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    protected: true
  },
  {
    path: '/marketplace',
    element: <MarketplacePage />
  },
  {
    path: '/analytics',
    element: <AnalyticsPage />,
    protected: true
  },
  {
    path: '/help',
    element: <HelpPage />
  },
  {
    path: '/404',
    element: <NotFoundPage />
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />
  }
];

// 路由预加载器
class RoutePreloader {
  static preloadedRoutes = new Set();
  
  static preloadRoute(routePath) {
    if (this.preloadedRoutes.has(routePath)) {
      return;
    }
    
    const route = routes.find(r => r.path === routePath);
    if (route && route.preload) {
      // 预加载组件
      const componentImport = this.getComponentImport(routePath);
      if (componentImport) {
        componentImport().catch(console.error);
        this.preloadedRoutes.add(routePath);
      }
    }
  }
  
  static getComponentImport(routePath) {
    const importMap = {
      '/': () => import('./pages/HomePage'),
      '/auth': () => import('./pages/AuthPage'),
      '/dashboard': () => import('./pages/DashboardPage'),
      '/chat': () => import('./pages/ChatPage'),
      '/voice-translation': () => import('./pages/VoiceTranslationPage'),
      '/blockchain': () => import('./pages/BlockchainPage'),
      '/profile': () => import('./pages/ProfilePage'),
      '/settings': () => import('./pages/SettingsPage'),
      '/marketplace': () => import('./pages/MarketplacePage'),
      '/analytics': () => import('./pages/AnalyticsPage'),
      '/help': () => import('./pages/HelpPage'),
      '/404': () => import('./pages/NotFoundPage')
    };
    
    return importMap[routePath];
  }
  
  static preloadCriticalRoutes() {
    // 预加载关键路由
    const criticalRoutes = ['/', '/auth', '/dashboard'];
    criticalRoutes.forEach(route => this.preloadRoute(route));
  }
  
  static preloadOnHover(routePath) {
    // 鼠标悬停时预加载
    setTimeout(() => this.preloadRoute(routePath), 100);
  }
  
  static preloadOnIdle() {
    // 空闲时预加载所有路由
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        routes.forEach(route => {
          if (!this.preloadedRoutes.has(route.path)) {
            this.preloadRoute(route.path);
          }
        });
      });
    }
  }
}

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  // 这里应该检查用户认证状态
  const isAuthenticated = true; // 临时设置，实际应该从认证上下文获取
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// 路由组件
const AppRoutes = () => {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={
            <Suspense fallback={<LoadingSpinner />}>
              {route.protected ? (
                <ProtectedRoute>
                  {route.element}
                </ProtectedRoute>
              ) : (
                route.element
              )}
            </Suspense>
          }
        />
      ))}
    </Routes>
  );
};

// 主应用组件
const App = () => {
  React.useEffect(() => {
    // 应用启动时预加载关键路由
    RoutePreloader.preloadCriticalRoutes();
    
    // 空闲时预加载其他路由
    RoutePreloader.preloadOnIdle();
    
    // 性能监控
    if ('performance' in window && 'getEntriesByType' in performance) {
      // 监控导航性能
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
      });
      
      // 监控资源加载性能
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            console.log(`Resource ${entry.name} loaded in ${entry.duration}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }
    
    // 预连接到重要域名
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.culturebridge.io'
    ];
    
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
    
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// 导出路由预加载器供其他组件使用
export { RoutePreloader };

export default App;

