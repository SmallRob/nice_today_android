/**
 * 修复后的性能优化工具类
 * 修复了与Capacitor版本兼容性的问题
 */

import React, { useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

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
const now = () => {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
};

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

// 启动性能追踪
export const startTrace = async (traceName) => {
  // 返回一个简单的追踪对象
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

// 性能监控初始化
export const initializePerformanceMonitoring = (config = {}) => {
  // 合并配置
  Object.assign(PERFORMANCE_CONFIG, config);

  if (!PERFORMANCE_CONFIG.enabled) {
    return;
  }

  // 页面卸载时生成报告
  window.addEventListener('beforeunload', () => {
    if (PERFORMANCE_CONFIG.autoLog) {
      console.log('Performance Report:', generatePerformanceReport());
      console.log('Performance Recommendations:', getPerformanceRecommendations());
    }
  });
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
        min: Math.min(...durations)
      };
    }
  });

  return report;
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
      description: '平均渲染时间超过16ms，可能影响用户体验'
    });
  }

  return recommendations;
};