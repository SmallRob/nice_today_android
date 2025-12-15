/**
 * 性能优化工具类
 * 用于监控和优化React应用在移动设备上的性能
 */

import { Capacitor } from '@capacitor/core';
import { Performance } from '@capacitor/performance';

// 检测是否为原生平台
const isNative = Capacitor.isNativePlatform();

// 性能监控配置
const PERFORMANCE_CONFIG = {
  // 是否启用性能监控
  enabled: process.env.NODE_ENV === 'production' ? false : true,
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
let performanceMetrics = {
  renders: [],
  apiRequests: [],
  componentLoads: [],
  routeChanges: [],
  memoryUsage: []
};

// 获取当前时间戳
const now = () => performance.now();

// 记录性能指标
const recordMetric = (type, name, duration, metadata = {}) => {
  const metric = {
    type,
    name,
    duration,
    timestamp: Date.now(),
    metadata,
    platform: Capacitor.getPlatform()
  };

  if (!performanceMetrics[type]) {
    performanceMetrics[type] = [];
  }
  
  performanceMetrics[type].push(metric);

  // 检查是否超过阈值
  const threshold = PERFORMANCE_CONFIG.thresholds[type];
  if (threshold && duration > threshold) {
    console.warn(`Performance warning: ${name} took ${duration}ms (threshold: ${threshold}ms)`, metadata);
  }

  // 如果启用Capacitor性能追踪，记录到原生性能工具
  if (isNative && Performance) {
    // 这里可以集成原生性能追踪
    // 例如：Performance.recordMetric(metric);
  }

  // 控制台输出
  if (PERFORMANCE_CONFIG.consoleOutput) {
    console.log(`Performance: ${type} - ${name}: ${duration}ms`, metadata);
  }

  return metric;
};

// 性能监控钩子
export const usePerformanceMonitor = (componentName) => {
  const startTime = useRef(now());

  useEffect(() => {
    const endTime = now();
    recordMetric('componentLoads', componentName, endTime - startTime.current, {
      mountTime: endTime - startTime.current
    });
  }, [componentName]);

  useEffect(() => {
    return () => {
      // 组件卸载时记录
      const totalTime = now() - startTime.current;
      recordMetric('componentLifecycles', `${componentName}_lifecycle`, totalTime, {
        component: componentName,
        lifecycle: 'mount-to-unmount'
      });
    };
  }, [componentName]);
};

// 渲染性能监控
export const withRenderPerformance = (Component) => {
  const WrappedComponent = (props) => {
    const renderStartTime = useRef(now());
    const componentName = Component.displayName || Component.name;

    const result = <Component {...props} />;

    useEffect(() => {
      const renderTime = now() - renderStartTime.current;
      recordMetric('renders', componentName, renderTime, {
        props: Object.keys(props)
      });
    });

    return result;
  };

  WrappedComponent.displayName = `withRenderPerformance(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// API请求性能监控
export const apiPerformanceMonitor = (apiFunction, functionName) => {
  return async (...args) => {
    const startTime = now();
    
    try {
      const result = await apiFunction(...args);
      const duration = now() - startTime;
      recordMetric('apiRequests', functionName, duration, {
        success: true,
        argsCount: args.length
      });
      return result;
    } catch (error) {
      const duration = now() - startTime;
      recordMetric('apiRequests', functionName, duration, {
        success: false,
        error: error.message,
        argsCount: args.length
      });
      throw error;
    }
  };
};

// 路由切换性能监控
export const routePerformanceMonitor = (routeName) => {
  const startTime = now();
  
  return {
    recordRouteChange: () => {
      const duration = now() - startTime;
      recordMetric('routeChanges', routeName, duration);
    }
  };
};

// 内存使用监控
export const memoryMonitor = () => {
  if (performance && performance.memory) {
    const memoryInfo = performance.memory;
    const memoryUsage = {
      used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) // MB
    };
    
    recordMetric('memoryUsage', 'current', memoryUsage.used, memoryUsage);
    
    return memoryUsage;
  }
  
  return { used: 0, total: 0, limit: 0 };
};

// 启动性能追踪
export const startTrace = async (traceName) => {
  if (isNative && Performance) {
    try {
      const trace = await Performance.startTrace({ name: traceName });
      return trace;
    } catch (error) {
      console.error('Error starting trace:', error);
    }
  }
  
  // Web环境下返回一个简单的追踪对象
  return {
    name: traceName,
    startTime: now(),
    async stop() {
      const duration = now() - this.startTime;
      recordMetric('customTrace', traceName, duration);
    },
    async putMetric(metricName, value) {
      recordMetric('customMetric', `${traceName}_${metricName}`, value);
    },
    async incrementMetric(metricName, increment = 1) {
      recordMetric('customMetric', `${traceName}_${metricName}`, increment, {
        increment: true
      });
    }
  };
};

// 生成性能报告
export const generatePerformanceReport = () => {
  const report = {
    summary: {},
    details: performanceMetrics
  };

  // 计算平均值、最大值等统计信息
  Object.keys(performanceMetrics).forEach(type => {
    const metrics = performanceMetrics[type];
    if (metrics.length > 0) {
      const durations = metrics.map(m => m.duration);
      report.summary[type] = {
        count: metrics.length,
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        max: Math.max(...durations),
        min: Math.min(...durations),
        p50: getPercentile(durations, 50),
        p90: getPercentile(durations, 90),
        p95: getPercentile(durations, 95)
      };
    }
  });

  return report;
};

// 获取百分位数
const getPercentile = (sortedArray, percentile) => {
  if (sortedArray.length === 0) return 0;
  
  const sorted = [...sortedArray].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
};

// 清除性能数据
export const clearPerformanceData = () => {
  performanceMetrics = {
    renders: [],
    apiRequests: [],
    componentLoads: [],
    routeChanges: [],
    memoryUsage: []
  };
};

// 性能优化建议
export const getPerformanceRecommendations = () => {
  const report = generatePerformanceReport();
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
    if (latestMemory && latestMetadata > 50) { // 50MB
      recommendations.push({
        category: 'memory',
        priority: 'medium',
        title: '内存使用较高',
        description: `当前内存使用量约为${latestMetadata}MB`,
        suggestions: [
          '检查内存泄漏',
          '及时清理不再需要的对象和事件监听器',
          '优化数据结构和算法'
        ]
      });
    }
  }

  return recommendations;
};

// 性能监控初始化
export const initializePerformanceMonitoring = (config = {}) => {
  // 合并配置
  Object.assign(PERFORMANCE_CONFIG, config);

  if (!PERFORMANCE_CONFIG.enabled) {
    return;
  }

  // 设置定期内存监控
  if (isNative || performance.memory) {
    setInterval(memoryMonitor, 30000); // 每30秒检查一次内存使用情况
  }

  // 页面卸载时生成报告
  window.addEventListener('beforeunload', () => {
    if (PERFORMANCE_CONFIG.autoLog) {
      console.log('Performance Report:', generatePerformanceReport());
      console.log('Performance Recommendations:', getPerformanceRecommendations());
    }
  });
};

// React Profiler高阶组件
export const withProfiler = (Component, id) => {
  const ProfilerComponent = React.memo((props) => {
    return (
      <React.Profiler id={id || Component.displayName || Component.name} 
        onRender={(id, phase, actualDuration) => {
          recordMetric('profiler', `${id}_${phase}`, actualDuration, {
            phase,
            id
          });
        }}
      >
        <Component {...props} />
      </React.Profiler>
    );
  });

  ProfilerComponent.displayName = `withProfiler(${Component.displayName || Component.name})`;
  return ProfilerComponent;
};