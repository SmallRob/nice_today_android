#!/bin/bash

# 测试本地存储功能的脚本

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

# 脚本开始
log_info "开始测试本地存储功能..."

# 检查项目目录
if [ ! -d "frontend" ]; then
    log_error "前端目录不存在，请确保在正确的目录中运行此脚本"
    exit 1
fi

# 检查是否有设备连接
log_info "检查连接的设备..."
adb devices | grep -q "device$"

if [ $? -ne 0 ]; then
    log_warn "没有连接的设备，将跳过设备测试"
    DEVICE_CONNECTED=false
else
    log_info "发现连接的设备"
    DEVICE_CONNECTED=true
fi

# 步骤1：构建应用
log_test "步骤1：构建应用"
cd frontend
npm run build

if [ $? -eq 0 ]; then
    log_info "应用构建成功"
else
    log_error "应用构建失败"
    exit 1
fi

# 步骤2：同步到Android
log_test "步骤2：同步到Android平台"
npx cap sync android

if [ $? -eq 0 ]; then
    log_info "同步成功"
else
    log_error "同步失败"
    exit 1
fi

# 步骤3：构建Android应用
log_test "步骤3：构建Android应用"
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    log_info "Android应用构建成功"
else
    log_error "Android应用构建失败"
    exit 1
fi

# 步骤4：安装应用（如果有设备）
if [ "$DEVICE_CONNECTED" = true ]; then
    log_test "步骤4：安装应用到设备"
    adb install -r app/build/outputs/apk/debug/app-debug.apk
    
    if [ $? -eq 0 ]; then
        log_info "应用安装成功"
    else
        log_error "应用安装失败"
        exit 1
    fi
    
    # 步骤5：授予权限
    log_test "步骤5：授予存储权限"
    adb shell pm grant com.nicetoday.app android.permission.READ_EXTERNAL_STORAGE
    adb shell pm grant com.nicetoday.app android.permission.WRITE_EXTERNAL_STORAGE
    
    # 步骤6：启动应用
    log_test "步骤6：启动应用"
    adb shell am start -n com.nicetoday.app/.MainActivity
    
    log_info "应用已启动，请手动测试存储功能"
    log_info "测试步骤："
    echo "1. 设置用户生肖和出生年份"
    echo "2. 切换到其他页面"
    echo "3. 返回主页，检查数据是否保留"
    echo "4. 关闭应用并重新打开，检查数据是否持久化"
    
    # 等待用户测试
    read -p "测试完成后按Enter继续..."
    
    # 步骤7：检查日志
    log_test "步骤7：检查应用日志"
    echo "最近的存储相关日志："
    adb logcat -d | grep -i "storage\|preferences\|nice_today_app" | tail -20
else
    log_warn "跳过设备测试，因为没有连接的设备"
    log_info "请手动测试Web版本的存储功能"
    log_info "测试步骤："
    echo "1. 运行 'npm start' 启动开发服务器"
    echo "2. 在浏览器中打开应用"
    echo "3. 设置用户生肖和出生年份"
    echo "4. 刷新页面，检查数据是否保留"
fi

# 步骤8：检查存储权限状态
log_test "步骤8：检查存储权限状态"

if [ "$DEVICE_CONNECTED" = true ]; then
    echo "存储权限状态："
    adb shell dumpsys package com.nicetoday.app | grep -A 5 "declared permissions"
    
    echo "运行时权限状态："
    adb shell dumpsys package com.nicetoday.app | grep -A 10 "runtime permissions"
fi

# 步骤9：生成测试报告
log_test "步骤9：生成测试报告"
REPORT_FILE="storage-test-report-$(date +%Y%m%d-%H%M%S).txt"

cat > $REPORT_FILE << EOF
本地存储功能测试报告
====================

测试时间: $(date)
测试设备: $([ "$DEVICE_CONNECTED" = true ] && echo "已连接设备" || echo "无连接设备")

应用配置:
- 应用ID: com.nicetoday.app
- 最小SDK版本: 22
- 目标SDK版本: 33

权限配置:
- READ_EXTERNAL_STORAGE: 已声明
- WRITE_EXTERNAL_STORAGE: 已声明
- INTERNET: 已声明
- ACCESS_NETWORK_STATE: 已声明
- VIBRATE: 已声明
- POST_NOTIFICATIONS: 已声明

存储配置:
- 使用localStorage: 是
- 使用Capacitor Preferences: $([ -f "frontend/node_modules/@capacitor/preferences" ] && echo "已安装" || echo "未安装")
- 使用增强版存储管理器: $([ -f "frontend/src/utils/enhancedStorageManager.js" ] && echo "是" || echo "否")

测试结果:
- 应用构建: 成功
- Android构建: 成功
- 设备安装: $([ "$DEVICE_CONNECTED" = true ] && echo "成功" || echo "跳过")

建议:
EOF

if [ -f "frontend/src/utils/storageManager.js.backup" ]; then
    echo "- 原始storageManager.js已备份" >> $REPORT_FILE
fi

if [ -f "frontend/src/utils/enhancedStorageManager.js" ]; then
    echo "- 增强版存储管理器已创建" >> $REPORT_FILE
fi

log_info "测试报告已生成: $REPORT_FILE"

# 完成
log_info "本地存储功能测试完成！"

if [ "$DEVICE_CONNECTED" = true ]; then
    log_info "如果测试失败，请检查："
    echo "1. 设备是否有足够的存储空间"
    echo "2. 应用是否有必要的权限"
    echo "3. 设备是否支持应用的最低SDK版本"
else
    log_info "如需完整测试，请连接Android设备并重新运行此脚本"
fi