# Form Inputs Specification

Inputs allow users to configure and parameters inputs. All inputs must share the same basic theme boundaries.

## 1. Visual Specification
* **Basic Fields (Text / Number)**:
  * Dark mode theme: `bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-md`.
  * Height matches standard buttons (`h-9` or `h-10`).
  * Text scales standard body size (`text-sm`).
* **Active States**: Focus states must trigger a clear ring border highlight: `focus-visible:ring-1 focus-visible:ring-indigo-500/80 outline-none border-zinc-700`.

## 2. Special Inputs
* **Toggle / Switch**: Renders a pill slot with sliding control node. Green state background represents true/active configs.
* **Sliders (for Metrics and Chaos Delays)**: Continuous bar track with draggable round thumb indicator, displaying dynamic text badge (e.g. `200ms` or `5 instances`) alongside the element.
