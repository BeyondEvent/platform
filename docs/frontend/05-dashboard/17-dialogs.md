# Dialogs & Modals Specification

Modals block interaction with the underlying application to gather critical decisions or focus user attention (e.g. topology creation wizard, purge confirmation).

## 1. Structural Requirements
* **Backdrop**: Smooth dark blurred screen overlay (`bg-background/80 backdrop-blur-sm`).
* **Sizing Scales**: Sizing defaults to standard widths:
  * Small Confirmation: `max-w-sm` (384px) - Used for delete/flush confirmation checks.
  * Form Config Modal: `max-w-lg` (512px) - Used for adding custom nodes or properties.
  * Large Traversal Inspector: `max-w-4xl` (896px) - Used for detail trace analysis trees.

## 2. Keyboard & Focus Guidelines
* **Initial Focus Trap**: Focus is captured inside the active dialog. Standard inputs autofocus.
* **Dismiss Triggers**: Pressing `ESC` or clicking anywhere on the backdrop triggers modal exit transitions.
* **Tab Navigation Loop**: Tab operations wrap from the last action button back to the first input field inside the container.
