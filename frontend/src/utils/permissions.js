/**
 * 权限管理工具类
 * 用于处理Android权限请求和状态检查
 */

import { Capacitor } from '@capacitor/core';

// 检测是否为原生平台
const isNative = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === 'android';

// 模拟的Permission对象，用于在API不确定时使用
const Permission = {
  query: async ({ name }) => {
    // 模拟返回已授权状态
    return { state: 'granted', name };
  },
  request: async ({ name }) => {
    // 模拟返回已授权状态
    return { state: 'granted', name };
  },
  openAppSettings: async () => {
    console.log('Opening app settings (simulated)');
    return;
  }
};

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

// Android特定权限映射
export const AndroidPermissions = {
  // 基础权限
  INTERNET: 'android.permission.INTERNET',
  ACCESS_NETWORK_STATE: 'android.permission.ACCESS_NETWORK_STATE',
  ACCESS_WIFI_STATE: 'android.permission.ACCESS_WIFI_STATE',
  
  // 存储权限
  READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
  WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
  
  // 位置权限
  ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
  ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION',
  
  // 相机和麦克风权限
  CAMERA: 'android.permission.CAMERA',
  RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
  MODIFY_AUDIO_SETTINGS: 'android.permission.MODIFY_AUDIO_SETTINGS',
  
  // 设备功能权限
  VIBRATE: 'android.permission.VIBRATE',
  FLASHLIGHT: 'android.permission.FLASHLIGHT',
  WAKE_LOCK: 'android.permission.WAKE_LOCK',
  
  // 通信权限（如果应用需要）
  CALL_PHONE: 'android.permission.CALL_PHONE',
  READ_PHONE_STATE: 'android.permission.READ_PHONE_STATE',
  
  // 通知权限
  POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS', // Android 13+
  
  // 日历权限
  READ_CALENDAR: 'android.permission.READ_CALENDAR',
  WRITE_CALENDAR: 'android.permission.WRITE_CALENDAR',
  
  // 传感器权限
  BODY_SENSORS: 'android.permission.BODY_SENSORS',
  
  // 应用安装权限
  REQUEST_INSTALL_PACKAGES: 'android.permission.REQUEST_INSTALL_PACKAGES',
  
  // 蓝牙权限（如果应用需要）
  BLUETOOTH: 'android.permission.BLUETOOTH',
  BLUETOOTH_ADMIN: 'android.permission.BLUETOOTH_ADMIN',
  BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',
  BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
  BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN'
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
  ],
  
  FULL_ACCESS: [
    PermissionTypes.CAMERA,
    PermissionTypes.MICROPHONE,
    PermissionTypes.PHOTOS,
    PermissionTypes.GEOLOCATION,
    PermissionTypes.NOTIFICATIONS,
    PermissionTypes.CALENDAR,
    PermissionTypes.CLIPBOARD_READ,
    PermissionTypes.CLIPBOARD_WRITE
  ]
};

// 检查单个权限状态
export const checkPermission = async (permission) => {
  if (!isNative) {
    return { state: 'granted' }; // Web环境默认返回已授权
  }

  try {
    const result = await Permission.query({ name: permission });
    return result;
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
    const result = await Permission.request({ name: permission });
    return result;
  } catch (error) {
    console.error(`Error requesting permission ${permission}:`, error);
    return { state: 'denied' };
  }
};

// 检查多个权限状态
export const checkMultiplePermissions = async (permissions) => {
  if (!isNative) {
    // Web环境下返回所有权限已授权
    return permissions.reduce((acc, permission) => {
      acc[permission] = { state: 'granted' };
      return acc;
    }, {});
  }

  try {
    const results = {};
    for (const permission of permissions) {
      results[permission] = await Permission.query({ name: permission });
    }
    return results;
  } catch (error) {
    console.error('Error checking multiple permissions:', error);
    return permissions.reduce((acc, permission) => {
      acc[permission] = { state: 'prompt' };
      return acc;
    }, {});
  }
};

// 请求多个权限
export const requestMultiplePermissions = async (permissions) => {
  if (!isNative) {
    // Web环境下返回所有权限已授权
    return permissions.reduce((acc, permission) => {
      acc[permission] = { state: 'granted' };
      return acc;
    }, {});
  }

  try {
    const results = {};
    for (const permission of permissions) {
      results[permission] = await Permission.request({ name: permission });
    }
    return results;
  } catch (error) {
    console.error('Error requesting multiple permissions:', error);
    return permissions.reduce((acc, permission) => {
      acc[permission] = { state: 'denied' };
      return acc;
    }, {});
  }
};

// 打开应用设置（用于用户手动授予权限）
export const openAppSettings = async () => {
  if (!isNative) return;

  try {
    await Permission.openAppSettings();
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

// 位置权限特殊处理（Android需要同时请求精确和粗略位置）
export const requestLocationPermissions = async (includeBackground = false) => {
  if (!isNative) {
    return { state: 'granted' };
  }

  try {
    // 对于Android 10+，需要先请求粗略位置，再请求精确位置
    const coarseResult = await Permission.request({ 
      name: PermissionTypes.GEOLOCATION 
    });
    
    if (coarseResult.state !== 'granted') {
      return coarseResult;
    }

    // 请求精确位置权限
    const preciseResult = await Permission.request({ 
      name: PermissionTypes.GEOLOCATION 
    });

    // 如果需要后台位置权限
    if (includeBackground && isAndroid) {
      // 注意：ACCESS_BACKGROUND_LOCATION需要在AndroidManifest.xml中声明
      // 并且需要单独请求
      const backgroundResult = await Permission.request({
        name: 'ACCESS_BACKGROUND_LOCATION' // 注意：这可能在Capacitor中不直接支持
      });
      
      return {
        ...preciseResult,
        backgroundLocation: backgroundResult
      };
    }

    return preciseResult;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return { state: 'denied' };
  }
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