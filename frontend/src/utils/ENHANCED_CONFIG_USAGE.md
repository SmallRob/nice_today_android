# 增强版用户配置管理系统使用指南

## 概述

新的增强版用户配置管理系统提供了以下核心功能：

1. **原子操作和数据完整性校验** - 确保所有配置操作都是原子性的
2. **多级缓存策略和持久化存储优化** - 提供可靠的数据持久化
3. **数据验证和完整性检查机制** - 自动验证和修复数据问题
4. **生辰八字节点级更新功能** - 精确控制数据更新，避免污染
5. **向后兼容性** - 支持从旧版系统平滑迁移

## 快速开始

### 1. 基本使用（推荐）

```javascript
// 导入统一接口
import { userConfig } from './utils/index.js';

// 自动初始化（推荐）
async function initApp() {
  // 系统会自动检测并迁移旧版数据
  const currentConfig = await userConfig.getCurrentConfig();
  console.log('当前配置:', currentConfig);
}

// 更新配置（使用节点级更新）
async function updateUserProfile() {
  const result = await userConfig.updateConfig(0, {
    nickname: '新昵称',
    birthDate: '1990-01-01'
  });
  
  if (result.success) {
    console.log('更新成功');
  }
}
```

### 2. 高级使用（直接使用增强版管理器）

```javascript
import { enhancedUserConfigManager, baziUpdateManager } from './utils/index.js';

// 手动初始化
await enhancedUserConfigManager.initialize();

// 使用节点级更新（生辰八字专用）
const updateResult = await enhancedUserConfigManager.updateConfigWithNodeUpdate(
  0, 
  { birthDate: '1990-01-01', birthTime: '10:30' },
  'basicInfo' // 指定更新类型
);

// 获取系统状态
const status = enhancedUserConfigManager.getSystemStatus();
console.log('系统状态:', status);
```

## 核心功能详解

### 1. 数据持久化管理器 (DataPersistenceManager)

```javascript
import { dataPersistenceManager } from './utils/index.js';

// 多级存储策略
await dataPersistenceManager.saveData('key', data);
const result = await dataPersistenceManager.loadData('key');

// 自动备份
await dataPersistenceManager.createBackup('key', data);
const backupResult = await dataPersistenceManager.loadBackup('key');
```

### 2. 数据完整性管理器 (DataIntegrityManager)

```javascript
import { dataIntegrityManager } from './utils/index.js';

// 验证单个配置
const validation = dataIntegrityManager.validateConfig(userConfig);

// 批量验证
const batchResult = dataIntegrityManager.batchValidate(allConfigs);

// 数据修复建议
const repair = dataIntegrityManager.suggestDataRepairs(brokenConfig);
```

### 3. 生辰八字更新管理器 (BaziUpdateManager)

```javascript
import { baziUpdateManager } from './utils/index.js';

// 节点级更新
const updateResult = await baziUpdateManager.executeNodeUpdate(
  currentConfig, 
  updates, 
  'basicInfo' // 更新类型
);

// 更新预览
const preview = baziUpdateManager.getUpdatePreview(currentConfig, updates);

// 批量更新
const batchResult = await baziUpdateManager.batchUpdateNodes(
  currentConfig, 
  updateOperations
);
```

## 迁移指南

### 自动迁移

系统会自动检测旧版配置数据并执行迁移：

```javascript
import { configMigrationTool } from './utils/index.js';

// 检查迁移需求
const migrationCheck = await configMigrationTool.checkMigrationNeeded();

if (migrationCheck.needed) {
  // 执行迁移
  const result = await configMigrationTool.performMigration();
  
  // 验证迁移结果
  const validation = await configMigrationTool.validateMigration();
}
```

### 手动迁移控制

```javascript
// 执行迁移
await configMigrationTool.performMigration();

// 回滚迁移（如果需要）
await configMigrationTool.rollbackMigration();

// 清理迁移数据
await configMigrationTool.cleanupMigrationData();
```

## 最佳实践

### 1. 配置更新

**推荐方式（节点级更新）：**
```javascript
// 使用节点级更新，避免数据污染
await userConfig.updateConfig(0, {
  birthDate: '1990-01-01',
  birthTime: '10:30'
});
```

**避免方式（直接赋值）：**
```javascript
// 不推荐：可能破坏数据完整性
const config = userConfigManager.getCurrentConfig();
config.birthDate = '1990-01-01'; // 可能破坏关联数据
```

### 2. 错误处理

```javascript
try {
  const result = await userConfig.updateConfig(0, updates);
  
  if (!result.success) {
    console.error('更新失败:', result.error);
    // 处理错误
  }
  
} catch (error) {
  console.error('系统错误:', error);
  // 紧急处理
}
```

### 3. 监听配置变更

```javascript
// 添加监听器
const removeListener = await userConfig.addListener((event) => {
  console.log('配置变更:', event);
});

// 移除监听器
removeListener();
```

## 故障排除

### 常见问题

1. **迁移失败**：检查浏览器存储空间，确保有足够权限
2. **数据损坏**：系统会自动尝试从备份恢复
3. **性能问题**：配置数据量较大时，考虑分批处理

### 调试信息

```javascript
// 获取详细系统状态
const status = await userConfig.getSystemStatus();
console.log('调试信息:', status);
```

## API 参考

### userConfig 统一接口

- `getCurrentConfig()` - 获取当前配置
- `getAllConfigs()` - 获取所有配置
- `updateConfig(index, updates)` - 更新配置
- `addConfig(config)` - 添加配置
- `removeConfig(index)` - 删除配置
- `setActiveConfig(index)` - 设置活跃配置
- `addListener(listener)` - 添加监听器
- `getSystemStatus()` - 获取系统状态

### 增强版管理器专用API

- `updateConfigWithNodeUpdate(index, updates, type)` - 节点级更新
- `validateAllConfigs()` - 验证所有配置
- `repairDataIntegrity()` - 修复数据完整性
- `resetSystem()` - 重置系统

## 版本说明

- **v2.0.0**: 增强版系统发布，支持所有新功能
- **v1.x.x**: 旧版系统，保持兼容性

系统会自动处理版本兼容性，无需手动干预。