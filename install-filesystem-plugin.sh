#!/bin/bash

# 安装Capacitor Filesystem插件脚本
# 用于支持Android/iOS WebView中的文件保存和导入功能

echo "========================================="
echo "安装Capacitor Filesystem插件"
echo "========================================="
echo ""

# 进入frontend目录
cd frontend || exit 1

echo "步骤1: 安装@capacitor/filesystem依赖..."
npm install @capacitor/filesystem@^5.0.8

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"
echo ""

echo "步骤2: 同步Capacitor到Android平台..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Android同步失败"
    exit 1
fi

echo "✅ Android同步成功"
echo ""

echo "步骤3: 同步Capacitor到iOS平台..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ iOS同步失败"
    exit 1
fi

echo "✅ iOS同步成功"
echo ""

echo "========================================="
echo "✅ 安装完成！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 重新构建应用: npm run build"
echo "2. 在Android Studio中打开项目: npm run android"
echo "3. 或在Xcode中打开项目: npm run ios"
echo ""
echo "注意事项："
echo "- Android需要在AndroidManifest.xml中添加存储权限（自动添加）"
echo "- iOS不需要额外配置"
echo "- 首次使用时，应用会请求存储权限"
echo ""
