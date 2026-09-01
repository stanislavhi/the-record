# Architecture — The Record

> **🤖 This project was fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**
>
> See [Interactive Attractor Controls.md](../Interactive%20Attractor%20Controls.md) for the complete conversation log.

## Design Philosophy

The Record embodies a philosophical question:

> *"If the Database (God) is the atemporal record of all computation, and our thought is the flicker (IS/IS-NOT) that writes to it, what is the color of the ink?"*

| Metaphor | Implementation |
|----------|----------------|
| **The Database** | The persistent HDR canvas grid — it remembers everything |
| **The Flicker** | Each point's single-step computation — IS or IS-NOT |
| **The Ink** | The glowing trails left by attractor points on the grid |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 19 | Component architecture, reactive state, hooks |
| Language | TypeScript 5.9 | Type safety across all modules |
| Build Tool | Vite 7 | Fast HMR and production bundling |
| Styling | Tailwind CSS 4 | Utility-first; CSS custom properties drive theming |
| Rendering | HTML5 Canvas 2D | High-performance 2D graphics (no WebGL) |
| Input | Pointer Events | Unified mouse + touch handling |
| Font | JetBrains Mono | Monospace/terminal aesthetic |

---

## Directory Structure

```
the-record/
├── public/
│   ├── favicon.svg               # Custom Lorenz-butterfly favicon
│   └── og-image.png              # Social preview image (1200×630)
├── src/
│   ├── components/
│   │   ├── TheVoid.tsx           # Slim orchestrator — canvas + hooks + handlers
│   │   ├── AttractorGrid.tsx     # Overlay loop
│   │   ├── AttractorTile.tsx     # Per-attractor frame
│   │   ├── ControlPanel.tsx      # Physics/Display grouped controls
│   │   ├── Joystick.tsx          # Pointer-drag rotation + live needle
│   │   ├── StatsHUD.tsx          # FPS / points / energy / phase
│   │   ├── HelpModal.tsx         # Keyboard shortcut legend
│   │   ├── Toolbar.tsx           # Global Pause / Reset / Randomize / Palette / Export / Tour / Theme / Stats / Help
│   │   ├── InfoTooltip.tsx       # Hover card with equations + metadata
│   │   ├── TourModal.tsx         # Narrative walkthrough of the active page's 10 attractors (grid spotlight via dim prop)
│   │   ├── IntroOverlay.tsx      # "CLICK TO MERGE" + loading dots
│   │   ├── PausedOverlay.tsx     # Dimmed pause state
│   │   ├── AudioPanel.tsx        # Mute + volume for the generative synth
│   │   ├── ErrorBoundary.tsx     # Readable canvas-failure fallback
│   │   ├── constants.ts          # Page 1 + Page 2 attractor configs + LAYOUT / CANVAS_STYLE / Z_INDEX / KEYBINDINGS / PERF_PRESETS / USE_WORKER
│   │   ├── types.ts              # Shared TypeScript interfaces
│   │   ├── attractors/
│   │   │   ├── attractorCalculations.ts  # Classic physics + merged calculator map + DISCRETE_TYPES
│   │   │   ├── originalCalculations.ts   # Page 2 — ten systems invented for The Record (Wave 4)
│   │   │   ├── menagerieCalculations.ts  # Page 3 — ten different classes of dynamics, hidden state in WeakMaps (Wave 4)
│   │   │   ├── calculatorTypes.ts        # Delta / AttractorCalculator / StepContext / DrawStyle
│   │   │   └── attractorInfo.ts          # Equations, Lyapunov, discoverer for all 30 (used by InfoTooltip + Tour)
│   │   └── utils/
│   │       ├── colorUtils.ts     # RGB ↔ HSL / hex conversions
│   │       └── projection.ts     # 3D → 2D isometric projection
│   ├── hooks/
│   │   ├── useAnimationFrame.ts  # RAF loop with pause support
│   │   ├── usePointerDrag.ts     # Unified mouse + touch drag
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useTheme.ts           # localStorage + matchMedia
│   │   ├── useFPS.ts             # Rolling FPS counter
│   │   ├── useBreakpoint.ts      # mobile / tablet / desktop
│   │   ├── useAttractorSynth.ts  # Lifecycle + gesture-gated start for AttractorSynth
│   │   └── useAttractorWorker.ts # Lifecycle for the physics Web Worker (USE_WORKER flag)
│   ├── audio/
│   │   └── AttractorSynth.ts     # Master gain → compressor → destination; per-voice osc → filter → panner
│   ├── workers/
│   │   └── attractorWorker.ts    # Off-thread physics; init/step/setParams/setPointCount protocol
│   ├── utils/
│   │   ├── themeTokens.ts        # Canvas-facing token bridge
│   │   ├── palettes.ts           # Color palette presets (6 × 10 RGB)
│   │   ├── randomParams.ts       # Bounded randomizer for color/rot/scale/speed
│   │   └── exportCanvas.ts       # PNG snapshot + CanvasRecorder (WebM, 60 s soft cap, elapsed tracking)
│   ├── App.tsx                   # ErrorBoundary + TheVoid
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles + CSS variables (dark + light)
├── scripts/
│   └── vet-attractors.mjs        # Bundles the real TS via esbuild; measures Lyapunov / bounds / resets per attractor
├── docs/                         # Documentation (+ docs/sessions/ plan + session archive)
├── index.html                    # HTML shell with meta tags
└── vite.config.ts
```

---

## Component Composition

```
App
└─ ErrorBoundary
   └─ TheVoid                     (canvas + animation loop + state)
      ├─ <canvas>                 (absolute, z-canvas)
      ├─ IntroOverlay             (while intro === true)
      ├─ AttractorGrid
      │  └─ AttractorTile[]       (one per attractor)
      │     ├─ Joystick           (uses usePointerDrag)
      │     └─ ControlPanel       (scale / speed / points / color / flush)
      ├─ PausedOverlay            (when paused)
      ├─ StatsHUD                 (when statsVisible)
      ├─ Toolbar                  (global actions, data-no-merge)
      └─ HelpModal                (when helpOpen)
```

The single animation loop lives inside `TheVoid`. All mutable per-frame state is held in refs (`attractors`, `grid`, `gridColors`, `particles`, `energyRef`); UI-reactive state (`overlayItems`, `speeds`, `paused`, `intro`, `phase`) is held in React state and mirrored to refs when the render loop needs to read it without triggering re-renders.

---

## Hooks

| Hook | Responsibility |
|------|---------------|
| `useAnimationFrame` | RAF loop with pause support; reads latest callback via ref |
| `usePointerDrag` | Handles `pointerdown/move/up/cancel` with pointer capture |
| `useKeyboardShortcuts` | Global key listener; ignores input/textarea except `Escape` |
| `useTheme` | `data-theme` attribute on `<html>`, persists to localStorage, honors `prefers-color-scheme` |
| `useFPS` | Rolling FPS sampled every 500 ms |
| `useBreakpoint` | Reports `mobile` / `tablet` / `desktop` on resize |

---

## `TheVoid` State Model

**Refs (frame-safe mutable state — never trigger re-render):**
```typescript
const particles   = useRef<Particle[]>([]);
const grid        = useRef<number[][]>([]);
const gridColors  = useRef<(RGB | null)[][]>([]);
const energyRef   = useRef<number>(100);
const attractors  = useRef<Attractor[]>(initialAttractors);   // replaced wholesale on a page switch
const isIntroRef  = useRef<boolean>(true);
const pausedRef   = useRef<boolean>(false);
const themeRef    = useRef<Theme>('dark');
const pageRef     = useRef<AttractorPage>(page);
```

**React state (drives UI):**
```typescript
const [page, setPage]                 = useState<AttractorPage>(readSavedPage);   // 'classic' | 'original' | 'menagerie'
const [pageTypes, setPageTypes]       = useState<AttractorType[]>([...]);        // feeds the Tour
const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
const [speeds, setSpeeds]             = useState<number[]>([...]);
const [paused, setPaused]             = useState(false);
const [intro, setIntro]               = useState(true);
const [statsVisible, setStatsVisible] = useState(false);
const [helpOpen, setHelpOpen]         = useState(false);
const [phase, setPhase]               = useState('AWAITING MERGE');
const [energyState, setEnergyState]   = useState(100);
```

State and ref are kept in sync via `useEffect(() => { ref.current = state; }, [state])` — this keeps the render loop reading the latest value without touching the ref during render (React 19 rule).

**Page switch (Wave 4).** `handlePageChange(next)` is the one place the attractor list is replaced: it calls `createInitialAttractors(next)`, assigns the result to `attractors.current`, resets `lastFocusedIndexRef`, updates `page` / `pageTypes` / `speeds` / `palette` / `tourIndex` / `phase`, clears the grid via `handleResetAll()`, then calls `resizeCanvas()` to compute fresh tile rects and re-sync the overlay. The render loop never holds a reference to an individual attractor across frames, so swapping the array is safe mid-animation.

---

## `constants.ts`

Attractor configurations plus central config objects:

| Object | Purpose |
|--------|---------|
| `LAYOUT` | Margins, gap, responsive `breakpoints` + column counts |
| `CANVAS_STYLE` | Fade/trail alphas, shadowBlur, intervals, particle settings |
| `Z_INDEX` | `canvas` → `overlay` → `hud` → `toolbar` → `modal` scale |
| `KEYBINDINGS` | Central keycode map (incl. `page1: 'Digit1'`, `page2: 'Digit2'`) |
| `PERF_PRESETS` | low / med / high `{ subSteps, maxPoints, shadowBlur }` (Wave 3) |
| `POINT_LIMITS`, `SPEED_LIMITS`, `SCALE_LIMITS` | Control ranges |
| `createClassicAttractors()` / `createOriginalAttractors()` / `createMenagerieAttractors()` | Page 1 / 2 / 3 rosters (Wave 4) |
| `createInitialAttractors(page)`, `readSavedPage()`, `PAGE_STORAGE_KEY`, `DEFAULT_PAGE`, `PAGE_LABELS` | Page selection, `localStorage` persistence, button titles + Stats phase per page |
| `FACE_CAMERA` | Rotation that cancels the isometric camera, for flat Page 3 systems |

| Rendering constant | Value | Purpose |
|-------------------|-------|---------|
| `GRID_SIZE` | `2` | Pixel size per grid cell |
| `DECAY_RATE` | `0.9995` | Trail fade rate |
| `SUB_STEPS` | `20` | Physics iterations per frame |
| `ENERGY_COST` | `0.5` | Ink cost per user particle |
| `ENERGY_REGEN` | `0.1` | Ink regen per idle frame |

---

## `attractorCalculations.ts`

Stateless physics functions:
```typescript
calculateAttractorStep(type, point, params, ctx?) → { dx, dy, dz }   // ctx = { points, index }
isPointStable(point)                               → boolean
resetPoint(point)                                  → void
getDrawStyle(type)                                 → { mode: 'trail' | 'dots', stepInterval }
isDiscrete(type)                                   → boolean          // mode === 'dots'
```

Each of the 30 `AttractorType` values is one of three shapes: a differential equation (continuous flow, integrated by forward Euler with `dt` baked into the returned delta), a recurrence relation (map — the calculator mutates the point in place and returns a zero delta), or a hidden-state system (Page 3 — also in-place, with its real state in a `WeakMap` keyed by the point object or by the tile's points array). The ten classics live in `attractorCalculations.ts`, the Page 2 originals in `originalCalculations.ts`, the Page 3 menagerie in `menagerieCalculations.ts`; all three are merged into one `calculators` record.

The render loop hands every call a `StepContext` (`{ points: attractor.points, index }`). Interacting systems read their neighbours through it; everything else ignores it.

### `menagerieCalculations.ts` (Page 3)

| Type | Class | State beyond the point |
|------|-------|------------------------|
| `thicket` | iterated function system | none (stochastic map choice) |
| `dendrite` | complex dynamics, inverse iteration | none (random branch of √) |
| `colony` | cellular automaton | ant `{i, j, heading}` per point; 160 × 160 `Uint8Array` lattice per tile |
| `stadium` | billiard | velocity per point |
| `pendulum` | Hamiltonian, RK4 | `{θ₁, θ₂, ω₁, ω₂}` per point |
| `cluster` | N-body, kick–drift | velocity per point; acceleration buffer per tile (recomputed when index 0 steps) |
| `echo` | delay differential equation | 4096-sample ring buffer per point |
| `murmuration` | agents (boids) | velocity per point |
| `loom` | quasi-periodic | phase `t` per point |
| `rebound` | impact oscillator | `{height, velocity, time}` per point |

Because state is keyed by object identity it follows a point through add/remove, is dropped by GC when a page switch discards the array, and never touches `Point3D`.

### `originalCalculations.ts` (Page 2)

| Type | Mechanism | Twist |
|------|-----------|-------|
| `sigil` | Lorenz | gain term `(ρ − z)` → `b·cos(wz)` |
| `wick` | Lorenz | z pump `xy` → `\|xy\|` (one-sided) |
| `cinder` | Chua | piecewise diode → `tanh` saturation |
| `gyre` | Dadras | `+ k·cos(x)` ripple on dz |
| `moth` | jerk-like | thermostat `b − a·y·tanh(y) − cz` |
| `tidepool` | rotation + radial pumping | radius set by `z − d·r²`, z drained by `x²`, fed by `e·y` |
| `ossuary` | Nosé–Hoover | `+ k·sin(wx)` forcing on dy |
| `ripple` | discrete map | sine/cosine folds with a delayed `z = e·sin(x)` echo |
| `anvil` | jerk | `k·sin(x)` kick vs `b·x³` brake |
| `reed` | jerk | square-root restoring force `k·sgn(x)√\|x\|` |

Parameters, scales and `center` offsets come from `scripts/vet-attractors.mjs`, which bundles these files with esbuild and integrates each system the way the render loop does. Run `npm run vet:attractors` after touching any coefficient.

---

## `projection.ts`

```
[x, y, z]
   → subtract attractor.center (if set — keeps off-origin orbits in the tile)
   → rotate by attractor.rotation (Euler X/Y/Z)
   → apply global isometric camera (45° Y, 35.26° X)
   → scale by attractor.scale
   → translate by attractor.offset + canvas center
   → [px, py]
```

---

## Theming

CSS custom properties drive all theme-sensitive values. Tailwind's color tokens map to variables, so `bg-void` and `text-ink-high` follow the active theme automatically.

```css
:root[data-theme="dark"]  {
  --color-void: #0a0a0a;
  --color-ink-high: #00f3ff;
  --color-ink-low: #ff0055;
  --color-grid: #1a1a1a;
  --color-panel: rgba(5, 5, 5, 0.9);
  --color-border: rgba(255, 255, 255, 0.08);
}
:root[data-theme="light"] {
  --color-void: #f5f5f5;
  --color-ink-high: #0044ff;
  --color-ink-low: #c2185b;
  --color-grid: #e0e0e0;
  --color-panel: rgba(255, 255, 255, 0.92);
  --color-border: rgba(0, 0, 0, 0.08);
}
```

The canvas cannot read Tailwind classes directly, so `utils/themeTokens.ts` exposes a `getThemeTokens(theme)` helper that returns per-theme canvas values (`fadeAlpha`, `trailAlpha`, `glow`, `gridIntensity`). The render loop calls this each frame via `themeRef.current`.

---

## Rendering Pipeline

```
┌──────────────────────────────────────────────────────────┐
│               requestAnimationFrame                        │
├──────────────────────────────────────────────────────────┤
│  0. If paused → schedule next frame, return               │
│  1. tickFPS() — rolling sample                            │
│  2. Partial clear using theme fadeAlpha                   │
│  3. If intro → schedule next frame, return                │
│  4. Regenerate energy                                     │
│  5. For each attractor (10):                              │
│     a. strokeRect border + ctx.clip() the tile            │
│     b. For each point:                                    │
│        ├─ SUB_STEPS physics sub-steps                    │
│        ├─ project() → canvas coords                      │
│        ├─ draw line segment with theme glow              │
│        └─ boost grid cell intensity + color              │
│     c. ctx.restore()                                      │
│  6. Spawn particles on pointer movement                   │
│  7. Decay + paint grid cells (colored fading trails)      │
│  8. Render particles with glow                            │
│  9. Schedule next frame                                   │
└──────────────────────────────────────────────────────────┘
```

---

## Type Definitions

```typescript
interface Attractor {
    type: AttractorType;
    points: Point3D[];
    color: RGB;
    params: AttractorParams;    // dt + attractor-specific keys
    scale: number;
    offset: { x: number; y: number };
    rotation?: Rotation3D;
    rect?: Rect;
    center?: Rotation3D;        // attractor-space point placed at the tile centre (Wave 4)
}

interface Point3D  { x: number; y: number; z: number; color: RGB; }
interface RGB       { r: number; g: number; b: number; }
interface Rotation3D { x: number; y: number; z: number; }

type ClassicAttractorType =
    'lorenz' | 'rossler' | 'henon' | 'chua' | 'sprott' |
    'four_wing' | 'rabinovich' | 'halvorsen' | 'dadras' | 'aizawa';
type OriginalAttractorType =
    'sigil' | 'wick' | 'cinder' | 'gyre' | 'moth' |
    'tidepool' | 'ossuary' | 'ripple' | 'anvil' | 'reed';
type MenagerieAttractorType =
    'thicket' | 'dendrite' | 'colony' | 'stadium' | 'pendulum' |
    'cluster' | 'echo' | 'murmuration' | 'loom' | 'rebound';
type AttractorType = ClassicAttractorType | OriginalAttractorType | MenagerieAttractorType;
type AttractorPage = 'classic' | 'original' | 'menagerie';

interface StepContext { points: Point3D[]; index: number; }        // Wave 4
interface DrawStyle   { mode: 'trail' | 'dots'; stepInterval: number; }

interface OverlayItem {
    index: number;
    type: AttractorType;
    rect: Rect;
    rotation: Rotation3D;
    color: RGB;
    scale: number;
    pointCount: number;
}

type Theme     = 'dark' | 'light';
type PerfMode  = 'low' | 'med' | 'high';
```

---

## Wave Roadmap

| Wave | Scope | Status |
|------|-------|--------|
| Wave 1 | Component split / hooks / toolbar / themes / keyboard / touch | Shipped |
| Wave 2 | Randomizer / palettes / PNG + WebM / info tooltips / narrative tour / light theme tuning | Shipped |
| Wave 3 | Audit fixes / generative audio synth / performance-mode preset / Web Worker scaffold | Shipped (worker gated off by `USE_WORKER`) |
| Wave 4 | Page 2 — ten original attractors; Page 3 — the menagerie (ten classes of dynamics); three-way page control; vetting script; `center`, `StepContext`, `DrawStyle` generalisation | Shipped |
| Later | Worker draw-pipeline swap (+ re-init on page switch) / `useAttractorSimulation` extraction / integrator pass for Page 1 systems that go periodic under Euler | Pending |
