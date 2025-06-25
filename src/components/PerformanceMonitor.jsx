/**
 * 性能监控组件
 * 监控应用性能指标并提供优化建议
 */

import React, { useEffect, useState } from 'react';
import config from '../utils/config';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
  });

  useEffect(() => {
    if (!config.get('VITE_ENABLE_PERFORMANCE_MONITORING')) {
      return;
    }

    // 监控页面加载时间
    const measureLoadTime = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    };

    // 监控内存使用
    const measureMemoryUsage = () => {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        setMetrics(prev => ({ ...prev, memoryUsage: memoryUsage * 100 }));
      }
    };

    // 监控FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    // 监控渲染时间
    const measureRenderTime = () => {
      if (window.performance && window.performance.mark) {
        window.performance.mark('render-start');
        
        setTimeout(() => {
          window.performance.mark('render-end');
          window.performance.measure('render-time', 'render-start', 'render-end');
          
          const measures = window.performance.getEntriesByName('render-time');
          if (measures.length > 0) {
            setMetrics(prev => ({ ...prev, renderTime: measures[0].duration }));
          }
        }, 0);
      }
    };

    // 初始化监控
    measureLoadTime();
    measureMemoryUsage();
    measureRenderTime();
    requestAnimationFrame(measureFPS);

    // 定期更新内存使用情况
    const memoryInterval = setInterval(measureMemoryUsage, 5000);

    // 监听性能条目
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // 记录长任务
          if (entry.entryType === 'longtask') {
            console.warn('Long task detected:', entry);
          }
          
          // 记录导航时间
          if (entry.entryType === 'navigation') {
            console.log('Navigation timing:', entry);
          }
          
          // 记录资源加载时间
          if (entry.entryType === 'resource') {
            if (entry.duration > 1000) {
              console.warn('Slow resource:', entry.name, entry.duration);
            }
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['longtask', 'navigation', 'resource'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }

      return () => {
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  // 性能警告
  useEffect(() => {
    const { loadTime, memoryUsage, fps } = metrics;

    // 加载时间过长警告
    if (loadTime > 3000) {
      console.warn(`Slow page load: ${loadTime}ms`);
    }

    // 内存使用过高警告
    if (memoryUsage > 80) {
      console.warn(`High memory usage: ${memoryUsage.toFixed(2)}%`);
    }

    // FPS过低警告
    if (fps > 0 && fps < 30) {
      console.warn(`Low FPS: ${fps}`);
    }
  }, [metrics]);

  // 在开发环境下显示性能指标
  if (config.isDevelopment()) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50">
        <div>Load: {metrics.loadTime}ms</div>
        <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
        <div>Memory: {metrics.memoryUsage.toFixed(1)}%</div>
        <div>FPS: {metrics.fps}</div>
      </div>
    );
  }

  return null;
};

export default PerformanceMonitor;

