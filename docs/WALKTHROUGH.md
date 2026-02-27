# Walkthrough — The Record

> **🤖 This project was fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**
>
> See [Interactive Attractor Controls.md](../Interactive%20Attractor%20Controls.md) for the complete conversation log.

**The Record** is an interactive visualization of 10 chaotic attractors — mathematical systems that trace infinite, never-repeating paths through phase-space. Every line you see is a deterministic equation being computed in real time.

---

## Getting Started

1. Open the app — you'll see a pulsing **"CLICK TO MERGE"** prompt
2. **Click anywhere** to trigger the merge and start all 10 simulations
3. The attractors immediately begin tracing their paths

---

## The Attractors

Ten chaos engines run simultaneously in a 5×2 grid, each isolated in its own tile:

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

Each attractor runs **10 parallel points** with a coherent HSL color gradient (±2% hue shift per point), creating dense layered trails that reveal the attractor's full structure over time.

---

## Interactive Controls

**Hover over any tile** to reveal its control panel:

### 🕹️ Joystick Rotation
- Click and drag on the circular joystick
- **Horizontal drag** → rotates on the Y-axis
- **Vertical drag** → rotates on the X-axis
- Lets you explore the attractor's 3D structure from any angle

### 🔍 Scale Slider
- Zooms the attractor in or out within its tile
- Range: 0.1× to 100×

### ➕➖ Point Count
- **+** adds a simulation point (max 50)
- **−** removes one (min 1)
- More points → denser trails, higher CPU load

### ⚡ Speed Slider
- Controls the physics timestep (`dt`)
- Faster = more motion per frame, but some attractors become unstable at high speeds
- Capped conservatively per attractor to prevent divergence

### 🎨 Color Picker
- Changes the attractor's base color
- The 10-point gradient is recomputed live from the new hue
- Trail history retains the old color until it fades

### 🚿 Flush
- Clears all grid trail history for that tile
- Instant clean slate — useful when the grid gets saturated

---

## The Grid (The Database)

Behind every attractor is a persistent **2px-resolution grid**. As attractor points pass through a cell, its intensity and color are recorded. Cells decay slowly (`DECAY_RATE = 0.9995`) — about 1,400 frames to reach half-brightness at 60fps — creating "long-exposure" light paintings.

This persistent layer is what the project calls *The Database*: an atemporal record of all prior computation.

---

## The Particles (Your Ink)

Moving your mouse after the merge spawns **ink particles** that drift through the void and write to the grid. You have an energy budget (100 units) that depletes as you draw and regenerates when you stay still.

---

## Projection & Camera

All attractors are rendered with a fixed **isometric camera** (45° Y, 35.26° X). The joystick applies local rotation *before* this global transform, so you're always orbiting around the isometric axis.

---

## Performance Notes

- Grid uses 2px cells for maximum visual fidelity
- 20 physics sub-steps per frame for smooth curves
- Canvas clipping prevents attractors from drawing outside their tile
- Points that diverge (|x|, |y|, or |z| > 1000) auto-reset to origin
