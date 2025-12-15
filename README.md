# Biorhythm React App - Android 版本

使用Capacitor框架将React应用封装为Android应用，支持主流安卓手机型号，适配不同屏幕尺寸和安卓版本。

## 目录结构

```
nice_today_android/
├── frontend/                # React应用源码
│   ├── src/
│   │   ├── utils/          # 工具类
│   │   │   ├── capacitor.js        # Capacitor工具类
│   │   │   ├── capacitorInit.js    # 应用初始化
│   │   │   ├── compatibility.js    # 兼容性测试
│   │   │   ├── performance.js      # 性能优化
│   │   │   ├── permissions.js      # 权限管理
│   │   │   └── responsive.js       # 屏幕适配
│   │   └── ...            # 其他React应用文件
│   └── capacitor.config.ts  # Capacitor配置文件
├── android/                # Android项目（由Capacitor生成）
├── build-android.sh        # 构建脚本
├── test-compatibility.sh   # 兼容性测试脚本
├── AndroidManifest.xml     # Android权限配置模板
└── README.md              # 本文件
```

## 环境要求

1. **Node.js** 14+ 和 npm
2. **Android Studio** 最新版本
3. **Android SDK** API Level 21 (Android 5.0) 或更高
4. **Java** JDK 11 或更高

## 快速开始

### 1. 安装依赖

```bash
# 进入frontend目录
cd frontend

# 安装React应用依赖
npm install

# 全局安装Capacitor CLI（如果尚未安装）
npm install -g @capacitor/cli
```

### 2. 添加Android平台

```bash
# 如果尚未添加Android平台
npx cap add android
```

### 3. 构建并同步

```bash
# 构建React应用
npm run build

# 同步到Android项目
npx cap sync android
```

### 4. 运行应用

```bash
# 在设备/模拟器上运行
npx cap run android

# 或在Android Studio中打开项目
npx cap open android
```

## 使用脚本

### 构建脚本

使用提供的构建脚本快速构建应用：

```bash
# 构建调试版本
./build-android.sh

# 构建发布版本
./build-android.sh --release

# 仅同步代码，不构建
./build-android.sh --sync-only

# 在特定设备上安装
./build-android.sh --target=<设备ID>
```

### 兼容性测试脚本

使用测试脚本检查应用在不同设备上的兼容性：

```bash
# 基础测试
./test-compatibility.sh

# 完整测试
./test-compatibility.sh --full

# 在特定设备上测试
./test-compatibility.sh --device <设备ID>
```

## 功能特性

### 屏幕适配

- 响应式设计支持多种屏幕尺寸
- 自动适配横竖屏切换
- 支持全面屏设备
- 提供安全区域处理

### 性能优化

- 组件渲染性能监控
- 内存使用跟踪
- API请求性能分析
- 自动性能建议

### 兼容性支持

- 最低支持Android 5.0 (API 21)
- 针对不同Android版本的特定优化
- 设备特定问题解决方案
- 自动兼容性检测和报告

### 权限管理

- 运行时权限请求
- 权限状态监控
- 权限使用说明
- 批量权限处理

## 配置说明

### Capacitor配置

主要配置在`frontend/capacitor.config.ts`文件中：

```typescript
const config: CapacitorConfig = {
  appId: 'com.biorhythm.app',
  appName: 'Biorhythm App',
  webDir: 'build',
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development'
  },
  plugins: {
    SplashScreen: {
      // 启动画面配置
    }
  }
};
```

### 权限配置

Android权限在`AndroidManifest.xml`中配置：

- 网络访问权限
- 存储权限
- 位置权限
- 相机和麦克风权限
- 通知权限

## 构建发布版本

### 1. 生成签名密钥

```bash
keytool -genkey -v -keystore release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

在`android/app/build.gradle`中添加签名配置：

```gradle
android {
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
        }
    }
}
```

### 3. 构建APK

```bash
cd android
./gradlew assembleRelease
```

## 测试与调试

### 在模拟器中测试

1. 在Android Studio中创建不同版本的模拟器
2. 使用`npx cap run android`运行应用
3. 使用Chrome DevTools调试WebView

### 在真机上测试

1. 启用USB调试模式
2. 连接设备
3. 运行`npx cap run android --target=<设备ID>`
4. 使用`adb logcat`查看日志

### 性能分析

1. 使用Android Studio的Profiler工具
2. 利用内置的性能监控工具
3. 生成性能报告

## 常见问题解决

### 白屏问题

- 检查Capacitor配置中的`webDir`路径
- 确保React应用正确构建
- 检查控制台错误日志

### 网络请求问题

- 配置网络安全策略
- 处理混合内容问题
- 检查CORS设置

### 权限问题

- 确保在AndroidManifest.xml中声明权限
- 实现运行时权限请求
- 提供权限说明

### 性能问题

- 优化组件渲染
- 减少不必要的更新
- 使用懒加载

## 部署到应用商店

1. 生成签名的发布APK或AAB
2. 准备应用商店资源（图标、截图、描述）
3. 填写应用信息和隐私政策
4. 提交审核

## 更多资源

- [Capacitor官方文档](https://capacitorjs.com/docs)
- [React官方文档](https://reactjs.org/)
- [Android开发者指南](https://developer.android.com/guide)

## 许可证

本代码遵循MIT许可证。