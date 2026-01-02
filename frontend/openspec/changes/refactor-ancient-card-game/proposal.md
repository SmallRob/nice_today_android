# Change: Refactor AncientCardGame with Modern UI, Dark Theme and Dashboard Integration

## Why
The current AncientCardGame (古风马吊) has a traditional UI that lacks modern design principles and comprehensive dark theme support. The game is not integrated into the main dashboard, making it difficult for users to discover and access. This change will modernize the UI with Tailwind CSS, implement a cohesive dark theme, optimize for mobile devices, and integrate the game into the homepage dashboard for better accessibility while preserving the traditional Chinese card game experience.

## What Changes
- Modernize UI with Tailwind CSS and contemporary design patterns
- Implement comprehensive dark theme support with smooth transitions
- Enhance mobile responsiveness with touch-friendly controls and optimized layouts
- Integrate the game into the homepage dashboard with a dedicated card/entry
- Improve accessibility with proper ARIA attributes and semantic HTML
- Add smooth animations and transitions for better UX
- Optimize performance with code splitting and lazy loading
- Enhance card visuals with better styling and interactions
- Add game instructions and tutorial for new players
- Implement proper touch targets for mobile users

## Impact
- Affected specs: ancient-card capability
- Affected code: src/components/ancientCardGame/*, src/pages/Dashboard.js (to add integration)
- Breaking changes: Visual appearance will change significantly (but core functionality remains the same)