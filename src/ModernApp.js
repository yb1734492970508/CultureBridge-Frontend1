import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';

// Layout Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorFallback from './components/common/ErrorFallback';

// Pages
import HomePage from './pages/Home';
import AuthPage from './pages/auth/Auth';
import ChatPage from './pages/Chat';
import LearningPage from './pages/Learning';
import CommunityPage from './pages/Community';
import ProfilePage from './pages/Profile';
import VoiceTranslationPage from './pages/VoiceTranslationPage';

// Styles
import './styles/modern-ui.css';
import './styles/animations.css';
import './styles/mobile.css';
import './styles/themes.css';
import './styles/allbirds-inspired.css';

// Performance monitoring
import { performanceMonitor } from './utils/performanceMonitor';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init();
    
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleError = useCallback((error, errorInfo) => {
    console.error('App Error:', error, errorInfo);
    // Send error to monitoring service
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="loading-text"
        >
          正在加载 CultureBridge...
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <Router>
              <div className="app">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth/*" element={<AuthPage />} />
                    <Route 
                      path="/chat" 
                      element={
                        <Layout>
                          <ChatPage />
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/learning" 
                      element={
                        <Layout>
                          <LearningPage />
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/community" 
                      element={
                        <Layout>
                          <CommunityPage />
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/voice-translation" 
                      element={
                        <Layout>
                          <VoiceTranslationPage />
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <Layout>
                          <ProfilePage />
                        </Layout>
                      } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </div>
            </Router>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

