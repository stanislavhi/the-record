# Wave 4 — Page 2: ten original attractors

**Date:** 2026-09-01
**Branch:** `claude/wave-4-page-2-original-attractors` (cut from the Wave 3 tip, `b4f2f66`)
**Mode:** no plan-mode round this time — the brief was open-ended ("have fun and add 10 more attractors yourself, try something that isn't known … a button that says page 2"), so this file records the design and the vetting evidence instead of an approved plan.

---

## Brief

> I want a new wave, you should have fun and add 10 more attractors yourself, try something that isnt known, ill check later in the code, you could also add a button that says page 2 and its your own creations

Read as three deliverables:

1. Ten new chaotic systems, designed rather than transcribed.
2. A **Page 2** toggle that swaps the whole grid for them, with Page 1 staying the classics.
3. Everything else (tooltips, tour, randomizer, palettes, synth, export) keeps working on both pages.

## Design constraints

- The render loop is forward Euler with `dt` baked into each delta, 20 sub-steps per frame at "Med" perf. Anything that only behaves under RK4 is out.
- The projection is a fixed isometric camera with per-attractor rotation and scale; there was no way to translate an orbit in attractor space, so systems that live away from the origin needed a new `center` field.
- `'henon'` was hard-coded in three places in the render loop and once in the worker as "the discrete one". Adding a second map meant generalising that to `DISCRETE_TYPES` / `isDiscrete()`.
- Exactly ten per page: the synth allocates ten voices, the desktop grid is 5 × 2, and the palettes have ten colours.

## How the ten were chosen

Method was Sprott-style search, but seeded by hand rather than fully random:

1. Write a candidate family as a twist on a known mechanism (Lorenz gain function, Chua nonlinearity, jerk restoring force, Nosé–Hoover forcing, rotation + radial pumping, folded map).
2. Sweep a small parameter grid (150k Euler steps each) and keep only combos with **no divergence resets**, **largest Lyapunov exponent > 0.01** (Benettin renormalisation), and **all three coordinates moving** (σ > 0.05).
3. Re-verify the finalists at 400k steps through the *actual* TypeScript (esbuild-bundled), which is now `scripts/vet-attractors.mjs`.
4. Screenshot both themes and tune scale / centre / colour / initial point.

Pure random search over sparse quadratic systems was also tried (6 000 candidates) and produced only four bounded-chaotic hits, all with drifting means — hand-seeded families were far more productive.

### Rejected on the way

| Candidate | Why it was dropped |
|-----------|-------------------|
| `helixion`, `antler` | chaotic but visually just Lorenz |
| `lantern` (Rössler + y² pump) | only chaotic when the new term was ≈ 0 — i.e. it was Rössler |
| `dynamo` | only chaotic with the cubic brake at 0 — i.e. it was Rikitake |
| `glassine` | too close to Aizawa (one term differs) |
| `drift` (delayed Hénon) | a known map |
| `kelp` (Thomas + cross terms) | weak (LE 0.05) and mostly Thomas |
| `bramble`, `quill`, `loom`, `ferro`, `quartz`, `prism`, `tangle`, `gyre-v1`, `cascade`, `ember`, `lantern2/3` | no bounded-chaotic regime found in the grid, or LE too small |

## The roster (Page 2)

| # | Name | Type | LE (measured) | Mechanism |
|---|------|------|---------------|-----------|
| 1 | Sigil | flow | 1.40 | Lorenz, `(ρ − z)` → `b·cos(wz)` |
| 2 | Wick | flow | 1.00 | Lorenz, `xy` → `\|xy\|` on dz; orbit centred at z ≈ 38.7 |
| 3 | Cinder | flow | 0.73 | Chua, piecewise diode → tanh |
| 4 | Gyre | flow | 0.98 | Dadras + `k·cos(x)` on dz |
| 5 | Moth | flow | 0.20 | `dz = b − a·y·tanh(y) − cz` thermostat |
| 6 | Tidepool | flow | 0.28 | rotation with `z − d·r²` radial gain; `dz = a − bz − x² + ey` |
| 7 | Ossuary | flow | 0.10 | Nosé–Hoover + `k·sin(wx)` |
| 8 | Ripple | map | 0.39 / iter | `x' = sin(ay) − z·cos(bx)`, `y' = z·sin(cx) − cos(dy)`, `z' = e·sin(x)` |
| 9 | Anvil | flow | 0.11 | jerk, `k·sin(x) − b·x³` |
| 10 | Reed | flow | 0.10 | jerk, `k·sgn(x)√\|x\| − c·x³` |

Full `npm run vet:attractors -- all` output at ship time:

```
== page: original  (steps=400000)
type        LE      resets  mean[x y z]           sd[x y z]             extent[x y z]         verdict
sigil        1.400      0  [ -0.03  -0.03   2.42]  [  2.56   3.09   0.68]  [  6.71   9.99   2.56]  chaotic
wick         1.004      0  [ -0.09  -0.09  38.72]  [  5.83   7.87   8.09]  [ 16.68  34.93  44.18]  chaotic
cinder       0.729      0  [ -0.00   0.00   0.00]  [  1.48   0.30   2.33]  [  2.35   0.64   4.78]  chaotic
gyre         0.981      0  [  0.99  -0.09   0.17]  [  3.22   2.03   2.38]  [ 20.33  10.25  20.08]  chaotic
moth         0.196      0  [ -0.00  -0.00   0.02]  [  1.87   1.84   2.11]  [  7.33  14.22   8.85]  chaotic
tidepool     0.283      0  [ -0.22  -0.11   0.14]  [  1.57   1.40   2.91]  [ 11.00  10.11  10.18]  chaotic
ossuary      0.098      0  [  0.00  -0.00   0.04]  [  0.84   1.00   0.72]  [  4.48   4.61   4.22]  chaotic
ripple       0.390      0  [ -0.03  -0.06  -0.01]  [  0.87   0.71   0.41]  [  1.56   1.43   0.60]  chaotic (map)
anvil        0.114      0  [  0.00   0.00   0.00]  [  1.79   1.26   1.26]  [  3.13   2.91   3.40]  chaotic
reed         0.104      0  [ -0.10   0.00  -0.00]  [  2.03   1.44   2.04]  [  3.89   3.82   5.18]  chaotic
```

## Side finding (not fixed here)

Running the same script on Page 1 shows Rössler (dt 0.02) and Rabinovich–Fabrikant (dt 0.01) with a largest exponent ≈ 0: under the app's Euler step they settle onto periodic orbits. Textbook values assume exact integration. Candidate for a later wave: lower default dt for those two, or an RK2/RK4 option in perf mode.

## Page toggle

- Toolbar button `Page 2 ✦` (turns into `Page 1`, active-styled, on Page 2); keys `1` / `2` with Ctrl/Cmd/Alt passthrough.
- `handlePageChange` in `TheVoid.tsx` rebuilds `attractors.current`, resets focus / speeds / palette / tour / phase, clears trails, re-lays out tiles. Persisted in `localStorage('attractorPage')`, read in the `useState` initialiser so the saved page renders on first paint.
- Tour follows the active page (`pageTypes` state), tooltip + tour show an **original** badge.
- Worker is not re-inited on switch — it is still gated off by `USE_WORKER`.

## Honesty note

"Original" here means designed from the mechanism up and not copied from a reference. No literature search was run to certify that none of the ten coincides with a published system; the blurbs and the tour line say so.

## Verification at ship

- `npm run lint` clean, `npx tsc --noEmit` clean, `npm run build` clean (worker chunk 3.98 kB).
- `npm run vet:attractors` — 10/10 pass.
- Playwright against `vite preview`: page toggle, `1`/`2` keys, localStorage persistence across reload, tour heading on Page 2, tooltip badge, both themes. No page errors.
