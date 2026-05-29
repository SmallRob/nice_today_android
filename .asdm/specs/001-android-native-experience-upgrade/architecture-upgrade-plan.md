# Nice Today Android - 架构升级规划（参考 2.0 设计理念）

**日期**: 2026-05-27  
**状态**: Draft

## 1. 核心设计理念（来自 nice-today-2.0）

### 1.1 领域驱动设计（DDD）
将应用划分为多个独立领域，每个领域有清晰的边界和职责：

| 领域 | 职责 | 优先级 |
|------|------|--------|
| 用户中心域 | 用户配置、数据管理、个人资料 | P0 |
| 运势分析域 | 星座、八字、紫微、黄历、塔罗 | P0 |
| 健康管理域 | 生物节律、情绪日历、身体指标 | P0 |
| 成长管理域 | MBTI、性格测试、目标管理 | P1 |
| 娱乐休闲域 | 游戏、趣味测试、互动内容 | P2 |
| 工具集域 | 待办、记事、习惯追踪 | P1 |

### 1.2 Overlay 路由系统
参考 2.0 的 Overlay 注册机制，实现：
- **懒加载**：页面组件按需加载
- **导航栈管理**：支持多层 overlay 叠加
- **统一注册表**：所有页面集中管理
- **动态 Props 注入**：支持页面间参数传递

### 1.3 状态管理架构
- **localStorage 优先**：全量本地存储，无后端依赖
- **数据迁移机制**：版本化存储，支持自动迁移
- **全局配置快照**：统一的用户配置访问接口

## 2. 架构升级方案

### 2.1 目录结构重构

```
frontend/src/
├── domains/                    # 领域模块
│   ├── user-center/           # 用户中心域
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   ├── fortune/               # 运势分析域
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   ├── health/                # 健康管理域
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   ├── growth/                # 成长管理域
│   ├── entertainment/         # 娱乐休闲域
│   └── tools/                 # 工具集域
│
├── routes/                    # 路由系统
│   ├── overlayRegistry.ts     # Overlay 注册表
│   ├── overlayRegistry.types.ts
│   ├── overlayGroups/         # 各领域路由分组
│   │   ├── fortune.ts
│   │   ├── health.ts
│   │   ├── growth.ts
│   │   └── tools.ts
│   ├── lazyImports/           # 懒加载导入
│   └── OverlayRouter.tsx      # 路由渲染器
│
├── design-system/             # 设计系统
│   ├── tokens/
│   ├── components/
│   └── utils/
│
├── services/                  # 全局服务
│   ├── storageService.ts      # 存储服务
│   ├── globalUserConfig.ts    # 全局用户配置
│   └── eventBus.ts            # 事件总线
│
├── hooks/                     # 全局 Hooks
├── utils/                     # 工具函数
└── types/                     # 全局类型
```

### 2.2 Overlay 路由系统实现

```typescript
// routes/overlayRegistry.types.ts
export interface OverlayEntry {
  id: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  hidesNav?: boolean;
  props?: (state: any) => Record<string, unknown>;
}

export interface OverlayGroup {
  domain: string;
  entries: OverlayEntry[];
}

export type OverlayRegistry = Map<string, OverlayEntry>;
```

```typescript
// routes/overlayGroups/fortune.ts
import { lazy } from 'react';

export const fortuneGroup: OverlayGroup = {
  domain: 'fortune',
  entries: [
    {
      id: 'horoscope',
      component: lazy(() => import('../../pages/HoroscopePage')),
      hidesNav: true,
    },
    {
      id: 'bazi',
      component: lazy(() => import('../../pages/BaziPage')),
      hidesNav: true,
    },
    {
      id: 'ziwei',
      component: lazy(() => import('../../pages/ZiWeiPage')),
      hidesNav: true,
    },
    // ... 更多运势页面
  ],
};
```

```typescript
// routes/overlayRegistry.ts
import { fortuneGroup } from './overlayGroups/fortune';
import { healthGroup } from './overlayGroups/health';
import { growthGroup } from './overlayGroups/growth';
import { toolsGroup } from './overlayGroups/tools';

export function createOverlayRegistry(): OverlayRegistry {
  return mergeOverlayGroups([
    fortuneGroup,
    healthGroup,
    growthGroup,
    toolsGroup,
  ]);
}

export function mergeOverlayGroups(groups: OverlayGroup[]): OverlayRegistry {
  const registry: OverlayRegistry = new Map();
  
  for (const group of groups) {
    for (const entry of group.entries) {
      registry.set(entry.id, entry);
    }
  }
  
  return registry;
}
```

### 2.3 全局用户配置服务

```typescript
// services/globalUserConfig.ts
import type { UserProfile } from '../types';
import { storageService } from './storageService';

export type GlobalUserConfigSnapshot = {
  profile: {
    nickname?: string;
    gender?: string;
    age?: number;
    zodiac?: string;
    chineseZodiac?: string;
    mbti?: string;
    birthday?: string;
    birthTime?: string;
  };
  settings: {
    theme?: 'light' | 'dark' | 'system';
    useAIInterpretation?: boolean;
  };
  generatedAt: string;
};

export const getGlobalUserConfigSnapshot = (): GlobalUserConfigSnapshot => {
  const profile = storageService.getItemSync<UserProfile>('user_profile');
  
  return {
    profile: {
      nickname: profile?.nickname,
      gender: profile?.gender,
      age: profile?.age,
      zodiac: profile?.zodiac,
      chineseZodiac: profile?.chineseZodiac,
      mbti: profile?.mbti,
      birthday: profile?.birthday,
      birthTime: profile?.birthTime,
    },
    settings: {
      theme: storageService.getItemSync<'light' | 'dark' | 'system'>('theme', 'system'),
      useAIInterpretation: storageService.getItemSync<boolean>('use_ai_interpretation', false),
    },
    generatedAt: new Date().toISOString(),
  };
};
```

### 2.4 存储服务增强

```typescript
// services/storageService.ts
const STORAGE_PREFIX = 'nice_today_';

export const storageService = {
  getItemSync<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('[StorageService] Failed to save:', key, e);
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  migrate(oldKey: string, newKey: string, version?: string): void {
    const fullOldKey = STORAGE_PREFIX + oldKey;
    const fullNewKey = STORAGE_PREFIX + newKey + (version ? `_v${version}` : '');
    
    const oldValue = localStorage.getItem(fullOldKey);
    if (oldValue !== null && localStorage.getItem(fullNewKey) === null) {
      localStorage.setItem(fullNewKey, oldValue);
      localStorage.removeItem(fullOldKey);
    }
  },
};
```

## 3. 实施计划

### Phase 1: 基础架构（第1-2周）
- [x] 设计系统令牌和组件库
- [ ] 实现 Overlay 路由系统
- [ ] 实现存储服务
- [ ] 实现全局用户配置服务

### Phase 2: 领域迁移（第3-4周）
- [ ] 迁移运势分析模块到 fortune 域
- [ ] 迁移健康管理模块到 health 域
- [ ] 迁移成长管理模块到 growth 域
- [ ] 迁移工具模块到 tools 域

### Phase 3: 页面升级（第5-8周）
- [ ] 升级各领域页面 UI
- [ ] 集成设计系统组件
- [ ] 实现原生导航体验

### Phase 4: 优化完善（第9-10周）
- [ ] 性能优化
- [ ] 数据迁移机制
- [ ] 测试和修复

## 4. 与 2.0 的差异

| 方面 | 2.0 | 当前项目 |
|------|-----|----------|
| 构建工具 | Vite 6 | CRA + craco |
| 状态管理 | Zustand | React Context |
| UI 框架 | Tailwind CSS v4 | Tailwind CSS v3 |
| 动画库 | Framer Motion | 待集成 |
| AI 功能 | 完整 AI 域 | 预留接口 |
| 类型系统 | TypeScript | 渐进式迁移 |

## 5. 未来扩展点

1. **AI 智能域**：预留 AI 服务接口，未来可集成 Gemini/OpenAI
2. **数字分身**：预留数字分身数据结构
3. **跨系统共振**：预留多维度数据关联接口
4. **MCP Server**：预留工具注册和调用接口
