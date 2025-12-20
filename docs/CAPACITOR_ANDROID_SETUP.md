# 使用Capacitor将React应用封装为Android应用指南

## 目录
1. [环境配置](#环境配置)
2. [Capacitor集成](#capacitor集成)
3. [Android项目配置](#android项目配置)
4. [构建和部署](#构建和部署)
5. [屏幕适配](#屏幕适配)
6. [性能优化](#性能优化)
7. [兼容性测试](#兼容性测试)
8. [常见问题解决](#常见问题解决)

## 环境配置

### 1. 安装必要工具
```bash
# 确保已安装Node.js 14+和npm

# 安装Android Studio
# 下载地址: https://developer.android.com/studio

# 安装Android SDK
# 在Android Studio中，通过SDK Manager安装:
# - Android SDK Platform-Tools
# - Android SDK Build-Tools
# - Android 10 (API 29) 或更高版本

# 设置环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 安装Java JDK 11或更高版本
# 通过Android Studio SDK Manager安装或手动下载

# 验证安装
java -version
adb version
```

### 2. 全局安装Capacitor CLI
```bash
npm install -g @capacitor/cli
```

## Capacitor集成

### 1. 在React项目中初始化Capacitor
```bash
# 进入frontend目录
cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend

# 初始化Capacitor
npx cap init "Biorhythm App" "com.biorhythm.app"

# 配置信息会保存在capacitor.config.ts文件中
```

### 2. 安装Android平台和依赖
```bash
# 安装Android平台
npm install @capacitor/android

# 安装核心Capacitor包
npm install @capacitor/core

# 安装常用插件（根据需要）
npm install @capacitor/app
npm install @capacitor/haptics
npm install @capacitor/keyboard
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
npm install @capacitor/network
npm install @capacitor/device
npm install @capacitor/geolocation
npm install @capacitor/camera
npm install @capacitor/filesystem

# 添加Android平台
npx cap add android
```

### 3. 更新package.json脚本
```json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test",
    "eject": "react-scripts eject",
    "android": "npx cap open android",
    "android:run": "npx cap run android",
    "android:build": "npx cap build android",
    "sync": "npx cap sync android"
  }
}
```

## Android项目配置

### 1. 配置capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biorhythm.app',
  appName: 'Biorhythm App',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    }
  }
};

export default config;
```

### 2. 构建React应用并同步到Android
```bash
# 构建React应用
npm run build

# 同步到Android项目
npx cap sync android
```

### 3. 配置Android权限

#### 打开Android项目
```bash
npx cap open android
```

#### 配置AndroidManifest.xml
在`android/app/src/main/AndroidManifest.xml`中添加必要权限:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

<!-- 如果需要地理位置 -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- 如果需要相机 -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

<!-- 如果需要文件系统访问 -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- 防止应用在后台被杀死 -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### 4. 配置应用图标和启动画面

#### 应用图标
1. 准备应用图标文件（PNG格式）
2. 使用`@capacitor/assets`命令生成各尺寸图标:
```bash
npm install @capacitor/assets
npx cap assets
```

#### 启动画面
在`android/app/src/main/res`目录下创建启动画面资源，或在`capacitor.config.ts`中配置。

## 屏幕适配

### 1. 响应式设计原则
- 使用相对单位（rem, em, %）而非绝对单位（px）
- 使用CSS Grid和Flexbox布局
- 利用媒体查询适配不同屏幕尺寸

### 2. 在React应用中添加屏幕适配代码

#### 创建一个屏幕适配工具类
```javascript
// src/utils/responsive.js
export const isMobile = window.innerWidth <= 768;
export const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
export const isDesktop = window.innerWidth > 1024;

export const getFontSize = (baseSize) => {
  const screenWidth = window.innerWidth;
  const baseWidth = 375; // iPhone 6/7/8宽度作为基准
  return (baseSize * screenWidth) / baseWidth;
};

// 监听屏幕方向变化
export const addOrientationListener = (callback) => {
  window.addEventListener('orientationchange', callback);
  window.addEventListener('resize', callback);
};

export const removeOrientationListener = (callback) => {
  window.removeEventListener('orientationchange', callback);
  window.removeEventListener('resize', callback);
};
```

#### 使用Capacitor的App插件处理状态变化
```javascript
import { App } from '@capacitor/app';

App.addListener('appStateChange', ({ isActive }) => {
  console.log('App state changed. Is active?', isActive);
  // 可以在这里处理应用进入前台/后台的逻辑
});
```

### 3. 适配不同Android版本

#### 最低SDK版本设置
在`android/app/build.gradle`中设置:
```gradle
android {
    defaultConfig {
        minSdkVersion 21 // Android 5.0
        targetSdkVersion 33 // 最新Android版本
    }
}
```

#### 条件渲染不同版本的特性
```javascript
import { Device } from '@capacitor/device';

const checkAndroidVersion = async () => {
  const info = await Device.getInfo();
  if (info.platform === 'android') {
    const androidVersion = parseInt(info.osVersion.split('.')[0]);
    return androidVersion;
  }
  return null;
};
```

## 性能优化

### 1. Web性能优化
```javascript
// 启用React严格模式（仅在开发环境）
import { StrictMode } from 'react';

// 优化组件渲染
import React, { memo, useMemo, useCallback } from 'react';

// 使用React.memo优化组件
const OptimizedComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    // 处理数据
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});
```

### 2. Capacitor性能优化配置

#### 配置WebView性能
在`capacitor.config.ts`中添加:
```typescript
const config: CapacitorConfig = {
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false, // 生产环境关闭
    backgroundColor: "#ffffffff",
    logLevel: "ERROR" // 减少日志输出
  },
  server: {
    androidScheme: 'https',
    // 启用HTTP/2
    cleartext: true
  }
};
```

#### 优化加载性能
```javascript
// 预加载关键资源
import { SplashScreen } from '@capacitor/splash-screen';

// 在App.js中
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 预加载数据
    const preloadData = async () => {
      try {
        // 预加载必要数据
        await Promise.all([
          // 数据加载请求
        ]);
      } finally {
        // 隐藏启动画面
        await SplashScreen.hide();
        setIsLoading(false);
      }
    };

    preloadData();
  }, []);

  return isLoading ? null : <MainApp />;
};
```

### 3. 内存管理
```javascript
// 清理定时器和监听器
useEffect(() => {
  const timer = setInterval(() => {
    // 定时任务
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);

// 清理Capacitor插件监听器
useEffect(() => {
  const listener = App.addListener('appStateChange', ({ isActive }) => {
    // 处理状态变化
  });

  return () => {
    listener.remove();
  };
}, []);
```

## 构建和部署

### 1. 开发环境运行
```bash
# 构建并同步
npm run build && npx cap sync android

# 在设备/模拟器上运行
npx cap run android
```

### 2. 生产环境构建
```bash
# 构建优化版本
npm run build

# 同步到Android
npx cap sync android

# 通过Android Studio构建APK
npx cap open android
# 然后在Android Studio中选择 Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### 3. 生成签名的发布版本
```bash
# 1. 生成签名密钥
keytool -genkey -v -keystore release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000

# 2. 配置gradle签名
# 在android/app/build.gradle中添加:
android {
    ...
    signingConfigs {
        release {
            storeFile file('../release-key.keystore')
            storePassword 'your-password'
            keyAlias 'release'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

# 3. 构建发布版APK
cd android
./gradlew assembleRelease
```

## 兼容性测试

### 1. 模拟器测试
```bash
# 列出可用的Android系统镜像
sdkmanager --list | grep "system-images"

# 安装不同版本的系统镜像
sdkmanager "system-images;android-30;google_apis;x86"
sdkmanager "system-images;android-28;google_apis;x86"
sdkmanager "system-images;android-26;google_apis;x86"

# 创建不同版本的AVD
avdmanager create avd -n test-android-11 -k "system-images;android-30;google_apis;x86"
avdmanager create avd -n test-android-9 -k "system-images;android-28;google_apis;x86"
avdmanager create avd -n test-android-8 -k "system-images;android-26;google_apis;x86"

# 启动特定模拟器
emulator -avd test-android-11
```

### 2. 真机测试
```bash
# 连接设备并运行
npx cap run android --target=<device_id>

# 查看已连接设备
adb devices
```

### 3. 测试不同屏幕尺寸
```javascript
// 在Capacitor配置中启用调试
const config: CapacitorConfig = {
  android: {
    webContentsDebuggingEnabled: true
  }
};

// 使用Chrome DevTools调试
# 在应用运行时:
# 1. 打开Chrome浏览器
# 2. 访问 chrome://inspect
# 3. 选择应用进行调试
# 4. 使用设备模拟器测试不同屏幕尺寸
```

### 4. 自动化测试
```bash
# 安装测试框架
npm install --save-dev @capacitor/cli testing-library

# 创建端到端测试
# tests/e2e/basic.e2e.js
import { Capacitor } from '@capacitor/core';

describe('App E2E Tests', () => {
  beforeAll(async () => {
    await Capacitor.platformReady();
  });

  test('should render main components', async () => {
    // 测试代码
  });
});
```

## 常见问题解决

### 1. 白屏问题
```javascript
// 解决方案1: 确保正确处理Cordova/Capacitor就绪事件
import { Capacitor } from '@capacitor/core';

const App = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Capacitor.platformReady().then(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  return <MainApp />;
};

// 解决方案2: 配置正确的白名单
const config: CapacitorConfig = {
  server: {
    // 允许加载本地资源
    allowNavigation: ['*']
  }
};
```

### 2. 内存泄漏
```javascript
// 正确清理资源和监听器
useEffect(() => {
  const handleAppStateChange = ({ isActive }) => {
    console.log('App state changed', isActive);
  };

  const listener = App.addListener('appStateChange', handleAppStateChange);

  return () => {
    listener.remove();
  };
}, []);
```

### 3. 网络请求问题
```javascript
// 解决混合内容问题
const config: CapacitorConfig = {
  android: {
    allowMixedContent: true
  },
  server: {
    androidScheme: 'https',
    // 允许明文HTTP请求（仅开发环境）
    cleartext: true
  }
};

// 处理CORS问题（如果需要）
// 在服务器端配置适当的CORS头
```

### 4. 屏幕旋转适配
```javascript
import { ScreenOrientation } from '@capacitor/screen-orientation';

// 锁定屏幕方向（如果需要）
const lockOrientation = async () => {
  await ScreenOrientation.lock({ orientation: 'portrait' });
};

// 监听屏幕方向变化
ScreenOrientation.addListener('orientationChange', ({ orientation }) => {
  console.log('Orientation changed', orientation);
  // 在这里可以触发UI更新
});
```

### 5. 键盘弹出问题
```javascript
import { Keyboard } from '@capacitor/keyboard';

// 监听键盘事件
Keyboard.addListener('keyboardWillShow', (info) => {
  console.log('keyboard will show with height:', info.keyboardHeight);
  // 调整UI布局
});

Keyboard.addListener('keyboardWillHide', () => {
  console.log('keyboard will hide');
  // 恢复UI布局
});
```

### 6. 权限处理
```javascript
import { Permissions } from '@capacitor/permissions';

// 请求权限
const requestPermissions = async () => {
  const permissions = [
    'camera',
    'geolocation',
    'storage'
  ];

  const results = await Permissions.request(permissions);
  console.log('Permission results:', results);
};

// 检查权限状态
const checkPermissions = async () => {
  const permissions = await Permissions.query({
    name: 'geolocation'
  });
  
  if (permissions.state !== 'granted') {
    // 处理未授权情况
  }
};
```

### 7. 性能监控
```javascript
import { Performance } from '@capacitor/performance';

// 性能监控
const measurePerformance = async () => {
  // 开始性能测量
  const trace = await Performance.startTrace({
    name: 'app-startup'
  });

  // 执行操作

  // 停止性能测量
  await trace.stop();
};
```

## 持续优化建议

1. **定期更新依赖**: 保持Capacitor、React和相关插件的更新
2. **性能分析**: 使用Android Studio的Profiler工具分析应用性能
3. **用户反馈**: 收集不同设备的用户体验反馈
4. **自动测试**: 设置CI/CD流程自动测试应用兼容性
5. **代码分割**: 使用React.lazy和Suspense实现代码分割，减少初始加载时间

通过以上步骤和解决方案，您可以成功将React应用封装为高性能、兼容性良好的Android应用。