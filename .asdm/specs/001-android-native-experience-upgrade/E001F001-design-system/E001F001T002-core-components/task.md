# Task: 核心UI组件库

**Feature**: 设计系统与组件库  
**Task ID**: E001F001T002  
**Date**: 2026-05-27  
**Status**: Draft

## 1. Task Overview

### 1.1 Task Description
基于Material Design 3设计规范，实现核心UI组件库，包含Button、Card、Input、Navigation等基础组件。组件支持主题定制、深色模式、动画效果，为整个应用提供统一、现代、原生的UI组件。

### 1.2 Business Value
- 提高开发效率，减少重复开发
- 统一视觉风格，提升品牌形象
- 支持主题定制，满足个性化需求
- 提供原生体验，提升用户满意度

## 2. Requirements

### 2.1 Functional Requirements
1. **Button组件**
   - 支持多种变体：Filled、Outlined、Text、Icon
   - 支持多种尺寸：Small、Medium、Large
   - 支持禁用状态、加载状态
   - 支持图标和文字组合
   - 支持点击动画效果

2. **Card组件**
   - 支持多种变体：Elevated、Filled、Outlined
   - 支持头部、内容、底部区域
   - 支持点击、长按交互
   - 支持阴影和圆角定制

3. **Input组件**
   - 支持文本输入、密码输入
   - 支持下拉选择、日期选择
   - 支持输入验证和错误提示
   - 支持前缀、后缀图标

4. **Navigation组件**
   - TopAppBar：顶部应用栏
   - BottomNavigation：底部导航栏
   - Drawer：侧边栏
   - Tabs：标签页

5. **DataDisplay组件**
   - List：列表
   - Chip：标签
   - Badge：徽章
   - Avatar：头像

6. **Feedback组件**
   - Dialog：对话框
   - Snackbar：消息提示
   - Progress：进度条
   - Skeleton：骨架屏

### 2.2 Non-Functional Requirements
1. **性能要求**
   - 组件渲染时间<16ms
   - 动画流畅度60fps
   - 内存占用合理

2. **可访问性要求**
   - 支持键盘导航
   - 支持屏幕阅读器
   - 符合WCAG 2.1标准

3. **可维护性要求**
   - 组件接口清晰
   - 代码结构合理
   - 文档完整

## 3. Technical Design

### 3.1 组件目录结构

```
frontend/src/design-system/components/
├── Button/
│   ├── Button.js
│   ├── Button.stories.js
│   ├── Button.test.js
│   └── index.js
├── Card/
│   ├── Card.js
│   ├── Card.stories.js
│   ├── Card.test.js
│   └── index.js
├── Input/
│   ├── Input.js
│   ├── Select.js
│   ├── DatePicker.js
│   ├── Input.stories.js
│   ├── Input.test.js
│   └── index.js
├── Navigation/
│   ├── TopAppBar.js
│   ├── BottomNavigation.js
│   ├── Drawer.js
│   ├── Tabs.js
│   └── index.js
├── DataDisplay/
│   ├── List.js
│   ├── Chip.js
│   ├── Badge.js
│   ├── Avatar.js
│   └── index.js
├── Feedback/
│   ├── Dialog.js
│   ├── Snackbar.js
│   ├── Progress.js
│   ├── Skeleton.js
│   └── index.js
└── index.js
```

### 3.2 Button组件实现

```javascript
// components/Button/Button.js
import React from 'react';
import { motion } from 'framer-motion';
import { useHaptics } from '../../../hooks/useHaptics';

const buttonVariants = {
  filled: {
    base: 'bg-primary text-on-primary',
    hover: 'hover:bg-primary/90',
    active: 'active:bg-primary/80',
    disabled: 'bg-on-surface/12 text-on-surface/38',
  },
  outlined: {
    base: 'border border-outline bg-transparent text-primary',
    hover: 'hover:bg-primary/8',
    active: 'active:bg-primary/12',
    disabled: 'border-on-surface/12 text-on-surface/38',
  },
  text: {
    base: 'bg-transparent text-primary',
    hover: 'hover:bg-primary/8',
    active: 'active:bg-primary/12',
    disabled: 'text-on-surface/38',
  },
  elevated: {
    base: 'bg-surface-container-low shadow-elevation-1 text-primary',
    hover: 'hover:shadow-elevation-2',
    active: 'active:shadow-elevation-1',
    disabled: 'bg-on-surface/12 text-on-surface/38 shadow-none',
  },
  tonal: {
    base: 'bg-secondary-container text-on-secondary-container',
    hover: 'hover:bg-secondary-container/90',
    active: 'active:bg-secondary-container/80',
    disabled: 'bg-on-surface/12 text-on-surface/38',
  },
};

const buttonSizes = {
  small: 'h-8 px-4 text-xs',
  medium: 'h-10 px-6 text-sm',
  large: 'h-12 px-8 text-base',
};

export const Button = ({
  variant = 'filled',
  size = 'medium',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  children,
  className = '',
  ...props
}) => {
  const { triggerHaptic } = useHaptics();

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    triggerHaptic('light');
    onClick?.(e);
  };

  const variantClasses = buttonVariants[variant];
  const sizeClasses = buttonSizes[size];

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/50
    ${variantClasses.base}
    ${variantClasses.hover}
    ${variantClasses.active}
    ${disabled ? variantClasses.disabled : ''}
    ${sizeClasses}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );

  return (
    <motion.button
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {content}
    </motion.button>
  );
};
```

### 3.3 Card组件实现

```javascript
// components/Card/Card.js
import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  elevated: {
    base: 'bg-surface-container-low shadow-elevation-1',
    hover: 'hover:shadow-elevation-2',
  },
  filled: {
    base: 'bg-surface-container-high',
    hover: 'hover:bg-surface-container-high/80',
  },
  outlined: {
    base: 'border border-outline-variant bg-surface',
    hover: 'hover:bg-surface-container-low',
  },
};

export const Card = ({
  variant = 'elevated',
  onClick,
  onLongPress,
  children,
  className = '',
  ...props
}) => {
  const variantClasses = cardVariants[variant];

  const baseClasses = `
    rounded-xl overflow-hidden
    transition-all duration-200
    ${variantClasses.base}
    ${onClick ? 'cursor-pointer ' + variantClasses.hover : ''}
    ${className}
  `;

  const handleLongPress = (e) => {
    if (onLongPress) {
      e.preventDefault();
      onLongPress(e);
    }
  };

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      onContextMenu={handleLongPress}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`p-4 pb-2 ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-on-surface font-medium text-base">{title}</h3>
        {subtitle && (
          <p className="text-on-surface-variant text-sm mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-4 py-2 ${className}`}>
    {children}
  </div>
);

export const CardMedia = ({ src, alt, aspectRatio = '16/9', className = '' }) => (
  <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </div>
);

export const CardActions = ({ children, className = '' }) => (
  <div className={`p-4 pt-2 flex items-center justify-end gap-2 ${className}`}>
    {children}
  </div>
);
```

### 3.4 Input组件实现

```javascript
// components/Input/Input.js
import React, { useState, useRef, useEffect } from 'react';

export const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  prefixIcon = null,
  suffixIcon = null,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const containerClasses = `
    relative w-full
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `;

  const inputClasses = `
    w-full h-14 px-4 pt-4 pb-1
    bg-surface-container-high
    rounded-t-lg
    text-on-surface
    placeholder-transparent
    focus:outline-none
    disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const labelClasses = `
    absolute left-4 transition-all duration-200 pointer-events-none
    ${isFocused || hasValue 
      ? 'top-2 text-xs text-primary' 
      : 'top-4 text-base text-on-surface-variant'}
    ${error ? 'text-error' : ''}
  `;

  const borderClasses = `
    absolute bottom-0 left-0 right-0 h-0.5
    ${error ? 'bg-error' : isFocused ? 'bg-primary' : 'bg-on-surface-variant'}
    transition-colors duration-200
  `;

  return (
    <div className={containerClasses}>
      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {prefixIcon}
          </div>
        )}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={`${inputClasses} ${prefixIcon ? 'pl-10' : ''} ${suffixIcon ? 'pr-10' : ''}`}
          placeholder={placeholder || label}
          {...props}
        />
        <label className={labelClasses}>
          {label}{required && ' *'}
        </label>
        {suffixIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {suffixIcon}
          </div>
        )}
        <div className={borderClasses} />
      </div>
      {(error || helperText) && (
        <p className={`mt-1 text-xs ${error ? 'text-error' : 'text-on-surface-variant'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export const Select = ({
  label,
  options,
  value,
  onChange,
  error = '',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full h-14 px-4 flex items-center justify-between
          bg-surface-container-high rounded-t-lg
          text-left
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div>
          <span className={`block text-xs ${value ? 'text-primary' : 'text-on-surface-variant'}`}>
            {label}
          </span>
          <span className={`block mt-0.5 ${value ? 'text-on-surface' : 'text-transparent'}`}>
            {selectedOption?.label || '\u00A0'}
          </span>
        </div>
        <svg 
          className={`w-5 h-5 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${error ? 'bg-error' : 'bg-on-surface-variant'}`} />
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-surface-container-high rounded-lg shadow-elevation-3 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 text-left
                hover:bg-surface-container-high/80
                ${option.value === value ? 'bg-primary-container' : ''}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-error">{error}</p>
      )}
    </div>
  );
};
```

### 3.5 Navigation组件实现

```javascript
// components/Navigation/TopAppBar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';

export const TopAppBar = ({
  title,
  subtitle,
  showBack = false,
  actions = [],
  variant = 'small', // small, medium, large
  transparent = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();

  const handleBack = () => {
    triggerHaptic('light');
    navigate(-1);
  };

  const heightClasses = {
    small: 'h-14',
    medium: 'h-20',
    large: 'h-28',
  };

  return (
    <header 
      className={`
        ${heightClasses[variant]}
        ${transparent ? 'bg-transparent' : 'bg-surface'}
        flex items-end
        transition-colors duration-200
        ${className}
      `}
    >
      <div className="flex items-center w-full h-14 px-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors -ml-2"
          >
            <svg className="w-6 h-6 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className={`flex-1 ${showBack ? 'ml-2' : ''}`}>
          {variant === 'small' ? (
            <h1 className="text-on-surface text-lg font-medium truncate">{title}</h1>
          ) : (
            <>
              {subtitle && (
                <p className="text-on-surface-variant text-sm">{subtitle}</p>
              )}
              <h1 className="text-on-surface text-2xl font-medium">{title}</h1>
            </>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center gap-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

// components/Navigation/BottomNavigation.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';

export const BottomNavigation = ({ items }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();

  const handleNavClick = (path) => {
    triggerHaptic('light');
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-high shadow-elevation-2 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`
                flex flex-col items-center justify-center w-16 h-full
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-on-surface-variant'}
              `}
            >
              <div 
                className={`
                  w-16 h-8 flex items-center justify-center rounded-full
                  transition-all duration-200
                  ${isActive ? 'bg-primary-container' : ''}
                `}
              >
                {item.icon}
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

## 4. Implementation Steps

### 4.1 Step 1: 创建组件目录结构
- 创建组件目录
- 定义组件接口
- 实现基础样式

### 4.2 Step 2: 实现Button组件
- 实现多种变体
- 支持图标和加载状态
- 添加动画效果

### 4.3 Step 3: 实现Card组件
- 实现多种变体
- 支持头部、内容、底部
- 添加交互效果

### 4.4 Step 4: 实现Input组件
- 实现文本输入
- 实现下拉选择
- 添加验证功能

### 4.5 Step 5: 实现Navigation组件
- 实现TopAppBar
- 实现BottomNavigation
- 支持多种变体

### 4.6 Step 6: 实现其他组件
- DataDisplay组件
- Feedback组件
- 复合组件

### 4.7 Step 7: 编写文档和测试
- 编写使用文档
- 编写单元测试
- 创建演示页面

## 5. Acceptance Criteria

- [ ] Button组件支持所有变体和尺寸
- [ ] Card组件支持所有变体和交互
- [ ] Input组件支持输入和选择功能
- [ ] Navigation组件支持顶部和底部导航
- [ ] 所有组件支持深色模式
- [ ] 所有组件支持动画效果
- [ ] 组件文档完整
- [ ] 单元测试覆盖率>80%

## 6. Testing Strategy

### 6.1 单元测试
- 测试组件渲染
- 测试交互功能
- 测试状态变化

### 6.2 集成测试
- 测试组件组合
- 测试主题切换
- 测试动画效果

### 6.3 视觉测试
- 验证亮色模式
- 验证深色模式
- 验证响应式布局

## 7. Dependencies

- Framer Motion（动画）
- 设计令牌系统（E001F001T001）
- React 18.x

## 8. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 组件兼容性问题 | 中 | 高 | 充分测试，提供降级方案 |
| 动画性能问题 | 中 | 中 | 优化动画实现，使用CSS transform |
| 组件接口设计不合理 | 中 | 中 | 参考Material Design规范，收集反馈 |
| 文档不完善 | 低 | 低 | 持续更新文档，提供示例 |
