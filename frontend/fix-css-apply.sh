#!/bin/bash

# 备份原文件
cp /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend/src/index.css /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend/src/index.css.backup

echo "已备份原文件到 index.css.backup"
echo "请手动修复所有使用 'dark:' 的 @apply 语句"
echo "建议使用 @media (prefers-color-scheme: dark) 或直接在 HTML 元素上使用 dark: 类"
