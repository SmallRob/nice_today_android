# 步数计数器集成指南

## 概述

本指南说明如何将真实的步数计数功能集成到应用中，目前实现的是模拟版本，实际部署时需要使用原生插件。

## 集成方案

### 1. React Native Google Fit

如果项目使用React Native，推荐使用 `react-native-google-fit` 库。

#### 安装
```bash
npm install react-native-google-fit
```

#### 配置

**Android配置 (android/app/src/main/AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
```

**Google Cloud Console配置:**
1. 创建新项目
2. 启用Fitness API
3. 创建OAuth 2.0客户端ID
4. 获取应用SHA-1指纹并填入

### 2. Capacitor插件

如果使用Capacitor框架，可以使用以下插件：

#### 安装健康插件
```bash
npm install @capacitor-community/health
npx cap sync
```

#### Android配置
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
```

### 3. 现有代码适配

当前代码使用 `stepCounterService.js` 作为服务层，只需替换服务内部实现即可：

```javascript
// 在stepCounterService.js中替换模拟实现
class StepCounterService {
  // ... 现有方法接口保持不变 ...
  
  async authorize() {
    // 实际的授权逻辑
    if (Capacitor.isNativePlatform()) {
      // 使用Capacitor健康插件
      const { Health } = await import('@capacitor-community/health');
      await Health.requestPermissions({
        permissions: ['stepCount']
      });
      this.isAuthorized = true;
      return { success: true };
    } else {
      // Web环境的模拟实现（当前实现）
      // 在生产环境中，可以连接到其他健康API或服务
    }
  }
  
  async getStepStats() {
    if (Capacitor.isNativePlatform()) {
      const { Health } = await import('@capacitor-community/health');
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const data = await Health.query({
        startDate: startOfDay,
        endDate: now,
        dataType: 'steps'
      });
      
      const steps = data.reduce((sum, entry) => sum + entry.value, 0);
      
      return {
        today: steps,
        weeklyAverage: await this.getAverageSteps(7),
        monthlyAverage: await this.getAverageSteps(30),
        isActive: steps > 5000,
        goal: 10000
      };
    } else {
      // 保持当前的模拟实现
    }
  }
}
```

## 部署注意事项

### 国内市场特殊处理

由于国内大部分Android设备没有Google服务，需要考虑以下方案：

1. **厂商SDK集成**：集成华为、小米、OPPO等厂商的健康数据API
2. **计步传感器**：直接使用设备的加速度计和陀螺仪实现计步算法
3. **第三方服务**：使用腾讯健康、阿里健康等平台

### 权限处理

```javascript
// 权限请求示例
const requestPermissions = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await Health.requestPermissions({
        permissions: ['stepCount', 'distance', 'calories']
      });
      
      if (result.permissions.stepCount === 'granted') {
        return true;
      } else {
        console.log('步数权限被拒绝');
        return false;
      }
    } catch (error) {
      console.error('权限请求失败:', error);
      return false;
    }
  }
  return true; // Web环境默认允许（模拟）
};
```

## API接口兼容性

当前服务层接口设计已考虑兼容性：

- `authorize()` - 授权访问健康数据
- `getDailyStepCountSamples()` - 获取每日步数样本
- `getCurrentSteps()` - 获取当前步数
- `getStepHistory()` - 获取历史步数
- `getAverageSteps()` - 获取平均步数
- `getStepStats()` - 获取步数统计信息

## 测试策略

### 模拟测试
当前实现使用模拟数据，适合开发和UI测试。

### 真机测试
在真实设备上测试时：
1. 确保设备安装了Google Play服务（或相应厂商健康服务）
2. 在设备上手动记录步数并验证数据同步
3. 测试不同权限状态下的用户体验

## 性能优化

1. **数据缓存**：缓存最近的步数数据，减少API调用
2. **批量更新**：合并多个数据请求
3. **后台同步**：在后台定期同步数据，保证实时性

## 错误处理

```javascript
// 示例错误处理
const handleHealthError = (error) => {
  switch (error.code) {
    case 'PERMISSION_DENIED':
      // 引导用户到设置页面开启权限
      break;
    case 'API_UNAVAILABLE':
      // 设备不支持健康数据API
      break;
    case 'INTERNAL_ERROR':
      // API内部错误，使用缓存数据
      break;
    default:
      // 其他错误，使用模拟数据
      break;
  }
};
```

## 用户体验优化

1. **权限引导**：清晰说明为什么需要健康数据权限
2. **数据同步**：显示最后同步时间，让用户了解数据新鲜度
3. **隐私保护**：明确说明数据不会上传到服务器（如适用）
4. **离线支持**：在网络不佳时显示缓存数据