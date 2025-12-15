/**
 * Capacitor工具类
 * 用于处理Capacitor平台相关的功能
 */

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics } from '@capacitor/haptics';

// 检测当前平台
export const isNative = Capacitor.isNativePlatform();
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isWeb = Capacitor.getPlatform() === 'web';

// 获取平台信息
export const getPlatformInfo = async () => {
  const info = await Device.getInfo();
  return {
    ...info,
    isNative,
    isAndroid,
    isIOS,
    isWeb,
    platform: Capacitor.getPlatform()
  };
};

// 初始化应用
export const initApp = async () => {
  if (!isNative) return;

  try {
    // 设置状态栏
    await StatusBar.setStyle({ style: isIOS ? 'DARK' : 'LIGHT' });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    // 隐藏启动画面
    await SplashScreen.hide();

    // 添加应用状态监听
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
      // 可以在这里处理应用进入前台/后台的逻辑
    });

    // 添加返回按钮处理（Android）
    if (isAndroid) {
      App.addListener('backButton', async ({ canGoBack }) => {
        if (!canGoBack) {
          // 在根页面时，双击返回退出应用
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    }

  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// 处理键盘事件
export const setupKeyboardListeners = () => {
  if (!isNative) return;

  Keyboard.addListener('keyboardWillShow', (info) => {
    console.log('keyboard will show with height:', info.keyboardHeight);
    // 可以调整UI布局
    document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    document.body.classList.add('keyboard-open');
  });

  Keyboard.addListener('keyboardWillHide', () => {
    console.log('keyboard will hide');
    // 恢复UI布局
    document.body.style.removeProperty('--keyboard-height');
    document.body.classList.remove('keyboard-open');
  });
};

// 网络状态监控
export const setupNetworkListener = (callback) => {
  if (!isNative) return;

  const handler = Network.addListener('networkStatusChange', (status) => {
    callback(status);
  });

  // 获取初始网络状态
  Network.getStatus().then(callback);

  return handler;
};

// 触觉反馈
export const triggerHaptics = async (type = 'impact') => {
  if (!isNative) return;

  try {
    switch (type) {
      case 'impact':
        await Haptics.impact({ style: 'medium' });
        break;
      case 'notification':
        await Haptics.notification({ type: 'success' });
        break;
      case 'selection':
        await Haptics.selectionStart();
        await Haptics.selectionEnd();
        break;
      default:
        await Haptics.impact({ style: 'medium' });
    }
  } catch (error) {
    console.error('Error triggering haptics:', error);
  }
};

// 获取应用版本信息
export const getAppVersion = async () => {
  if (!isNative) return { version: 'web', build: 'web' };

  try {
    const info = await App.getInfo();
    return {
      version: info.version,
      build: info.build
    };
  } catch (error) {
    console.error('Error getting app version:', error);
    return { version: 'unknown', build: 'unknown' };
  }
};

// 处理应用生命周期
export const setupAppLifecycle = (callbacks) => {
  if (!isNative) return;

  const { onAppStateChange, onUrlOpen } = callbacks;

  // 应用状态变化
  if (onAppStateChange) {
    App.addListener('appStateChange', onAppStateChange);
  }

  // URL打开事件
  if (onUrlOpen) {
    App.addListener('appUrlOpen', onUrlOpen);
  }

  // 内存警告
  App.addListener('memoryWarning', () => {
    console.warn('Received memory warning');
    // 可以在这里执行清理操作
  });
};

// 设置状态栏样式
export const setStatusBarStyle = async (style) => {
  if (!isNative) return;

  try {
    await StatusBar.setStyle({ style });
  } catch (error) {
    console.error('Error setting status bar style:', error);
  }
};

// 设置状态栏背景色
export const setStatusBarBackgroundColor = async (color) => {
  if (!isNative || isIOS) return; // iOS不支持设置状态栏背景色

  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('Error setting status bar background color:', error);
  }
};

// 显示/隐藏状态栏
export const setStatusBarVisibility = async (visible) => {
  if (!isNative) return;

  try {
    await StatusBar.show({ visible });
  } catch (error) {
    console.error('Error setting status bar visibility:', error);
  }
};

// 检查网络连接状态
export const checkNetworkStatus = async () => {
  if (isNative) {
    return await Network.getStatus();
  } else {
    return {
      connected: navigator.onLine,
      connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
    };
  }
};

// 创建一个应用初始化函数
export const initializeApp = async (options = {}) => {
  const {
    statusBarStyle = isIOS ? 'DARK' : 'LIGHT',
    statusBarBackgroundColor = '#ffffff',
    enableKeyboardListeners = true,
    enableNetworkListener = false,
    networkCallback,
    lifecycleCallbacks
  } = options;

  // 初始化应用
  await initApp();

  // 设置状态栏
  await setStatusBarStyle(statusBarStyle);
  if (statusBarBackgroundColor) {
    await setStatusBarBackgroundColor(statusBarBackgroundColor);
  }

  // 设置键盘监听
  if (enableKeyboardListeners) {
    setupKeyboardListeners();
  }

  // 设置网络监听
  if (enableNetworkListener && networkCallback) {
    setupNetworkListener(networkCallback);
  }

  // 设置生命周期回调
  if (lifecycleCallbacks) {
    setupAppLifecycle(lifecycleCallbacks);
  }

  // 返回平台信息
  return await getPlatformInfo();
};