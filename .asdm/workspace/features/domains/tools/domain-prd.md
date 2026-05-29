# 工具集域 PRD

## 1. 领域概述

### 1.1 领域标识
- **领域ID**: tools
- **领域名称**: 工具集域
- **优先级**: P1
- **状态**: 迁移中

### 1.2 领域职责
负责待办、记事、习惯追踪等实用工具功能。

### 1.3 核心能力
- 任务管理
- 习惯养成
- 文档管理
- 个人财务
- 生活指南

## 2. 功能规划

### 2.1 功能清单

| 功能ID | 功能名称 | 优先级 | 状态 | 目标版本 |
|--------|----------|--------|------|----------|
| FEAT-046 | 待办列表 | P1 | PLANNED | v1.1 |
| FEAT-047 | 习惯追踪 | P1 | PLANNED | v1.1 |
| FEAT-048 | 习惯统计 | P1 | PLANNED | v1.1 |
| FEAT-049 | 密码保险箱 | P2 | PLANNED | v1.2 |
| FEAT-050 | 文档历史 | P2 | PLANNED | v1.2 |
| FEAT-051 | 文档查看器 | P2 | PLANNED | v1.2 |
| FEAT-052 | 统一文档查看器 | P2 | PLANNED | v1.2 |
| FEAT-053 | 财务页面 | P2 | PLANNED | v1.2 |
| FEAT-054 | 着装指南 | P3 | PLANNED | v1.3 |
| FEAT-055 | 生活方式指南 | P3 | PLANNED | v1.3 |
| FEAT-056 | 仪表盘 | P1 | PLANNED | v1.1 |
| FEAT-057 | 功能开发 | P3 | PLANNED | v1.3 |

### 2.2 功能依赖
- 依赖存储服务保存数据
- 依赖设计系统组件
- 依赖通知服务进行提醒

## 3. 技术架构

### 3.1 目录结构
```
frontend/src/domains/tools/
├── components/          # UI组件
├── services/            # 业务逻辑
├── types.ts             # 类型定义
├── index.ts             # 域入口
└── hooks/               # 自定义hooks
```

### 3.2 核心组件
- TodoItem: 待办事项组件
- HabitTracker: 习惯追踪器
- HabitStats: 习惯统计图表
- DocumentViewer: 文档查看器
- FinanceChart: 财务图表
- GuideCard: 指南卡片

### 3.3 数据模型
```typescript
interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  streak: number;
  history: HabitEntry[];
}

interface Document {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'document' | 'pdf';
  createdAt: string;
  updatedAt: string;
  tags: string[];
}
```

## 4. 验收标准

- [ ] 用户能够创建和管理待办事项
- [ ] 用户能够追踪习惯养成
- [ ] 用户能够查看习惯统计数据
- [ ] 用户能够管理个人文档
- [ ] 用户能够记录财务信息
- [ ] 提供实用的生活指南
- [ ] 数据能够本地存储和同步

## 5. 风险与依赖

| 风险/依赖 | 影响 | 缓解措施 |
|-----------|------|----------|
| 数据同步 | 高 | 实现本地优先架构 |
| 用户参与度 | 中 | 提供提醒和激励机制 |
| 功能复杂性 | 中 | 分阶段实现，先核心后扩展 |