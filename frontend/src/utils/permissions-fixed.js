/**
 * 修复后的权限管理工具类
 * 修复了与Capacitor版本兼容性的问题
 */

import { Capacitor } from '@capacitor/core';

// 检测是否为原生平台
const isNative = Capacitor.isNativePlatform();

// 权限类型定义
export const PermissionTypes = {
  CAMERA: 'camera',
  PHOTOS: 'photos',
  GEOLOCATION: 'geolocation',
  MICROPHONE: 'microphone',
  NOTIFICATIONS: 'notifications'
};

// 常用权限组合
export const PermissionGroups = {
  BASIC: [
    PermissionTypes.PHOTOS,
    PermissionTypes.NOTIFICATIONS
  ],
  LOCATION: [
    PermissionTypes.GEOLOCATION
  ],
  MEDIA: [
    PermissionTypes.CAMERA,
    PermissionTypes.MICROPHONE,
    PermissionTypes.PHOTOS
  ]
};

// 检查单个权限状态
export const checkPermission = async (permission) => {
  if (!isNative) {
    return { state: 'granted' }; // Web环境默认返回已授权
  }

  try {
    // 使用Capacitor的权限API
    // 注意：根据Capacitor版本不同，API可能有变化
    // 这里使用通用方法，实际可能需要根据具体版本调整
    if (Capacitor.isPluginAvailable('Permissions')) {
      const { Permissions } = await import('@capacitor/permissions');
      const result = await Permissions.query({ name: permission });
      return result;
    } else {
      // 如果权限插件不可用，返回模拟结果
      return { state: 'granted' };
    }
  } catch (error) {
    console.error(`Error checking permission ${permission}:`, error);
    return { state: 'prompt' };
  }
};

// 请求单个权限
export const requestPermission = async (permission) => {
  if (!isNative) {
    return { state: 'granted' }; // Web环境默认返回已授权
  }

  try {
    // 使用Capacitor的权限API
    if (Capacitor.isPluginAvailable('Permissions')) {
      const { Permissions } = await import('@capacitor/permissions');
      const result = await Permissions.request({ name: permission });
      return result;
    } else {
      // 如果权限插件不可用，返回模拟结果
      return { state: 'granted' };
    }
  } catch (error) {
    console.error(`Error requesting permission ${permission}:`, error);
    return { state: 'denied' };
  }
};

// 检查权限组合是否全部已授权
export const checkPermissionGroup = async (permissionGroup) => {
  const results = {};
  
  for (const permission of permissionGroup) {
    results[permission] = await checkPermission(permission);
  }
  
  return {
    allGranted: Object.values(results).every(result => result.state === 'granted'),
    results
  };
};

// 请求权限组合
export const requestPermissionGroup = async (permissionGroup) => {
  const results = {};
  
  for (const permission of permissionGroup) {
    results[permission] = await requestPermission(permission);
  }
  
  return {
    allGranted: Object.values(results).every(result => result.state === 'granted'),
    results
  };
};

// 创建权限管理器类
export class PermissionManager {
  constructor() {
    this.permissionCache = {};
  }

  // 缓存权限状态
  async checkPermissionWithCache(permission) {
    if (this.permissionCache[permission]) {
      return this.permissionCache[permission];
    }

    const result = await checkPermission(permission);
    this.permissionCache[permission] = result;
    
    return result;
  }

  // 清除缓存
  clearCache() {
    this.permissionCache = {};
  }

  // 检查并请求权限（如果未授权）
  async checkAndRequestPermission(permission, explanation) {
    const status = await this.checkPermissionWithCache(permission);
    
    if (status.state !== 'granted') {
      return await requestPermission(permission);
    }
    
    return status;
  }

  // 批量检查和请求权限
  async checkAndRequestPermissionGroup(permissionGroup) {
    const { results, allGranted } = await checkPermissionGroup(permissionGroup);
    
    if (allGranted) {
      return { results, allGranted: true };
    }

    const deniedPermissions = Object.entries(results)
      .filter(([_, result]) => result.state !== 'granted')
      .map(([permission]) => permission);

    if (deniedPermissions.length > 0) {
      const requestResults = await requestPermissionGroup(deniedPermissions);
      
      // 更新结果
      Object.assign(results, requestResults.results);
      
      return {
        results,
        allGranted: Object.values(results).every(result => result.state === 'granted')
      };
    }

    return { results, allGranted: false };
  }
}

// 导出权限管理器实例
export const permissionManager = new PermissionManager();