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
