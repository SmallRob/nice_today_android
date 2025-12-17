# 模拟API修复指南

## 问题描述

您提到使用了不存在的@capacitor/performance插件和权限API是需要的，之前模拟返回后可以安装使用，但现在无法使用。这表明模拟API的实现可能有问题，或者与当前版本的Capacitor不兼容。

## 解决方案

### 1. 使用增强的模拟API

我们已经创建了三个增强的模拟API文件：

1. **permissions-simulated.js** - 增强版权限模拟API
2. **performance-simulated.js** - 增强版性能监控模拟API
3. **capacitorInit-simulated.js** - 使用模拟API的应用初始化脚本

这些文件具有以下特点：

- 更健壮的错误处理
- 强制使用模拟API的开关
- 更真实的API模拟
- 更好的降级处理

### 2. 应用修复

#### 步骤1：备份原始文件
```bash
cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend/src/utils

# 备份原始文件
cp permissions.js permissions.js.backup
cp performance.js performance.js.backup
cp capacitorInit.js capacitorInit.js.backup
```

#### 步骤2：使用增强的模拟API
```bash
# 使用增强的模拟API
cp permissions-simulated.js permissions.js
cp performance-simulated.js performance.js
cp capacitorInit-simulated.js capacitorInit.js
```

#### 步骤3：更新引用
```bash
# 如果有其他文件直接引用了原始文件，需要更新引用
# 例如，如果App.js中有以下导入：
# import { initializeApp } from './utils/capacitorInit';
# 
# 它应该仍然有效，因为我们已经替换了capacitorInit.js文件
```

#### 步骤4：重新构建
```bash
cd /Users/healer2027/AndroidStudioProjects/nice_today_android/frontend
npm run build
npx cap sync android
```

#### 步骤5：重新构建Android应用
```bash
cd /Users/healer2027/AndroidStudioProjects/nice_today_android
./build-android.sh
```

### 3. 验证修复

#### 3.1 检查控制台日志
在Chrome DevTools中查看控制台日志，应该看到以下消息：
- "Using simulated permissions API (forced)"
- "Using simulated performance API (forced)"
- "App initialization complete (using simulated APIs)"

#### 3.2 检查应用行为
1. 应用应该可以正常启动
2. 权限相关的功能应该可以工作（即使只是模拟）
3. 性能监控应该可以正常工作

### 4. 故障排除

#### 4.1 如果应用仍然闪退
1. 检查是否有其他错误信息
2. 尝试在浏览器中打开应用的Web版本（通过`npm start`）
3. 使用调试脚本收集更多信息：
   ```javascript
   // 在浏览器控制台中执行
   import { showDiagnosticReport } from './debug-crash.js';
   showDiagnosticReport();
   ```

#### 4.2 如果模拟API不起作用
1. 确保在代码中正确导入了模拟API
2. 检查是否有TypeScript编译错误
3. 尝试在文件顶部添加以下代码：
   ```javascript
   // 确保使用模拟API
   process.env.FORCE_SIMULATED_PERMISSIONS = 'true';
   process.env.FORCE_SIMULATED_PERFORMANCE = 'true';
   ```

### 5. 高级配置

#### 5.1 切换到真实API
如果将来您想使用真实的API（如果可用），可以：

1. 修改模拟API文件中的开关：
   ```javascript
   // 在permissions-simulated.js中
   const FORCE_SIMULATED_PERMISSIONS = false; // 改为false
   
   // 在performance-simulated.js中
   const FORCE_SIMULATED_PERFORMANCE = false; // 改为false
   ```

2. 或者设置环境变量：
   ```javascript
   // 在应用启动前
   process.env.FORCE_SIMULATED_PERMISSIONS = 'false';
   process.env.FORCE_SIMULATED_PERFORMANCE = 'false';
   ```

#### 5.2 自定义模拟行为
如果需要自定义模拟行为，可以修改以下部分：

1. 权限模拟行为：
   ```javascript
   // 在SimulatedPermissionsAPI.query方法中
   switch (name) {
     case PermissionTypes.CAMERA:
       state = Math.random() > 0.5 ? 'granted' : 'denied'; // 调整概率
       break;
     // ...
   }
   ```

2. 性能模拟行为：
   ```javascript
   // 在SimulatedPerformanceAPI.startTrace方法中
   await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100)); // 调整延迟
   ```

### 6. 长期解决方案

#### 6.1 升级Capacitor版本
考虑升级到支持所需API的Capacitor版本，或安装相应的插件：
```bash
# 安装权限插件
npm install @capacitor/permissions
npx cap sync
```

#### 6.2 使用条件性API
对于某些功能，可以使用条件性API，在原生环境和Web环境中使用不同的实现：
```javascript
// 示例：条件性权限检查
const checkPermission = async (permission) => {
  if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Permissions')) {
    // 使用真实API
    const { Permissions } = await import('@capacitor/permissions');
    return await Permissions.query({ name: permission });
  } else {
    // 使用模拟API
    return { state: 'granted', name: permission };
  }
};
```

### 7. 测试建议

1. **单元测试**：为模拟API编写单元测试，确保它们在各种情况下都能正常工作
2. **集成测试**：测试整个应用初始化流程，确保没有错误
3. **真机测试**：在实际设备上测试应用，确保模拟API在真实环境中也能正常工作

### 8. 总结

使用模拟API是解决依赖问题的有效方法，特别是在开发阶段。通过使用增强的模拟API，您可以：

1. 确保应用可以正常启动和运行
2. 在没有真实插件的情况下开发相关功能
3. 在准备好后轻松切换到真实API

这种方法让您可以继续开发应用，而不必等待依赖问题的解决。