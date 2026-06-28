# Accessibility Specification

All components inside BeyondEvent must remain usable for users relying on keyboard inputs or assistive technologies.

## 1. Core Guidelines
* **Color Contrast**: All text must meet WCAG 2.1 AA benchmarks (minimum contrast ratio of 4.5:1 for body copy).
* **Keyboard Navigability**: Interactive elements (buttons, inputs, sliders, nodes) must be focusable using keyboard operations. Focus indicators (`outline-none ring-1 ring-indigo-500`) must be highly visible.
* **Semantic HTML**: Use native elements (`<button>`, `<input>`, `<dialog>`) rather than generic divs with custom click handlers.

## 2. ARIA Declarations
* Dialog modals utilize `role="dialog" aria-modal="true"`.
* Metrics charts include screen reader alternative texts (`aria-label` detailing current trends or status indicators).
* State badges carry explicit labels (e.g. `aria-label="Simulation state: running"`).
