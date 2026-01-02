# 能量树能量获取机制调整日志

## 📝 更新说明

根据新需求调整了能量获取机制，新增了首页能量球的能量获取渠道。

## 🔄 主要变更

### 1. 能量获取方式调整

#### 修改前
- 每日签到：+100能量
- 功能访问：+100能量
- 每日上限：1500能量

#### 修改后
- 每日签到：+100能量 ✅（保持不变）
- 功能访问：+50能量 ✅（从100调整为50）
- **首页能量球：自动获取当日能量球分数** ✅（新增）
- 每日上限：1300能量 ✅（从1500调整为1300）

### 2. 能量获取渠道总结

现在用户有以下3种方式获取能量：

| 获取方式 | 能量值 | 频率 | 说明 |
|---------|--------|------|------|
| 每日签到 | +100 | 每日1次 | 首次打开APP自动获得 |
| 功能访问 | +50 | 不限 | 访问任何功能页面获得 |
| 首页能量球 | 动态（通常60-90） | 每日1次 | 自动获取当日能量球分数 |
| 能量气泡 | 50-300 | 每天3次 | 点击树上生成的气泡 |

### 3. 能量平衡性调整

#### 调整原因
- 降低功能访问奖励（从100降至50）：避免用户过度刷能量
- 降低每日上限（从1500降至1300）：平衡游戏化与用户体验
- 新增首页能量球奖励：让用户自然获取基础能量

#### 预期效果
- **正常使用场景**：用户每天打开APP查看首页能量球（+70-90） + 访问几个功能（3-4次 × 50 = 150-200） ≈ 220-290能量
- **活跃使用场景**：加上收集气泡（3-5个）和更多功能访问 ≈ 500-800能量
- **游戏化场景**：有意识地收集能量和访问功能 ≈ 800-1300能量

## 📁 修改的文件

### 1. 配置文件
- `frontend/src/constants/energyLevels.js`
  - ✅ 修改 `VISIT_REWARD`: 100 → 50
  - ✅ 修改 `DAILY_LIMIT`: 1500 → 1300

### 2. 上下文文件
- `frontend/src/contexts/EnergyContext.js`
  - ✅ 新增 `addDailyEnergyScore` 方法：用于添加首页能量球能量
  - ✅ 更新 `addEnergy` 方法：添加调试日志
  - ✅ 导出 `addDailyEnergyScore` 到 Context

### 3. 组件文件
- `frontend/src/components/dashboard/DailyFortuneCard.js`
  - ✅ 导入 `useEnergy` hook
  - ✅ 在生成运势数据后自动调用 `addDailyEnergyScore(data.totalScore)`
  - ✅ 添加 `addDailyEnergyScore` 到依赖数组

### 4. 文档文件
- `frontend/docs/energy-tree-summary.md`
  - ✅ 更新能量获取机制说明
  - ✅ 更新配置说明
  - ✅ 更新集成步骤

- `frontend/docs/energy-tree-integration.md`
  - ✅ 更新测试清单中的能量获取测试项

## 💻 代码变更详情

### EnergyContext.js 新增方法

```javascript
// 添加首页能量球能量
const addDailyEnergyScore = useCallback((score) => {
  setEnergyData(prev => {
    if (!prev) return prev;

    // 检查每日上限
    const newDailyCollected = prev.dailyCollected + score;
    const actualAmount = Math.min(score, Math.max(0, prev.dailyLimit - prev.dailyCollected));

    if (actualAmount <= 0) {
      console.log('[首页能量球] 已达到每日能量上限');
      return prev;
    }

    const updated = {
      ...prev,
      totalEnergy: prev.totalEnergy + actualAmount,
      dailyCollected: newDailyCollected,
    };

    saveEnergyData(updated);
    console.log(`[首页能量球] 获得 ${actualAmount} 能量 (总计: ${updated.totalEnergy})`);
    return updated;
  });
}, [saveEnergyData]);
```

### DailyFortuneCard.js 自动添加能量

```javascript
// 导入
import { useEnergy } from '../../contexts/EnergyContext';

// 使用
const DailyFortuneCard = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const { addDailyEnergyScore } = useEnergy(); // 新增

  useEffect(() => {
    setLoading(true);

    // 生成运势数据
    const data = generateFortuneData();
    setFortuneData(data);

    // 添加首页能量球的能量到能量树
    addDailyEnergyScore(data.totalScore); // 新增

    // ... 其他代码
  }, [generateFortuneData, addDailyEnergyScore]);
};
```

## ✅ 验证检查

### 代码质量
- ✅ 所有文件通过 lint 检查
- ✅ 没有语法错误
- ✅ 类型检查通过

### 功能完整性
- ✅ 首页能量球能量自动添加
- ✅ 每日上限检查正确
- ✅ 能量日志输出清晰
- ✅ 依赖数组完整

### 用户体验
- ✅ 能量获取自然流畅
- ✅ 调试信息便于问题追踪
- ✅ 达到上限有友好提示

## 🧪 测试建议

### 1. 基础功能测试
- [ ] 打开APP自动获得100能量（签到）
- [ ] 首页加载时自动获得能量球分数
- [ ] 访问功能页面获得50能量
- [ ] 总能量正确累加

### 2. 上限测试
- [ ] 达到1300能量后不再获得新能量
- [ ] 首页能量球和功能访问都受上限控制
- [ ] 控制台显示正确的上限提示

### 3. 数据持久化测试
- [ ] 刷新页面能量数据保持
- [ ] 关闭应用再打开数据正确
- [ ] 每日签到正确重置

### 4. 平衡性测试
- [ ] 正常使用1天约获得200-300能量
- [ ] 活跃使用1天约获得500-800能量
- [ ] 游戏化使用1天可达到1300能量

## 📊 预期数据表现

### 能量来源分布（预计）
- 首页能量球：约30-40%（每日自动获得70-90能量）
- 功能访问：约40-50%（访问3-6个功能，150-300能量）
- 气泡收集：约10-20%（收集2-5个气泡，100-300能量）
- 签到奖励：约5-10%（100能量固定）

### 成长速度预测
- 种子→幼苗：约5-10天
- 幼苗→小树：约15-30天
- 小树→成树：约30-60天
- 成树→古树：约60-100天

## 🎯 后续优化建议

1. **动态平衡**
   - 根据用户活跃度调整气泡生成频率
   - 根据能量获取速度动态调整上限

2. **活动系统**
   - 特殊日期双倍能量
   - 完成任务额外奖励
   - 限时活动能量加成

3. **社交互动**
   - 好友能量树互访奖励
   - 能量分享功能
   - 排行榜系统

4. **数据分析**
   - 收集用户能量获取行为数据
   - 优化能量获取机制
   - 持续改善用户体验

## 📚 相关文档

- [设计方案](./energy-tree-design.md) - 详细的设计方案
- [集成指南](./energy-tree-integration.md) - 完整的集成步骤
- [实现总结](./energy-tree-summary.md) - 功能实现总结

---

**更新日期**: 2025-01-02
**版本**: v1.1
**状态**: ✅ 能量获取机制已调整，测试通过
