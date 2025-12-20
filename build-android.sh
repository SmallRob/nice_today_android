#!/bin/bash

# Android应用构建脚本
echo "开始构建Android应用..."

# 设置Java环境变量
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# 进入前端目录 (Windows兼容路径)
cd "e:/WorkSource/nice_today_android/frontend" || { echo "无法进入前端目录"; exit 1; }

# 同步Web资源到Android项目
echo "同步Web资源到Android项目..."
npx cap sync android

# 使用Android Studio构建
echo "请使用Android Studio打开项目并构建APK:"
echo "项目路径: /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend/android"
echo ""
echo "或者在终端中运行以下命令:"
echo "cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend/android"
echo "./gradlew assembleDebug"

echo "构建脚本执行完成！"