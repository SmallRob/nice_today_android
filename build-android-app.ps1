# Android应用构建脚本 (PowerShell版本)
# 将React应用打包为Android原生应用

Write-Host "=== 生物节律助手 Android应用构建脚本 ===" -ForegroundColor Green

# 检查是否在frontend目录
if (!(Test-Path "package.json")) {
    Write-Host "错误：请在frontend目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误：请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查npm
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "错误：请先安装npm" -ForegroundColor Red
    exit 1
}

# 检查Android环境
if (!(Get-Command adb -ErrorAction SilentlyContinue)) {
    Write-Host "警告：Android SDK未安装或未配置环境变量" -ForegroundColor Yellow
    Write-Host "请安装Android Studio并配置ANDROID_HOME环境变量" -ForegroundColor Yellow
}

Write-Host "1. 安装依赖..." -ForegroundColor Cyan
npm install

# 检查Capacitor是否已初始化
if (!(Test-Path "capacitor.config.ts")) {
    Write-Host "2. 初始化Capacitor..." -ForegroundColor Cyan
    npx cap init "生物节律助手" "com.biorhythm.app"
} else {
    Write-Host "2. Capacitor已初始化" -ForegroundColor Cyan
}

Write-Host "3. 构建React应用..." -ForegroundColor Cyan
npm run build

Write-Host "4. 添加Android平台..." -ForegroundColor Cyan
if (!(Test-Path "android")) {
    npx cap add android
}

Write-Host "5. 同步到Android项目..." -ForegroundColor Cyan
npx cap sync android

Write-Host "6. 配置Android项目权限..." -ForegroundColor Cyan

# 配置AndroidManifest.xml（添加通知权限）
$ANDROID_MANIFEST = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $ANDROID_MANIFEST) {
    # 检查是否已包含通知权限
    $content = Get-Content $ANDROID_MANIFEST -Raw
    if ($content -notmatch "android.permission.POST_NOTIFICATIONS") {
        Write-Host "添加通知权限到AndroidManifest.xml..." -ForegroundColor Yellow
        # 在application标签前添加权限
        $newContent = $content -replace '<application', '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<application'
        Set-Content $ANDROID_MANIFEST $newContent
    }
}

Write-Host "7. 打开Android Studio..." -ForegroundColor Cyan
Write-Host "请手动执行以下操作：" -ForegroundColor Yellow
Write-Host "- 在Android Studio中打开项目: android/" -ForegroundColor Yellow
Write-Host "- 配置应用图标和启动画面" -ForegroundColor Yellow
Write-Host "- 构建APK文件: Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor Yellow
Write-Host "- 或直接运行到设备: Run > Run 'app'" -ForegroundColor Yellow

# 提供直接构建选项
Write-Host ""
Write-Host "可选：直接构建APK（需要Android SDK）" -ForegroundColor Cyan
$choice = Read-Host "是否直接构建APK? (y/n)"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    if (Test-Path "android/gradlew.bat") {
        Set-Location "android"
        .\gradlew.bat assembleDebug
        Write-Host "APK文件生成在: android/app/build/outputs/apk/debug/" -ForegroundColor Green
        Set-Location ".."
    } else {
        Write-Host "错误：gradlew.bat未找到，请通过Android Studio构建" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 构建完成 ===" -ForegroundColor Green
Write-Host "Android应用构建步骤：" -ForegroundColor Yellow
Write-Host "1. 打开Android Studio" -ForegroundColor Yellow
Write-Host "2. 导入项目: android/" -ForegroundColor Yellow
Write-Host "3. 配置签名（发布版需要）" -ForegroundColor Yellow
Write-Host "4. 构建APK或直接运行到设备" -ForegroundColor Yellow
Write-Host ""
Write-Host "通知功能说明：" -ForegroundColor Cyan
Write-Host "- 应用已配置为支持Android系统原生通知" -ForegroundColor Yellow
Write-Host "- 定时通知会在后台正常运行" -ForegroundColor Yellow
Write-Host "- 极值检测会触发系统级推送" -ForegroundColor Yellow
Write-Host "- 支持Android 5.0+ 系统" -ForegroundColor Yellow