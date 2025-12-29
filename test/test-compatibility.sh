#!/bin/bash

# 应用兼容性测试脚本
# 测试新版本在不同环境下的运行情况

set -e

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
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# 测试结果统计
PASSED=0
FAILED=0
WARNINGS=0

test_passed() {
    echo -e "${GREEN}✓ PASSED${NC}: $1"
    ((PASSED++))
}

test_failed() {
    echo -e "${RED}✗ FAILED${NC}: $1"
    ((FAILED++))
}

test_warning() {
    echo -e "${YELLOW}! WARNING${NC}: $1"
    ((WARNINGS++))
}

# 脚本开始
log_info "开始应用兼容性测试..."

# 设置路径变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# 进入前端目录
cd "$FRONTEND_DIR"

# 测试1: 检查Node.js版本
echo ""
log_info "测试1: Node.js环境检查"
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")

if [[ "$NODE_VERSION" != "not found" ]]; then
    test_passed "Node.js版本: $NODE_VERSION"
else
    test_failed "Node.js未安装"
fi

if [[ "$NPM_VERSION" != "not found" ]]; then
    test_passed "npm版本: $NPM_VERSION"
else
    test_failed "npm未安装"
fi

# 测试2: 检查项目依赖
echo ""
log_info "测试2: 项目依赖检查"

if [ -f "package.json" ]; then
    test_passed "package.json存在"
    
    # 检查关键依赖
    REACT_VERSION=$(grep -o '"react": "[^"]*' package.json | cut -d'"' -f4)
    CAPACITOR_VERSION=$(grep -o '@capacitor/core": "[^"]*' package.json | cut -d'"' -f4)
    
    if [[ ! -z "$REACT_VERSION" ]]; then
        test_passed "React版本: $REACT_VERSION"
    else
        test_warning "React依赖未找到"
    fi
    
    if [[ ! -z "$CAPACITOR_VERSION" ]]; then
        test_passed "Capacitor版本: $CAPACITOR_VERSION"
    else
        test_warning "Capacitor依赖未找到"
    fi
    
    # 检查依赖安装
    if [ -d "node_modules" ]; then
        test_passed "依赖已安装"
    else
        test_warning "依赖未安装，运行 npm install"
    fi
else
    test_failed "package.json不存在"
fi

# 测试3: Android构建环境检查
echo ""
log_info "测试3: Android构建环境检查"

if [ -d "android" ]; then
    test_passed "Android项目目录存在"
    
    # 检查Android配置
    if [ -f "android/app/build.gradle" ]; then
        test_passed "Android构建配置存在"
        
        # 检查包名配置
        PACKAGE_NAME=$(grep -o 'applicationId "[^"]*' android/app/build.gradle | cut -d'"' -f2)
        if [[ "$PACKAGE_NAME" == "com.nicetoday.app" ]]; then
            test_passed "应用包名正确: $PACKAGE_NAME"
        else
            test_failed "应用包名不正确: $PACKAGE_NAME"
        fi
        
        # 检查minSdkVersion
        MIN_SDK=$(grep -o 'minSdkVersion [0-9]*' android/variables.gradle | cut -d' ' -f2)
        if [[ ! -z "$MIN_SDK" && "$MIN_SDK" -le 21 ]]; then
            test_passed "最低SDK版本兼容: $MIN_SDK"
        else
            test_warning "最低SDK版本可能过高: $MIN_SDK"
        fi
    else
        test_failed "Android构建配置不存在"
    fi
    
    # 检查AndroidManifest
    if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
        test_passed "AndroidManifest存在"
        
        # 检查权限配置
        PERMISSIONS_COUNT=$(grep -c '<uses-permission' android/app/src/main/AndroidManifest.xml)
        if [[ "$PERMISSIONS_COUNT" -gt 0 ]]; then
            test_passed "权限配置正常 ($PERMISSIONS_COUNT 个权限)"
        else
            test_warning "权限配置可能不完整"
        fi
    else
        test_failed "AndroidManifest不存在"
    fi
else
    test_warning "Android项目目录不存在，运行 npx cap add android"
fi

# 测试4: 构建测试
echo ""
log_info "测试4: 构建测试"

# 检查是否可以构建React应用
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    log_info "正在构建React应用..."
    
    # 先安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        log_info "安装项目依赖..."
        npm install --silent
    fi
    
    # 尝试构建
    if npm run build --silent; then
        test_passed "React应用构建成功"
        
        # 检查构建输出
        if [ -d "build" ] && [ -f "build/index.html" ]; then
            test_passed "构建输出正常"
        else
            test_failed "构建输出不完整"
        fi
    else
        test_failed "React应用构建失败"
    fi
else
    test_failed "无法执行构建测试"
fi

# 测试5: Capacitor同步测试
echo ""
log_info "测试5: Capacitor同步测试"

if command -v npx &> /dev/null && [ -d "android" ]; then
    log_info "正在同步到Android平台..."
    
    if npx cap sync android --silent; then
        test_passed "Capacitor同步成功"
    else
        test_failed "Capacitor同步失败"
    fi
else
    test_warning "跳过Capacitor同步测试"
fi

# 测试6: 配置文件检查
echo ""
log_info "测试6: 配置文件检查"

CONFIG_FILES=(
    "capacitor.config.ts"
    "craco.config.js"
    "tailwind.config.js"
    "postcss.config.js"
)

for config_file in "${CONFIG_FILES[@]}"; do
    if [ -f "$config_file" ]; then
        test_passed "$config_file 存在"
    else
        test_failed "$config_file 不存在"
    fi
done

# 测试7: 关键组件检查
echo ""
log_info "测试7: 关键组件检查"

COMPONENT_FILES=(
    "src/components/BiorhythmTab.js"
    "src/components/BiorhythmDashboard.js"
    "src/components/MayaCalendar.js"
    "src/components/DressInfo.js"
    "src/services/localDataService.js"
    "src/utils/dataMigration.js"
)

for component_file in "${COMPONENT_FILES[@]}"; do
    if [ -f "$component_file" ]; then
        test_passed "$component_file 存在"
        
        # 检查文件语法（简单检查）
        if node -c "$component_file" &>/dev/null; then
            test_passed "$component_file 语法正确"
        else
            test_failed "$component_file 语法错误"
        fi
    else
        test_failed "$component_file 不存在"
    fi
done

# 测试8: 数据迁移兼容性检查
echo ""
log_info "测试8: 数据迁移兼容性检查"

if [ -f "src/utils/dataMigration.js" ]; then
    # 检查数据迁移工具是否可用
    if node -e "
        const { migrateOldData } = require('./src/utils/dataMigration.js');
        console.log('数据迁移工具加载成功');
    " &>/dev/null; then
        test_passed "数据迁移工具可用"
    else
        test_failed "数据迁移工具加载失败"
    fi
else
    test_failed "数据迁移工具不存在"
fi

# 生成测试报告
echo ""
log_info "=== 兼容性测试报告 ==="
echo ""
echo "测试统计:"
echo "  ✅ 通过: $PASSED"
echo "  ❌ 失败: $FAILED"
echo "  ⚠️ 警告: $WARNINGS"
echo ""

if [[ "$FAILED" -eq 0 ]]; then
    if [[ "$WARNINGS" -eq 0 ]]; then
        echo -e "${GREEN}🎉 所有测试通过！应用兼容性良好。${NC}"
    else
        echo -e "${YELLOW}⚠️ 测试通过，但有 $WARNINGS 个警告需要注意。${NC}"
    fi
else
    echo -e "${RED}❌ 测试失败！有 $FAILED 个问题需要修复。${NC}"
    echo ""
    echo "建议修复步骤:"
    echo "1. 检查Node.js和npm安装"
    echo "2. 运行 npm install 安装依赖"
    echo "3. 检查Android配置和权限"
    echo "4. 修复语法错误的组件文件"
    exit 1
fi

# 生成详细的环境报告
echo ""
log_info "环境信息汇总:"
echo "Node.js版本: $NODE_VERSION"
echo "npm版本: $NPM_VERSION"
echo "React版本: ${REACT_VERSION:-未知}"
echo "Capacitor版本: ${CAPACITOR_VERSION:-未知}"
echo "最低SDK版本: ${MIN_SDK:-未知}"
echo "应用包名: ${PACKAGE_NAME:-未知}"

log_info "兼容性测试完成！"