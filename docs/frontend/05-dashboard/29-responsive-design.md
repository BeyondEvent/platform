# Responsive Design Specification

The BeyondEvent dashboard workspace adapts cleanly across various viewport sizes.

## 1. Breakpoint Grid Constraints
We utilize standard Tailwind screen scales:
* **Mobile (`sm`: 640px and below)**:
  * The main navigation header collapses into a mobile hamburger menu drawer.
  * Simulation splits stack vertically.
* **Tablet (`md`: 768px)**:
  * Sidebar panels (e.g. details inspector) transform into overlay modals to preserve canvas space.
* **Desktop (`lg`: 1024px and above)**:
  * Split pane layouts are locked side-by-side. Custom nodes scales are optimized for high density views.

## 2. Canvas Adaptations
* When viewports scale, the React Flow canvas automatically adjusts its focus using `fitView`.
* Double-tap and pinch-to-zoom gestures are supported on touch displays.
