# Biorhythm React App - 移动应用版本

使用Capacitor框架将React应用封装为移动应用，支持iOS和Android双平台，采用底部标签栏导航。

## 目录结构

```
nice_today_android/
├── frontend/                # React应用源码
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   │   ├── DashboardPage.js   # 首页/仪表盘
│   │   │   ├── MayaPage.js        # 玛雅历法页面
│   │   │   └── SettingsPage.js    # 设置页面
│   │   ├── components/      # 组件
│   │   │   ├── TabNavigation.js   # 底部标签导航
│   │   │   └── ...            # 其他组件
│   │   ├── utils/          # 工具类
│   │   │   ├── capacitor.js        # Capacitor工具类
│   │   │   ├── capacitorInit.js    # 应用初始化
│   │   │   ├── compatibility.js    # 兼容性测试
│   │   │   ├── performance.js      # 性能优化
│   │   │   ├── permissions.js      # 权限管理
│   │   │   └── responsive.js       # 屏幕适配
│   │   ├── App.js          # 应用入口（路由配置）
│   │   └── index.css       # 样式（包含安全区域）
│   └── capacitor.config.ts  # Capacitor配置文件
├── android/                # Android项目（由Capacitor生成）
├── ios/                    # iOS项目（由Capacitor生成）
├── build-mobile.sh         # 跨平台构建脚本
├── test-compatibility.sh   # 兼容性测试脚本
├── AndroidManifest.xml     # Android权限配置模板
├── MOBILE_APP.md          # 移动应用详细文档
└── README.md              # 本文件
```

## 应用架构

### 底部标签栏导航

应用采用移动端标准的底部标签栏导航，包含三个主要功能模块：

1. **首页** - 生物节律仪表盘和主要功能
2. **玛雅历法** - 玛雅历法相关功能
3. **设置** - 应用设置和用户偏好

### 页面结构

- 每个页面作为独立组件，支持懒加载
- 页面间切换使用React Router处理
- 添加了页面切换动画效果

## 环境要求

1. **Node.js** 14+ 和 npm
2. **Android Studio** 最新版本（Android开发）
3. **Xcode** 13+（iOS开发，仅macOS）
4. **Java** JDK 11 或更高
5. **CocoaPods**（iOS开发，仅macOS）

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

### 2. 添加移动平台

```bash
# 添加Android平台
npx cap add android

# 添加iOS平台（仅macOS）
npx cap add ios
```

### 3. 构建和运行

使用提供的构建脚本：

```bash
# 构建Android版本
./build-mobile.sh --platform android

# 构建iOS版本（仅macOS）
./build-mobile.sh --platform ios

# 构建并运行
./build-mobile.sh --platform android --open

# 构建发布版本
./build-mobile.sh --platform android --release
```

或者使用Capacitor命令：

```bash
# 构建React应用
npm run build

# 同步到平台项目
npm run sync

# 运行Android应用
npm run android:run

# 运行iOS应用（仅macOS）
npm run ios:run
```

## 功能特性

### 1. 平台适配

- **iOS适配**
  - 安全区域处理
  - 原生手势支持
  - 状态栏样式
  - iOS特定UI元素

- **Android适配**
  - 材料设计风格
  - 返回按钮处理
  - 权限管理
  - 多种屏幕密度支持

### 2. 性能优化

- 代码分割和懒加载
- 图片和资源优化
- 内存泄漏防护
- 启动时间优化

### 3. 用户体验

- 流畅的页面切换动画
- 原生系统集成
- 离线功能支持
- 推送通知支持

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