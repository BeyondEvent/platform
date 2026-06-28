# Navigation Specification

BeyondEvent leverages type-safe routing via TanStack Router. Navigation paths are defined in `apps/dashboard/src/routes`.

## 1. Primary Site Navigation

The global header contains active links mapping to key functional routes:
* **`/` (Simulations)**: Landing view listing all running/past simulations.
* **`/topologies` (Topologies)**: Topology canvas editor to build and manage systems graphs.
* **`/workers` (Workers)**: View listing connected worker pools and states.

## 2. Interactive States & Indicators
* **Connection Status Light**: Located on the right side of the header navigation bar. Connects to socket room status:
  * Green + "Live" text: Active websocket connection (`socket.connected === true`).
  * Gray + "Offline" text: Attempting reconnection or disconnected (`socket.connected === false`).
* **Active Routing States**: Highlight standard active link formatting:
  * Inactive link: `text-muted-foreground hover:text-foreground transition-colors`
  * Active link: `text-foreground font-semibold border-b-2 border-indigo-500 pb-2`
