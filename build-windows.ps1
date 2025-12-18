# Windows Build Script for Nice Today App
Write-Host "Starting Windows build process for Nice Today App v1.0.12..."

# Check if we're in the correct directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir"

# Set paths
$projectRoot = "E:\WorkSource\nice_today_android"
$frontendDir = "$projectRoot\frontend"
Write-Host "Project root: $projectRoot"
Write-Host "Frontend directory: $frontendDir"

# Validate directories exist
if (-not (Test-Path $projectRoot)) {
    Write-Error "Project root directory not found: $projectRoot"
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Error "Frontend directory not found: $frontendDir"
    exit 1
}

# Change to frontend directory
Set-Location $frontendDir
Write-Host "Changed to frontend directory"

# Check Node.js and npm availability
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion"
    
    $npmVersion = npm --version
    Write-Host "NPM version: $npmVersion"
} catch {
    Write-Error "Node.js or NPM not found. Please install Node.js first."
    exit 1
}

# Install dependencies
Write-Host "Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install npm dependencies"
    exit 1
}

# Build React app
Write-Host "Building React application..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build React application"
    exit 1
}

# Check if build was successful
$buildDir = "$frontendDir\build"
if (Test-Path $buildDir) {
    $buildItems = Get-ChildItem $buildDir | Measure-Object
    Write-Host "Build successful! Found $($buildItems.Count) items in build directory"
} else {
    Write-Error "Build directory not found: $buildDir"
    exit 1
}

# Sync to Capacitor
Write-Host "Syncing to Capacitor Android project..."
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Capacitor sync failed, but continuing with build process"
}

# Check Android project
$androidDir = "$frontendDir\android"
if (Test-Path $androidDir) {
    Write-Host "Android project found at: $androidDir"
} else {
    Write-Error "Android project directory not found: $androidDir"
    exit 1
}

# Build Android APK
Write-Host "Building Android APK..."
Set-Location $androidDir

# Check if gradlew exists
$gradlewPath = "$androidDir\gradlew.bat"
if (Test-Path $gradlewPath) {
    Write-Host "Found gradlew.bat, building APK..."
    & $gradlewPath assembleDebug
    if ($LASTEXITCODE -eq 0) {
        Write-Host "APK build successful!"
        
        # Look for the APK file
        $apkPath = "$androidDir\app\build\outputs\apk\debug\app-debug.apk"
        if (Test-Path $apkPath) {
            Write-Host "APK located at: $apkPath"
            Write-Host "Build completed successfully!"
        } else {
            Write-Warning "APK file not found at expected location: $apkPath"
        }
    } else {
        Write-Error "Failed to build APK"
        exit 1
    }
} else {
    Write-Error "gradlew.bat not found at: $gradlewPath"
    exit 1
}

Write-Host "Windows build process completed!"