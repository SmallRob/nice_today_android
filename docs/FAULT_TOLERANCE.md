# 容错机制使用文档

## 概述

本项目实现了完整的容错机制，用于处理节点更新失败和并发访问问题。该机制确保数据零丢失，并提供完整的操作日志用于追踪和调试。

## 核心组件

### 1. 并发锁管理器 (ConcurrencyLock)

提供互斥锁机制，保护关键操作的并发访问。

**主要功能：**
- 获取和释放锁
- 自动超时释放（默认30秒）
- 锁状态查询
- 执行带锁的操作

**使用示例：**
```javascript
import { concurrencyLock } from './utils';

// 方式1：手动获取和释放锁
try {
  await concurrencyLock.acquire('my-operation', { timeout: 10000 });
  // 执行需要保护的操作
  console.log('操作执行中...');
} finally {
  concurrencyLock.release('my-operation');
}

// 方式2：使用 withLock 方法（推荐）
const result = await concurrencyLock.withLock(
  'my-operation',
  async () => {
    // 执行需要保护的操作
    return '操作结果';
  },
  { timeout: 10000 }
);
```

### 2. 节点恢复管理器 (NodeRecoveryManager)

当检测到节点更新失败时，自动执行修复操作。

**修复流程：**
1. 创建配置备份
2. 创建全新的节点副本
3. 完整复制数据
4. 验证新节点数据完整性
5. 确认无误后安全替换旧节点

**使用示例：**
```javascript
import { nodeRecoveryManager } from './utils';

// 手动触发恢复
const recoveryResult = await nodeRecoveryManager.detectAndRecover(
  index,
  config,
  updates,
  error,
  configs
);

if (recoveryResult.success) {
  console.log('恢复成功:', recoveryResult);
} else {
  console.error('恢复失败:', recoveryResult.error);
}

// 获取恢复历史
const history = nodeRecoveryManager.getRecoveryHistory();

// 获取统计信息
const stats = nodeRecoveryManager.getStatistics();

// 导出恢复历史
const exportData = nodeRecoveryManager.exportHistory();
```

### 3. 操作日志管理器 (OperationLogger)

记录系统操作日志，便于追踪和调试。

**日志级别：**
- `info`: 一般信息
- `warn`: 警告信息
- `error`: 错误信息
- `success`: 成功信息

**使用示例：**
```javascript
import { operationLogger } from './utils';

// 记录日志
operationLogger.log('info', 'OPERATION_NAME', {
  key: 'value',
  details: '详细信息'
});

// 获取日志
const allLogs = operationLogger.getLogs();
const recentLogs = operationLogger.getRecentLogs(50);
const errorLogs = operationLogger.getErrorLogs();

// 导出日志
const exportData = operationLogger.exportLogs();

// 清空日志
operationLogger.clearLogs();
```

### 4. 增强版配置管理器 (EnhancedUserConfigManager)

集成了容错机制的配置管理器。

**容错相关方法：**

```javascript
import { enhancedUserConfigManager } from './utils';

// 启用/禁用容错机制
enhancedUserConfigManager.setFaultToleranceEnabled(true);
enhancedUserConfigManager.setAutoRecoveryEnabled(true);

// 获取容错状态
const status = enhancedUserConfigManager.getFaultToleranceStatus();
console.log(status);
// {
//   faultToleranceEnabled: true,
//   autoRecoveryEnabled: true,
//   maxRecoveryAttempts: 3
// }

// 获取操作日志
const logs = enhancedUserConfigManager.getOperationLogs();
const recentLogs = enhancedUserConfigManager.getRecentLogs(50);
const errorLogs = enhancedUserConfigManager.getErrorLogs();

// 获取恢复历史
const history = enhancedUserConfigManager.getRecoveryHistory();

// 获取统计信息
const stats = enhancedUserConfigManager.getFaultToleranceStatistics();
console.log(stats);
// {
//   recovery: { totalRecoveries: 10, successfulRecoveries: 9, ... },
//   errors: { total: 5, recent: 2 },
//   locks: [...]
// }

// 导出数据
const logsExport = enhancedUserConfigManager.exportOperationLogs();
const historyExport = enhancedUserConfigManager.exportRecoveryHistory();

// 清理维护（清理过期数据）
const cleanupResult = await enhancedUserConfigManager.cleanupMaintenance();
console.log(cleanupResult);
// {
//   backupsCleaned: 2,
//   logsCleaned: 1,
//   locksCleaned: 0
// }
```

## 容错机制工作流程

### 1. 节点更新失败检测

当调用 `updateConfigWithNodeUpdate` 时，如果发生错误，系统会：
1. 记录错误日志
2. 检查是否启用自动恢复
3. 如果启用，尝试自动修复

### 2. 自动修复流程

```
开始修复
    ↓
创建配置备份 (防止数据丢失)
    ↓
创建全新的节点副本
    ↓
完整复制更新数据
    ↓
验证新节点数据完整性
    ↓
    验证通过？
    ├─ 是 → 替换旧节点 → 保存到存储 → 通知监听器 → 完成
    └─ 否 → 从备份恢复 → 记录失败 → 抛出错误
```

### 3. 并发访问保护

对于每个配置更新操作：
1. 获取配置锁（`config-update-{index}`）
2. 执行更新操作
3. 如果失败，尝试自动恢复
4. 释放锁

## 最佳实践

### 1. 启用容错机制

```javascript
// 应用初始化时启用容错
enhancedUserConfigManager.setFaultToleranceEnabled(true);
enhancedUserConfigManager.setAutoRecoveryEnabled(true);
```

### 2. 定期清理维护

```javascript
// 定期执行清理（如每天一次）
setInterval(async () => {
  await enhancedUserConfigManager.cleanupMaintenance();
}, 24 * 60 * 60 * 1000);
```

### 3. 监控错误日志

```javascript
// 定期检查错误日志
setInterval(() => {
  const errorLogs = enhancedUserConfigManager.getErrorLogs();
  if (errorLogs.length > 10) {
    console.warn('发现大量错误日志，请检查系统状态');
    // 发送告警或执行其他操作
  }
}, 60 * 60 * 1000); // 每小时检查一次
```

### 4. 导出诊断数据

```javascript
// 当需要调试时，导出所有相关数据
const diagnosticData = {
  logs: enhancedUserConfigManager.exportOperationLogs(),
  recoveryHistory: enhancedUserConfigManager.exportRecoveryHistory(),
  stats: enhancedUserConfigManager.getFaultToleranceStatistics(),
  timestamp: new Date().toISOString()
};

console.log(JSON.stringify(diagnosticData, null, 2));
```

## 配置选项

### ConcurrencyLock 配置

```javascript
// 修改默认超时时间（毫秒）
concurrencyLock.lockTimeout = 60000; // 60秒

// 修改重试间隔（毫秒）
concurrencyLock.retryInterval = 200; // 200ms

// 修改最大重试次数
concurrencyLock.maxRetries = 600; // 2分钟
```

### EnhancedUserConfigManager 配置

```javascript
// 启用/禁用容错
enhancedUserConfigManager.faultToleranceEnabled = true;

// 启用/禁用自动恢复
enhancedUserConfigManager.autoRecoveryEnabled = true;

// 设置最大恢复尝试次数
enhancedUserConfigManager.maxRecoveryAttempts = 3;
```

### NodeRecoveryManager 配置

```javascript
// 设置最大历史记录数量
nodeRecoveryManager.maxHistorySize = 100;

// 设置备份最大保留时间（毫秒）
nodeRecoveryManager.cleanupOldBackups(7 * 24 * 60 * 60 * 1000); // 7天
```

### OperationLogger 配置

```javascript
// 设置最大日志数量
operationLogger.maxLogSize = 1000;

// 设置日志保留天数
operationLogger.logRetentionDays = 30;
```

## 故障排查

### 问题：获取锁超时

**原因：** 某个操作持有锁的时间过长。

**解决方法：**
1. 检查锁状态：`concurrencyLock.getLockStatus()`
2. 如果锁已过期，清理：`concurrencyLock.cleanupExpiredLocks()`
3. 查看操作日志，找出长时间运行的操作

### 问题：恢复失败

**原因：** 数据损坏严重，无法自动修复。

**解决方法：**
1. 查看恢复历史：`enhancedUserConfigManager.getRecoveryHistory()`
2. 查看错误日志：`enhancedUserConfigManager.getErrorLogs()`
3. 手动检查并修复配置数据

### 问题：内存占用过高

**原因：** 日志或备份积累过多。

**解决方法：**
1. 执行清理：`await enhancedUserConfigManager.cleanupMaintenance()`
2. 调整日志保留时间：`operationLogger.logRetentionDays = 7`
3. 调整备份保留时间：`nodeRecoveryManager.cleanupOldBackups(3 * 24 * 60 * 60 * 1000)`

## 性能考虑

1. **锁粒度：** 锁应该尽可能细粒度，避免不必要的锁等待
2. **日志大小：** 定期清理日志，避免占用过多内存
3. **备份清理：** 及时清理过期备份，减少存储占用
4. **并发控制：** 在高并发场景下，合理设置锁超时时间

## 安全性

1. **日志安全：** 日志可能包含敏感信息，导出时注意脱敏
2. **备份安全：** 备份数据应加密存储
3. **访问控制：** 管理接口应添加权限验证

## 相关文件

- `ConcurrencyLock.js` - 并发锁管理器
- `NodeRecoveryManager.js` - 节点恢复管理器
- `OperationLogger.js` - 操作日志管理器
- `EnhancedUserConfigManager.js` - 增强版配置管理器（集成容错）
- `DataIntegrityManager.js` - 数据完整性管理器
