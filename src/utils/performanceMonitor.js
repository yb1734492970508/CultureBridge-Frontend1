// 性能监控和优化工具
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
    };
    
    this.observers = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupPerformanceObservers();
    this.setupNavigationTiming();
    this.setupResourceTiming();
    this.setupUserTiming();
    
    this.isInitialized = true;
  }

  setupPerformanceObservers() {
    // Core Web Vitals 监控
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          this.reportMetric('FID', this.metrics.firstInputDelay);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
        this.reportMetric('CLS', clsValue);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
            this.reportMetric('FCP', entry.startTime);
          }
        });
      });
      
      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }
  }

  setupNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          this.reportMetric('Page Load Time', this.metrics.pageLoadTime);
          
          // 计算各个阶段的时间
          const timings = {
            'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
            'TCP Connection': navigation.connectEnd - navigation.connectStart,
            'Request': navigation.responseStart - navigation.requestStart,
            'Response': navigation.responseEnd - navigation.responseStart,
            'DOM Processing': navigation.domComplete - navigation.domLoading,
          };
          
          Object.entries(timings).forEach(([name, time]) => {
            this.reportMetric(name, time);
          });
        }
      }, 0);
    });
  }

  setupResourceTiming() {
    // 监控资源加载性能
    const resourceObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 1000) { // 超过1秒的资源
          console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
        }
        
        // 分析资源类型
        const resourceType = this.getResourceType(entry.name);
        this.reportResourceMetric(resourceType, entry.duration, entry.transferSize);
      });
    });
    
    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }

  setupUserTiming() {
    // 自定义性能标记
    this.mark('app-start');
    
    window.addEventListener('load', () => {
      this.mark('app-loaded');
      this.measure('app-load-time', 'app-start', 'app-loaded');
    });
  }

  getResourceType(url) {
    if (url.includes('.js')) return 'JavaScript';
    if (url.includes('.css')) return 'CSS';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'Image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'Font';
    return 'Other';
  }

  mark(name) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  measure(name, startMark, endMark) {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.reportMetric(name, measure.duration);
      } catch (e) {
        console.warn(`Failed to measure ${name}:`, e);
      }
    }
  }

  reportMetric(name, value) {
    // 发送到分析服务
    if (process.env.NODE_ENV === 'production') {
      // TODO: 发送到实际的分析服务
      console.log(`Performance Metric - ${name}: ${value}`);
    } else {
      console.log(`📊 ${name}: ${Math.round(value)}ms`);
    }
    
    // 存储到本地用于调试
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    metrics.push({
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
    });
    
    // 只保留最近100条记录
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
    
    localStorage.setItem('performance_metrics', JSON.stringify(metrics));
  }

  reportResourceMetric(type, duration, size) {
    const resourceMetrics = JSON.parse(localStorage.getItem('resource_metrics') || '{}');
    
    if (!resourceMetrics[type]) {
      resourceMetrics[type] = {
        count: 0,
        totalDuration: 0,
        totalSize: 0,
        avgDuration: 0,
        avgSize: 0,
      };
    }
    
    resourceMetrics[type].count++;
    resourceMetrics[type].totalDuration += duration;
    resourceMetrics[type].totalSize += size || 0;
    resourceMetrics[type].avgDuration = resourceMetrics[type].totalDuration / resourceMetrics[type].count;
    resourceMetrics[type].avgSize = resourceMetrics[type].totalSize / resourceMetrics[type].count;
    
    localStorage.setItem('resource_metrics', JSON.stringify(resourceMetrics));
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getResourceMetrics() {
    return JSON.parse(localStorage.getItem('resource_metrics') || '{}');
  }

  getPerformanceMetrics() {
    return JSON.parse(localStorage.getItem('performance_metrics') || '[]');
  }

  cleanup() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        console.warn('Failed to disconnect observer:', e);
      }
    });
    this.observers = [];
    this.isInitialized = false;
  }

  // 性能优化建议
  getOptimizationSuggestions() {
    const suggestions = [];
    
    if (this.metrics.largestContentfulPaint > 2500) {
      suggestions.push({
        type: 'LCP',
        message: 'LCP超过2.5秒，建议优化图片加载和关键资源',
        priority: 'high'
      });
    }
    
    if (this.metrics.firstInputDelay > 100) {
      suggestions.push({
        type: 'FID',
        message: 'FID超过100ms，建议减少JavaScript执行时间',
        priority: 'medium'
      });
    }
    
    if (this.metrics.cumulativeLayoutShift > 0.1) {
      suggestions.push({
        type: 'CLS',
        message: 'CLS超过0.1，建议为图片和广告预留空间',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  // 实时性能监控
  startRealTimeMonitoring() {
    setInterval(() => {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const memoryUsage = {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit,
        };
        
        this.reportMetric('Memory Usage', memoryUsage.used);
        
        // 内存使用率超过80%时警告
        if (memoryUsage.used / memoryUsage.limit > 0.8) {
          console.warn('High memory usage detected:', memoryUsage);
        }
      }
    }, 10000); // 每10秒检查一次
  }
}

// 资源预加载器
class ResourcePreloader {
  static preloadedResources = new Set();
  
  static preloadCriticalResources() {
    const criticalResources = [
      // 关键CSS
      '/static/css/critical.css',
      // 关键字体
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      // 关键图片
      '/static/images/logo.svg',
      '/static/images/hero-bg.webp',
    ];
    
    criticalResources.forEach(resource => {
      this.preloadResource(resource);
    });
  }
  
  static preloadResource(url, type = 'auto') {
    if (this.preloadedResources.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    // 自动检测资源类型
    if (type === 'auto') {
      if (url.includes('.css')) {
        link.as = 'style';
      } else if (url.includes('.js')) {
        link.as = 'script';
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        link.as = 'image';
      } else if (url.match(/\.(woff|woff2|ttf|eot)$/i)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }
    } else {
      link.as = type;
    }
    
    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }
  
  static preloadOnHover(element, url) {
    let timeoutId;
    
    element.addEventListener('mouseenter', () => {
      timeoutId = setTimeout(() => {
        this.preloadResource(url);
      }, 100);
    });
    
    element.addEventListener('mouseleave', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  }
  
  static preloadOnIntersection(elements, urls) {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          this.preloadResource(urls[index]);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    elements.forEach(element => {
      observer.observe(element);
    });
  }
}

// 代码分割优化器
class CodeSplittingOptimizer {
  static setupDynamicImports() {
    // 动态导入优化
    const originalImport = window.import || (() => {});
    
    window.import = function(specifier) {
      console.log(`Dynamic import: ${specifier}`);
      return originalImport.call(this, specifier);
    };
  }
  
  static preloadChunks(chunkNames) {
    chunkNames.forEach(chunkName => {
      const script = document.createElement('link');
      script.rel = 'preload';
      script.href = `/static/js/${chunkName}.chunk.js`;
      script.as = 'script';
      document.head.appendChild(script);
    });
  }
  
  static setupChunkPreloading() {
    // 基于路由预加载代码块
    const routeChunkMap = {
      '/dashboard': ['dashboard', 'charts'],
      '/chat': ['chat', 'socket'],
      '/voice-translation': ['voice', 'translation'],
      '/blockchain': ['blockchain', 'web3'],
    };
    
    // 监听路由变化
    window.addEventListener('popstate', () => {
      const currentPath = window.location.pathname;
      const chunks = routeChunkMap[currentPath];
      if (chunks) {
        this.preloadChunks(chunks);
      }
    });
  }
}

// 缓存优化器
class CacheOptimizer {
  static setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }
  
  static setupCacheHeaders() {
    // 设置缓存策略
    const cacheStrategies = {
      'static': 'max-age=31536000', // 1年
      'api': 'max-age=300', // 5分钟
      'images': 'max-age=86400', // 1天
    };
    
    return cacheStrategies;
  }
  
  static clearOldCaches() {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        const oldCaches = cacheNames.filter(name => 
          name.includes('old') || name.includes('v1')
        );
        
        return Promise.all(
          oldCaches.map(cacheName => caches.delete(cacheName))
        );
      });
    }
  }
}

// 导出性能监控实例
export const performanceMonitor = new PerformanceMonitor();
export const preloadCriticalResources = ResourcePreloader.preloadCriticalResources.bind(ResourcePreloader);
export const codeOptimizer = CodeSplittingOptimizer;
export const cacheOptimizer = CacheOptimizer;

// 性能优化初始化函数
export const initPerformanceOptimizations = () => {
  performanceMonitor.init();
  performanceMonitor.startRealTimeMonitoring();
  
  ResourcePreloader.preloadCriticalResources();
  CodeSplittingOptimizer.setupDynamicImports();
  CodeSplittingOptimizer.setupChunkPreloading();
  
  CacheOptimizer.setupServiceWorker();
  CacheOptimizer.clearOldCaches();
};

export default {
  performanceMonitor,
  ResourcePreloader,
  CodeSplittingOptimizer,
  CacheOptimizer,
  initPerformanceOptimizations,
};

