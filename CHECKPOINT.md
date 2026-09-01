# CHECKPOINT — 2026-09-01

Session checkpoint. See `CLAUDE.md` for persistent conventions and `docs/sessions/` for per-session notes.

---

## Completed this session — Wave 4

Branch: `claude/wave-4-page-2-original-attractors`, cut from the Wave 3 tip (`b4f2f66`).

- **Ten original attractors** in `src/components/attractors/originalCalculations.ts`: Sigil, Wick, Cinder, Gyre, Moth, Tidepool, Ossuary, Ripple (discrete map), Anvil, Reed. Info entries (equations, measured Lyapunov, blurb, `original: true`) in `attractorInfo.ts`; roster with params / scale / rotation / `center` in `constants.ts` (`createOriginalAttractors`).
- **Page toggle**: Toolbar `Page 2 ✦` / `Page 1` button, `1` / `2` keys, `localStorage('attractorPage')`, `handlePageChange` in `TheVoid.tsx`, tour follows the page, Stats phase `PAGE 2: ORIGINALS`.
- **Engine generalisation**: `AttractorType = ClassicAttractorType | OriginalAttractorType`, `AttractorPage`, `Attractor.center` (subtracted in `projection.ts`), `DISCRETE_TYPES` / `isDiscrete()` replacing hard-coded `'henon'` checks in the render loop and worker, shared `calculatorTypes.ts`.
- **Vetting script**: `scripts/vet-attractors.mjs` + `npm run vet:attractors [classic|original|all]`. Bundles the real TS via esbuild; 400k Euler steps; fails on unstable / non-chaotic originals.
- **UI**: `original` badge in `InfoTooltip`, "Page 2 original" line in `TourModal`, `1 / 2` row in `HelpModal`.
- **Docs**: CHANGELOG `[1.5.0]`, ARCHITECTURE, WALKTHROUGH, README, chat log milestone rows + session block, `docs/sessions/2026-09-01-wave-4-page-2-originals.md`, CLAUDE.md (Wave 4 row, add-an-attractor recipe, page-switch note, vet + screenshot gates), this file.

## Previously (earlier sessions, all on origin)

- Waves 1–3 shipped on their own branches; PRs #1, #2, #3 all titled `feat: Wave N — …` with matching bodies.
- `docs/sessions/2026-04-17-refactor-visual-improvements-master-plan.md` archives the three-wave plan.

## Open branches / PRs

| Branch | PR | State |
|--------|----|-------|
| `claude/refactor-visual-improvements-cP2Sr` | [#1](https://github.com/stanislavhi/the-record/pull/1) | Open, Wave 1 |
| `claude/wave-2-features-and-theming` | [#2](https://github.com/stanislavhi/the-record/pull/2) | Open, Wave 2 |
| `claude/wave-3-polish-and-heavy-hitters` | [#3](https://github.com/stanislavhi/the-record/pull/3) | Open, Wave 3 |
| `claude/wave-4-page-2-original-attractors` | — | Pushed; **no PR opened** (user has not asked for one) |

## Open issues

1. **Euler side-finding on Page 1.** `npm run vet:attractors -- classic` shows Rössler (dt 0.02) and Rabinovich–Fabrikant (dt 0.01) with largest exponent ≈ 0 — periodic under the app's integrator. Not touched in Wave 4. Fix candidates: lower default dt for those two, or an RK2/RK4 path.
2. **Web Worker still gated off** (`USE_WORKER = false`) and not re-inited on page switch. Deferred with the draw-pipeline swap.
3. **Novelty not certified.** The ten originals were designed from mechanism up and vetted numerically; no literature search was run. Blurbs and the tour say so.
4. **`useAttractorSimulation` / `useAnimationFrame` extraction** still deferred (touch it together with the worker swap).

## The exact next step

Nothing pending. If the user asks for a PR for Wave 4: title `feat: Wave 4 — Page 2: ten original attractors + page toggle + vet script`, body from `docs/CHANGELOG.md` `[1.5.0]` (sections: Originals / Page toggle / Engine generalisation / Vetting / Docs / Verification), end with the standard trailer.

## Verification state at checkpoint

- `npm run lint` — clean
- `npx tsc --noEmit` — clean
- `npm run build` — clean; `attractorWorker-*.js` chunk 3.98 kB
- `npm run vet:attractors` — 10/10 originals pass
- Playwright smoke against `vite preview` — page toggle, keys, persistence, tour, tooltip, both themes; no page errors

## Key files to re-read on resume

1. `CLAUDE.md` — conventions (incl. the add-an-attractor recipe)
2. `docs/sessions/2026-09-01-wave-4-page-2-originals.md` — why these ten, what was rejected, measured numbers
3. `src/components/TheVoid.tsx` → `handlePageChange` — the only place the roster is swapped
4. `scripts/vet-attractors.mjs` — run it before changing any coefficient
