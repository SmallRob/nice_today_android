#!/bin/bash

# Android应用构建脚本
# 将React应用打包为Android原生应用

echo "=== 生物节律助手 Android应用构建脚本 ==="

# 检查是否在frontend目录
if [ ! -f "package.json" ]; then
    echo "错误：请在frontend目录下运行此脚本"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "错误：请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "错误：请先安装npm"
    exit 1
fi

# 检查Android环境
if ! command -v adb &> /dev/null; then
    echo "警告：Android SDK未安装或未配置环境变量"
    echo "请安装Android Studio并配置ANDROID_HOME环境变量"
fi

echo "1. 安装依赖..."
npm install

# 检查Capacitor是否已初始化
if [ ! -f "capacitor.config.ts" ]; then
    echo "2. 初始化Capacitor..."
    npx cap init "生物节律助手" "com.biorhythm.app"
else
    echo "2. Capacitor已初始化"
fi

echo "3. 构建React应用..."
npm run build

echo "4. 添加Android平台..."
if [ ! -d "android" ]; then
    npx cap add android
fi

echo "5. 同步到Android项目..."
npx cap sync android

echo "6. 配置Android项目权限..."

# 配置AndroidManifest.xml（添加通知权限）
ANDROID_MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$ANDROID_MANIFEST" ]; then
    # 检查是否已包含通知权限
    if ! grep -q "android.permission.POST_NOTIFICATIONS" "$ANDROID_MANIFEST"; then
        echo "添加通知权限到AndroidManifest.xml..."
        # 在application标签前添加权限
        sed -i '/<application/a\    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />' "$ANDROID_MANIFEST"
    fi
fi

echo "7. 打开Android Studio..."
echo "请手动执行以下操作："
echo "- 在Android Studio中打开项目: android/"
echo "- 配置应用图标和启动画面"
echo "- 构建APK文件: Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "- 或直接运行到设备: Run > Run 'app'"

# 提供直接构建选项
echo ""
echo "可选：直接构建APK（需要Android SDK）"
read -p "是否直接构建APK? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v ./gradlew &> /dev/null; then
        cd android
        ./gradlew assembleDebug
        echo "APK文件生成在: android/app/build/outputs/apk/debug/"
        cd ..
    else
        echo "错误：gradlew未找到，请通过Android Studio构建"
    fi
fi

echo ""
echo "=== 构建完成 ==="
echo "Android应用构建步骤："
echo "1. 打开Android Studio"
echo "2. 导入项目: android/"
echo "3. 配置签名（发布版需要）"
echo "4. 构建APK或直接运行到设备"
echo ""
echo "通知功能说明："
echo "- 应用已配置为支持Android系统原生通知"
echo "- 定时通知会在后台正常运行"
echo "- 极值检测会触发系统级推送"
echo "- 支持Android 5.0+ 系统"