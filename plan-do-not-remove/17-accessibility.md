# Accessibility Implementation

## Overview
The School Finder Portal follows WCAG 2.1 AA standards to ensure accessibility for all users, including those with disabilities.

## Key Accessibility Features

### Semantic HTML
Use proper HTML elements for their intended purpose:
```jsx
// Good example
<article>
  <h2>School Name</h2>
  <p>School description...</p>
  <button aria-label="Add to favorites">❤️</button>
</article>

// Avoid
<div class="article">
  <div class="heading">School Name</div>
  <div>School description...</div>
  <div class="button" onclick="addFavorite()">❤️</div>
</div>
```

### Keyboard Navigation
Ensure all interactive elements are keyboard accessible:
```jsx
// components/SchoolCard.tsx
export function SchoolCard({ school }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Handle action
    }
  };

  return (
    <div 
      tabIndex={0}
      role="button"
      onKeyDown={handleKeyDown}
      className="p-4 border rounded-md hover:shadow-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
    >
      {/* School content */}
    </div>
  );
}
```

### Screen Reader Support
Provide text alternatives for non-text content:
```jsx
// components/SchoolMap.tsx
export function SchoolMap({ schools }) {
  return (
    <div>
      <h2 id="map-heading">School Locations</h2>
      <div 
        aria-labelledby="map-heading"
        role="application"
      >
        {/* Map component */}
      </div>
      <div className="sr-only">
        <ul>
          {schools.map(school => (
            <li key={school.id}>
              {school.name} located at {school.address}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### Color Contrast
Ensure text has sufficient contrast against its background (minimum 4.5:1 for normal text, 3:1 for large text).

### Responsive Design
Implement responsive design that works at 200% zoom and on mobile devices.

## Testing
Regularly test with:
- Keyboard-only navigation
- Screen readers (NVDA, VoiceOver)
- Automated tools (axe DevTools, Lighthouse)

Fix accessibility issues before deployment.