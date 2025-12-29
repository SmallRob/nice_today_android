# Capacitor Filesystem插件安装指南

## 为什么需要这个插件？

为了支持在Android/iOS WebView中保存和导入文件，我们需要使用Capacitor的Filesystem插件。这个插件提供了：

- ✅ 原生文件系统访问
- ✅ 自动权限管理
- ✅ 跨平台兼容性
- ✅ 安全的文件操作

## 前提条件

- Node.js 已安装
- npm 已配置
- 项目已配置Capacitor

## 安装方法

### 方法1: 自动安装脚本（推荐）

#### Linux/Mac
```bash
./install-filesystem-plugin.sh
```

#### Windows (PowerShell)
```powershell
.\install-filesystem-plugin.ps1
```

### 方法2: 手动安装

```bash
# 1. 进入frontend目录
cd frontend

# 2. 安装插件
npm install @capacitor/filesystem@^5.0.8

# 3. 同步到Android平台
npx cap sync android

# 4. 同步到iOS平台（如果有）
npx cap sync ios

# 5. 重新构建
npm run build
```

## Android配置

安装完成后，Capacitor会自动在 `android/app/src/main/AndroidManifest.xml` 中添加必要的权限：

```xml
<!-- 存储权限 -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Android 10+ 使用分区存储，不需要额外权限 -->
```

**注意**：
- Android 10 (API 29) 使用分区存储，不需要显式权限
- Android 11+ 需要请求 `MANAGE_EXTERNAL_STORAGE` 权限（用于访问其他文件）
- 我们的实现已自动处理这些权限请求

## iOS配置

iOS不需要额外配置，Filesystem插件会自动：
- 在应用沙盒中创建Documents目录
- 处理文件读写权限

**注意**：
- iOS使用沙盒机制，应用只能访问自己的Documents目录
- 用户需要通过"文件"应用才能访问导出的文件
- 不需要显式权限请求

## 验证安装

### 检查插件是否已安装

```bash
# 查看已安装的Capacitor插件
cd frontend
npx cap ls plugins
```

应该看到 `@capacitor/filesystem` 在列表中。

### 检查package.json

在 `frontend/package.json` 中应该有：

```json
"dependencies": {
  "@capacitor/filesystem": "^5.0.8",
  ...
}
```

## 测试功能

### 测试文件保存

1. 运行应用：
   ```bash
   npm start
   ```

2. 在模拟器或真机上打开应用

3. 进入用户配置管理页面

4. 点击"导出配置"或"创建备份"

5. 观察是否：
   - ✅ 首次请求存储权限（Android）
   - ✅ 文件保存成功
   - ✅ 显示成功提示

### 测试文件导入

1. 准备一个有效的配置/备份文件

2. 在应用中点击"导入配置"或"恢复备份"

3. 选择文件

4. 观察是否：
   - ✅ 文件选择正常
   - ✅ 数据导入成功
   - ✅ 配置正确加载

## 常见问题

### 问题1: 插件安装失败

**症状**：
```
npm ERR! code ERESOLVE
```

**解决方案**：
```bash
# 使用 --legacy-peer-deps 标志
npm install @capacitor/filesystem@^5.0.8 --legacy-peer-deps
```

### 问题2: 同步失败

**症状**：
```
Error: The directory android does not exist
```

**解决方案**：
```bash
# 先添加Android平台（如果还没有）
npx cap add android

# 然后再同步
npx cap sync android
```

### 问题3: Android权限问题

**症状**：
- 应用无法保存文件
- 提示"存储权限不足"

**解决方案**：
1. 检查 `AndroidManifest.xml` 是否包含存储权限
2. 清除应用数据重试
3. 手动在应用设置中授予权限

### 问题4: iOS文件访问问题

**症状**：
- 文件保存成功但找不到
- 无法导入文件

**解决方案**：
1. 通过"文件"应用查找：
   - 打开"文件"应用
   - 点击"浏览"
   - 选择"在我的iPhone上"
   - 找到应用名称
2. 使用iCloud Drive保存（可选）

## 权限配置详解

### Android权限矩阵

| Android版本 | 权限要求 | 说明 |
|-------------|---------|------|
| < 10 (API < 29) | READ_EXTERNAL_STORAGE<br/>WRITE_EXTERNAL_STORAGE | 传统存储权限 |
| 10-10 (API 29) | 无 | 分区存储，无需权限 |
| 11+ (API 30+) | MANAGE_EXTERNAL_STORAGE | 用于访问其他应用文件 |

### iOS权限

| 权限 | 说明 |
|-----|------|
| Documents目录 | 应用可读写，无需权限 |
| 共享容器 | 需要配置Entitlements |
| iCloud Drive | 需要配置iCloud权限 |

## 最佳实践

### 1. 权限请求时机
- 在用户首次需要保存/导入文件时请求
- 提供清晰的权限说明
- 记住用户的权限选择

### 2. 错误处理
- 优雅处理权限拒绝
- 提供重试选项
- 引导用户到设置页面

### 3. 用户体验
- 显示操作进度
- 提供明确的反馈
- 支持取消操作

## 性能优化

### 1. 懒加载
```javascript
// 只在原生环境中加载Filesystem插件
const { Filesystem } = await import('@capacitor/filesystem');
```

### 2. 缓存环境检测
```javascript
// 避免重复检测平台
const env = detectEnvironment(); // 只检测一次
```

### 3. 异步操作
```javascript
// 使用async/await避免阻塞UI
const result = await Filesystem.writeFile(...);
```

## 卸载插件

如果需要卸载Filesystem插件：

```bash
cd frontend
npm uninstall @capacitor/filesystem
npx cap sync android
npx cap sync ios
```

## 更新插件

更新到最新版本：

```bash
cd frontend
npm update @capacitor/filesystem
npx cap sync android
npx cap sync ios
```

## 相关文档

- [Capacitor Filesystem官方文档](https://capacitorjs.com/docs/apis/filesystem)
- [移动端文件系统实现文档](./mobile-filesystem-implementation.md)
- [快速开始指南](./mobile-file-access-quickstart.md)

## 技术支持

如果遇到问题：

1. 查看本文档的"常见问题"部分
2. 检查Capacitor版本兼容性
3. 查看控制台错误信息
4. 参考Capacitor官方文档

---

**提示**: 安装插件后，记得重新构建应用才能生效。
