import { Capacitor } from '@capacitor/core';

// 应用优化器类
class AppOptimizer {
  constructor() {
    // 检测平台
    this.isNative = Capacitor.isNativePlatform();
    this.platform = Capacitor.getPlatform();
    
    // 优化配置
    this.config = {
      // 启动优化
      startup: {
        lazyLoadComponents: true,
        preloadCriticalAssets: true,
        optimizeInitialRender: true
      },
      
      // 内存优化
      memory: {
        enableGC: true,
        maxCacheSize: 100,
        cleanupInterval: 30000 // 30秒
      },
      
      // 网络优化
      network: {
        enableCaching: true,
        cacheExpiration: 3600000, // 1小时
        retryFailedRequests: true,
        maxRetries: 3
      },
      
      // 渲染优化
      rendering: {
        enableVirtualization: true,
        debounceRendering: true,
        renderingDebounceTime: 16 // 60fps
      }
    };
    
    // 缓存管理
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    
    // 初始化
    this.init();
  }
  
  // 初始化优化器
  init() {
    // 设置定期清理
    this.setupPeriodicCleanup();
    
    // 监听应用状态变化
    this.listenToAppStateChanges();
    
    console.log('AppOptimizer initialized');
  }
  
  // 设置定期清理
  setupPeriodicCleanup() {
    if (this.config.memory.enableGC) {
      setInterval(() => {
        this.performGarbageCollection();
      }, this.config.memory.cleanupInterval);
    }
  }
  
  // 监听应用状态变化
  listenToAppStateChanges() {
    // 这里可以添加特定于平台的应用状态监听
    if (this.isNative) {
      // 在原生平台上可以监听应用进入后台等事件
      console.log('Listening to app state changes on native platform');
    }
  }
  
  // 预加载关键资源
  async preloadCriticalAssets(assets) {
    if (!this.config.startup.preloadCriticalAssets) return;
    
    try {
      const promises = assets.map(asset => {
        // 根据资产类型进行预加载
        if (asset.type === 'image') {
          return this.preloadImage(asset.url);
        } else if (asset.type === 'script') {
          return this.preloadScript(asset.url);
        } else if (asset.type === 'style') {
          return this.preloadStyle(asset.url);
        }
      });
      
      await Promise.all(promises);
      console.log('Preloaded critical assets');
    } catch (error) {
      console.error('Failed to preload critical assets:', error);
    }
  }
  
  // 预加载图片
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
  }
  
  // 预加载脚本
  preloadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = resolve;
      script.onerror = reject;
      script.src = url;
      document.head.appendChild(script);
    });
  }
  
  // 预加载样式
  preloadStyle(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = resolve;
      link.onerror = reject;
      link.href = url;
      document.head.appendChild(link);
    });
  }
  
  // 优化初始渲染
  optimizeInitialRender() {
    if (!this.config.startup.optimizeInitialRender) return;
    
    // 使用requestIdleCallback来延迟非关键渲染
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // 在空闲时间执行非关键渲染任务
        this.renderNonCriticalComponents();
      });
    } else {
      // 降级到setTimeout
      setTimeout(() => {
        this.renderNonCriticalComponents();
      }, 0);
    }
  }
  
  // 渲染非关键组件
  renderNonCriticalComponents() {
    // 这里可以添加具体的非关键组件渲染逻辑
    console.log('Rendering non-critical components');
  }
  
  // 执行垃圾回收
  performGarbageCollection() {
    // 清理过期缓存
    this.cleanupExpiredCache();
    
    // 清理未使用的资源
    this.cleanupUnusedResources();
    
    console.log('Performed garbage collection');
  }
  
  // 清理过期缓存
  cleanupExpiredCache() {
    const now = Date.now();
    const expiredKeys = [];
    
    this.cacheTimestamps.forEach((timestamp, key) => {
      if (now - timestamp > this.config.network.cacheExpiration) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    });
  }
  
  // 清理未使用的资源
  cleanupUnusedResources() {
    // 这里可以添加特定的资源清理逻辑
    console.log('Cleaning up unused resources');
  }
  
  // 缓存数据
  cacheData(key, data) {
    if (!this.config.network.enableCaching) return;
    
    // 检查缓存大小
    if (this.cache.size >= this.config.memory.maxCacheSize) {
      // 删除最旧的条目
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.cacheTimestamps.delete(firstKey);
      }
    }
    
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }
  
  // 获取缓存数据
  getCachedData(key) {
    if (!this.config.network.enableCaching) return null;
    
    const data = this.cache.get(key);
    const timestamp = this.cacheTimestamps.get(key);
    
    if (data && timestamp) {
      // 检查是否过期
      if (Date.now() - timestamp < this.config.network.cacheExpiration) {
        return data;
      } else {
        // 过期则删除
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
    
    return null;
  }
  
  // 重试失败的请求
  async retryRequest(requestFn, retries = 0) {
    if (!this.config.network.retryFailedRequests) {
      return await requestFn();
    }
    
    try {
      return await requestFn();
    } catch (error) {
      if (retries < this.config.network.maxRetries) {
        console.warn(`Request failed, retrying... (${retries + 1}/${this.config.network.maxRetries})`);
        
        // 指数退避
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return await this.retryRequest(requestFn, retries + 1);
      } else {
        throw error;
      }
    }
  }
  
  // 虚拟化长列表渲染
  virtualizeList(container, itemHeight, items, renderItem) {
    if (!this.config.rendering.enableVirtualization) return;
    
    // 这里可以实现虚拟滚动逻辑
    console.log('Virtualizing list rendering');
  }
  
  // 防抖渲染
  debounceRender(renderFn) {
    if (!this.config.rendering.debounceRendering) {
      return renderFn;
    }
    
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        renderFn(...args);
      }, this.config.rendering.renderingDebounceTime);
    };
  }
  
  // 优化组件懒加载
  optimizeLazyLoading(componentLoader) {
    if (!this.config.startup.lazyLoadComponents) {
      return componentLoader;
    }
    
    // 预加载即将需要的组件
    return async () => {
      // 使用Intersection Observer来预加载可见区域附近的组件
      // 这里可以添加具体的预加载逻辑
      
      return await componentLoader();
    };
  }
  
  // 获取优化统计信息
  getOptimizationStats() {
    return {
      cacheSize: this.cache.size,
      isNative: this.isNative,
      platform: this.platform,
      config: this.config
    };
  }
  
  // 重置优化器
  reset() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    console.log('AppOptimizer reset');
  }
}

// 创建应用优化器实例
const appOptimizer = new AppOptimizer();

// 导出应用优化器实例和类
export default appOptimizer;
export { AppOptimizer };

// React Hook - 应用优化Hook
export const useAppOptimization = () => {
  return {
    preloadCriticalAssets: appOptimizer.preloadCriticalAssets.bind(appOptimizer),
    optimizeInitialRender: appOptimizer.optimizeInitialRender.bind(appOptimizer),
    cacheData: appOptimizer.cacheData.bind(appOptimizer),
    getCachedData: appOptimizer.getCachedData.bind(appOptimizer),
    retryRequest: appOptimizer.retryRequest.bind(appOptimizer),
    getOptimizationStats: appOptimizer.getOptimizationStats.bind(appOptimizer)
  };
};