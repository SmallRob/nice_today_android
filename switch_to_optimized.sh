#!/bin/bash

# 玛雅日历组件优化切换脚本
# 此脚本将帮助您快速切换到优化版本的玛雅日历组件

echo "=================================="
echo "玛雅日历组件优化切换工具"
echo "=================================="

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 创建备份
backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
echo "创建备份目录: $backup_dir"
mkdir -p "$backup_dir"

# 备份原始文件
echo "备份原始组件文件..."
cp -r frontend/src/components/Maya* "$backup_dir/" 2>/dev/null
cp frontend/src/pages/MayaPage.js "$backup_dir/" 2>/dev/null

# 创建切换脚本
echo "创建应用优化版本的脚本..."

# 切换到优化版本
echo "切换到优化版本..."

# 检查优化文件是否存在
if [ ! -f "frontend/src/components/MayaCalendar_optimized.js" ]; then
    echo "错误: 找不到优化版本的组件文件"
    exit 1
fi

# 复制优化版本到原始文件名
echo "应用优化版本..."

# 备份原始文件（如果存在）
if [ -f "frontend/src/components/MayaCalendar.js" ]; then
    cp frontend/src/components/MayaCalendar.js "$backup_dir/MayaCalendar.js.original"
fi

if [ -f "frontend/src/components/MayaBirthChart.js" ]; then
    cp frontend/src/components/MayaBirthChart.js "$backup_dir/MayaBirthChart.js.original"
fi

if [ -f "frontend/src/components/MayaBirthChartResults.js" ]; then
    cp frontend/src/components/MayaBirthChartResults.js "$backup_dir/MayaBirthChartResults.js.original"
fi

if [ -f "frontend/src/pages/MayaPage.js" ]; then
    cp frontend/src/pages/MayaPage.js "$backup_dir/MayaPage.js.original"
fi

# 复制优化版本
cp frontend/src/components/MayaCalendar_optimized.js frontend/src/components/MayaCalendar.js
cp frontend/src/components/MayaBirthChart_optimized.js frontend/src/components/MayaBirthChart.js
cp frontend/src/components/MayaBirthChartResults_optimized.js frontend/src/components/MayaBirthChartResults.js
cp frontend/src/pages/MayaPage_optimized.js frontend/src/pages/MayaPage.js

echo "优化版本已应用!"

# 提示下一步
echo ""
echo "下一步操作:"
echo "1. 运行 'npm start' 或 'npm run android' 启动应用"
echo "2. 测试玛雅日历功能的性能改进"
echo ""
echo "如需恢复原始版本，请运行: ./restore_original.sh"

# 创建恢复脚本
cat > restore_original.sh << 'EOF'
#!/bin/bash

# 恢复原始版本的脚本

echo "=================================="
echo "玛雅日历组件恢复工具"
echo "=================================="

# 查找最新的备份目录
backup_dir=$(ls -d backup_* 2>/dev/null | sort | tail -1)

if [ -z "$backup_dir" ]; then
    echo "错误: 找不到备份目录"
    exit 1
fi

echo "从备份恢复: $backup_dir"

# 恢复文件
if [ -f "$backup_dir/MayaCalendar.js.original" ]; then
    cp "$backup_dir/MayaCalendar.js.original" frontend/src/components/MayaCalendar.js
fi

if [ -f "$backup_dir/MayaBirthChart.js.original" ]; then
    cp "$backup_dir/MayaBirthChart.js.original" frontend/src/components/MayaBirthChart.js
fi

if [ -f "$backup_dir/MayaBirthChartResults.js.original" ]; then
    cp "$backup_dir/MayaBirthChartResults.js.original" frontend/src/components/MayaBirthChartResults.js
fi

if [ -f "$backup_dir/MayaPage.js.original" ]; then
    cp "$backup_dir/MayaPage.js.original" frontend/src/pages/MayaPage.js
fi

echo "原始版本已恢复!"
EOF

chmod +x restore_original.sh

echo "恢复脚本已创建: restore_original.sh"