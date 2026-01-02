## 1. Algorithm Extraction
- [ ] 1.1 Analyze current Shaoyong algorithm implementation in src/components/shaoyong/
- [ ] 1.2 Create dedicated utility module for Shaoyong calculations (src/utils/shaoyong-algorithm.js)
- [ ] 1.3 Extract core divination logic from components into utility functions
- [ ] 1.4 Create comprehensive unit tests for the extracted algorithm

## 2. Tailwind Implementation
- [ ] 2.1 Replace all custom CSS with Tailwind classes in Shaoyong components
- [ ] 2.2 Implement responsive design patterns for mobile-first approach
- [ ] 2.3 Create reusable Tailwind component classes for consistent styling
- [ ] 2.4 Ensure proper dark mode support with Tailwind

## 3. Theme Management
- [ ] 3.1 Implement global theme context for consistent theming
- [ ] 3.2 Ensure all Shaoyong components respect global theme settings
- [ ] 3.3 Add theme switching capabilities if not already present

## 4. Component Refactoring
- [ ] 4.1 Refactor ShaoyongYixue.js to use extracted algorithm
- [ ] 4.2 Refactor Tiebanshenshu.js and related components
- [ ] 4.3 Update BaziInput.js to use new algorithm module
- [ ] 4.4 Refactor ClauseDisplay.jsx and other display components

## 5. Testing and Validation
- [ ] 5.1 Run existing tests to ensure no regressions
- [ ] 5.2 Add new tests for refactored components
- [ ] 5.3 Validate mobile responsiveness on different screen sizes
- [ ] 5.4 Verify algorithm accuracy matches original implementation