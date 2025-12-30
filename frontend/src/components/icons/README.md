# SVG 图标组件

## 概述

这是一个稳定、高效的 SVG 图标系统，使用 React 组件渲染，替代了之前的 `dangerouslySetInnerHTML` 方案。

## 优势

✅ **类型安全** - 每个 SVG 都是独立的 React 组件
✅ **性能优化** - React 优化渲染，避免不必要的重渲染
✅ **易于维护** - 清晰的文件结构，便于修改和扩展
✅ **灵活定制** - 支持 size、color、className 属性
✅ **独立显示** - 白色背景、深色图标，层次分明

## 已安装的依赖

```json
{
  "devDependencies": {
    "@svgr/webpack": "^6.0.0",
    "@svgr/cli": "^6.0.0"
  }
}
```

## 图标列表

| 图标名称 | 组件 | 功能 |
|---------|--------|------|
| mbti | MBTIIcon | MBTI测试 |
| chinese-zodiac | ChineseZodiacIcon | 生肖运势 |
| horoscope | HoroscopeIcon | 星座运势 |
| bazi | BaziIcon | 八字月运 |
| biorhythm | BiorhythmIcon | 人体节律 |
| personality | PersonalityTraitIcon | 星座特质 |
| energy-boost | EnergyBoostIcon | 能量提升 |
| period-tracker | PeriodTrackerIcon | 经期助手 |
| ziwei | ZiWeiIcon | 紫微命宫 |
| todo | TodoIcon | 待办事项 |
| finance | FinanceIcon | 财务斩杀线 |
| takashima | TakashimaIcon | 高岛易断 |
| life-matrix | LifeMatrixIcon | 生命矩阵 |
| daily-card | DailyCardIcon | 每日集卡 |
| tarot-garden | TarotGardenIcon | 塔罗花园 |
| cultural-cup | CulturalCupIcon | 摔杯请卦 |
| dress-guide | DressGuideIcon | 穿衣指南 |
| wuxing-health | WuxingHealthIcon | 五行养生 |
| organ-rhythm | OrganRhythmIcon | 器官节律 |

## 使用方法

### 1. 通过 ModernIcon 组件使用（推荐）

```jsx
import ModernIcon from '@components/common/ModernIcon';

// 基本使用
<ModernIcon name="bazi" />

// 自定义大小和颜色
<ModernIcon name="horoscope" size={32} color="#1a1a1a" />

// 添加自定义类名
<ModernIcon name="todo" className="custom-icon" />
```

### 2. 直接导入图标组件

```jsx
import BaziIcon from '@icons/BaziIcon';

<BaziIcon size={24} color="#1a1a1a" />
```

## API

### ModernIcon Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| name | string | - | 图标名称（必需） |
| size | number | 24 | 图标尺寸（像素） |
| color | string | '#1a1a1a' | 图标颜色 |
| className | string | '' | 自定义类名 |

### Icon 组件 Props

每个图标组件都支持以下属性：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| size | number | 24 | 图标尺寸（像素） |
| color | string | 'currentColor' | 图标颜色 |
| className | string | '' | 自定义类名 |

## 样式建议

### 功能卡片图标

```css
.feature-card-icon {
  color: #1a1a1a; /* 深色图标 */
  font-size: clamp(1.5rem, 4vw, 2.2rem);
}
```

### 导航栏图标

```css
.tab-icon svg {
  color: currentColor;
  width: 24px;
  height: 24px;
}
```

## 添加新图标

1. 在 `src/components/icons/` 创建新文件，如 `MyNewIcon.jsx`

```jsx
const MyNewIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 你的 SVG 路径 */}
      <path d="..." stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default MyNewIcon;
```

2. 在 `ModernIcon.js` 中添加映射

```javascript
import MyNewIcon from '../icons/MyNewIcon';

const iconMap = {
  // ... 现有图标
  'my-new-icon': MyNewIcon,
};
```

3. 在 `src/components/icons/index.js` 中导出

```javascript
export { default as MyNewIcon } from './MyNewIcon';
```

## 性能优化

- ✅ 所有图标组件都使用 `React.memo` 优化（可选）
- ✅ SVG 使用 `fill="none"` 和 `stroke` 提高性能
- ✅ 支持按需导入，减少包体积
- ✅ 避免使用 `dangerouslySetInnerHTML`

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

## 常见问题

**Q: 图标不显示？**

A: 检查以下几点：
1. 确保图标名称正确
2. 检查 color 属性是否设置为可见颜色
3. 确认 SVG viewBox 和路径正确

**Q: 如何改变图标颜色？**

A: 使用 `color` 属性或通过 CSS 设置：
```jsx
<ModernIcon name="bazi" color="#ff0000" />
```

**Q: 图标尺寸怎么设置？**

A: 使用 `size` 属性或通过 CSS：
```jsx
<ModernIcon name="todo" size={32} />
```

## 设计规范

- 统一使用 24x24 viewBox
- stroke-width: 2 (标准线条宽度)
- strokeLinecap: round (圆角线条)
- strokeLinejoin: round (圆角连接)
- fill="none" (透明填充，仅使用描边)
- 居中对齐
- 简洁现代的设计风格

## 维护建议

1. **保持一致性** - 所有图标遵循相同的设计规范
2. **性能优先** - 使用简洁的路径，避免复杂图形
3. **可扩展性** - 图标尺寸要支持缩放不失真
4. **无障碍** - 确保图标在所有背景下都清晰可见
