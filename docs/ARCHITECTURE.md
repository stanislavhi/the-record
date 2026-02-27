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
| UI Framework | React 19 | Component architecture, reactive state |
| Language | TypeScript 5.9 | Type safety across all modules |
| Build Tool | Vite 7 | Fast HMR and production bundling |
| Styling | Tailwind CSS 4 | Utility-first, PostCSS-based |
| Rendering | HTML5 Canvas | High-performance 2D graphics (no WebGL) |
| Font | JetBrains Mono | Monospace/terminal aesthetic |

---

## Directory Structure

```
the-record/
├── public/
│   ├── favicon.svg           # Custom Lorenz-butterfly favicon
│   └── og-image.png          # Social preview image (1200×630)
├── src/
│   ├── components/
│   │   ├── TheVoid.tsx        # Main canvas & React overlay
│   │   ├── HUD.tsx            # Heads-up display (currently off)
│   │   ├── constants.ts       # Attractor configurations & constants
│   │   ├── types.ts           # Shared TypeScript interfaces
│   │   ├── attractors/
│   │   │   └── attractorCalculations.ts  # Physics per type
│   │   └── utils/
│   │       ├── colorUtils.ts  # RGB ↔ HSL conversions
│   │       └── projection.ts  # 3D → 2D isometric projection
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles & CSS variables
├── docs/                      # Documentation
├── index.html                 # HTML shell with full meta tags
└── vite.config.ts
```

---

## Core Components

### `TheVoid.tsx`
The central component — runs the animation loop, manages all state, and renders both the canvas and the React overlay (controls).

**Refs (frame-safe mutable state):**
```typescript
const grid        = useRef<number[][]>([]);         // Cell intensity [0–1]
const gridColors  = useRef<(RGB | null)[][]>([]);   // Cell color
const attractors  = useRef<Attractor[]>([]);         // All 10 attractors
const particles   = useRef<Particle[]>([]);          // User ink particles
const energy      = useRef<number>(100);             // Remaining ink energy
```

**React state (triggers re-renders):**
```typescript
const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
const [, forceUpdate] = useState(0); // Used after point add/remove
```

---

### `constants.ts`
All attractor configurations and rendering constants:

| Constant | Value | Purpose |
|----------|-------|---------|
| `GRID_SIZE` | `2` | Pixel size per grid cell (HD mode) |
| `DECAY_RATE` | `0.9995` | How slowly trail intensity fades |
| `SUB_STEPS` | `20` | Physics iterations per animation frame |
| `ENERGY_COST` | `0.5` | Ink cost per user particle |
| `ENERGY_REGEN` | `0.1` | Ink regen per idle frame |

---

### `attractorCalculations.ts`
Stateless physics functions:
```typescript
calculateAttractorStep(type, point, params) → { dx, dy, dz }
isPointStable(point)                        → boolean
resetPoint(point)                           → void
```
Each attractor type maps to a set of differential equations (continuous) or a recurrence relation (discrete, e.g. Hénon).

---

### `projection.ts`
Converts a 3D attractor point into 2D canvas coordinates:

```
[x, y, z]
   → rotate by attractor.rotation (Euler X/Y/Z)
   → apply global isometric camera (45° Y, 35.26° X)
   → scale by attractor.scale
   → translate by attractor.offset + canvas center
   → [px, py]
```

---

### `colorUtils.ts`
Three conversion helpers: `rgbToHsl`, `hslToRgb`, `rgbToHex`, `hexToRgb`.
Used to generate the coherent HSL gradient swarms (±0.02 hue shift per point).

---

## Rendering Pipeline

```
┌──────────────────────────────────────────────────────────┐
│                    requestAnimationFrame                   │
├──────────────────────────────────────────────────────────┤
│  1. Partial clear — rgba(10,10,10, 0.35)                  │
│  2. For each attractor (10 total):                        │
│     a. strokeRect border + beginPath clip                 │
│     b. For each point (10 per attractor):                 │
│        ├─ 20 sub-steps of physics                        │
│        ├─ project() → canvas coords                      │
│        ├─ draw line segment with glow (shadowBlur)        │
│        └─ increment grid cell at projected position       │
│     c. ctx.restore() (remove clip)                        │
│  3. Decay & paint grid cells (colored fading trails)      │
│  4. Render user particles (ink)                           │
│  5. Loop                                                  │
└──────────────────────────────────────────────────────────┘
```

---

## Type Definitions

```typescript
interface Attractor {
    type: AttractorType;
    points: Point[];
    color: RGB;
    params: Record<string, number>;  // sigma, rho, beta, dt, etc.
    scale: number;
    offset: { x: number; y: number };
    rotation?: { x: number; y: number; z: number };
    rect?: { x: number; y: number; w: number; h: number };
}

interface Point {
    x: number;
    y: number;
    z: number;
    color: RGB;
}

type AttractorType =
    'lorenz' | 'rossler' | 'henon' | 'chua' | 'sprott' |
    'four_wing' | 'rabinovich' | 'halvorsen' | 'dadras' | 'aizawa';
```

---

## Future Considerations

- **Web Workers** — Off-thread physics for smoother frame rates
- **WebGL / WebGPU** — GPU-accelerated rendering for larger point counts
- **Audio** — Generative sound tied to attractor state variables
- **Persistence** — Save/restore attractor configurations via URL hash or localStorage
- **Touch Support** — Joystick and controls adapted for mobile
