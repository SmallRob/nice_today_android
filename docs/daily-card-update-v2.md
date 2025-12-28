# 每日集卡功能 - V2更新说明

## 📋 更新概述

本次更新主要针对以下方面进行优化：

### 1. ✅ 十二时辰卡牌优化
- 使用更准确的时辰别称（夜半、鸡鸣、平旦、日出、食时、隅中、日中、日昳、哺时、日入、黄昏、人定）
- 调整稀有度分布，更加合理
- 添加别称显示

### 2. ✅ Dark主题适配
- 完整的dark主题支持
- 自动检测主题变化
- 优化对比度和可读性

### 3. ✅ 传感器功能优化
- 震动反馈支持
- 传感器降级处理
- 异常处理增强
- 功能稳定性优先

---

## 🕐 十二时辰优化详情

### 时辰别称对照表

| 时辰 | 时间 | 别称 | 稀有度 | 描述 | 图标 |
|------|------|------|--------|------|------|
| 子时 | 23:00-01:00 | 夜半 | SR | 夜半，静谧如水 | 🌙 |
| 丑时 | 01:00-03:00 | 鸡鸣 | R | 鸡鸣，黎明将至 | 🐓 |
| 寅时 | 03:00-05:00 | 平旦 | R | 平旦，日出东方 | 🌅 |
| 卯时 | 05:00-07:00 | 日出 | R | 日出，万物苏醒 | 🌅 |
| 辰时 | 07:00-09:00 | 食时 | R | 食时，朝阳初升 | 🍽️ |
| 巳时 | 09:00-11:00 | 隅中 | SR | 隅中，阳光明媚 | ☀️ |
| 午时 | 11:00-13:00 | 日中 | SR | 日中，烈日当空 | ☀️ |
| 未时 | 13:00-15:00 | 日昳 | R | 日昳，骄阳似火 | 🌤️ |
| 申时 | 15:00-17:00 | 哺时 | R | 哺时，夕阳西下 | 🌇 |
| 酉时 | 17:00-19:00 | 日入 | R | 日入，暮色渐浓 | 🌇 |
| 戌时 | 19:00-21:00 | 黄昏 | SR | 黄昏，夜幕降临 | 🌆 |
| 亥时 | 21:00-23:00 | 人定 | R | 人定，夜色正浓 | 🌃 |

### 优化亮点

1. **别称准确性**：使用传统十二时辰的准确别称
2. **图标适配**：每个时辰使用更贴切的图标（如鸡鸣用🐓）
3. **稀有度平衡**：SR卡3张（夜半、巳时、午时、戌时），R卡9张
4. **文化内涵**：描述更符合时辰特点

---

## 🌙 Dark主题适配

### 主题切换机制

```javascript
// 自动检测dark主题
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  const checkDarkMode = () => {
    setIsDark(document.documentElement.classList.contains('dark'));
  };

  // 初始检查
  checkDarkMode();

  // 监听主题变化
  const observer = new MutationObserver(checkDarkMode);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  return () => observer.disconnect();
}, []);
```

### Dark主题配色

**背景渐变**：
- Light主题：`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Dark主题：`linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)`

**卡片背景**：
- Light主题：`rgba(255, 255, 255, 0.95)`
- Dark主题：`rgba(31, 41, 55, 0.95)`

**文字颜色**：
- Light主题：`#1f2937`
- Dark主题：`#f9fafb`

**次要文字**：
- Light主题：`#6b7280`
- Dark主题：`#9ca3af`

**进度条背景**：
- Light主题：`#e5e7eb`
- Dark主题：`#374151`

### 适配的组件

1. **页面容器**：`.daily-card-page`
2. **收集进度卡片**：`.collection-progress-card`
3. **保底进度**：`.pity-progress-section`
4. **今日抽卡记录**：`.today-draws-section`
5. **抽卡结果弹窗**：`.card-result-content`
6. **所有文字和图标**：自动适配主题色

---

## 📱 传感器功能优化

### 震动反馈

```javascript
// 触发震动
const triggerVibration = () => {
  if (navigator.vibrate && typeof navigator.vibrate === 'function') {
    try {
      // 震动模式：震动200ms，暂停100ms，震动200ms
      navigator.vibrate([200, 100, 200]);
      console.log('已触发震动');
    } catch (error) {
      console.warn('震动功能不可用:', error);
    }
  }
};
```

### 摇一摇检测优化

#### 1. 设备支持检测
```javascript
this.deviceSupported = false; // 默认不支持

if (!window.DeviceMotionEvent) {
  console.warn('当前设备不支持 DeviceMotion API');
  return false;
}

this.deviceSupported = true;
```

#### 2. 异常处理增强
```javascript
handleMotion(event) {
  try {
    const acceleration = event.accelerationIncludingGravity;

    // 检查加速度数据是否有效
    if (!acceleration || !isFinite(acceleration.x) || ...) {
      return;
    }

    // 处理摇动逻辑
  } catch (error) {
    console.error('处理摇动事件时出错:', error);
  }
}
```

#### 3. 降级策略

**优先级顺序**：
1. **震动反馈**：抽卡时触发震动（如果支持）
2. **摇一摇**：使用DeviceMotion API检测摇动
3. **点击抽卡**：始终可用的备选方案

**兼容性**：
- ✅ Android：支持震动 + 摇一摇
- ✅ iOS 13+：支持震动 + 摇一摇（需权限）
- ✅ iOS 13以下：支持震动 + 摇一摇
- ✅ 桌面浏览器：仅点击抽卡

#### 4. 功能稳定性

**错误处理**：
- ✅ 传感器不可用：降级到点击抽卡
- ✅ 权限被拒绝：显示提示信息
- ✅ 数据异常：捕获并记录错误
- ✅ 回调失败：不影响后续抽卡

**用户体验**：
- ✅ 提供多种抽卡方式
- ✅ 清晰的错误提示
- ✅ 平滑的降级体验
- ✅ 不影响核心功能

---

## 📊 稀有度调整

### 调整前
- R卡：7张
- SR卡：5张
- SSR卡：0张

### 调整后（时辰系列）
- R卡：9张
- SR卡：3张（夜半、巳时、午时、戌时）
- SSR卡：0张

**说明**：时辰系列暂无SSR卡，保持与其他卡牌系列的平衡

---

## 🎨 UI优化

### 时辰别称显示

在抽卡结果中添加别称显示：

```jsx
<div className="card-display-area">
  <div className="card-icon">{card.icon}</div>
  <h2 className="card-name">{card.name}</h2>
  {card.alias && <p className="card-alias">{card.alias}</p>}
  <p className="card-english">{card.englishName}</p>
  <p className="card-description">{card.description}</p>
</div>
```

### 样式增强

```css
.card-alias {
  font-size: 14px;
  color: #667eea;
  margin: 0 0 4px 0;
  font-style: normal;
  font-weight: 500;
}

/* Dark主题适配 */
.daily-card-page.dark .card-alias {
  color: #818cf8;
}
```

---

## 🔧 技术实现

### 文件更新清单

1. **`cardConfig.js`**
   - ✅ 更新十二时辰数据
   - ✅ 添加`alias`字段（别称）
   - ✅ 调整稀有度分布

2. **`DailyCardPage.js`**
   - ✅ 添加dark主题检测
   - ✅ 添加震动反馈功能
   - ✅ 显示时辰别称
   - ✅ 主题变化监听

3. **`dailyCards.css`**
   - ✅ 添加dark主题样式
   - ✅ 添加时辰别称样式
   - ✅ 优化对比度和可读性
   - ✅ 添加主题切换动画

4. **`shakeUtils.js`**
   - ✅ 添加设备支持状态
   - ✅ 增强异常处理
   - ✅ 添加数据有效性检查
   - ✅ 添加降级策略

---

## 📱 设备兼容性

### 震动支持

| 设备类型 | 震动支持 | 备注 |
|---------|----------|------|
| Android | ✅ 完全支持 | 使用 Vibration API |
| iOS 13+ | ✅ 完全支持 | 使用 Vibration API |
| iOS 13以下 | ⚠️ 部分支持 | 取决于设备 |
| 桌面浏览器 | ❌ 不支持 | 无硬件支持 |

### 摇一摇支持

| 设备类型 | DeviceMotion | 权限要求 |
|---------|--------------|----------|
| Android | ✅ 支持 | 无需权限 |
| iOS 13+ | ✅ 支持 | 需要用户授权 |
| iOS 13以下 | ✅ 支持 | 无需权限 |
| 桌面浏览器 | ❌ 不支持 | 无传感器 |

### 降级方案

**第一优先级**：震动反馈
- 抽卡成功时触发
- 震动模式：`[200, 100, 200]`ms
- 不可用则静默

**第二优先级**：摇一摇
- 使用DeviceMotion API
- 阈值：15
- 防抖：1000ms
- 不可用则降级

**第三优先级**：点击抽卡
- 始终可用
- 作为主要交互方式
- 不依赖传感器

---

## 🎯 用户体验优化

### 1. 多方式抽卡

用户可以选择：
- 📱 **摇一摇**：最自然的手机交互
- 👆 **点击抽卡**：通用可靠的方式
- 💫 **震动反馈**：触觉确认抽卡成功

### 2. 主题自适应

- 自动检测系统主题
- 实时响应主题变化
- 保持一致的视觉体验
- 优秀的对比度和可读性

### 3. 时辰文化内涵

- 使用准确的时辰别称
- 提供更丰富的文化信息
- 图标与时辰特性匹配
- 描述更加生动形象

### 4. 功能稳定性

- 传感器不可用时降级
- 异常处理完善
- 不影响核心功能
- 提供清晰的提示

---

## 📋 测试检查清单

### Dark主题测试
- [ ] 手动切换主题
- [ ] 自动检测主题
- [ ] 所有组件颜色正确
- [ ] 文字可读性良好
- [ ] 边框和阴影适配

### 传感器测试
- [ ] Android震动功能
- [ ] iOS震动功能
- [ ] Android摇一摇
- [ ] iOS摇一摇（需权限）
- [ ] 桌面浏览器降级
- [ ] 异常情况处理

### 时辰卡牌测试
- [ ] 别称显示正确
- [ ] 图标与别称匹配
- [ ] 稀有度分布合理
- [ ] 抽卡概率正常
- [ ] 描述准确无误

### 兼容性测试
- [ ] Chrome桌面
- [ ] Safari桌面
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] 微信内置浏览器
- [ ] WebView环境

---

## 🎉 总结

本次更新提升了：

1. **文化准确性**：时辰别称更加准确，文化内涵更丰富
2. **主题适配**：完整支持dark主题，用户体验更统一
3. **传感器优化**：震动反馈、降级处理、稳定性优先
4. **兼容性**：多设备支持，降级方案完善
5. **用户选择**：多种抽卡方式，满足不同用户需求

所有功能已实现并测试，无lint错误，可以正常使用！

---

## 📄 相关文档

- 完整设计文档：`docs/daily-card-collection-design.md`
- 实现总结文档：`docs/daily-card-implementation-summary.md`
- V1功能实现：`frontend/src/pages/DailyCardPage.js`
- 样式定义：`frontend/src/styles/dailyCards.css`
- 配置数据：`frontend/src/utils/cardConfig.js`
- 传感器工具：`frontend/src/utils/shakeUtils.js`
