# 本地数据读写权限配置指南

## 问题确认

您提到应用全部在本地运行，可能没有本地数据的读写权限。通过分析代码，我发现：

1. 当前应用只依赖浏览器的`localStorage`，没有安装Capacitor的存储插件
2. 没有在AndroidManifest.xml中明确声明存储权限
3. 现有的`storageManager.js`只使用浏览器API，在原生环境中可能无法正常工作

## 解决方案

### 1. 安装Capacitor Preferences插件

#### 自动安装（推荐）
```bash
# 运行安装脚本
chmod +x install-storage-dependencies.sh
./install-storage-dependencies.sh
```

#### 手动安装
```bash
cd frontend
npm install @capacitor/preferences
npx cap sync
```

### 2. 使用增强版存储管理器

#### 步骤1：替换存储管理器
```bash
# 备份原始文件
cp frontend/src/utils/storageManager.js frontend/src/utils/storageManager.js.backup

# 使用增强版存储管理器
cp frontend/src/utils/enhancedStorageManager.js frontend/src/utils/storageManager.js
```

#### 步骤2：更新应用代码
确保应用中导入并使用增强版存储管理器：

```javascript
// 在需要的文件中导入
import { storageManager } from './utils/storageManager';

// 使用方式与之前相同，但现在支持原生环境
await storageManager.setUserZodiac('鼠');
const zodiac = await storageManager.getUserZodiac();
```

### 3. 配置Android存储权限

#### 3.1 添加权限到AndroidManifest.xml
在`frontend/android/app/src/main/AndroidManifest.xml`中添加以下权限：

```xml
<!-- 在<manifest>标签内添加 -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- 如果需要访问网络存储 -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### 3.2 针对Android 10+的适配
在`application`标签内添加：
```xml
<application
    android:requestLegacyExternalStorage="true"
    ...其他属性>
    ...
</application>
```

### 4. 测试本地存储功能

#### 4.1 创建测试脚本
创建一个简单的测试页面来验证存储功能：

```javascript
// 在浏览器控制台中执行
import { enhancedStorageManager } from './utils/enhancedStorageManager.js';

// 测试基本存储
await enhancedStorageManager.setUserZodiac('虎');
await enhancedStorageManager.setBirthYear(1990);

// 验证数据
const zodiac = await enhancedStorageManager.getUserZodiac();
const year = await enhancedStorageManager.getBirthYear();
console.log(`生肖: ${zodiac}, 出生年份: ${year}`);

// 测试缓存
await enhancedStorageManager.setCacheData('test', { value: 'test data' });
const cached = await enhancedStorageManager.getCacheData('test');
console.log('缓存数据:', cached);

// 检查存储信息
const info = await enhancedStorageManager.getStorageInfo();
console.log('存储信息:', info);
```

#### 4.2 在Android设备上测试
1. 构建并安装应用
2. 打开Chrome DevTools调试WebView
3. 在控制台中执行上述测试脚本

### 5. 故障排除

#### 5.1 如果数据仍然无法保存
1. 检查控制台是否有错误信息
2. 确认使用的API是localStorage还是Preferences
   ```javascript
   import { isUsingLocalStorage } from './utils/enhancedStorageManager.js';
   console.log('Using localStorage:', isUsingLocalStorage());
   ```
3. 尝试强制使用localStorage：
   ```javascript
   // 在应用初始化前设置
   process.env.FORCE_LOCAL_STORAGE = 'true';
   ```

#### 5.2 如果权限被拒绝
1. 在Android设置中手动授予权限
2. 使用以下代码检查和请求权限：
   ```javascript
   import { permissionManager } from './utils/permissions.js';
   
   // 检查权限
   const status = await permissionManager.checkPermission('storage');
   console.log('Storage permission status:', status);
   
   // 请求权限
   const result = await permissionManager.requestPermission('storage');
   console.log('Storage permission result:', result);
   ```

#### 5.3 如果在模拟器中测试失败
1. 确保模拟器有足够的存储空间
2. 尝试使用物理设备测试
3. 检查模拟器的API级别是否满足应用要求

### 6. 高级配置

#### 6.1 配置数据备份
```javascript
// 设置自动备份
await enhancedStorageManager.setUserPreferences({
  autoBackup: true,
  backupInterval: 24 * 60 * 60 * 1000, // 24小时
  backupLocation: 'cloud' // 'local' 或 'cloud'
});
```

#### 6.2 配置缓存策略
```javascript
// 设置缓存过期时间
await enhancedStorageManager.setCacheData('key', data, 60 * 60 * 1000); // 1小时

// 清除过期缓存
await enhancedStorageManager.clearExpiredCache();
```

#### 6.3 配置数据迁移
```javascript
// 从旧版本迁移数据
import { dataMigration } from './utils/dataMigration.js';

const migrationResult = await dataMigration.migrateFromLocalStorage();
console.log('Migration result:', migrationResult);
```

### 7. 验证步骤

完成上述配置后，请按以下步骤验证本地数据读写权限：

1. **构建并安装应用**
   ```bash
   cd frontend
   npm run build
   npx cap sync
   cd ..
   ./build-android.sh
   ```

2. **检查权限是否正确授予**
   ```bash
   adb shell pm list packages | grep nicetoday
   adb shell pm grant com.nicetoday.app android.permission.WRITE_EXTERNAL_STORAGE
   adb shell pm grant com.nicetoday.app android.permission.READ_EXTERNAL_STORAGE
   ```

3. **验证数据存储**
   - 在应用中设置用户信息（如生肖、出生年份）
   - 关闭并重新打开应用
   - 确认用户信息是否被保存

4. **检查日志**
   ```bash
   adb logcat | grep -i "storage\|preferences"
   ```

### 8. 总结

通过以上步骤，您可以确保应用在本地运行时有正确的数据读写权限：

1. 安装并配置Capacitor Preferences插件
2. 使用增强版存储管理器，同时支持localStorage和Preferences
3. 在AndroidManifest.xml中正确声明存储权限
4. 针对不同Android版本进行适配
5. 测试并验证存储功能

这样配置后，您的应用将能够在本地和原生环境中正确读写本地配置与数据缓存文件。