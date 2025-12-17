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
    minWebViewVersion: 50, // 进一步降低最低WebView版本要求，支持更多老旧设备
    allowFileAccess: true,
    hardwareAcceleration: true,
    useLegacyBridge: true, // 使用传统桥接模式提高兼容性
    enableReporting: false // 禁用报告功能减少潜在冲突
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
      appendUserAgent: "BiorhythmApp/1.0"
    },
    Keyboard: {
      resize: 'body'
    },
    Network: {
      // 网络监控配置
    }
  }
};

export default config;
