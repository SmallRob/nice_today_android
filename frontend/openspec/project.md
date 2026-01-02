# Project Context

## Purpose
Nice Today is a comprehensive wellness and fortune-telling mobile application that combines traditional Chinese divination practices with modern wellness tracking. The app provides users with biorhythm analysis, fortune-telling tools (BaZi八字, Zi Wei 紫微, Shaoyong邵雍), personality tests (MBTI), zodiac predictions, Mayan calendar, and health tracking features. The application is built as a React-based PWA and deployed to both Android and iOS platforms using Capacitor.

## Tech Stack
- React 18.2.0 (UI library)
- TypeScript/JavaScript (primary languages)
- Capacitor (mobile deployment)
- Tailwind CSS (styling framework)
- React Router DOM (navigation)
- TanStack React Form (form management)
- Chart.js (data visualization)
- React Datepicker (date selection)
- Jest/React Testing Library (testing)
- CRACO (Create React App configuration override)
- Android Studio/Gradle (Android build tools)

## Project Conventions

### Code Style
- Component names use PascalCase (e.g., BiorhythmPage.js)
- Utility functions use camelCase
- Constants use UPPER_SNAKE_CASE
- CSS classes use kebab-case
- File names match component names (e.g., BiorhythmPage.js contains BiorhythmPage component)
- Components are organized in feature-based directories (components/biorhythm/, components/shaoyong/, etc.)
- Import aliases are used: @ for src, @components for src/components, @pages for src/pages, etc.
- All SVG icons are converted to React components using @svgr/webpack

### Architecture Patterns
- Feature-based component organization with dedicated directories for different capabilities
- React Context API for state management
- Hooks for reusable logic (custom hooks in components/dashboard/hooks/)
- Mobile-first responsive design with Tailwind CSS
- PWA architecture with Capacitor for native mobile capabilities
- Lazy loading and code splitting for performance optimization
- Modular component architecture with reusable base components
- Separation of concerns between presentation components and business logic

### Testing Strategy
- Jest for unit testing
- React Testing Library for component testing
- Custom test scripts for different test suites (config, consistency, bazi, edge cases)
- Comprehensive test coverage with specific test suites for different features
- Test files follow pattern: ComponentName.test.js
- Integration tests for complex feature interactions

### Git Workflow
- Feature branch workflow
- Commits follow conventional commit format (not strictly enforced but preferred)
- Branch names follow feature/type-naming convention
- Pull requests for code review before merging to main
- Android and iOS platform files are maintained separately through Capacitor

## Domain Context
The application combines traditional Chinese metaphysics with modern wellness tracking. Key domain concepts include:
- Biorhythm theory (physical, emotional, intellectual cycles)
- BaZi (Eight Characters) Chinese astrology
- Zi Wei Dou Shu (Purple Star Astrology)
- Shaoyong Yixue (邵雍易学) divination system
- Chinese lunar calendar and festivals
- Western zodiac and horoscope systems
- MBTI personality assessment
- Mayan calendar systems
- Traditional Chinese medicine concepts (Wuxing 五行, organ rhythms)

## Important Constraints
- Mobile-optimized performance with chunk size limits (244KB for mobile networks)
- Compatibility with Android WebView for Capacitor deployment
- Support for both light and dark mode UI
- Offline-first approach where possible
- Data privacy considerations for personal wellness and divination data
- Integration with native device features through Capacitor plugins

## External Dependencies
- Capacitor plugins for native device access (geolocation, filesystem, preferences, notifications)
- Lunar-Javascript library for Chinese calendar calculations
- Chart.js for data visualization
- axios for HTTP requests
- @tanstack/react-form for form management
- @iconify/react for icon management
- Cross-env for environment variable management