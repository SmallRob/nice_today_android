#!/bin/bash

# 统一的App构建脚本
echo "开始构建Nice Today应用..."

# 设置Java环境变量（如果需要）
# export JAVA_HOME=/usr/lib/jvm/java-17-openjdk

# 进入前端目录
cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend

# 安装依赖
echo "安装npm依赖..."
npm install

# 构建React应用
echo "构建React应用..."
npm run build

# 同步到Android
echo "同步到Android项目..."
npx cap sync android

# 构建Android应用
echo "构建Android应用..."
npx cap build android

echo "构建完成！APK文件位于: frontend/android/app/build/outputs/apk/release/"
