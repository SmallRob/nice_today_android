import React, { useRef, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// 性能监控类
class PerformanceMonitor {
  constructor() {
    // 检测是否为原生平台
    this.isNative = Capacitor.isNativePlatform();
    this.platform = Capacitor.getPlatform();
    
    // 性能监控配置
    this.config = {
      // 是否启用性能监控
      enabled: process.env.NODE_ENV !== 'production', // 默认在非生产环境中启用
      // 性能阈值（毫秒）
      thresholds: {
        // 渲染时间阈值
        render: 16, // 一帧的时间（60fps）
        // API请求阈值
        api: 2000,
        // 组件加载阈值
        componentLoad: 500,
        // 路由切换阈值
        routeChange: 300
      },
      // 是否自动记录
      autoLog: true,
      // 是否在控制台输出
      consoleOutput: process.env.NODE_ENV === 'development'
    };
    
    // 性能指标存储
    this.metrics = {
      renders: [],
      apiRequests: [],
      componentLoads: [],
      routeChanges: [],
      memoryUsage: [],
      customTraces: []
    };
    
    // 初始化性能监控
    this.init();
  }
  
  // 初始化性能监控
  init() {
    // 页面卸载时生成报告
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.config.autoLog) {
          this.logReport();
        }
      });
    }
    
    // 设置定期内存监控
    if (this.isNative || (typeof performance !== 'undefined' && performance.memory)) {
      setInterval(() => {
        this.memoryMonitor();
      }, 30000); // 每30秒检查一次内存使用情况
    }
  }
  
  // 配置性能监控
  configure(config) {
    Object.assign(this.config, config);
  }
  
  // 获取当前时间戳
  now() {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }
  
  // 记录性能指标
  recordMetric(type, name, duration, metadata = {}) {
    // 如果未启用性能监控，直接返回
    if (!this.config.enabled) {
      return;
    }
    
    const metric = {
      type,
      name,
      duration,
      timestamp: Date.now(),
      metadata,
      platform: this.platform
    };
    
    // 确保类型数组存在
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }
    
    // 添加指标
    this.metrics[type].push(metric);
    
    // 限制数组长度，避免内存泄漏
    if (this.metrics[type].length > 1000) {
      this.metrics[type].shift();
    }
    
    // 检查是否超过阈值
    const threshold = this.config.thresholds[type];
    if (threshold && duration > threshold) {
      console.warn(`Performance warning: ${name} took ${duration}ms (threshold: ${threshold}ms)`, metadata);
    }
    
    // 控制台输出
    if (this.config.consoleOutput) {
      console.log(`Performance: ${type} - ${name}: ${duration}ms`, metadata);
    }
    
    return metric;
  }
  
  // 内存使用监控
  memoryMonitor() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const memoryInfo = performance.memory;
      const memoryUsage = {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) // MB
      };
      
      this.recordMetric('memoryUsage', 'current', memoryUsage.used, memoryUsage);
      return memoryUsage;
    }
    
    return { used: 0, total: 0, limit: 0 };
  }
  
  // 启动性能追踪
  startTrace(traceName) {
    // 如果未启用性能监控，返回空对象
    if (!this.config.enabled) {
      return {
        stop: () => {},
        putMetric: () => {},
        incrementMetric: () => {}
      };
    }
    
    const trace = {
      name: traceName,
      startTime: this.now(),
      stop: () => {
        const duration = this.now() - trace.startTime;
        this.recordMetric('customTraces', traceName, duration);
      },
      putMetric: (metricName, value) => {
        this.recordMetric('customMetrics', `${traceName}_${metricName}`, value);
      },
      incrementMetric: (metricName, increment = 1) => {
        this.recordMetric('customMetrics', `${traceName}_${metricName}`, increment, {
          increment: true
        });
      }
    };
    
    return trace;
  }
  
  // 生成性能报告
  generateReport() {
    const report = {
      summary: {},
      details: {}
    };
    
    // 计算平均值、最大值等统计信息
    Object.keys(this.metrics).forEach(type => {
      const metrics = this.metrics[type];
      if (metrics.length > 0) {
        const durations = metrics.map(m => m.duration);
        report.summary[type] = {
          count: metrics.length,
          average: durations.reduce((a, b) => a + b, 0) / durations.length,
          max: Math.max(...durations),
          min: Math.min(...durations),
          p50: this.getPercentile(durations, 50),
          p90: this.getPercentile(durations, 90),
          p95: this.getPercentile(durations, 95)
        };
        
        // 保留最新的100条详细记录
        report.details[type] = metrics.slice(-100);
      }
    });
    
    return report;
  }
  
  // 获取百分位数
  getPercentile(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;
    
    const sorted = [...sortedArray].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
  
  // 清除性能数据
  clearData() {
    Object.keys(this.metrics).forEach(type => {
      this.metrics[type] = [];
    });
  }
  
  // 获取性能建议
  getRecommendations() {
    const report = this.generateReport();
    const recommendations = [];
    
    // 渲染性能建议
    if (report.summary.renders && report.summary.renders.average > 16) {
      recommendations.push({
        category: 'rendering',
        priority: 'high',
        title: '渲染性能不佳',
        description: '平均渲染时间超过16ms，可能影响用户体验',
        suggestions: [
          '考虑使用React.memo优化组件渲染',
          '减少不必要的组件更新',
          '使用React.lazy和Suspense进行代码分割'
        ]
      });
    }
    
    // API请求性能建议
    if (report.summary.apiRequests && report.summary.apiRequests.average > 2000) {
      recommendations.push({
        category: 'api',
        priority: 'medium',
        title: 'API响应时间较长',
        description: '平均API响应时间超过2秒',
        suggestions: [
          '实现请求缓存机制',
          '考虑使用更高效的API请求库',
          '添加加载指示器改善用户体验'
        ]
      });
    }
    
    // 组件加载性能建议
    if (report.summary.componentLoads && report.summary.componentLoads.average > 500) {
      recommendations.push({
        category: 'component',
        priority: 'medium',
        title: '组件加载时间较长',
        description: '平均组件加载时间超过500ms',
        suggestions: [
          '使用React.lazy延迟加载非关键组件',
          '优化组件内部逻辑',
          '考虑使用更轻量级的替代组件'
        ]
      });
    }
    
    // 内存使用建议
    if (report.summary.memoryUsage) {
      const latestMemory = report.details.memoryUsage[report.details.memoryUsage.length - 1];
      if (latestMemory && latestMemory.used > 50) { // 50MB
        recommendations.push({
          category: 'memory',
          priority: 'medium',
          title: '内存使用较高',
          description: `当前内存使用量约为${latestMemory.used}MB`,
          suggestions: [
            '检查内存泄漏',
            '及时清理不再需要的对象和事件监听器',
            '优化数据结构和算法'
          ]
        });
      }
    }
    
    return recommendations;
  }
  
  // 记录并输出报告
  logReport() {
    const report = this.generateReport();
    const recommendations = this.getRecommendations();
    
    if (this.config.consoleOutput) {
      console.log('=== 性能报告 ===');
      console.log('Summary:', report.summary);
      console.log('Recommendations:', recommendations);
    }
    
    return { report, recommendations };
  }
  
  // 获取指标数据
  getMetrics() {
    return { ...this.metrics };
  }
}

// 创建性能监控实例
const performanceMonitor = new PerformanceMonitor();

// React Hook - 性能监控钩子
export const usePerformanceMonitor = (componentName) => {
  const startTime = useRef(performanceMonitor.now());
  
  useEffect(() => {
    const endTime = performanceMonitor.now();
    performanceMonitor.recordMetric('componentLoads', componentName, endTime - startTime.current, {
      mountTime: endTime - startTime.current
    });
  }, [componentName]);
  
  useEffect(() => {
    return () => {
      // 组件卸载时记录
      const totalTime = performanceMonitor.now() - startTime.current;
      performanceMonitor.recordMetric('componentLifecycles', `${componentName}_lifecycle`, totalTime, {
        component: componentName,
        lifecycle: 'mount-to-unmount'
      });
    };
  }, [componentName]);
};

// React Hook - 渲染性能监控
export const useRenderPerformance = (componentName) => {
  const renderStartTime = useRef(performanceMonitor.now());
  
  useEffect(() => {
    const renderTime = performanceMonitor.now() - renderStartTime.current;
    performanceMonitor.recordMetric('renders', componentName, renderTime);
  });
  
  // 返回重新开始计时的函数
  const restartTimer = useCallback(() => {
    renderStartTime.current = performanceMonitor.now();
  }, []);
  
  return restartTimer;
};

// React Hook - API请求性能监控
export const useApiPerformance = () => {
  const startApiTrace = useCallback((apiName) => {
    const trace = performanceMonitor.startTrace(`api_${apiName}`);
    return {
      ...trace,
      end: trace.stop
    };
  }, []);
  
  return startApiTrace;
};

// 高阶组件 - 包装组件以监控渲染性能
export const withRenderPerformance = (Component) => {
  const WrappedComponent = (props) => {
    const componentName = Component.displayName || Component.name || 'UnknownComponent';
    const renderStartTime = useRef(performanceMonitor.now());
    
    useEffect(() => {
      const renderTime = performanceMonitor.now() - renderStartTime.current;
      performanceMonitor.recordMetric('renders', componentName, renderTime, {
        props: Object.keys(props)
      });
    });
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withRenderPerformance(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// React Profiler回调
export const profilerCallback = (id, phase, actualDuration) => {
  performanceMonitor.recordMetric('profiler', `${id}_${phase}`, actualDuration, {
    phase,
    id
  });
};

// 导出性能监控实例
export default performanceMonitor;

// 导出配置函数
export const configurePerformanceMonitor = (config) => {
  performanceMonitor.configure(config);
};