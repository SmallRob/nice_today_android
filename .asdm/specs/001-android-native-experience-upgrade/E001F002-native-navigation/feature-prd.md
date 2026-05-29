# Feature PRD: 原生导航与动画系统

**Epic**: Android原生体验架构升级  
**Feature ID**: E001F002  
**Date**: 2026-05-27  
**Status**: Draft

## 1. Feature Overview

### 1.1 Feature Description
重构应用导航系统，实现符合Android原生体验的页面过渡动画、手势操作和导航模式。包括实现原生级别的页面切换动画、手势返回支持、底部导航栏、顶部应用栏等Android标准导航组件。

### 1.2 Business Context
当前应用使用React Router进行页面导航，存在以下问题：
- 页面切换生硬，无过渡动画
- 不支持Android手势返回
- 导航结构不符合Android用户习惯
- 页面栈管理不够原生

实现原生导航系统可以：
- 提升用户体验的流畅度
- 符合Android用户操作习惯
- 减少用户学习成本
- 提升应用的专业感

## 2. User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| US-001 | 作为用户，我希望页面切换有流畅的过渡动画，以便获得原生应用般的体验 | High | 1. 页面进入/退出有动画 2. 动画流畅无卡顿 3. 支持自定义动画 |
| US-002 | 作为用户，我希望支持手势返回，以便更自然地操作应用 | High | 1. 支持从左边缘右滑返回 2. 支持从右边缘左滑返回 3. 有手势进度反馈 |
| US-003 | 作为用户，我希望有清晰的导航结构，以便快速找到所需功能 | High | 1. 底部导航栏显示主要功能 2. 顶部应用栏显示当前页面 3. 支持返回按钮 |
| US-004 | 作为用户，我希望页面栈管理符合Android习惯，以便正确管理页面历史 | Medium | 1. 返回按钮行为正确 2. 支持深度链接 3. 支持页面状态保存 |
| US-005 | 作为用户，我希望有页面切换的视觉反馈，以便了解当前操作状态 | Medium | 1. 页面切换有进度指示 2. 加载状态有动画 3. 错误状态有提示 |

## 3. Technical Design

### 3.1 导航架构

```
现有架构：
App.js → React Router → Pages

目标架构：
App.js → NavigationContainer → NativeStackNavigator
                              → BottomTabNavigator
                              → DrawerNavigator
```

### 3.2 页面过渡动画

```javascript
// animations/pageTransitions.js
export const pageTransitions = {
  // Android标准Material过渡
  material: {
    enter: {
      from: { transform: 'translateX(100%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    },
    exit: {
      from: { transform: 'translateX(0)', opacity: 1 },
      to: { transform: 'translateX(-30%)', opacity: 0.5 },
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    },
  },
  // 淡入淡出过渡
  fade: {
    enter: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 200,
      easing: 'ease-in-out',
    },
    exit: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 150,
      easing: 'ease-in-out',
    },
  },
  // 底部滑入过渡（用于模态页面）
  slideUp: {
    enter: {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
      duration: 350,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    },
    exit: {
      from: { transform: 'translateY(0)' },
      to: { transform: 'translateY(100%)' },
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    },
  },
};
```

### 3.3 手势返回支持

```javascript
// hooks/useGestureBack.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGestureBack = (options = {}) => {
  const navigate = useNavigate();
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  
  const {
    edgeWidth = 20, // 边缘触发区域宽度
    threshold = 50, // 触发返回的滑动距离
    direction = 'horizontal', // horizontal 或 vertical
  } = options;

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      
      // 检查是否在边缘区域
      const isLeftEdge = touch.clientX < edgeWidth;
      const isRightEdge = touch.clientX > window.innerWidth - edgeWidth;
      
      if (direction === 'horizontal') {
        isDragging.current = isLeftEdge || isRightEdge;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;
      
      // 检查滑动方向
      if (direction === 'horizontal' && Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动，阻止默认行为
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (!isDragging.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX.current;
      
      // 判断是否触发返回
      if (direction === 'horizontal' && Math.abs(deltaX) > threshold) {
        navigate(-1);
      }
      
      isDragging.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, edgeWidth, threshold, direction]);
};
```

### 3.4 底部导航栏

```javascript
// components/navigation/BottomNavBar.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';

const NAV_ITEMS = [
  { path: '/', icon: 'home', label: '首页' },
  { path: '/fortune', icon: 'star', label: '运势' },
  { path: '/health', icon: 'heart', label: '健康' },
  { path: '/tools', icon: 'wrench', label: '工具' },
  { path: '/profile', icon: 'user', label: '我的' },
];

export const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();

  const handleNavClick = (path) => {
    triggerHaptic('light');
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-high elevation-2">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <div className={`w-16 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                isActive ? 'bg-primary-container' : ''
              }`}>
                <Icon name={item.icon} size={24} />
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

### 3.5 顶部应用栏

```javascript
// components/navigation/TopAppBar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';

export const TopAppBar = ({ 
  title, 
  showBack = false, 
  actions = [],
  variant = 'small' // small, medium, large
}) => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();

  const handleBack = () => {
    triggerHaptic('light');
    navigate(-1);
  };

  return (
    <header className={`bg-surface ${variant === 'small' ? 'h-14' : 'h-20'} elevation-0`}>
      <div className="flex items-center h-14 px-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
          >
            <Icon name="arrow-left" size={24} />
          </button>
        )}
        <h1 className={`flex-1 ml-4 text-on-surface ${variant === 'small' ? 'text-lg' : 'text-xl'} font-medium`}>
          {title}
        </h1>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
          >
            <Icon name={action.icon} size={24} />
          </button>
        ))}
      </div>
    </header>
  );
};
```

## 4. Implementation Plan

### 4.1 Phase 1: 导航系统重构
- 重构React Router配置
- 实现页面栈管理
- 添加页面过渡动画

### 4.2 Phase 2: 手势支持
- 实现手势返回功能
- 添加手势进度反馈
- 优化手势触发区域

### 4.3 Phase 3: 导航组件
- 实现BottomNavBar组件
- 实现TopAppBar组件
- 实现Drawer组件

### 4.4 Phase 4: 动画优化
- 优化页面切换动画
- 添加微交互动画
- 性能优化和测试

## 5. Acceptance Criteria

- [ ] 页面切换有流畅的Material过渡动画
- [ ] 支持从左边缘右滑返回
- [ ] 底部导航栏显示主要功能入口
- [ ] 顶部应用栏显示当前页面标题和返回按钮
- [ ] 页面栈管理符合Android用户习惯
- [ ] 动画流畅度达到60fps
- [ ] 支持深色模式下的导航样式

## 6. Technical Dependencies

- React Router DOM 7.x
- @capacitor/haptics
- @capacitor/status-bar
- Framer Motion 或 React Spring

## 7. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 手势与页面滚动冲突 | 中 | 高 | 合理设置手势触发区域和条件 |
| 动画性能问题 | 中 | 中 | 使用CSS transform和will-change优化 |
| 页面栈管理复杂 | 中 | 中 | 简化页面层级，优化路由配置 |
| 与现有代码冲突 | 低 | 高 | 渐进式迁移，保持向后兼容 |
