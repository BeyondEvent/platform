# Side Panels Specification

Context-aware side panels provide controls, details, and metrics without taking space from the central canvas area.

## 1. Right Collapsible Drawer (Width: 380px)
* **Default State**: Collapsed. Slide-in from right is triggered when a user clicks on a node or edge on the canvas.
* **Component Context Details**:
  * **Selected Node (Service/Queue)**: Displays name, description, raw properties, execution telemetry, and a tabbed selection for "Metrics" and "Schema Config".
  * **Selected Edge (Event Link)**: Displays carrying event schema, message validation rates, and throughput charts.

## 2. Left Action Panel (Width: 260px)
* Contains drag-and-drop components for adding nodes (Service, Queue, Worker) to the topology.
* Houses filter controls to show or hide specific event classes or routes on the main canvas workspace.
