# Ideas and Improvements — The Record

Backlog only. Nothing in this file is implemented or scheduled. Each item states what it costs, what it buys and what can go wrong, and the recommended order is at the end. The state of the code this file describes is `main` at the end of Wave 4 (Pages 1–4, RK4 classics, engine split).

---

## A. Hygiene — fix before adding anything

### A1. CI: lint, typecheck, build and vet on every PR
- **What:** a GitHub Actions workflow running `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run vet:attractors -- all`.
- **Buys:** the gates in CLAUDE.md stop depending on whoever is at the keyboard. All four waves merged without a machine check.
- **Costs:** about 30 lines of YAML. The vet run takes about a minute; drop `VET_STEPS` to 100k in CI.
- **Risk:** vet is deterministic (fixed seeds), so the only exposure is cross-CPU float drift on the 0.02 gate. Lotus and Triskele sit at about 0.06, which leaves headroom.

### A2. Unit tests (Vitest) for the numerics
- **What:**
  - RK4 order test: halve dt and the error should drop by about 16×.
  - Guard-before-step test: a NaN point is reset exactly once.
  - Sub-step-major contract test for interacting systems.
  - Forge conjugacy test: each forge λ is within 2 % of its base flow's.
- **Buys:** a regression net under `advancePoint()` and the forge Jacobians, the two places where a silent mistake still renders something plausible.
- **Costs:** a Vitest dev-dependency and about 150 lines. The vet bundling trick (esbuild) is unnecessary because Vitest reads TS directly.
- **Risk:** none at runtime.

### A3. DPR-aware canvas
- **What:** size the backing store as `cssSize × devicePixelRatio`, then `ctx.scale(dpr, dpr)`. `TrailGrid` stays in CSS pixels.
- **Buys:** sharp trails on Retina and HiDPI screens; today everything is upscaled and blurry.
- **Costs:** about 20 lines in `resizeCanvas` and the recorder (WebM size doubles at DPR 2).
- **Risk:** fill cost scales with dpr², so at DPR 3 on mobile cap at 2. Perf "Low" should force 1.

### A4. Auto-fit scale per tile
- **What:** store each system's vetted extent (already printed by the vet script) in the roster, and derive `scale` from the tile size at layout time. `scale` becomes a multiplier, defaulting to 1.
- **Buys:** fixes the small classic tiles at 1600 px, and the same roster works at the 2-, 3- and 5-column layouts. New systems no longer need hand-tuned px scales.
- **Costs:** a roster field change across 40 entries (scriptable from vet output), plus a migration so the SCALE slider means "zoom ×".
- **Risk:** Randomize and palette code that touches `scale` must be updated together.

### A5. Clip strokes and deposits to the tile
- **What:** `ctx.save(); ctx.rect(tile); ctx.clip()` per tile in `drawAttractors`, and bounds-check `TrailGrid.deposit`.
- **Buys:** no more bleed into neighbouring tiles (seen with Lantern before its seed fix, and with any user-zoomed tile).
- **Costs:** small.
- **Risk:** `clip()` per tile per frame has a cost; measure it. Fallback: reject out-of-rect path segments.

### A6. Light-theme colour mapping
- **What:** a per-theme colour transform (lightness clamp in HSL) applied at draw time, not stored.
- **Buys:** white Lorenz and the pale menagerie colours become visible on the light theme. Today each new system has to be screenshot-tested in both themes by hand.
- **Costs:** about 30 lines in the theme bridge (`getThemeTokens()`).
- **Risk:** palettes stop looking identical across themes, which is acceptable.

### A7. Per-system speed range
- **What:** optional `dtRange: [min, max]` in the roster; the SPEED slider uses it, and the global 0.001–0.03 becomes the fallback.
- **Buys:** Euler originals can't be dragged into divergence, and RK4 forge systems at dt 0.002 get a usable slider resolution.
- **Costs:** small. The vet script can emit a safe max dt per system by bisection.

### A8. Rewrite `AGENTS.md`
- It still describes the pre-refactor single-component app and `@tailwindcss/vite`. Point it at `lode/` and `docs/ARCHITECTURE.md` instead of duplicating them.

### A9. Worker: finish or delete
- `USE_WORKER = false` since Wave 3. The protocol has no `StepContext` (so Page 3 can't run in it), it isn't re-initialised on page switch, and its buffers aren't wired into drawing.
- **Recommendation: delete it.** It is about 250 lines (`attractorWorker.ts` + `useAttractorWorker.ts`) kept compiling for no user benefit. If profiling later shows stepping, not painting, as the frame-time ceiling, revisit it as an OffscreenCanvas renderer rather than a stepping-only worker.

### A10. Grid paint via `ImageData`
- **What:** `TrailGrid` paints O(cols × rows) `fillRect` calls with string `fillStyle` per frame. Instead, write RGBA into one `ImageData` from the `Float32Array` and `putImageData` once.
- **Buys:** this is the measured frame-time ceiling in the current loop; one bulk write should replace thousands of draw calls.
- **Costs:** about 40 lines in `engine/trailGrid.ts`.
- **Risk:** `putImageData` ignores transforms, so do it before the DPR scale or at device resolution.

---

## B. Experience

### B1. Touch controls (`hover: none` only)
- The tap-to-control panel (`75aba4e`, reverted during the Wave 1–4 merge) was the right idea for touch screens, which have no hover. Re-introduce it behind `@media (hover: none)` so desktop keeps the hover reveal.
- **Costs:** about 80 lines in `AttractorTile`.
- **Risk:** two interaction models to test.

### B2. Focus mode
- **What:** double-click a tile, or press `F` on the focused tile, to open one system full-screen with more points, longer trail decay, a slow auto-orbit camera, and the info card docked.
- **Buys:** the grid is a sampler; this is where people stay. It is also the natural home for B3, B4 and C2.
- **Costs:** a layout mode in `layoutTiles` plus a render-loop branch that skips nine tiles. Medium effort.
- **Risk:** the page-switch reset rules (CLAUDE.md "Page switch") must also cover leaving focus mode.

### B3. Shareable view state in the URL hash
- **What:** encode page, focused tile, rotation, scale and dt in `#…`. No personal data.
- **Buys:** links to a specific view, and bug reports with exact state.
- **Costs:** small; reuse `usePersistentState` serialisation.
- **Risk:** keep the hash schema versioned, or old links break on roster changes.

### B4. Live divergence demo
- **What:** in focus mode, release a ghost copy 1e-6 away, draw both, and plot log-separation over time beside the tile. Its slope is the λ on the card.
- **Buys:** makes "sensitive dependence" visible instead of asserted; ties the measured λ to something the viewer can watch.
- **Costs:** about 120 lines, reusing the vet's two-copy logic.

### B5. Accessibility
- Respect `prefers-reduced-motion`: start paused, or at 25 % speed.
- Visible focus ring on tiles.
- `aria-describedby` from `ATTRACTOR_INFO.blurb`.
- The tour already gives a linear reading order; expose it to screen readers.

---

## C. Science features

### C1. Forge playground
- **What:** pick a base (Lorenz, Burke–Shaw, Rucklidge, Shimizu–Morioka, Four-Wing, Chen–Lee, or any π-symmetric classic), then operators (cover n, twist k, inversion c/R), and the result appears as a live custom tile.
- **Guardrails:** before showing, run a quick bounded check plus λ estimate (the vet's `vetSwarm`, about 50 ms). Covers are refused for bases without the π-symmetry.
- **Buys:** Page 4 becomes a tool, not a gallery. Everything needed already exists: `forgeCalculations.ts` is compositional by construction.
- **Costs:** a panel UI plus serialising the composition (pairs with B3). Medium effort.
- **Risk:** inversion centres on the attractor produce unbounded tiles. The swarm check catches these, but the UX has to say why.

### C2. Bifurcation explorer
- **What:** in focus mode, sweep one parameter (Rössler c, Lorenz ρ, Rucklidge λ) and draw the classic bifurcation diagram (local maxima of z against the parameter) next to the attractor, with a draggable cursor that sets the live parameter.
- **Buys:** shows the route to chaos (period doubling in Rössler is the textbook case), which the grid never shows.
- **Costs:** the sweep is about 200 values × 20k steps. It needs a worker or chunked idle time, the one place a worker earns its keep (see A9).

### C3. Poincaré section overlay
- **What:** toggle a plane (e.g. z = mean) and stamp the crossings as dots over the trail.
- **Buys:** reveals the fractal fold structure that the trail hides.
- **Costs:** small; detect sign changes per sub-step in `drawAttractors`.

### C4. Page 5 candidates
Pages are exactly ten (synth voices, 5 × 2 grid). Three directions, each a different class from Pages 1–4:
- **Spatiotemporal:** Kuramoto–Sivashinsky on a 1-D ring, Gray–Scott reaction–diffusion on a small grid, coupled map lattices. These are fields, not points, and need a `DrawStyle: 'field'`.
- **Synchronisation:** Kuramoto oscillators (an order-parameter transition as coupling rises), chimera states, coupled Lorenz pairs locking and unlocking.
- **Hyperchaos and noise:** 4-D hyperchaotic Rössler (two positive λ), noise-induced switching in a double well (an SDE). These need a 4-D state and a stochastic integrator; the `Point3D` contract would need a hidden-state extension (Page 3 pattern).

Recommendation: synchronisation first. It reuses the Page 3 interacting-system machinery (`StepContext`, sub-step-major) with no new draw style.

### C5. Sonification tied to dynamics
- Map local divergence rate (from B4's ghost copy) to timbre or detune, so chaotic bursts sound different from laminar phases. Currently pitch, pan and cutoff only follow position.

---

## D. Export

### D1. Offline high-resolution render
- **What:** a headless script (the vet bundle plus node-canvas, or the browser via `OffscreenCanvas`) that accumulates millions of steps of one system into a 4K density image with log-tone mapping.
- **Buys:** poster-quality images that real-time trails can't produce.
- **Costs:** the vet script already bundles the real calculators; this is the same harness with a density buffer. The forge screening renders (PPM) were a prototype of it.

### D2. Seamless loop export
- GIF or WebM of a rotating focused tile over exactly one full turn, so it loops.

---

## Recommended order

| Wave | Contents | Why this order |
|------|----------|----------------|
| 5 | A1 CI, A2 tests, A3 DPR, A4 auto-fit, A5 clip, A6 light theme, A7 dt range, A8 AGENTS.md, A9 delete worker, A10 `ImageData` grid | Every later item lands faster and safer on a tested, crisp, self-fitting grid |
| 6 | B1 touch, B2 focus mode, B3 URL state, B5 a11y | Focus mode is the host for most of C |
| 7 | B4 divergence demo, C1 forge playground, C3 Poincaré | Highest science-per-line; all reuse existing code |
| 8 | C2 bifurcation explorer, C4 Page 5 (synchronisation), C5, D1, D2 | Largest items; C2 is the only one that justifies off-thread compute |

Not recommended now: a WebGL renderer. The Canvas 2D path is not yet the measured bottleneck (A3 and A10 come first), and a WebGL rewrite would discard the trail and glow pipeline.
