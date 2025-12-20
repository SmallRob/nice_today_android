#!/bin/bash

# 轻量版APK构建脚本

echo "开始构建轻量版APK..."

# 设置环境变量以启用轻量版构建
export BUILD_LITE_VERSION=true

# 构建React应用
echo "正在构建React应用..."
cd frontend
npm run build

# 检查构建是否成功
if [ $? -ne 0 ]; then
    echo "React应用构建失败!"
    exit 1
fi

echo "React应用构建成功!"

# 同步到Android项目
echo "正在同步到Android项目..."
npx cap sync android

# 检查同步是否成功
if [ $? -ne 0 ]; then
    echo "同步到Android项目失败!"
    exit 1
fi

echo "同步到Android项目成功!"

# 构建APK
echo "正在构建APK..."
cd ../android
./gradlew assembleDebug

# 检查APK构建是否成功
if [ $? -ne 0 ]; then
    echo "APK构建失败!"
    exit 1
fi

echo "APK构建成功!"
echo "轻量版APK已构建完成，位于 android/app/build/outputs/apk/debug/app-debug.apk"

exit 0