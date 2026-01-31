#!/bin/bash

# 安装Capacitor Preferences插件的脚本
# 用于确保应用在本地和原生环境中都能正确读写本地配置与数据缓存

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 脚本开始
log_info "安装Capacitor Preferences插件..."

# 进入前端目录
cd frontend

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    log_error "package.json不存在，请确保在正确的目录中运行此脚本"
    exit 1
fi

# 检查是否已经安装了Preferences插件
if grep -q "@capacitor/preferences" package.json; then
    log_warn "@capacitor/preferences已经安装，跳过安装步骤"
else
    log_info "安装@capacitor/preferences插件..."
    npm install @capacitor/preferences
    log_info "Preferences插件安装完成"
fi

# 检查是否已经安装了Storage插件（如果存在）
if grep -q "@capacitor/storage" package.json; then
    log_warn "@capacitor/storage已经安装，但已被Preferences插件替代"
    log_warn "建议移除@capacitor/storage并使用Preferences插件"
    read -p "是否要移除@capacitor/storage? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm uninstall @capacitor/storage
        log_info "@capacitor/storage已移除"
    fi
fi

# 同步到原生平台
log_info "同步到原生平台..."
npx cap sync

# 检查Android项目
if [ -d "android" ]; then
    log_info "检查Android项目配置..."
    
    # 检查AndroidManifest.xml是否有权限声明
    if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
        if grep -q "android.permission.WRITE_EXTERNAL_STORAGE" android/app/src/main/AndroidManifest.xml; then
            log_info "Android存储权限已配置"
        else
            log_warn "Android存储权限未配置，可能需要手动添加"
        fi
    else
        log_warn "AndroidManifest.xml不存在，可能需要手动配置权限"
    fi
fi

# 检查iOS项目
if [ -d "ios" ]; then
    log_info "检查iOS项目配置..."
    
    # 检查Info.plist是否有权限声明
    if [ -f "ios/App/App/Info.plist" ]; then
        if grep -q "NSDocumentsFolderUsageDescription" ios/App/App/Info.plist; then
            log_info "iOS存储权限已配置"
        else
            log_warn "iOS存储权限未配置，可能需要手动添加"
        fi
    else
        log_warn "Info.plist不存在，可能需要手动配置权限"
    fi
fi

log_info "存储依赖安装完成！"
log_info "您现在可以使用enhancedStorageManager来读写本地配置与数据缓存"

echo ""
log_info "下一步操作:"
echo "1. 更新代码以使用enhancedStorageManager而不是storageManager"
echo "2. 重新构建应用: npm run build"
echo "3. 同步到原生平台: npx cap sync"
echo "4. 构建Android应用: ./build-android.sh"