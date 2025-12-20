// 标签切换性能监控工具
class TabPerformanceMonitor {
  constructor() {
    this.measurements = new Map();
    this.enabled = process.env.NODE_ENV === 'development';
    this.thresholds = {
      tabSwitch: 100, // 标签切换阈值（毫秒）
      componentLoad: 200, // 组件加载阈值（毫秒）
      renderTime: 50 // 渲染时间阈值（毫秒）
    };
  }

  // 开始测量
  startMeasurement(name) {
    if (!this.enabled) return;
    
    this.measurements.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
    
    console.log(`[Performance] 开始测量: ${name}`);
  }

  // 结束测量
  endMeasurement(name) {
    if (!this.enabled) return;
    
    const measurement = this.measurements.get(name);
    if (!measurement) return;
    
    measurement.endTime = performance.now();
    measurement.duration = measurement.endTime - measurement.startTime;
    
    // 检查是否超过阈值
    const threshold = this.thresholds[name.split('_')[0]] || this.thresholds.tabSwitch;
    if (measurement.duration > threshold) {
      console.warn(`[Performance] ${name} 耗时 ${measurement.duration.toFixed(2)}ms，超过阈值 ${threshold}ms`);
    } else {
      console.log(`[Performance] ${name} 耗时 ${measurement.duration.toFixed(2)}ms`);
    }
    
    this.measurements.delete(name);
    return measurement.duration;
  }

  // 测量标签切换性能
  measureTabSwitch(fromTab, toTab) {
    if (!this.enabled) return;
    
    const measurementName = `tabSwitch_${fromTab}_to_${toTab}`;
    this.startMeasurement(measurementName);
    
    // 返回结束函数
    return () => this.endMeasurement(measurementName);
  }

  // 测量组件加载性能
  measureComponentLoad(componentName) {
    if (!this.enabled) return;
    
    const measurementName = `componentLoad_${componentName}`;
    this.startMeasurement(measurementName);
    
    return () => this.endMeasurement(measurementName);
  }

  // 获取性能报告
  getPerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      measurements: Array.from(this.measurements.entries()).map(([name, data]) => ({
        name,
        ...data
      }))
    };
    
    return report;
  }

  // 启用/禁用监控
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// 创建全局实例
const tabPerformanceMonitor = new TabPerformanceMonitor();

// React Hook for performance monitoring
export const useTabPerformance = () => {
  const measureTabSwitch = (fromTab, toTab) => {
    return tabPerformanceMonitor.measureTabSwitch(fromTab, toTab);
  };

  const measureComponentLoad = (componentName) => {
    return tabPerformanceMonitor.measureComponentLoad(componentName);
  };

  return {
    measureTabSwitch,
    measureComponentLoad,
    getPerformanceReport: () => tabPerformanceMonitor.getPerformanceReport(),
    setEnabled: (enabled) => tabPerformanceMonitor.setEnabled(enabled)
  };
};

export default tabPerformanceMonitor;