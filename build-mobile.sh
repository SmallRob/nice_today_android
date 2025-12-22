#!/bin/bash

# 构建移动应用脚本 (支持Android和iOS)
# 使用方法: ./build-mobile.sh [选项]

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

log_debug() {
    if [ "$DEBUG" = "true" ]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Android特定函数
check_android_environment() {
    log_debug "检查Android环境..."
    
    if [ -z "$ANDROID_HOME" ]; then
        log_warn "ANDROID_HOME环境变量未设置，尝试查找Android SDK..."
        
        # 常见Android SDK位置
        POSSIBLE_SDK_LOCATIONS=(
            "$HOME/Library/Android/sdk"
            "$HOME/Android/Sdk"
            "/usr/local/android-sdk"
            "/opt/android-sdk"
        )
        
        for location in "${POSSIBLE_SDK_LOCATIONS[@]}"; do
            if [ -d "$location" ]; then
                export ANDROID_HOME="$location"
                log_info "找到Android SDK: $ANDROID_HOME"
                break
            fi
        done
        
        if [ -z "$ANDROID_HOME" ]; then
            log_error "未找到Android SDK，请设置ANDROID_HOME环境变量"
            exit 1
        fi
    fi
    
    # 检查Java环境
    if ! command -v java &> /dev/null; then
        log_error "Java未安装，请先安装Java"
        exit 1
    fi
    
    log_debug "Android环境检查完成"
}

build_android_app() {
    log_debug "开始构建Android应用..."
    cd android
    
    if [ "$BUILD_TYPE" = "release" ]; then
        log_info "正在构建发布版Android应用..."
        ./gradlew assembleRelease
        
        if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
            log_info "发布版APK构建成功: app/build/outputs/apk/release/app-release.apk"
        else
            log_error "发布版APK构建失败"
            exit 1
        fi
    else
        log_info "正在构建调试版Android应用..."
        ./gradlew assembleDebug
        
        if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
            log_info "调试版APK构建成功: app/build/outputs/apk/debug/app-debug.apk"
        else
            log_error "调试版APK构建失败"
            exit 1
        fi
    fi
    
    # 安装到设备（如果指定了设备）
    if [ "$TARGET" != "all" ]; then
        log_info "正在安装APK到设备: $TARGET"
        
        if [ "$BUILD_TYPE" = "release" ]; then
            adb -s "$TARGET" install -r app/build/outputs/apk/release/app-release.apk
        else
            adb -s "$TARGET" install -r app/build/outputs/apk/debug/app-debug.apk
        fi
        
        log_info "APK已安装到设备"
    fi
    
    # 列出可用的设备
    echo ""
    log_info "可用的设备:"
    adb devices
}

# iOS特定函数
check_ios_environment() {
    log_debug "检查iOS环境..."
    
    # 检查Xcode
    if ! command -v xcodebuild &> /dev/null; then
        log_error "Xcode未安装，请先安装Xcode"
        exit 1
    fi
    
    # 检查Xcode命令行工具
    xcode_version=$(xcodebuild -version 2>&1 | head -1)
    log_info "Xcode版本: $xcode_version"
    
    # 检查iOS模拟器
    if ! command -v simctl &> /dev/null; then
        log_error "iOS模拟器不可用"
        exit 1
    fi
    
    log_debug "iOS环境检查完成"
}

build_ios_app() {
    log_debug "开始构建iOS应用..."
    
    if [ "$BUILD_TYPE" = "release" ]; then
        log_info "正在构建发布版iOS应用..."
        xcodebuild -workspace ios/App/App.xcworkspace \
                   -scheme App \
                   -configuration Release \
                   -destination generic/platform=iOS \
                   -archivePath ios/App/App.xcarchive \
                   archive
        
        log_info "发布版应用构建完成: ios/App/App.xcarchive"
    else
        log_info "正在构建调试版iOS应用..."
        xcodebuild -workspace ios/App/App.xcworkspace \
                   -scheme App \
                   -configuration Debug \
                   -destination generic/platform=iOS \
                   build
                   
        log_info "调试版应用构建完成"
    fi
    
    # 列出可用的设备
    echo ""
    log_info "可用的设备:"
    xcrun simctl list devices | grep -E "iPhone|iPad" | grep -E "Booted|Shutdown"
}

# 脚本开始
log_info "开始构建移动应用..."

# 设置默认值
PLATFORM="android"  # 默认平台
BUILD_TYPE="debug"
TARGET="all"
SYNC_ONLY=false
SKIP_BUILD=false
OPEN_IDE=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case "$1" in
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --android)
            PLATFORM="android"
            shift
            ;;
        --ios)
            PLATFORM="ios"
            shift
            ;;
        --release)
            BUILD_TYPE="release"
            shift
            ;;
        --debug)
            BUILD_TYPE="debug"
            shift
            ;;
        --sync-only)
            SYNC_ONLY=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --target=*)
            TARGET="${1#*=}"
            shift
            ;;
        --open)
            OPEN_IDE=true
            shift
            ;;
        --debug-log)
            DEBUG="true"
            shift
            ;;
        --help)
            echo "使用方法: $0 [选项]"
            echo ""
            echo "平台选项:"
            echo "  --platform <platform>  指定平台 (android/ios)"
            echo "  --android              构建Android版本"
            echo "  --ios                  构建iOS版本"
            echo ""
            echo "构建选项:"
            echo "  --release              构建发布版本"
            echo "  --debug                构建调试版本（默认）"
            echo "  --sync-only            仅同步代码，不构建"
            echo "  --skip-build           跳过React构建步骤"
            echo "  --open                 构建完成后打开IDE"
            echo ""
            echo "设备选项:"
            echo "  --target=<设备>        指定目标设备（设备ID）"
            echo ""
            echo "调试选项:"
            echo "  --debug-log            启用详细日志"
            echo "  --help                 显示帮助信息"
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            exit 1
            ;;
    esac
done

# 检查Node.js和npm
if ! command -v node &> /dev/null; then
    log_error "Node.js未安装，请先安装Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm未安装，请先安装npm"
    exit 1
fi

# 设置路径变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
log_info "前端项目目录: $FRONTEND_DIR"

# 进入前端目录
cd "$FRONTEND_DIR"

# 检查是否已经安装了Capacitor
if [ ! -f "capacitor.config.ts" ]; then
    log_error "Capacitor配置文件不存在，请先运行npx cap init"
    exit 1
fi

# 检查平台是否已添加
if [ ! -d "$PLATFORM" ]; then
    log_warn "$PLATFORM 平台未添加，正在添加..."
    npx cap add "$PLATFORM"
    log_info "$PLATFORM 平台已添加"
fi

# 构建React应用
if [ "$SKIP_BUILD" = false ]; then
    log_info "正在构建React应用..."
    
    # 先安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        log_info "安装项目依赖..."
        npm install
    fi
    
    # 构建生产版本
    npm run build
    
    log_info "React应用构建完成"
fi

# 同步代码到平台项目
log_info "正在同步代码到 $PLATFORM 项目..."
npx cap sync "$PLATFORM"

if [ "$SYNC_ONLY" = true ]; then
    log_info "同步完成"
    exit 0
fi

# 平台特定构建
if [ "$PLATFORM" = "android" ]; then
    # 检查Android环境
    check_android_environment
    
    # 构建Android应用
    build_android_app
    
    # 打开IDE（如果请求）
    if [ "$OPEN_IDE" = true ]; then
        npx cap open android
    fi
    
elif [ "$PLATFORM" = "ios" ]; then
    # 检查iOS环境
    check_ios_environment
    
    # 构建iOS应用
    build_ios_app
    
    # 打开IDE（如果请求）
    if [ "$OPEN_IDE" = true ]; then
        npx cap open ios
    fi
fi

log_info "$PLATFORM 应用构建完成！"

# 提示下一步操作
echo ""
log_info "下一步操作:"
if [ "$PLATFORM" = "android" ]; then
    echo "1. 要在模拟器中运行，使用: npx cap run android"
    echo "2. 要在Android Studio中打开项目，使用: npx cap open android"
    echo "3. 要运行到特定设备，使用: npx cap run android --target=<设备ID>"
elif [ "$PLATFORM" = "ios" ]; then
    echo "1. 要在模拟器中运行，使用: npx cap run ios"
    echo "2. 要在Xcode中打开项目，使用: npx cap open ios"
    echo "3. 要运行到特定设备，使用: npx cap run ios --target=<设备ID>"
fi
