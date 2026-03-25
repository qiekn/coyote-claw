---
name: svg-dark-mode
description: SVG diagram guidelines for light/dark mode compatibility in documentation
---

# SVG Dark Mode Compatibility

## Rules

All SVG diagrams in this project MUST support both light and dark modes. Follow these rules strictly.

### 1. Use CSS custom properties, NOT `currentColor`

`currentColor` does NOT work when SVG is embedded via `<img>` tag (which is how markdown `![](img.svg)` renders). Use `@media (prefers-color-scheme: dark)` instead.

### 2. Required style block

Every SVG must start with this style block immediately after the opening `<svg>` tag:

```xml
<style>
  :root { --fg: #1a1a1a; --fg-dim: #666; --fg-faint: #999; --cell-bg: rgba(0,0,0,0.04); --line: #ccc; --accent-border: #d4a030; }
  @media (prefers-color-scheme: dark) {
    :root { --fg: #e4e4e7; --fg-dim: #a1a1aa; --fg-faint: #71717a; --cell-bg: rgba(255,255,255,0.06); --line: #52525b; --accent-border: #f59e0b; }
  }
  text { fill: var(--fg); }
  .dim { fill: var(--fg-dim); }
  .faint { fill: var(--fg-faint); }
  .cell { stroke: var(--line); stroke-width: 1; fill: var(--cell-bg); }
  .cell-bg { fill: var(--cell-bg); }
  .border-accent { fill: none; stroke: var(--accent-border); stroke-width: 1.5; }
</style>
```

### 3. Never use hardcoded black/white

| Bad | Good |
|-----|------|
| `fill="#000"` | `fill="var(--fg)"` |
| `fill="black"` | class on text inherits `var(--fg)` |
| `stroke="#333"` | `stroke="var(--line)"` |
| `fill="white"` | No background fill (transparent) |
| `fill="currentColor"` | `fill="var(--fg)"` |

### 4. No SVG `<marker>` elements

Many renderers (browsers, markdown viewers) fail to render `<marker>` elements properly — they show as colored squares. Use inline `<polygon>` for arrowheads:

```xml
<!-- Bad: marker-based arrow -->
<defs>
  <marker id="arrow" ...><path .../></marker>
</defs>
<line ... marker-end="url(#arrow)"/>

<!-- Good: inline polygon arrow -->
<line x1="100" y1="50" x2="195" y2="50" stroke="#3b82f6" stroke-width="1.5"/>
<polygon points="200,50 192,46 192,54" fill="#3b82f6"/>
```

### 5. Every CSS class used must be defined

If you use `class="cell"` on an element, the `.cell` rule MUST exist in the `<style>` block. Undefined classes cause elements to use browser defaults (`fill: black`).

### 6. Accent colors

Use sparingly for emphasis only. These fixed colors work in both modes:

- Blue: `#3b82f6` (links, frequency labels)
- Green: `#22c55e` (success, BLE connections)
- Amber: `#f59e0b` (warnings, intensity labels)

### 7. No background

Do NOT set a background on the SVG. It must be transparent so the page background shows through.

### 8. No gradients, filters, or glows

Keep SVGs clean and minimal. No `<linearGradient>`, `<filter>`, `<feDropShadow>`, or `<feGaussianBlur>`.
