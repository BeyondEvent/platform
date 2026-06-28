# Error States Specification

Errors should be captured safely, presenting descriptive solutions rather than breaking the application view.

## 1. Error Boundary Implementations
* **Global Boundary**: Wraps the main layout router. Renders a full-screen layout with:
  * Error name and stack outline (collapsible in production, visible in development).
  * A "Reload Page" primary action button.
* **Component-Level Boundary**: Isolates separate areas (e.g. metrics widgets, React Flow panels) to prevent single endpoint errors from crashing the entire workspace. Renders a card overlay displaying "Failed to load telemetry" with a "Retry" ghost button.

## 2. Dynamic Field Errors
* Zod validation issues highlight standard input styling changes (`border-rose-500` outline) and show descriptive messaging directly under the invalid element.
