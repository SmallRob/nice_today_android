// 玛雅日历性能测试工具
import React from 'react';

class MayaPerformanceTest {
  constructor() {
    this.testResults = new Map();
    this.testConfig = {
      loadTimeThreshold: 2000, // 2秒
      renderTimeThreshold: 200, // 200ms
      memoryThreshold: 50, // 50MB
      fpsThreshold: 30 // 30FPS
    };
  }

  // 运行完整性能测试
  async runCompleteTest(componentName, testFunction) {
    console.group(`🧪 ${componentName} 性能测试`);
    
    const testId = this.startTest(componentName);
    
    try {
      // 测试加载性能
      const loadTime = await this.testLoadPerformance(testFunction);
      
      // 测试渲染性能
      const renderTime = await this.testRenderPerformance(testFunction);
      
      // 测试内存使用
      const memoryUsage = await this.testMemoryUsage(testFunction);
      
      // 测试FPS
      const fps = await this.testFPS(testFunction);
      
      // 生成测试报告
      const report = this.generateReport({
        componentName,
        loadTime,
        renderTime,
        memoryUsage,
        fps
      });
      
      this.endTest(testId, report);
      
      console.groupEnd();
      return report;
      
    } catch (error) {
      console.error(`测试失败: ${error.message}`);
      this.endTest(testId, { error: error.message });
      console.groupEnd();
      throw error;
    }
  }

  // 测试加载性能
  async testLoadPerformance(testFunction) {
    const startTime = performance.now();
    await testFunction();
    const endTime = performance.now();
    
    return endTime - startTime;
  }

  // 测试渲染性能
  async testRenderPerformance(testFunction) {
    // 模拟多次渲染以测试平均渲染时间
    const renderTimes = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      await testFunction();
      const endTime = performance.now();
      renderTimes.push(endTime - startTime);
      
      // 等待一段时间避免连续渲染
      await this.delay(50);
    }
    
    return renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
  }

  // 测试内存使用
  async testMemoryUsage(testFunction) {
    if (!performance.memory) {
      console.warn('⚠️ 浏览器不支持内存监控');
      return 0;
    }
    
    const initialMemory = performance.memory.usedJSHeapSize;
    await testFunction();
    const finalMemory = performance.memory.usedJSHeapSize;
    
    return (finalMemory - initialMemory) / 1024 / 1024; // MB
  }

  // 测试FPS
  async testFPS(testFunction) {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        return fps;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    await testFunction();
    return new Promise(resolve => {
      setTimeout(() => {
        const fps = measureFPS();
        resolve(fps || 60);
      }, 1000);
    });
  }

  // 开始测试
  startTest(componentName) {
    const testId = `${componentName}_${Date.now()}`;
    this.testResults.set(testId, {
      componentName,
      startTime: performance.now(),
      status: 'running'
    });
    
    return testId;
  }

  // 结束测试
  endTest(testId, results) {
    const test = this.testResults.get(testId);
    if (test) {
      test.endTime = performance.now();
      test.duration = test.endTime - test.startTime;
      test.results = results;
      test.status = 'completed';
      
      this.logTestResults(test);
    }
  }

  // 生成测试报告
  generateReport(results) {
    const score = this.calculatePerformanceScore(results);
    
    return {
      ...results,
      score,
      passed: score >= 80,
      recommendations: this.generateRecommendations(results)
    };
  }

  // 计算性能分数
  calculatePerformanceScore(results) {
    let score = 100;
    
    // 加载时间评分
    if (results.loadTime > this.testConfig.loadTimeThreshold) {
      score -= Math.min(30, (results.loadTime - this.testConfig.loadTimeThreshold) / 100);
    }
    
    // 渲染时间评分
    if (results.renderTime > this.testConfig.renderTimeThreshold) {
      score -= Math.min(30, (results.renderTime - this.testConfig.renderTimeThreshold) / 10);
    }
    
    // 内存使用评分
    if (results.memoryUsage > this.testConfig.memoryThreshold) {
      score -= Math.min(30, (results.memoryUsage - this.testConfig.memoryThreshold) / 2);
    }
    
    // FPS评分
    if (results.fps < this.testConfig.fpsThreshold) {
      score -= Math.min(30, (this.testConfig.fpsThreshold - results.fps) * 2);
    }
    
    return Math.max(0, Math.round(score));
  }

  // 生成优化建议
  generateRecommendations(results) {
    const recommendations = [];
    
    if (results.loadTime > this.testConfig.loadTimeThreshold) {
      recommendations.push({
        type: 'critical',
        message: `加载时间过长 (${results.loadTime.toFixed(0)}ms > ${this.testConfig.loadTimeThreshold}ms)`,
        suggestion: '优化异步加载和懒加载机制'
      });
    }
    
    if (results.renderTime > this.testConfig.renderTimeThreshold) {
      recommendations.push({
        type: 'warning',
        message: `渲染时间较长 (${results.renderTime.toFixed(0)}ms > ${this.testConfig.renderTimeThreshold}ms)`,
        suggestion: '实现分块渲染和虚拟滚动'
      });
    }
    
    if (results.memoryUsage > this.testConfig.memoryThreshold) {
      recommendations.push({
        type: 'warning',
        message: `内存使用较高 (${results.memoryUsage.toFixed(1)}MB > ${this.testConfig.memoryThreshold}MB)`,
        suggestion: '优化内存使用和垃圾回收'
      });
    }
    
    if (results.fps < this.testConfig.fpsThreshold) {
      recommendations.push({
        type: 'warning',
        message: `FPS较低 (${results.fps} < ${this.testConfig.fpsThreshold})`,
        suggestion: '优化动画和DOM操作'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        message: '性能表现优秀！',
        suggestion: '继续保持当前优化水平'
      });
    }
    
    return recommendations;
  }

  // 记录测试结果
  logTestResults(test) {
    console.log(`📊 ${test.componentName} 测试结果:`);
    console.log(`⏱️  总耗时: ${test.duration.toFixed(2)}ms`);
    
    if (test.results.error) {
      console.error(`❌ 错误: ${test.results.error}`);
      return;
    }
    
    console.log(`📈 性能分数: ${test.results.score}/100`);
    console.log(`✅ 是否通过: ${test.results.passed ? '是' : '否'}`);
    console.log(`🔍 详细结果:`, test.results);
    
    // 显示优化建议
    if (test.results.recommendations.length > 0) {
      console.log('💡 优化建议:');
      test.results.recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : '✅';
        console.log(`${icon} ${rec.message} - ${rec.suggestion}`);
      });
    }
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取所有测试结果
  getAllResults() {
    return Array.from(this.testResults.values());
  }

  // 清空测试结果
  clearResults() {
    this.testResults.clear();
  }
}

// 创建测试实例
export const mayaPerformanceTest = new MayaPerformanceTest();

// React组件性能测试Hook
export const usePerformanceTest = (componentName, testFunction, dependencies = []) => {
  React.useEffect(() => {
    const runTest = async () => {
      try {
        await mayaPerformanceTest.runCompleteTest(componentName, testFunction);
      } catch (error) {
        console.error(`性能测试失败: ${error.message}`);
      }
    };
    
    runTest();
  }, dependencies);
};

// 性能基准测试
export const benchmark = {
  // 基准测试配置
  config: {
    iterations: 100,
    warmup: 10
  },

  // 运行基准测试
  async run(name, testFunction) {
    console.group(`🏃 ${name} 基准测试`);
    
    // 预热
    for (let i = 0; i < this.config.warmup; i++) {
      await testFunction();
    }
    
    // 正式测试
    const times = [];
    for (let i = 0; i < this.config.iterations; i++) {
      const start = performance.now();
      await testFunction();
      const end = performance.now();
      times.push(end - start);
    }
    
    // 计算统计信息
    const stats = this.calculateStats(times);
    this.logBenchmarkResults(name, stats);
    
    console.groupEnd();
    return stats;
  },

  // 计算统计信息
  calculateStats(times) {
    const sorted = [...times].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      count: times.length,
      average: sum / times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  },

  // 记录基准测试结果
  logBenchmarkResults(name, stats) {
    console.log(`📊 ${name} 基准测试结果:`);
    console.log(`🔢 测试次数: ${stats.count}`);
    console.log(`📈 平均时间: ${stats.average.toFixed(2)}ms`);
    console.log(`⬇️  最快时间: ${stats.min.toFixed(2)}ms`);
    console.log(`⬆️  最慢时间: ${stats.max.toFixed(2)}ms`);
    console.log(`📊 中位数: ${stats.median.toFixed(2)}ms`);
    console.log(`📊 95分位: ${stats.p95.toFixed(2)}ms`);
  }
};