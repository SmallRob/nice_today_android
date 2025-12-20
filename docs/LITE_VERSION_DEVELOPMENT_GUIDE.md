# 轻量版开发指南

本文档详细说明了轻量版应用的架构设计、目录结构和构建流程。

## 项目结构调整

### 1. 文档整理

所有项目文档已移至 `docs/` 目录下，包括：
- BUILD_DEBUGGING.md
- BUILD_INSTRUCTIONS.md
- CAPACITOR_ANDROID_SETUP.md
- COMPATIBILITY_REPORT.md
- CRASH_FIX_GUIDE.md
- LONG_TERM_MAINTENANCE_PLAN.md
- MAYA_PERFORMANCE_OPTIMIZATION.md
- MOBILE_APP.md
- MOBILE_COMPATIBILITY_OPTIMIZATION.md
- OPTIMIZATION_SUMMARY.md
- PERFORMANCE_CHECKLIST.md
- README.md
- SIMULATED_API_FIX.md
- STORAGE_PERMISSIONS_GUIDE.md
- USER_CONFIG_GUIDE.md

### 2. 轻量版目录结构

```
frontend/src/
├── lite/                    # 轻量版专用代码
│   ├── components/          # 轻量版组件
│   ├── pages/              # 轻量版页面
│   ├── styles/             # 轻量版样式
│   ├── config/             # 轻量版配置
│   ├── utils/              # 轻量版工具函数
│   ├── AppLite.js          # 轻量版主应用组件
│   └── index.js            # 轻量版入口文件
├── components/             # 公共组件（完整版和轻量版共享）
├── pages/                 # 公共页面（完整版使用）
├── styles/                # 公共样式
├── utils/                 # 公共工具函数
├── App.js                 # 完整版主应用组件
├── VersionRouter.js       # 版本路由组件
└── index.js               # 应用入口文件
```

## 架构设计

### 1. 双版本架构

项目采用双版本架构设计：
- **完整版**：包含所有功能和炫彩视觉效果
- **轻量版**：仅包含核心功能，采用简约设计，专为低端设备优化

### 2. 版本切换机制

通过 `VersionRouter.js` 组件实现版本切换：
1. 检查 localStorage 中的 `appVersion` 设置
2. 默认使用轻量版（`appVersion` 不存在时）
3. 用户可在设置中切换版本
4. 版本切换后刷新页面生效

### 3. 共享机制

轻量版与完整版共享以下资源：
- 用户配置管理器 (`userConfigManager`)
- 公共工具函数
- 部分基础组件

## 核心功能实现

### 1. 人体节律
- 基于 `biorhythmCalculator.js` 计算节律指数
- 提供简单的日期导航功能

### 2. 玛雅日历
- 简化的玛雅日期显示
- 基础的玛雅历法知识介绍

### 3. 穿衣指南
- 基于星期几的简单颜色推荐
- 基础的穿衣和饮食建议

### 4. 用户设置
- 简化的用户信息管理
- 版本切换功能

## 构建脚本

### 1. 独立构建轻量版APK

#### Bash脚本
```bash
./build-lite-apk.sh
```

#### PowerShell脚本
```powershell
.\build-lite-apk.ps1
```

### 2. NPM脚本

在 `frontend/package.json` 中添加了以下脚本：
```json
"build:lite": "cross-env BUILD_LITE_VERSION=true craco build"
```

## 性能优化措施

### 1. 简化UI设计
- 移除复杂动画和渐变效果
- 使用原生CSS而非重型UI框架
- 减少DOM元素嵌套层级

### 2. 代码优化
- 按需加载核心功能
- 移除不必要的第三方依赖
- 简化组件逻辑

### 3. 资源优化
- 减少图片资源使用
- 压缩静态资源
- 优化打包策略

## 维护建议

### 1. 功能同步
当完整版新增核心功能时，应考虑是否需要在轻量版中实现对应功能。

### 2. 配置管理
两个版本使用相同的用户配置管理器，确保用户数据一致性。

### 3. 测试策略
- 在低端设备上测试轻量版性能
- 验证版本切换功能的稳定性
- 确保用户数据在两个版本间正确同步

## 扩展性考虑

### 1. 功能扩展
轻量版可通过以下方式扩展功能：
- 在 `lite/pages/` 目录下添加新页面
- 在 `lite/components/` 目录下添加新组件
- 更新 `AppLite.js` 中的路由配置

### 2. 样式定制
轻量版拥有独立的样式文件 `lite/styles/liteStyles.css`，可根据需要进行定制。

### 3. 配置管理
通过 `lite/config/versionConfig.js` 管理轻量版的特有配置。