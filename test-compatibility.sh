#!/bin/bash

# Android应用兼容性测试脚本
# 使用方法: ./test-compatibility.sh [选项]

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
log_info "开始Android应用兼容性测试..."

# 检查Android环境
if [ -z "$ANDROID_HOME" ]; then
    log_error "ANDROID_HOME环境变量未设置"
    exit 1
fi

# 检查adb
if ! command -v adb &> /dev/null; then
    log_error "adb命令不可用，请确保已安装Android SDK"
    exit 1
fi

# 设置路径变量
FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/frontend" && pwd)"
ANDROID_DIR="$FRONTEND_DIR/android"

# 检查Android项目是否存在
if [ ! -d "$ANDROID_DIR" ]; then
    log_error "Android项目不存在，请先运行构建脚本"
    exit 1
fi

# 解析命令行参数
TEST_TYPE="basic"
DEVICE_SPECIFIC=false
SPECIFIC_DEVICE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --full)
            TEST_TYPE="full"
            shift
            ;;
        --device)
            DEVICE_SPECIFIC=true
            SPECIFIC_DEVICE="$2"
            shift 2
            ;;
        --help)
            echo "使用方法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --full         执行完整测试套件"
            echo "  --device <ID>  在特定设备上测试"
            echo "  --help         显示帮助信息"
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            exit 1
            ;;
    esac
done

# 获取连接的设备列表
get_connected_devices() {
    echo $(adb devices | grep -v "List of devices" | grep "device$" | awk '{print $1}')
}

# 测试设备是否响应
test_device_responsiveness() {
    local device_id=$1
    log_test "测试设备响应性: $device_id"
    
    # 测试基本连接
    if adb -s "$device_id" shell echo "Device is responsive" > /dev/null 2>&1; then
        log_info "✓ 设备响应正常"
        return 0
    else
        log_error "✗ 设备无响应"
        return 1
    fi
}

# 获取设备信息
get_device_info() {
    local device_id=$1
    log_test "获取设备信息: $device_id"
    
    local api_level=$(adb -s "$device_id" shell getprop ro.build.version.sdk)
    local android_version=$(adb -s "$device_id" shell getprop ro.build.version.release)
    local device_model=$(adb -s "$device_id" shell getprop ro.product.model)
    local device_manufacturer=$(adb -s "$device_id" shell getprop ro.product.manufacturer)
    local screen_density=$(adb -s "$device_id" shell getprop ro.sf.lcd_density)
    local screen_resolution=$(adb -s "$device_id" shell wm size | grep -o '[0-9]*x[0-9]*')
    
    echo "设备型号: $device_manufacturer $device_model"
    echo "Android版本: $android_version (API $api_level)"
    echo "屏幕密度: $screen_density dpi"
    echo "屏幕分辨率: $screen_resolution"
}

# 检查WebView版本
check_webview_version() {
    local device_id=$1
    log_test "检查WebView版本: $device_id"
    
    local webview_version=$(adb -s "$device_id" shell dumpsys package com.google.android.webview | grep -m 1 "versionName" | awk '{print $2}')
    
    if [ -n "$webview_version" ]; then
        log_info "WebView版本: $webview_version"
        
        # 检查版本是否满足最低要求
        local major_version=$(echo "$webview_version" | cut -d. -f1)
        if [ "$major_version" -ge 65 ]; then
            log_info "✓ WebView版本满足最低要求"
            return 0
        else
            log_warn "⚠ WebView版本可能不满足应用要求"
            return 1
        fi
    else
        log_warn "无法获取WebView版本信息"
        return 1
    fi
}

# 检查系统更新
check_system_update() {
    local device_id=$1
    log_test "检查系统更新: $device_id"
    
    # 这个检查在不同Android版本上可能有不同的结果
    if adb -s "$device_id" shell command -v "checkfstrim" > /dev/null 2>&1; then
        log_info "系统更新检查功能可用"
    else
        log_info "无法检查系统更新状态"
    fi
}

# 安装应用
install_app() {
    local device_id=$1
    local apk_path=$2
    log_test "安装应用到设备: $device_id"
    
    if adb -s "$device_id" install -r "$apk_path" > /dev/null 2>&1; then
        log_info "✓ 应用安装成功"
        return 0
    else
        log_error "✗ 应用安装失败"
        return 1
    fi
}

# 运行应用并收集日志
run_app_and_collect_logs() {
    local device_id=$1
    local package_name=$2
    log_test "运行应用并收集日志: $device_id"
    
    # 清除之前的日志
    adb -s "$device_id" logcat -c
    
    # 启动应用
    adb -s "$device_id" shell monkey -p "$package_name" -c android.intent.category.LAUNCHER 1 > /dev/null 2>&1
    
    # 等待应用启动
    sleep 5
    
    # 收集日志
    local log_file="${package_name}_$(date +%Y%m%d_%H%M%S).log"
    log_info "收集日志到文件: $log_file"
    
    adb -s "$device_id" logcat -d | grep "$package_name" > "$log_file"
    
    # 检查是否有严重错误
    local error_count=$(grep -c "FATAL\|AndroidRuntime" "$log_file" || echo "0")
    if [ "$error_count" -gt 0 ]; then
        log_warn "⚠ 发现 $error_count 个严重错误"
        return 1
    else
        log_info "✓ 未发现严重错误"
        return 0
    fi
}

# 测试应用性能
test_app_performance() {
    local device_id=$1
    local package_name=$2
    log_test "测试应用性能: $device_id"
    
    # 获取应用内存使用情况
    local memory_info=$(adb -s "$device_id" shell dumpsys meminfo "$package_name" | grep -A 1 "TOTAL" | tail -1)
    log_info "内存使用情况: $memory_info"
    
    # 获取CPU使用情况（需要root权限或特定的Android版本）
    log_info "CPU使用情况需要进一步检查"
}

# 测试应用在不同屏幕尺寸上的显示
test_screen_display() {
    local device_id=$1
    log_test "测试屏幕显示: $device_id"
    
    # 这个测试需要在应用中进行，这里只能提供基本信息
    local screen_orientation=$(adb -s "$device_id" shell dumpsys input | grep "SurfaceOrientation" | awk '{print $2}')
    
    if [ "$screen_orientation" = "0" ]; then
        log_info "当前屏幕方向: 竖屏"
    elif [ "$screen_orientation" = "1" ]; then
        log_info "当前屏幕方向: 横屏"
    else
        log_info "无法确定屏幕方向"
    fi
}

# 测试网络功能
test_network_functionality() {
    local device_id=$1
    log_test "测试网络功能: $device_id"
    
    # 测试网络连接
    if adb -s "$device_id" shell ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        log_info "✓ 网络连接正常"
        return 0
    else
        log_warn "⚠ 网络连接可能有问题"
        return 1
    fi
}

# 测试权限处理
test_permissions() {
    local device_id=$1
    local package_name=$2
    log_test "测试权限处理: $device_id"
    
    # 获取应用权限
    local permissions=$(adb -s "$device_id" shell dumpsys package "$package_name" | grep "declared permissions")
    log_info "应用声明的权限: $permissions"
    
    # 检查是否有关键权限
    if echo "$permissions" | grep -q "CAMERA\|READ_EXTERNAL_STORAGE\|ACCESS_FINE_LOCATION"; then
        log_info "应用包含需要用户授权的权限"
    fi
}

# 主测试流程
run_tests() {
    local devices=($(get_connected_devices))
    local package_name="com.biorhythm.app"  # 根据您的应用包名修改
    
    if [ ${#devices[@]} -eq 0 ]; then
        log_error "没有连接的设备"
        exit 1
    fi
    
    log_info "找到 ${#devices[@]} 个连接的设备: ${devices[*]}"
    
    # 确定要测试的设备
    local test_devices=()
    if [ "$DEVICE_SPECIFIC" = true ]; then
        test_devices=("$SPECIFIC_DEVICE")
    else
        test_devices=("${devices[@]}")
    fi
    
    # APK路径
    local debug_apk="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
    local release_apk="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
    local apk_path=""
    
    if [ -f "$debug_apk" ]; then
        apk_path="$debug_apk"
    elif [ -f "$release_apk" ]; then
        apk_path="$release_apk"
    else
        log_error "未找到APK文件，请先构建应用"
        exit 1
    fi
    
    # 对每个设备运行测试
    for device in "${test_devices[@]}"; do
        log_info "======================================"
        log_info "开始测试设备: $device"
        log_info "======================================"
        
        # 基础测试
        test_device_responsiveness "$device"
        get_device_info "$device"
        check_webview_version "$device"
        
        # 完整测试
        if [ "$TEST_TYPE" = "full" ]; then
            check_system_update "$device"
            install_app "$device" "$apk_path"
            run_app_and_collect_logs "$device" "$package_name"
            test_app_performance "$device" "$package_name"
            test_screen_display "$device"
            test_network_functionality "$device"
            test_permissions "$device" "$package_name"
        fi
        
        log_info "设备 $device 测试完成"
    done
}

# 运行测试
run_tests

log_info "兼容性测试完成"