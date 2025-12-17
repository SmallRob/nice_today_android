import { Capacitor } from '@capacitor/core';
import performanceMonitor from './performanceMonitor';
import appOptimizer from './appOptimizer';
import { isAppInitialized, initializeApp } from './appInitializer';

// 启动优化器类
class StartupOptimizer {
  constructor() {
    // 检测平台
    this.isNative = Capacitor.isNativePlatform();
    this.platform = Capacitor.getPlatform();
    
    // 启动优化配置
    this.config = {
      // 关键资源预加载
      preload: {
        criticalAssets: true,
        essentialData: true,
        fonts: true
      },
      
      // 并行初始化
      parallelInit: {
        capacitor: true,
        performance: true,
        compatibility: true
      },
      
      // 延迟加载
      deferredLoading: {
        nonEssentialModules: true,
        backgroundTasks: true,
        analytics: true
      },
      
      // 内存优化
      memory: {
        earlyGC: true,
        minimizeInitialAllocations: true
      },
      
      // 网络优化
      network: {
        prefetchAPIs: true,
        connectionPooling: true
      }
    };
    
    // 启动阶段跟踪
    this.startupPhases = {
      preloading: false,
      initialization: false,
      rendering: false,
      postRender: false
    };
    
    // 关键资源列表
    this.criticalAssets = [
      // 字体资源
      { type: 'font', url: '/fonts/main-font.woff2' },
      { type: 'font', url: '/fonts/secondary-font.woff2' },
      
      // 关键图片资源
      { type: 'image', url: '/images/logo.png' },
      { type: 'image', url: '/images/loading-spinner.gif' },
      
      // 关键CSS
      { type: 'style', url: '/css/critical.css' }
    ];
    
    console.log('StartupOptimizer initialized');
  }
  
  // 优化应用启动过程
  async optimizeStartup(customConfig = {}) {
    // 合并配置
    Object.assign(this.config, customConfig);
    
    // 记录启动开始时间
    const startupStartTime = performanceMonitor.now();
    console.log('Starting optimized app initialization');
    
    try {
      // 阶段1: 预加载关键资源
      await this.preloadCriticalResources();
      
      // 阶段2: 并行初始化核心模块
      await this.parallelInitializeCoreModules();
      
      // 阶段3: 延迟加载非必要模块
      this.deferNonEssentialModules();
      
      // 阶段4: 优化首次渲染
      this.optimizeFirstRender();
      
      // 记录启动完成时间
      const startupEndTime = performanceMonitor.now();
      const startupDuration = startupEndTime - startupStartTime;
      
      console.log(`App startup completed in ${startupDuration.toFixed(2)}ms`);
      performanceMonitor.recordMetric('startup', 'totalDuration', startupDuration);
      
      return {
        success: true,
        duration: startupDuration
      };
    } catch (error) {
      console.error('App startup optimization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 预加载关键资源
  async preloadCriticalResources() {
    if (!this.config.preload.criticalAssets) return;
    
    this.startupPhases.preloading = true;
    console.log('Preloading critical assets...');
    
    try {
      // 并行预加载所有关键资源
      await appOptimizer.preloadCriticalAssets(this.criticalAssets);
      
      console.log('Critical assets preloaded');
      this.startupPhases.preloading = false;
    } catch (error) {
      console.error('Failed to preload critical assets:', error);
      this.startupPhases.preloading = false;
      throw error;
    }
  }
  
  // 并行初始化核心模块
  async parallelInitializeCoreModules() {
    this.startupPhases.initialization = true;
    console.log('Initializing core modules in parallel...');
    
    // 创建初始化任务数组
    const initTasks = [];
    
    // 应用初始化任务
    initTasks.push(this.initializeApp());
    
    // 性能监控初始化任务
    if (this.config.parallelInit.performance) {
      initTasks.push(this.initializePerformance());
    }
    
    // 兼容性检查任务
    if (this.config.parallelInit.compatibility) {
      initTasks.push(this.checkCompatibility());
    }
    
    try {
      // 并行执行所有初始化任务
      await Promise.all(initTasks);
      
      console.log('Core modules initialized');
      this.startupPhases.initialization = false;
    } catch (error) {
      console.error('Failed to initialize core modules:', error);
      this.startupPhases.initialization = false;
      throw error;
    }
  }
  
  // 初始化应用
  async initializeApp() {
    try {
      // 如果应用尚未初始化，则进行初始化
      if (!isAppInitialized()) {
        await initializeApp({
          debug: process.env.NODE_ENV === 'development',
          performance: {
            enabled: true,
            autoLog: true,
            thresholds: {
              render: 30,  // 放宽渲染时间阈值，适应低端设备
              api: 3000,   // 放宽API响应时间阈值
              componentLoad: 1000  // 放宽组件加载时间阈值
            }
          },
          permissions: {
            autoRequest: false,
            required: [],  // 移除启动时必需权限，避免权限拒绝导致闪退
            optional: []   // 移除可选权限，按需申请
          },
          compatibility: {
            autoCheck: true,
            fixProblems: true,  // 启用自动修复功能
            logProblems: true
          }
        });
      }
      
      console.log('Application initialized');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }
  
  // 初始化性能监控
  async initializePerformance() {
    try {
      // 性能监控已在appInitializer中初始化，这里可以添加额外配置
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
      throw error;
    }
  }
  
  // 检查兼容性
  async checkCompatibility() {
    try {
      // 兼容性检查已在appInitializer中执行，这里可以添加额外处理
      console.log('Compatibility check completed');
    } catch (error) {
      console.error('Failed to check compatibility:', error);
      throw error;
    }
  }
  
  // 延迟加载非必要模块
  deferNonEssentialModules() {
    if (!this.config.deferredLoading.nonEssentialModules) return;
    
    this.startupPhases.postRender = true;
    console.log('Deferring non-essential module loading...');
    
    // 使用requestIdleCallback在空闲时间加载非必要模块
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadDeferredModules();
      });
    } else {
      // 降级到setTimeout
      setTimeout(() => {
        this.loadDeferredModules();
      }, 1000); // 延迟1秒加载
    }
  }
  
  // 加载延迟模块
  loadDeferredModules() {
    try {
      // 这里可以添加具体的延迟模块加载逻辑
      // 例如：加载分析库、非关键工具函数等
      
      console.log('Deferred modules loaded');
      this.startupPhases.postRender = false;
    } catch (error) {
      console.error('Failed to load deferred modules:', error);
      this.startupPhases.postRender = false;
    }
  }
  
  // 优化首次渲染
  optimizeFirstRender() {
    this.startupPhases.rendering = true;
    console.log('Optimizing first render...');
    
    try {
      // 使用应用优化器优化初始渲染
      appOptimizer.optimizeInitialRender();
      
      console.log('First render optimized');
      this.startupPhases.rendering = false;
    } catch (error) {
      console.error('Failed to optimize first render:', error);
      this.startupPhases.rendering = false;
    }
  }
  
  // 获取启动优化统计信息
  getStartupStats() {
    return {
      phases: { ...this.startupPhases },
      isNative: this.isNative,
      platform: this.platform,
      config: this.config
    };
  }
  
  // 重置启动优化器
  reset() {
    Object.keys(this.startupPhases).forEach(phase => {
      this.startupPhases[phase] = false;
    });
    
    console.log('StartupOptimizer reset');
  }
}

// 创建启动优化器实例
const startupOptimizer = new StartupOptimizer();

// 导出启动优化器实例和类
export default startupOptimizer;
export { StartupOptimizer };

// 简化的启动优化函数
export const optimizeAppStartup = async (config = {}) => {
  return await startupOptimizer.optimizeStartup(config);
};

// 获取启动统计信息
export const getStartupStats = () => {
  return startupOptimizer.getStartupStats();
};