# Walkthrough: The Record

**The Record** is a conceptual web application that visualizes chaotic attractors—mathematical systems that model deterministic chaos. Each attractor traces patterns through phase-space that never repeat yet never escape their bounds.

## Core Concepts

### The Database (The Void)
- A high-resolution canvas grid (2px cells) that acts as a persistent memory layer
- Grid cells retain color and intensity information that decays slowly over time
- Creates long-exposure light trail effects as attractors move

### The Ink (Energy System)
- Mouse movement spawns "Flicker" particles that travel through the void
- Energy is consumed when creating particles
- Energy regenerates when the user is still

### The Attractors (Chaos Engines)
Ten chaotic systems run simultaneously, each in its own tile:

| Attractor | Color | Characteristics |
|-----------|-------|-----------------|
| Lorenz | White | The butterfly effect |
| Rossler | Gold | Simplest chaotic flow |
| Henon | Magenta | 2D discrete map |
| Chua | Orange | Double scroll |
| Sprott | Cyan | Minimal 3D system |
| Four-Wing | Green | Hyperchaotic, 4 lobes |
| Rabinovich | Teal | Fabrikant system |
| Halvorsen | Pink | Cyclically symmetric |
| Dadras | Purple | 5-parameter system |
| Aizawa | Orange | Toroidal shape |

## Interactive Features

### Per-Attractor Controls
Hover over any tile to reveal the control panel:

1. **Joystick Rotation** — Drag to rotate X/Y axes in 3D
2. **Scale Slider** — Zoom the attractor in/out
3. **Point Count (+/−)** — Add or remove simulation points (1-50)
4. **Speed Slider** — Adjust simulation timestep
5. **Color Picker** — Change the attractor's color dynamically
6. **Flush Button** — Clear all trail history for that tile

### Multi-Point Simulation
Each attractor runs 10 parallel points with analogous color gradients, creating dense trail patterns that visualize the attractor's structure.

## How to Use

1. **Start** — Click anywhere to trigger the "Merge" and start the simulation
2. **Observe** — Watch the 10 attractors weave their patterns
3. **Interact** — Hover over tiles to access controls
4. **Experiment** — Adjust rotation, scale, speed, and colors
5. **Create** — Move your mouse to draw with the particle system

## Technical Implementation

### Rendering Pipeline
- Canvas-based rendering with `requestAnimationFrame`
- Isometric 3D projection (45° Y, 35.26° X camera angles)
- Per-object rotation transforms before camera transform
- Clipping regions prevent attractors from overlapping tiles

### Stability Measures
- Points are reset if they exceed bounds (|x|, |y|, |z| > 1000)
- Speed limits prevent numerical instability (max dt = 0.03)
- Sensitive attractors (like Dadras) have lower base timesteps

### Performance Optimizations
- Grid uses 2px resolution for visual quality
- Trail decay rate of 0.9995 for long persistence
- Sub-stepping (20 steps per frame) for smooth curves
