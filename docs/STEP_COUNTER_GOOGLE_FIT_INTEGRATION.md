# Google Fit API 步数集成文档

## 概述

本文档说明了如何使用Google Fit API集成真实的步数数据到应用中，替代原有的模拟实现。

## 集成概述

### 1. 技术栈变更

- **原有实现**：纯JavaScript模拟实现
- **新实现**：使用自定义Capacitor插件与Google Fit API交互
- **平台支持**：原生Android平台使用真实API，Web环境保持模拟实现

### 2. 依赖项

- `@capacitor/core` - Capacitor核心库
- `com.google.android.gms:play-services-fitness` - Google Fit API
- `com.google.android.gms:play-services-auth` - Google认证服务

## 实现详情

### 1. 权限配置

在 `AndroidManifest.xml` 中添加了以下权限：

```xml
<!-- Google Fit/健康数据权限 -->
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.BODY_SENSORS" />
```

### 2. 配置文件

创建了 `src/config/googleFitConfig.js` 配置文件，包含：

- Google Fit客户端ID
- OAuth 2.0端点配置
- API权限范围
- 数据类型配置

### 3. 原生插件实现

创建了 `GoogleFitPlugin.java` 原生插件，提供以下功能：

- 权限检查与请求
- Google Fit连接授权
- 步数数据读取

### 4. Web模拟实现

创建了 `google-fit-web.ts` Web模拟实现，提供在浏览器环境中的功能模拟。

### 5. 服务层更新

`src/services/stepCounterService.js` 已更新以支持：

- **authorize()** - 使用原生插件进行Google Fit授权
- **getDailyStepCountSamples()** - 获取每日步数样本
- **getCurrentSteps()** - 获取当前步数
- **getStepHistory()** - 获取历史步数数据
- **getStepStats()** - 获取步数统计信息
- **requestPermissions()** - 请求健康数据权限
- **checkPermissions()** - 检查权限状态

## 使用方法

### 1. 依赖安装

```bash
npx cap sync
```

### 2. 权限请求

在使用步数功能前，需要先请求权限：

```javascript
import stepCounterService from '../services/stepCounterService';

// 请求权限
const authResult = await stepCounterService.authorize();
if (authResult.success) {
  console.log('授权成功');
} else {
  console.log('授权失败:', authResult.message);
}
```

### 3. 获取步数数据

```javascript
// 检查是否已授权
if (stepCounterService.isAuthorizationAvailable()) {
  // 获取今日步数
  const currentSteps = await stepCounterService.getCurrentSteps();
  
  // 获取步数统计
  const stats = await stepCounterService.getStepStats();
  
  // 获取历史数据
  const history = await stepCounterService.getStepHistory(7); // 过去7天
}
```

## 错误处理

### 常见错误类型

1. **权限拒绝** - 用户拒绝了健康数据访问权限
2. **API不可用** - 设备不支持Google Fit API
3. **网络错误** - 无法连接到Google服务器

### 错误处理建议

```javascript
try {
  const steps = await stepCounterService.getCurrentSteps();
  // 使用步数数据
} catch (error) {
  console.error('获取步数失败:', error);
  // 使用备用方案或显示错误消息
}
```

## 兼容性说明

### Android设备兼容性

- **支持Google服务的设备** - 可以正常使用Google Fit API
- **中国区设备** - 需要考虑Google服务不可用的情况，可能需要使用厂商健康服务或计步传感器

### Web环境

- Web环境继续使用模拟数据实现
- 接口保持一致，便于无缝切换

## 测试说明

### 真机测试要点

1. 确保设备已安装Google Play服务
2. 在Google Fit应用中手动记录一些步数数据
3. 测试权限请求流程
4. 验证数据获取准确性

### 模拟器测试

- 使用支持Google APIs的AVD
- 或使用Web环境进行功能测试

## 部署说明

### 发布前检查

1. 确认Google Fit客户端ID配置正确
2. 检查权限声明已添加到AndroidManifest.xml
3. 验证所有方法在原生和Web环境下都能正常工作
4. 测试错误处理机制

### 国内发布考虑

对于中国市场的发布，建议：

1. 添加厂商健康服务支持（华为、小米、OPPO等）
2. 实现计步传感器备份方案
3. 考虑离线数据存储策略

## 维护指南

### 配置更新

如需更新Google Fit配置，修改 `src/config/googleFitConfig.js` 文件。

### 权限管理

定期检查权限状态，向用户提供清晰的权限说明。

### 数据同步

考虑实现后台数据同步功能，提高数据实时性。