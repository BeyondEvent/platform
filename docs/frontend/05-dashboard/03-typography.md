# Typography Specification

Clear typographic hierarchy is crucial for scanability when looking at metrics, IDs, and payload data.

## 1. Font Families
* **Proportional Sans-Serif**: **Inter** (fallback: System UI, `sans-serif`). Used for interface controls, labels, navigation, headers, and standard copy.
* **Monospace**: **JetBrains Mono** or **Fira Code** (fallback: `monospace`). Used for all trace IDs, span IDs, correlation keys, payloads, configuration objects, event names, and code blocks.

## 2. Text Sizes & Hierarchy
To maintain strict layout consistency, developers must restrict formatting to the following scale:

| Type Token | Font Size | Line Height | Font Weight | Standard Class | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Title Large | 1.875rem (30px) | 2.25rem | 700 (Bold) | `text-3xl font-bold tracking-tight` | Landing pages, major section titles |
| Page Header | 1.5rem (24px) | 2rem | 600 (Semibold) | `text-2xl font-semibold` | Page layouts, main workspace heads |
| Component Header | 1.125rem (18px) | 1.75rem | 600 (Semibold) | `text-lg font-semibold` | Sidebar drawers, card component titles |
| Body Standard | 0.875rem (14px) | 1.25rem | 400 (Regular) | `text-sm` | Default tables, control forms, descriptive texts |
| Monospace Standard | 0.8125rem (13px) | 1.25rem | 500 (Medium) | `font-mono text-xs font-medium` | Log outputs, raw payload keys, ID displays |
| Micro Caption | 0.75rem (12px) | 1rem | 400 (Regular) | `text-xs text-muted-foreground` | Timestamps, secondary labels, legend values |
