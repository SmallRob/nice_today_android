# Standard Coding Style

## Overview
This document defines coding standards and style guidelines for the Nice Today (每日宜忌) workspace. Consistent coding style improves readability, maintainability, and collaboration.

## General Principles

### 1. Readability First
- Code should be easy to read and understand
- Use meaningful names for variables, functions, and components
- Write self-documenting code with clear intent
- Add comments for complex business logic (especially Chinese astrology calculations)

### 2. Consistency
- Follow the same patterns throughout the codebase
- Use established React and JavaScript conventions
- Maintain consistency across team members
- Follow existing patterns in similar components

### 3. Maintainability
- Write code that is easy to modify and extend
- Keep functions and components focused on single responsibilities
- Avoid unnecessary complexity
- Implement proper error handling and logging

## Language-Specific Guidelines

### JavaScript/React

#### Naming Conventions
```javascript
// Variables and functions - camelCase
const userName = '张三';
const birthDate = new Date();
function calculateAge() { }

// React Components - PascalCase
const UserProfile = () => { }
const BiorhythmDashboard = () => { }

// Custom Hooks - use + camelCase
const useUserInfo = () => { }
const useThemeColor = () => { }

// Constants - UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_BIRTH_TIME = '12:30';

// Context Providers - PascalCase + 'Provider' or 'Context'
const UserConfigProvider = ({ children }) => { }
const ThemeContext = createContext();

// Private members/variables - prefix with underscore (optional)
const _internalMethod = () => { }
```

#### Code Formatting
```javascript
// Use 2-space indentation (React convention)
const Component = () => {
  if (condition) {
    return <div>Content</div>;
  }
};

// No semicolons (project convention)
const name = '张三'
const age = 18

// Max line length: 80-100 characters (soft limit)

// Use single quotes for strings unless interpolation
const message = '你好';
const template = `你好 ${name}`;

// Use template literals for multi-line strings or string interpolation
const multiLine = `第一行
第二行
第三行`;
```

#### Component Structure
```javascript
// ✅ Correct component structure
const UserProfile = ({ user, onUpdate }) => {
  // 1. Hooks at the top
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();

  // 2. Event handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(user);
    setIsEditing(false);
  };

  // 3. Derived values
  const displayName = `${user.name} (${user.age}岁)`;

  // 4. Effects
  useEffect(() => {
    // Side effects here
  }, [user.id]);

  // 5. Render
  return (
    <div className="user-profile">
      {/* JSX content */}
    </div>
  );
};

// ❌ Avoid - mixing concerns
const UserProfile = ({ user }) => {
  const [data, setData] = useState(null);

  // Don't fetch data in component if possible
  useEffect(() => {
    fetch(`/api/users/${user.id}`).then(setData);
  }, []);

  return <div>{/*...*/}</div>;
};
```

#### Hooks Best Practices
```javascript
// ✅ Correct - custom hook naming with 'use'
const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Load user info
  }, []);

  return { userInfo, setUserInfo };
};

// ✅ Correct - using custom hook
const Profile = () => {
  const { userInfo } = useUserInfo();

  if (!userInfo) return <Loading />;

  return <div>{userInfo.name}</div>;
};

// ❌ Avoid - not a hook
const getUserInfo = () => {
  return { name: '张三' };
};

// ✅ Correct - using useCallback for callbacks
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);

return <button onClick={handleClick}>点击</button>;

// ✅ Correct - using useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.id - b.id);
}, [data]);

// ❌ Avoid - creating new function on every render
return <button onClick={() => console.log('Clicked')}>点击</button>;
```

#### Error Handling
```javascript
// ✅ Correct - try-catch for async operations
const fetchData = async () => {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    errorLogger.log(error, {
      component: 'UserProfile',
      action: 'fetchData',
      errorType: 'APIError'
    });
    throw error;
  }
};

// ✅ Correct - error boundary for component errors
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    errorLogger.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplayPanel error={this.state.error} />;
    }
    return this.props.children;
  }
}

// ❌ Avoid - swallowing errors
try {
  riskyOperation();
} catch (e) {
  // Silent catch - bad
}
```

#### State Management
```javascript
// ✅ Correct - using function form for state updates
const [count, setCount] = useState(0);

setCount(prev => prev + 1); // Avoids race conditions

// ❌ Avoid - direct mutation
const [user, setUser] = useState({ name: '', age: 0 });
user.name = '新名字'; // Bad - doesn't trigger re-render
setUser({ ...user, name: '新名字' }); // Good
```

#### API Integration
```javascript
// ✅ Correct - using async/await
const loadUserConfig = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}/config`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // User not found
    }
    throw error;
  }
};

// ✅ Correct - with error handling and fallback
const loadBaziData = async (birthData) => {
  try {
    const response = await fetchBaziCalculation(birthData);
    return response.data;
  } catch (error) {
    errorLogger.log(error);
    // Fallback to local calculation
    return calculateBaziLocally(birthData);
  }
};

// ❌ Avoid - no error handling
const loadConfig = async (userId) => {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
};
```

## Special Domain Guidelines

### Chinese Astrology Calculations

```javascript
// ✅ Correct - well-commented complex calculations
/**
 * 计算八字年柱
 * 
 * @param {number} year - 农历年份
 * @param {number} month - 农历月份
 * @returns {Object} 包含天干和地支的对象
 * @returns {string} 天干 (甲乙丙丁戊己庚辛壬癸)
 * @returns {string} 地支 (子丑寅卯辰巳午未申酉戌亥)
 */
const calculateYearPillar = (year, month) => {
  // 复杂的计算逻辑
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 计算逻辑...
  return {
    heavenlyStem: heavenlyStems[stemIndex],
    earthlyBranch: earthlyBranches[branchIndex]
  };
};

// ✅ Correct - using lunar-javascript library
import { Lunar } from 'lunar-javascript';

const getLunarDate = (solarDate) => {
  const lunar = Lunar.fromDate(solarDate);
  return {
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    ganzhiYear: lunar.getYearGanZhi(),
    ganzhiMonth: lunar.getMonthGanZhi(),
    ganzhiDay: lunar.getDayGanZhi()
  };
};

// ❌ Avoid - magic numbers without comments
const calculateBazi = (year) => {
  const result = (year + 3) % 10; // What does 3 and 10 mean?
  return result;
};
```

### UI Components for Chinese Characters

```javascript
// ✅ Correct - proper handling of Chinese characters
const renderUserName = (user) => {
  return (
    <div className="user-name">
      {user.name}
    </div>
  );
};

// ✅ Correct - ensuring font support for Chinese
const ChineseText = ({ children }) => {
  return (
    <span style={{
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      fontSize: '16px'
    }}>
      {children}
    </span>
  );
};

// ❌ Avoid - not handling Chinese character display
const Text = ({ children }) => {
  return <span>{children}</span>; // May not display correctly
};
```

## Testing Standards

### Test Structure
```javascript
// ✅ Correct - describe/it pattern
describe('BaziHelper', () => {
  describe('calculateYearPillar', () => {
    it('应该正确计算年柱', () => {
      const result = calculateYearPillar(2024, 1);
      expect(result.heavenlyStem).toBe('甲');
      expect(result.earthlyBranch).toBe('辰');
    });

    it('应该处理边界情况', () => {
      const result = calculateYearPillar(1900, 12);
      expect(result).toBeDefined();
    });
  });
});
```

## Code Quality Standards

### Linting
- ESLint configuration: `react-app` and `react-app/jest`
- No console.log statements in production code
- No unused variables
- Proper PropTypes or TypeScript interfaces
- Follow Airbnb React style guide (adapted)

### Performance
- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for event handlers
- Implement lazy loading for routes
- Optimize bundle size with code splitting

### Accessibility
- Use semantic HTML elements
- Provide ARIA labels where necessary
- Ensure keyboard navigation works
- Test with screen readers
- Minimum touch target: 44x44px

## Documentation Standards

### JSDoc Comments
```javascript
/**
 * 计算用户年龄
 * 
 * @param {Date|string} birthDate - 出生日期
 * @returns {number} 年龄（岁）
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

/**
 * 用户配置数据结构
 * @typedef {Object} UserConfig
 * @property {string} nickname - 用户昵称
 * @property {Date} birthDate - 出生日期
 * @property {string} birthTime - 出生时间 (格式: HH:MM)
 * @property {number} longitude - 经度
 * @property {number} latitude - 纬度
 * @property {string} gender - 性别 ('male' | 'female')
 */
```

## CSS/Tailwind Guidelines

```javascript
// ✅ Correct - using Tailwind utility classes
const Card = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
    <h3 className="text-lg font-bold mb-4">{title}</h3>
    {children}
  </div>
);

// ✅ Correct - responsive design with Tailwind
const Container = ({ children }) => (
  <div className="
    p-4        // All screens
    md:p-6     // Medium screens and up
    lg:p-8     // Large screens and up
  ">
    {children}
  </div>
);

// ❌ Avoid - custom CSS when Tailwind can do it
const Card = ({ children }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px'
  }}>
    {children}
  </div>
);
```

## Common Patterns

### Data Fetching Pattern
```javascript
// ✅ Correct - standard data fetching pattern
const useUserData = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchUserData(userId);
      setData(result);
    } catch (err) {
      setError(err.message);
      errorLogger.log(err, { component: 'useUserData', userId });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

### Form Handling Pattern
```javascript
// ✅ Correct - form handling with validation
const UserForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '12:00',
    gender: 'male'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = '请选择出生日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## Version History

| Version | Date       | Changes                              | Author        |
|----------|------------|-------------------------------------|---------------|
| 1.0.0    | 2026-01-07 | Initial coding style document       | ASDM System |

---

*These coding standards should be followed throughout the project. Regular reviews and updates are encouraged.*
