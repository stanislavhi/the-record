# Session plans archive

Plan-mode documents preserved alongside the code they produced, so each session's structured intent stays readable after the branch merges and the chat log scrolls away.

## Naming convention

`YYYY-MM-DD-<slug>.md` — date is when the plan was first drafted (not when code shipped). Slug should describe the plan, not just one wave of it, since a single plan may cover multiple waves.

## Files

| File | Span | Branches | Notes |
|------|------|----------|-------|
| [`2026-04-17-refactor-visual-improvements-master-plan.md`](./2026-04-17-refactor-visual-improvements-master-plan.md) | Waves 1 → 2 → 3 | `claude/refactor-visual-improvements-cP2Sr`, `claude/wave-2-features-and-theming`, `claude/wave-3-polish-and-heavy-hitters` | Living master plan. Parts 1–3 = Wave 1 (refactor + visual polish + UX reach). Part 4 = Wave 2 (tooltips, palettes, randomizer, export, tour). Parts 5–6 = Wave 3 (audio synth, perf mode, worker). Part 7 = theming (shipped across Waves 1+2). Pre-W3 audit section lists ship-vs-plan gaps. Final section = the approved Wave 3 execution order (Stage A + Stage B). |
| [`2026-09-01-wave-4-page-2-originals.md`](./2026-09-01-wave-4-page-2-originals.md) | Wave 4 | `claude/wave-4-page-2-original-attractors` | Design + vetting note (no plan-mode round). How the ten original attractors were searched for and chosen, the rejected candidates, measured Lyapunov table, page-toggle design, and the Euler side-finding on two Page 1 classics. |

## Convention

When a new multi-stage plan comes out of plan mode, copy it here **before** starting the work so later sessions can compare what was approved vs what actually shipped. When a session runs without plan mode, write a short design + verification note instead (see the Wave 4 file) so the session is still saved. One plan file per planning session is fine — a plan that evolves across multiple sessions (like this one) stays in its original file with audit + re-plan sections appended, rather than being split.

The `Interactive Attractor Controls.md` chat log captures the conversation. These plan files capture the structured intent that came out of it.
