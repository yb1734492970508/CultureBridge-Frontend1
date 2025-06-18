import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

/**
 * 性能优化工具集
 */

// 1. 虚拟滚动组件 - 优化大列表性能
export const VirtualScrollList = ({ 
  items = [], 
  itemHeight = 80, 
  containerHeight = 400,
  renderItem,
  className = ""
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  // 计算可见区域
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  // 可见项目
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  // 防抖滚动处理
  const handleScroll = useCallback(
    debounce((e) => {
      setScrollTop(e.target.scrollTop);
    }, 16), // 60fps
    []
  );

  return (
    <div 
      className={`virtual-scroll-container ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      ref={setContainerRef}
    >
      {/* 总高度占位 */}
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {/* 可见项目 */}
        <div
          style={{
            transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. 图片懒加载组件
export const LazyImage = ({ 
  src, 
  alt = "", 
  placeholder = "/placeholder.png",
  className = "",
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = React.useRef();

  // Intersection Observer 监听图片是否进入视口
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 当图片进入视口时开始加载
  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad && onLoad();
      };
      img.onerror = () => {
        onError && onError();
      };
      img.src = src;
    }
  }, [isInView, src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`lazy-image ${isLoaded ? 'loaded' : 'loading'} ${className}`}
      style={{
        transition: 'opacity 0.3s ease',
        opacity: isLoaded ? 1 : 0.7
      }}
    />
  );
};

// 3. 代码分割和懒加载组件
export const LazyComponent = ({ 
  loader, 
  fallback = <div>Loading...</div>,
  error = <div>Error loading component</div>
}) => {
  const [Component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loader()
      .then((module) => {
        setComponent(() => module.default || module);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load component:', err);
        setHasError(true);
        setIsLoading(false);
      });
  }, [loader]);

  if (hasError) return error;
  if (isLoading) return fallback;
  if (!Component) return null;

  return <Component />;
};

// 4. 缓存Hook
export const useCache = (key, fetcher, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 简单的内存缓存
  const cache = useMemo(() => new Map(), []);

  const fetchData = useCallback(async () => {
    // 检查缓存
    if (cache.has(key)) {
      setData(cache.get(key));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcher();
      cache.set(key, result);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, cache]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const invalidateCache = useCallback(() => {
    cache.delete(key);
    fetchData();
  }, [key, cache, fetchData]);

  return { data, isLoading, error, invalidateCache };
};

// 5. 防抖Hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 6. 节流Hook
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = React.useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// 7. 本地存储Hook
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// 8. 网络状态Hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// 9. 性能监控Hook
export const usePerformanceMonitor = (componentName) => {
  const renderStart = React.useRef(performance.now());
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const renderEnd = performance.now();
    const time = renderEnd - renderStart.current;
    setRenderTime(time);
    
    // 记录性能数据
    if (time > 16) { // 超过一帧的时间
      console.warn(`${componentName} render took ${time.toFixed(2)}ms`);
    }
  });

  return renderTime;
};

// 10. 批量状态更新Hook
export const useBatchedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const pendingUpdates = React.useRef([]);

  const batchedSetState = useCallback((updates) => {
    pendingUpdates.current.push(updates);
    
    // 使用 requestAnimationFrame 批量更新
    requestAnimationFrame(() => {
      if (pendingUpdates.current.length > 0) {
        setState(prevState => {
          let newState = prevState;
          pendingUpdates.current.forEach(update => {
            newState = typeof update === 'function' ? update(newState) : { ...newState, ...update };
          });
          pendingUpdates.current = [];
          return newState;
        });
      }
    });
  }, []);

  return [state, batchedSetState];
};

// 11. 内存泄漏防护Hook
export const useSafeAsync = () => {
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeAsync = useCallback(async (asyncFunction) => {
    try {
      const result = await asyncFunction();
      if (isMountedRef.current) {
        return result;
      }
    } catch (error) {
      if (isMountedRef.current) {
        throw error;
      }
    }
  }, []);

  return safeAsync;
};

// 12. 资源预加载Hook
export const usePreload = (resources = []) => {
  const [loadedResources, setLoadedResources] = useState(new Set());

  useEffect(() => {
    const preloadResource = (resource) => {
      return new Promise((resolve, reject) => {
        if (resource.type === 'image') {
          const img = new Image();
          img.onload = () => resolve(resource.url);
          img.onerror = reject;
          img.src = resource.url;
        } else if (resource.type === 'script') {
          const script = document.createElement('script');
          script.onload = () => resolve(resource.url);
          script.onerror = reject;
          script.src = resource.url;
          document.head.appendChild(script);
        } else if (resource.type === 'style') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.onload = () => resolve(resource.url);
          link.onerror = reject;
          link.href = resource.url;
          document.head.appendChild(link);
        }
      });
    };

    const preloadAll = async () => {
      for (const resource of resources) {
        try {
          await preloadResource(resource);
          setLoadedResources(prev => new Set([...prev, resource.url]));
        } catch (error) {
          console.error(`Failed to preload ${resource.url}:`, error);
        }
      }
    };

    preloadAll();
  }, [resources]);

  return loadedResources;
};

export default {
  VirtualScrollList,
  LazyImage,
  LazyComponent,
  useCache,
  useDebounce,
  useThrottle,
  useLocalStorage,
  useNetworkStatus,
  usePerformanceMonitor,
  useBatchedState,
  useSafeAsync,
  usePreload
};

