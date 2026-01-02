# 能量树功能集成指南

## 一、文件说明

已创建以下文件：

### 1. 核心文件
- `frontend/src/pages/EnergyTreePage.js` - 能量树主页面
- `frontend/src/pages/EnergyTreePage.css` - 页面样式

### 2. 组件文件
- `frontend/src/components/energy-tree/EnergyTree.js` - 能量树SVG组件
- `frontend/src/components/energy-tree/EnergyBubble.js` - 能量气泡组件
- `frontend/src/components/energy-tree/EnergyProgressBar.js` - 能量进度条组件
- `frontend/src/components/energy-tree/LevelBadge.js` - 等级徽章组件
- `frontend/src/components/energy-tree/EnergyHistory.js` - 能量历史记录组件
- `frontend/src/components/energy-tree/EnergyHistory.css` - 历史记录样式

### 3. 配置和状态管理
- `frontend/src/constants/energyLevels.js` - 能量等级配置常量
- `frontend/src/contexts/EnergyContext.js` - 能量管理Context

## 二、集成步骤

### Step 1: 添加路由

在 `frontend/src/App.js` 中添加能量树路由：

```javascript
import EnergyTreePage from './pages/EnergyTreePage';

// 在路由配置中添加
<Route path="/energy-tree" element={<EnergyTreePage />} />
```

### Step 2: 在App根组件中包裹EnergyProvider

在 `frontend/src/App.js` 中添加：

```javascript
import { EnergyProvider } from './contexts/EnergyContext';

function App() {
  return (
    <EnergyProvider>
      {/* 现有的代码 */}
      <Routes>
        {/* 现有路由 */}
        <Route path="/energy-tree" element={<EnergyTreePage />} />
      </Routes>
    </EnergyProvider>
  );
}
```

### Step 3: 在DailyFortuneCard中添加能量树入口

修改 `frontend/src/components/dashboard/DailyFortuneCard.js`：

```javascript
import { useNavigate } from 'react-router-dom';

const DailyFortuneCard = () => {
  const navigate = useNavigate();
  // ... 其他代码

  return (
    <div className="daily-fortune-card">
      {/* 现有内容 */}

      {/* 在水球上方添加能量树入口 */}
      <div
        className="energy-tree-entrance"
        onClick={() => navigate('/energy-tree')}
      >
        <span className="entrance-icon">🌳</span>
        <span className="entrance-label">能量树</span>
      </div>

      {/* 水罐能量 */}
      <div className="fortune-right">
        <WaterFlask score={fortuneData.totalScore} />
      </div>
    </div>
  );
};
```

添加样式到 `frontend/src/components/dashboard/DailyFortuneCard.css`：

```css
.energy-tree-entrance {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: pulse 2s ease-in-out infinite;
}

.energy-tree-entrance:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.entrance-icon {
  font-size: 32px;
}

.entrance-label {
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
  }
}
```

### Step 4: 实现功能访问奖励

在应用的路由变化时添加能量奖励。可以在 `frontend/src/App.js` 中添加：

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEnergy } from './contexts/EnergyContext';

function App() {
  const location = useLocation();
  const { addEnergy } = useEnergy();

  useEffect(() => {
    // 监听路由变化，每次访问新页面给予能量奖励
    const handleRouteChange = () => {
      const excludedPaths = ['/', '/login', '/settings', '/energy-tree'];

      if (!excludedPaths.includes(location.pathname)) {
        addEnergy(100, '功能访问');
      }
    };

    handleRouteChange();
  }, [location.pathname, addEnergy]);

  return (
    <EnergyProvider>
      {/* ... */}
    </EnergyProvider>
  );
}
```

## 三、功能测试

### 测试清单

1. **基础功能测试**
   - [ ] 能量树页面正常显示
   - [ ] 能量树根据等级正确显示
   - [ ] 能量气泡正常生成
   - [ ] 点击气泡可以收集能量

2. **能量获取测试**
   - [ ] 首次打开APP获得100能量
   - [ ] 首页能量球自动获得能量
   - [ ] 访问功能页面获得50能量
   - [ ] 每日上限1300能量正常工作
   - [ ] 超过上限不再获得能量

3. **等级系统测试**
   - [ ] 能量达到阈值自动升级
   - [ ] 升级动画正常显示
   - [ ] 不同等级树的外观正确变化
   - [ ] 等级徽章正确显示

4. **气泡系统测试**
   - [ ] 气泡在树上随机生成
   - [ ] 气泡有不同大小和颜色
   - [ ] 气泡3天后自动消失
   - [ ] 点击气泡收集动画正常

5. **数据持久化测试**
   - [ ] 刷新页面能量数据保存
   - [ ] 关闭应用再打开数据恢复
   - [ ] 每日签到正常重置
   - [ ] 历史记录正确保存

6. **UI/UX测试**
   - [ ] 深色模式正常显示
   - [ ] 移动端适配良好
   - [ ] 动画流畅不卡顿
   - [ ] 文字清晰可读

## 四、配置说明

### 能量等级配置

可以在 `energyLevels.js` 中修改：
- 每日能量上限（DAILY_CONFIG.DAILY_LIMIT）
- 签到奖励（DAILY_CONFIG.SIGN_IN_REWARD）
- 访问奖励（DAILY_CONFIG.VISIT_REWARD）
- 气泡保留天数（DAILY_CONFIG.BUBBLE_RETENTION_DAYS）
- 各等级能量要求（ENERGY_LEVELS）

### 能量气泡配置

可以在 `energyLevels.js` 的 BUBBLE_SIZES 中修改：
- 气泡大小范围
- 气泡能量值范围

## 五、扩展功能建议

### 1. 成就系统
```javascript
// 可以在 EnergyContext 中添加成就系统
const achievements = [
  { id: 'first_bubble', name: '初次收集', condition: '首次收集气泡', reward: 100 },
  { id: 'level_10', name: '茁壮成长', condition: '达到10级', reward: 500 },
  { id: 'daily_max', name: '能量达人', condition: '单日达到上限', reward: 300 },
];
```

### 2. 社交功能
```javascript
// 可以添加好友能量树访问
const visitFriendTree = (friendId) => {
  // 访问好友树获得额外奖励
  addEnergy(50, '好友访问');
};
```

### 3. 季节主题
```javascript
// 根据月份改变树木主题
const getSeasonTheme = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};
```

### 4. 能量树装饰
```javascript
// 允许用户购买或解锁装饰物
const decorations = [
  { id: 'flowers', name: '花朵', cost: 500 },
  { id: 'lights', name: '灯光', cost: 1000 },
  { id: 'birds', name: '小鸟', cost: 2000 },
];
```

## 六、注意事项

1. **性能优化**
   - 限制气泡数量（代码中已限制为20个）
   - 使用CSS动画而非JS动画
   - 避免频繁的localStorage读写

2. **数据安全**
   - 防止用户修改本地时间作弊
   - 定期备份数据到云端（如果需要）
   - 验证能量数据的合理性

3. **用户体验**
   - 首次使用显示引导说明
   - 清晰的能量获取提示
   - 升级时的视觉反馈
   - 达到上限的友好提示

4. **兼容性**
   - 确保在不同浏览器中正常运行
   - 测试不同屏幕尺寸
   - 支持深色/浅色主题切换

## 七、故障排除

### 问题1: 能量数据丢失
**原因**: localStorage被清除或浏览器限制
**解决**: 添加数据备份机制，或使用IndexedDB

### 问题2: 气泡不显示
**原因**: 气泡已过期或数量过多被清理
**解决**: 检查气泡生成时间和数量限制

### 问题3: 升级不触发
**原因**: 等级计算逻辑错误
**解决**: 检查 getCurrentLevel 函数和能量数据

### 问题4: 动画卡顿
**原因**: DOM操作过多或动画过于复杂
**解决**: 优化CSS动画，减少重绘

## 八、后续优化

1. **性能优化**
   - 使用 React.memo 优化组件渲染
   - 虚拟化长列表（如果有）
   - 图片和SVG优化

2. **功能增强**
   - 添加能量商城
   - 实现能量树装扮
   - 添加每日任务
   - 支持能量交易

3. **数据分析**
   - 收集用户行为数据
   - 优化能量平衡性
   - 持续调整游戏难度

4. **A/B测试**
   - 测试不同能量获取方式
   - 优化用户留存率
   - 提升用户参与度
