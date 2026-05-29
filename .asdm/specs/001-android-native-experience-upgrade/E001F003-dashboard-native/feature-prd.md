# Feature PRD: Dashboard首页原生化

**Epic**: Android原生体验架构升级  
**Feature ID**: E001F003  
**Date**: 2026-05-27  
**Status**: Draft

## 1. Feature Overview

### 1.1 Feature Description
重构Dashboard首页，采用Android原生设计风格，实现现代化的卡片布局、流畅的滚动体验、原生的下拉刷新和加载更多功能。将现有的功能卡片升级为符合Material Design 3规范的组件，提升首页的视觉效果和交互体验。

### 1.2 Business Context
当前Dashboard页面存在以下问题：
- 卡片样式不统一，视觉效果一般
- 滚动性能有待优化
- 缺乏原生的下拉刷新功能
- 功能入口展示不够直观

优化Dashboard可以：
- 提升用户首次打开应用的体验
- 提高功能发现率和使用率
- 增强应用的专业感和现代感
- 提升用户留存率

## 2. User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| US-001 | 作为用户，我希望首页有清晰的功能分区，以便快速找到所需功能 | High | 1. 功能按类别分组展示 2. 有明显的视觉区分 3. 支持自定义排序 |
| US-002 | 作为用户，我希望首页卡片设计现代美观，以便获得愉悦的视觉体验 | High | 1. 卡片符合Material Design 3规范 2. 有阴影和圆角效果 3. 支持深色模式 |
| US-003 | 作为用户，我希望首页支持下拉刷新，以便获取最新数据 | High | 1. 下拉有动画反馈 2. 刷新完成后有提示 3. 支持自定义刷新内容 |
| US-004 | 作为用户，我希望首页滚动流畅，以便快速浏览所有功能 | Medium | 1. 滚动无卡顿 2. 支持惯性滚动 3. 有滚动进度指示 |
| US-005 | 作为用户，我希望有个性化推荐，以便发现更多有用功能 | Medium | 1. 基于使用习惯推荐 2. 有新功能提示 3. 支持收藏功能 |

## 3. Technical Design

### 3.1 页面布局结构

```
┌─────────────────────────────────────┐
│  TopAppBar (可定制)                  │
├─────────────────────────────────────┤
│  个性化Banner区域                    │
│  - 今日运势摘要                     │
│  - 快捷操作入口                     │
├─────────────────────────────────────┤
│  ScrollView (下拉刷新)              │
│  ┌─────────────────────────────────┐│
│  │ 功能分区1: 日常管理             ││
│  │ ┌─────┐ ┌─────┐ ┌─────┐       ││
│  │ │Card1│ │Card2│ │Card3│       ││
│  │ └─────┘ └─────┘ └─────┘       ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 功能分区2: 运势分析             ││
│  │ ┌─────┐ ┌─────┐ ┌─────┐       ││
│  │ │Card4│ │Card5│ │Card6│       ││
│  │ └─────┘ └─────┘ └─────┘       ││
│  └─────────────────────────────────┘│
│  ...                                │
└─────────────────────────────────────┘
```

### 3.2 卡片组件设计

```javascript
// components/dashboard/FeatureCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';

export const FeatureCard = ({
  title,
  subtitle,
  icon,
  color,
  path,
  variant = 'elevated', // elevated, filled, outlined
  size = 'medium', // small, medium, large
}) => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();

  const handleClick = () => {
    triggerHaptic('light');
    navigate(path);
  };

  const baseClasses = 'rounded-xl transition-all duration-200 active:scale-95';
  
  const variantClasses = {
    elevated: 'bg-surface-container-low shadow-md hover:shadow-lg',
    filled: 'bg-primary-container',
    outlined: 'border border-outline bg-surface',
  };

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-5',
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} w-full text-left`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon name={icon} size={24} color={color} />
        </div>
        <div className="flex-1">
          <h3 className="text-on-surface font-medium text-base">{title}</h3>
          {subtitle && (
            <p className="text-on-surface-variant text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        <Icon name="chevron-right" size={20} className="text-on-surface-variant" />
      </div>
    </button>
  );
};
```

### 3.3 下拉刷新实现

```javascript
// components/common/PullToRefresh.js
import React, { useState, useRef, useCallback } from 'react';

export const PullToRefresh = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const threshold = 80; // 触发刷新的下拉距离

  const handleTouchStart = useCallback((e) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    // 使用阻尼系数，让下拉感觉更自然
    const dampedDistance = Math.min(distance * 0.5, 150);
    setPullDistance(dampedDistance);
    
    if (distance > 0) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    
    setPullDistance(0);
    isPulling.current = false;
  }, [pullDistance, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-auto h-full"
    >
      {/* 下拉指示器 */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center transition-transform duration-200"
        style={{ 
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: pullDistance / threshold 
        }}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary-container ${
          isRefreshing ? 'animate-spin' : ''
        }`}>
          <Icon 
            name={isRefreshing ? 'loading' : 'arrow-down'} 
            size={20} 
            className="text-primary"
          />
        </div>
      </div>
      
      {/* 内容区域 */}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
};
```

### 3.4 功能分区组件

```javascript
// components/dashboard/FeatureSection.js
import React from 'react';

export const FeatureSection = ({ title, icon, children }) => {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 px-4 mb-3">
        {icon && <Icon name={icon} size={20} className="text-primary" />}
        <h2 className="text-on-surface font-medium text-lg">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4">
        {children}
      </div>
    </section>
  );
};
```

### 3.5 快捷操作入口

```javascript
// components/dashboard/QuickActions.js
import React from 'react';

const QUICK_ACTIONS = [
  { icon: 'calendar', label: '今日运势', color: '#6750A4' },
  { icon: 'heart', label: '健康打卡', color: '#B3261E' },
  { icon: 'star', label: '星座运势', color: '#7C5800' },
  { icon: 'clock', label: '生物节律', color: '#386A20' },
];

export const QuickActions = () => {
  return (
    <div className="flex justify-around px-4 py-3 bg-surface-container">
      {QUICK_ACTIONS.map((action, index) => (
        <button
          key={index}
          className="flex flex-col items-center gap-1"
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: action.color + '20' }}
          >
            <Icon name={action.icon} size={24} color={action.color} />
          </div>
          <span className="text-xs text-on-surface-variant">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
```

## 4. Implementation Plan

### 4.1 Phase 1: 布局重构
- 设计新的页面布局结构
- 实现响应式网格系统
- 优化页面滚动性能

### 4.2 Phase 2: 卡片组件升级
- 设计Material Design 3风格卡片
- 实现卡片动画效果
- 支持卡片自定义样式

### 4.3 Phase 3: 交互功能
- 实现下拉刷新功能
- 添加滚动动画效果
- 实现功能分区折叠

### 4.4 Phase 4: 个性化功能
- 实现功能排序和隐藏
- 添加个性化推荐
- 实现新功能提示

## 5. Acceptance Criteria

- [ ] 页面布局符合Material Design 3规范
- [ ] 卡片组件风格统一，支持多种变体
- [ ] 下拉刷新功能正常工作，有流畅动画
- [ ] 滚动性能优化，无卡顿
- [ ] 支持功能分区展示和折叠
- [ ] 支持个性化排序和隐藏
- [ ] 深色模式下显示正常

## 6. Technical Dependencies

- React 18.x
- Tailwind CSS 3.x
- @capacitor/haptics
- 设计系统组件库（E001F001）

## 7. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 卡片组件与现有功能冲突 | 中 | 高 | 保持向后兼容，渐进式迁移 |
| 下拉刷新与页面滚动冲突 | 中 | 中 | 合理设置触发条件和边界 |
| 个性化功能增加复杂度 | 低 | 中 | 简化配置，提供默认设置 |
| 性能问题 | 低 | 高 | 使用虚拟列表和懒加载 |
