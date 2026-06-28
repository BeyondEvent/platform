# Screen Layouts Specification

BeyondEvent divides its UI workspace into three standardized layouts depending on the operational context.

## 1. Global Shell Layout
All routes are framed by the `RootLayout` component, consisting of:
* **Top Header (Fixed, 52px)**: Houses logo, primary navigation links (Simulations, Topologies, Workers), live Socket.IO connection status indicator, and theme selector.
* **Workspace Area (Scrollable)**: Fills the viewport height minus the header height (`h-[calc(100vh-52px)]`).

## 2. Split Workspace Layout (Simulation Details)
The simulation workspace route (`/simulations/:id`) utilizes a responsive, double-pane structure designed for canvas work:

```
┌───────────────────────────────────────────────┐
│                 Top Header                    │
├───────────────────────────────┬───────────────┤
│                               │               │
│                               │ Control Pane  │
│                               ├───────────────┤
│      Interactive Canvas       │               │
│         (React Flow)          │  Inspector /  │
│                               │   Telemetry   │
│                               │               │
├───────────────────────────────┴───────────────┤
│          Event Timeline & Trace Drawer        │
└───────────────────────────────────────────────┘
```

* **Interactive Canvas Pane (Left, 70% width)**: Houses the interactive topology graph. Fully scrollable, draggable, and zoomable.
* **Telemetry & Control Pane (Right, 30% width)**: Collapsible sidebar housing active details, properties of selected nodes/edges, and metrics graphs.
* **Telemetry Timeline Drawer (Bottom, Drawer heights vary between 200px - 400px)**: Slide-up panel housing real-time event logs, traces, and execution details. Collapsible to a 40px summary bar.
