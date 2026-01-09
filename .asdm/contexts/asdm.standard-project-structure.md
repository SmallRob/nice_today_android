# Nice Today App - Standard Project Structure

## Directory Structure
```
frontend/
├── public/
│   ├── data/                 # Static data files (organRhythmData.csv/json)
│   ├── index.html            # Main HTML entry point
│   ├── manifest.webmanifest  # Web app manifest
│   └── version.json          # Version information
├── src/
│   ├── components/           # Reusable UI components
│   ├── config/               # Configuration files
│   ├── configs/              # Additional configuration files
│   ├── constants/            # Constant values
│   ├── context/              # React context providers
│   ├── contexts/             # Additional context providers
│   ├── cxdialog/             # Dialog component library
│   ├── data/                 # Data handling utilities
│   ├── docs/                 # Documentation files
│   ├── hooks/                # Custom React hooks
│   ├── lite/                 # Lite version specific code
│   ├── pages/                # Page components (66+ files)
│   ├── services/             # Backend service integrations
│   ├── styles/               # CSS and styling files (29+ files)
│   ├── utils/                # Utility functions (83+ files)
│   ├── workers/              # Web worker implementations
│   ├── zencalendar/          # Calendar-specific utilities
│   ├── App.js                # Main application component
│   ├── VersionRouter.js      # Version-based routing
│   ├── index.css             # Global styles
│   ├── index.js              # Application entry point
│   └── version.json          # Version information
├── android/                  # Android native code (Capacitor)
├── ios/                      # iOS native code (Capacitor)
├── docs/                     # Project documentation
└── test/                     # Test files and configurations
```

## Key Files
- **App.js**: Main application component with lazy-loaded routes and error boundaries
- **package.json**: Dependencies and scripts for React and Capacitor
- **capacitor.config.ts**: Mobile platform configuration
- **public/version.json**: Version metadata
- **src/pages/**: Contains 66+ feature-specific page components
- **src/utils/**: Contains 83+ utility functions for various purposes
- **src/components/**: Reusable UI components
- **src/hooks/**: Custom React hooks for state management

## Component Categories
- **Dashboard Components**: Main dashboard and navigation
- **Astrology Components**: Bazi, Zi Wei, Horoscope, etc.
- **Health Tracking**: Biorhythm, organ rhythm, health dashboards
- **Personality Tests**: MBTI, temperament tests
- **Lifestyle Features**: Dress guide, lifestyle advice, feng shui compass
- **Data Visualization**: Charts and graphs for various metrics

## Build Process
- Uses Craco for enhanced Create React App configuration
- Supports both standard and lite builds
- Mobile builds via Capacitor
- Web deployment with static assets in build directory

## Mobile Integration
- Capacitor plugins for native functionality
- Android and iOS support
- File system access for data persistence
- Local notifications
- Device-specific optimizations