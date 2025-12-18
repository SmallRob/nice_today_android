// 性能监控工具
import React from 'react';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
    this.setupMonitoring();
  }

  // 开始性能监控
  startMonitoring(componentName) {
    const key = `${componentName}_${Date.now()}`;
    this.metrics.set(key, {
      startTime: performance.now(),
      componentName,
      memoryUsage: this.getMemoryUsage(),
      fps: this.getFPS()
    });
    return key;
  }

  // 结束性能监控
  endMonitoring(key) {
    const metric = this.metrics.get(key);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.memoryUsageEnd = this.getMemoryUsage();
      metric.memoryDelta = metric.memoryUsageEnd - metric.memoryUsage;
      
      this.logPerformance(metric);
      this.checkPerformanceThresholds(metric);
    }
  }

  // 获取内存使用情况
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // 获取FPS
  getFPS() {
    let fps = 60;
    if (typeof requestAnimationFrame === 'function') {
      let lastTime = performance.now();
      let frameCount = 0;
      
      const measureFPS = (currentTime) => {
        frameCount++;
        if (currentTime - lastTime >= 1000) {
          fps = frameCount;
          frameCount = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(measureFPS);
      };
      
      requestAnimationFrame(measureFPS);
    }
    return fps;
  }

  // 记录性能数据
  logPerformance(metric) {
    const status = this.getPerformanceStatus(metric);
    
    console.group(`🔍 性能监控 - ${metric.componentName}`);
    console.log(`⏱️  耗时: ${metric.duration.toFixed(2)}ms`);
    console.log(`💾 内存使用: ${metric.memoryDelta.toFixed(2)}MB`);
    console.log(`🎯 FPS: ${metric.fps}`);
    console.log(`📊 状态: ${status}`);
    console.groupEnd();

    // 如果性能较差，发出警告
    if (status === 'warning' || status === 'critical') {
      console.warn(`⚠️  ${metric.componentName} 性能需要优化`);
    }
  }

  // 检查性能阈值
  checkPerformanceThresholds(metric) {
    const thresholds = {
      duration: 200, // 200ms
      memoryDelta: 10, // 10MB
      fps: 30 // 30FPS
    };

    if (metric.duration > thresholds.duration) {
      console.warn(`⏱️  ${metric.componentName} 渲染时间过长: ${metric.duration.toFixed(2)}ms`);
    }

    if (metric.memoryDelta > thresholds.memoryDelta) {
      console.warn(`💾 ${metric.componentName} 内存使用增加过多: ${metric.memoryDelta.toFixed(2)}MB`);
    }

    if (metric.fps < thresholds.fps) {
      console.warn(`🎯 ${metric.componentName} FPS过低: ${metric.fps}`);
    }
  }

  // 获取性能状态
  getPerformanceStatus(metric) {
    if (metric.duration > 500 || metric.memoryDelta > 20 || metric.fps < 20) {
      return 'critical';
    } else if (metric.duration > 200 || metric.memoryDelta > 10 || metric.fps < 30) {
      return 'warning';
    }
    return 'good';
  }

  // 设置性能监控
  setupMonitoring() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseMonitoring();
      } else {
        this.resumeMonitoring();
      }
    });

    // 监听内存压力
    if ('memory' in performance) {
      setInterval(() => {
        const memory = this.getMemoryUsage();
        if (memory > 100) { // 100MB阈值
          console.warn('⚠️ 内存使用过高，考虑优化内存使用');
        }
      }, 5000);
    }
  }

  pauseMonitoring() {
    console.log('⏸️ 性能监控暂停');
  }

  resumeMonitoring() {
    console.log('▶️ 性能监控恢复');
  }

  // 获取性能报告
  getPerformanceReport() {
    const report = {
      totalDuration: performance.now() - this.startTime,
      metrics: Array.from(this.metrics.values()),
      averageDuration: this.calculateAverage('duration'),
      maxMemoryUsage: this.calculateMax('memoryDelta'),
      minFPS: this.calculateMin('fps')
    };
    
    return report;
  }

  calculateAverage(property) {
    const values = Array.from(this.metrics.values()).map(m => m[property]).filter(v => v);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  calculateMax(property) {
    const values = Array.from(this.metrics.values()).map(m => m[property]).filter(v => v);
    return values.length ? Math.max(...values) : 0;
  }

  calculateMin(property) {
    const values = Array.from(this.metrics.values()).map(m => m[property]).filter(v => v);
    return values.length ? Math.min(...values) : 0;
  }
}

// 创建全局性能监控实例
const performanceMonitor = new PerformanceMonitor();

// 配置性能监控
export const configurePerformanceMonitor = (options) => {
  if (options.thresholds) {
    performanceMonitor.thresholds = { ...performanceMonitor.thresholds, ...options.thresholds };
  }
  if (options.enableLogging !== undefined) {
    performanceMonitor.enableLogging = options.enableLogging;
  }
  return performanceMonitor;
};

// React性能监控HOC
export const withPerformanceMonitor = (Component, componentName) => {
  return (props) => {
    const monitorKey = React.useRef(null);

    React.useEffect(() => {
      monitorKey.current = performanceMonitor.startMonitoring(componentName);
      
      return () => {
        if (monitorKey.current) {
          performanceMonitor.endMonitoring(monitorKey.current);
        }
      };
    }, []);

    return React.createElement(Component, props);
  };
};

// 性能优化工具函数
export const performanceUtils = {
  // 防抖函数
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 节流函数
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 批量更新
  batchUpdates: (callback) => {
    if (React.unstable_batchedUpdates) {
      React.unstable_batchedUpdates(callback);
    } else {
      callback();
    }
  },

  // 虚拟滚动计算
  virtualScroll: (items, containerHeight, itemHeight, scrollTop) => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = startIndex + visibleCount;
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      paddingTop: startIndex * itemHeight,
      paddingBottom: (items.length - endIndex) * itemHeight
    };
  }
};

export default performanceMonitor;