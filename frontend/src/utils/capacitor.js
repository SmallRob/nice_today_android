/**
 * Capacitor工具类
 * 用于处理Capacitor平台相关的功能
 */

import { Capacitor } from '@capacitor/core';
// 使用动态导入避免在 Web 平台上直接导入不可用的插件
let App, SplashScreen, StatusBar, Device, Network, Keyboard, Haptics;

// 主题颜色映射
const THEME_COLORS = {
  light: '#6366f1',  // indigo-500
  dark: '#1e293b'    // slate-800
};

// 获取当前主题
const getCurrentTheme = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    const config = localStorage.getItem('app_theme_config');
    if (config) {
      const parsed = JSON.parse(config);
      // 如果有有效主题，直接使用
      if (parsed.effectiveTheme) {
        return parsed.effectiveTheme;
      }
      // 否则根据主题模式计算
      const themeMode = parsed.themeMode || 'system';
      if (themeMode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return themeMode || 'light';
    }
  } catch (error) {
    console.warn('获取主题失败:', error);
  }
  // 默认检查系统主题
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initPlugins = async () => {
  if (!App) {
    try {
      const modules = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/splash-screen'),
        import('@capacitor/status-bar'),
        import('@capacitor/device'),
        import('@capacitor/network'),
        import('@capacitor/keyboard'),
        import('@capacitor/haptics')
      ]);
      App = modules[0].App;
      SplashScreen = modules[1].SplashScreen;
      StatusBar = modules[2].StatusBar;
      Device = modules[3].Device;
      Network = modules[4].Network;
      Keyboard = modules[5].Keyboard;
      Haptics = modules[6].Haptics;
    } catch (error) {
      console.debug('Failed to initialize Capacitor plugins:', error.message);
      return false;
    }
  }
  return true;
};

// 检测当前平台
export const isNative = Capacitor.isNativePlatform();
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isWeb = Capacitor.getPlatform() === 'web';

// 获取平台信息
export const getPlatformInfo = async () => {
  await initPlugins();
  if (!Device) {
    return {
      isNative,
      isAndroid,
      isIOS,
      isWeb,
      platform: Capacitor.getPlatform(),
      model: 'web',
      name: 'web'
    };
  }
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
    await initPlugins();

    // 获取当前主题，根据主题设置状态栏颜色
    const currentTheme = getCurrentTheme();
    const themeColor = THEME_COLORS[currentTheme] || THEME_COLORS.light;
    const statusBarStyle = isIOS ? 'DARK' : (currentTheme === 'dark' ? 'DARK' : 'LIGHT');

    // 设置状态栏
    if (StatusBar) {
      try {
        await StatusBar.setStyle({ style: statusBarStyle });
        await StatusBar.setBackgroundColor({ color: themeColor });
      } catch (error) {
        console.debug('StatusBar not available:', error.message);
      }
    }

    // 隐藏启动画面
    if (SplashScreen) {
      try {
        await SplashScreen.hide();
      } catch (error) {
        console.debug('SplashScreen not available:', error.message);
      }
    }

    // 添加应用状态监听
    if (App) {
      try {
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
        console.debug('App listeners setup failed:', error.message);
      }
    }

  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// 处理键盘事件
export const setupKeyboardListeners = async () => {
  if (!isNative) return;

  await initPlugins();
  if (!Keyboard) return;

  try {
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
  } catch (error) {
    console.debug('Keyboard setup failed:', error.message);
  }
};

// 网络状态监控
export const setupNetworkListener = async (callback) => {
  if (!isNative) return;

  await initPlugins();
  if (!Network) return;

  try {
    const handler = Network.addListener('networkStatusChange', (status) => {
      callback(status);
    });

    // 获取初始网络状态
    Network.getStatus().then(callback);

    return handler;
  } catch (error) {
    console.debug('Network setup failed:', error.message);
    return null;
  }
};

// 触觉反馈
export const triggerHaptics = async (type = 'impact') => {
  if (!isNative) return;

  await initPlugins();
  if (!Haptics) return;

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
    console.debug('Haptics failed:', error.message);
  }
};

// 获取应用版本信息
export const getAppVersion = async () => {
  try {
    if (!isNative) return { version: 'web', build: 'web' };

    const pluginsInitialized = await initPlugins();
    if (!pluginsInitialized || !App) return { version: 'web', build: 'web' };

    const info = await App.getInfo();
    return {
      version: info.version || 'unknown',
      build: info.build || 'unknown'
    };
  } catch (error) {
    console.debug('Error getting app version:', error.message);
    // 提供安全的默认值，避免应用启动失败
    return { version: 'web', build: 'web' };
  }
};

// 处理应用生命周期
export const setupAppLifecycle = async (callbacks) => {
  if (!isNative) return;

  await initPlugins();
  if (!App) return;

  const { onAppStateChange, onUrlOpen } = callbacks;

  try {
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
  } catch (error) {
    console.debug('App lifecycle setup failed:', error.message);
  }
};

// 设置状态栏样式
export const setStatusBarStyle = async (style) => {
  if (!isNative) return;

  await initPlugins();
  if (!StatusBar) return;

  try {
    await StatusBar.setStyle({ style });
  } catch (error) {
    console.debug('Status bar not available:', error.message);
  }
};

// 设置状态栏背景色
export const setStatusBarBackgroundColor = async (color) => {
  if (!isNative || isIOS) return; // iOS不支持设置状态栏背景色

  await initPlugins();
  if (!StatusBar) return;

  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.debug('Status bar not available:', error.message);
  }
};

// 显示/隐藏状态栏
export const setStatusBarVisibility = async (visible) => {
  if (!isNative) return;

  await initPlugins();
  if (!StatusBar) return;

  try {
    await StatusBar.show({ visible });
  } catch (error) {
    console.debug('Status bar not available:', error.message);
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
  // 获取当前主题，根据主题设置状态栏颜色
  const currentTheme = getCurrentTheme();
  const themeColor = THEME_COLORS[currentTheme] || THEME_COLORS.light;
  const statusBarStyle = isIOS ? 'DARK' : (currentTheme === 'dark' ? 'DARK' : 'LIGHT');

  const {
    statusBarStyle: customStatusBarStyle = statusBarStyle,
    statusBarBackgroundColor = themeColor,
    enableKeyboardListeners = true,
    enableNetworkListener = false,
    networkCallback,
    lifecycleCallbacks
  } = options;

  // 初始化应用
  await initApp();

  // 设置状态栏（仅原生平台）
  try {
    await setStatusBarStyle(statusBarStyle);
    if (statusBarBackgroundColor) {
      await setStatusBarBackgroundColor(statusBarBackgroundColor);
    }
  } catch (error) {
    console.debug('Status bar setup skipped:', error.message);
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