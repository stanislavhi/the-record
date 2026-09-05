# Walkthrough — The Record

> **🤖 This project was fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**
>
> See [Interactive Attractor Controls.md](../Interactive%20Attractor%20Controls.md) for the complete conversation log.

**The Record** is an interactive visualization of chaotic attractors — mathematical systems that trace infinite, never-repeating paths through phase-space. Every line you see is being computed in real time. There are three pages of ten: **Page 1** holds the textbook classics, **Page 2** holds ten chaotic flows invented for this project, and **Page 3** is a menagerie — ten different *kinds* of dynamics (a fractal, a Julia set, ants, a billiard, a double pendulum, gravity, a delay equation, a flock, a quasi-periodic weave, a bouncing ball).

---

## Getting Started

1. Open the app — you'll see a pulsing **"CLICK TO MERGE"** prompt with three loading dots
2. **Click anywhere** to trigger the merge and start all 10 simulations
3. The attractors immediately begin tracing their paths
4. A **toolbar** appears at the bottom of the screen for global actions

---

## The Attractors

Ten chaos engines run simultaneously in a responsive grid, each isolated in its own tile:

| Attractor | Color | Type | What to look for |
|-----------|-------|------|-----------------|
| **Lorenz** | ⬜ White | Continuous | The iconic butterfly — two lobes, never crossing |
| **Rössler** | 🟡 Gold | Continuous | A tight spiral that occasionally flips |
| **Hénon** | 🩷 Hot Pink | Discrete | Scattered points forming a curved band |
| **Chua** | 🟠 Orange | Continuous | Double-scroll — two linked spirals |
| **Sprott** | 🔵 Cyan | Continuous | Minimal 3D chaos, elegant curves |
| **Four-Wing** | 🟢 Green | Continuous | Four symmetric wings, hyperchaotic |
| **Rabinovich** | 🩵 Mint | Continuous | Twisting Fabrikant flow |
| **Halvorsen** | 🩷 Magenta | Continuous | Three-fold cyclic symmetry |
| **Dadras** | 💜 Violet | Continuous | Complex 5-parameter folding |
| **Aizawa** | 🟠 Amber | Continuous | Toroidal — doughnut-shaped orbit |

Each attractor runs **10 parallel points** by default with a coherent HSL color gradient (±2% hue shift per point), creating dense layered trails that reveal the attractor's full structure over time.

### Page 2 — the originals

Press `2` (or the toolbar's **Page 2 ✦** button) to swap the whole grid for ten systems designed for The Record. They are not transcribed from a reference: each one started as a twist on a known chaos mechanism, and its coefficients were found by a numerical sweep that only kept regimes that stay bounded and chaotic under the app's own integrator. Press `1` to come back. The choice is remembered between visits.

| Attractor | Color | Type | What to look for |
|-----------|-------|------|-----------------|
| **Sigil** | 💜 Violet | Continuous | Lorenz with a cos(wz) gain — a tight, fast-flickering knot instead of two calm wings |
| **Wick** | 🟡 Candle | Continuous | Lorenz whose z pump only pushes up — a single tall lobe fed by both wings |
| **Cinder** | 🔴 Ember | Continuous | Chua's double scroll with the corners smoothed by tanh — rounder, softer |
| **Gyre** | 🩵 Teal | Continuous | Three scrolls; a cos(x) ripple nudges orbits between them at odd intervals |
| **Moth** | 🩷 Rose | Continuous | Slow drift near the centre, sudden wide loops when the thermostat bites |
| **Tidepool** | 🟢 Sea green | Continuous | A spiral that swells, stalls and drains as z dials the radius |
| **Ossuary** | 💜 Lilac | Continuous | Nosé–Hoover shells rattled by a sin(wx) forcing — stacked bone-like rings |
| **Ripple** | 🔵 Ice | Discrete | Sine/cosine map drawn as dust, like Hénon — z is a delayed echo of x |
| **Anvil** | ⚪ Steel | Continuous | Jerk system: sinusoidal kick vs cubic brake — heavy, blocky loops |
| **Reed** | 🟢 Chartreuse | Continuous | Jerk with a square-root restoring force — thin swaying strands |

Every Page 2 tooltip and tour card carries an **original** badge, and the Lyapunov exponent shown is a measured value (see `npm run vet:attractors`), not a quoted one.

### Page 3 — the menagerie

Press `3` (or the **3** in the toolbar's Page group). Nothing on this page is a strange-attractor flow. Each tile is a different class of dynamical system, run through the same point-and-trail pipeline, so the grid becomes a comparison of *kinds* of motion rather than ten more shapes.

| Tile | Kind of system | What to look for |
|------|----------------|-----------------|
| **Thicket** | iterated function system | A chaos game: dust converges onto a self-similar shrub no matter where the points start |
| **Dendrite** | complex dynamics | The Julia set of z² + c, painted by running the map backwards |
| **Colony** | cellular automaton | Langton's ants on one shared lattice — wait ~10 000 steps for a highway; add ants and they rewrite each other |
| **Stadium** | billiard | Straight lines and hard bounces, yet the rounded caps scatter nearby balls apart |
| **Pendulum** | Hamiltonian mechanics | Ten double pendulums released almost identically; no friction, no attractor, still disagreement in seconds |
| **Cluster** | N-body | The tile's own points attract each other. One point is an ellipse, three is chaos — press `+` |
| **Echo** | delay equation | Mackey–Glass: the present depends on 17 time units of history; shown as a delay embedding |
| **Murmuration** | agents | Boids: three local rules, no leader. Press `+` to grow the flock |
| **Loom** | quasi-periodic | The control: three irrational frequencies, never repeats, never chaotic |
| **Rebound** | impact dynamics | A ball on a vibrating plate, wound round a cylinder of drive phase so the bounces stack into a band |

Three of these (Cluster, Murmuration, Colony) are *interacting* systems — the point count slider changes the physics, not just the density. The Lyapunov line in their cards is descriptive rather than a number, because a single exponent is not the right summary for a stochastic, conservative or quasi-periodic system.

---

## Per-Tile Controls

**Hover over any tile** (or tab to it with the keyboard) to reveal its control panel. The panel is split into two groups: **Physics** (what the simulation does) and **Display** (how it looks).

### 🕹️ Joystick Rotation
- Click/tap and drag on the circular joystick
- **Horizontal drag** → rotates on the Y-axis
- **Vertical drag** → rotates on the X-axis
- A **live needle** tracks the current rotation angle
- The knob itself tilts with the drag for tactile feedback
- Works with both mouse and touch (Pointer Events)

### 🔍 Scale Slider
- Zooms the attractor in or out within its tile
- Range: 0.1× to 100×
- Current value displayed alongside the slider

### ➕➖ Point Count
- **+** adds a simulation point (max 50)
- **−** removes one (min 1)
- More points → denser trails, higher CPU load
- Current count displayed between the buttons

### ⚡ Speed Slider
- Controls the physics timestep (`dt`)
- Faster = more motion per frame, but some attractors become unstable at high speeds
- Capped conservatively per attractor to prevent divergence

### 🎨 Color Picker
- Changes the attractor's base color
- The point gradient is recomputed live from the new hue
- Trail history retains the old color until it fades

### 🎲 Randomize
- One-click random color, rotation, scale, and speed for that tile
- Bounded by the same limits that apply to the sliders, so it never picks diverging parameters

### 🚿 Flush
- Clears the grid trail history for that tile only
- Instant clean slate — useful when the grid gets saturated

### ℹ️ Info tooltip
- Hover (or focus) the tile title to reveal a card with:
  - Discoverer and year
  - The attractor's governing equations
  - Its Lyapunov exponent
  - A one-sentence blurb describing what makes it interesting

All controls include ARIA labels and visible focus rings so they're reachable via keyboard and announced by screen readers.

---

## Global Toolbar

The fixed toolbar at the bottom center of the screen exposes whole-app actions:

| Button | Action |
|--------|--------|
| ⏸ / ▶ | **Pause / Resume** the entire simulation |
| ↺ | **Reset All** — flush every tile's trails |
| 🎲 All | **Randomize All** — randomize every attractor at once |
| Page 1 2 3 | **Page group** — classics / originals / menagerie (swapping clears trails and resets tile controls; persisted to `localStorage`) |
| Palette ▾ | **Palette preset** — apply Original, Neon, Pastel, Mono, Warm, or Cold across all 10 attractors |
| Perf ▾ | **Performance mode** — Low / Med / High, adjusting render sub-steps and glow (persisted to `localStorage`) |
| PNG | **Snapshot** — save the current canvas as a timestamped PNG |
| ● Rec / ■ 00:12 | **Record** — WebM video of the canvas. Button label shows the elapsed time while recording and auto-stops at 60 s |
| Tour | **Narrative tour** — step through each attractor with equations and metadata |
| ☼ / ☾ | **Theme toggle** — switch between dark and light |
| ▦ | **Stats** — toggle the FPS / points / energy HUD |
| ? | **Help** — open the keyboard-shortcut modal |

Clicks inside the toolbar are excluded from the canvas "merge" handler, so pressing a button never spawns particles.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Pause / resume simulation |
| `Esc` | Reset all trails (or close open modal) |
| `?` / `H` | Toggle the keyboard-shortcut help modal |
| `S` | Toggle the stats overlay |
| `T` | Toggle dark / light theme |
| `R` | Randomize every attractor |
| `P` | Save a PNG snapshot |
| `V` | Start / stop WebM recording (auto-stops at 60 s) |
| `N` | Open / close the narrative tour |
| `M` | Mute / unmute the generative audio synth |
| `1` / `2` / `3` | Page 1 classics / Page 2 originals / Page 3 menagerie — Ctrl/Cmd/Alt combinations pass through to the browser |
| `+` / `-` | Add / remove a point on the last-focused tile |
| `← ↑ → ↓` | Rotate the last-focused tile's joystick (tour nav takes priority while the tour is open) |

Shortcuts are ignored while typing inside inputs, textareas, or contenteditable regions (except `Escape`, which always resets).

## Narrative Tour

The tour is a guided walkthrough of the ten attractors on the current page — switch pages first to tour the originals. Open it from the toolbar or with `N`. Each card shows the attractor's name, discoverer + year, equations, Lyapunov exponent, and a short blurb explaining what makes it interesting. Use `←` / `→` to step through and `Esc` to close.

While the tour is open, the nine non-current tiles dim to ~22% opacity (300 ms transition) so the spotlighted attractor stays visually dominant. Canvas trails keep rendering at full intensity — only the tile frame overlay dims.

## PNG + WebM Export

- **PNG** — `P` or the toolbar button saves the current canvas as `the-record-<timestamp>.png` using `canvas.toDataURL('image/png')`
- **WebM** — `V` or the toolbar "● Rec" button starts a recording via `canvas.captureStream()` + `MediaRecorder`. Press again (or "■ Stop") to stop and download. Codec falls back from `video/webm;codecs=vp9` to `video/webm` when VP9 isn't available.

## Palette Presets

The toolbar's **Palette** dropdown applies one of six curated color sets to all 10 attractors at once:

| Preset | Vibe |
|--------|------|
| Original | The launch colors (white, gold, hot pink, orange, cyan, green, mint, magenta, violet, amber) |
| Neon | Saturated cyans, magentas, and yellows |
| Pastel | Soft, low-saturation hues |
| Mono | Shades of gray — good for capturing structure without chromatic distraction |
| Warm | Reds, oranges, ambers |
| Cold | Blues, indigos, violets |

The per-tile color picker still works after a palette is applied — palettes are just a quick way to reset the whole grid.

---

## Pause Overlay

When paused, a dim scrim fades over the canvas and a **PAUSED** badge appears with a hint to press `Space` (or the toolbar button) to resume. Physics stepping halts immediately; grid decay also pauses so the trail state is preserved exactly as it was.

---

## Stats HUD

Toggle with `S` or the toolbar button. The HUD sits across the top of the screen and shows:

- **FPS** — rolling average, sampled every 500 ms
- **Points** — total simulation points summed across all 10 attractors
- **Energy bar** — the same energy budget that governs particle spawning
- **Phase** — current run state (`INTRO`, `RUNNING`, `PAUSED`)

Useful when you're tuning point counts or spotting a slowdown.

---

## Themes

Two themes ship out of the box, both driven by CSS custom properties on `:root[data-theme="..."]`:

- **Dark** (default) — void-black background, high-glow trails, crisp accent colors
- **Light** — near-white background, muted glow, deeper accents for contrast

The choice is persisted to `localStorage` under the key `theme`. On first visit the app honors the user's `prefers-color-scheme`. Canvas rendering reads the active tokens via `getThemeTokens()` each frame, so a theme flip takes effect on the very next paint without any reload.

---

## Touch & Responsive

- All pointer input (joystick drag, canvas click-to-merge) goes through the **Pointer Events API**, so touch, pen, and mouse all work identically
- The grid reflows by breakpoint:
  - **Mobile** (< 640 px): 2 columns
  - **Tablet** (640–1024 px): 3 columns
  - **Desktop** (≥ 1024 px): 5 columns
- Tiles keep a consistent aspect ratio at every width, and the toolbar stays pinned to the bottom center

---

## The Grid (The Database)

Behind every attractor is a persistent **2px-resolution grid**. As attractor points pass through a cell, its intensity and color are recorded. Cells decay slowly (`DECAY_RATE = 0.9995`) — about 1,400 frames to reach half-brightness at 60 fps — creating "long-exposure" light paintings.

This persistent layer is what the project calls *The Database*: an atemporal record of all prior computation.

---

## The Particles (Your Ink)

Moving your pointer after the merge spawns **ink particles** that drift through the void and write to the grid. You have an energy budget (100 units) that depletes as you draw and regenerates when you stay still.

---

## Projection & Camera

All attractors are rendered with a fixed **isometric camera** (45° Y, 35.26° X). The joystick applies local rotation *before* this global transform, so you're always orbiting around the isometric axis.

---

## Error Boundary

If the canvas initialization or a render step throws, the UI falls back to a readable **"RECORD CORRUPTED"** panel with a button to reload. The rest of the page remains responsive, so you can copy the error or navigate away.

---

## Generative Audio

A muted-by-default synth sits behind the merge: an `AudioContext` with 10 sine voices (one per attractor), each fed through a lowpass filter + stereo panner + gain stage, mixed through a master gain and compressor to the destination. The filter cutoff is modulated by a shared 0.1 Hz LFO for a slow, restless texture.

Every ~4 render frames, the synth reads `points[0]` from each attractor and maps:

- `x` → oscillator pitch, `200 – 1200 Hz` on a log curve
- `y` → stereo pan, `-1 .. +1`
- `z` → filter cutoff, `250 – 4000 Hz` on a log curve

Default volume is `0.1`. The synth starts as part of the merge click (browser autoplay policy) and stays muted until you press `M` or click the ♪ panel above the toolbar. When the sim is paused, the master gain ducks to `0` over 100 ms so the silence is clean.

## Performance Mode

The toolbar's **Perf** select switches between three presets:

| Preset | Sub-steps | Glow cap | Use when |
|--------|-----------|----------|----------|
| Low | 1 | 0 | Laptops, battery, many points, or audio-heavy sessions |
| Med | 20 | 10 | Default — matches the 1.0–1.3 experience |
| High | 40 | 14 | Desktops with headroom; denser, glowier trails |

`PERF_PRESETS` lives in `src/components/constants.ts`. The active preset is persisted to `localStorage` under `perfMode` and honored on reload.

## Performance Notes

- Grid uses 2px cells for maximum visual fidelity
- Physics sub-steps per frame adapt to the active Perf preset (1 / 20 / 40)
- Canvas clipping prevents attractors from drawing outside their tile
- Points that diverge (|x|, |y|, or |z| > 1000) auto-reset to origin
- FPS sampling runs on a rolling 500 ms window so a single janky frame doesn't dominate the reading
- A Web Worker physics scaffold lives at `src/workers/attractorWorker.ts` (init / step / setParams / setPointCount protocol with transferable `Float32Array` buffers). The `USE_WORKER` flag in `constants.ts` gates boot; default `false`. The main thread still owns drawing — wiring the worker's trajectory buffers into the draw step is a follow-up.
