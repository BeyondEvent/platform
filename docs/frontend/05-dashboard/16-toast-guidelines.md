# Toast Notification Guidelines

Toasts give the user fast, non-blocking operational updates (e.g., successful topology save, worker connection, errors).

## 1. Notification Types & Categories

We define four standard categories mapping onto Tailwind theme classes:
* **Success**: Informing about configuration additions or completed simulations. (Accent: Emerald green, duration: 3000ms).
* **Warning**: System issues that don't block work (e.g. high consumer lag threshold). (Accent: Amber yellow, duration: 5000ms).
* **Error**: Critical pipeline crashes (e.g., topology validation failure). (Accent: Rose red, requires manual dismissal click, does not auto-close).
* **Info**: System status updates (e.g. replaying started). (Accent: Indigo blue, duration: 3000ms).

## 2. Interactive Behavior
* **Stacking Order**: Toast notifications stack vertically starting from the bottom-right viewport corner.
* **Swipe-to-Dismiss**: Touch or drag interactions trigger swift exit translations.
* **Actionable Badges**: Errors include a secondary inline action button (e.g., "View Logs" or "Retry Link") inside the toast panel.
