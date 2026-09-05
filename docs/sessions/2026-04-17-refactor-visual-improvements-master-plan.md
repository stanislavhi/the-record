# Plan: Refactor + Visual Improvements for "The Record"

Branch: `claude/refactor-visual-improvements-cP2Sr`

## Context

"The Record" is an interactive chaos-attractor visualizer — 10 strange attractors rendered on a canvas grid. Stack: React 19 + TypeScript + Vite 7 + Tailwind 4, canvas 2D.

The current state is functional but rough: `src/components/TheVoid.tsx` is a **533-line monolith** mixing rendering, physics, pointer input, UI overlays, and particle effects. Controls are 9–11px, desktop-only (mouse events, no touch), inaccessible (no ARIA, no keyboard), and visually flat (no transitions, no loading/reset/pause states, no FPS feedback). The commented-out `HUD.tsx` is dead code.

This branch lifts the code organization, the visual polish, and the UX reach in one pass. User chose **full menu**: all refactor + all visual + full UX reach + second theme + resurrect HUD.

---

## Scope (final)

### Part 1 — Refactor

**Split `TheVoid.tsx`** (533 → ~150 lines) into:
- `components/TheVoid.tsx` — root canvas + orchestration only
- `components/AttractorGrid.tsx` — overlay layout loop
- `components/AttractorTile.tsx` — per-attractor frame (title, joystick, controls)
- `components/ControlPanel.tsx` — 9-control cluster, grouped by Physics vs Display
- `components/Joystick.tsx` — drag-to-rotate with angle indicator
- `components/StatsHUD.tsx` — re-enabled, toggleable (renamed from HUD)
- `components/HelpModal.tsx` — keyboard shortcut legend
- `components/ErrorBoundary.tsx` — wraps canvas with fallback UI

**Extract hooks** (`src/hooks/`):
- `useAnimationFrame.ts` — RAF loop with pause support
- `usePointerDrag.ts` — pointer events (replaces mouse-only, enables touch)
- `useAttractorSimulation.ts` — per-frame physics stepping
- `useKeyboardShortcuts.ts` — Space/Esc/?/arrow keys/+- bindings
- `useTheme.ts` — current theme + toggle, persisted to localStorage
- `useFPS.ts` — rolling FPS counter for StatsHUD

**Config consolidation** (`src/components/constants.ts`):
- `LAYOUT` object: `GAP`, `gridCols`, margins (and responsive breakpoints: 2/3/5)
- `CANVAS_STYLE` object: fade alphas, shadowBlur, font sizes
- `Z_INDEX` scale: `{ canvas: 0, overlay: 10, hud: 50, modal: 100 }`
- `KEYBINDINGS` map

**Cleanup**:
- Remove `forceUpdate` anti-pattern (TheVoid.tsx:25) — use proper state
- Prune unused types in `types.ts`: `MouseState`, and `AttractorType` entries (`tsucs`, `thomas`, `chen`) that aren't in `createInitialAttractors()`
- Remove unused `hudRef` prop-drilling from `App.tsx` (replaced by context or direct mount)
- Optional: `ThemeContext` for theme state, `StatsContext` for HUD toggle

### Part 2 — Visual polish

- **ControlPanel restructure**: Physics row (speed, points, scale) + Display row (color, rotation, flush). Min 12px text, clear labels, small icons.
- **Transitions**: `transition-all duration-200` on sliders, color picker, hover/focus states, panel reveal.
- **Joystick angle indicator**: rotating needle or arc showing current X/Y rotation.
- **Loading state**: on "CLICK TO MERGE", animated dots / pulsing ring until first render batch.
- **Reset button**: global "Reset All" action + `Esc` shortcut flushes every attractor trail.
- **Pause overlay**: `Space` freezes simulation, dims canvas ~30%, shows "PAUSED" + resume hint.
- **StatsHUD** (from HUD.tsx): FPS, active points total, energy bar, current phase. Toggle with `S` or `?`.
- **HelpModal**: `?` opens modal listing all keyboard shortcuts and controls.
- **Typography scale** (`tailwind.config.js`): `fontSize: { label: ['11px', '1.2'], value: ['12px', '1.4'], title: ['14px', '1.3'] }`.

### Part 3 — UX reach

- **Touch support**: swap `mousedown/move/up` for Pointer Events across joystick + canvas click. Tested via devtools touch emulation.
- **Responsive grid**: 2 cols on `< sm`, 3 on `< lg`, 5 on `>= lg`. Uses `window.matchMedia` in `resizeCanvas`.
- **Keyboard shortcuts** (via `useKeyboardShortcuts`): `Space` pause, `Esc` reset-all, `?`/`S` toggle stats, `H` help modal, `T` toggle theme, `+/-` point count of last-focused tile, `Arrow keys` rotate last-focused joystick.
- **ARIA**: labels on every input (`aria-label="Scale"`, etc.), `role="slider"` where needed, color picker gets visible label, `:focus-visible` rings via Tailwind `focus-visible:ring-2 focus-visible:ring-ink-high`.

### Part 4 — Feature add-ons (user-selected)

- **PNG export** — button in each tile (or global toolbar); `canvas.toDataURL('image/png')` → download link
- **WebM recorder** — global toolbar record button using `canvas.captureStream()` + `MediaRecorder`; start/stop, saves `.webm`
- **Randomizer 🎲** — per-tile button randomizes scale/rot/speed/color within sensible bounds; global button randomizes all
- **Color palette presets** — dropdown in ControlPanel with palettes: `neon` (cyan/magenta), `pastel`, `monochrome`, `warm` (red/orange/yellow), `cold` (blue/teal/purple). Applied as gradient across the 10 attractors or within a single trail.
- **Info tooltips** — hover (or focus) a tile title; tooltip shows: equation (LaTeX-ish text), typical params, Lyapunov exponent, discoverer year. Content lives in `src/components/attractors/attractorInfo.ts`.
- **Narrative tour** — modal guided walkthrough: "Press → for next". Highlights one attractor at a time, dims others, shows info card. Triggered by "Tour" button or keyboard `N`.

### Part 5 — Generative audio synth

- `src/audio/AttractorSynth.ts` — Web Audio graph: one `OscillatorNode` + `BiquadFilterNode` per active attractor, mixed to a master gain with compressor.
- Each frame: sample one representative point from each attractor → map `x` to pitch (log scale, clamped musical range e.g. 200–1200Hz), `y` to pan (StereoPannerNode), `z` to filter cutoff.
- Master volume slider + mute toggle in a new `AudioPanel.tsx`. Keyboard `M` to mute.
- Requires user gesture to start (browser autoplay policy) — tied to the existing "CLICK TO MERGE".
- Careful: 10 oscillators always-on can grate. Ship with gentle default volume (~0.1), sine waves, and a slow LFO on the filter. Add envelope that ducks during pause.

### Part 6 — Performance mode + Web Workers

- **Perf toggle** (low/med/high) in ControlPanel: adjusts `SUB_STEPS`, max points per attractor, shadowBlur globally.
  - `low` → 1 subStep, 200 points, shadowBlur 0
  - `med` → current values (2, ~500, 10)
  - `high` → 4 subSteps, 2000 points, shadowBlur 12
- **Web Worker** (`src/workers/attractorWorker.ts`): offload the physics stepping loop. Main thread posts attractor params + count; worker returns updated point arrays via `Transferable` (Float32Array buffers).
- Fallback: if Workers unavailable, stay on main thread.
- Flag risk: worker boundary changes `useAttractorSimulation` semantics — needs careful handling of per-frame updates that happen from UI (color, scale, speed changes). Probably a RingBuffer / diff-patch message scheme.

### Part 7 — Second theme (ambitious — flagged risk)

The canvas aesthetic depends heavily on black background + glow effects. Light theme will need the glow intensities and trail alphas retuned, not just color swaps.

- **Extract theme tokens** to CSS variables in `src/index.css`:
  ```
  :root[data-theme="dark"]  { --void: #0a0a0a; --ink-high: #00f3ff; --ink-low: #ff0055; --grid: #1a1a1a; --glow: 10; --trail-alpha: 0.35; }
  :root[data-theme="light"] { --void: #f5f5f5; --ink-high: #0044ff; --ink-low: #ff0055; --grid: #e0e0e0; --glow: 4;  --trail-alpha: 0.15; }
  ```
- **Tailwind config**: map theme colors to CSS variables so `bg-void`, `text-ink-high` pick up the active theme.
- **Canvas read-through**: canvas rendering cannot read Tailwind classes; add a small `getThemeTokens()` helper that reads `getComputedStyle(document.documentElement).getPropertyValue('--void')` and feeds them into the render loop. Recompute on theme change.
- **Theme toggle**: button in corner + `T` shortcut. Persist to `localStorage('theme')`. Default to `prefers-color-scheme`.
- **Light theme tuning pass**: explicitly step through each attractor and tune `shadowBlur` / trail alpha. Expected iteration.

---

## Execution order (staged commits)

> **Scope warning**: This is a large branch. Recommend staging in 3 waves, each a reviewable checkpoint. If you want, we can PR each wave separately.

**Wave 1 — Foundation (refactor + core UX)**
1. Setup: create branch, add `src/hooks/`, `src/contexts/`, `src/audio/`, `src/workers/`, `src/utils/` dirs
2. Refactor scaffolding (no behavior change): extract `constants.ts` config, `ErrorBoundary`, hook skeletons
3. Split components: TheVoid → Grid → Tile → ControlPanel → Joystick (verify visual parity at each step)
4. Hook migration: render loop → `useAnimationFrame`, pointer drag → `usePointerDrag`
5. Type + dead code cleanup: prune types, remove `forceUpdate`, wire contexts
6. Visual polish: ControlPanel redesign, transitions, loading/reset/pause states
7. Resurrect StatsHUD + HelpModal
8. UX reach: pointer events (touch), responsive grid, keyboard shortcuts, ARIA

**Wave 2 — Feature add-ons + theming**
9. Info tooltips + `attractorInfo.ts` content
10. Randomizer + color palette presets
11. PNG export + WebM recorder (toolbar)
12. Narrative tour modal
13. Theme tokens: CSS variables, Tailwind mapping, `getThemeTokens()` canvas bridge
14. Light theme: tune glow/alpha, theme toggle + persistence

**Wave 3 — Heavy hitters (audio + workers)**
15. Generative audio synth (`AttractorSynth`, `AudioPanel`, mute, gesture-gated start)
16. Performance mode preset (low/med/high)
17. Web Worker for physics (`attractorWorker.ts`), fallback path, Transferable buffers
18. Final pass: lint, typecheck, manual QA, push

---

## Critical files

| File | Change |
|------|--------|
| `src/components/TheVoid.tsx` | Slim to orchestrator (~150 lines) |
| `src/components/AttractorGrid.tsx` | **new** — layout loop |
| `src/components/AttractorTile.tsx` | **new** — per-attractor frame |
| `src/components/ControlPanel.tsx` | **new** — regrouped controls |
| `src/components/Joystick.tsx` | **new** — drag + angle indicator |
| `src/components/StatsHUD.tsx` | **rename** of HUD.tsx, resurrected + extended |
| `src/components/HelpModal.tsx` | **new** — keyboard shortcut modal |
| `src/components/ErrorBoundary.tsx` | **new** |
| `src/components/ThemeToggle.tsx` | **new** |
| `src/components/constants.ts` | Add LAYOUT, CANVAS_STYLE, Z_INDEX, KEYBINDINGS |
| `src/components/types.ts` | Prune MouseState, tsucs/thomas/chen |
| `src/components/HUD.tsx` | Delete (merged into StatsHUD) |
| `src/hooks/useAnimationFrame.ts` | **new** |
| `src/hooks/usePointerDrag.ts` | **new** — reuses existing drag math |
| `src/hooks/useAttractorSimulation.ts` | **new** — reuses `calculateAttractorStep`, `isPointStable`, `resetPoint` |
| `src/hooks/useKeyboardShortcuts.ts` | **new** |
| `src/hooks/useTheme.ts` | **new** — localStorage + matchMedia |
| `src/hooks/useFPS.ts` | **new** |
| `src/contexts/ThemeContext.tsx` | **new** |
| `src/utils/themeTokens.ts` | **new** — `getThemeTokens()` for canvas |
| `src/utils/exportCanvas.ts` | **new** — PNG snapshot + WebM recorder helpers |
| `src/utils/palettes.ts` | **new** — color palette presets |
| `src/utils/randomParams.ts` | **new** — randomizer within bounds |
| `src/components/InfoTooltip.tsx` | **new** — hover/focus info card |
| `src/components/TourModal.tsx` | **new** — narrative walkthrough |
| `src/components/AudioPanel.tsx` | **new** — volume + mute UI |
| `src/components/Toolbar.tsx` | **new** — global actions (reset, record, randomize, tour, theme) |
| `src/components/attractors/attractorInfo.ts` | **new** — equations, Lyapunov, discoverer, year |
| `src/audio/AttractorSynth.ts` | **new** — Web Audio graph |
| `src/workers/attractorWorker.ts` | **new** — off-main-thread physics |
| `src/App.tsx` | Wire ErrorBoundary, ThemeProvider, AudioProvider, remove hudRef |
| `src/index.css` | CSS variables for both themes |
| `tailwind.config.js` | Map colors to CSS vars, add fontSize tokens, z-index |

## Reused existing utilities

- `src/components/utils/colorUtils.ts` (rgbToHsl, hslToRgb, rgbToHex, hexToRgb) — stays as-is
- `src/components/utils/projection.ts` (`project`) — stays as-is
- `src/components/attractors/attractorCalculations.ts` (`calculateAttractorStep`, `isPointStable`, `resetPoint`) — stays as-is, consumed by `useAttractorSimulation`
- `createInitialAttractors()` from `constants.ts` — stays

## Verification

- `npm run dev` → browser test:
  - All 10 attractors render, merge (click) still works
  - Each attractor's scale/rotation/points/speed/color/flush controls still work
  - Resize window → grid reflows to 2/3/5 cols
  - Devtools touch emulation → joystick drag works on touch
  - `Tab` cycles controls with visible focus rings; screen reader announces ARIA labels
  - Keyboard: `Space` pauses, `Esc` resets all, `?` opens help, `S` toggles stats, `T` toggles theme, `+/-` and arrows work on focused tile
  - Light theme readable, glow/alpha tuned sensibly
  - localStorage persists theme across reload
- `npm run lint` passes
- `tsc --noEmit` passes
- FPS comparable to baseline (StatsHUD makes this measurable)
- No regression in particle burst on click

## Risks / notes

- **Scope is large**: strongly recommend shipping as 3 PRs (Wave 1 → 2 → 3). Wave 1 alone is a meaningful improvement; later waves are additive.
- **Light theme is iterative**: first pass will look wrong; expect tuning. If time pressure hits, ship dark theme + tokens and defer light-theme polish.
- **Touch events**: click-to-merge on canvas must not fire on a joystick drag — handlers need `pointerType` / `stopPropagation` care.
- **Keyboard `+/-` / arrows** need a concept of "last-focused tile" — tracked in context.
- **Canvas theme bridge**: `getThemeTokens()` must be re-called on theme change; subscribe to `document.documentElement` `data-theme` mutation or pipe through context.
- **Audio autoplay**: Web Audio must start on user gesture. Tie `AudioContext.resume()` to the existing "CLICK TO MERGE" handler. Default to muted; let user opt in.
- **Audio fatigue**: 10 oscillators continuously is harsh. Use sine waves, low volume, slow filter LFO, and duck on pause. Provide mute prominently.
- **Web Worker complexity**: moving physics off-thread requires a message protocol for per-frame state (params changes, color/scale updates). Use `Transferable` Float32Array buffers to avoid copy overhead. If this blocks, ship without the worker and keep just the perf-mode toggle.
- **Recorder file size**: WebM recordings can get large quickly. Cap at 60s by default or show a warning.
- **Narrative tour content**: writing 10 attractor blurbs is content work, not code. Placeholder text first, polish later.

---

## Pre-Wave-3 Audit (2026-04-18)

Audit of what actually shipped in Waves 1+2 vs the plan above. Gaps below are real — decide which to close before moving on to Wave 3.

### Shipped ✅

- TheVoid split, StatsHUD, HelpModal, ErrorBoundary, Toolbar, IntroOverlay, PausedOverlay, InfoTooltip, TourModal
- Hooks: `usePointerDrag`, `useKeyboardShortcuts`, `useTheme`, `useFPS`, `useBreakpoint`
- `constants.ts` objects: `LAYOUT`, `CANVAS_STYLE`, `Z_INDEX`, `KEYBINDINGS`, `PERF_PRESETS`
- Prune of `MouseState` + `tsucs/thomas/chen` types + calculators
- Palette dropdown, per-tile + global randomizer, PNG snapshot, WebM recorder, narrative tour modal, theme tokens + light-theme tuning
- Keyboard shortcuts: `Space`, `Esc`, `?`, `H`, `S`, `T`, `R`, `P`, `V`, `N`

### Gaps ⚠️ (planned, not shipped)

| Gap | Plan intent | Current state |
|-----|-------------|---------------|
| **`useAttractorSimulation` hook** | Extract physics stepping into a hook | Physics still inline in `TheVoid.tsx` render loop |
| **`useAnimationFrame` actually used** | TheVoid should consume the hook | Hook exists but TheVoid runs its own raw RAF loop — dead code |
| **Last-focused tile tracking** | Needed for keyboard `+/-` and arrow shortcuts | No such concept exists |
| **Keyboard `+/-` for point count** | Add/remove point on focused tile | KEYBINDINGS maps `Minus`/`Equal` but no handler |
| **Keyboard arrows → joystick rotation** | Rotate focused joystick with arrow keys | Not implemented |
| **Tour grid interaction** | "Highlights one attractor at a time, dims others" — tour should spotlight the current tile on the canvas | Current `TourModal` is a plain modal; no dim/spotlight on the grid |
| **Recorder duration cap / warning** | Flagged risk: WebM files grow fast; cap at 60s or warn | No cap, no elapsed indicator |

### Deferrable / intentional deviations

- **`ThemeContext.tsx`** — plan marked this optional; local `useTheme` hook works fine
- **`ThemeToggle.tsx` as standalone** — plan listed it; actually integrated into `Toolbar` (functionally equivalent)
- **Palette dropdown in `ControlPanel`** — plan said ControlPanel; shipped in `Toolbar` because palettes are a global setting. Better fit.

### Recommended close-before-Wave-3 set

1. **Tour grid interaction** (highlight current tile, dim the other nine): delivers the narrative-tour experience the plan described, not just a modal info dump. Medium effort — add a `tourTargetIndex` piped to `AttractorGrid`/`AttractorTile` that dims non-matching tiles via opacity.

2. **Recorder elapsed counter + 60s soft cap**: prevents runaway file sizes, small visible counter in the toolbar button label (e.g. `● 00:12`). Small effort.

3. **Last-focused tile + `+/-` and arrow shortcuts**: meaningful keyboard-power-user reach; matches what HelpModal already advertises. Small-to-medium effort — a `lastFocusedIndex` ref updated on tile focus, then `Minus`/`Equal`/`Arrow*` handlers dispatching to existing `handlePointsChange`/`handleRotate`.

### Optional polish to skip

- `useAttractorSimulation` extract: pure cleanup, no behavior change. TheVoid works; leave for a later refactor if Wave 3 introduces workers (which will move physics off-thread anyway).
- `useAnimationFrame` actually used: same — worth doing only if TheVoid gets refactored alongside worker work.

---

## Final Plan — Pre-Wave-3 Polish + Full Wave 3 (2026-04-18)

### Context

Waves 1+2 shipped on `claude/refactor-visual-improvements-cP2Sr` and `claude/wave-2-features-and-theming`. The audit above found three real gaps that were in the original plan but never landed, plus the three heavy Wave 3 items (audio, perf-mode, worker). User wants **all six** closed on one new branch off the current Wave 2 tip.

**Branch**: `claude/wave-3-polish-and-heavy-hitters` (cut from current `claude/wave-2-features-and-theming` tip)

### Stage A — Close Wave 1+2 gaps (do first, small/isolated commits)

**A1. Recorder elapsed counter + 60s soft cap**
- Extend `src/utils/exportCanvas.ts` `CanvasRecorder` to track a `startTime`, expose `elapsedMs()`, and accept an optional `maxMs` (default 60000) that auto-stops and resolves the promise.
- `TheVoid.tsx` ticks a 1-Hz `setInterval` while `recording === true`, writes `recordElapsed` into state, passes it to `Toolbar`.
- `Toolbar.tsx` record button label: `● Rec` → `● 00:12` while active. At 60s the recorder self-stops and the button flips back to `● Rec`.

**A2. Tour grid interaction (spotlight current tile)**
- Add `tourActiveIndex: number | null` state in `TheVoid.tsx`; set on TourModal index change, null when closed.
- Prop-drill into `AttractorGrid` → `AttractorTile`. When non-null and doesn't match the tile index, render the tile frame with reduced opacity (e.g. `opacity: 0.22`, `transition: opacity 300ms`).
- Matching tile stays full opacity — no extra glow, just contrast. Keep TourModal open and clickable-through to close.
- Canvas clipping already scopes trails, so dimming the overlay frame is enough visually; no canvas render changes needed.

**A3. Last-focused tile + keyboard +/- & arrow shortcuts**
- `TheVoid.tsx`: `lastFocusedIndexRef = useRef<number>(0)`.
- `AttractorTile.tsx`: accept `onFocus?: (index: number) => void`; call it from `onFocus`/`onFocusCapture` on the tile root `<div>` (already has `tabIndex={0}` via the control group, confirm one exists or add a discreet focusable wrapper).
- New `useKeyboardShortcuts` bindings (already mapped in `KEYBINDINGS`): `Minus`/`Equal` call `handlePointsChange(lastFocusedIndexRef.current, delta)`; `ArrowUp`/`Down`/`Left`/`Right` call `handleRotate(lastFocusedIndexRef.current, {dx, dy})` with a fixed step (e.g. 0.1 rad).
- Respect existing "ignore while typing in input" guard.

Verification for Stage A: manual focus a tile → press `+` to add points, arrows rotate; start recording, watch counter, confirm auto-stop at ~60s; open Tour, confirm non-current tiles dim.

### Stage B — Wave 3 (heavy hitters)

**B1. Performance-mode toggle (do first — lowest risk, unblocks audio+worker tuning)**
- `constants.ts` already has `PERF_PRESETS`; confirm shape matches `{ low, med, high }` with `subSteps`, `maxPoints`, `shadowBlur`.
- Add `perfMode: 'low' | 'med' | 'high'` to `TheVoid.tsx` state, default `med`; render loop reads the active preset each frame for `SUB_STEPS` and `shadowBlur`.
- `Toolbar.tsx`: new `<select>` or segmented control `Perf: Low / Med / High`.
- Persist to `localStorage` under `perfMode`.

**B2. Generative audio synth**
- New `src/audio/AttractorSynth.ts`: class wrapping `AudioContext`, master `GainNode` → `DynamicsCompressorNode` → destination; per-attractor chain `OscillatorNode (sine)` → `BiquadFilterNode (lowpass)` → `StereoPannerNode` → master. Slow filter LFO (0.1 Hz `OscillatorNode` on `filter.frequency`).
- API: `start(ctx)`, `stop()`, `setMuted(bool)`, `setVolume(0-1)`, `update(index, {x,y,z})` → maps `x → freq (200–1200 Hz log)`, `y → pan (-1..1)`, `z → filter cutoff (200–4000 Hz)`, `duck(on)` for pause.
- `src/hooks/useAttractorSynth.ts`: lazy-init on first post-merge frame (tied to existing CLICK-TO-MERGE gesture), subscribes to attractor state via ref, calls `update()` from the render loop.
- `src/components/AudioPanel.tsx`: floats near toolbar (or tucks into toolbar as a popover) — volume slider (default 0.1), mute toggle, `M` shortcut. Default **muted** so first impression isn't harsh.
- Ducking: wire to the existing `isPaused` state → `synth.duck(true)` drops master gain to 0 with 100ms ramp.

**B3. Web Worker physics offload (last — touches the hot loop)**
- New `src/workers/attractorWorker.ts`: receives `{ attractors: AttractorParams[], dt, subSteps }`, maintains its own `Float32Array` point buffers, runs `calculateAttractorStep`, posts back the updated point positions via `Transferable`.
- Message protocol:
  - Main → worker: `{ type: 'init', attractors }`, `{ type: 'step', dt, subSteps, paramsDelta?: Partial<AttractorParams>[] }`, `{ type: 'setPoints', index, count }`.
  - Worker → main: `{ type: 'frame', buffers: Float32Array[] }` (transferred).
- `TheVoid.tsx`: if `typeof Worker !== 'undefined'` → construct worker, each RAF tick posts `step`, awaits `frame` message (use a "pending frame" flag — skip if worker hasn't returned yet to avoid backpressure). Main thread handles only projection + draw.
- Fallback: if no Worker, keep current inline physics path. Guard behind a `USE_WORKER` constant so we can disable without ripping code.
- Hot knobs (color/scale/speed/point count) mutate a `paramsDelta` queue flushed on next `step` message — no need to re-init the worker.

**B4. Docs refresh (at end)**
- Append `[1.4.0] — 2026-04-18 — Wave 3` entry to `docs/CHANGELOG.md` (perf mode, audio synth, worker, plus the three audit fixes).
- Update `docs/WALKTHROUGH.md` with the new `M` shortcut + Perf dropdown + recorder counter.
- Update `docs/ARCHITECTURE.md` adding `src/audio/`, `src/workers/`, `AudioPanel` rows.
- Update `README.md` feature bullets.
- Append today's session to `Interactive Attractor Controls.md`.

### Critical files

| File | Change |
|------|--------|
| `src/utils/exportCanvas.ts` | `CanvasRecorder.elapsedMs()` + `maxMs` auto-stop |
| `src/components/Toolbar.tsx` | Elapsed label on record button, Perf `<select>`, mute toggle passthrough |
| `src/components/TheVoid.tsx` | `tourActiveIndex`, `lastFocusedIndexRef`, perf state, synth hook, worker wiring |
| `src/components/AttractorGrid.tsx` | Accept + forward `tourActiveIndex` |
| `src/components/AttractorTile.tsx` | `isDimmed` prop → opacity transition; `onFocus` callback |
| `src/hooks/useKeyboardShortcuts.ts` | `Minus`/`Equal`/`Arrow*` handlers targeting `lastFocusedIndex` |
| `src/audio/AttractorSynth.ts` | **new** — Web Audio graph |
| `src/hooks/useAttractorSynth.ts` | **new** — lifecycle + render-loop integration |
| `src/components/AudioPanel.tsx` | **new** — volume + mute UI, `M` shortcut |
| `src/workers/attractorWorker.ts` | **new** — off-thread physics |
| `docs/CHANGELOG.md`, `docs/WALKTHROUGH.md`, `docs/ARCHITECTURE.md`, `README.md`, `Interactive Attractor Controls.md` | Wave 3 entries |

### Verification

- `npm run lint` + `tsc --noEmit` clean after each stage.
- Manual `npm run dev`:
  - Stage A: focus a tile → `+`/`-` adjusts points, arrows rotate; record for 65s → auto-stops at ~60s with counter reaching `01:00`; open Tour → 9 tiles dim smoothly, current tile stays lit; step with `←`/`→` → spotlight follows.
  - Stage B1: flip Perf Low → FPS climbs, shadowBlur drops; High → denser trails, heavier.
  - Stage B2: audio starts muted; `M` unmutes at low volume; attractor motion modulates pitch/pan audibly; pause ducks to silence.
  - Stage B3: StatsHUD FPS stays ≥ baseline with many points; DevTools Performance panel shows the long `script` block migrated off main thread; toggle `USE_WORKER = false` → still works via fallback.
- Bundle size sanity check: worker file is a separate chunk (Vite handles this with `new Worker(new URL(...), { type: 'module' })`).

### Risks / mitigations

- **Worker message cost** could exceed savings if we ping-pong too much. Mitigation: one message per frame, `Transferable` buffers, drop frames when backpressured.
- **Audio autoplay**: AudioContext must be constructed *inside* the merge click handler. Default muted to sidestep policy + taste issues.
- **Tour dimming + canvas**: canvas is a single element behind all tiles, so dimming the tile frames is a UI illusion; the trails of dimmed attractors still render at full intensity. That's acceptable (faithful to "Database" metaphor) — but flag if user wants canvas-level dimming too.
- **+/- key collision with browser zoom**: `Ctrl`/`Cmd` variants pass through to browser; we only handle bare `Minus`/`Equal`.
- **Perf-mode persistence** across sessions should not resurrect `low` on a capable machine silently. Show the current mode in the toolbar at all times.

### Scope not in this plan

- `useAttractorSimulation` / `useAnimationFrame` hook extraction — intentionally deferred. The worker change touches the render loop already; a hook extract on top would double the diff without adding behavior.
- Canvas-level dimming during tour (vs frame overlay only).
- Audio presets / chord progressions — ship plain oscillator-per-attractor first, save polish for a later pass.
