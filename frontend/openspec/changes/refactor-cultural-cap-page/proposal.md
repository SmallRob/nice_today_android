# Change: Refactor CulturalCapPage with Modern UI, System Dark Theme and Mobile Optimization

## Why
The current CulturalCapPage (摔杯请卦) has an outdated UI that lacks modern design principles and comprehensive mobile responsiveness. The theme system doesn't fully integrate with system preferences, and the layout could be improved for better user experience. This change will modernize the UI with Tailwind CSS, implement proper system-aware dark theme support, optimize for mobile devices, and enhance the overall user experience while preserving the cultural significance of the divination practice.

## What Changes
- Modernize UI with Tailwind CSS and contemporary design patterns
- Implement system-aware dark theme that respects user's system preferences
- Enhance mobile responsiveness with touch-friendly controls and optimized layouts
- Improve accessibility with proper ARIA attributes and semantic HTML
- Add smooth animations and transitions for better UX
- Optimize performance with code splitting and lazy loading where appropriate
- Enhance the visual representation of divination cups with better animations
- Improve the historical records display with better mobile layout
- Add cultural context information in an accessible way
- Implement proper touch targets for mobile users

## Impact
- Affected specs: cultural-cap capability
- Affected code: src/pages/CulturalCapPage.js, src/pages/styles/culturalcap.css
- Breaking changes: Visual appearance will change significantly (but core functionality remains the same)