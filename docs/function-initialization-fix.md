# 函数初始化顺序完整修复

## 问题描述

首页加载显示：
```
功能暂时不可用
当前功能正在维护中，请稍后再试
```

这是降级模式（FallbackComponent）显示的内容，说明 `BiorhythmTab` 组件加载失败。

## 根本原因

**多重变量初始化顺序错误**导致组件加载失败，触发降级模式。

### 第一层错误：`loadBiorhythmData` 初始化顺序

```javascript
// ❌ 原有错误结构

// 第 351 行：使用 loadBiorhythmData
useEffect(() => {
  loadBiorhythmData(newBirthDate);
}, [loadBiorhythmData]);

// 第 457 行才定义 loadBiorhythmData
const loadBiorhythmData = useCallback(async () => {...}, [birthDate]);
```

### 第二层错误：`formatDateLocal` 和 `parseDateLocal` 初始化顺序

```javascript
// ❌ 原有错误结构（修复 loadBiorhythmData 后发现）

// 第 328 行定义 loadBiorhythmData
const loadBiorhythmData = useCallback(async (selectedDate = null) => {
  const birthDateStr = typeof dateToUse === 'string'
    ? dateToUse
    : formatDateLocal(dateToUse); // ❌ 使用 formatDateLocal，但还未定义

  const today = formatDateLocal(new Date()); // ❌ 使用 formatDateLocal，但还未定义

  const dateObj = parseDateLocal(dateToUse); // ❌ 使用 parseDateLocal，但还未定义
}, [birthDate]);

// 第 596 行才定义 formatDateLocal
const formatDateLocal = (date) => {...};

// 第 604 行才定义 parseDateLocal
const parseDateLocal = (dateStr) => {...};
```

### 错误链路

```
1. 组件加载
   ↓
2. useEffect 执行，调用 loadBiorhythmData
   ↓
3. loadBiorhythmData 内部调用 formatDateLocal 和 parseDateLocal
   ↓
4. ReferenceError: Cannot access 'formatDateLocal' before initialization
   ↓
5. 错误被捕获，handleError 被调用
   ↓
6. 检测到未定义变量错误（isUndefinedVariableError）
   ↓
7. 设置 fallbackMode = true
   ↓
8. 显示"功能暂时不可用"
```

## 修复方案

### 修复步骤 1：移动 `loadBiorhythmData`

将 `loadBiorhythmData` 从第 778 行移到第 328 行。

### 修复步骤 2：移动 `formatDateLocal` 和 `parseDateLocal`

将这两个函数从第 596、604 行移到第 327、336 行。

### 修复后的正确顺序

```javascript
// ✅ 修复后的正确结构

// 1. 定义 formatDateLocal
const formatDateLocal = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 2. 定义 parseDateLocal
const parseDateLocal = (dateStr) => {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

// 3. 定义 loadBiorhythmData（使用上面两个函数）
const loadBiorhythmData = useCallback(async (selectedDate = null) => {
  const dateToUse = selectedDate || birthDate;

  if (!dateToUse) {
    setError("请选择出生日期");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const birthDateStr = typeof dateToUse === 'string'
      ? dateToUse
      : formatDateLocal(dateToUse); // ✅ 现在可以使用了

    const result = await getBiorhythmRange(birthDateStr, 10, 20);

    if (result.success) {
      setRhythmData(result.rhythmData);

      const today = formatDateLocal(new Date()); // ✅ 现在可以使用了
      const todayData = result.rhythmData.find(item => item.date === today);
      setTodayData(todayData);

      if (typeof dateToUse === 'string') {
        const dateObj = parseDateLocal(dateToUse); // ✅ 现在可以使用了
        setBirthDate(dateObj);
      }
    } else {
      setError(result.error || "获取数据失败");
    }
  } catch (error) {
    setError("计算生物节律数据时出错");
    console.error('加载生物节律数据失败:', error);
  }

  setLoading(false);
}, [birthDate]);

// 4. useEffect 使用 loadBiorhythmData
useEffect(() => {
  if (birthDate) {
    loadBiorhythmData(newBirthDate); // ✅ 现在可以使用了
  }
}, [loadBiorhythmData]);
```

## 修改详情

### 文件：`frontend/src/components/BiorhythmTab.js`

#### 修改 1：移动 `formatDateLocal` 和 `parseDateLocal`

**原始位置：**
- `formatDateLocal`: 第 596-602 行
- `parseDateLocal`: 第 604-613 行

**新位置：**
- `formatDateLocal`: 第 327-333 行
- `parseDateLocal`: 第 336-346 行

#### 修改 2：移动 `loadBiorhythmData`

**原始位置：** 第 778-820 行

**新位置：** 第 350-391 行

#### 修改 3：删除重复定义

删除了以下位置的重复函数定义：
- 第 815-857 行（`loadBiorhythmData` 重复）
- 第 617-630 行（`formatDateLocal` 和 `parseDateLocal` 重复）

## 验证清单

- [x] `formatDateLocal` 在 `loadBiorhythmData` 之前定义
- [x] `parseDateLocal` 在 `loadBiorhythmData` 之前定义
- [x] `loadBiorhythmData` 在所有使用它的代码之前定义
- [x] 所有 useEffect 依赖数组正确引用
- [x] 所有 useCallback 依赖数组正确引用
- [x] 无 linter 错误
- [x] 无重复定义

## JavaScript 变量初始化顺序规则总结

### 1. const/let 变量不会被提升

```javascript
// ❌ 错误：const/let 不会提升
console.log(myVar); // ReferenceError: Cannot access 'myVar' before initialization
const myVar = 'Hello';
```

### 2. 函数声明会被提升

```javascript
// ✅ 正确：函数声明会提升
myFunction(); // 可以正常工作

function myFunction() {
  console.log('Hello');
}
```

### 3. useCallback 返回的函数本质上是变量

```javascript
// ❌ 错误：useCallback 返回的函数不会提升
useEffect(() => {
  myCallback();
}, [myCallback]);

const myCallback = useCallback(() => {}, []);
```

### 4. 普通箭头函数也不会提升

```javascript
// ❌ 错误：箭头函数不会提升
myArrowFunction(); // ReferenceError

const myArrowFunction = () => {
  console.log('Hello');
};
```

### 5. 函数表达式也不会提升

```javascript
// ❌ 错误：函数表达式不会提升
myFunction(); // ReferenceError

const myFunction = function() {
  console.log('Hello');
};
```

## React 组件中的最佳实践

### Hook 依赖的正确顺序

```javascript
// ✅ 正确顺序

function MyComponent() {
  // 1. 原始值和状态
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. 普通函数（非 Hook 返回的函数）
  const formatDate = (date) => {
    // ...
  };

  const parseDate = (dateStr) => {
    // ...
  };

  // 3. useCallback 包装的函数
  const loadData = useCallback(async () => {
    const dateStr = formatDate(date); // ✅ 可以使用 formatDate
    // ...
  }, [dependency]);

  // 4. useEffect（使用上面的函数）
  useEffect(() => {
    loadData(); // ✅ 可以使用 loadData
  }, [loadData]);

  // 5. 其他回调函数
  const handleClick = useCallback(() => {
    loadData(); // ✅ 可以使用 loadData
  }, [loadData]);

  return <div>...</div>;
}
```

### 避免循环依赖

```javascript
// ❌ 错误：循环依赖
const setData = useState(null)[0]; // ❌ useState 返回值解构

const updateData = useCallback((newData) => {
  setData(newData); // ❌ setData 在 updateData 之后定义
}, [setData]); // ❌ 依赖 setState 函数会导致循环

// ✅ 正确：按顺序定义
const [data, setData] = useState(null);

const updateData = useCallback((newData) => {
  setData(newData);
}, []); // ✅ setState 函数是稳定的，不需要在依赖数组中
```

## 调试技巧

### 1. 使用 ESLint

安装 `eslint-plugin-react-hooks` 可以自动检测 Hook 依赖问题：

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 2. 查看浏览器控制台

当出现 `Cannot access 'XXX' before initialization` 错误时：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签
3. 找到错误信息和堆栈追踪
4. 定位到具体的代码行

### 3. 使用 TypeScript

TypeScript 可以在编译时捕获这类错误：

```typescript
// TypeScript 会警告：
// 'loadBiorhythmData' is used before its assignment
useEffect(() => {
  loadBiorhythmData();
}, [loadBiorhythmData]);

const loadBiorhythmData = useCallback(async () => {}, []);
```

## 总结

这个问题的关键在于：

1. **多层嵌套的初始化顺序错误**
2. **React Hooks 依赖数组在函数定义之前就被求值**
3. **JavaScript const/let 变量不会提升**

**核心原则：确保所有被依赖的函数在使用它们之前定义**

遵循这个原则可以避免所有的"Cannot access before initialization"错误。

## 相关修复文档

- `docs/loadbiorhyth-data-fix.md` - 第一次修复 `loadBiorhythmData` 初始化顺序
- `docs/loading-optimization-fix.md` - 加载状态优化修复
- `docs/mobile-webview-fixes.md` - 移动 WebView 兼容性修复

## 验证步骤

1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 重启开发服务器（如果需要）
3. 打开 http://localhost:3000
4. 检查是否正常显示生物节律界面
5. 打开浏览器控制台，查看是否有错误

预期结果：
- ✅ 立即显示主界面和菜单
- ✅ 生物节律数据正常加载
- ✅ 不显示"功能暂时不可用"
- ✅ 控制台无错误信息
