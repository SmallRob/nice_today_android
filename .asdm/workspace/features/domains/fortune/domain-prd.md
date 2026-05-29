# 运势分析域 PRD

## 1. 领域概述

### 1.1 领域标识
- **领域ID**: fortune
- **领域名称**: 运势分析域
- **优先级**: P0
- **状态**: 迁移中

### 1.2 领域职责
负责星座运势、八字分析、紫微斗数、黄历、塔罗等传统命理分析功能。

### 1.3 核心能力
- 星座运势分析
- 八字命理计算
- 紫微斗数排盘
- 黄历查询
- 塔罗牌占卜
- 多种命理系统集成

## 2. 功能规划

### 2.1 功能清单

| 功能ID | 功能名称 | 优先级 | 状态 | 目标版本 |
|--------|----------|--------|------|----------|
| FEAT-005 | 星座运势 | P0 | PLANNED | v1.0 |
| FEAT-006 | 八字分析 | P0 | PLANNED | v1.0 |
| FEAT-007 | 紫微斗数 | P0 | PLANNED | v1.0 |
| FEAT-008 | 黄历查询 | P0 | PLANNED | v1.0 |
| FEAT-009 | 塔罗牌占卜 | P0 | PLANNED | v1.0 |
| FEAT-010 | 玛雅历法 | P1 | PLANNED | v1.1 |
| FEAT-011 | 数字命理 | P1 | PLANNED | v1.1 |
| FEAT-012 | 奇门遁甲 | P1 | PLANNED | v1.1 |
| FEAT-013 | 高岛建议 | P2 | PLANNED | v1.2 |
| FEAT-014 | 铁板神数 | P2 | PLANNED | v1.2 |
| FEAT-015 | 梅花易数 | P2 | PLANNED | v1.2 |
| FEAT-016 | 六爻占卜 | P2 | PLANNED | v1.2 |
| FEAT-017 | 简易易经 | P2 | PLANNED | v1.2 |
| FEAT-018 | 出生图 | P1 | PLANNED | v1.1 |

### 2.2 功能依赖
- 依赖用户中心域获取用户生日信息
- 依赖存储服务保存分析结果
- 依赖设计系统组件展示结果

## 3. 技术架构

### 3.1 目录结构
```
frontend/src/domains/fortune/
├── components/          # UI组件
├── services/            # 业务逻辑
├── types.ts             # 类型定义
├── index.ts             # 域入口
├── calculators/         # 计算引擎
└── hooks/               # 自定义hooks
```

### 3.2 核心组件
- HoroscopeCard: 星座运势卡片
- BaziChart: 八字图表
- ZiWeiPanel: 紫微斗数面板
- HuangliCalendar: 黄历日历
- TarotSpread: 塔罗牌阵
- FortuneShare: 运势分享

### 3.3 数据模型
```typescript
interface HoroscopeData {
  sign: string;
  date: string;
  overall: number;
  love: number;
  career: number;
  wealth: number;
  health: number;
  luckyNumber: number;
  luckyColor: string;
  summary: string;
}

interface BaziData {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  fiveElements: object;
  analysis: string;
}

interface TarotCard {
  id: number;
  name: string;
  image: string;
  upright: string;
  reversed: string;
  meaning: string;
}
```

## 4. 验收标准

- [ ] 用户能够查看每日星座运势
- [ ] 用户能够进行八字分析
- [ ] 用户能够查看紫微斗数排盘
- [ ] 用户能够查询黄历信息
- [ ] 用户能够进行塔罗牌占卜
- [ ] 所有计算本地完成，无网络依赖
- [ ] 结果能够本地存储和历史查看
- [ ] 支持分享功能

## 5. 风险与依赖

| 风险/依赖 | 影响 | 缓解措施 |
|-----------|------|----------|
| 计算准确性 | 高 | 使用经过验证的计算库 |
| 数据复杂性 | 中 | 实现数据压缩和缓存 |
| 用户体验 | 中 | 提供清晰的解释和引导 |