/**
 * 版本检测器
 * 读取系统缓存配置，判断app版本，并根据版本自动跳转到相应页面
 */

class VersionDetector {
  constructor() {
    this.version = null;
    this.isInitialized = false;
  }

  /**
   * 初始化版本检测器
   */
  async initialize() {
    try {
      // 1. 检查localStorage中的版本设置
      const savedVersion = localStorage.getItem('appVersion');
      
      // 2. 如果没有保存的版本设置，使用默认版本
      if (savedVersion) {
        this.version = savedVersion;
      } else {
        // 默认使用轻量版
        this.version = 'lite';
        localStorage.setItem('appVersion', 'lite');
      }

      // 3. 检查是否为Capacitor原生应用
      this.isNativeApp = this.checkIsNativeApp();
      
      // 4. 记录版本信息
      console.log(`应用版本检测完成: ${this.getVersionName()}, 运行环境: ${this.isNativeApp ? 'Android原生' : 'Web浏览器'}`);
      
      this.isInitialized = true;
      
      return this.version;
    } catch (error) {
      console.error('版本检测器初始化失败:', error);
      // 降级到默认版本
      this.version = 'lite';
      this.isInitialized = true;
      return this.version;
    }
  }

  /**
   * 检查是否为Capacitor原生应用
   */
  checkIsNativeApp() {
    return window.Capacitor && window.Capacitor.isNative;
  }

  /**
   * 获取版本名称
   */
  getVersionName() {
    return this.version === 'lite' ? '轻量版' : '炫彩版';
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion() {
    return this.version;
  }

  /**
   * 切换版本
   */
  switchVersion(targetVersion) {
    if (targetVersion !== 'lite' && targetVersion !== 'full') {
      throw new Error('无效的版本类型: ' + targetVersion);
    }
    
    this.version = targetVersion;
    localStorage.setItem('appVersion', targetVersion);
    
    console.log(`版本已切换到: ${this.getVersionName()}`);
    
    // 触发版本切换事件
    this.triggerVersionChange(targetVersion);
  }

  /**
   * 触发版本切换事件
   */
  triggerVersionChange(newVersion) {
    // 创建自定义事件
    const versionChangeEvent = new CustomEvent('appVersionChanged', {
      detail: {
        version: newVersion,
        versionName: this.getVersionName(),
        timestamp: Date.now()
      }
    });
    
    // 分发事件
    window.dispatchEvent(versionChangeEvent);
  }

  /**
   * 根据版本自动跳转到相应页面
   * 炫彩版：直接打开app首页
   * 轻量版：直接打开app
   */
  autoRedirect() {
    if (!this.isInitialized) {
      console.warn('版本检测器尚未初始化，无法进行自动跳转');
      return;
    }

    // 获取当前路径
    const currentPath = window.location.pathname;
    
    // 如果是根路径，根据版本跳转
    if (currentPath === '/' || currentPath === '/index.html') {
      if (this.version === 'full') {
        // 炫彩版：跳转到首页
        this.redirectToHomePage();
      } else {
        // 轻量版：跳转到轻量版首页
        this.redirectToLiteHomePage();
      }
    }
  }

  /**
   * 跳转到炫彩版首页
   */
  redirectToHomePage() {
    // 检查是否已经正确路由
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
    
    console.log('炫彩版：直接打开app首页');
    
    // 触发页面刷新以应用新路由
    if (window.location.pathname === '/') {
      // 如果已经在首页，触发路由更新
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  /**
   * 跳转到轻量版首页
   */
  redirectToLiteHomePage() {
    // 检查是否已经正确路由
    if (window.location.pathname !== '/lite') {
      window.history.replaceState(null, '', '/lite');
    }
    
    console.log('轻量版：直接打开app');
    
    // 触发页面刷新以应用新路由
    if (window.location.pathname === '/lite') {
      // 如果已经在轻量版首页，触发路由更新
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  /**
   * 获取版本信息
   */
  getVersionInfo() {
    return {
      version: this.version,
      versionName: this.getVersionName(),
      isNativeApp: this.isNativeApp,
      isInitialized: this.isInitialized
    };
  }

  /**
   * 添加版本变化监听器
   */
  addVersionChangeListener(callback) {
    const listener = (event) => {
      callback(event.detail);
    };
    
    window.addEventListener('appVersionChanged', listener);
    
    // 返回移除监听器的函数
    return () => {
      window.removeEventListener('appVersionChanged', listener);
    };
  }
}

// 创建全局版本检测器实例
const versionDetector = new VersionDetector();

export default versionDetector;