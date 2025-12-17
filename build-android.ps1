# Android Build Script (PowerShell version)
Write-Host "Starting Android build process..."

# Set Java environment variables (modify path as needed)
$javaHome = $env:JAVA_HOME  # Change to your JDK path
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

# Enter frontend directory (modify path as needed)
$frontendDir = "E:\WorkSource\nice_today_android\frontend"  # Change to your frontend path
Set-Location $frontendDir

# Sync web resources to Android project
Write-Host "Syncing web resources to Android project..."
npx cap sync android

# Instructions for building APK
Write-Host "Please open the project in Android Studio and build the APK:"
Write-Host "Project path: $frontendDir\android"
Write-Host ""
Write-Host "Or run the following commands in terminal:"
Write-Host "cd $frontendDir\android"
Write-Host ".\gradlew assembleDebug"

Write-Host "Build script completed!"
