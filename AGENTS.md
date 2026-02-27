# AGENTS.md — How to Build Interactive Canvas Visualizations with AI

This document captures everything needed to recreate **The Record** or any similar AI-generated interactive canvas visualization project from scratch.

---

## What This Type of Project Is

A **fullscreen, interactive mathematical visualization** built with:
- React + TypeScript + Vite for the app shell
- HTML5 Canvas (2D context) for high-performance rendering
- Tailwind CSS for the non-canvas UI overlay
- A physics/math engine that runs inside `requestAnimationFrame`

The distinguishing characteristic is that **all rendering happens on a canvas** — React only manages the overlay controls (color pickers, sliders, buttons). This keeps the frame rate high and decouples the simulation from React's render cycle.

---

## Tech Stack Decisions

| Choice | Why |
|--------|-----|
| **Vite** over CRA | Instant HMR, no Webpack config |
| **React 19** | Concurrent features, good for overlay UI |
| **TypeScript strict** | Catches NaN/undefined bugs early in physics code |
| **Canvas 2D** over WebGL | Simpler API, sufficient for 10 attractors at 60fps |
| **Tailwind CSS 4** | Utility classes for overlay elements without a CSS fight |
| **`useRef` for simulation state** | Physics state must not trigger re-renders; `useState` would cause 60fps re-renders |

---

## Project Init

```bash
npm create vite@latest my-project -- --template react-ts
cd my-project
npm install
npm install -D tailwindcss @tailwindcss/vite
```

Add to `vite.config.ts`:
```typescript
import tailwindcss from '@tailwindcss/vite'
// add to plugins: [react(), tailwindcss()]
```

Add to `src/index.css`:
```css
@import "tailwindcss";
```

---

## Architecture Pattern

```
App.tsx
  └─ TheVoid.tsx           ← single component owns both canvas + overlay
       ├─ useRef: grid     ← 2D intensity array (simulation state)
       ├─ useRef: attractors
       ├─ useRef: particles
       ├─ useEffect → requestAnimationFrame loop
       ├─ <canvas>         ← covers full viewport
       └─ <div overlay>    ← React controls rendered on top
```

### Key pattern: refs for simulation state
```typescript
const attractors = useRef<Attractor[]>([]);   // ✅ no re-render on mutation
const energy     = useRef<number>(100);        // ✅ same
const [controls, setControls] = useState([]); // for things that DO need re-render
```

### Key pattern: animation loop
```typescript
useEffect(() => {
  let animId: number;
  const loop = () => {
    render();           // mutates refs, draws to canvas
    animId = requestAnimationFrame(loop);
  };
  animId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animId);
}, []);                 // empty deps — loop runs once, refs do not need to be in deps
```

---

## Prompting Strategy for AI Agents

### Phase 1 — Scaffold the physics first
Prompt the AI to build the math engine in isolation before touching React:

> *"Implement a Lorenz attractor step function in TypeScript. Input: current point `{x,y,z}`, params `{sigma, rho, beta}`, timestep `dt`. Output: `{dx,dy,dz}`. No React, no canvas yet."*

Get the physics right in pure functions before integrating.

### Phase 2 — Rendering loop
Ask for a minimal canvas proof of concept:

> *"Create a React component with a full-viewport canvas. In a useEffect, start a requestAnimationFrame loop that draws the Lorenz attractor. Use useRef for all mutable state."*

### Phase 3 — Grid / trail persistence
The persistent HDR grid effect is the visual heart of the project:

> *"Add a 2D grid array (one cell per 2px) that records which canvas pixels the attractor passes through. Each frame: multiply all cell values by 0.9995 (decay), then paint cells as colored rectangles with alpha proportional to their value."*

### Phase 4 — Multiple attractors in a tiled layout
> *"Extend to 10 attractors laid out in a 5×2 grid. Each attractor should be clipped to its tile using `ctx.beginPath()` + `ctx.rect()` + `ctx.clip()` before drawing."*

### Phase 5 — Interactive overlay
> *"Add a hover-revealed control panel over each tile. Controls: joystick for 3D rotation (drag X/Y), scale slider, point count +/−, speed slider, color picker, flush button. Use React state for the visibility, and refs/callbacks to apply changes to the simulation."*

---

## Key Implementation Details

### Clipping per tile
```typescript
ctx.save();
ctx.beginPath();
ctx.rect(tile.x, tile.y, tile.w, tile.h);
ctx.clip();
// draw attractor here — it cannot bleed outside the tile
ctx.restore();
```

### 3D → 2D isometric projection
```typescript
// Global camera: 45° around Y, 35.26° around X (isometric)
// Apply per-object rotation (from joystick) FIRST, then camera
function project(x, y, z, rotation, scale, offset): {px, py} { ... }
```

### Stability guard
Chaotic systems diverge. Always reset far-out points:
```typescript
if (Math.abs(p.x) > 1000 || Math.abs(p.y) > 1000 || Math.abs(p.z) > 1000) {
  p.x = Math.random() * 0.1; p.y = Math.random() * 0.1; p.z = Math.random() * 0.1;
}
```

### Glow without WebGL
```typescript
ctx.shadowBlur = 12;
ctx.shadowColor = `rgb(${r},${g},${b})`;
ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`;
ctx.stroke();
ctx.shadowBlur = 0; // reset — never leave shadowBlur on for fill operations
```

### Coherent color swarm (10 points per attractor)
```typescript
// Shift hue slightly per point so all 10 feel related but distinct
const hue = baseHSL.h + (pointIndex / totalPoints) * 0.04;
```

---

## Attractor Library

Quick reference for the 10 systems used:

| Name | Equations | Stable params |
|------|-----------|--------------|
| **Lorenz** | `dx=σ(y-x), dy=x(ρ-z)-y, dz=xy-βz` | σ=10, ρ=28, β=8/3, dt=0.005 |
| **Rössler** | `dx=-(y+z), dy=x+ay, dz=b+z(x-c)` | a=0.2, b=0.2, c=5.7, dt=0.01 |
| **Hénon** (discrete) | `xn+1=1-ax²+y, yn+1=bx` | a=1.4, b=0.3 |
| **Chua** | Custom piecewise, double scroll | dt=0.005 |
| **Sprott** | Minimal `dx=y, dy=-x+yz, dz=1-y²` | dt=0.01 |
| **Four-Wing** | `dx=ax+yz, dy=bx+…` | dt=0.003 |
| **Rabinovich-Fabrikant** | 5 params, complex coupling | dt=0.003 |
| **Halvorsen** | Cyclic symmetry 3-way | a=1.4, dt=0.004 |
| **Dadras** | 5 params | dt=0.005 |
| **Aizawa** | Toroidal | dt=0.008 |

---

## Repository Presentation Checklist

When preparing for GitHub:

- [ ] **`public/favicon.svg`** — custom icon (Lorenz butterfly in brand color works well)
- [ ] **`public/og-image.png`** — 1200×630 social preview (static, used in `<meta og:image>`)
- [ ] **`public/demo.gif`** — animated GIF of the live app for README (30fps, ~900px wide)
- [ ] **`index.html`** — proper `<title>`, `<meta description>`, Open Graph + Twitter Card tags
- [ ] **`README.md`** — embed `demo.gif` at top, add badges, tech stack table, clone URL
- [ ] **`docs/ARCHITECTURE.md`** — component breakdown, rendering pipeline diagram
- [ ] **`docs/WALKTHROUGH.md`** — user guide, per-control docs
- [ ] **`docs/CHANGELOG.md`** — semantic versioning, every feature listed

### Make the GIF
```bash
# Capture frames with browser automation, then:
ffmpeg -y -framerate 30 -pattern_type glob -i '/tmp/frames/f*.png' \
  -i /tmp/palette.png \
  -lavfi "[0:v][1:v] paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 public/demo.gif
```

---

## Common Pitfalls

| Problem | Fix |
|---------|-----|
| Controls trigger re-renders at 60fps | Store simulation state in `useRef`, not `useState` |
| Attractor bleeds into adjacent tile | Always `ctx.save()` → `ctx.clip()` → draw → `ctx.restore()` |
| Physics diverges to NaN | Add bounds check + reset every frame |
| Joystick feels inverted | Horizontal drag → Y-axis rotation; vertical → X-axis |
| Speed slider causes instability | Cap `dt` per attractor (sensitive ones need lower max) |
| Dark trails look muddy | Use `rgba(10,10,10, 0.35)` for partial clear, not full clear |
| GIF frames have different dimensions | Pre-scale all frames to identical px before palette gen |

---

## AI Model Recommendations

| Task | Best model |
|------|-----------|
| Initial code generation | Claude Opus / Gemini Pro |
| Visual debugging ("why does it spiral wrong?") | Model with vision + code |
| Math equations → code | Either; always verify with Wikipedia |
| Refactoring large component | Claude (better at preserving context) |
| Generating hero images | Gemini image generation |
