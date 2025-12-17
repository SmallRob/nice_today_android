import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nicetoday.app',
  appName: 'Nice Today',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
    backgroundColor: "#ffffff",
    logLevel: process.env.NODE_ENV === 'development' ? "DEBUG" : "ERROR",
    minWebViewVersion: 65, // 提高最低WebView版本要求，与代码检测保持一致
    allowFileAccess: true,
    hardwareAcceleration: true,
    useLegacyBridge: false,
    // 针对可能的兼容性问题添加额外配置
    overrideUserAgent: "NiceTodayApp/1.0",
    appendUserAgent: "NiceTodayApp/1.0",
    // 确保在所有设备上正确处理混合内容
    allowFileAccessFromFileURLs: true,
    allowUniversalAccessFromFileURLs: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#ffffff",
    handleOpenURL: true,
    scrollEnabled: true,
    allowFileAccess: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
      splashFadeOutDuration: 500,
      launchFadeInDuration: 500
    },
    StatusBar: {
      style: process.env.NODE_ENV === 'development' ? 'DARK' : 'LIGHT',
      backgroundColor: "#ffffff"
    },
    App: {
      appendUserAgent: "NiceTodayApp/1.0"
    },
    Keyboard: {
      resize: 'body'
    },
    Network: {
      // 网络监控配置
    },
    // 添加权限插件配置
    Permissions: {
      // 确保权限请求在所有设备上正常工作
      requestStatus: true
    }
  }
};

export default config;