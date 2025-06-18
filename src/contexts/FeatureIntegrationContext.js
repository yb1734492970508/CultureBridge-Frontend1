import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer';

/**
 * 高级功能集成管理器
 */

// 功能集成状态管理
const FeatureIntegrationContext = createContext();

// 功能状态
const initialState = {
  features: {
    nftMarket: { enabled: true, loaded: false, error: null },
    governance: { enabled: true, loaded: false, error: null },
    social: { enabled: true, loaded: false, error: null },
    analytics: { enabled: true, loaded: false, error: null },
    crossChain: { enabled: true, loaded: false, error: null },
    messaging: { enabled: true, loaded: false, error: null },
    i18n: { enabled: true, loaded: false, error: null },
    theme: { enabled: true, loaded: false, error: null },
    mobile: { enabled: true, loaded: false, error: null }
  },
  integrationStatus: 'initializing', // 'initializing' | 'loading' | 'ready' | 'error'
  performance: {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  },
  errors: [],
  warnings: []
};

// 功能集成 Reducer
const featureIntegrationReducer = (state, action) => {
  switch (action.type) {
    case 'FEATURE_LOAD_START':
      return {
        ...state,
        features: {
          ...state.features,
          [action.feature]: {
            ...state.features[action.feature],
            loaded: false,
            error: null
          }
        }
      };

    case 'FEATURE_LOAD_SUCCESS':
      return {
        ...state,
        features: {
          ...state.features,
          [action.feature]: {
            ...state.features[action.feature],
            loaded: true,
            error: null
          }
        }
      };

    case 'FEATURE_LOAD_ERROR':
      return {
        ...state,
        features: {
          ...state.features,
          [action.feature]: {
            ...state.features[action.feature],
            loaded: false,
            error: action.error
          }
        },
        errors: [...state.errors, { feature: action.feature, error: action.error, timestamp: Date.now() }]
      };

    case 'SET_INTEGRATION_STATUS':
      return {
        ...state,
        integrationStatus: action.status
      };

    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: {
          ...state.performance,
          ...action.metrics
        }
      };

    case 'ADD_WARNING':
      return {
        ...state,
        warnings: [...state.warnings, { message: action.message, timestamp: Date.now() }]
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };

    case 'CLEAR_WARNINGS':
      return {
        ...state,
        warnings: []
      };

    default:
      return state;
  }
};

// 功能集成提供者
export const FeatureIntegrationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(featureIntegrationReducer, initialState);
  const { usePerformanceMonitor, useSafeAsync } = PerformanceOptimizer;
  
  const renderTime = usePerformanceMonitor('FeatureIntegrationProvider');
  const safeAsync = useSafeAsync();

  // 加载功能模块
  const loadFeature = useCallback(async (featureName, loader) => {
    dispatch({ type: 'FEATURE_LOAD_START', feature: featureName });
    
    try {
      const startTime = performance.now();
      await safeAsync(loader);
      const loadTime = performance.now() - startTime;
      
      dispatch({ type: 'FEATURE_LOAD_SUCCESS', feature: featureName });
      dispatch({ 
        type: 'UPDATE_PERFORMANCE', 
        metrics: { loadTime: state.performance.loadTime + loadTime }
      });
      
      if (loadTime > 1000) {
        dispatch({ 
          type: 'ADD_WARNING', 
          message: `Feature ${featureName} took ${loadTime.toFixed(2)}ms to load`
        });
      }
    } catch (error) {
      dispatch({ type: 'FEATURE_LOAD_ERROR', feature: featureName, error: error.message });
    }
  }, [safeAsync, state.performance.loadTime]);

  // 检查所有功能是否加载完成
  const checkIntegrationStatus = useCallback(() => {
    const enabledFeatures = Object.entries(state.features).filter(([_, feature]) => feature.enabled);
    const loadedFeatures = enabledFeatures.filter(([_, feature]) => feature.loaded);
    const errorFeatures = enabledFeatures.filter(([_, feature]) => feature.error);

    if (errorFeatures.length > 0) {
      dispatch({ type: 'SET_INTEGRATION_STATUS', status: 'error' });
    } else if (loadedFeatures.length === enabledFeatures.length) {
      dispatch({ type: 'SET_INTEGRATION_STATUS', status: 'ready' });
    } else {
      dispatch({ type: 'SET_INTEGRATION_STATUS', status: 'loading' });
    }
  }, [state.features]);

  // 初始化功能加载
  useEffect(() => {
    const initializeFeatures = async () => {
      dispatch({ type: 'SET_INTEGRATION_STATUS', status: 'loading' });

      // 按优先级加载功能
      const featureLoaders = [
        { name: 'theme', loader: () => import('../contexts/ThemeContext') },
        { name: 'i18n', loader: () => import('../contexts/I18nContext') },
        { name: 'nftMarket', loader: () => import('../components/nft-market/NFTMarketplaceEnhanced') },
        { name: 'governance', loader: () => import('../components/governance/CommunityGovernance') },
        { name: 'social', loader: () => import('../components/social/SocialHub') },
        { name: 'analytics', loader: () => import('../components/analytics/NFTMarketAnalytics') },
        { name: 'crossChain', loader: () => import('../components/cross-chain/CrossChainAssetManager') },
        { name: 'messaging', loader: () => import('../components/messaging/MessagingSystem') },
        { name: 'mobile', loader: () => import('../components/mobile/MobileNavigation') }
      ];

      // 并行加载核心功能
      const coreFeatures = featureLoaders.slice(0, 3);
      await Promise.all(coreFeatures.map(({ name, loader }) => loadFeature(name, loader)));

      // 串行加载其他功能
      for (const { name, loader } of featureLoaders.slice(3)) {
        await loadFeature(name, loader);
      }
    };

    initializeFeatures();
  }, [loadFeature]);

  // 监控集成状态变化
  useEffect(() => {
    checkIntegrationStatus();
  }, [checkIntegrationStatus]);

  // 性能监控
  useEffect(() => {
    dispatch({ 
      type: 'UPDATE_PERFORMANCE', 
      metrics: { renderTime }
    });
  }, [renderTime]);

  // 内存使用监控
  useEffect(() => {
    const monitorMemory = () => {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        dispatch({ 
          type: 'UPDATE_PERFORMANCE', 
          metrics: { memoryUsage }
        });
        
        if (memoryUsage > 100) {
          dispatch({ 
            type: 'ADD_WARNING', 
            message: `High memory usage: ${memoryUsage.toFixed(2)}MB`
          });
        }
      }
    };

    const interval = setInterval(monitorMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    ...state,
    loadFeature,
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' }),
    clearWarnings: () => dispatch({ type: 'CLEAR_WARNINGS' })
  };

  return (
    <FeatureIntegrationContext.Provider value={value}>
      {children}
    </FeatureIntegrationContext.Provider>
  );
};

// 使用功能集成的 Hook
export const useFeatureIntegration = () => {
  const context = useContext(FeatureIntegrationContext);
  if (!context) {
    throw new Error('useFeatureIntegration must be used within FeatureIntegrationProvider');
  }
  return context;
};

// 功能状态显示组件
export const FeatureStatusIndicator = ({ className = "" }) => {
  const { features, integrationStatus, performance, errors, warnings } = useFeatureIntegration();

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return '#10B981';
      case 'loading': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getFeatureStatusIcon = (feature) => {
    if (feature.error) return '❌';
    if (feature.loaded) return '✅';
    return '⏳';
  };

  return (
    <div className={`feature-status-indicator ${className}`}>
      <div className="status-header">
        <div 
          className="status-dot"
          style={{ backgroundColor: getStatusColor(integrationStatus) }}
        />
        <span className="status-text">
          {integrationStatus === 'ready' ? '所有功能已就绪' : 
           integrationStatus === 'loading' ? '功能加载中...' : 
           integrationStatus === 'error' ? '部分功能异常' : '初始化中...'}
        </span>
      </div>

      <div className="feature-list">
        {Object.entries(features).map(([name, feature]) => (
          <div key={name} className="feature-item">
            <span className="feature-icon">{getFeatureStatusIcon(feature)}</span>
            <span className="feature-name">{name}</span>
            {feature.error && (
              <span className="feature-error" title={feature.error}>⚠️</span>
            )}
          </div>
        ))}
      </div>

      <div className="performance-metrics">
        <div className="metric">
          <span>加载时间: {performance.loadTime.toFixed(2)}ms</span>
        </div>
        <div className="metric">
          <span>渲染时间: {performance.renderTime.toFixed(2)}ms</span>
        </div>
        <div className="metric">
          <span>内存使用: {performance.memoryUsage.toFixed(2)}MB</span>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="error-list">
          <h4>错误 ({errors.length})</h4>
          {errors.slice(-3).map((error, index) => (
            <div key={index} className="error-item">
              <span className="error-feature">{error.feature}:</span>
              <span className="error-message">{error.error}</span>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="warning-list">
          <h4>警告 ({warnings.length})</h4>
          {warnings.slice(-3).map((warning, index) => (
            <div key={index} className="warning-item">
              <span className="warning-message">{warning.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 功能加载器组件
export const FeatureLoader = ({ 
  feature, 
  fallback = <div>Loading feature...</div>,
  error = <div>Failed to load feature</div>,
  children 
}) => {
  const { features } = useFeatureIntegration();
  const featureState = features[feature];

  if (!featureState) {
    return error;
  }

  if (featureState.error) {
    return error;
  }

  if (!featureState.loaded) {
    return fallback;
  }

  return children;
};

export default {
  FeatureIntegrationProvider,
  useFeatureIntegration,
  FeatureStatusIndicator,
  FeatureLoader
};

