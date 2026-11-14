# The Record

> *"If the Database (God) is the atemporal record of all computation, and our thought is the flicker (IS/IS-NOT) that writes to it, what is the color of the ink?"*

An interactive visualization of chaotic attractors — mathematical systems that model deterministic chaos. Watch 10 strange attractors dance through phase-space, each tracing patterns that never repeat yet never escape their bounds. Flip to **Page 2** for ten more systems invented for this project, and **Page 3** for a menagerie of ten different kinds of dynamics — a fractal, a Julia set, ants, a billiard, a double pendulum, gravity, a delay equation, a flock, a quasi-periodic weave, a bouncing ball.

![The Record — Live Demo](public/demo.gif)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> **🤖 Fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**
>
> See [Interactive Attractor Controls.md](Interactive%20Attractor%20Controls.md) for the complete conversation log.

---

## ✨ Features

- **10 Chaotic Attractors** — Lorenz, Rössler, Hénon, Chua, Sprott, Four-Wing, Rabinovich–Fabrikant, Halvorsen, Dadras, Aizawa, at textbook parameters and integrated with RK4 so their measured Lyapunov exponents match the literature
- **Page 2 — 10 Original Attractors** — Sigil, Wick, Cinder, Gyre, Moth, Tidepool, Ossuary, Ripple, Anvil, Reed: systems designed for this project, parameter-swept for bounded chaos with `npm run vet:attractors`
- **Page 3 — The Menagerie** — Thicket (IFS), Dendrite (Julia set), Colony (Langton's ants), Stadium (billiard), Pendulum (double pendulum), Cluster (N-body), Echo (delay equation), Murmuration (boids), Loom (quasi-periodic), Rebound (bouncing ball): ten different classes of dynamics on one grid
- **Page 4 — The Forge** — Trefoil, Starfish, Compass, Lantern, Crown, Conch, Lotus, Triskele, Quatrefoil, Galaxy: known chaotic flows rebuilt by smooth coordinate operators (n-fold covers, twists, spherical inversion) — same chaos, new shapes. Pages switch with the toolbar group or `1`–`4`
- **Real-time 3D Rendering** — Canvas-based simulation with isometric projection
- **Interactive Per-Tile Controls** (visible on hover / focus):
  - 🕹️ **Joystick Rotation** — Drag to rotate X/Y axes (now with live needle indicator)
  - 🔍 **Scale Slider** — Zoom in/out with live readout
  - ➕➖ **Point Count** — Add or remove simulation points (1–50)
  - ⚡ **Speed Control** — Adjust simulation timestep (disabled for iterated maps, which have none)
  - 🎨 **Color Picker** — Change attractor colors dynamically
  - 🎲 **Randomize** — Randomize color and rotation; scale and speed vary within 0.5×–1.5× of the current value
  - 🚿 **Flush** — Clear trail history for a tile
  - ℹ️ **Info Tooltip** — Hover the tile title for equations, Lyapunov exponent, and discoverer
- **Global Toolbar** — Pause, Reset All, 🎲 Randomize All, **Page 1 / 2 / 3 / 4 group**, Palette presets, **Perf mode (Low/Med/High)**, PNG export, **WebM recorder with elapsed counter + 60 s soft cap**, Tour, Theme toggle, Stats overlay, Help modal
- **Generative audio synth** — 10 oscillator voices mapped from each attractor (`x → pitch`, `y → pan`, `z → filter cutoff`), default muted, `M` to toggle, ducks on pause
- **Narrative Tour** — Guided walkthrough of the active page's 10 systems (toolbar "Tour" or `N`); the other nine tiles dim so the current one stays lit
- **PNG + WebM Export** — Snapshot the canvas as PNG or record a WebM video
- **6 Palette Presets** — Original, Neon, Pastel, Mono, Warm, Cold — applied to all 10 attractors
- **Dark + Light themes** — CSS-variable-driven, tuned glow/alpha per theme, persisted to `localStorage`, honors `prefers-color-scheme`
- **Keyboard Shortcuts** — `Space` pause, `Esc` reset, `?` help, `S` stats, `T` theme, `R` randomize all, `P` PNG, `V` record, `N` tour, `M` mute, `1`/`2`/`3` page, `+/-` point count on focused tile, arrows rotate focused joystick
- **Touch Support** — Pointer Events across joystick and canvas
- **Responsive Grid** — 2 / 3 / 5 columns across mobile / tablet / desktop
- **Accessibility** — ARIA labels, visible focus rings, keyboard-reachable controls
- **Multi-point Simulation** — Each attractor runs parallel points with coherent color gradients
- **Persistent Grid Trails** — Colored trails fade over time, creating visual memory
- **Numerically vetted** — `npm run vet:attractors` measures every system exactly as the app integrates it (Lyapunov exponent, bounds, whole-swarm stability) and fails if a classic or original stops being chaotic or any swarm diverges

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/stanislavhi/the-record.git
cd the-record

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
npm run build
npm run preview
```

## 🎮 Usage

1. **Click anywhere** to trigger the merge and start the simulation
2. **Hover over any tile** (or tab to it) to reveal the control panel
3. **Drag the joystick** to rotate the attractor in 3D space — the needle tracks rotation live
4. **Adjust sliders** for scale and speed (values displayed alongside each slider)
5. **Click +/−** to add or remove simulation points
6. **Pick a color** to change the attractor's hue
7. **Click Flush** to clear just that tile's trail history
8. **Use the bottom toolbar or keyboard** for global actions:

### ⌨️ Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Pause / resume simulation |
| `Esc` | Reset all trails (or close open modal) |
| `?` / `H` | Toggle the keyboard-shortcut help modal |
| `S` | Toggle the stats overlay (FPS / points / energy) |
| `T` | Toggle dark / light theme |
| `R` | Randomize all attractors |
| `P` | Save PNG snapshot of the canvas |
| `V` | Start / stop WebM recording (auto-stops at 60 s) |
| `N` | Open / close the narrative tour |
| `M` | Mute / unmute the generative audio synth |
| `1` / `2` / `3` / `4` | Page 1 classics / 2 originals / 3 menagerie / 4 forge |
| `+` / `-` | Add / remove a point on the last-focused tile |
| `Arrows` | Rotate the last-focused tile's joystick |

## 🧮 The Attractors

### Page 1 — the classics

Continuous flows are integrated with classical RK4. Under forward Euler at the app's step sizes, Rössler and Rabinovich–Fabrikant collapse onto periodic orbits; RK4 keeps the on-screen speed and reproduces the textbook dynamics. λ is the largest Lyapunov exponent as measured by `npm run vet:attractors`.

| Name | Color | Type | Parameters | λ (measured) | Description |
|------|-------|------|------------|--------------|-------------|
| **Lorenz** | ⬜ White | Continuous | σ=10, ρ=28, β=8/3 | 0.91 | The butterfly effect, discovered 1963 |
| **Rössler** | 🟡 Gold | Continuous | a=b=0.2, c=5.7 | 0.070 | Simplest chaotic flow, a single folded band |
| **Hénon** | 🩷 Hot Pink | Discrete | a=1.4, b=0.3 | 0.42 / iter | 2D map, scattered point cloud |
| **Chua** | 🟠 Orange | Continuous | α=15.6, β=28 | 0.44 | Double scroll attractor |
| **Sprott** | 🔵 Cyan | Continuous | a=2.07, b=1.79 | 0.22 | Minimal 3D chaotic system |
| **Four-Wing** | 🟢 Green | Continuous | a=0.2, b=0.01, c=−0.4 | 0.064 | Four lobes |
| **Rabinovich–Fabrikant** | 🩵 Mint | Continuous | α=1.1, γ=0.87 | 0.20 | Wave propagation in nonequilibrium media; small basin, seeded near (−1, 0, 0.5) |
| **Halvorsen** | 🩷 Magenta | Continuous | a=1.4 | 0.69 | Cyclically symmetric |
| **Dadras** | 💜 Violet | Continuous | p=3, q=2.7, r=1.7, s=2, e=9 | 0.41 | 5-parameter system |
| **Aizawa** | 🟠 Amber | Continuous | a=0.95 … f=0.1 | 0.094 | Toroidal shape |

### Page 2 — the originals (Wave 4)

Ten systems invented for The Record. Each is a deliberate twist on a known chaos mechanism; coefficients were chosen by numerical sweep so every one stays bounded and chaotic under the app's own forward-Euler step (they stay on Euler — switching them to RK4 would change their character). Lyapunov exponents in the tooltips are measured, not quoted. Novelty is not certified: no literature search was run.

| Name | Color | Type | Mechanism | λ (measured) |
|------|-------|------|-----------|--------------|
| **Sigil** | 💜 Violet | Continuous | Lorenz with a cos(wz) gain | 1.36 |
| **Wick** | 🟡 Candle | Continuous | Lorenz with a one-sided \|xy\| pump on z | 1.02 |
| **Cinder** | 🔴 Ember | Continuous | Chua with a tanh diode | 0.73 |
| **Gyre** | 🩵 Teal | Continuous | Dadras scrolls + cos(x) ripple | 0.98 |
| **Moth** | 🩷 Rose | Continuous | Jerk-like flow with a y·tanh(y) thermostat | 0.20 |
| **Tidepool** | 🟢 Sea green | Continuous | Rotation whose radius is dialled by z | 0.28 |
| **Ossuary** | 💜 Lilac | Continuous | Nosé–Hoover + sin(wx) forcing | 0.14 |
| **Ripple** | 🔵 Ice | Discrete | 3D sine/cosine map with a delayed echo | 0.39 / iter |
| **Anvil** | ⚪ Steel | Continuous | Jerk: sin(x) kick vs x³ brake | 0.11 |
| **Reed** | 🟢 Chartreuse | Continuous | Jerk with a √\|x\| restoring force | 0.10 |

### Page 3 — the menagerie (Wave 4)

Not attractors — ten different classes of dynamics, each run through the same tile pipeline. Three of them (Cluster, Murmuration, Colony) are interacting systems, so the point-count buttons change the physics. The engine advances every point once per sub-step before any point advances again, so each body always feels its neighbours' current positions.

| Name | Color | Class | What it is |
|------|-------|-------|------------|
| **Thicket** | 🟢 Leaf | IFS | Chaos game on four 3-D affine maps |
| **Dendrite** | 🩷 Magenta | Complex map | Julia set of z² + c by inverse iteration |
| **Colony** | 🟡 Yellow | Cellular automaton | Langton's ants on a shared torus |
| **Stadium** | 🔵 Pale blue | Billiard | Bunimovich stadium, hard reflections |
| **Pendulum** | 🟠 Orange | Hamiltonian | Double pendulum, RK4, no damping |
| **Cluster** | 🔵 Blue | N-body | The tile's points attract each other |
| **Echo** | 🩵 Teal | Delay equation | Mackey–Glass, delay-embedded |
| **Murmuration** | 💜 Lavender | Agents | Boids in a soft box |
| **Loom** | 🟡 Sand | Quasi-periodic | Three irrational frequencies — the non-chaotic control |
| **Rebound** | 🔴 Red | Impact | Ball on a vibrating plate |

### Page 4 — the forge

Ten flows built rather than found. Each takes a chaotic flow and pushes it through a smooth change of coordinates. The operator is a diffeomorphism of the region the attractor lives in, so the dynamics are conjugate to the base: λ is inherited (the vet confirms it to the second decimal), but the shape is new. All of them are pure ODEs on RK4.

- **n-fold cover** — needs a base symmetric under (x, y, z) → (−x, −y, z). In ζ = x + iy, set ξ = ζ^(2/n); then ξ̇ = (2/n)·ξ^(1−n/2)·ζ̇ and ż is unchanged. The two lobes become n petals (Letellier–Gilmore).
- **twist** — rotate the plane by k·z, so the lobes wind as the orbit climbs.
- **spherical inversion** — p ↦ c + R²(p − c)/|p − c|². Parts near c swell; far parts shrink.

| Name | Color | Base | Operator | λ (measured) |
|------|-------|------|----------|--------------|
| **Trefoil** | 🔴 Coral | Lorenz | 3-fold cover | 0.91 |
| **Starfish** | 🟠 Amber | Lorenz | 5-fold cover | 0.91 |
| **Compass** | 🔵 Periwinkle | Burke–Shaw | 8-fold cover | 0.70 |
| **Lantern** | 🟡 Gold | Chen–Lee | inversion, c = (0, 0, −2), R = 10, seen side-on | 0.14 |
| **Crown** | 🟢 Jade | Rucklidge | 4-fold cover | 0.20 |
| **Conch** | 🔵 Azure | Lorenz | inversion, c = (15, 0, 25), R = 15 (beside one wing) | 0.90 |
| **Lotus** | 🩷 Pink | Shimizu–Morioka | 6-fold cover | 0.063 |
| **Triskele** | 💜 Violet | Four-Wing | 3-fold cover | 0.065 |
| **Quatrefoil** | 🟠 Orange | Chen–Lee | 4-fold cover | 0.13 |
| **Galaxy** | 🩵 Aqua | Rucklidge | 3-fold cover + twist k = 0.3 | 0.20 |

Covers face the camera (`FACE_CAMERA`) so the n-fold symmetry reads from above.

```bash
npm run vet:attractors            # Page 2 only
npm run vet:attractors -- all     # all four pages
```

The script bundles the real TypeScript and steps each system with the same function the render loop uses. It exits 1 if any Page 1, 2 or 4 system is not clearly chaotic (λ ≤ 0.02 fails), or if any page's full ten-point swarm diverges. Page 3 λ values are informational: hidden-state and interacting systems can't be summarised by one plotted point.

## 🏗️ Architecture

```
src/
├── components/
│   ├── TheVoid.tsx            # Composition root — canvas, frame loop, app-level UI state
│   ├── AttractorGrid.tsx      # Overlay loop over attractors
│   ├── AttractorTile.tsx      # Per-attractor frame (title + joystick + panel)
│   ├── ControlPanel.tsx       # Physics/Display grouped controls
│   ├── Joystick.tsx           # Pointer-drag rotation + live needle
│   ├── StatsHUD.tsx           # FPS, point count, energy, phase
│   ├── HelpModal.tsx          # Keyboard shortcut legend
│   ├── Toolbar.tsx            # Global pause/reset/randomize/palette/export/tour/theme
│   ├── InfoTooltip.tsx        # Hover card with equations + metadata
│   ├── TourModal.tsx          # Narrative walkthrough of the active page's attractors
│   ├── IntroOverlay.tsx       # "CLICK TO MERGE" with loading dots
│   ├── PausedOverlay.tsx      # Dimmed pause state
│   ├── AudioPanel.tsx         # Volume + mute for the generative synth
│   ├── ErrorBoundary.tsx      # Readable fallback if canvas fails
│   ├── constants.ts           # Page 1–4 rosters + LAYOUT/CANVAS_STYLE/Z_INDEX/KEYBINDINGS/PERF_PRESETS
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── attractors/
│   │   ├── attractorCalculations.ts  # Classic physics, merged calculator map, advancePoint() (Euler / RK4 + stability guard)
│   │   ├── originalCalculations.ts   # Page 2 — ten original systems
│   │   ├── menagerieCalculations.ts  # Page 3 — ten classes of dynamics (hidden state in WeakMaps)
│   │   ├── forgeCalculations.ts      # Page 4 — cover / twist / inversion operators over symmetric bases
│   │   ├── calculatorTypes.ts        # Delta / AttractorCalculator / StepContext / DrawStyle
│   │   └── attractorInfo.ts          # Equations, Lyapunov, discoverer metadata (all 40)
│   └── utils/
│       ├── colorUtils.ts      # RGB ↔ HSL conversions
│       └── projection.ts      # 3D → 2D isometric projection
├── engine/
│   ├── drawAttractors.ts      # One frame of stepping + drawing, every point once per sub-step
│   ├── trailGrid.ts           # Persistent decaying trail buffer (Float32Array)
│   ├── particleField.ts       # Merge burst, pointer ink, energy budget
│   └── layout.ts              # Responsive tile layout
├── hooks/
│   ├── useAttractorRoster.ts  # Live attractor list + overlay state + per-tile controls
│   ├── useAppShortcuts.ts     # Keyboard map
│   ├── useCanvasRecorder.ts   # WebM recording
│   ├── usePersistentState.ts  # localStorage-backed settings (page, perf mode)
│   ├── useAnimationFrame.ts   # RAF loop with pause support
│   ├── usePointerDrag.ts      # Pointer Events (touch + mouse)
│   ├── useKeyboardShortcuts.ts
│   ├── useTheme.ts            # localStorage + matchMedia theme
│   ├── useFPS.ts              # Rolling FPS counter
│   ├── useBreakpoint.ts       # Responsive mobile/tablet/desktop
│   ├── useAttractorSynth.ts   # Lifecycle + gesture-gated audio start
│   └── useAttractorWorker.ts  # Lifecycle for the physics Web Worker
├── audio/
│   └── AttractorSynth.ts      # Web Audio graph (10 sine voices + filter LFO + compressor)
├── workers/
│   └── attractorWorker.ts     # Off-thread physics (init / step / setParams / setPointCount)
├── utils/
│   ├── themeTokens.ts         # Canvas-facing theme token bridge
│   ├── palettes.ts            # Color palette presets
│   ├── randomParams.ts        # Randomizer bounds
│   └── exportCanvas.ts        # PNG snapshot + WebM recorder
├── App.tsx                    # ErrorBoundary + TheVoid
└── main.tsx
scripts/
└── vet-attractors.mjs         # Lyapunov / bounds / swarm-stability gate for every system (esbuild-bundled TS)
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 (CSS-variable theme) |
| Rendering | HTML5 Canvas 2D |
| Numerics | RK4 (classic flows), forward Euler (originals), in-place iteration (maps) |
| Input | Pointer Events (mouse + touch) |

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, data flow, and type definitions
- [Walkthrough](docs/WALKTHROUGH.md) — Detailed feature guide and usage instructions
- [Changelog](docs/CHANGELOG.md) — Complete development history
- [Chat History](Interactive%20Attractor%20Controls.md) — Full AI conversation log

## 📜 Philosophy

This project explores the boundary between determinism and apparent randomness. Chaotic systems are entirely deterministic — given initial conditions, their trajectory is fixed — yet they exhibit sensitivity to initial conditions that makes long-term prediction impossible.

The "ink" we write with is the observer's attention. The "database" is the mathematical phase-space where all possible states exist simultaneously. Our interaction — adjusting parameters, watching trajectories — is the "flicker" that selects which states manifest visually.

---

*Built with curiosity about the nature of computation and chaos.*
