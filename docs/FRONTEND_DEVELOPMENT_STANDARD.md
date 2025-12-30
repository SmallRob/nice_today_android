# Nice Today 前端开发规范文档

## 📚 文档说明

本文档是 Nice Today 项目的前端开发规范，基于 React 18.2.0 + Tailwind CSS 3.2.7 + Capacitor 5.7.8 技术栈编写。旨在统一团队开发标准，提升代码质量，优化用户体验。

**文档版本**: 1.0.0  
**最后更新**: 2025-12-30  
**维护者**: 开发团队

---

## 📋 目录

- [一、项目概述](#一项目概述)
- [二、代码风格指南](#二代码风格指南)
- [三、组件设计原则](#三组件设计原则)
- [四、状态管理最佳实践](#四状态管理最佳实践)
- [五、性能优化建议](#五性能优化建议)
- [六、测试策略](#六测试策略)
- [七、移动端适配规范](#七移动端适配规范)
- [八、错误处理规范](#八错误处理规范)
- [九、代码审查清单](#九代码审查清单)
- [十、最佳实践总结](#十最佳实践总结)

---

## 一、项目概述

### 1.1 技术栈

#### 前端框架
- **React**: 18.2.0 - UI框架
- **React Router DOM**: 7.10.1 - 路由管理
- **Tailwind CSS**: 3.2.7 - 样式框架
- **CRACO**: 7.1.0 - 构建工具配置

#### 状态管理
- **Context API**: 全局状态
- **@tanstack/react-store**: 复杂状态管理
- **@tanstack/react-form**: 表单管理

#### 移动端
- **Capacitor**: 5.7.8 - 跨平台移动开发
- **Capacitor Plugins**: 设备功能访问（文件系统、网络、通知等）

#### 工具库
- **axios**: 1.13.2 - HTTP客户端
- **lunar-javascript**: 1.7.7 - 农历/八字计算
- **@iconify/react**: 6.0.2 - 图标库

#### 测试
- **Jest**: 单元测试
- **React Testing Library**: 组件测试
- **Playwright/Cypress**: E2E测试

### 1.2 项目结构

```
frontend/
├── src/
│   ├── components/        # 业务组件
│   │   ├── common/        # 通用组件
│   │   ├── mobile/        # 移动端专用组件
│   │   └── features/      # 功能组件
│   ├── contexts/          # 全局上下文
│   ├── hooks/             # 自定义Hooks
│   ├── services/          # API服务层
│   ├── utils/             # 工具函数
│   ├── pages/             # 页面组件
│   ├── App.js             # 应用入口
│   └── index.css          # 全局样式
├── public/                # 静态资源
├── test/                  # 测试配置和脚本
├── docs/                  # 项目文档
└── package.json
```

### 1.3 开发环境要求

- **Node.js**: >= 14.x
- **npm**: >= 6.x 或 yarn >= 1.22.x
- **Android Studio**: (Android开发)
- **Xcode**: (iOS开发)

---

## 二、代码风格指南

### 2.1 文件命名规范

#### 组件文件
- **格式**: PascalCase
- **示例**: `UserProfile.jsx`, `BiorhythmDashboard.js`

#### 工具文件
- **格式**: camelCase
- **示例**: `baziHelper.js`, `dataService.js`, `astronomy.js`

#### Hook文件
- **格式**: `use` + PascalCase
- **示例**: `useUserInfo.js`, `useThemeColor.js`

#### Context文件
- **格式**: PascalCase + `Context`
- **示例**: `UserConfigContext.js`, `ThemeContext.js`

#### 配置文件
- **格式**: camelCase
- **示例**: `tailwind.config.js`, `craco.config.js`, `jest.config.js`

#### 测试文件
- **格式**: `*.test.js` 或 `*.test.jsx`
- **示例**: `UserProfile.test.js`, `BiorhythmCalculator.test.js`

### 2.2 组件命名规范

#### 组件名称
```jsx
// ✅ 正确 - PascalCase
export const UserProfile = () => {};
export const BiorhythmDashboard = () => {};
export const MayaCalendar = () => {};

// ❌ 错误
export const userProfile = () => {};
export const biorhythm_dashboard = () => {};
export const maya_calendar = () => {};
```

#### DOM元素标签
```jsx
// ✅ 正确 - 全小写
<div className="container">
  <button onClick={handleClick}>点击</button>
  <input type="text" placeholder="请输入..." />
</div>

// ❌ 错误
<Div className="container">
  <Button onClick={handleClick}>点击</Button>
</Div>
```

### 2.3 变量和函数命名规范

#### 变量和函数
```javascript
// ✅ 正确 - camelCase
const userName = '张三';
const birthDate = new Date();
const calculateAge = () => {};
const fetchUserData = async () => {};
const handleButtonClick = () => {};

// ❌ 错误
const UserName = '张三';
const Birth_Date = new Date();
const Calculate_Age = () => {};
```

#### 常量
```javascript
// ✅ 正确 - UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = 'https://api.example.com';
const STORAGE_KEY_USER_CONFIG = 'user_config';

// ❌ 错误
const maxRetryCount = 3;
const DefaultTimeout = 5000;
```

#### 布尔变量
```javascript
// ✅ 正确 - 使用 is/has/should 前缀
const isLoading = true;
const hasError = false;
const shouldShowModal = true;
const isUserLoggedIn = true;
const hasPermission = false;

// ❌ 错误
const loading = true;
const error = false;
const showModal = true;
```

### 2.4 CSS类名规范

#### Tailwind CSS工具类
```jsx
// ✅ 优先使用 Tailwind 工具类
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">

// ✅ 响应式类名
<div className="p-4 md:p-6 lg:p-8">
```

#### 自定义类名
```jsx
// ✅ 正确 - kebab-case
<div className="user-profile-container">
<div className="biorhythm-chart__legend">
<div className="energy-bar-container">

// ❌ 错误
<div className="UserProfileContainer">
<div className="biorhythmChartLegend">
```

### 2.5 注释规范

#### 组件注释
```javascript
/**
 * 用户信息展示组件
 * 
 * 显示用户的基本信息，包括姓名、年龄、星座等
 * 支持编辑模式，可以更新用户信息
 * 
 * @param {Object} user - 用户数据对象
 * @param {string} user.name - 用户名
 * @param {Date} user.birthDate - 出生日期
 * @param {Function} onEdit - 编辑回调函数
 * @param {boolean} isLoading - 是否正在加载
 * @returns {JSX.Element} 用户信息展示组件
 */
export const UserProfile = ({ user, onEdit, isLoading }) => {};
```

#### 函数注释
```javascript
/**
 * 计算用户年龄
 * 
 * 根据出生日期计算当前年龄，考虑月份和日期
 * 
 * @param {Date|string} birthDate - 出生日期
 * @returns {number} 年龄（岁）
 * 
 * @example
 * calculateAge('1998-01-01') // 返回当前年份减去1998
 */
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
```

#### 复杂逻辑注释
```javascript
// ✅ 好的注释 - 解释"为什么"
// 由于 Capacitor 在 Android WebView 中不支持 fetch，使用 axios 作为替代方案
// 参考: https://github.com/ionic-team/capacitor/issues/1234
if (isAndroidWebView) {
  return axios.request(config);
}

// ❌ 差的注释 - 描述"是什么"
// 使用 axios 发送请求
if (isAndroidWebView) {
  return axios.request(config);
}
```

### 2.6 缩进和格式规范

#### 缩进
```javascript
// ✅ 正确 - 2个空格
const Component = () => {
  if (condition) {
    return (
      <div className="container">
        <Text>内容</Text>
      </div>
    );
  }
};

// ❌ 错误 - 4个空格或tab
const Component = () => {
    if (condition) {
        return (
            <div className="container">
                <Text>内容</Text>
            </div>
        );
    }
};
```

#### 分号
```javascript
// ✅ 两种风格都可接受
const name = '张三'
const age = 18

// 或

const name = '张三';
const age = 18;
```

#### 引号
```javascript
// ✅ 正确
const greeting = '你好';
return <div className="container">{greeting}</div>;

// ❌ 错误
const greeting = "你好";
return <div className='container'>{greeting}</div>;
```

### 2.7 导入顺序规范

```javascript
// 1. React 核心库
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 2. 第三方库
import axios from 'axios';
import { useStore } from '@tanstack/react-store';
import { Preferences } from '@capacitor/preferences';

// 3. 内部组件
import { Card } from './components/common/Card';
import { BiorhythmChart } from './components/features/BiorhythmChart';

// 4. 上下文和Hooks
import { useTheme } from '../context/ThemeContext';
import { useUserInfo } from '../hooks/useUserInfo';

// 5. 工具函数和服务
import { calculateAge } from '../utils/baziHelper';
import { getUserConfig } from '../services/dataService';

// 6. 样式文件
import '../styles/custom.css';
```

---

## 三、组件设计原则

### 3.1 单一职责原则 (Single Responsibility Principle)

每个组件只负责一个功能，保持简洁。

```jsx
// ✅ 好的设计 - 职责单一
const UserAvatar = ({ src, size = 12 }) => (
  <img 
    src={src} 
    alt="用户头像" 
    className={`w-${size} h-${size} rounded-full object-cover`} 
  />
);

const UserName = ({ name }) => (
  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h2>
);

const UserProfile = ({ user }) => (
  <div className="flex items-center space-x-4">
    <UserAvatar src={user.avatar} size="12" />
    <UserName name={user.name} />
  </div>
);

// ❌ 差的设计 - 职责混杂
const UserProfile = ({ user, onEdit, onDelete, onShare, theme, language }) => (
  <div>
    {/* 包含头像、姓名、编辑、删除、分享等多种功能 */}
  </div>
);
```

### 3.2 Props设计规范

#### 基本要求
- Props必须有类型定义（使用PropTypes）
- Props命名清晰且具有语义
- 提供合理的默认值
- 避免Props泛滥

```jsx
// ✅ 好的设计
import PropTypes from 'prop-types';

const EnergyBar = ({ 
  label, 
  score, 
  colorClass, 
  maxValue = 100, 
  showValue = true,
  onScoreChange 
}) => (
  <div className="energy-bar">
    <span className="label">{label}</span>
    <div className="progress-container">
      <div 
        className="progress" 
        style={{ 
          width: `${(score / maxValue) * 100}%`,
          backgroundColor: colorClass 
        }} 
      />
    </div>
    {showValue && <span className="score">{score}/{maxValue}</span>}
  </div>
);

EnergyBar.propTypes = {
  label: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  colorClass: PropTypes.string,
  maxValue: PropTypes.number,
  showValue: PropTypes.bool,
  onScoreChange: PropTypes.func
};

EnergyBar.defaultProps = {
  colorClass: 'bg-blue-500',
  maxValue: 100,
  showValue: true,
  onScoreChange: undefined
};

// ❌ 差的设计
const EnergyBar = (props) => {
  const { l, s, c, m, sv, osc } = props;
  return <div>{/* ... */}</div>;
};
```

### 3.3 组件拆分策略

```jsx
// ✅ 复杂页面组件的正确拆分方式

// 1. 主页面组件（仅负责布局和组装）
const DashboardPage = () => {
  return (
    <div className="dashboard">
      <DashboardHeader />
      <DashboardMain>
        <EnergyOverview />
        <FeatureGrid />
      </DashboardMain>
    </div>
  );
};

// 2. 布局组件（负责容器结构）
const DashboardMain = ({ children }) => (
  <main className="dashboard-main p-4 space-y-6">
    {children}
  </main>
);

// 3. 功能组件（负责具体功能）
const EnergyOverview = () => {
  const { energies } = useEnergyData();
  
  return (
    <Card title="今日运势能量">
      <div className="grid grid-cols-2 gap-4">
        {energies.map(energy => (
          <EnergyBar key={energy.id} {...energy} />
        ))}
      </div>
    </Card>
  );
};

// 4. 基础组件（可复用的UI元素）
const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
    {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
    {children}
  </div>
);
```

### 3.4 条件渲染规范

```jsx
// ✅ 推荐 - 使用三元运算符
{isLoading ? <LoadingSpinner /> : <Content />}

// ✅ 推荐 - 使用 && 短路运算符
{showModal && <Modal />}

// ✅ 推荐 - 提取为独立变量
const renderContent = () => {
  if (isLoading) return <LoadingSpinner />;
  if (hasError) return <ErrorMessage error={error} />;
  return <DataDisplay data={data} />;
};

return <div>{renderContent()}</div>;

// ❌ 避免 - 嵌套过深
<div>
  {condition1 ? (
    condition2 ? (
      condition3 ? (
        <DeeplyNested />
      ) : (
        <Fallback3 />
      )
    ) : (
      <Fallback2 />
    )
  ) : (
    <Fallback1 />
  )}
</div>
```

### 3.5 列表渲染规范

```jsx
// ✅ 正确 - 始终提供唯一的 key
{items.map(item => (
  <ListItem key={item.id} data={item} />
))}

// ✅ 正确 - 复杂数据使用组合 key
{users.map(user => (
  <UserRow key={`${user.id}-${user.name}`} user={user} />
))}

// ❌ 错误 - 使用索引作为 key（除非列表是静态的）
{items.map((item, index) => (
  <ListItem key={index} data={item} />
))}

// ❌ 错误 - key 重复
{items.map(item => (
  <ListItem key="static-key" data={item} />
))}
```

### 3.6 事件处理规范

```jsx
// ✅ 正确 - 使用 useCallback 优化性能
const handleClick = useCallback(() => {
  console.log('Button clicked');
  onClick?.();
}, [onClick]);

return <button onClick={handleClick}>点击</button>;

// ✅ 正确 - 传递参数
const handleItemDelete = useCallback((itemId) => {
  onDelete(itemId);
}, [onDelete]);

return (
  <button onClick={() => handleItemDelete(item.id)}>
    删除
  </button>
);

// ❌ 错误 - 每次渲染都创建新函数
<button onClick={() => console.log('clicked')}>点击</button>
```

---

## 四、状态管理最佳实践

### 4.1 状态分类和使用场景

#### 4.1.1 本地状态 (useState)
**适用场景**: 组件内部状态，无需跨组件共享

```javascript
const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    // 保存逻辑
    setIsEditing(false);
  };
  
  // ...
};
```

#### 4.1.2 上下文状态 (Context API)
**适用场景**: 需要跨多个组件共享的全局状态

```javascript
// ThemeContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  const value = {
    theme,
    setTheme,
    toggleTheme
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
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// 使用
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      切换到{theme === 'light' ? '深色' : '浅色'}模式
    </button>
  );
};
```

#### 4.1.3 全局状态 (@tanstack/react-store)
**适用场景**: 复杂的全局状态管理，需要性能优化

```javascript
// store/userStore.js
import { createStore } from '@tanstack/react-store';

export const userStore = createStore({
  user: null,
  preferences: {
    theme: 'light',
    language: 'zh-CN'
  },
  isLoading: false
});

// 操作方法
export const userActions = {
  setUser: (user) => {
    userStore.setState(state => ({ ...state, user }));
  },
  
  updatePreferences: (preferences) => {
    userStore.setState(state => ({
      ...state,
      preferences: { ...state.preferences, ...preferences }
    }));
  },
  
  setLoading: (isLoading) => {
    userStore.setState(state => ({ ...state, isLoading }));
  }
};

// 组件中使用
import { useStore } from '@tanstack/react-store';
import { userStore, userActions } from '../store/userStore';

const UserProfile = () => {
  const user = useStore(userStore, state => state.user);
  const preferences = useStore(userStore, state => state.preferences);
  const isLoading = useStore(userStore, state => state.isLoading);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>主题: {preferences.theme}</p>
    </div>
  );
};
```

### 4.2 状态提升原则

```jsx
// ✅ 正确 - 将共享状态提升到最近的共同父组件
const ParentComponent = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  
  return (
    <div>
      <ItemList items={items} onSelect={setSelectedItem} />
      <ItemDetail item={selectedItem} />
    </div>
  );
};

// ❌ 错误 - 子组件直接通过 props 传递状态修改函数
const ChildComponent = ({ onParentStateChange }) => {
  const [localState, setLocalState] = useState(null);
  
  useEffect(() => {
    onParentStateChange(localState);
  }, [localState, onParentStateChange]);
  
  return <div>{/* ... */}</div>;
};
```

### 4.3 副作用管理 (useEffect)

```javascript
// ✅ 正确 - 清理副作用
const UserProfile = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserData = async () => {
      try {
        const data = await getUserData(userId);
        if (isMounted) {
          setUserData(data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch user data:', error);
          setError(error);
        }
      }
    };
    
    fetchUserData();
    
    return () => {
      isMounted = false; // 清理函数
    };
  }, [userId]); // 依赖项完整
  
  if (!userData) return <LoadingSpinner />;
  
  return <div>{userData.name}</div>;
};

// ❌ 错误 - 缺少依赖项
useEffect(() => {
  fetchUserData(userId);
}, []); // userId 未在依赖项中

// ❌ 错误 - 缺少清理函数
useEffect(() => {
  const timer = setInterval(() => {
    updateData();
  }, 1000);
  // 缺少 clearInterval
}, []);
```

### 4.4 性能优化 Hooks

#### 4.4.1 useCallback - 缓存函数
```javascript
const ParentComponent = () => {
  const [count, setCount] = useState(0);
  
  // ✅ 正确 - 使用 useCallback 避免子组件不必要的重渲染
  const handleClick = useCallback(() => {
    console.log('Button clicked');
    onCallback?.();
  }, [onCallback]);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ChildComponent onClick={handleClick} />
    </div>
  );
};
```

#### 4.4.2 useMemo - 缓存计算结果
```javascript
const DataList = ({ items, filter }) => {
  // ✅ 正确 - 使用 useMemo 缓存昂贵的计算
  const filteredItems = useMemo(() => {
    console.log('Filtering items...'); // 仅在 items 或 filter 变化时执行
    return items.filter(item => item.category === filter);
  }, [items, filter]);
  
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredItems]);
  
  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};
```

#### 4.4.3 React.memo - 缓存组件
```javascript
import React, { memo } from 'react';

// ✅ 正确 - 使用 React.memo 避免不必要的重渲染
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  console.log('ExpensiveComponent rendered');
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.data === nextProps.data && 
         prevProps.onUpdate === nextProps.onUpdate;
});
```

---

## 五、性能优化建议

### 5.1 代码分割和懒加载

#### 路由级代码分割
```javascript
import { lazy, Suspense } from 'react';

// ✅ 懒加载路由组件
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BiorhythmDashboard = lazy(() => import('./components/BiorhythmDashboard'));
const MayaPage = lazy(() => import('./pages/MayaPage'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/biorhythm" element={<BiorhythmDashboard />} />
          <Route path="/maya" element={<MayaPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

#### 带错误处理的懒加载
```javascript
// ✅ 带错误处理的懒加载
const lazyLoadWithErrorHandling = (importFunc, fallbackComponent) => {
  return React.lazy(() => 
    importFunc().catch(error => {
      console.error('Component load failed:', error);
      return fallbackComponent || { 
        default: () => <ErrorComponent error={error} /> 
      };
    })
  );
};

const DashboardPage = lazyLoadWithErrorHandling(
  () => import('./pages/DashboardPage')
);
```

### 5.2 图片优化

#### 懒加载图片
```javascript
// ✅ 懒加载和占位符
const LazyImage = ({ src, alt, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
```

#### 使用合适的图片格式
```javascript
// ✅ 使用 WebP 格式（优先）
<img src="image.webp" alt="描述" />

// ✅ 提供回退格式
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="描述" />
</picture>

// ✅ 使用合适的尺寸
// 缩略图: 150x150
// 卡片图: 400x300
// 全屏图: 1080x1920
```

### 5.3 虚拟列表（长列表优化）

```javascript
import { FlatList } from 'react-native';

// ✅ 使用 FlatList 渲染长列表
const VirtualizedList = ({ items }) => {
  const renderItem = ({ item }) => (
    <ListItem data={item} />
  );
  
  const keyExtractor = (item) => item.id;
  
  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
};
```

### 5.4 防抖和节流

#### 防抖 - 搜索框输入
```javascript
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const SearchInput = () => {
  const [query, setQuery] = useState('');
  
  const handleSearch = useMemo(
    () => debounce((value) => {
      console.log('Searching:', value);
      // 执行搜索逻辑
    }, 300),
    []
  );
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };
  
  return <input value={query} onChange={handleChange} />;
};
```

#### 节流 - 滚动事件
```javascript
const throttle = (fn, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn(...args);
      lastCall = now;
    }
  };
};

const InfiniteScroll = () => {
  const handleScroll = useCallback(
    throttle(() => {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        // 加载更多数据
      }
    }, 200),
    []
  );
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  return <div>内容</div>;
};
```

### 5.5 CSS性能优化

```javascript
// ✅ 使用 CSS 变量而非直接修改样式
:root {
  --primary-color: #4f46e5;
  --spacing-md: 1rem;
}

// ✅ 使用 transform 和 opacity 实现动画（GPU 加速）
.animated-element {
  transform: translateX(100px);
  opacity: 0.5;
  transition: all 0.3s ease;
  will-change: transform, opacity;
}

// ❌ 避免使用 left/top/width/height 进行动画
.bad-animation {
  left: 100px; /* 触发重排，性能差 */
  top: 100px;
  width: 100px;
  height: 100px;
}
```

### 5.6 移动端性能优化

```javascript
// ✅ 使用 touch-action 优化触摸交互
const TouchOptimizedButton = () => (
  <button 
    className="touch-target"
    style={{ 
      touchAction: 'manipulation',
      minHeight: '44px',
      minWidth: '44px'
    }}
    onClick={handlePress}
  >
    点击
  </button>
);

// ✅ 防止 iOS Safari 上的 100vh 问题
const FullHeightContainer = () => (
  <div style={{ height: '100vh', height: '-webkit-fill-available' }}>
    内容
  </div>
);

// ✅ 使用 passive 事件监听器优化滚动
useEffect(() => {
  const handleScroll = () => {};
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
```

---

## 六、测试策略

### 6.1 单元测试（Jest + React Testing Library）

#### 组件测试
```javascript
// UserProfile.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    name: '张三',
    age: 25,
    avatar: '/avatar.jpg'
  };

  test('应该正确渲染用户信息', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('25岁')).toBeInTheDocument();
  });

  test('点击编辑按钮时应该调用 onEdit 回调', () => {
    const onEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);
    
    const editButton = screen.getByText('编辑');
    fireEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test('应该显示加载状态', () => {
    render(<UserProfile user={null} isLoading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('应该处理错误状态', () => {
    render(<UserProfile user={null} error="加载失败" />);
    
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });
});
```

#### Hook测试
```javascript
// useUserInfo.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserInfo } from './useUserInfo';

describe('useUserInfo', () => {
  test('应该正确初始化用户信息', async () => {
    const { result } = renderHook(() => useUserInfo());
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.hasUserInfo).toBe(true);
  });

  test('应该正确计算年龄', () => {
    const { result } = renderHook(() => useUserInfo());
    
    act(() => {
      result.current.updateBirthDate('1998-01-01');
    });
    
    const currentYear = new Date().getFullYear();
    expect(result.current.age).toBe(currentYear - 1998);
  });
});
```

#### 工具函数测试
```javascript
// baziHelper.test.js
import { calculateAge, getChineseZodiac } from './baziHelper';

describe('baziHelper', () => {
  describe('calculateAge', () => {
    test('应该正确计算年龄', () => {
      const birthDate = '1998-01-01';
      const age = calculateAge(birthDate);
      const expectedAge = new Date().getFullYear() - 1998;
      expect(age).toBe(expectedAge);
    });

    test('应该处理边界情况', () => {
      // 今天生日
      const today = new Date();
      const birthDate = `${today.getFullYear() - 25}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      expect(calculateAge(birthDate)).toBe(25);
    });
  });

  describe('getChineseZodiac', () => {
    test('应该正确返回生肖', () => {
      expect(getChineseZodiac(2020)).toBe('鼠');
      expect(getChineseZodiac(2021)).toBe('牛');
      expect(getChineseZodiac(2022)).toBe('虎');
    });
  });
});
```

### 6.2 集成测试

```javascript
// DashboardPage.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DashboardPage 集成测试', () => {
  test('应该完整渲染仪表板页面', async () => {
    renderWithRouter(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('今日运势能量')).toBeInTheDocument();
    });
    
    // 测试用户交互
    const editButton = await screen.findByText('编辑');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByText('保存')).toBeInTheDocument();
    });
  });

  test('应该正确处理数据流', async () => {
    renderWithRouter(<DashboardPage />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });
    
    // 验证数据显示
    expect(screen.getByText(/爱情/)).toBeInTheDocument();
    expect(screen.getByText(/事业/)).toBeInTheDocument();
  });
});
```

### 6.3 E2E测试（使用 Cypress 或 Playwright）

```javascript
// cypress/e2e/dashboard.cy.js
describe('Dashboard E2E 测试', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('应该能够完成完整的用户流程', () => {
    // 登录
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    
    // 验证登录成功
    cy.url().should('include', '/dashboard');
    cy.contains('欢迎, testuser').should('be.visible');
    
    // 测试功能
    cy.contains('今日运势').click();
    cy.contains('爱情').should('be.visible');
    
    // 测试退出登录
    cy.contains('退出登录').click();
    cy.url().should('include', '/login');
  });
});
```

### 6.4 测试覆盖率要求

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/utils/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

### 6.5 测试最佳实践

1. **测试用户行为而非实现细节**
   ```javascript
   // ✅ 好的测试
   test('应该显示用户信息', () => {
     render(<UserProfile user={user} />);
     expect(screen.getByText('张三')).toBeInTheDocument();
   });
   
   // ❌ 差的测试
   test('应该调用 setUser 函数', () => {
     const setUser = jest.fn();
     render(<UserProfile user={user} setUser={setUser} />);
     expect(setUser).toHaveBeenCalledWith(user);
   });
   ```

2. **使用 data-testid 选择器**
   ```jsx
   <button data-testid="submit-button" onClick={handleSubmit}>提交</button>
   ```
   
   ```javascript
   // ✅ 使用 data-testid
   expect(screen.getByTestId('submit-button')).toBeInTheDocument();
   ```

3. **测试边界情况**
   ```javascript
   test('应该处理空数据', () => {
     render(<UserProfile user={null} />);
     expect(screen.getByText('暂无数据')).toBeInTheDocument();
   });
   
   test('应该处理加载状态', () => {
     render(<UserProfile user={null} isLoading={true} />);
     expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
   });
   
   test('应该处理错误状态', () => {
     render(<UserProfile user={null} error="加载失败" />);
     expect(screen.getByText('加载失败')).toBeInTheDocument();
   });
   ```

---

## 七、移动端适配规范

### 7.1 响应式设计

```css
/* 使用 Tailwind 响应式前缀 */
<div className="
  p-4        /* 所有屏幕 */
  md:p-6     /* 中等屏幕及以上 */
  lg:p-8     /* 大屏幕及以上 */
">
```

### 7.2 触摸交互优化

```jsx
// ✅ 最小触摸目标 44x44px
<TouchableOpacity 
  style={{ 
    minWidth: 48, 
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center'
  }}
  onPress={handlePress}
>
  <Icon name="home" size={24} />
</TouchableOpacity>

// ✅ 触摸反馈
const Button = ({ children, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7} // 按下时的透明度
  >
    {children}
  </TouchableOpacity>
);
```

### 7.3 安全区域适配

```jsx
// ✅ 适配刘海屏和圆角屏
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  {/* 内容 */}
</SafeAreaView>

// ✅ 使用 CSS 安全区域
<div className="pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
  {children}
</div>
```

### 7.4 虚拟键盘处理

```javascript
// ✅ 监听键盘显隐
const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  useEffect(() => {
    const keyboardDidShow = (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    
    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };
    
    Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', keyboardDidHide);
    
    return () => {
      Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', keyboardDidHide);
    };
  }, []);
  
  return keyboardHeight;
};

// ✅ 输入框自动滚动到可视区域
<input
  onFocus={(e) => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }}
/>
```

---

## 八、错误处理规范

### 8.1 错误边界

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // 上报错误到日志服务
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 8.2 异步错误处理

```javascript
// ✅ 使用 async/await + try/catch
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // 显示用户友好的错误信息
    showToast('加载失败，请重试');
    // 重新抛出或返回默认值
    throw error;
  }
};

// ✅ 使用 Promise.catch
fetch('/api/data')
  .then(response => response.json())
  .catch(error => {
    console.error('Fetch error:', error);
    showToast('加载失败，请重试');
  });
```

### 8.3 全局错误处理

```javascript
// ✅ 全局错误处理器
const initializeGlobalErrorHandlers = () => {
  // 捕获未处理的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // 阻止默认的报错
  });
  
  // 捕获全局错误
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  
  // 捕获 React 错误
  if (typeof window !== 'undefined' && window.ErrorUtils) {
    window.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('React error:', error, isFatal);
    });
  }
};

// 在应用启动时调用
initializeGlobalErrorHandlers();
```

---

## 九、代码审查清单

### 9.1 代码质量
- [ ] 遵循命名规范（组件 PascalCase，函数 camelCase）
- [ ] Props 有明确的类型定义
- [ ] 没有硬编码的魔法数字和字符串
- [ ] 复杂逻辑有清晰的注释
- [ ] 没有控制台日志（console.log、console.error）
- [ ] 没有 ESLint 警告

### 9.2 性能优化
- [ ] 大列表使用虚拟滚动
- [ ] 图片使用懒加载
- [ ] 路由组件使用懒加载
- [ ] 事件处理函数使用 useCallback
- [ ] 昂贵计算使用 useMemo
- [ ] 避免不必要的组件重渲染

### 9.3 移动端适配
- [ ] 触摸目标大小 ≥ 44x44px
- [ ] 响应式布局在断点处正确
- [ ] 适配刘海屏和圆角屏
- [ ] 处理虚拟键盘弹出
- [ ] 优化触摸交互反馈

### 9.4 测试覆盖
- [ ] 核心功能有单元测试
- [ ] 组件有快照测试
- [ ] 关键路径有集成测试
- [ ] 测试覆盖率 ≥ 70%
- [ ] 测试通过且没有警告

### 9.5 可访问性
- [ ] 所有交互元素有明确的标签
- [ ] 颜色对比度符合 WCAG 标准
- [ ] 支持键盘导航
- [ ] 适当使用 ARIA 属性
- [ ] 表单字段有关联的 label

---

## 十、最佳实践总结

### 10.1 开发工作流

1. **需求分析** → 理解业务目标，确定技术方案
2. **架构设计** → 组件拆分，状态管理，路由设计
3. **核心功能实现** → MVP快速验证
4. **性能优化** → 分析瓶颈，针对性优化
5. **移动端适配** → 多设备测试，调整布局
6. **测试验证** → 单元测试、集成测试、E2E测试
7. **代码审查** → 对照清单，确保质量
8. **部署上线** → 灰度发布，监控指标
9. **反馈迭代** → 收集用户反馈，持续改进

### 10.2 核心原则

1. **组件化思维**: 将复杂UI拆分为可复用的小组件
2. **状态分层**: 本地状态、上下文状态、全局状态各司其职
3. **性能优先**: 代码分割、懒加载、虚拟滚动等优化手段
4. **测试驱动**: 编写可测试的代码，保证核心功能质量
5. **移动优先**: 考虑移动端用户体验，优化触摸交互
6. **错误处理**: 完善的错误边界和错误恢复机制
7. **文档同步**: 更新代码时同步更新注释和文档

### 10.3 常见陷阱

1. **过度优化**: 避免过早优化，先保证功能正确再优化
2. **状态管理滥用**: 简单场景不需要复杂的状态管理
3. **Props 钻孔**: 使用 Context API 避免深层传递
4. **内存泄漏**: 及时清理副作用，避免内存泄漏
5. **硬编码**: 使用配置文件和环境变量
6. **忽略错误**: 完善的错误处理，不要静默失败
7. **测试不足**: 核心功能必须有测试覆盖

---

## 附录

### A. 相关文档

- [React官方文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Capacitor 文档](https://capacitorjs.com)
- [React Testing Library](https://testing-library.com/react)

### B. 工具推荐

- **代码质量**: ESLint, Prettier
- **测试**: Jest, React Testing Library, Playwright
- **性能分析**: Lighthouse, React DevTools Profiler
- **调试**: React DevTools, Chrome DevTools

### C. 常用命令

```bash
# 开发
npm start          # 启动开发服务器
npm test           # 运行测试
npm run build      # 构建生产版本

# 移动端
npm run android    # 打开 Android 项目
npm run ios        # 打开 iOS 项目
npm run sync       # 同步资源到移动平台

# 测试
npm run test:coverage  # 生成覆盖率报告
npm run test:report    # 生成完整测试报告
```

---

**记住**: 优雅的代码不仅是功能正确，更是可维护、可扩展、高性能的体现。遵循本规范，构建高质量的移动端 Web 应用。
