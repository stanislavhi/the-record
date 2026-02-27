# Changelog — The Record

> **🤖 This project was fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**
>
> See [Interactive Attractor Controls.md](../Interactive%20Attractor%20Controls.md) for the complete conversation log.

All notable changes to **The Record**, in reverse chronological order.

---

## [1.1.0] — 2026-02-27 — Repo Polish

### Added
- `public/og-image.png` — Generated 1200×630 hero image for GitHub social preview
- `public/favicon.svg` — Custom Lorenz-butterfly SVG favicon (cyan accent, dark background)
- Open Graph + Twitter Card meta tags in `index.html`
- Proper page title: *"The Record — Chaotic Attractor Visualizer"*

### Changed
- `README.md` — Embedded hero image, richer badges, attractor color table, tech stack table, fixed clone URL
- `Interactive Attractor Controls.md` — New structured header: project overview, attractor roster, and development milestone timeline
- `docs/ARCHITECTURE.md` — Comprehensive rewrite with updated directory tree, rendering pipeline, type definitions
- `docs/WALKTHROUGH.md` — Expanded per-control docs, "what to look for" per attractor, grid/particle explanations
- `docs/CHANGELOG.md` — Restructured into semantic versioning format

---

## [1.0.0] — 2025-12-06 — Initial Release

### Foundation
- Scaffolded with Vite 7 + React 19 + TypeScript 5.9 + Tailwind CSS 4
- `JetBrains Mono` font, dark void color palette (`#0a0a0a` background, `#00f3ff` accent)
- HTML5 Canvas rendering loop with `requestAnimationFrame`

### Attractor Engine
- Implemented 10 chaotic attractors: Lorenz, Rössler, Hénon, Chua, Sprott, Four-Wing, Rabinovich-Fabrikant, Halvorsen, Dadras, Aizawa
- Extracted physics to `attractorCalculations.ts` (pure functions, no side effects)
- Auto-reset for diverging points (guard against NaN/Infinity)
- 20 physics sub-steps per frame for smooth continuous curves

### Rendering
- **5×2 tiled grid** — each attractor isolated in a clipped rectangular tile
- **Isometric projection** — global 45° camera via `projection.ts`
- **Coherent color gradients** — 10-point HSL swarms per attractor (+0.02 hue shift per point)
- **Persistent grid trails** — 2px HDR grid with `DECAY_RATE = 0.9995`
- **Glow effects** — `shadowBlur` on all trail lines
- **Intro sequence** — "CLICK TO MERGE" pulse before simulation starts
- **Particle system** — Mouse-driven ink particles that write to the grid

### Interactive Controls (per tile, on hover)
- **Joystick** — Drag to rotate attractor on X/Y axes in 3D
- **Scale slider** — Zoom (0.1× – 100×)
- **Point count** — Add/remove simulation points (+/−, 1–50 range)
- **Speed slider** — Adjust physics timestep with per-attractor stability cap
- **Color picker** — Real-time base color change with live gradient recalculation
- **Flush button** — Clear grid trail history for a single tile

### Code Architecture
- `TheVoid.tsx` — Main canvas + React overlay, animation loop, event handlers
- `HUD.tsx` — Heads-up display (implemented but currently hidden)
- `constants.ts` — All attractor configurations and rendering constants
- `types.ts` — Shared `Attractor`, `Point`, `Particle`, `RGB`, `OverlayItem` interfaces
- `attractors/attractorCalculations.ts` — Physics step functions
- `utils/colorUtils.ts` — RGB ↔ HSL conversions
- `utils/projection.ts` — 3D → 2D transform chain

### Documentation
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/WALKTHROUGH.md`
- `docs/CHANGELOG.md`
- `Interactive Attractor Controls.md` — Full AI conversation log
