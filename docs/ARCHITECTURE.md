# Architecture: The Record

## Design Philosophy

The Record embodies the philosophical question: *"If the Database is the atemporal record of all computation, and our thought is the flicker that writes to it, what is the color of the ink?"*

- **The Database** — A persistent, reacting grid that remembers
- **The Ink** — Energy expended by the user to change state
- **The Flicker** — The transient nature of interaction

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 19 | Component architecture, state management |
| Language | TypeScript 5.9 | Type safety |
| Build | Vite 7 | Fast development and bundling |
| Styling | Tailwind CSS 4 | Utility-first styling |
| Rendering | HTML5 Canvas | High-performance 2D graphics |

## Directory Structure

```
src/
├── components/
│   ├── TheVoid.tsx              # Main canvas & overlay component
│   ├── HUD.tsx                  # Heads-up display (optional)
│   ├── constants.ts             # Attractor configurations
│   ├── types.ts                 # TypeScript interfaces
│   ├── attractors/
│   │   └── attractorCalculations.ts  # Physics calculations per attractor
│   └── utils/
│       ├── colorUtils.ts        # RGB ↔ HSL conversions
│       └── projection.ts        # 3D → 2D isometric projection
├── App.tsx                      # Root component
├── main.tsx                     # Entry point
└── index.css                    # Global styles
```

## Core Components

### TheVoid.tsx
The main component handling:
- Canvas setup and animation loop
- Grid state (2D array of intensity values)
- Attractor physics simulation
- Interactive overlay rendering
- Mouse/touch input handling

**Key State:**
```typescript
const grid = useRef<number[][]>([]);           // Intensity values
const gridColors = useRef<(RGB | null)[][]>([]); // Color per cell
const attractors = useRef<Attractor[]>([]);    // Active attractors
const particles = useRef<Particle[]>([]);      // User-spawned particles
const energy = useRef<number>(100);            // Available ink
```

### constants.ts
Defines all attractor configurations:
- Initial positions
- System parameters (sigma, rho, beta, etc.)
- Default scales and rotations
- Color assignments

### attractorCalculations.ts
Pure functions for computing attractor dynamics:
```typescript
calculateAttractorStep(type, point, params) → { dx, dy, dz }
isPointStable(point) → boolean
resetPoint(point) → void
```

### projection.ts
3D to 2D projection with:
- Per-object rotation (X, Y, Z Euler angles)
- Global isometric camera (45° Y, 35.26° X)
- Scale and offset transforms

## Rendering Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Animation Frame                           │
├─────────────────────────────────────────────────────────────┤
│  1. Clear canvas (partial: rgba(10,10,10,0.35))             │
│  2. For each attractor:                                      │
│     a. Set clipping region (tile bounds)                    │
│     b. For each point (10 per attractor):                   │
│        - Calculate 20 sub-steps                             │
│        - Project 3D → 2D                                    │
│        - Draw line segments                                 │
│        - Update grid cells                                  │
│     c. Restore clipping                                     │
│  3. Render grid (colored cells with intensity)              │
│  4. Render particles (user-spawned)                         │
│  5. Request next frame                                       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input (mouse/touch)
        ↓
   TheVoid.tsx
        ↓
┌───────┴───────┐
│               │
Particles    Attractors
(user ink)   (chaos engines)
│               │
└───────┬───────┘
        ↓
     Grid State
   (The Database)
        ↓
   Canvas Render
```

## Type Definitions

```typescript
interface Attractor {
    type: AttractorType;
    points: Point[];
    color: RGB;
    params: Record<string, number>;
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

interface RGB {
    r: number;
    g: number;
    b: number;
}
```

## Configuration Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `GRID_SIZE` | 2 | Pixel size of grid cells |
| `DECAY_RATE` | 0.9995 | How fast grid intensity fades |
| `SUB_STEPS` | 20 | Physics steps per frame |
| `ENERGY_COST` | 0.5 | Ink cost per particle |
| `ENERGY_REGEN` | 0.1 | Ink regen per frame |

## Future Considerations

- **Web Workers** — Move physics to worker thread for better performance
- **WebGL** — GPU-accelerated rendering for larger simulations
- **Audio** — Generative sound based on attractor states
- **Persistence** — Save/load grid and attractor configurations
