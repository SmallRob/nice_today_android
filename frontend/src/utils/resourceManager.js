import { Capacitor } from '@capacitor/core';

// 资源管理器类
class ResourceManager {
  constructor() {
    // 检测平台
    this.isNative = Capacitor.isNativePlatform();
    this.platform = Capacitor.getPlatform();
    
    // 资源引用计数
    this.resourceRefs = new Map();
    
    // 定时器集合
    this.timers = new Set();
    
    // 事件监听器集合
    this.eventListeners = new Map();
    
    // 观察者集合
    this.observers = new Set();
  }
  
  // 添加资源引用
  addResourceRef(resourceId, resource) {
    if (!this.resourceRefs.has(resourceId)) {
      this.resourceRefs.set(resourceId, {
        resource,
        count: 1
      });
    } else {
      const ref = this.resourceRefs.get(resourceId);
      ref.count++;
    }
  }
  
  // 移除资源引用
  removeResourceRef(resourceId) {
    if (this.resourceRefs.has(resourceId)) {
      const ref = this.resourceRefs.get(resourceId);
      ref.count--;
      
      if (ref.count <= 0) {
        // 如果资源有清理方法，调用它
        if (typeof ref.resource.cleanup === 'function') {
          ref.resource.cleanup();
        }
        
        this.resourceRefs.delete(resourceId);
      }
    }
  }
  
  // 获取资源引用
  getResourceRef(resourceId) {
    if (this.resourceRefs.has(resourceId)) {
      return this.resourceRefs.get(resourceId).resource;
    }
    return null;
  }
  
  // 设置定时器
  setTimeout(callback, delay, ...args) {
    const timerId = setTimeout(() => {
      // 从集合中移除已完成的定时器
      this.timers.delete(timerId);
      callback(...args);
    }, delay);
    
    this.timers.add(timerId);
    return timerId;
  }
  
  // 设置间隔定时器
  setInterval(callback, interval, ...args) {
    const timerId = setInterval(callback, interval, ...args);
    this.timers.add(timerId);
    return timerId;
  }
  
  // 清除定时器
  clearTimeout(timerId) {
    clearTimeout(timerId);
    this.timers.delete(timerId);
  }
  
  // 清除间隔定时器
  clearInterval(timerId) {
    clearInterval(timerId);
    this.timers.delete(timerId);
  }
  
  // 添加事件监听器
  addEventListener(target, event, listener, options) {
    // 创建唯一标识符
    const listenerId = `${target.constructor.name}_${event}_${Math.random()}`;
    
    // 添加事件监听器
    target.addEventListener(event, listener, options);
    
    // 保存监听器信息
    this.eventListeners.set(listenerId, {
      target,
      event,
      listener,
      options
    });
    
    return listenerId;
  }
  
  // 移除事件监听器
  removeEventListener(listenerId) {
    if (this.eventListeners.has(listenerId)) {
      const { target, event, listener, options } = this.eventListeners.get(listenerId);
      target.removeEventListener(event, listener, options);
      this.eventListeners.delete(listenerId);
    }
  }
  
  // 添加观察者
  addObserver(observer) {
    this.observers.add(observer);
  }
  
  // 移除观察者
  removeObserver(observer) {
    this.observers.delete(observer);
  }
  
  // 通知所有观察者
  notifyObservers(event, data) {
    this.observers.forEach(observer => {
      if (typeof observer.update === 'function') {
        try {
          observer.update(event, data);
        } catch (error) {
          console.error('Error notifying observer:', error);
        }
      }
    });
  }
  
  // 清理所有资源
  cleanup() {
    // 清除所有定时器
    this.timers.forEach(timerId => {
      clearTimeout(timerId);
      clearInterval(timerId);
    });
    this.timers.clear();
    
    // 移除所有事件监听器
    this.eventListeners.forEach((_, listenerId) => {
      this.removeEventListener(listenerId);
    });
    this.eventListeners.clear();
    
    // 清理所有资源引用
    this.resourceRefs.forEach((ref, resourceId) => {
      if (typeof ref.resource.cleanup === 'function') {
        ref.resource.cleanup();
      }
    });
    this.resourceRefs.clear();
    
    // 清空观察者
    this.observers.clear();
  }
  
  // 获取资源统计信息
  getStats() {
    return {
      resourceRefs: this.resourceRefs.size,
      timers: this.timers.size,
      eventListeners: this.eventListeners.size,
      observers: this.observers.size
    };
  }
}

// 创建资源管理器实例
const resourceManager = new ResourceManager();

// 在页面卸载时自动清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    resourceManager.cleanup();
  });
  
  // 在Capacitor应用状态变化时也进行清理
  if (resourceManager.isNative) {
    // 这里可以添加特定于原生平台的清理逻辑
    console.log('ResourceManager: Native platform detected');
  }
}

// React Hook - 资源管理Hook
export const useResourceManager = () => {
  // 可以在这里添加特定的Hook逻辑
  
  return {
    addResourceRef: resourceManager.addResourceRef.bind(resourceManager),
    removeResourceRef: resourceManager.removeResourceRef.bind(resourceManager),
    getResourceRef: resourceManager.getResourceRef.bind(resourceManager),
    setTimeout: resourceManager.setTimeout.bind(resourceManager),
    setInterval: resourceManager.setInterval.bind(resourceManager),
    clearTimeout: resourceManager.clearTimeout.bind(resourceManager),
    clearInterval: resourceManager.clearInterval.bind(resourceManager),
    addEventListener: resourceManager.addEventListener.bind(resourceManager),
    removeEventListener: resourceManager.removeEventListener.bind(resourceManager),
    addObserver: resourceManager.addObserver.bind(resourceManager),
    removeObserver: resourceManager.removeObserver.bind(resourceManager),
    notifyObservers: resourceManager.notifyObservers.bind(resourceManager)
  };
};

// 高阶组件 - 资源管理HOC
export const withResourceManager = (Component) => {
  return (props) => {
    // 可以在这里添加特定的HOC逻辑
    return <Component {...props} resourceManager={resourceManager} />;
  };
};

// 导出资源管理器实例
export default resourceManager;

// 导出资源管理器类
export { ResourceManager };