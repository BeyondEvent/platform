# Empty States Specification

Empty states should guide the user forward rather than just showing a blank screen (e.g. no simulations, no topologies).

## 1. Visual Presentation
* **Iconography**: Render a large, subtle, stroke icon (e.g. outline grid, topology map, or worker block) centered on the canvas page (`text-zinc-700/60 dark:text-zinc-800/80 size-12`).
* **Title & Message**: Display a bold header (`text-lg font-semibold mt-4`), followed by a concise explanation of the state (`text-sm text-muted-foreground max-w-sm mt-2`).
* **Action Block**: Explicit primary CTA button (e.g., "+ New Topology") to resolve the empty state immediately.

## 2. Standard Variants
* **No Simulations**: Displays "No simulations yet" with the message "Create a topology and run a simulation to visualise event flow here." and a "+ Create Simulation" primary action button.
* **No Workers Connected**: Displays "No active workers" with the description "Connected worker nodes will automatically register and appear in this workspace."
