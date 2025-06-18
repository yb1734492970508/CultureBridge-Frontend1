import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { BlockchainProvider } from './contexts/BlockchainContext';

// Layout Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorFallback from './components/common/ErrorFallback';
import SplashScreen from './components/ui/SplashScreen';

// Lazy-loaded Pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const VoiceTranslationPage = React.lazy(() => import('./pages/VoiceTranslationPage'));
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage'));
const LearningPage = React.lazy(() => import('./pages/LearningPage'));
const BlockchainPage = React.lazy(() => import('./pages/BlockchainPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Performance Monitoring
import { performanceMonitor } from './utils/performanceMonitor';
import { preloadCriticalResources } from './utils/resourcePreloader';

// Styles
import './styles/modern-ui.css';
import './styles/animations.css';
import './styles/mobile.css';
import './styles/themes.css';

// React Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Route Configuration
const routes = [
  {
    path: '/',
    element: <HomePage />,
    preload: true,
    title: 'CultureBridge - 连接世界文化',
  },
  {
    path: '/auth',
    element: <AuthPage />,
    preload: true,
    title: '登录 - CultureBridge',
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    protected: true,
    preload: true,
    title: '仪表板 - CultureBridge',
  },
  {
    path: '/chat',
    element: <ChatPage />,
    protected: true,
    title: '聊天 - CultureBridge',
  },
  {
    path: '/voice-translation',
    element: <VoiceTranslationPage />,
    protected: true,
    title: '语音翻译 - CultureBridge',
  },
  {
    path: '/discover',
    element: <DiscoverPage />,
    title: '发现 - CultureBridge',
  },
  {
    path: '/learning',
    element: <LearningPage />,
    protected: true,
    title: '学习 - CultureBridge',
  },
  {
    path: '/blockchain',
    element: <BlockchainPage />,
    protected: true,
    title: '区块链 - CultureBridge',
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    protected: true,
    title: '个人资料 - CultureBridge',
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    protected: true,
    title: '设置 - CultureBridge',
  },
  {
    path: '/404',
    element: <NotFoundPage />,
    title: '页面未找到 - CultureBridge',
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

// Route Preloader Class
class RoutePreloader {
  static preloadedRoutes = new Set();
  static preloadPromises = new Map();

  static async preloadRoute(routePath) {
    if (this.preloadedRoutes.has(routePath)) {
      return this.preloadPromises.get(routePath);
    }

    const route = routes.find(r => r.path === routePath);
    if (!route || !route.preload) return;

    const componentImport = this.getComponentImport(routePath);
    if (componentImport) {
      const promise = componentImport()
        .then(module => {
          this.preloadedRoutes.add(routePath);
          return module;
        })
        .catch(error => {
          console.error(`Failed to preload route ${routePath}:`, error);
          throw error;
        });

      this.preloadPromises.set(routePath, promise);
      return promise;
    }
  }

  static getComponentImport(routePath) {
    const importMap = {
      '/': () => import('./pages/HomePage'),
      '/auth': () => import('./pages/AuthPage'),
      '/dashboard': () => import('./pages/DashboardPage'),
      '/chat': () => import('./pages/ChatPage'),
      '/voice-translation': () => import('./pages/VoiceTranslationPage'),
      '/discover': () => import('./pages/DiscoverPage'),
      '/learning': () => import('./pages/LearningPage'),
      '/blockchain': () => import('./pages/BlockchainPage'),
      '/profile': () => import('./pages/ProfilePage'),
      '/settings': () => import('./pages/SettingsPage'),
      '/404': () => import('./pages/NotFoundPage'),
    };

    return importMap[routePath];
  }

  static preloadCriticalRoutes() {
    const criticalRoutes = ['/', '/auth', '/dashboard'];
    return Promise.allSettled(
      criticalRoutes.map(route => this.preloadRoute(route))
    );
  }

  static preloadOnHover(routePath) {
    setTimeout(() => this.preloadRoute(routePath), 100);
  }

  static preloadOnIdle() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        routes.forEach(route => {
          if (route.preload && !this.preloadedRoutes.has(route.path)) {
            this.preloadRoute(route.path);
          }
        });
      });
    }
  }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // TODO: Replace with actual auth check
  const isAuthenticated = localStorage.getItem('auth_token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Page Title Manager
const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

// Route Component with Title Management
const RouteWithTitle = ({ element, title, protected: isProtected }) => {
  usePageTitle(title);
  
  const content = isProtected ? (
    <ProtectedRoute>{element}</ProtectedRoute>
  ) : (
    element
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {content}
    </motion.div>
  );
};

// App Routes Component
const AppRoutes = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <React.Suspense 
                fallback={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <LoadingSpinner />
                  </motion.div>
                }
              >
                <RouteWithTitle
                  element={route.element}
                  title={route.title}
                  protected={route.protected}
                />
              </React.Suspense>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
};

// Performance Optimization Hook
const usePerformanceOptimization = () => {
  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init();

    // Preload critical resources
    preloadCriticalResources();

    // Preload critical routes
    RoutePreloader.preloadCriticalRoutes();

    // Setup idle preloading
    RoutePreloader.preloadOnIdle();

    // Setup connection preloading
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.culturebridge.io',
      'https://cdn.culturebridge.io',
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Setup resource hints
    const resourceHints = [
      { rel: 'dns-prefetch', href: '//api.culturebridge.io' },
      { rel: 'dns-prefetch', href: '//cdn.culturebridge.io' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    ];

    resourceHints.forEach(hint => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      performanceMonitor.cleanup();
    };
  }, []);
};

// App Loading State
const AppLoadingState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen progress={loadingProgress} />;
  }

  return null;
};

// Main App Component
const App = () => {
  usePerformanceOptimization();

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const initTimer = setTimeout(() => {
      setAppReady(true);
    }, 2000);

    return () => clearTimeout(initTimer);
  }, []);

  const errorHandler = useCallback((error, errorInfo) => {
    console.error('App Error:', error, errorInfo);
    // TODO: Send error to monitoring service
  }, []);

  if (!appReady) {
    return <AppLoadingState />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={errorHandler}
      onReset={() => window.location.reload()}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <BlockchainProvider>
                <Router>
                  <Layout>
                    <AppRoutes />
                  </Layout>
                </Router>
              </BlockchainProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Export utilities for external use
export { RoutePreloader, queryClient };

export default App;

