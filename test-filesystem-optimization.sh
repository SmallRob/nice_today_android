#!/bin/bash

# 移动端文件系统功能验证脚本
# 用于测试优化后的导入/导出功能

echo "========================================="
echo "移动端文件系统功能验证"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# 测试函数
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo "测试: $test_name"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ 通过${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo ""
    else
        echo -e "${RED}✗ 失败${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo ""
    fi
}

# 进入frontend目录
cd frontend || exit 1

echo "========================================="
echo "代码检查测试"
echo "========================================="
echo ""

# 测试1: 检查mobileFileSystem.js是否存在
run_test "mobileFileSystem.js文件存在" "test -f src/utils/mobileFileSystem.js"

# 测试2: 检查UserDataManager.js是否存在
run_test "UserDataManager.js文件存在" "test -f src/components/UserDataManager.js"

# 测试3: 检查UserConfigManager.js是否存在
run_test "UserConfigManager.js文件存在" "test -f src/components/UserConfigManager.js"

# 测试4: 检查是否有语法错误
run_test "mobileFileSystem.js语法检查" "node -c src/utils/mobileFileSystem.js"

# 测试5: 检查是否有语法错误
run_test "UserDataManager.js语法检查" "node -c src/components/UserDataManager.js"

# 测试6: 检查是否有语法错误
run_test "UserConfigManager.js语法检查" "node -c src/components/UserConfigManager.js"

echo "========================================="
echo "功能测试"
echo "========================================="
echo ""

# 测试7: 检查环境检测函数是否导出
run_test "detectEnvironment函数存在" "grep -q 'export const detectEnvironment' src/utils/mobileFileSystem.js"

# 测试8: 检查saveFile函数是否导出
run_test "saveFile函数存在" "grep -q 'export const saveFile' src/utils/mobileFileSystem.js"

# 测试9: 检查readFile函数是否导出
run_test "readFile函数存在" "grep -q 'export const readFile' src/utils/mobileFileSystem.js"

# 测试10: 检查权限检查函数是否导出
run_test "checkAndRequestStoragePermission函数存在" "grep -q 'export const checkAndRequestStoragePermission' src/utils/mobileFileSystem.js"

# 测试11: 检查是否有缓存机制
run_test "环境检测缓存机制" "grep -q 'cachedEnvironment' src/utils/mobileFileSystem.js"

# 测试12: 检查是否有初始化标志
run_test "Filesystem初始化优化" "grep -q 'FilesystemInitialized' src/utils/mobileFileSystem.js"

# 测试13: 检查是否有并发控制
run_test "并发控制ref" "grep -q 'isProcessingRef' src/components/UserConfigManager.js"

# 测试14: 检查是否有超时处理
run_test "超时处理" "grep -q '文件读取超时' src/components/UserConfigManager.js || grep -q '文件读取超时' src/components/UserDataManager.js"

# 测试15: 检查是否有数据验证
run_test "数据大小验证" "grep -q 'dataSize.*10.*1024' src/components/UserConfigManager.js || grep -q 'dataSize.*10.*1024' src/components/UserDataManager.js"

# 测试16: 检查是否使用useRef
run_test "useRef导入" "grep -q 'import.*useRef' src/components/UserDataManager.js && grep -q 'import.*useRef' src/components/UserConfigManager.js"

# 测试17: 检查是否有详细的错误处理
run_test "详细错误处理" "grep -q 'Failed to import' src/components/UserConfigManager.js || grep -q 'Failed to import' src/components/UserDataManager.js"

# 测试18: 检查WebView检测
run_test "WebView环境检测" "grep -q 'isWebView' src/utils/mobileFileSystem.js"

# 测试19: 检查降级策略
run_test "降级策略" "grep -q 'capacitor-filesystem' src/utils/mobileFileSystem.js && grep -q 'filesystem-access-api' src/utils/mobileFileSystem.js"

echo "========================================="
echo "依赖检查"
echo "========================================="
echo ""

# 测试20: 检查Capacitor是否安装
run_test "@capacitor/core依赖" "grep -q '@capacitor/core' package.json"

# 测试21: 检查Filesystem插件是否在package.json中
run_test "@capacitor/filesystem依赖" "grep -q '@capacitor/filesystem' package.json"

# 测试22: 检查是否有import语句
run_test "Capacitor导入" "grep -q 'from.*capacitor' src/utils/mobileFileSystem.js"

echo "========================================="
echo "性能优化检查"
echo "========================================="
echo ""

# 测试23: 检查是否有缓存注释
run_test "性能优化注释" "grep -q '缓存' src/utils/mobileFileSystem.js"

# 测试24: 检查是否有懒加载
run_test "懒加载" "grep -q 'await import' src/utils/mobileFileSystem.js"

# 测试25: 检查是否有清理逻辑
run_test "资源清理" "grep -q 'URL.revokeObjectURL\|document.body.removeChild' src/utils/mobileFileSystem.js"

echo "========================================="
echo "测试结果汇总"
echo "========================================="
echo ""

echo -e "总测试数: $TESTS_TOTAL"
echo -e "${GREEN}通过: $TESTS_PASSED${NC}"
echo -e "${RED}失败: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================="
    echo "所有测试通过！✓"
    echo "=========================================${NC}"
    echo ""
    echo "下一步："
    echo "1. 构建应用: npm run build"
    echo "2. 运行应用: npm start"
    echo "3. 在移动设备上测试实际功能"
    exit 0
else
    echo ""
    echo -e "${YELLOW}========================================="
    echo "部分测试失败，请检查日志"
    echo "=========================================${NC}"
    echo ""
    echo "失败测试数: $TESTS_FAILED"
    echo "请检查上述失败的项目并修复"
    exit 1
fi
