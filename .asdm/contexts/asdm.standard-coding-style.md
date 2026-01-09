# Nice Today App - Standard Coding Style

## JavaScript/React Coding Standards

### Naming Conventions
- **Variables & Functions**: camelCase (e.g., `userData`, `calculateBiorhythm`)
- **Components**: PascalCase (e.g., `BiorhythmDashboard`, `HoroscopePage`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`, `DEFAULT_THEME`)
- **Private/Internal**: Prefix with underscore (e.g., `_internalState`, `_calculateValue`)

### File Organization
- **Components**: Separate files for each component
- **Hooks**: Store in `src/hooks/` directory, named as `use*.js` (e.g., `useThemeColor.js`)
- **Pages**: Individual files in `src/pages/` directory
- **Utilities**: Grouped by functionality in `src/utils/` directory
- **Styles**: Organized in `src/styles/` directory

### Component Structure
```jsx
// Import statements
import React, { useState, useEffect } from 'react';

// Constants (if any)
const COMPONENT_NAME = 'MyComponent';

// Main component function
function MyComponent({ prop1, prop2 }) {
  // State declarations
  const [state, setState] = useState(initialValue);

  // Custom hook usage
  const themeColor = useThemeColor();

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependency]);

  // Event handlers
  const handleClick = () => {
    // Handle click
  };

  // Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}

export default MyComponent;
```

### Error Handling
- Use try-catch blocks for asynchronous operations
- Implement error boundaries for component-level error isolation
- Log errors using the centralized error logger (`errorLogger`)
- Implement fallback UIs for component loading failures
- Use defensive programming techniques

### Asynchronous Operations
- Use async/await over promises when possible
- Implement proper error handling in async functions
- Use timeouts for network requests to prevent hanging
- Implement retry mechanisms with exponential backoff
- Show loading states during async operations

### Performance Optimization
- Use React.memo for components with stable props
- Implement lazy loading for route components
- Use useMemo and useCallback hooks appropriately
- Optimize re-renders by minimizing state updates
- Implement code splitting at route level

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation support
- Maintain proper color contrast ratios
- Support screen readers

### Security Practices
- Sanitize user inputs
- Validate data before processing
- Use secure storage for sensitive information
- Implement proper error masking to avoid information leakage
- Sanitize HTML content when displaying user-generated content

### Code Comments
- Use JSDoc-style comments for functions and components
- Add inline comments for complex logic explanations
- Document non-obvious business rules
- Mark temporary solutions with TODO comments
- Document known limitations or issues

### State Management
- Use React Context for global state
- Use custom hooks for reusable state logic
- Minimize prop drilling by using context appropriately
- Separate local state from global state
- Implement proper cleanup in useEffect hooks

### Testing Considerations
- Write testable functions with clear inputs/outputs
- Separate business logic from UI components
- Use dependency injection where appropriate for easier testing
- Follow AAA (Arrange-Act-Assert) pattern in tests
- Implement proper mocking strategies