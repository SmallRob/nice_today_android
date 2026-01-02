# 能量提升页面集成到能量树系统

## 📝 更新说明

能量提升页面已成功集成到能量树系统，现在是一个独立的能量获取渠道。

## ✅ 新增功能

### 1. 能量提升页面访问奖励
- **触发条件**：首次访问能量提升页面
- **奖励**：+100能量
- **限制**：每日仅获得一次
- **上限控制**：受每日总能量上限1300限制

### 2. UP能量系统（任务完成奖励）
- **触发条件**：完成能量提升任务
- **奖励**：每个任务50-200 UP能量
- **UP上限**：每日最多获得1000 UP能量
- **特点**：
  - UP能量独立于每日总能量
  - 任务完成后立即获得UP能量
  - 同一任务不能重复获得

### 3. 任务配置
每个能量提升任务都有不同的UP奖励：

| 任务ID | 任务名称 | UP奖励 |
|--------|----------|---------|
| 1 | 晨间冥想 | 150 |
| 2 | 户外散步 | 200 |
| 3 | 深呼吸练习 | 100 |
| 4 | 健康早餐 | 150 |
| 5 | 拉伸运动 | 150 |
| 6 | 感恩练习 | 100 |
| 7 | 保持水分 | 50 |
| 8 | 积极思考 | 100 |

## 📁 修改的文件

### 1. 配置文件
`frontend/src/constants/energyLevels.js`
- ✅ 添加 `ENERGY_BOOST_PAGE_REWARD`: 100
- ✅ 添加 `ENERGY_BOOST_UP_LIMIT`: 1000

### 2. 上下文文件
`frontend/src/contexts/EnergyContext.js`
- ✅ 添加 `energyBoostVisited` 状态字段
- ✅ 添加 `energyBoostUP` 状态字段
- ✅ 添加 `lastBoostDate` 状态字段
- ✅ 添加 `boostCompletedTasks` 状态字段
- ✅ 实现 `visitEnergyBoostPage()` 方法
- ✅ 实现 `addEnergyBoostUP()` 方法
- ✅ 添加每日重置逻辑

### 3. 页面文件
`frontend/src/pages/EnergyBoostPage.js`
- ✅ 导入 `useEnergy` hook
- ✅ 导入 `DAILY_CONFIG` 常量
- ✅ 添加页面访问奖励逻辑
- ✅ 为每个活动添加 `upReward` 属性
- ✅ 修改任务完成逻辑，添加UP能量奖励
- ✅ 添加UP能量显示UI
- ✅ 更新依赖项

## 🎯 完整的能量获取渠道

现在用户有以下 **5种方式** 获取能量：

| 获取方式 | 能量值 | UP值 | 频率 | 说明 |
|---------|--------|-------|------|------|
| 每日签到 | +100 | - | 每日1次 | 首次打开APP |
| 首页能量球 | 动态 | - | 每日1次 | 自动获得当日分数 |
| 能量提升页面 | +100 | - | 每日1次 | 首次访问页面 |
| 功能访问 | +50 | - | 不限 | 访问任何功能页面 |
| 能量提升任务 | - | 50-200 | 不限 | 完成能量提升任务 |
| 能量气泡 | 50-300 | - | 每天3次 | 点击树上生成的气泡 |

**每日能量上限：1300能量**
**每日UP上限：1000 UP能量**

## 🧪 使用流程

### 访问能量提升页面
1. 用户点击导航进入能量提升页面
2. 页面加载时自动检测是否首次访问
3. 如果是今日首次访问，给予+100能量奖励
4. 标记已访问状态，防止重复奖励
5. 新的一天自动重置访问状态

### 完成能量提升任务
1. 用户点击任务卡片完成任务
2. 系统检查任务是否已完成（防重复）
3. 如果未完成，给予UP能量奖励
4. UP能量累加到UP总数
5. 检查UP能量上限（1000）
6. 任务标记为已完成
7. 显示UP能量更新

## 📊 能量计算示例

### 正常使用场景
用户每天打开APP并访问能量提升页面：
- 签到：100
- 首页能量球：70-90
- 能量提升页面：100
- 功能访问3次：150
- **总计约：420-440能量**

### 活跃使用场景（完成任务）
用户完成3-4个能量提升任务：
- 签到：100
- 首页能量球：70-90
- 能量提升页面：100
- 功能访问3次：150
- 完成任务3个：400-550 UP
- **总计约：420-440能量 + 400-550 UP**

### 完美完成场景
用户完成所有8个能量提升任务：
- 签到：100
- 首页能量球：70-90
- 能量提升页面：100
- 功能访问3次：150
- 完成任务8个：1000 UP
- **总计约：420-440能量 + 1000 UP**

## 💻 代码实现要点

### EnergyContext 新增方法

```javascript
// 访问能量提升页面
const visitEnergyBoostPage = useCallback(() => {
  setEnergyData(prev => {
    if (!prev) return prev;

    // 如果今天已经访问过，不再给予奖励
    if (prev.energyBoostVisited) {
      console.log('[能量提升页] 今日已访问过，不再给予奖励');
      return prev;
    }

    // 检查每日上限
    const reward = DAILY_CONFIG.ENERGY_BOOST_PAGE_REWARD;
    const newDailyCollected = prev.dailyCollected + reward;
    const actualAmount = Math.min(reward, Math.max(0, prev.dailyLimit - prev.dailyCollected));

    if (actualAmount <= 0) {
      console.log('[能量提升页] 已达到每日能量上限');
      return {
        ...prev,
        energyBoostVisited: true,
      };
    }

    const updated = {
      ...prev,
      totalEnergy: prev.totalEnergy + actualAmount,
      dailyCollected: newDailyCollected,
      energyBoostVisited: true,
    };

    saveEnergyData(updated);
    return updated;
  });
}, [saveEnergyData]);

// 添加UP能量
const addEnergyBoostUP = useCallback((taskId, upAmount) => {
  setEnergyData(prev => {
    if (!prev) return prev;

    // 检查是否已完成过这个任务
    if (prev.boostCompletedTasks && prev.boostCompletedTasks.includes(taskId)) {
      console.log(`[能量提升UP] 任务${taskId}已完成，不再给予UP能量`);
      return prev;
    }

    // 检查UP能量上限
    const newUP = (prev.energyBoostUP || 0) + upAmount;
    const actualUP = Math.min(upAmount, Math.max(0, DAILY_CONFIG.ENERGY_BOOST_UP_LIMIT - (prev.energyBoostUP || 0)));

    if (actualUP <= 0) {
      console.log('[能量提升UP] 已达到UP能量上限');
      return prev;
    }

    const completedTasks = prev.boostCompletedTasks || [];
    const updated = {
      ...prev,
      energyBoostUP: newUP,
      boostCompletedTasks: [...completedTasks, taskId],
    };

    saveEnergyData(updated);
    return updated;
  });
}, [saveEnergyData]);
```

### EnergyBoostPage 集成逻辑

```javascript
// 导入能量树系统
import { useEnergy } from '../contexts/EnergyContext';
import { DAILY_CONFIG } from '../constants/energyLevels';

// 在页面中使用
const EnergyBoostPage = () => {
  const {
    energyData,
    visitEnergyBoostPage,
    addEnergyBoostUP,
  } = useEnergy();

  // 访问奖励
  useEffect(() => {
    if (!pageVisited && energyData) {
      visitEnergyBoostPage();
      setPageVisited(true);
    }
  }, [pageVisited, energyData, visitEnergyBoostPage]);

  // 任务完成处理
  const handleToggleTask = (taskId) => {
    // ... 完成任务逻辑

    // 获取任务的UP奖励
    const activity = ENERGY_ACTIVITIES.find(a => a.id === taskId);
    const upReward = activity ? activity.upReward : 0;

    // 添加UP能量到能量树
    addEnergyBoostUP(taskId, upReward);

    // ... 其他逻辑
  };

  // UI显示UP能量
  <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg">
    <span className="text-sm font-semibold">今日UP能量</span>
    <span className="text-lg font-bold ml-2">
      {energyData?.energyBoostUP || 0} / {DAILY_CONFIG.ENERGY_BOOST_UP_LIMIT}
    </span>
  </div>
};
```

## ✅ 测试清单

### 基础功能
- [ ] 首次访问能量提升页面获得+100能量
- [ ] 同一天内再次访问不重复获得能量
- [ ] 新的一天访问状态自动重置

### UP能量系统
- [ ] 完成任务获得对应的UP能量
- [ ] 同一任务不能重复获得UP
- [ ] UP能量正确累加
- [ ] 达到UP上限后不再获得UP

### UI显示
- [ ] UP能量正确显示在页面
- [ ] UP能量实时更新
- [ ] 达到UP上限有提示

### 数据持久化
- [ ] 刷新页面数据保持
- [ ] 关闭应用再打开数据恢复
- [ ] 每日重置正常工作

## 🎨 UI改进

### UP能量显示
- 使用紫色到粉色渐变
- 显示当前UP值和上限
- 与能量指数球形成对比

### 任务卡片
- 可以添加任务UP奖励提示
- 使用图标显示奖励
- 完成时显示UP获得动画

## 💡 后续优化建议

1. **UP能量可视化**
   - 在能量树页面显示UP能量
   - UP能量可以作为特殊装饰物
   - UP能量可用于解锁特殊功能

2. **成就系统**
   - 添加"能量提升大师"成就
   - 完成所有8个任务奖励
   - UP能量达到上限奖励

3. **社交功能**
   - 分享能量提升成就
   - 好友互相监督完成任务
   - 能量提升排行榜

4. **数据分析**
   - 统计用户最喜欢完成的任务
   - 分析用户能量提升习惯
   - 优化任务配置

## 📚 相关文档

- [能量树设计方案](./energy-tree-design.md)
- [能量树实现总结](./energy-tree-summary.md)
- [能量树更新日志](./energy-tree-update-log.md)

---

**创建日期**: 2025-01-02
**版本**: v1.0
**状态**: ✅ 能量提升页面已集成到能量树系统
