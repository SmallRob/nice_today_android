/**
 * 摇一摇检测工具
 * 用于检测设备的摇动动作
 * 优先支持，非必需功能
 */

/**
 * 摇动检测器类
 */
class ShakeDetector {
  constructor(options = {}) {
    this.threshold = options.threshold || 15; // 加速度阈值
    this.timeout = options.timeout || 1000; // 防抖时间（毫秒）
    this.onShake = options.onShake || null; // 摇动回调
    this.lastShakeTime = 0;
    this.isListening = false;
    this.previousAcceleration = { x: 0, y: 0, z: 0 };
    this.deviceSupported = false; // 设备是否支持
  }

  /**
   * 开始监听摇动
   */
  start() {
    if (this.isListening) {
      console.warn('摇动检测器已经在运行');
      return false;
    }

    // 检查设备是否支持 DeviceMotionEvent
    if (!window.DeviceMotionEvent) {
      console.warn('当前设备不支持 DeviceMotion API，摇一摇功能不可用');
      this.deviceSupported = false;
      return false;
    }

    this.deviceSupported = true;

    // iOS 13+ 需要请求权限
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            this.attachListener();
          } else {
            console.warn('摇动检测权限被拒绝');
            this.deviceSupported = false;
          }
        })
        .catch(error => {
          console.error('请求摇动检测权限失败:', error);
          this.deviceSupported = false;
        });
    } else {
      // Android 或旧版 iOS
      this.attachListener();
    }

    return true;
  }

  /**
   * 附加事件监听器
   */
  attachListener() {
    this.handleMotion = this.handleMotion.bind(this);
    window.addEventListener('devicemotion', this.handleMotion);
    this.isListening = true;
    console.log('摇动检测器已启动');
  }

  /**
   * 移除事件监听器
   */
  detachListener() {
    if (this.handleMotion) {
      window.removeEventListener('devicemotion', this.handleMotion);
      this.isListening = false;
      console.log('摇动检测器已停止');
    }
  }

  /**
   * 停止监听摇动
   */
  stop() {
    this.detachListener();
  }

  /**
   * 处理设备运动事件
   * 添加异常处理，确保功能稳定性
   */
  handleMotion(event) {
    try {
      const acceleration = event.accelerationIncludingGravity;

      if (!acceleration) {
        return;
      }

      // 检查加速度数据是否有效
      if (!isFinite(acceleration.x) || !isFinite(acceleration.y) || !isFinite(acceleration.z)) {
        return;
      }

      const now = Date.now();

      // 防抖：如果距离上次摇动时间不足 timeout 毫秒，则忽略
      if (now - this.lastShakeTime < this.timeout) {
        return;
      }

      // 计算总加速度
      const totalAcceleration =
        Math.abs(acceleration.x) +
        Math.abs(acceleration.y) +
        Math.abs(acceleration.z);

      // 检查是否超过阈值
      if (totalAcceleration > this.threshold) {
        this.lastShakeTime = now;

        console.log(`检测到摇动！加速度: ${totalAcceleration.toFixed(2)}`);

        // 触发回调
        if (this.onShake && typeof this.onShake === 'function') {
          try {
            this.onShake({ acceleration, totalAcceleration });
          } catch (error) {
            console.error('摇动回调执行失败:', error);
          }
        }
      }
    } catch (error) {
      console.error('处理摇动事件时出错:', error);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(options) {
    if (options.threshold !== undefined) {
      this.threshold = options.threshold;
    }
    if (options.timeout !== undefined) {
      this.timeout = options.timeout;
    }
    if (options.onShake !== undefined) {
      this.onShake = options.onShake;
    }
  }

  /**
   * 获取设备支持状态
   */
  isDeviceSupported() {
    return this.deviceSupported;
  }

  /**
   * 销毁检测器
   */
  destroy() {
    this.stop();
    this.onShake = null;
  }
}

/**
 * 创建摇动检测器（便捷函数）
 */
export function createShakeDetector(options = {}) {
  return new ShakeDetector(options);
}

/**
 * 检测设备是否支持摇动
 */
export function isShakeSupported() {
  return typeof window !== 'undefined' &&
         typeof window.DeviceMotionEvent === 'function';
}

/**
 * 检测是否需要请求权限（iOS 13+）
 */
export function needsPermissionRequest() {
  return typeof window !== 'undefined' &&
         typeof DeviceMotionEvent === 'function' &&
         typeof DeviceMotionEvent.requestPermission === 'function';
}

/**
 * 请求摇动检测权限（iOS 13+）
 */
export function requestShakePermission() {
  return new Promise((resolve, reject) => {
    if (!needsPermissionRequest()) {
      resolve('granted');
      return;
    }

    DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          console.log('摇动检测权限已授予');
          resolve('granted');
        } else {
          console.warn('摇动检测权限被拒绝');
          resolve('denied');
        }
      })
      .catch(error => {
        console.error('请求摇动检测权限失败:', error);
        reject(error);
      });
  });
}

/**
 * 模拟摇动（用于测试）
 */
export function simulateShake(callback, delay = 500) {
  setTimeout(() => {
    const mockAcceleration = {
      x: 10,
      y: 10,
      z: 10
    };

    if (callback && typeof callback === 'function') {
      callback({
        acceleration: mockAcceleration,
        totalAcceleration: 30
      });
    }
  }, delay);
}

export default ShakeDetector;
