import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biorhythm.app',
  appName: 'Biorhythm App',
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
    minWebViewVersion: 65,
    allowFileAccess: true,
    hardwareAcceleration: true
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
