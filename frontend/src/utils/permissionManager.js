import { Capacitor } from '@capacitor/core';

// 仅在原生平台上导入Permissions插件
let Permissions;
if (Capacitor.isNativePlatform()) {
  import('@capacitor/permissions').then(module => {
    Permissions = module.Permissions;
  }).catch(error => {
    console.warn('Failed to load Permissions plugin:', error);
  });
}

// 权限管理器类
export class PermissionManager {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.platform = Capacitor.getPlatform();
    this.permissionCache = new Map();
  }

  // 权限类型定义
  static PERMISSION_TYPES = {
    CAMERA: 'camera',
    PHOTOS: 'photos',
    GEOLOCATION: 'geolocation',
    MICROPHONE: 'microphone',
    NOTIFICATIONS: 'notifications',
    CLIPBOARD_READ: 'clipboard-read',
    CLIPBOARD_WRITE: 'clipboard-write',
    STORAGE: 'storage', // Android only
    CALENDAR: 'calendar',
  };

  // 权限状态
  static PERMISSION_STATUS = {
    GRANTED: 'granted',
    DENIED: 'denied',
    PROMPT: 'prompt',
    LIMITED: 'limited'
  };

  // 检查是否为Web环境
  isWebEnvironment() {
    return !this.isNative;
  }

  // 获取权限说明文本
  getPermissionExplanation(permission) {
    const explanations = {
      [PermissionManager.PERMISSION_TYPES.CAMERA]: '需要相机权限来拍摄照片和视频',
      [PermissionManager.PERMISSION_TYPES.MICROPHONE]: '需要麦克风权限来录制音频',
      [PermissionManager.PERMISSION_TYPES.PHOTOS]: '需要相册权限来访问和保存图片',
      [PermissionManager.PERMISSION_TYPES.GEOLOCATION]: '需要位置权限来提供基于位置的服务',
      [PermissionManager.PERMISSION_TYPES.NOTIFICATIONS]: '需要通知权限来发送重要提醒',
      [PermissionManager.PERMISSION_TYPES.CALENDAR]: '需要日历权限来读取和创建日程',
      [PermissionManager.PERMISSION_TYPES.STORAGE]: '需要存储权限来访问设备上的文件'
    };

    return explanations[permission] || '需要此权限来正常使用应用功能';
  }

  // 检查单个权限状态
  async checkPermission(permission) {
    // Web环境直接返回已授权
    if (this.isWebEnvironment()) {
      return { state: PermissionManager.PERMISSION_STATUS.GRANTED };
    }

    try {
      // 从缓存中获取权限状态
      if (this.permissionCache.has(permission)) {
        return this.permissionCache.get(permission);
      }

      // 检查Permissions是否可用
      if (!Permissions) {
        throw new Error('Permissions plugin not available');
      }
      
      const result = await Permissions.query({ name: permission });
      const status = { 
        state: result.state?.toLowerCase() || PermissionManager.PERMISSION_STATUS.PROMPT,
        name: permission 
      };

      // 缓存权限状态
      this.permissionCache.set(permission, status);
      return status;
    } catch (error) {
      console.error(`检查权限 ${permission} 失败:`, error);
      return { state: PermissionManager.PERMISSION_STATUS.PROMPT, error: error.message };
    }
  }

  // 请求单个权限
  async requestPermission(permission, explanation = null) {
    // Web环境直接返回已授权
    if (this.isWebEnvironment()) {
      return { state: PermissionManager.PERMISSION_STATUS.GRANTED };
    }

    try {
      // 显示权限说明（如果有）
      if (explanation) {
        console.log(`权限请求说明: ${explanation}`);
        // 在实际应用中，这里可以显示一个模态框或Toast来解释为什么需要这个权限
      }

      // 检查Permissions是否可用
      if (!Permissions) {
        throw new Error('Permissions plugin not available');
      }
      
      const result = await Permissions.request({ name: permission });
      const status = { 
        state: result.state?.toLowerCase() || PermissionManager.PERMISSION_STATUS.DENIED,
        name: permission 
      };

      // 更新缓存
      this.permissionCache.set(permission, status);
      return status;
    } catch (error) {
      console.error(`请求权限 ${permission} 失败:`, error);
      return { state: PermissionManager.PERMISSION_STATUS.DENIED, error: error.message };
    }
  }

  // 检查多个权限状态
  async checkMultiplePermissions(permissions) {
    // Web环境直接返回所有权限已授权
    if (this.isWebEnvironment()) {
      const results = {};
      permissions.forEach(permission => {
        results[permission] = { state: PermissionManager.PERMISSION_STATUS.GRANTED };
      });
      return results;
    }

    try {
      const results = {};
      // 并行检查所有权限
      const promises = permissions.map(permission => 
        this.checkPermission(permission).then(status => ({ permission, status }))
      );

      const permissionStatuses = await Promise.all(promises);
      permissionStatuses.forEach(({ permission, status }) => {
        results[permission] = status;
      });

      return results;
    } catch (error) {
      console.error('批量检查权限失败:', error);
      const results = {};
      permissions.forEach(permission => {
        results[permission] = { state: PermissionManager.PERMISSION_STATUS.PROMPT, error: error.message };
      });
      return results;
    }
  }

  // 请求多个权限
  async requestMultiplePermissions(permissions, explanations = {}) {
    // Web环境直接返回所有权限已授权
    if (this.isWebEnvironment()) {
      const results = {};
      permissions.forEach(permission => {
        results[permission] = { state: PermissionManager.PERMISSION_STATUS.GRANTED };
      });
      return results;
    }

    try {
      const results = {};
      // 串行请求权限，避免同时弹出多个权限请求对话框
      for (const permission of permissions) {
        const explanation = explanations[permission] || this.getPermissionExplanation(permission);
        results[permission] = await this.requestPermission(permission, explanation);
      }

      return results;
    } catch (error) {
      console.error('批量请求权限失败:', error);
      const results = {};
      permissions.forEach(permission => {
        results[permission] = { state: PermissionManager.PERMISSION_STATUS.DENIED, error: error.message };
      });
      return results;
    }
  }

  // 检查权限组是否全部已授权
  async checkPermissionGroup(permissions) {
    const results = await this.checkMultiplePermissions(permissions);
    const allGranted = Object.values(results).every(result => 
      result.state === PermissionManager.PERMISSION_STATUS.GRANTED
    );

    return {
      allGranted,
      results
    };
  }

  // 请求权限组
  async requestPermissionGroup(permissions, explanations = {}) {
    const results = await this.requestMultiplePermissions(permissions, explanations);
    const allGranted = Object.values(results).every(result => 
      result.state === PermissionManager.PERMISSION_STATUS.GRANTED
    );

    return {
      allGranted,
      results
    };
  }

  // 检查并请求权限（如果未授权）
  async checkAndRequestPermission(permission, explanation = null) {
    const status = await this.checkPermission(permission);
    
    // 如果权限已被授予，直接返回
    if (status.state === PermissionManager.PERMISSION_STATUS.GRANTED) {
      return status;
    }

    // 请求权限
    const explanationText = explanation || this.getPermissionExplanation(permission);
    return await this.requestPermission(permission, explanationText);
  }

  // 批量检查并请求权限组
  async checkAndRequestPermissionGroup(permissions, explanations = {}) {
    const { results, allGranted } = await this.checkPermissionGroup(permissions);
    
    // 如果所有权限都已授予，直接返回
    if (allGranted) {
      return { results, allGranted: true };
    }

    // 获取被拒绝的权限列表
    const deniedPermissions = Object.entries(results)
      .filter(([_, result]) => result.state !== PermissionManager.PERMISSION_STATUS.GRANTED)
      .map(([permission]) => permission);

    // 请求被拒绝的权限
    if (deniedPermissions.length > 0) {
      const requestExplanations = {};
      deniedPermissions.forEach(permission => {
        requestExplanations[permission] = explanations[permission] || this.getPermissionExplanation(permission);
      });

      const requestResults = await this.requestMultiplePermissions(deniedPermissions, requestExplanations);
      
      // 合并结果
      Object.assign(results, requestResults);
      
      // 重新检查是否所有权限都已授予
      const newAllGranted = Object.values(results).every(result => 
        result.state === PermissionManager.PERMISSION_STATUS.GRANTED
      );

      return {
        results,
        allGranted: newAllGranted
      };
    }

    return { results, allGranted: false };
  }

  // 清除权限缓存
  clearCache() {
    this.permissionCache.clear();
  }

  // 打开应用设置（用于用户手动授予权限）
  async openAppSettings() {
    if (this.isWebEnvironment()) {
      console.warn('Web环境无法打开应用设置');
      return;
    }

    try {
      // 检查Permissions是否可用
      if (!Permissions) {
        throw new Error('Permissions plugin not available');
      }
      
      await Permissions.openAppSettings();
    } catch (error) {
      console.error('打开应用设置失败:', error);
      throw error;
    }
  }

  // 位置权限特殊处理（Android需要同时请求精确和粗略位置）
  async requestLocationPermissions(includeBackground = false) {
    if (this.isWebEnvironment()) {
      return { state: PermissionManager.PERMISSION_STATUS.GRANTED };
    }

    try {
      // 请求位置权限
      const locationResult = await this.requestPermission(
        PermissionManager.PERMISSION_TYPES.GEOLOCATION,
        this.getPermissionExplanation(PermissionManager.PERMISSION_TYPES.GEOLOCATION)
      );

      // 如果需要后台位置权限（仅Android）
      if (includeBackground && this.platform === 'android') {
        // 注意：后台位置权限需要在AndroidManifest.xml中声明
        // 并且需要单独请求
        console.warn('后台位置权限需要特殊处理，建议引导用户手动开启');
      }

      return locationResult;
    } catch (error) {
      console.error('请求位置权限失败:', error);
      return { state: PermissionManager.PERMISSION_STATUS.DENIED, error: error.message };
    }
  }
}

// 创建权限管理器实例
export const permissionManager = new PermissionManager();

// 导出权限类型和状态常量
export const PERMISSION_TYPES = PermissionManager.PERMISSION_TYPES;
export const PERMISSION_STATUS = PermissionManager.PERMISSION_STATUS;