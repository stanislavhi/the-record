# Changelog — The Record

> **🤖 This project was fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**
>
> See [Interactive Attractor Controls.md](../Interactive%20Attractor%20Controls.md) for the complete conversation log.

All notable changes to **The Record**, in reverse chronological order.

---

## [1.4.0] — 2026-04-18 — Wave 3: Pre-W3 polish + audio + perf mode + worker scaffold

Ships on `claude/wave-3-polish-and-heavy-hitters` (branched off Wave 2). Closes the three pre-Wave-3 audit gaps, then lands the heavy hitters: generative audio, performance-mode toggle, and the Web Worker physics scaffold.

### Added — Audit gap fixes
- **Recorder elapsed counter + 60s soft cap** — `CanvasRecorder` tracks `elapsedMs()` and accepts `maxMs` (default 60 000). The toolbar button label flips from `● Rec` to `■ 00:12` while recording; the recorder self-stops at 60 s and the file auto-downloads.
- **Tour grid interaction** — `AttractorGrid` now accepts a `spotlightIndex`. When the Tour modal is open, the nine non-current tiles fade to `opacity: 0.22` (300 ms transition) while the focused attractor stays lit. `AttractorTile` accepts a `dimmed` prop that drives the transition.
- **Last-focused tile + keyboard power-user shortcuts** — `AttractorTile` fires an `onTileFocus` on `focusCapture`/`pointerEnter`; `lastFocusedIndexRef` in `TheVoid` tracks it. New shortcuts wired through `useKeyboardShortcuts`: `-` / `=` adjust the focused tile's point count, and `Arrow` keys rotate its joystick. `Ctrl`/`Cmd + +/-` still pass through to the browser's native zoom.

### Added — Wave 3 features
- **Performance-mode toggle** — New toolbar `Perf` `<select>` (Low / Med / High) backed by `PERF_PRESETS` in `constants.ts`. Drives the render loop's `subSteps` and caps `shadowBlur` per frame. Selection persists in `localStorage` under `perfMode`.
- **Generative audio synth** — `src/audio/AttractorSynth.ts` wires an `AudioContext` → master `GainNode` → `DynamicsCompressorNode` → destination, with per-attractor `OscillatorNode (sine)` → `BiquadFilterNode (lowpass)` → `StereoPannerNode` voices and a slow 0.1 Hz filter LFO. Each frame samples `points[0]` per attractor and maps `x → pitch (200–1200 Hz, log)`, `y → pan`, `z → filter cutoff`. Defaults to muted at volume `0.1`. Auto-ducks to silence with a 100 ms ramp when the sim is paused.
- **Audio hook + panel** — `useAttractorSynth` manages lifecycle and gesture-gated start (tied to the CLICK-TO-MERGE handler, so autoplay policy is satisfied). `AudioPanel` surfaces a mute button + volume slider above the main toolbar. `M` toggles mute.
- **Web Worker physics scaffold** — `src/workers/attractorWorker.ts` implements the full protocol: `init` (with attractor types + params + transferable Float32Array point buffers), `step` (returns per-attractor trajectory buffers as transferables), `setParams`, `setPointCount`, `setSubSteps`. `src/hooks/useAttractorWorker.ts` wraps the lifecycle. A `USE_WORKER` flag in `constants.ts` gates boot; defaults to `false` so the main-thread draw path stays the canonical pipeline. Flipping the flag boots the worker — consuming its trajectory buffers in the draw loop is deferred to a follow-up.

### Changed
- **`TheVoid.tsx`** — Reads the active `PERF_PRESETS` entry each frame for `subSteps` and an `effectiveGlow = min(tokens.glow, perf.shadowBlur)` clamp. Ducks the synth on pause. Receives a `synthRef` bridge so the render loop can update oscillator params without pulling the hook object through the RAF closure.
- **`Toolbar.tsx`** — Adds `perfMode` + `recordElapsedLabel` props; renders the Perf select and the elapsed counter on the record button.
- **`HelpModal.tsx`** — Already advertised `M` / `+ -` / Arrows; those rows are now backed by working handlers.

### Notes
- **Worker scope:** the worker runs physics correctly for all 10 attractor types (continuous + Henon) and returns full trajectory buffers per frame. The main-thread render loop still owns drawing + projection + grid writes. Migrating the draw step to consume worker output means rewriting the `attractors.current.forEach` block to read from the returned `Float32Array` instead of mutating points inline — intentionally deferred to keep this branch stable.
- **Audio fatigue mitigations:** sine waves only, default mute, default volume `0.1`, slow filter LFO, duck-on-pause with a 100 ms ramp, `setTargetAtTime` smoothing on every oscillator param so per-frame updates don't click.
- **Recorder cap:** hard-coded to 60 s. If you want a longer take, start a new recording.

---

## [1.3.0] — 2026-04-18 — Wave 2: Feature add-ons + Theming polish

Layers Wave 2 onto Wave 1: info tooltips, palette presets, randomizer, PNG/WebM export, a narrative tour, and a light-theme tuning pass.

### Added
- **Info tooltips** — `InfoTooltip.tsx` reveals equations, discoverer/year, Lyapunov exponent, and a short blurb on tile-title hover or focus
- **Per-tile randomizer** — 🎲 button in `ControlPanel` next to Flush; randomizes color, rotation, scale, and speed within the bounds in `utils/randomParams.ts`
- **Color palette presets** — Toolbar dropdown with six presets (Original, Neon, Pastel, Mono, Warm, Cold) applied across all 10 attractors
- **Global randomize** — Toolbar "🎲 All" button, also bound to `R`
- **PNG snapshot** — Toolbar "PNG" button (and `P`) saves `canvas.toDataURL('image/png')` as a timestamped file
- **WebM recorder** — Toolbar "● Rec / ■ Stop" button (and `V`) wraps `canvas.captureStream()` + `MediaRecorder`; codec falls back from `vp9` to default `webm` when unsupported
- **Narrative tour** — `TourModal.tsx` walks through each attractor with name, equations, Lyapunov, and blurb; triggered by Toolbar "Tour" button or `N`; `← →` navigate, `Esc` closes
- **Theme-aware canvas tokens** — `ThemeTokens` now includes `voidRGB` (for fade-alpha math) and `rectStroke` (so tile borders read against a white bg)

### Changed
- **Light theme tuning** — `glow 3 → 2`, `trailAlpha 0.65 → 0.72`, `gridIntensity 0.45 → 0.6`, `fadeAlpha 0.18 → 0.12`, and `inkLow` to a slightly deeper magenta. Trails now stay visible against the near-white void without looking harsh.
- **`TheVoid.tsx`** — Reads `tokens.voidRGB` and `tokens.rectStroke` per frame instead of hard-coded strings, so theme swaps propagate to the canvas without reloading
- **`Toolbar.tsx`** — Now flex-wraps with a `max-w-[95vw]` clamp so the expanded button set fits on narrow screens
- **`HelpModal.tsx`** — Existing `R`/`P`/`V`/`N` rows are now backed by working handlers

### Fixed
- Tile title is now a real `<button>` with a theme-aware focus outline and an `aria-describedby` link to its tooltip

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
