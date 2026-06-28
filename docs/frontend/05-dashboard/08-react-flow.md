# React Flow Specification

BeyondEvent uses `@xyflow/react` to render complex event bus topologies. The canvas represents nodes as actors and edges as event channels.

## 1. Custom Node Definitions

We define three custom React Flow node types to represent components. Standard nodes should render:
* **ServiceNode (`type: 'service'`)**:
  * Visual Accent: Teal border and icon.
  * Information: Displays Service Name, registered input/output events count, and health badge.
  * Node Handles: Left handle (input trigger), Right handle (publish trigger).
* **QueueNode (`type: 'queue'`)**:
  * Visual Accent: Purple theme.
  * Information: Displays Queue Name, current message count, and lag latency numbers.
* **WorkerNode (`type: 'worker'`)**:
  * Visual Accent: Cyan border.
  * Information: Displays worker name, runtime version, and state sub-badges.

## 2. Interactive Controls
* **Drag-and-Drop Editor**: Users can drag nodes from the side panels and drop them on the grid.
* **Handle Linking**: Links drawn between outputs and inputs form connection edges (`TopologyEdge`). Edges map standard event channels and are labeled with the event schema types they carry.
* **Flow Animations**: Active connection paths render dot pulses moving along path vectors to visualize event propagation in real time.
