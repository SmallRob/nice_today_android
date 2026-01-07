# Workspace Context Index

## Overview
This document serves as index and guide for AI models to understand and work with this workspace. It provides a structured overview of the workspace content and guides AI models to find relevant context.

## Workspace Information

### Basic Information
- **Workspace Name**: Nice Today (每日宜忌)
- **Description**: A mobile-first personal astrology and daily guidance application built with React and Capacitor, featuring Chinese traditional calendar, bazi (eight characters) analysis, biorhythm tracking, and Maya calendar integration
- **Created Date**: Unknown
- **Last Updated**: 2026-01-07

### Technology Stack
- **Primary Language**: JavaScript (React 18.2.0)
- **UI Framework**: React 18.2.0 with React Router DOM 7.10.1
- **CSS Framework**: Tailwind CSS 3.2.7 with CRACO configuration
- **Mobile Framework**: Capacitor 5.7.8 (Android/iOS wrapper)
- **State Management**: React Context API + @tanstack/react-store
- **Form Management**: @tanstack/react-form
- **Build Tool**: CRACO (Create React App Configuration Override)
- **Data Storage**: Capacitor Filesystem API, LocalStorage, IndexedDB
- **Calendar Library**: lunar-javascript 1.7.7 (Chinese lunar calendar)
- **Charting**: Chart.js 2.x with react-chartjs-2
- **Testing**: Jest + React Testing Library
- **Deployment**: Android/iOS via Capacitor

### Business Context
- **Business Domain**: Personal astrology and daily guidance
- **Target Platform**: Mobile-first web application with native Android/iOS apps
- **Core Features**:
  - Chinese traditional calendar (lunar calendar, solar terms)
  - Bazi (eight characters) analysis and fortune telling
  - Biorhythm tracking (physical, emotional, intellectual cycles)
  - Maya calendar integration (Tzolkin and Haab cycles)
  - Daily lucky/unlucky guidance (Huangli)
  - Personalized user configuration management
  - Multi-user configuration support
  - Personality testing (MBTI)
  - Health tracking integration

- **Business Rules**:
  - All calculations based on traditional Chinese calendar algorithms
  - User privacy prioritized - data stored locally on device
  - Offline-first architecture with optional API fallback
  - Support for multiple user configurations (family members)
  - Compatibility with both web and mobile native platforms

## Workspace Structure

### File Tree with Guidance
```
nice_today_android/
├── .asdm/                          # ASDM configuration and toolsets
│   ├── contexts/                   # Context files (this directory)
│   └── toolsets/                   # Installed toolsets
├── frontend/                        # Frontend React application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── common/           # Common reusable components
│   │   │   ├── features/          # Feature-specific components
│   │   │   ├── health/           # Health-related components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── pages/            # Page components
│   │   ├── contexts/               # React Context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API and data services
│   │   ├── utils/                 # Utility functions and helpers
│   │   ├── constants/             # Application constants
│   │   ├── config/                # Configuration files
│   │   └── data/                  # Static data assets
│   ├── public/                    # Static assets
│   ├── android/                   # Android native project (Capacitor)
│   ├── build/                     # Build output
│   └── package.json              # Node.js dependencies
├── docs/                           # Documentation
├── scripts/                        # Build and deployment scripts
├── android/                        # Android Studio project (if applicable)
└── package.json                   # Root dependencies
```

### Key Directories Explanation
- **`frontend/src/components/`**: Primary UI components organized by domain (common, features, health, dashboard, pages)
- **`frontend/src/contexts/`**: React Context providers for global state management
- **`frontend/src/hooks/`**: Custom React hooks (useUserInfo, useThemeColor, etc.)
- **`frontend/src/services/`**: Data services (API client, local data service, offline manager)
- **`frontend/src/utils/`**: Utility functions (bazi calculations, lunar calendar helpers, error handling)
- **`frontend/src/pages/`**: Page-level components corresponding to routes
- **`.asdm/contexts/`**: Contains all context files for AI model reference

## Development Guidelines

### Building and Compilation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Production build
npm run build

# Build for Android
npm run build && npx cap sync android

# Run on Android emulator/device
npm run android:run

# Build Android APK
npm run android:build
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:config        # User configuration tests
npm run test:consistency   # Data consistency tests
npm run test:bazi          # Bazi algorithm tests
npm run test:edge          # Edge case tests

# Generate coverage report
npm run test:coverage

# Run all tests and open report
npm run test:report
```

### Code Quality
- **Linting**: ESLint configuration in package.json (extends react-app, react-app/jest)
- **Formatting**: Prettier (implied from code style)
- **Static Analysis**: ESLint rules, TypeScript checking (where applicable)

## Context Files Reference

This workspace has the following context files available in `.asdm/contexts/`:

1. **[asdm.index.md](./asdm.index.md)** - This file (workspace index and guide)
2. **[asdm.standard-project-structure.md](./asdm.standard-project-structure.md)** - Standard project structure and organization
3. **[asdm.standard-coding-style.md](./asdm.standard-coding-style.md)** - Coding standards and style guidelines
4. **[asdm.data-models.md](./asdm.data-models.md)** - Data models, relationships, and diagrams
5. **[asdm.deployment.md](./asdm.deployment.md)** - Deployment configuration and processes
6. **[asdm.api.md](./asdm.api.md)** - API definitions, endpoints, and documentation
7. **[asdm.architecture.md](./asdm.architecture.md)** - System architecture and design decisions

## AI Model Guidance

### How to Use This Context
1. **Start with this index** to understand workspace structure and business domain
2. **Refer to specific context files** based on the task at hand
3. **Follow development guidelines** for building, testing, and deployment
4. **Maintain consistency** with existing patterns and conventions
5. **Consider mobile-first** design principles (touch interactions, responsive layout)
6. **Respect offline-first** architecture patterns

### Common Tasks
- **Adding new features**: Check architecture and data models first, then review existing components for patterns
- **Modifying user configuration**: Refer to UserConfigContext and related utilities
- **Adding calculation algorithms**: Check baziHelper, lunar-javascript library, and existing calculation utilities
- **Modifying UI components**: Follow existing component patterns in components/ directory, use Tailwind CSS classes
- **Handling data persistence**: Use Capacitor Filesystem API, LocalStorage, and offlineDataManager
- **Integrating APIs**: Follow apiService patterns with fallback to local data services

### Troubleshooting
- If something doesn't work as expected, check the relevant context file
- For build issues, verify Capacitor configuration and dependencies
- For runtime issues, check error handling in EnhancedErrorBoundary and errorLogger
- For data calculation issues, verify algorithms in baziHelper and lunar calendar utils
- For storage issues, check enhancedStorageManager and Filesystem plugin integration

### Important Notes
- **This is a Chinese astrology application**: All calculations and UI should reflect traditional Chinese calendar systems
- **Mobile-first design**: All UI components must be optimized for touch and responsive layouts
- **Offline capability**: Core features should work without internet connection
- **Multi-user support**: Application supports multiple user configurations (family members)
- **Performance optimization**: Lazy loading, caching, and chunk splitting are implemented for performance
- **Error handling**: Comprehensive error boundary and logging system is in place

## Version History

| Version | Date       | Changes              | Author        |
|----------|------------|---------------------|---------------|
| 1.0.0    | 2026-01-07 | Initial context creation | ASDM System |

---

*This context file is maintained by the Context Builder toolset. Use `/context-update-instruction` to update when workspace changes occur.*
