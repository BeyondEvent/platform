# Animations Specification

Animations must feel fast, premium, and functional. They should enhance the visual flow without adding unnecessary delay to the user interface.

## 1. Dope Simulation Canvas Animations

To visualize real-time event-driven simulations elegantly on the React Flow canvas:
* **Active Edge Pulsing**: Edges carrying live events render SVG dash-array animations moving along the link path.
  * Keyframe properties:
    ```css
    @keyframes edge-flow {
      from { stroke-dashoffset: 20; }
      to { stroke-dashoffset: 0; }
    }
    .flow-edge-active {
      stroke: url(#indigo-gradient); /* gradient along path */
      stroke-dasharray: 6, 4;
      animation: edge-flow 0.8s linear infinite;
    }
    ```
* **Simulation Node Breathing**: Running actor nodes (Services, Workers, Queues) emit a subtle glow based on execution state:
  * A custom ring element pulses outward (`animate-ping`) when an event is received, scaling down smoothly.
  * Nodes in an active `executing` state display a rotating gradient border highlight or a gentle blue breathing glow (`scale-102` pulse loop) to represent activity.

## 2. Spring UI Transitions
* **Drawer & Panel Slides**: Drawer panel slides from bottom or right utilize custom physics curves:
  * CSS Transition: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo, 350ms duration) for smooth deceleration.
* **Badges & Expanders**: Hovering items uses scale springs (`active:scale-[0.98] duration-100`).
* **Toast Entrances**: Slide-in from side uses spring elastic bounces (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
