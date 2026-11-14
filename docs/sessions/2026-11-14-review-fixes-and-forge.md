# 2026-11-14 — Branch review, fixes, engine split, Page 4 (the forge)

Design + verification note (no plan-mode round). Branch: `claude/wave-4-page-2-original-attractors`.

## Part 1 — Review fixes (CHANGELOG 1.5.1)

- The review found that the Page 1 flows were wrong under forward Euler: Rössler and Rabinovich–Fabrikant went periodic, and Halvorsen at 1.89 was chaotic only because of Euler error. Classics now run on RK4.
- The NaN latch, point-major stepping (Cluster pumped energy), the missing Tailwind config and the dead joystick are fixed. See the CHANGELOG for detail.
- `TheVoid.tsx` was split into `src/engine/` and hooks.
- The vet gate gained a whole-swarm check.

## Part 2 — Page 4, the forge (CHANGELOG 1.6.0)

**Rejected first draft.** Ten literature flows ("the archive"): Thomas, Chen, Arneodo, Burke–Shaw, Rucklidge, Shimizu–Morioka, Newton–Leipnik, Lorenz-84, Chen–Lee, Coullet. They looked too much like Pages 1 and 2, the user asked for something invented, and the draft was replaced before commit.

**Approach.** Keep proven chaos and change only the body. A smooth coordinate change is a conjugacy, so the Lyapunov spectrum is inherited and the vet gate passes by construction. That makes the vet a correctness check on the operator's Jacobian: if λ drifts from the base, the derivative is wrong.

| Operator | Formula | Requirement |
|----------|---------|-------------|
| n-fold cover | ξ = ζ^(2/n); ξ̇ = (2/n)·ξ^(1−n/2)·ζ̇ | base symmetric under (x, y, z) → (−x, −y, z) |
| twist | rotate (x, y) by k·z | none |
| inversion | p ↦ c + R²(p − c)/\|p − c\|² | c off the attractor |

**Screening.** A scratch script integrated each candidate with RK4. It measured λ (Benettin), checked ten-point swarm escapes over 40k steps, and recorded extents and means. A second script rendered the orbit in two or three coordinate planes to a PPM, and selection was done by eye from those renders.

**Changes during screening:**
- Burke–Shaw inverted about (0, 0, 3) still read as Burke–Shaw. Lantern became Chen–Lee inverted about (0, 0, −2) with R = 10, which looks like a pagoda in a ring when seen side-on.
- Vortex (twisted Rucklidge) read as a blob. It was replaced by Conch (Lorenz inverted beside one wing).
- Galaxy as a twisted 3-fold Chen–Lee cover was diffuse. A twisted 3-fold Rucklidge cover with k = 0.3 gives clean spiral arms.
- Lantern seeded from the raw base seed drew a transient arc into the neighbouring tile. It is now seeded from a point already on the base attractor.

**View.** The projection applies object X, then Y, then the camera's Y and X. With `FACE_CAMERA`, adding δ to `x` is therefore a clean tilt about the screen x-axis. Covers use δ = 0, a top-down view that shows the n-fold symmetry. Lantern uses π/2, the x–z plane.

**Verification.** All passed:
- `npx tsc --noEmit`;
- `eslint --max-warnings 0`;
- `vite build` (worker chunk 12 kB);
- `node scripts/vet-attractors.mjs all` (exit 0; all forge systems `chaotic`, 0 swarm resets);
- a headless Chrome screenshot of page 4, with no console errors.

| System | Base | Operator | λ |
|--------|------|----------|---|
| Trefoil | Lorenz | ×3 | 0.906 |
| Starfish | Lorenz | ×5 | 0.910 |
| Compass | Burke–Shaw | ×8 | 0.698 |
| Lantern | Chen–Lee | inversion | 0.144 |
| Crown | Rucklidge | ×4 | 0.198 |
| Conch | Lorenz | inversion | 0.901 |
| Lotus | Shimizu–Morioka | ×6 | 0.063 |
| Triskele | Four-Wing | ×3 | 0.065 |
| Quatrefoil | Chen–Lee | ×4 | 0.128 |
| Galaxy | Rucklidge | ×3 + twist | 0.196 |

**Not claimed.** No literature search was run on these specific combinations, and covers and inversions are established techniques. Lotus and Triskele are slow (λ ≈ 0.06) but sit well above the 0.02 gate.

## Part 3 — Merge and ideas

- `75aba4e` was reverted on Wave 1 (`10d3bdf`), not force-removed, so history is untouched and the stacked merges stayed conflict-free.
- PRs #1 → #4 were merged with merge commits rather than squash, which would have duplicated Wave 1's diff into every later PR.
- `main` was verified from a clean worktree: ci, tsc, lint, build and vet all exit 0.
- `docs/IDEAS.md` was opened as a docs-only PR on `claude/wave-5-ideas`.
