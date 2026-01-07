# Standard Project Structure

## Overview
This document defines the standard project structure for Nice Today (每日宜忌) workspace. It provides guidelines for organizing files and directories to maintain consistency and facilitate development.

## Project Structure Template

### General Structure
```
nice_today_android/
├── .asdm/                          # ASDM configuration and toolsets
│   ├── contexts/                   # Context files for AI models
│   └── toolsets/                   # Installed ASDM toolsets
├── frontend/                        # React frontend application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── common/           # Common reusable components
│   │   │   ├── features/          # Feature-specific components
│   │   │   ├── health/           # Health tracking components
│   │   │   └── dashboard/        # Dashboard components
│   │   ├── contexts/               # React Context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Page-level components
│   │   ├── services/              # API and data services
│   │   ├── utils/                 # Utility functions
│   │   ├── constants/             # Application constants
│   │   ├── config/                # Configuration files
│   │   ├── data/                  # Static data
│   │   ├── styles/                # Global styles
│   │   ├── App.js                # Main application component
│   │   ├── index.js              # Application entry point
│   │   └── index.css             # Global CSS
│   ├── public/                    # Static assets
│   ├── android/                   # Capacitor Android native project
│   ├── build/                     # Build output directory
│   ├── package.json               # Frontend dependencies
│   └── [config files]            # Configuration files
├── docs/                           # Documentation directory
├── scripts/                        # Build and utility scripts
└── package.json                   # Root dependencies
```

### Frontend Source Structure (frontend/src/)

#### Components Directory
```
components/
├── common/                           # Common reusable components
│   ├── PageLayout.js               # Page layout wrapper
│   ├── ErrorBoundary.js             # Error boundary component
│   ├── EnhancedErrorBoundary.js     # Enhanced error boundary
│   ├── AppFooter.js               # Application footer
│   ├── IconLibrary.js             # Icon system
│   └── [other common components]
├── features/                        # Feature-specific components
│   ├── UserConfigManager.js        # User configuration UI
│   ├── ZodiacTraitsDisplay.js     # Zodiac traits display
│   ├── HuangliComponent.js        # Huangli (daily guidance) component
│   └── [other feature components]
├── health/                          # Health tracking components
│   ├── AgileHealthCard.js         # Agile (mental) health card
│   ├── BiorhythmStatusCard.js   # Biorhythm status card
│   ├── BloodTypeHealthCard.js    # Blood type health
│   ├── DietHealthCard.js         # Diet guidance
│   ├── DressDietCard.js         # Dress/diet recommendations
│   └── [other health components]
└── dashboard/                       # Dashboard components
    ├── [dashboard-specific components]
```

#### Contexts Directory
```
contexts/
├── UserConfigContext.js          # User configuration state
├── ThemeContext.js             # Theme management
├── EnergyContext.js             # Energy/biorhythm state
├── UserParamsContext.js         # User parameters state
└── [other contexts]
```

#### Hooks Directory
```
hooks/
├── useUserInfo.js              # User information hook
├── useThemeColor.js            # Theme color management
└── [other custom hooks]
```

#### Services Directory
```
services/
├── apiService.js               # Main API service
├── apiServiceRefactored.js     # Refactored API service
├── apiClient.js               # HTTP client (axios)
├── localDataService.js          # Local data service
├── offlineDataManager.js        # Offline data management
├── bodyMetricsService.js       # Body metrics data
└── [other services]
```

#### Utils Directory
```
utils/
├── baziHelper.js              # Bazi calculation helpers
├── baziDataManager.js         # Bazi data management
├── baziSchema.js             # Bazi data validation
├── lunarCalendarHelper.js      # Lunar calendar helpers
├── horoscopeAlgorithm.js       # Horoscope calculations
├── errorLogger.js             # Error logging
├── errorHandler.js           # Error handling
├── performanceMonitor.js      # Performance monitoring
├── enhancedStorageManager.js  # Enhanced storage management
├── fullUserConfigManager.js  # Full user config manager
├── enhancedUserConfigManager.js # Enhanced user config
├── notificationService.js     # Notification service
└── [other utilities]
```

#### Pages Directory
```
pages/
├── HomePage.js                # Home dashboard page
├── DashboardPage.js           # Main dashboard
├── HealthDashboardPage.js     # Health tracking dashboard
├── AgeAnalysisPage.js         # Age analysis page
├── MoodCalendarPage.js        # Mood calendar
├── HuangliPage.js            # Huangli (daily guidance) page
├── PersonalityTestPage.js     # Personality test page
├── [other page components]
└── [Maya/Maya calendar pages]
```

## Directory Purposes and Conventions

### Source Code Directories
- **`frontend/src/components/`**: All UI components organized by domain (common, features, health, dashboard)
- **`frontend/src/contexts/`**: React Context providers for global state management
- **`frontend/src/hooks/`**: Custom React hooks for reusable logic
- **`frontend/src/services/`**: Data layer - API clients, local storage, offline management
- **`frontend/src/utils/`**: Utility functions, calculations, helpers
- **`frontend/src/pages/`**: Page-level components corresponding to application routes
- **Package by feature**: Components are organized by business capability (features, health, dashboard)

### Configuration Directories
- **`frontend/src/config/`**: Application configuration files
- **`frontend/src/constants/`**: Application constants (colors, messages, etc.)
- **Environment-specific**: Configuration handled through Capacitor and environment variables

### Data Management
- **`frontend/src/data/`**: Static data files (location data, configuration data)
- **Storage strategy**: Multi-layer storage approach:
  - LocalStorage for quick access
  - Capacitor Filesystem for persistent storage
  - IndexedDB for complex data structures
  - API fallback for cloud synchronization

### Documentation
- **`docs/`**: Project documentation, guides, and technical notes
- **API-first**: Document APIs and data structures
- **Architecture decisions**: Record important design decisions

### Build and Deployment
- **`scripts/`**: Shell scripts for build automation (Android build, APK generation)
- **`frontend/android/`**: Capacitor-generated Android native project
- **Build commands**: Defined in frontend/package.json scripts section

## Naming Conventions

### Files and Directories
- Use **camelCase** for JavaScript files: `UserConfigManager.js`, `baziHelper.js`
- Use **PascalCase** for React components: `UserConfigProvider`, `EnhancedErrorBoundary`
- Use **kebab-case** for directories: `health-dashboard`, `user-config`

### Test Files
- Suffix test files with `.test.js` or `.spec.js`
- Place tests in `test/` directory (mirroring src structure)

### Component Files
- Feature components: `{FeatureName}Component.js` or `{FeatureName}.js`
- Common components: `{ComponentName}.js`
- Page components: `{PageName}Page.js`

## Best Practices

### 1. Modularity
- Keep components focused on single responsibility
- Minimize prop drilling using Context API
- Use custom hooks for reusable logic
- Separate concerns (UI, state, business logic)

### 2. React Patterns
- Use functional components with hooks
- Implement proper error boundaries
- Use lazy loading for code splitting
- Implement proper cleanup in useEffect
- Use Context API for global state, local state for component-specific data

### 3. Performance Optimization
- Implement lazy loading for route components
- Use memoization (useMemo, useCallback, React.memo) for expensive operations
- Implement caching for API calls and calculations
- Use chunk splitting for optimal bundle size
- Optimize images and assets

### 4. Mobile-First Design
- Design for touch interactions (minimum 44x44px touch targets)
- Implement responsive layouts using Tailwind CSS
- Handle virtual keyboard interactions properly
- Adapt for different screen sizes
- Test on both Android and iOS devices

### 5. Error Handling
- Use error boundaries to catch component errors
- Implement comprehensive error logging
- Provide user-friendly error messages
- Implement retry mechanisms for failed operations
- Handle offline scenarios gracefully

### 6. State Management
- Use React Context for global state
- Use local state for component-specific data
- Implement proper state updates (function form to avoid race conditions)
- Use @tanstack/react-store for complex global state if needed

### 7. Data Persistence
- Use Capacitor Filesystem API for persistent storage
- Implement offline data management
- Use local storage for fast access
- Handle migration scenarios between versions
- Validate data integrity on load

## Customization Guidelines

This project follows React and Capacitor conventions:

1. **Framework requirements**: Follow React 18 hooks patterns and Capacitor 5.x APIs
2. **Chinese astrology domain**: All calculations based on traditional Chinese calendar systems
3. **Mobile platform**: Optimized for Android and iOS native apps via Capacitor
4. **Offline-first**: Core features work without internet connection
5. **Multi-user support**: Application manages multiple user configurations

Always document any deviations from this structure in the project README.

---

*This structure should be maintained and updated as the project evolves. Major changes should be documented and reviewed.*
