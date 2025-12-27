# loadBiorhythmData 初始化顺序修复

## 问题描述

应用启动时出现以下错误：

```
ReferenceError: Cannot access 'loadBiorhythmData' before initialization
    at BiorhythmTab (http://localhost:3000/static/js/src_components_BiorhythmTab_js.chunk.js:606:180)
```

## 根本原因

这是一个 JavaScript 变量提升（hoisting）问题。`loadBiorhythmData` 函数的定义位置在使用它的代码之后，导致在代码执行时无法访问该函数。

### 问题代码结构

```javascript
// ❌ 原有错误结构

// ... useState 定义 ...

// 第一个 useEffect - 使用 loadBiorhythmData
useEffect(() => {
  if (birthDate) {
    loadBiorhythmData(newBirthDate); // ❌ 这里调用，但函数还未定义
  }
}, [loadBiorhythmData]); // ❌ 依赖数组引用，但函数还未定义

// 第二个 useEffect - 使用 loadBiorhythmData
useEffect(() => {
  loadBiorhythmData(newBirthDate); // ❌ 这里调用，但函数还未定义
}, [currentConfig, loadBiorhythmData]); // ❌ 依赖数组引用

// saveUserInfo - 使用 loadBiorhythmData
const saveUserInfo = useCallback(async () => {
  await loadBiorhythmData(newBirthDate); // ❌ 这里调用，但函数还未定义
}, [tempBirthDate, loadBiorhythmData]); // ❌ 依赖数组引用

// loadBiorhythmData 定义 - 在所有使用它的代码之后
const loadBiorhythmData = useCallback(async (selectedDate = null) => {
  // ...
}, [birthDate]);
```

## 修复方案

将 `loadBiorhythmData` 的定义移到所有使用它的代码之前。

### 修复后的代码结构

```javascript
// ✅ 修复后的正确结构

// ... useState 定义 ...

// loadBiorhythmData 定义 - 在所有使用它的代码之前
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
      : formatDateLocal(dateToUse);

    const result = await getBiorhythmRange(birthDateStr, 10, 20);

    if (result.success) {
      setRhythmData(result.rhythmData);

      const today = formatDateLocal(new Date());
      const todayData = result.rhythmData.find(item => item.date === today);
      setTodayData(todayData);

      if (typeof dateToUse === 'string') {
        const dateObj = parseDateLocal(dateToUse);
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

// 第一个 useEffect - 现在可以正确使用 loadBiorhythmData
useEffect(() => {
  if (birthDate) {
    loadBiorhythmData(newBirthDate); // ✅ 正确，函数已定义
  }
}, [loadBiorhythmData]); // ✅ 正确引用

// 第二个 useEffect - 现在可以正确使用 loadBiorhythmData
useEffect(() => {
  loadBiorhythmData(newBirthDate); // ✅ 正确，函数已定义
}, [currentConfig, loadBiorhythmData]); // ✅ 正确引用

// saveUserInfo - 现在可以正确使用 loadBiorhythmData
const saveUserInfo = useCallback(async () => {
  await loadBiorhythmData(newBirthDate); // ✅ 正确，函数已定义
}, [tempBirthDate, loadBiorhythmData]); // ✅ 正确引用
```

## 修改详情

### 文件：`frontend/src/components/BiorhythmTab.js`

#### 修改位置

1. **原始位置**：第 778-820 行（在所有使用它的代码之后）

2. **新位置**：第 326-369 行（在第一个 useEffect 之前）

#### 具体变更

```diff
- // 原有位置：在所有使用它的代码之后（第 778-820 行）
- const loadBiorhythmData = useCallback(async (selectedDate = null) => {
-   // ...
- }, [birthDate]);

// 新位置：在所有使用它的代码之前（第 326-369 行）
+ // 加载生物节律数据 - 本地化版本
+ // 注意：这个函数必须在所有使用它的代码之前定义，避免"Cannot access before initialization"错误
+ const loadBiorhythmData = useCallback(async (selectedDate = null) => {
+   const dateToUse = selectedDate || birthDate;
+
+   if (!dateToUse) {
+     setError("请选择出生日期");
+     return;
+   }
+
+   setLoading(true);
+   setError(null);
+
+   try {
+     const birthDateStr = typeof dateToUse === 'string'
+       ? dateToUse
+       : formatDateLocal(dateToUse);
+
+     // 使用本地数据服务
+     const result = await getBiorhythmRange(birthDateStr, 10, 20);
+
+     if (result.success) {
+       setRhythmData(result.rhythmData);
+
+       // 查找今日数据
+       const today = formatDateLocal(new Date());
+       const todayData = result.rhythmData.find(item => item.date === today);
+       setTodayData(todayData);
+
+       // 如果是字符串日期，转换为Date对象并更新birthDate
+       if (typeof dateToUse === 'string') {
+         const dateObj = parseDateLocal(dateToUse);
+         setBirthDate(dateObj);
+       }
+     } else {
+       setError(result.error || "获取数据失败");
+     }
+   } catch (error) {
+     setError("计算生物节律数据时出错");
+     console.error('加载生物节律数据失败:', error);
+   }
+
+   setLoading(false);
+ }, [birthDate]);
```

## 为什么会出现这个问题？

### JavaScript 变量提升规则

1. **函数声明（Function Declaration）**会被提升到作用域顶部
   ```javascript
   // ✅ 可以正常工作
   foo(); // 函数声明会被提升

   function foo() {
     console.log('Hello');
   }
   ```

2. **变量声明（var/let/const）**只会提升声明，不会提升初始化
   ```javascript
   // ❌ 会报错：Cannot access 'foo' before initialization
   foo(); // ReferenceError

   const foo = () => {
     console.log('Hello');
   };
   ```

3. **useCallback 返回的函数**本质上是变量声明，不会提升
   ```javascript
   // ❌ 会报错：Cannot access 'loadBiorhythmData' before initialization
   useEffect(() => {
     loadBiorhythmData(); // ReferenceError
   }, [loadBiorhythmData]);

   const loadBiorhythmData = useCallback(() => {
     // ...
   }, []);
   ```

## React Hooks 依赖数组的特殊性

React Hook 的依赖数组会在组件渲染时立即求值，这意味着：

```javascript
// ❌ 错误：依赖数组在 loadBiorhythmData 定义之前就被求值
useEffect(() => {
  loadBiorhythmData();
}, [loadBiorhythmData]); // 这里立即访问 loadBiorhythmData，但它还未定义

const loadBiorhythmData = useCallback(() => {}, []);
```

## 最佳实践

### 1. Hook 依赖的正确顺序

```javascript
// ✅ 正确顺序

// 1. 原始值和简单状态
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

// 2. 派生状态的函数定义
const loadData = useCallback(async () => {
  // ...
}, [dependency]);

// 3. 使用上述函数的 Hooks
useEffect(() => {
  loadData();
}, [loadData]);

// 4. 使用上述函数的回调函数
const handleClick = useCallback(() => {
  loadData();
}, [loadData]);
```

### 2. 避免循环依赖

```javascript
// ❌ 错误：循环依赖
const loadData = useCallback(() => {
  setData(result);
}, [setData]); // setData 来自 useState，无问题

const setData = useState(null)[0]; // ✅ 但 setData 来自 useState，无问题

// ✅ 正确：按顺序定义
const [data, setData] = useState(null);
const loadData = useCallback(() => {
  setData(result);
}, []);
```

### 3. 使用 ESLint 检查

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

## 验证清单

- [x] `loadBiorhythmData` 在所有使用它的代码之前定义
- [x] 所有 useEffect 依赖数组正确引用 `loadBiorhythmData`
- [x] 所有 useCallback 依赖数组正确引用 `loadBiorhythmData`
- [x] 无 linter 错误
- [x] 函数定义位置在第一个使用它的 useEffect 之前

## 总结

这个问题的核心是 JavaScript 变量提升规则和 React Hooks 依赖数组的求值时机。解决方案很简单：

**确保所有被依赖的函数在使用它们之前定义**

遵循这个原则可以避免类似的"Cannot access before initialization"错误。

## 相关文档

- [React Hooks 规则](https://react.dev/reference/react)
- [JavaScript 变量提升](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [useCallback 官方文档](https://react.dev/reference/react/useCallback)
