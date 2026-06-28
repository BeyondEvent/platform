# Dropdowns Specification

Dropdown selectors enable users to switch topologies, select event formats, or perform quick node operations.

## 1. Visual Layout
* **Trigger Element**: Outlined select block (`bg-zinc-950 border border-zinc-800 rounded-md text-sm`), displaying selected option name and a trailing carat icon (`▼`).
* **Overlay List Panel**: Pops up directly beneath the trigger with a slight vertical slide animation.
  * Border stroke matches standard containers (`border border-zinc-800`).
  * Drop-shadow utilizes rich styling (`shadow-lg`).

## 2. Accessibility & Navigation
* **Auto-complete Filters**: Input selectors support keystroke filtering inside long lists (e.g. searching 50+ event schemas).
* **Keyboard Triggers**: Arrow Up / Arrow Down steps between items; `Enter` confirms selection; `ESC` closes the panel.
