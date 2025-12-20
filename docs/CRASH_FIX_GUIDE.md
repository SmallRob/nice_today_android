# 应用闪退修复指南

## 问题诊断与修复步骤

### 1. 立即修复措施（紧急）

#### 1.1 替换关键文件
```bash
# 备份原文件
cp frontend/src/App.js frontend/src/App.js.backup
cp frontend/src/index.js frontend/src/index.js.backup

# 使用修复版本
cp frontend/src/App-fixed.js frontend/src/App.js
cp frontend/src/index-fixed.js frontend/src/index.js
```

#### 1.2 修复工具模块
```bash
# 修复性能模块
cp frontend/src/utils/performance-fixed.js frontend/src/utils/performance.js

# 修复权限模块
cp frontend/src/utils/permissions-fixed.js frontend/src/utils/permissions.js

# 修复兼容性模块
cp frontend/src/utils/compatibility-fixed.js frontend/src/utils/compatibility.js
```

#### 1.3 更新Capacitor配置
```bash
cp frontend/capacitor.config-fixed.ts frontend/capacitor.config.ts
```

#### 1.4 添加调试脚本
```bash
# 在index.html中添加调试脚本
echo '<script src="%PUBLIC_URL%/debug-crash.js"></script>' >> frontend/public/index.html
cp frontend/debug-crash.js frontend/public/debug-crash.js
```

### 2. 重新构建和测试

#### 2.1 清理和重新构建
```bash
cd frontend
rm -rf node_modules build
npm install
npm run build
npx cap sync android
```

#### 2.2 重新构建Android应用
```bash
cd /Users/healer2027/AndroidStudioProjects/nice_today_android
./build-android.sh
```

### 3. 详细问题分析与解决方案

#### 3.1 双重初始化问题
**问题**：在App.js和index.js中都进行了应用初始化，导致冲突
**解决方案**：
- 移除了index.js中的初始化代码
- 在App.js中添加了错误边界和异步初始化
- 确保所有模块按正确顺序加载

#### 3.2 权限API兼容性问题
**问题**：使用了不存在的@capacitor/performance插件和权限API
**解决方案**：
- 使用浏览器原生Performance API替代不存在的插件
- 添加了插件可用性检查，确保在插件不可用时使用模拟数据
- 简化了权限管理逻辑

#### 3.3 WebView版本兼容性问题
**问题**：代码中检测的最低WebView版本与配置不一致
**解决方案**：
- 将capacitor.config.ts中的minWebViewVersion从55提高到65
- 在兼容性检查中添加了适当的错误处理
- 确保在不支持的设备上提供降级方案

#### 3.4 React Router版本问题
**问题**：使用了较新的React Router v7，可能有重大变更
**解决方案**：
- 添加了错误边界来捕获路由相关的错误
- 确保懒加载组件有适当的Suspense边界
- 提供了详细的错误信息用于调试

### 4. 高级调试技巧

#### 4.1 使用ADB查看崩溃日志
```bash
# 连接设备
adb devices

# 查看日志
adb logcat | grep -i "crash\|error\|exception"

# 查看特定应用的日志
adb logcat | grep "com.nicetoday.app"
```

#### 4.2 在Chrome中调试WebView
1. 打开Chrome
2. 访问 `chrome://inspect`
3. 选择对应的WebView进行调试
4. 查看控制台错误和网络请求

#### 4.3 使用诊断脚本
```javascript
// 在浏览器控制台中执行
import { showDiagnosticReport, generateDiagnosticReport } from './debug-crash.js';

// 显示诊断报告
showDiagnosticReport();

// 获取诊断结果
const report = generateDiagnosticReport();
console.log(report);
```

### 5. 常见问题解决方案

#### 5.1 应用启动后立即闪退
**可能原因**：
- 初始化代码抛出异常
- 依赖模块加载失败
- 权限配置问题

**解决方案**：
1. 检查index.js和App.js中的初始化代码
2. 确保所有依赖模块正确导入
3. 检查AndroidManifest.xml中的权限配置

#### 5.2 特定设备上的闪退
**可能原因**：
- WebView版本过低
- 设备特定的兼容性问题
- 内存不足

**解决方案**：
1. 检查设备WebView版本
2. 应用设备特定的修复方案
3. 优化内存使用

#### 5.3 路由跳转时闪退
**可能原因**：
- React Router版本兼容性问题
- 懒加载组件加载失败
- 路由配置错误

**解决方案**：
1. 检查React Router版本和API使用
2. 确保懒加载组件正确配置
3. 检查路由配置是否正确

### 6. 预防措施

#### 6.1 渐进式代码更改
- 避免一次性更改大量代码
- 每次更改后进行测试
- 使用版本控制记录更改

#### 6.2 增强错误处理
- 添加全局错误捕获
- 使用错误边界保护关键组件
- 记录详细的错误信息

#### 6.3 兼容性测试
- 在不同设备和Android版本上测试
- 检查WebView版本兼容性
- 使用模拟器和真机测试

### 7. 长期优化建议

1. **简化应用架构**：减少不必要的模块和依赖
2. **优化加载性能**：使用代码分割和懒加载
3. **增强错误监控**：集成错误监控服务
4. **自动化测试**：添加单元测试和集成测试
5. **持续集成**：设置自动化构建和测试流程

### 8. 联系与支持

如果问题仍然存在，请提供以下信息：
- 设备型号和Android版本
- WebView版本
- 完整的错误日志
- 重现步骤

可以使用以下命令收集信息：
```bash
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
```