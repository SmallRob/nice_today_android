# 安装Capacitor Filesystem插件脚本 (PowerShell版)
# 用于支持Android/iOS WebView中的文件保存和导入功能

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "安装Capacitor Filesystem插件" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 进入frontend目录
Set-Location frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 无法进入frontend目录" -ForegroundColor Red
    exit 1
}

Write-Host "步骤1: 安装@capacitor/filesystem依赖..." -ForegroundColor Yellow
npm install @capacitor/filesystem@^5.0.8

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 依赖安装成功" -ForegroundColor Green
Write-Host ""

Write-Host "步骤2: 同步Capacitor到Android平台..." -ForegroundColor Yellow
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Android同步失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Android同步成功" -ForegroundColor Green
Write-Host ""

Write-Host "步骤3: 同步Capacitor到iOS平台..." -ForegroundColor Yellow
npx cap sync ios

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ iOS同步失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ iOS同步成功" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ 安装完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "1. 重新构建应用: npm run build"
Write-Host "2. 在Android Studio中打开项目: npm run android"
Write-Host "3. 或在Xcode中打开项目: npm run ios"
Write-Host ""

Write-Host "注意事项：" -ForegroundColor Yellow
Write-Host "- Android需要在AndroidManifest.xml中添加存储权限（自动添加）"
Write-Host "- iOS不需要额外配置"
Write-Host "- 首次使用时，应用会请求存储权限"
Write-Host ""
