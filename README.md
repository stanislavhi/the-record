# The Record

> *"If the Database (God) is the atemporal record of all computation, and our thought is the flicker (IS/IS-NOT) that writes to it, what is the color of the ink?"*

An interactive visualization of chaotic attractors—mathematical systems that model deterministic chaos. Watch 10 strange attractors dance through phase-space, each tracing patterns that never repeat yet never escape their bounds.

![The Record](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple)

> **🤖 Fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**

## ✨ Features

- **10 Chaotic Attractors** — Lorenz, Rossler, Henon, Chua, Sprott, Four-Wing, Rabinovich, Halvorsen, Dadras, Aizawa
- **Real-time 3D Rendering** — Canvas-based simulation with isometric projection
- **Interactive Controls** (per attractor):
  - 🕹️ **Joystick Rotation** — Drag to rotate X/Y axes
  - 🔍 **Scale Slider** — Zoom in/out
  - ➕➖ **Point Count** — Add or remove simulation points (1-50)
  - ⚡ **Speed Control** — Adjust simulation timestep
  - 🎨 **Color Picker** — Change attractor colors dynamically
  - 🚿 **Flush Button** — Clear trail history for a tile
- **Multi-point Simulation** — Each attractor runs 10 parallel points with color gradients
- **Grid Trail Persistence** — Colored trails fade over time, creating visual memory

## 📸 Preview

The visualization displays a 5×2 grid of attractors, each with its own control panel that appears on hover.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/the-record.git
cd the-record

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
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

## 🏗️ Architecture

```
src/
├── components/
│   ├── TheVoid.tsx          # Main canvas & overlay component
│   ├── HUD.tsx              # Heads-up display (optional)
│   ├── constants.ts         # Attractor configurations
│   ├── types.ts             # TypeScript interfaces
│   ├── attractors/
│   │   └── attractorCalculations.ts  # Physics calculations
│   └── utils/
│       ├── colorUtils.ts    # RGB/HSL conversions
│       └── projection.ts    # 3D to 2D projection
├── App.tsx
└── main.tsx
```

## 🧮 The Attractors

| Name | Type | Description |
|------|------|-------------|
| **Lorenz** | Continuous | The butterfly effect, discovered 1963 |
| **Rossler** | Continuous | Simplest chaotic flow |
| **Henon** | Discrete | 2D map, scattered point cloud |
| **Chua** | Continuous | Double scroll attractor |
| **Sprott** | Continuous | Minimal 3D chaotic system |
| **Four-Wing** | Continuous | Hyperchaotic, 4 lobes |
| **Rabinovich** | Continuous | Fabrikant system |
| **Halvorsen** | Continuous | Cyclically symmetric |
| **Dadras** | Continuous | 5-parameter system |
| **Aizawa** | Continuous | Toroidal shape |

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, data flow, and type definitions
- [Walkthrough](docs/WALKTHROUGH.md) — Detailed feature guide and usage instructions
- [Changelog](docs/CHANGELOG.md) — Complete development history
- [Chat History](Interactive%20Attractor%20Controls.md) — Full AI conversation log

## 🛠️ Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS 4** — Styling
- **HTML5 Canvas** — Rendering

## 📜 Philosophy

This project explores the boundary between determinism and apparent randomness. Chaotic systems are entirely deterministic—given initial conditions, their trajectory is fixed—yet they exhibit sensitivity to initial conditions that makes long-term prediction impossible.

The "ink" we write with is the observer's attention. The "database" is the mathematical phase-space where all possible states exist simultaneously. Our interaction—adjusting parameters, watching trajectories—is the "flicker" that selects which states manifest visually.

---

*Built with curiosity about the nature of computation and chaos.*
