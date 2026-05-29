# 健康管理域 PRD

## 1. 领域概述

### 1.1 领域标识
- **领域ID**: health
- **领域名称**: 健康管理域
- **优先级**: P0
- **状态**: 迁移中

### 1.2 领域职责
负责生物节律、情绪日历、身体指标等健康管理功能。

### 1.3 核心能力
- 生物节律追踪
- 情绪状态管理
- 身体指标监控
- 健康趋势分析
- 个性化健康建议

## 2. 功能规划

### 2.1 功能清单

| 功能ID | 功能名称 | 优先级 | 状态 | 目标版本 |
|--------|----------|--------|------|----------|
| FEAT-019 | 生物节律 | P0 | PLANNED | v1.0 |
| FEAT-020 | 健康仪表盘 | P0 | PLANNED | v1.0 |
| FEAT-021 | 情绪日历 | P0 | PLANNED | v1.0 |
| FEAT-022 | 身体指标 | P0 | PLANNED | v1.0 |
| FEAT-023 | 情绪健康仪表盘 | P1 | PLANNED | v1.1 |
| FEAT-024 | 睡眠健康仪表盘 | P1 | PLANNED | v1.1 |
| FEAT-025 | 阶段健康 | P1 | PLANNED | v1.1 |
| FEAT-026 | 敏捷健康 | P2 | PLANNED | v1.2 |
| FEAT-027 | 器官节律 | P2 | PLANNED | v1.2 |
| FEAT-028 | 五行健康 | P2 | PLANNED | v1.2 |
| FEAT-029 | 经期追踪 | P1 | PLANNED | v1.1 |
| FEAT-030 | 能量树 | P2 | PLANNED | v1.2 |
| FEAT-031 | 能量提升 | P2 | PLANNED | v1.2 |

### 2.2 功能依赖
- 依赖用户中心域获取用户基本信息
- 依赖存储服务保存健康数据
- 依赖图表库进行数据可视化

## 3. 技术架构

### 3.1 目录结构
```
frontend/src/domains/health/
├── components/          # UI组件
├── services/            # 业务逻辑
├── types.ts             # 类型定义
├── index.ts             # 域入口
├── charts/              # 图表组件
└── hooks/               # 自定义hooks
```

### 3.2 核心组件
- BiorhythmChart: 生物节律图表
- MoodCalendar: 情绪日历组件
- HealthMetricCard: 健康指标卡片
- SleepTracker: 睡眠追踪器
- EnergyMeter: 能量测量仪
- HealthTrend: 健康趋势图

### 3.3 数据模型
```typescript
interface BiorhythmData {
  date: string;
  physical: number;  // -100 to 100
  emotional: number; // -100 to 100
  intellectual: number; // -100 to 100
}

interface MoodEntry {
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  stress: number; // 1-5
  notes?: string;
}

interface HealthMetrics {
  weight?: number;
  height?: number;
  bloodPressure?: string;
  heartRate?: number;
  sleepHours?: number;
  steps?: number;
}
```

## 4. 验收标准

- [ ] 用户能够查看生物节律图表
- [ ] 用户能够记录每日情绪状态
- [ ] 用户能够追踪身体指标
- [ ] 系统能够生成健康趋势分析
- [ ] 提供个性化健康建议
- [ ] 数据可视化清晰易懂
- [ ] 支持数据导出功能
- [ ] 保护用户隐私数据

## 5. 风险与依赖

| 风险/依赖 | 影响 | 缓解措施 |
|-----------|------|----------|
| 数据准确性 | 高 | 提供数据验证和校正功能 |
| 隐私保护 | 高 | 本地存储，不上传云端 |
| 用户参与度 | 中 | 提供激励机制和提醒功能 |