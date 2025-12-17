# Biorhythm React App - 移动应用版本

使用Capacitor框架将React应用封装为移动应用，支持iOS和Android双平台，采用底部标签栏导航。

## 项目结构

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
│   │   │   └── ...
│   │   ├── utils/          # 工具类
│   │   │   ├── capacitor.js        # Capacitor工具类
│   │   │   ├── capacitorInit.js    # 应用初始化
│   │   │   ├── compatibility.js    # 兼容性测试
│   │   │   ├── performance.js      # 性能优化
│   │   │   ├── permissions.js      # 权限管理
│   │   │   └── responsive.js       # 屏幕适配
│   │   ├── App.js          # 应用入口（路由配置）
│   │   └── index.css       # 样式（包含安全区域）
│   ├── capacitor.config.ts  # Capacitor配置文件
│   └── package.json
├── android/                # Android项目（由Capacitor生成）
├── ios/                    # iOS项目（由Capacitor生成）
├── build-mobile.sh         # 跨平台构建脚本
├── test-compatibility.sh   # 兼容性测试脚本
└── README.md              # 项目说明
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

### 适配特性

- **安全区域适配** - 支持iOS刘海屏和Android全面屏
- **深色模式** - 跟随系统或手动切换
- **响应式设计** - 适配不同屏幕尺寸
- **触摸优化** - 针对移动端交互优化

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

## 构建和发布

### Android构建

```bash
# 调试版本
./build-mobile.sh --platform android --debug

# 发布版本
./build-mobile.sh --platform android --release

# 签名发布版本（需先配置签名）
./build-mobile.sh --platform android --release --open
# 然后在Android Studio中配置签名并构建
```

### iOS构建

```bash
# 调试版本
./build-mobile.sh --platform ios --debug

# 发布版本（需先配置证书和描述文件）
./build-mobile.sh --platform ios --release --open
# 然后在Xcode中配置证书和描述文件
```

## 测试

### 兼容性测试

```bash
# 运行兼容性测试
./test-compatibility.sh

# 完整测试
./test-compatibility.sh --full

# 特定设备测试
./test-compatibility.sh --device <设备ID>
```

### 功能测试

1. 在不同尺寸设备上测试UI适配
2. 测试深色/浅色模式切换
3. 测试网络异常情况
4. 测试权限请求和处理

## 常见问题解决

### 构建问题

1. **Android构建失败**
   - 检查Android SDK和JDK版本
   - 更新Gradle依赖
   - 检查AndroidManifest.xml配置

2. **iOS构建失败**
   - 更新CocoaPods
   - 检查Xcode版本
   - 验证证书和描述文件

### 运行时问题

1. **白屏问题**
   - 检查Capacitor配置中的webDir路径
   - 确保React应用正确构建
   - 检查控制台错误日志

2. **路由问题**
   - 确保React Router正确配置
   - 检查路径匹配规则
   - 验证页面组件导入

3. **样式问题**
   - 检查CSS安全区域变量
   - 验证Tailwind CSS配置
   - 确保深色模式正常工作

## 发布到应用商店

### Google Play Store (Android)

1. 创建Google Play开发者账号
2. 生成签名的发布APK或AAB
3. 准备应用商店资源（图标、截图、描述）
4. 填写应用信息和隐私政策
5. 提交审核

### Apple App Store (iOS)

1. 注册Apple开发者账号
2. 创建App Store Connect记录
3. 配置证书和描述文件
4. 上传构建版本
5. 准备应用元数据
6. 提交审核

## 维护和更新

1. **更新依赖**
   ```bash
   npm update
   npx cap sync
   ```

2. **添加新功能**
   - 在相应页面组件中实现
   - 更新路由配置（如需添加新页面）
   - 同步到原生平台

3. **平台特定更新**
   ```bash
   # 更新Android平台
   npx cap update android
   
   # 更新iOS平台
   npx cap update ios
   ```

## 更多资源

- [Capacitor官方文档](https://capacitorjs.com/docs)
- [React Router文档](https://reactrouter.com/)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [Android开发者指南](https://developer.android.com/guide)
- [iOS开发者指南](https://developer.apple.com/documentation/)