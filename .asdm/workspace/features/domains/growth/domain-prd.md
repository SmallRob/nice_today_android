# 成长管理域 PRD

## 1. 领域概述

### 1.1 领域标识
- **领域ID**: growth
- **领域名称**: 成长管理域
- **优先级**: P1
- **状态**: 迁移中

### 1.2 领域职责
负责MBTI、性格测试、目标管理等个人成长相关功能。

### 1.3 核心能力
- 性格类型分析
- 个人成长追踪
- 目标设定与管理
- 自我认知提升

## 2. 功能规划

### 2.1 功能清单

| 功能ID | 功能名称 | 优先级 | 状态 | 目标版本 |
|--------|----------|--------|------|----------|
| FEAT-032 | MBTI测试 | P1 | PLANNED | v1.1 |
| FEAT-033 | 性格测试 | P1 | PLANNED | v1.1 |
| FEAT-034 | 人生趋势 | P1 | PLANNED | v1.1 |
| FEAT-035 | 年龄分析 | P2 | PLANNED | v1.2 |
| FEAT-036 | 陈氏气质测试 | P2 | PLANNED | v1.2 |
| FEAT-037 | 气质详情 | P2 | PLANNED | v1.2 |

### 2.2 功能依赖
- 依赖用户中心域获取用户基本信息
- 依赖存储服务保存测试结果
- 依赖设计系统组件展示结果

## 3. 技术架构

### 3.1 目录结构
```
frontend/src/domains/growth/
├── components/          # UI组件
├── services/            # 业务逻辑
├── types.ts             # 类型定义
├── index.ts             # 域入口
├── tests/               # 测试逻辑
└── hooks/               # 自定义hooks
```

### 3.2 核心组件
- MBTIQuestionnaire: MBTI问卷组件
- PersonalityRadar: 性格雷达图
- GrowthTimeline: 成长时间线
- GoalTracker: 目标追踪器
- InsightCard: 洞察卡片
- ComparisonChart: 对比图表

### 3.3 数据模型
```typescript
interface MBTIResult {
  type: string; // e.g., "INTJ"
  dimensions: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  description: string;
  strengths: string[];
  weaknesses: string[];
  careers: string[];
}

interface PersonalityTrait {
  name: string;
  score: number; // 0-100
  description: string;
}

interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number; // 0-100
  milestones: Milestone[];
}
```

## 4. 验收标准

- [ ] 用户能够完成MBTI测试
- [ ] 用户能够查看性格分析结果
- [ ] 用户能够查看人生趋势分析
- [ ] 用户能够设定和追踪成长目标
- [ ] 测试结果能够本地存储
- [ ] 提供详细的解释和建议
- [ ] 支持结果分享功能

## 5. 风险与依赖

| 风险/依赖 | 影响 | 缓解措施 |
|-----------|------|----------|
| 测试准确性 | 中 | 使用经过验证的测试量表 |
| 用户参与度 | 中 | 提供即时反馈和奖励 |
| 数据隐私 | 高 | 本地存储，不上传云端 |