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
│   │   ├── TourModal.tsx         # Narrative walkthrough of all 10 attractors
│   │   ├── IntroOverlay.tsx      # "CLICK TO MERGE" + loading dots
│   │   ├── PausedOverlay.tsx     # Dimmed pause state
│   │   ├── ErrorBoundary.tsx     # Readable canvas-failure fallback
│   │   ├── constants.ts          # Attractor configs + LAYOUT / CANVAS_STYLE / Z_INDEX / KEYBINDINGS / PERF_PRESETS
│   │   ├── types.ts              # Shared TypeScript interfaces
│   │   ├── attractors/
│   │   │   ├── attractorCalculations.ts  # Physics per type
│   │   │   └── attractorInfo.ts          # Equations, Lyapunov, discoverer (used by InfoTooltip + Tour)
│   │   └── utils/
│   │       ├── colorUtils.ts     # RGB ↔ HSL / hex conversions
│   │       └── projection.ts     # 3D → 2D isometric projection
│   ├── hooks/
│   │   ├── useAnimationFrame.ts  # RAF loop with pause support
│   │   ├── usePointerDrag.ts     # Unified mouse + touch drag
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useTheme.ts           # localStorage + matchMedia
│   │   ├── useFPS.ts             # Rolling FPS counter
│   │   └── useBreakpoint.ts      # mobile / tablet / desktop
│   ├── utils/
│   │   ├── themeTokens.ts        # Canvas-facing token bridge
│   │   ├── palettes.ts           # Color palette presets (6 × 10 RGB)
│   │   ├── randomParams.ts       # Bounded randomizer for color/rot/scale/speed
│   │   └── exportCanvas.ts       # PNG snapshot + CanvasRecorder (WebM)
│   ├── App.tsx                   # ErrorBoundary + TheVoid
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles + CSS variables (dark + light)
├── docs/                         # Documentation
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
const attractors  = useRef<Attractor[]>(initialAttractors);
const isIntroRef  = useRef<boolean>(true);
const pausedRef   = useRef<boolean>(false);
const themeRef    = useRef<Theme>('dark');
```

**React state (drives UI):**
```typescript
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

---

## `constants.ts`

Attractor configurations plus central config objects:

| Object | Purpose |
|--------|---------|
| `LAYOUT` | Margins, gap, responsive `breakpoints` + column counts |
| `CANVAS_STYLE` | Fade/trail alphas, shadowBlur, intervals, particle settings |
| `Z_INDEX` | `canvas` → `overlay` → `hud` → `toolbar` → `modal` scale |
| `KEYBINDINGS` | Central keycode map |
| `PERF_PRESETS` | low / med / high `{ subSteps, maxPoints, shadowBlur }` (Wave 3) |
| `POINT_LIMITS`, `SPEED_LIMITS`, `SCALE_LIMITS` | Control ranges |

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
calculateAttractorStep(type, point, params) → { dx, dy, dz }
isPointStable(point)                         → boolean
resetPoint(point)                            → void
```

Each of the 10 `AttractorType` values maps to either differential equations (continuous flow) or a recurrence relation (discrete — Hénon).

---

## `projection.ts`

```
[x, y, z]
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
}

interface Point3D  { x: number; y: number; z: number; color: RGB; }
interface RGB       { r: number; g: number; b: number; }
interface Rotation3D { x: number; y: number; z: number; }

type AttractorType =
    'lorenz' | 'rossler' | 'henon' | 'chua' | 'sprott' |
    'four_wing' | 'rabinovich' | 'halvorsen' | 'dadras' | 'aizawa';

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

## Wave 2 / Wave 3 Roadmap

Bringing up the scaffolding for later work that is not yet wired in:

| Module | Purpose | Status |
|--------|---------|--------|
| `utils/palettes.ts` | Neon / pastel / mono / warm / cold color palette presets | Scaffolded |
| `utils/randomParams.ts` | Bounded random color / rotation / scale / speed | Scaffolded |
| `utils/exportCanvas.ts` | `snapshotPNG` + `CanvasRecorder` (WebM via `MediaRecorder`) | Scaffolded |
| `components/attractors/attractorInfo.ts` | Equations, Lyapunov exponents, discoverers | Content ready |
| Wave 2 | Randomizer / palettes / PNG + WebM / info tooltips / narrative tour / light theme tuning | Pending |
| Wave 3 | Generative audio synth / performance-mode preset / Web Worker physics | Pending |
