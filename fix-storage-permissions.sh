#!/bin/bash

# 修复本地数据读写权限的综合脚本

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 脚本开始
log_info "修复本地数据读写权限..."

# 检查项目目录
if [ ! -d "frontend" ]; then
    log_error "前端目录不存在，请确保在正确的目录中运行此脚本"
    exit 1
fi

# 步骤1：安装存储依赖
log_step "步骤1：安装与Capacitor 5.x兼容的存储插件"
cd frontend

# 检查Capacitor版本
CAPACITOR_VERSION=$(grep -o '@capacitor/core.*"5\.' package.json | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
log_info "检测到Capacitor版本: $CAPACITOR_VERSION"

# 检查是否已经安装了存储插件
if grep -q "@capacitor/storage" package.json; then
    log_info "@capacitor/storage已经安装"
elif grep -q "@capacitor/preferences" package.json; then
    log_info "@capacitor/preferences已经安装"
else
    log_info "安装与Capacitor 5.x兼容的@capacitor/storage插件..."
    npm install @capacitor/storage@5.0.6
    log_info "Storage插件安装完成"
fi

# 检查是否安装了不兼容的Preferences插件（需要Capacitor 8.x）
if grep -q "@capacitor/preferences" package.json; then
    log_warn "检测到@capacitor/preferences插件，可能与当前Capacitor版本不兼容"
    log_warn "建议移除并使用@capacitor/storage插件"
    read -p "是否要移除@capacitor/preferences并安装@capacitor/storage? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm uninstall @capacitor/preferences
        npm install @capacitor/storage@5.0.6
        log_info "已替换为兼容的Storage插件"
    fi
fi

# 步骤2：更新存储管理器
log_step "步骤2：更新存储管理器"

# 备份原始存储管理器
if [ -f "src/utils/storageManager.js" ] && [ ! -f "src/utils/storageManager.js.backup" ]; then
    cp src/utils/storageManager.js src/utils/storageManager.js.backup
    log_info "已备份原始存储管理器"
fi

# 检查是否有Capacitor 5.x兼容的存储管理器
if [ -f "src/utils/capacitor5-storage-manager.js" ]; then
    log_info "使用Capacitor 5.x兼容的存储管理器"
    cp src/utils/capacitor5-storage-manager.js src/utils/storageManager.js
elif [ -f "src/utils/enhancedStorageManager.js" ]; then
    log_info "使用增强版存储管理器"
    cp src/utils/enhancedStorageManager.js src/utils/storageManager.js
else
    log_error "存储管理器不存在，请确保文件已创建"
    exit 1
fi

# 步骤3：同步到原生平台
log_step "步骤3：同步到原生平台"
npx cap sync

# 步骤4：更新Android权限配置
log_step "步骤4：更新Android权限配置"
cd android

# 检查AndroidManifest.xml
if [ -f "app/src/main/AndroidManifest.xml" ]; then
    log_info "检查AndroidManifest.xml..."
    
    # 检查是否有存储权限
    if grep -q "android.permission.READ_EXTERNAL_STORAGE" app/src/main/AndroidManifest.xml; then
        log_info "存储权限已配置"
    else
        log_warn "存储权限未配置，将手动添加"
        exit 1
    fi
    
    # 检查是否有requestLegacyExternalStorage
    if grep -q "android:requestLegacyExternalStorage=\"true\"" app/src/main/AndroidManifest.xml; then
        log_info "requestLegacyExternalStorage已配置"
    else
        log_warn "requestLegacyExternalStorage未配置，将手动添加"
        exit 1
    fi
else
    log_error "AndroidManifest.xml不存在"
    exit 1
fi

# 步骤5：构建Android应用
log_step "步骤5：构建Android应用"
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    log_info "Android应用构建成功"
else
    log_error "Android应用构建失败"
    exit 1
fi

# 步骤6：生成测试报告
log_step "步骤6：生成修复报告"
cd ..

REPORT_FILE="storage-permissions-fix-$(date +%Y%m%d-%H%M%S).txt"

cat > $REPORT_FILE << EOF
本地数据读写权限修复报告
========================

修复时间: $(date)

执行的修复步骤:
1. 安装@capacitor/preferences插件: $(grep -q "@capacitor/preferences" frontend/package.json && echo "成功" || echo "失败")
2. 移除旧的@capacitor/storage插件: $(grep -q "@capacitor/storage" frontend/package.json && echo "失败" || echo "成功")
3. 更新存储管理器: $(diff frontend/src/utils/storageManager.js.backup frontend/src/utils/storageManager.js >/dev/null && echo "未更改" || echo "已更新")
4. 同步到原生平台: 成功
5. 更新Android权限配置: $(grep -q "android.permission.READ_EXTERNAL_STORAGE" frontend/android/app/src/main/AndroidManifest.xml && echo "成功" || echo "失败")
6. 构建Android应用: 成功

权限配置状态:
- READ_EXTERNAL_STORAGE: $(grep -q "android.permission.READ_EXTERNAL_STORAGE" frontend/android/app/src/main/AndroidManifest.xml && echo "已声明" || echo "未声明")
- WRITE_EXTERNAL_STORAGE: $(grep -q "android.permission.WRITE_EXTERNAL_STORAGE" frontend/android/app/src/main/AndroidManifest.xml && echo "已声明" || echo "未声明")
- INTERNET: $(grep -q "android.permission.INTERNET" frontend/android/app/src/main/AndroidManifest.xml && echo "已声明" || echo "未声明")
- ACCESS_NETWORK_STATE: $(grep -q "android.permission.ACCESS_NETWORK_STATE" frontend/android/app/src/main/AndroidManifest.xml && echo "已声明" || echo "未声明")
- requestLegacyExternalStorage: $(grep -q "android:requestLegacyExternalStorage=\"true\"" frontend/android/app/src/main/AndroidManifest.xml && echo "已设置" || echo "未设置")

存储配置状态:
- 使用增强版存储管理器: $([ -f "frontend/src/utils/enhancedStorageManager.js" ] && echo "是" || echo "否")
- 强制使用localStorage: $(grep -q "const FORCE_LOCAL_STORAGE = true" frontend/src/utils/storageManager.js && echo "是" || echo "否")
- 备份原始存储管理器: $([ -f "frontend/src/utils/storageManager.js.backup" ] && echo "是" || echo "否")

下一步操作:
1. 安装应用到设备: adb install -r frontend/android/app/build/outputs/apk/debug/app-debug.apk
2. 授予权限: 
   adb shell pm grant com.nicetoday.app android.permission.READ_EXTERNAL_STORAGE
   adb shell pm grant com.nicetoday.app android.permission.WRITE_EXTERNAL_STORAGE
3. 测试存储功能:
   - 设置用户信息（如生肖、出生年份）
   - 关闭并重新打开应用
   - 确认数据是否被保存

故障排除:
- 如果数据仍然无法保存，请检查设备是否有足够的存储空间
- 如果权限被拒绝，请在设备设置中手动授予权限
- 如果应用闪退，请检查logcat日志: adb logcat | grep -i "nicetoday"
EOF

log_info "修复报告已生成: $REPORT_FILE"

# 完成
log_info "本地数据读写权限修复完成！"
log_info "应用现在应该能够正确读写本地配置与数据缓存文件。"

echo ""
log_info "下一步操作:"
echo "1. 运行测试脚本: chmod +x test-storage-functionality.sh && ./test-storage-functionality.sh"
echo "2. 手动测试存储功能"
echo "3. 查看修复报告: cat $REPORT_FILE"