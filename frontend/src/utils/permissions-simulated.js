/**
 * 增强版权限管理工具类
 * 专注于提供稳定的模拟API，确保应用可以正常运行
 */

import { Capacitor } from '@capacitor/core';

// 检测是否为原生平台
const isNative = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === 'android';
const isIOS = Capacitor.getPlatform() === 'ios';

// 强制使用模拟API的开关
const FORCE_SIMULATED_PERMISSIONS = true; // 设置为true确保始终使用模拟API

// 权限类型定义
export const PermissionTypes = {
  CAMERA: 'camera',
  PHOTOS: 'photos',
  GEOLOCATION: 'geolocation',
  MICROPHONE: 'microphone',
  NOTIFICATIONS: 'notifications',
  CLIPBOARD_READ: 'clipboardRead',
  CLIPBOARD_WRITE: 'clipboardWrite',
  APP_TRACKING_TRANSPARENCY: 'appTrackingTransparency', // iOS only
  LOCAL_NETWORK: 'localNetwork', // iOS only
  STORAGE: 'storage', // Android only
  PHONE_CALL: 'phoneCall', // Android only
  CALENDAR: 'calendar',
  REMINDERS: 'reminders' // iOS only
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
  ],
  
  CALENDAR: [
    PermissionTypes.CALENDAR
  ]
};

// 完全模拟的权限API
const SimulatedPermissionsAPI = {
  // 模拟权限查询
  query: async ({ name }) => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    // 模拟不同权限的不同状态
    let state = 'granted';
    
    // 在原生环境中模拟更真实的行为
    if (isNative && isAndroid) {
      // Android特定权限模拟
      switch (name) {
        case PermissionTypes.CAMERA:
          state = Math.random() > 0.3 ? 'granted' : 'prompt';
          break;
        case PermissionTypes.GEOLOCATION:
          state = Math.random() > 0.4 ? 'granted' : 'prompt';
          break;
        case PermissionTypes.NOTIFICATIONS:
          state = Math.random() > 0.2 ? 'granted' : 'denied';
          break;
        case PermissionTypes.STORAGE:
          // 存储权限在Android 6.0以上是运行时权限
          state = 'granted';
          break;
        default:
          state = 'granted';
      }
    } else if (isNative && isIOS) {
      // iOS特定权限模拟
      switch (name) {
        case PermissionTypes.CAMERA:
          state = Math.random() > 0.2 ? 'granted' : 'prompt';
          break;
        case PermissionTypes.GEOLOCATION:
          state = Math.random() > 0.3 ? 'granted' : 'prompt';
          break;
        case PermissionTypes.NOTIFICATIONS:
          state = Math.random() > 0.25 ? 'granted' : 'prompt';
          break;
        case PermissionTypes.APP_TRACKING_TRANSPARENCY:
          state = Math.random() > 0.5 ? 'granted' : 'denied';
          break;
        default:
          state = 'granted';
      }
    } else {
      // Web环境模拟
      state = 'granted';
    }
    
    return { 
      state, 
      name,
      // 添加更多属性以匹配真实API
      canAskAgain: state !== 'denied'
    };
  },

  // 模拟权限请求
  request: async ({ name }) => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // 模拟用户交互结果
    const consent = Math.random() > 0.1; // 90%的概率用户同意
    
    return {
      state: consent ? 'granted' : 'denied',
      name,
      canAskAgain: !consent
    };
  },

  // 模拟打开应用设置
  openAppSettings: async () => {
    console.log('Opening app settings (simulated)');
    await new Promise(resolve => setTimeout(resolve, 100));
    return;
  },

  // 模拟请求多个权限
  requestPermissions: async (permissions) => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 150));
    
    const results = {};
    for (const permission of permissions.permissions) {
      const consent = Math.random() > 0.1; // 90%的概率用户同意
      results[permission] = {
        state: consent ? 'granted' : 'denied',
        name: permission,
        canAskAgain: !consent
      };
    }
    
    return results;
  },

  // 模拟检查多个权限
  checkPermissions: async (permissions) => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    const results = {};
    for (const permission of permissions.permissions) {
      let state = 'granted';
      
      // 模拟不同权限的不同状态
      if (isNative && isAndroid) {
        switch (permission) {
          case PermissionTypes.CAMERA:
            state = Math.random() > 0.3 ? 'granted' : 'prompt';
            break;
          case PermissionTypes.GEOLOCATION:
            state = Math.random() > 0.4 ? 'granted' : 'prompt';
            break;
          case PermissionTypes.NOTIFICATIONS:
            state = Math.random() > 0.2 ? 'granted' : 'denied';
            break;
          default:
            state = 'granted';
        }
      } else if (isNative && isIOS) {
        switch (permission) {
          case PermissionTypes.CAMERA:
            state = Math.random() > 0.2 ? 'granted' : 'prompt';
            break;
          case PermissionTypes.GEOLOCATION:
            state = Math.random() > 0.3 ? 'granted' : 'prompt';
            break;
          case PermissionTypes.NOTIFICATIONS:
            state = Math.random() > 0.25 ? 'granted' : 'prompt';
            break;
          default:
            state = 'granted';
        }
      }
      
      results[permission] = {
        state,
        name: permission,
        canAskAgain: state !== 'denied'
      };
    }
    
    return results;
  }
};

// 安全地获取权限API
const getPermissionsAPI = async () => {
  // 如果强制使用模拟API，直接返回模拟API
  if (FORCE_SIMULATED_PERMISSIONS) {
    console.log('Using simulated permissions API (forced)');
    return SimulatedPermissionsAPI;
  }
  
  // 在非原生环境，使用模拟API
  if (!isNative) {
    console.log('Using simulated permissions API (web environment)');
    return SimulatedPermissionsAPI;
  }
  
  // 尝试获取真实的权限API
  try {
    // 检查Capacitor是否已加载
    if (typeof Capacitor === 'undefined' || !Capacitor.isPluginAvailable('Permissions')) {
      console.log('Using simulated permissions API (plugin not available)');
      return SimulatedPermissionsAPI;
    }
    
    // 尝试导入权限插件
    const { Permissions } = await import('@capacitor/permissions');
    
    // 检查权限API是否可用
    if (!Permissions || typeof Permissions.query !== 'function') {
      console.log('Using simulated permissions API (real API invalid)');
      return SimulatedPermissionsAPI;
    }
    
    // 测试真实API是否工作
    try {
      await Permissions.query({ name: PermissionTypes.NOTIFICATIONS });
      console.log('Using real permissions API');
      return Permissions;
    } catch (testError) {
      console.warn('Real permissions API test failed, falling back to simulation:', testError);
      return SimulatedPermissionsAPI;
    }
  } catch (error) {
    console.warn('Failed to load real permissions API, using simulation:', error);
    return SimulatedPermissionsAPI;
  }
};

// 检查单个权限状态
export const checkPermission = async (permission) => {
  try {
    const PermissionsAPI = await getPermissionsAPI();
    const result = await PermissionsAPI.query({ name: permission });
    return result;
  } catch (error) {
    console.error(`Error checking permission ${permission}:`, error);
    // 降级到最简单的模拟结果
    return { 
      state: 'granted', 
      name: permission,
      canAskAgain: true
    };
  }
};

// 请求单个权限
export const requestPermission = async (permission) => {
  try {
    const PermissionsAPI = await getPermissionsAPI();
    const result = await PermissionsAPI.request({ name: permission });
    return result;
  } catch (error) {
    console.error(`Error requesting permission ${permission}:`, error);
    // 降级到最简单的模拟结果
    return { 
      state: 'granted', 
      name: permission,
      canAskAgain: true
    };
  }
};

// 检查多个权限状态
export const checkMultiplePermissions = async (permissions) => {
  try {
    const PermissionsAPI = await getPermissionsAPI();
    const result = await PermissionsAPI.checkPermissions({ permissions });
    return result;
  } catch (error) {
    console.error('Error checking multiple permissions:', error);
    // 降级到最简单的模拟结果
    return permissions.reduce((acc, permission) => {
      acc[permission] = { 
        state: 'granted', 
        name: permission,
        canAskAgain: true
      };
      return acc;
    }, {});
  }
};

// 请求多个权限
export const requestMultiplePermissions = async (permissions) => {
  try {
    const PermissionsAPI = await getPermissionsAPI();
    const result = await PermissionsAPI.requestPermissions({ permissions });
    return result;
  } catch (error) {
    console.error('Error requesting multiple permissions:', error);
    // 降级到最简单的模拟结果
    return permissions.reduce((acc, permission) => {
      acc[permission] = { 
        state: 'granted', 
        name: permission,
        canAskAgain: true
      };
      return acc;
    }, {});
  }
};

// 打开应用设置（用于用户手动授予权限）
export const openAppSettings = async () => {
  try {
    const PermissionsAPI = await getPermissionsAPI();
    await PermissionsAPI.openAppSettings();
  } catch (error) {
    console.error('Error opening app settings:', error);
  }
};

// 检查权限组合是否全部已授权
export const checkPermissionGroup = async (permissionGroup) => {
  const results = await checkMultiplePermissions(permissionGroup);
  
  return {
    allGranted: Object.values(results).every(result => result.state === 'granted'),
    results
  };
};

// 请求权限组合
export const requestPermissionGroup = async (permissionGroup) => {
  const results = await requestMultiplePermissions(permissionGroup);
  
  return {
    allGranted: Object.values(results).every(result => result.state === 'granted'),
    results
  };
};

// 带有UI提示的权限请求
export const requestPermissionWithExplanation = async (permission, explanation) => {
  // 在实际应用中，可以在这里显示一个解释弹窗
  if (explanation) {
    console.log(`权限请求说明: ${explanation}`);
  }

  return await requestPermission(permission);
};

// 权限状态解释
export const getPermissionExplanation = (permission) => {
  const explanations = {
    [PermissionTypes.CAMERA]: '需要相机权限来拍摄照片和视频',
    [PermissionTypes.MICROPHONE]: '需要麦克风权限来录制音频',
    [PermissionTypes.PHOTOS]: '需要相册权限来访问和保存图片',
    [PermissionTypes.GEOLOCATION]: '需要位置权限来提供基于位置的服务',
    [PermissionTypes.NOTIFICATIONS]: '需要通知权限来发送重要提醒',
    [PermissionTypes.CALENDAR]: '需要日历权限来读取和创建日程',
    [PermissionTypes.STORAGE]: '需要存储权限来访问设备上的文件'
  };
  
  return explanations[permission] || '需要此权限来正常使用应用功能';
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
      return await requestPermissionWithExplanation(permission, explanation);
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
      const requestResults = await requestMultiplePermissions(deniedPermissions);
      
      // 更新结果
      Object.assign(results, requestResults);
      
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

// 导出是否使用模拟API的标志
export const isUsingSimulatedPermissions = () => FORCE_SIMULATED_PERMISSIONS;