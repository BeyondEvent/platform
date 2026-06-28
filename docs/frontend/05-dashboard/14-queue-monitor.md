# Queue Monitor Specification

The Queue Monitor tracks the health, depth, and processing speeds of intermediate asynchronous message queues.

## 1. Metrics & Indicators
* **Queue Depth Indicator**: Renders a vertical level gauge indicating total pending items in the queue buffer.
* **Consumer Lag Monitor**: Numeric indicator showing the difference between publish sequences and consumer processing sequences.
* **Dead-Letter Queue (DLQ) Indicator Badge**: Highlighted warning indicator (Red border and background pulse if size > 0).

## 2. Interactive Queue Actions
* **Dead-Letter Queue Replay Action**: Button to "Replay DLQ Events" which triggers reprocessing of failed events.
* **Purge Queue Action**: Requires double confirmation to flush active message buffers.
