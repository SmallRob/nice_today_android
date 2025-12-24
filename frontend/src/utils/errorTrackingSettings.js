/**
 * 错误日志追踪设置管理
 * 管理错误日志追踪功能的开关状态
 */

const STORAGE_KEY = 'nice_today_error_tracking_enabled';

// 默认设置为关闭
const DEFAULT_ENABLED = false;

class ErrorTrackingSettings {
  constructor() {
    this.enabled = this.load();
  }

  /**
   * 从本地存储加载设置
   */
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch (error) {
      console.warn('加载错误追踪设置失败:', error);
      return DEFAULT_ENABLED;
    }
  }

  /**
   * 保存设置到本地存储
   */
  save(enabled) {
    try {
      this.enabled = enabled;
      localStorage.setItem(STORAGE_KEY, enabled.toString());
      return true;
    } catch (error) {
      console.warn('保存错误追踪设置失败:', error);
      return false;
    }
  }

  /**
   * 获取当前状态
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 切换状态
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.save(this.enabled);
  }

  /**
   * 启用错误追踪
   */
  enable() {
    return this.save(true);
  }

  /**
   * 禁用错误追踪
   */
  disable() {
    return this.save(false);
  }

  /**
   * 重置为默认值
   */
  reset() {
    return this.save(DEFAULT_ENABLED);
  }
}

// 创建单例实例
export const errorTrackingSettings = new ErrorTrackingSettings();

export default ErrorTrackingSettings;
