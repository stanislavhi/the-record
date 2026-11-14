# CHECKPOINT — 2026-04-18

Session checkpoint before context reset. See `CLAUDE.md` for persistent conventions.

---

## Completed this session

### Wave 3 branch shipped (commit `d025bc6`, pushed)
Branch: `claude/wave-3-polish-and-heavy-hitters` off Wave 2 tip.

**Stage A — audit fixes:**
- A1: Recorder elapsed counter + 60 s soft cap (`CanvasRecorder.elapsedMs()`, `maxDurationMs()`, auto-stop timer; Toolbar shows `■ 00:12` while recording).
- A2: Tour grid spotlight (`spotlightIndex` dims non-current tiles to opacity 0.22, 300 ms transition).
- A3: Last-focused tile + keyboard reach (`lastFocusedIndexRef`, `Minus`/`Equal`/arrows/`M`; Ctrl/Cmd passthrough; tour nav priority).

**Stage B — Wave 3 heavy hitters:**
- B1: Perf mode toggle (Low/Med/High) — `PERF_PRESETS` swap + `localStorage('perfMode')` persistence.
- B2: Generative audio synth — `src/audio/AttractorSynth.ts` (10 sine voices → filter → pan → gain → master → compressor, 0.1 Hz LFO on cutoff), `src/hooks/useAttractorSynth.ts`, `src/components/AudioPanel.tsx`. Default muted, `M` to toggle, ducks on pause, gesture-gated start.
- B3: Web Worker scaffold — `src/workers/attractorWorker.ts` (init/step/setParams/setPointCount protocol, `Transferable` `Float32Array` trajectories), `src/hooks/useAttractorWorker.ts`. Gated by `USE_WORKER = false` in `constants.ts`.

**Stage B4 — docs + commit + push:**
- `docs/CHANGELOG.md` — `[1.4.0]` entry.
- `docs/ARCHITECTURE.md` — added `AudioPanel`, `audio/`, `workers/`, `useAttractorSynth`, `useAttractorWorker`.
- `docs/WALKTHROUGH.md` — Perf row, recorder elapsed note, new keyboard shortcuts, tour spotlight paragraph, Generative Audio + Performance Mode sections.
- `README.md` — new features, shortcuts, directory tree rows.
- `Interactive Attractor Controls.md` — Wave 3 milestone rows + session log block appended.

### PR #3 body fixed
PR #3 originally had Wave 1's title/body copy-pasted. Updated title to `feat: Wave 3 — pre-W3 polish + audio synth + perf mode + worker scaffold` and rewrote body to describe Stage A + Stage B deliverables.

### CLAUDE.md created
Repo now has `CLAUDE.md` with persistent session conventions: branch-per-wave strategy, PR hygiene rules, scope discipline ("later means later"), docs refresh checklist, verification gates, React 19 `react-hooks/refs` indirection pattern, worker type reference directive, `+/-` Ctrl/Cmd passthrough, last-focused-tile pattern, commit message style.

---

## Open branches / PRs

| Branch | PR | State |
|--------|----|-------|
| `claude/refactor-visual-improvements-cP2Sr` | [#1](https://github.com/stanislavhi/the-record/pull/1) | Open, correct title/body (Wave 1) |
| `claude/wave-2-features-and-theming` | [#2](https://github.com/stanislavhi/the-record/pull/2) | **Open, WRONG body** — still shows Wave 1 description |
| `claude/wave-3-polish-and-heavy-hitters` | [#3](https://github.com/stanislavhi/the-record/pull/3) | Open, title + body fixed this session |

## Current state — no task in progress

All Wave 3 work is shipped + pushed. PR #3 body corrected. Writing this checkpoint is the only active task.

## Open issues

1. **PR #2 (Wave 2) still has the Wave 1 title + body copy-pasted.** User was asked whether to also fix this; no response yet before the checkpoint request came in. Fix is a single `update_pull_request` call once confirmed — draft Wave 2 body based on commit `1032d99` (`feat: Wave 2 — info tooltips, palettes, randomizer, export, tour, light theme`).
2. **Web Worker not wired into draw pipeline.** `USE_WORKER` ships as `false`. `CHANGELOG.md` flags this as an intentional follow-up. Next step when revisited: in `TheVoid.tsx` render loop, when `USE_WORKER` is true, source trajectories from `useAttractorWorker.onFrame` instead of the inline `calculateAttractorStep` path.
3. **`useAttractorSimulation` / `useAnimationFrame` extraction deferred.** Plan called for a hook-ified render loop; shipped inline. Not urgent — only worth doing when the worker draw-pipeline swap happens (both touch the hot loop).
4. **User message "Wave 3 PR comments is wrong, it says wave 1"** — addressed for PR #3 only. PR #2 still needs the same fix.

## The exact next step

**Ask the user whether to also fix PR #2's title/body** (which currently has Wave 1's description). If yes:

```
mcp__github__update_pull_request(
  owner="stanislavhi",
  repo="the-record",
  pullNumber=2,
  title="feat: Wave 2 — info tooltips, palettes, randomizer, export, tour, light theme",
  body="<Wave 2 description — info tooltips, palette presets, per-tile + global randomizer, PNG + WebM export, narrative tour, light-theme tuning>"
)
```

Draft body should cover:
- `InfoTooltip.tsx` (hover/focus card with equations, Lyapunov, discoverer)
- Palette dropdown (Original / Neon / Pastel / Mono / Warm / Cold)
- Per-tile 🎲 + global 🎲 All (bounded randomizer)
- PNG snapshot + WebM recorder (before the 60 s cap added in Wave 3)
- `TourModal` narrative walkthrough
- Light theme tuning (glow 3→2, trailAlpha 0.65→0.72, `voidRGB` + `rectStroke` tokens)
- Keyboard shortcuts added in Wave 2 (R, P, V, N)

## Verification state at checkpoint

- `npm run lint` — clean (last run: after Stage B4)
- `npx tsc --noEmit` — clean (last run: after Stage B4)
- `npm run build` — clean, worker chunked separately (`attractorWorker-D8LqOuhQ.js`, ~2.6 kB)
- `git status` — uncommitted: `CLAUDE.md`, `CHECKPOINT.md` (this file). About to commit together as `checkpoint`.

## Key files to re-read on resume

1. `CLAUDE.md` — session conventions
2. `docs/CHANGELOG.md` — `[1.4.0]` entry describes what shipped
3. `/root/.claude/plans/create-a-branch-for-sequential-bonbon.md` — full Wave 3 plan + pre-W3 audit
4. This file for the "what's pending" picture
