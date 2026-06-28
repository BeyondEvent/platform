# Simulation Timeline Specification

The bottom drawer of the simulation workspace houses the timeline, allowing developers to observe and replay distributed event sequences.

## 1. Timeline scrubbing controls
* Layout contains player control buttons (Play, Pause, Step Backward, Step Forward, Replay, Reset).
* **Slider Scrub Track**: Horizontal progress slider that represents simulation time duration. As a user slides the scrub head:
  * The canvas updates dynamically to reflect node/edge states at that exact timeline slice.
  * The event log highlights active events occurring at that timestamp.

## 2. Event Log List
* Real-time list of events published during execution.
* Virtualized scrolling is enforced to support high-throughput simulations.
* Each event card contains:
  * Timestamp.
  * Event Type name (highlighted with color badge).
  * Source node name.
  * Trace ID link that opens the Trace Explorer.
