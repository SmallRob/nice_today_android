# Nice Today App - Deployment Configuration

## Application Metadata
- **App ID**: com.biorhythm.app
- **App Name**: 生物节律助手 (Biorhythm Assistant)
- **Version**: 1.0.12
- **Build Directory**: build (generated from React build process)

## Deployment Targets
### Web Deployment
- Build command: `npm run build`
- Output directory: `/build`
- Static hosting compatible
- Service worker ready (PWA support)

### Mobile Deployment
#### Android
- Build command: `npm run android:build`
- Uses Capacitor for native wrapper
- Minimum WebView version: 65
- Hardware acceleration enabled
- Mixed content allowed
- Background color: #ffffffff
- Custom user agent: NiceTodayApp/1.0

#### iOS
- Build command: `npm run ios:build`
- Uses Capacitor for native wrapper
- Content inset: automatic
- Background color: #ffffff
- Scroll enabled

## Capacitor Configuration
### Server Settings
- Android scheme: https
- Cleartext enabled: true (allows HTTP traffic)
- Allow navigation: ['*'] (allows all external navigation)

### Android Specific
- Allow mixed content: true
- Capture input: true
- Web contents debugging: disabled
- Log level: ERROR
- Allow file access: true
- Hardware acceleration: true
- Legacy bridge: disabled
- Allow file access from file URLs: true

### iOS Specific
- Content inset: automatic
- Background color: #ffffff
- Handle open URL: true
- Scroll enabled: true
- Allow file access: true
- Web contents debugging: disabled

## Plugin Configurations
### Local Notifications
- Small icon: ic_stat_icon
- Icon color: #3498db
- Sound: default

### Splash Screen
- Launch show duration: 3000ms
- Auto-hide: enabled
- Background color: #ffffffff
- Android resource: splash_background
- Scale type: CENTER_CROP
- Spinner: disabled
- Fullscreen: true
- Immersive: true
- Layout: launch_screen
- Use dialog: true
- Fade out duration: 500ms
- Fade in duration: 500ms

### Status Bar
- Style: DARK
- Background color: #ffffff

### App Plugin
- Append user agent: NiceTodayApp/1.0

### Keyboard Plugin
- Resize mode: body

### Network Plugin
- No specific configuration

### Permissions Plugin
- Request status: enabled

## Build Scripts
### Web Builds
- `npm run build` - Standard build
- `npm run build:lite` - Lite version build (with BUILD_LITE_VERSION=true)

### Mobile Builds
- `npm run android` - Open Android project in IDE
- `npm run android:run` - Run Android app on device/emulator
- `npm run android:build` - Build Android APK
- `npm run android:sync` - Sync web assets to Android project
- `npm run ios` - Open iOS project in IDE
- `npm run ios:run` - Run iOS app on simulator/device
- `npm run ios:build` - Build iOS app
- `npm run ios:sync` - Sync web assets to iOS project
- `npm run sync` - Build web app and sync to native platforms

## Environment Requirements
- Node.js version: 16 or higher
- npm version: Compatible with Node.js 16+
- Android SDK: For Android builds
- Xcode: For iOS builds (macOS only)
- Capacitor CLI: Installed globally

## Release Process
1. Update version in package.json and public/version.json
2. Run tests: `npm run test:all`
3. Create build: `npm run build`
4. Sync to native platforms: `npm run sync`
5. Build native apps: `npm run android:build` and/or `npm run ios:build`
6. Test on devices/emulators
7. Deploy to app stores or web hosting

## PWA Configuration
- Manifest file: public/manifest.webmanifest
- Service worker: Automatically generated
- Offline capability: Supported
- Installable: Yes

## CDN and Asset Optimization
- Assets served from root directory
- Optimized for mobile delivery
- Lazy loading for route components
- Code splitting at route level