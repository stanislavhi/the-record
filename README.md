# The Record

> *"If the Database (God) is the atemporal record of all computation, and our thought is the flicker (IS/IS-NOT) that writes to it, what is the color of the ink?"*

An interactive visualization of chaotic attractors — mathematical systems that model deterministic chaos. Watch 10 strange attractors dance through phase-space, each tracing patterns that never repeat yet never escape their bounds.

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

- **10 Chaotic Attractors** — Lorenz, Rossler, Henon, Chua, Sprott, Four-Wing, Rabinovich, Halvorsen, Dadras, Aizawa
- **Real-time 3D Rendering** — Canvas-based simulation with isometric projection
- **Interactive Per-Tile Controls** (visible on hover):
  - 🕹️ **Joystick Rotation** — Drag to rotate X/Y axes
  - 🔍 **Scale Slider** — Zoom in/out
  - ➕➖ **Point Count** — Add or remove simulation points (1–50)
  - ⚡ **Speed Control** — Adjust simulation timestep
  - 🎨 **Color Picker** — Change attractor colors dynamically
  - 🚿 **Flush** — Clear trail history for a tile
- **Multi-point Simulation** — Each attractor runs 10 parallel points with coherent color gradients
- **Persistent Grid Trails** — Colored trails fade over time, creating visual memory

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/StanHizni/the-record.git
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
2. **Hover over any tile** to reveal the control panel
3. **Drag the joystick** to rotate the attractor in 3D space
4. **Adjust sliders** for scale and speed
5. **Click +/−** to add or remove simulation points
6. **Pick a color** to change the attractor's hue
7. **Click Flush** to clear the trail history

## 🧮 The Attractors

| Name | Color | Type | Description |
|------|-------|------|-------------|
| **Lorenz** | ⬜ White | Continuous | The butterfly effect, discovered 1963 |
| **Rössler** | 🟡 Gold | Continuous | Simplest chaotic flow |
| **Hénon** | 🩷 Hot Pink | Discrete | 2D map, scattered point cloud |
| **Chua** | 🟠 Orange | Continuous | Double scroll attractor |
| **Sprott** | 🔵 Cyan | Continuous | Minimal 3D chaotic system |
| **Four-Wing** | 🟢 Green | Continuous | Hyperchaotic, 4 lobes |
| **Rabinovich** | 🩵 Mint | Continuous | Fabrikant system |
| **Halvorsen** | 🩷 Magenta | Continuous | Cyclically symmetric |
| **Dadras** | 💜 Violet | Continuous | 5-parameter system |
| **Aizawa** | 🟠 Amber | Continuous | Toroidal shape |

## 🏗️ Architecture

```
src/
├── components/
│   ├── TheVoid.tsx          # Main canvas & overlay component
│   ├── HUD.tsx              # Heads-up display
│   ├── constants.ts         # Attractor configurations
│   ├── types.ts             # TypeScript interfaces
│   ├── attractors/
│   │   └── attractorCalculations.ts  # Physics calculations
│   └── utils/
│       ├── colorUtils.ts    # RGB/HSL conversions
│       └── projection.ts    # 3D → 2D isometric projection
├── App.tsx
└── main.tsx
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Rendering | HTML5 Canvas |

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
