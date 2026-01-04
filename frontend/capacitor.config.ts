import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biorhythm.app',
  appName: '生物节律助手',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#ffffffff',
    logLevel: 'ERROR',
    minWebViewVersion: 65,
    allowFileAccess: true,
    hardwareAcceleration: true,
    useLegacyBridge: false,
    overrideUserAgent: 'NiceTodayApp/1.0',
    appendUserAgent: 'NiceTodayApp/1.0',
    allowFileAccessFromFileURLs: true,
    allowUniversalAccessFromFileURLs: false
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    handleOpenURL: true,
    scrollEnabled: true,
    allowFileAccess: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#3498db',
      sound: 'default'
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffffff',
      androidSplashResourceName: 'splash_background',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
      splashFadeOutDuration: 500,
      launchFadeInDuration: 500
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff'
    },
    App: {
      appendUserAgent: 'NiceTodayApp/1.0'
    },
    Keyboard: {
      resize: 'body'
    },
    Network: {},
    Permissions: {
      requestStatus: true
    }
  }
};

export default config;