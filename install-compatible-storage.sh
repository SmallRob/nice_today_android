#!/bin/bash

# 安装与当前Capacitor版本兼容的存储插件

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
log_info "安装与当前Capacitor版本兼容的存储插件..."

# 进入前端目录
cd frontend

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    log_error "package.json不存在，请确保在正确的目录中运行此脚本"
    exit 1
fi

# 检查Capacitor版本
CAPACITOR_VERSION=$(grep -o '@capacitor/core.*"5\.' package.json | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
log_info "检测到Capacitor版本: $CAPACITOR_VERSION"

# 方案1：使用兼容的Preferences插件版本
log_info "方案1：安装兼容的Preferences插件版本..."
npm install @capacitor/preferences@5.0.6

# 检查是否安装成功
if [ $? -eq 0 ]; then
    log_info "兼容版Preferences插件安装成功"
else
    log_warn "兼容版Preferences插件安装失败，尝试方案2"
    
    # 方案2：使用旧版Storage插件（Capacitor 5.x兼容）
    log_info "方案2：安装旧版Storage插件..."
    npm install @capacitor/storage@5.0.6
    
    if [ $? -eq 0 ]; then
        log_info "Storage插件安装成功"
        
        # 更新存储管理器以使用Storage插件
        log_info "更新存储管理器以使用Storage插件..."
        sed -i.bak 's/@capacitor\/preferences/@capacitor\/storage/g' src/utils/enhancedStorageManager.js
        
        # 更新导入语句
        sed -i.bak 's/Preferences/Storage/g' src/utils/enhancedStorageManager.js
        
        log_info "存储管理器已更新"
    else
        log_error "Storage插件安装也失败了，尝试方案3"
        
        # 方案3：只使用localStorage（不安装任何插件）
        log_info "方案3：强制使用localStorage，不安装任何插件..."
        
        # 确保增强版存储管理器强制使用localStorage
        sed -i.bak 's/const FORCE_LOCAL_STORAGE = false;/const FORCE_LOCAL_STORAGE = true;/g' src/utils/enhancedStorageManager.js
        
        log_info "已强制使用localStorage"
    fi
fi

# 同步到原生平台
log_info "同步到原生平台..."
npx cap sync

# 检查是否成功安装了插件
if grep -q "@capacitor/preferences" package.json || grep -q "@capacitor/storage" package.json; then
    log_info "存储插件已安装"
    
    # 检查Android配置
    if [ -d "android" ]; then
        log_info "检查Android配置..."
        
        # 检查是否需要添加存储权限
        if ! grep -q "android.permission.READ_EXTERNAL_STORAGE" android/app/src/main/AndroidManifest.xml; then
            log_warn "需要添加存储权限到AndroidManifest.xml"
            
            # 添加存储权限
            sed -i.bak '/<uses-permission android:name="android.permission.INTERNET" \/>/a\\n    <!-- 存储权限 -->\n    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />' android/app/src/main/AndroidManifest.xml
            
            log_info "存储权限已添加"
        fi
    fi
else
    log_info "未安装存储插件，将使用localStorage"
fi

log_info "存储插件安装完成！"
log_info "您的应用现在应该能够正确读写本地配置与数据缓存文件"

echo ""
log_info "下一步操作:"
echo "1. 重新构建应用: npm run build"
echo "2. 同步到原生平台: npx cap sync"
echo "3. 构建Android应用: ./build-android.sh"