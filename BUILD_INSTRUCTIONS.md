# Nice Today 应用构建和部署说明

## 问题分析

应用无法打开的主要原因是版本依赖冲突和Java版本兼容性问题：

1. **包名不一致**：AndroidManifest.xml与MainActivity.java中的包名不匹配
2. **依赖版本冲突**：根目录与前端目录中使用的Capacitor版本不一致
3. **Java版本兼容性**：Gradle 8.0.2与Java 20不兼容，需要使用Java 17
4. **Gradle版本问题**：需要使用与Java 17兼容的Gradle版本

## 已修复的问题

1. ✅ 统一了Android应用的包名为`com.nicetoday.app`
2. ✅ 统一了Capacitor版本为5.7.8
3. ✅ 降级Gradle版本以提高兼容性
4. ✅ 修复了JSON格式错误
5. ✅ 配置了正确的Java环境变量

## 构建步骤

### 1. Web应用构建

```bash
# 进入项目根目录
cd /Users/healer2027/AndroidStudioProjects/nice_today_android

# 运行Web构建脚本
./build-app.sh
```

此脚本将：
- 安装npm依赖
- 构建React应用
- 同步资源到Android项目

### 2. Android应用构建

有两种方式构建Android应用：

#### 方式一：使用Android Studio（推荐）

1. 打开Android Studio
2. 选择"Open an existing Android Studio project"
3. 选择项目路径：`/Users/healer2027/AndroidStudioProjects/nice_today_android/frontend/android`
4. 等待Gradle同步完成
5. 点击"Build" -> "Build Bundle(s) / APK(s)" -> "Build APK"
6. 构建完成后点击通知中的"locate"查看APK位置

#### 方式二：使用命令行

```bash
# 进入Android项目目录
cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend/android

# 设置Java环境变量
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# 构建Debug版本APK
./gradlew assembleDebug

# 或构建Release版本APK
./gradlew assembleRelease
```

构建完成的APK位置：
- Debug版本：`frontend/android/app/build/outputs/apk/debug/app-debug.apk`
- Release版本：`frontend/android/app/build/outputs/apk/release/app-release.apk`

## 部署到设备

### 1. 通过USB连接部署

```bash
# 确保设备已开启开发者选项和USB调试
# 查看连接的设备
adb devices

# 安装APK
adb install frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### 2. 通过Capacitor命令部署

```bash
# 进入前端目录
cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend

# 列出可用的设备和模拟器
npx cap run android --list

# 部署到指定设备（替换DEVICE_NAME为实际设备名）
npx cap run android --target DEVICE_NAME
```

## 常见问题解决

### 1. Java版本问题

如果遇到"Unsupported class file major version"错误，请确保使用Java 17：

```bash
# 检查Java版本
java -version

# 设置Java 17环境变量
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

### 2. Gradle缓存问题

如果构建失败，可以清理Gradle缓存：

```bash
# 进入Android项目目录
cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend/android

# 清理项目
./gradlew clean

# 重新构建
./gradlew assembleDebug
```

### 3. 依赖问题

如果遇到依赖问题，可以重新安装依赖：

```bash
# 进入前端目录
cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend

# 删除node_modules
rm -rf node_modules

# 重新安装依赖
npm install
```

## 功能验证

构建完成后，应用应具备以下功能：

1. ✅ 启动时显示数据使用策略弹窗
2. ✅ 可在设置界面更改API服务地址
3. ✅ 可启用/禁用本地计算功能
4. ✅ 正确显示应用图标
5. ✅ 生物节律计算功能正常
6. ✅ 玛雅历法显示正常
7. ✅ 穿搭建议功能正常

如需进一步验证功能，请在设备上运行应用并逐一测试各项功能。