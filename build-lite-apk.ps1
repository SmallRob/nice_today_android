# 轻量版APK构建脚本 (PowerShell版本)

Write-Host "开始构建轻量版APK..." -ForegroundColor Green

# 设置环境变量以启用轻量版构建
$env:BUILD_LITE_VERSION = "true"

# 构建React应用
Write-Host "正在构建React应用..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm run build

# 检查构建是否成功
if ($LASTEXITCODE -ne 0) {
    Write-Host "React应用构建失败!" -ForegroundColor Red
    exit 1
}

Write-Host "React应用构建成功!" -ForegroundColor Green

# 同步到Android项目
Write-Host "正在同步到Android项目..." -ForegroundColor Yellow
npx cap sync android

# 检查同步是否成功
if ($LASTEXITCODE -ne 0) {
    Write-Host "同步到Android项目失败!" -ForegroundColor Red
    exit 1
}

Write-Host "同步到Android项目成功!" -ForegroundColor Green

# 构建APK
Write-Host "正在构建APK..." -ForegroundColor Yellow
Set-Location -Path "../android"
.\gradlew.bat assembleDebug

# 检查APK构建是否成功
if ($LASTEXITCODE -ne 0) {
    Write-Host "APK构建失败!" -ForegroundColor Red
    exit 1
}

Write-Host "APK构建成功!" -ForegroundColor Green
Write-Host "轻量版APK已构建完成，位于 android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Cyan

exit 0