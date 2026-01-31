#!/bin/bash

# 应用修复版本的优化组件

echo "=================================="
echo "应用修复版本的优化组件"
echo "=================================="

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 复制修复版本的优化组件
echo "应用修复版本的组件..."

# 检查修复文件是否存在
if [ ! -f "frontend/src/components/MayaCalendar_optimized_fixed.js" ]; then
    echo "错误: 找不到修复版本的组件文件"
    exit 1
fi

# 应用修复版本
cp frontend/src/components/MayaCalendar_optimized_fixed.js frontend/src/components/MayaCalendar_optimized.js

echo "修复版本已应用!"

echo ""
echo "现在可以尝试重新构建项目:"
echo "npm run build"
echo ""
echo "或者使用craco构建:"
echo "craco build"