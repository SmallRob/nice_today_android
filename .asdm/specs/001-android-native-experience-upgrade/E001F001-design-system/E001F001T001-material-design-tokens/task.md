# Task: Material Design 3设计令牌系统

**Feature**: 设计系统与组件库  
**Task ID**: E001F001T001  
**Date**: 2026-05-27  
**Status**: Draft

## 1. Task Overview

### 1.1 Task Description
实现基于Material Design 3的设计令牌系统，包含颜色、字体、间距、阴影、圆角等设计基础变量。支持亮色和深色主题切换，为整个应用提供统一的设计语言基础。

### 1.2 Business Value
- 统一视觉语言，提升品牌形象
- 简化主题切换和深色模式支持
- 提高开发效率，减少样式重复定义
- 为后续组件开发提供设计基础

## 2. Requirements

### 2.1 Functional Requirements
1. **颜色系统**
   - 定义主色调（Primary）、次要色（Secondary）、强调色（Tertiary）
   - 定义表面色（Surface）、背景色（Background）
   - 定义状态色（Error、Success、Warning）
   - 支持亮色和深色主题

2. **字体系统**
   - 定义字体族（Font Family）
   - 定义字体大小（Font Size）
   - 定义行高（Line Height）
   - 定义字重（Font Weight）
   - 定义字间距（Letter Spacing）

3. **间距系统**
   - 定义基础间距单位
   - 定义常用间距值（xs、sm、md、lg、xl等）
   - 支持响应式间距

4. **阴影系统**
   - 定义5级阴影（level0-level5）
   - 支持深色模式下的阴影调整

5. **圆角系统**
   - 定义常用圆角值
   - 支持全圆角（full）

### 2.2 Non-Functional Requirements
1. **性能要求**
   - CSS变量加载时间<50ms
   - 主题切换响应时间<100ms

2. **兼容性要求**
   - 支持现代浏览器（Chrome、Safari、Firefox、Edge）
   - 支持WebView环境

3. **可维护性要求**
   - 代码结构清晰，易于扩展
   - 提供完整的文档说明

## 3. Technical Design

### 3.1 文件结构

```
frontend/src/design-system/
├── tokens/
│   ├── colors.js          # 颜色令牌
│   ├── colors.dark.js     # 深色模式颜色
│   ├── typography.js      # 字体令牌
│   ├── spacing.js         # 间距令牌
│   ├── elevation.js       # 阴影令牌
│   ├── borderRadius.js    # 圆角令牌
│   └── index.js           # 统一导出
├── utils/
│   ├── cssVariables.js    # CSS变量生成工具
│   └── themeProvider.js   # 主题提供者
└── index.js               # 主入口
```

### 3.2 颜色令牌实现

```javascript
// tokens/colors.js
export const lightColors = {
  // 主色调 - Material Design 3 Primary
  primary: {
    main: '#6750A4',
    on: '#FFFFFF',
    container: '#EADDFF',
    onContainer: '#21005D',
    // 渐变色
    gradient: 'linear-gradient(135deg, #6750A4 0%, #9A82DB 100%)',
  },
  
  // 次要色
  secondary: {
    main: '#625B71',
    on: '#FFFFFF',
    container: '#E8DEF8',
    onContainer: '#1D192B',
  },
  
  // 强调色
  tertiary: {
    main: '#7D5260',
    on: '#FFFFFF',
    container: '#FFD8E4',
    onContainer: '#31111D',
  },
  
  // 表面色
  surface: {
    main: '#FEF7FF',
    dim: '#DED8E1',
    bright: '#FEF7FF',
    container: '#F3EDF7',
    containerLow: '#F7F2FA',
    containerHigh: '#ECE6F0',
    containerHighest: '#E6E0E9',
  },
  
  // 背景色
  background: '#FEF7FF',
  onBackground: '#1D1B20',
  
  // 状态色
  error: {
    main: '#B3261E',
    on: '#FFFFFF',
    container: '#F9DEDC',
    onContainer: '#410E0B',
  },
  
  success: {
    main: '#386A20',
    on: '#FFFFFF',
    container: '#B8F397',
    onContainer: '#0F2007',
  },
  
  warning: {
    main: '#7C5800',
    on: '#FFFFFF',
    container: '#FFDEA6',
    onContainer: '#271900',
  },
  
  info: {
    main: '#0061A4',
    on: '#FFFFFF',
    container: '#D1E4FF',
    onContainer: '#001D36',
  },
  
  // 文本色
  text: {
    primary: '#1D1B20',
    secondary: '#49454F',
    tertiary: '#79747E',
    disabled: '#1D1B201F',
  },
  
  // 边框色
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
};
```

### 3.3 CSS变量生成工具

```javascript
// utils/cssVariables.js
export const generateCSSVariables = (tokens, prefix = '') => {
  const variables = {};
  
  const processObject = (obj, currentPrefix) => {
    Object.entries(obj).forEach(([key, value]) => {
      const variableName = currentPrefix 
        ? `${currentPrefix}-${key}` 
        : key;
      
      if (typeof value === 'object' && value !== null) {
        processObject(value, variableName);
      } else {
        variables[`--${variableName}`] = value;
      }
    });
  };
  
  processObject(tokens, prefix);
  return variables;
};

export const applyCSSVariables = (variables, element = document.documentElement) => {
  Object.entries(variables).forEach(([name, value]) => {
    element.style.setProperty(name, value);
  });
};

export const removeCSSVariables = (variables, element = document.documentElement) => {
  Object.keys(variables).forEach((name) => {
    element.style.removeProperty(name);
  });
};
```

### 3.4 主题提供者

```javascript
// utils/themeProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightColors, darkColors } from '../tokens/colors';
import { generateCSSVariables, applyCSSVariables } from './cssVariables';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, defaultTheme = 'light' }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [isDark, setIsDark] = useState(defaultTheme === 'dark');
  
  useEffect(() => {
    const colors = isDark ? darkColors : lightColors;
    const variables = generateCSSVariables(colors, 'color');
    applyCSSVariables(variables);
    
    // 更新meta标签
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', 
      isDark ? '#141218' : '#FEF7FF'
    );
    
    // 更新class
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    setTheme(isDark ? 'light' : 'dark');
  };
  
  const value = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 3.5 Tailwind CSS配置

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary-main)',
          on: 'var(--color-primary-on)',
          container: 'var(--color-primary-container)',
          'on-container': 'var(--color-primary-onContainer)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary-main)',
          on: 'var(--color-secondary-on)',
          container: 'var(--color-secondary-container)',
          'on-container': 'var(--color-secondary-onContainer)',
        },
        tertiary: {
          DEFAULT: 'var(--color-tertiary-main)',
          on: 'var(--color-tertiary-on)',
          container: 'var(--color-tertiary-container)',
          'on-container': 'var(--color-tertiary-onContainer)',
        },
        surface: {
          DEFAULT: 'var(--color-surface-main)',
          dim: 'var(--color-surface-dim)',
          bright: 'var(--color-surface-bright)',
          container: 'var(--color-surface-container)',
          'container-low': 'var(--color-surface-containerLow)',
          'container-high': 'var(--color-surface-containerHigh)',
          'container-highest': 'var(--color-surface-containerHighest)',
        },
        background: 'var(--color-background)',
        'on-background': 'var(--color-onBackground)',
        error: {
          DEFAULT: 'var(--color-error-main)',
          on: 'var(--color-error-on)',
          container: 'var(--color-error-container)',
          'on-container': 'var(--color-error-onContainer)',
        },
        success: {
          DEFAULT: 'var(--color-success-main)',
          on: 'var(--color-success-on)',
          container: 'var(--color-success-container)',
          'on-container': 'var(--color-success-onContainer)',
        },
        warning: {
          DEFAULT: 'var(--color-warning-main)',
          on: 'var(--color-warning-on)',
          container: 'var(--color-warning-container)',
          'on-container': 'var(--color-warning-onContainer)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '28px',
        full: '9999px',
      },
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
```

## 4. Implementation Steps

### 4.1 Step 1: 创建设计令牌文件
- 创建tokens目录结构
- 实现颜色、字体、间距等令牌
- 支持亮色和深色主题

### 4.2 Step 2: 实现CSS变量生成工具
- 创建CSS变量生成函数
- 实现变量应用和移除功能
- 优化性能

### 4. Step 3: 实现主题提供者
- 创建ThemeContext
- 实现主题切换功能
- 支持系统主题检测

### 4.4 Step 4: 配置Tailwind CSS
- 更新Tailwind配置
- 映射设计令牌到Tailwind
- 测试样式应用

### 4.5 Step 5: 编写文档
- 编写设计令牌使用文档
- 提供示例代码
- 创建演示页面

## 5. Acceptance Criteria

- [ ] 设计令牌系统完整，包含颜色、字体、间距、阴影、圆角等
- [ ] 支持亮色和深色主题切换
- [ ] CSS变量正确生成和应用
- [ ] Tailwind CSS正确映射设计令牌
- [ ] 主题切换响应时间<100ms
- [ ] 文档完整，包含使用说明和示例
- [ ] 演示页面正常工作

## 6. Testing Strategy

### 6.1 单元测试
- 测试CSS变量生成函数
- 测试主题切换功能
- 测试令牌值正确性

### 6.2 集成测试
- 测试Tailwind CSS配置
- 测试主题提供者组件
- 测试样式应用效果

### 6.3 视觉测试
- 验证亮色模式显示效果
- 验证深色模式显示效果
- 验证主题切换动画

## 7. Dependencies

- Tailwind CSS 3.x
- React 18.x
- 现代浏览器支持CSS Variables

## 8. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSS变量兼容性问题 | 低 | 高 | 提供降级方案，使用PostCSS插件 |
| 主题切换性能问题 | 低 | 中 | 使用CSS变量，避免重渲染 |
| Tailwind配置复杂 | 中 | 中 | 简化配置，提供默认值 |
| 文档不完善 | 中 | 低 | 持续更新文档，提供示例 |
