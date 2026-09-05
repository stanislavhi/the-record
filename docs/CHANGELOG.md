# Changelog — The Record

> **🤖 This project was fully generated with Claude Opus 4.5 and Gemini 3.0 — Chat only.**
>
> See [Interactive Attractor Controls.md](../Interactive%20Attractor%20Controls.md) for the complete conversation log.

All notable changes to **The Record**, in reverse chronological order.

---

## [1.5.0] — 2026-09-01 — Wave 4: Pages 2 + 3 — ten originals, then a menagerie

Ships on `claude/wave-4-page-2-original-attractors` (branched off Wave 3). Adds two more rosters of ten and a three-way page control: **Page 2** is ten chaotic flows invented for this project; **Page 3** is ten *different classes* of dynamics — fractal, map, automaton, billiard, Hamiltonian, N-body, delay, agents, quasi-periodic, impact — pushed through the same tile pipeline.

### Added — Page 3, the menagerie
- **Ten systems from ten classes** — `src/components/attractors/menagerieCalculations.ts`: **Thicket** (chaos game on four 3-D affine maps), **Dendrite** (Julia set of z² + c by inverse iteration, c = −0.4 + 0.6i), **Colony** (Langton's ants sharing a 160 × 160 torus), **Stadium** (Bunimovich billiard, specular reflection), **Pendulum** (double pendulum, RK4, ten near-identical releases), **Cluster** (softened N-body gravity between the tile's own points in a bowl, kick–drift), **Echo** (Mackey–Glass delay equation with a 4096-sample history, plotted as a delay embedding), **Murmuration** (boids: cohesion / alignment / separation in a soft box), **Loom** (three incommensurate frequencies — quasi-periodic, deliberately *not* chaotic), **Rebound** (ball on a vibrating plate, drawn on a cylinder of drive phase). None is a flow in the Page 1 / Page 2 sense.
- **`StepContext`** — calculators may now receive `{ points, index }` so interacting systems (Cluster, Murmuration, Colony) can see their neighbours. Per-point memory (velocities, angles, history buffers, ant heading) lives in `WeakMap`s keyed by the point object; shared memory (the ant lattice, N-body accelerations) is keyed by the tile's points array. Nothing was added to `Point3D`.
- **`DrawStyle`** — `getDrawStyle(type)` returns `{ mode: 'trail' | 'dots', stepInterval }`, replacing the boolean discrete flag. Hénon / Ripple keep the classic 20-sub-step dust pace; Page 3 dust stamps every other sub-step.
- **`FACE_CAMERA`** — object rotation that cancels the isometric camera so flat systems (Dendrite, Colony, Stadium) are seen face-on; add `z: π` to flip "up" upright (Thicket, Pendulum, Rebound).
- **Three-way page control** — Toolbar `Page 1 2 3` segmented group (aria-pressed on the active page), keys `1` / `2` / `3`, `PAGE_LABELS` in `constants.ts` carrying the button title and the Stats phase (`PAGE 3: MENAGERIE`).
- **Info cards** — `badge` / `note` fields on `AttractorInfo` (Page 2 chip `original`, Page 3 chip `menagerie`) with a one-line provenance note on the tour card. Page 3's "Lyapunov" line is descriptive (contractive IFS, conservative, quasi-periodic, …) rather than a single number.

### Added — Page 2, the originals
- **Ten original attractors** — `src/components/attractors/originalCalculations.ts`: **Sigil** (Lorenz with a cos(wz) gain), **Wick** (Lorenz with an |xy| pump that only pushes z upward), **Cinder** (Chua with the diode smoothed into tanh), **Gyre** (Dadras scrolls with a cos(x) ripple on z), **Moth** (jerk-like flow with a y·tanh(y) thermostat), **Tidepool** (planar rotation whose radius is dialled by z), **Ossuary** (Nosé–Hoover thermostat with sin(wx) forcing), **Ripple** (discrete 3D sine/cosine map, drawn as dust like Hénon), **Anvil** (jerk: sinusoidal kick vs cubic brake), **Reed** (jerk with a square-root restoring force). Each started as a deliberate twist on a known chaos mechanism; parameters were chosen by numerical sweep, keeping only regimes that are bounded, non-diverging and chaotic under the app's own forward-Euler step.
- **Page toggle** — Toolbar `Page 2 ✦` / `Page 1` button (active state on Page 2), `1` / `2` keys (Ctrl/Cmd/Alt pass through), persisted in `localStorage('attractorPage')`. Switching rebuilds the roster from `createInitialAttractors(page)`, clears trails and particles, re-lays out the tiles, and resets speeds, palette select, tour index and last-focused tile. The Stats HUD phase reads `PAGE 2: ORIGINALS` while Page 2 is active.
- **Vetting script** — `scripts/vet-attractors.mjs` (`npm run vet:attractors [classic|original|all]`) bundles the real TypeScript through esbuild and measures, per attractor, the largest Lyapunov exponent (Benettin renormalisation), orbit centre, spread, extent and divergence resets — integrating exactly the way `TheVoid` does. Exits non-zero if any Page 2 system is unstable or non-chaotic.
- **`center` on `Attractor`** — optional attractor-space point subtracted before projection, so systems whose orbit lives away from the origin (Wick sits at z ≈ 39) are centred in their tile.
- **`DISCRETE_TYPES` / `isDiscrete()`** — replaces the hard-coded `'henon'` checks in the render loop and the worker, so any map-type system gets the in-place iteration + dot-cloud drawing path.
- **Original badge** — `InfoTooltip` shows an accent-coloured `original` chip next to the credit line; `TourModal` adds a "Page 2 original — invented for this project, not from the literature" line. Credit line for all ten: `Claude · for The Record · 2026`.

### Changed
- **`types.ts`** — `AttractorType` is now `ClassicAttractorType | OriginalAttractorType | MenagerieAttractorType`; `AttractorPage = 'classic' | 'original' | 'menagerie'` with `ATTRACTOR_PAGES`; `Attractor.center?: Rotation3D`.
- **`constants.ts`** — `createClassicAttractors()`, `createOriginalAttractors()`, `createMenagerieAttractors()`, `createInitialAttractors(page)`, `readSavedPage()` / `isAttractorPage()`, `PAGE_STORAGE_KEY`, `DEFAULT_PAGE`, `PAGE_LABELS`, `FACE_CAMERA`; `KEYBINDINGS.page1/page2/page3`.
- **`attractorCalculations.ts`** — merges the three calculator maps; `calculateAttractorStep(type, pt, params, ctx?)`; `getDrawStyle()` / `isDiscrete()`; shared `Delta` / `AttractorCalculator` / `StepContext` / `DrawStyle` types live in `calculatorTypes.ts`.
- **`TheVoid.tsx`** — `page` / `pageTypes` state, `pageRef`, `handlePageChange`; tour types follow the active page; phase labels come from `PAGE_LABELS`; render loop reads the draw style once per attractor and passes a `StepContext` per point.
- **`Toolbar.tsx`** — `page` + `onPageChange` props, segmented page group; **`HelpModal.tsx`** — `1 / 2 / 3` row; **`InfoTooltip` / `TourModal`** — badge + note.
- **`attractorWorker.ts`** — reads `getDrawStyle()`; Page 3 systems need a `StepContext` the flat-buffer protocol does not carry (worker is gated off).
- **`package.json`** — `vet:attractors` script.

### Notes
- Page 2 Lyapunov values shown in tooltips are **measured** (largest exponent, 400k Euler steps at the default dt), not quoted from a reference.
- Page 3 is **informational** in `vet:attractors`: the script perturbs the plotted point only, so it cannot see hidden state (angles, velocities, history buffers) and its LE column is meaningless there. Sensitivity for Stadium and Pendulum was checked separately (two copies released 10⁻⁶ apart lose each other within ~3 000 sub-steps); Rebound's parameters were chosen from a bounce-height scan (A = 0.15, ω = 7, e = 0.6 gives irregular peaks; A ≤ 0.35 at ω = 3.5 locks into a period-1 bounce).
- Murmuration caps speed rather than normalising it: a hard constant-speed rule undoes the wall's deceleration every step and lets a lone bird fly out of the box.
- Page 3 systems mutate the point in place and return a zero delta, so `resetPoint()` on an unstable point does not reset their hidden state — each calculator guards its own state for non-finite values instead.
- **Side finding** from the vetting script: at the app's Euler step, Page 1's Rössler (dt 0.02) and Rabinovich–Fabrikant (dt 0.01) measure a largest exponent ≈ 0 — under this integrator they settle onto periodic orbits. Untouched in this wave (classic rows are informational in the script); a dt/integrator pass is a candidate for a later wave.
- "Original" means designed here from the mechanism up rather than transcribed from a reference. No literature search was done to certify that none of them coincides with a published system.
- The Web Worker remains gated off. It is seeded with the mount-time page and does not re-init on a page switch — deferred together with the rest of the worker wiring.

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
