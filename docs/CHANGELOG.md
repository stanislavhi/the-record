# Changelog — The Record

> **🤖 This project was fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**
>
> See [Interactive Attractor Controls.md](../Interactive%20Attractor%20Controls.md) for the complete conversation log.

All notable changes to **The Record**, in reverse chronological order.

---

## [1.2.0] — 2026-04-17 — Wave 1: Refactor + Visual Polish + UX Reach

A large foundational pass on `claude/refactor-visual-improvements-cP2Sr`. Splits the 533-line `TheVoid.tsx` monolith into focused components and hooks, rebuilds the control surface, adds a global toolbar, keyboard shortcuts, touch support, a stats HUD, a help modal, and a full dark/light CSS-variable theme.

### Added
- **Component split** — `AttractorGrid.tsx`, `AttractorTile.tsx`, `ControlPanel.tsx`, `Joystick.tsx`, `StatsHUD.tsx`, `HelpModal.tsx`, `Toolbar.tsx`, `IntroOverlay.tsx`, `PausedOverlay.tsx`, `ErrorBoundary.tsx`
- **Custom hooks** — `useAnimationFrame` (RAF with pause), `usePointerDrag` (Pointer Events), `useKeyboardShortcuts`, `useTheme` (localStorage + `prefers-color-scheme`), `useFPS` (rolling 500 ms window), `useBreakpoint` (2 / 3 / 5 column responsive grid)
- **Global toolbar** — Pause, Reset All, Theme toggle, Stats toggle, Help, anchored to the bottom center and excluded from the canvas merge handler
- **Keyboard shortcuts** — `Space` pause, `Esc` reset all, `?`/`H` help, `S` stats, `T` theme
- **Touch support** — Pointer Events across joystick and canvas click; joystick uses `setPointerCapture` and window-level listeners for robust drag tracking
- **Stats HUD** — FPS / total points / energy bar / phase indicator, resurrected from the old `HUD.tsx` and toggleable
- **Help modal** — Keyboard shortcut legend with `<kbd>` styling
- **Paused overlay** — Dim scrim + PAUSED badge when the simulation is paused
- **Loading state** — Three pulsing dots on the "CLICK TO MERGE" intro
- **Joystick needle** — Rotating angle indicator + knob tilt for visual feedback
- **Error boundary** — "RECORD CORRUPTED" fallback with reload button around the canvas
- **Dark + light themes** — CSS custom properties on `:root[data-theme="..."]`, Tailwind colors mapped to the variables, canvas reads tokens via `getThemeTokens()` on every frame
- **Typography + z-index tokens** — `label`/`value`/`title` fontSize scale in `tailwind.config.js` and a named `zIndex` scale (`canvas`/`overlay`/`hud`/`toolbar`/`modal`)
- **Config objects** — `LAYOUT`, `CANVAS_STYLE`, `Z_INDEX`, `KEYBINDINGS`, `PERF_PRESETS`, `POINT_LIMITS`, `SPEED_LIMITS`, `SCALE_LIMITS` in `constants.ts`
- **Scaffolded utilities (Wave 2/3)** — `utils/palettes.ts` (6 palette presets), `utils/randomParams.ts` (bounded randomizer), `utils/exportCanvas.ts` (PNG snapshot + `CanvasRecorder`), `attractors/attractorInfo.ts` (equations, Lyapunov, discoverer metadata for all 10 attractors)

### Changed
- **`TheVoid.tsx`** — Rewritten as a slim orchestrator (~440 lines vs. 533), now just holds refs/state and wires hooks + handlers
- **`App.tsx`** — Reduced to `<ErrorBoundary><TheVoid /></ErrorBoundary>`; removed `hudRef` prop drilling
- **Rendering pipeline** — Reads theme tokens per frame, short-circuits on pause/intro, drives FPS tick
- **State model** — Replaced `forceUpdate` anti-pattern with proper state + ref syncing via `useEffect`
- **`tailwind.config.js`** — Colors now reference CSS variables (`var(--color-void)` etc.); added `fontSize`, `zIndex`, and `transitionProperty.base` tokens
- **`src/index.css`** — Added `:root[data-theme="dark"]` / `[data-theme="light"]` variable blocks, `@keyframes pulse-dot`, `@keyframes fade-in`, styled range and color inputs with hover scale

### Removed
- **`src/components/HUD.tsx`** — Deleted; functionality moved to `StatsHUD.tsx`
- **Dead `AttractorType` entries** — `tsucs`, `thomas`, `chen` pruned from `types.ts` and their calculators removed from `attractorCalculations.ts`
- **`MouseState` type** — No longer referenced after the hook refactor
- **`forceUpdate` anti-pattern** — Replaced with idiomatic state updates

### Fixed
- React 19 `react-hooks/refs` violation in `useAnimationFrame.ts` — ref syncing moved inside `useEffect`
- React 19 `react-hooks/purity` violation in `useFPS.ts` — `performance.now()` no longer called during render
- React 19 `react-hooks/refs` violation when initializing state from a ref — `initialAttractors` snapshot drives both the ref and the derived `speeds` state

### Notes
- Wave 2 (info tooltips, narrative tour, randomizer + palette presets, PNG/WebM export, light-theme glow tuning) and Wave 3 (generative audio synth, performance-mode toggle, Web Worker physics offload) are scaffolded but not yet wired.

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
