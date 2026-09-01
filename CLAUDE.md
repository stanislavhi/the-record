# CLAUDE.md — Session conventions for The Record

Working notes for Claude Code across sessions. `AGENTS.md` covers the project's *how*; this file covers the *workflow* — branch strategy, PR hygiene, docs discipline, repo-specific gotchas.

---

## Branch strategy

Work ships in **waves**, one branch per wave, each cut from the previous wave's tip. Never squash waves into a single branch.

| Wave | Branch | Scope |
|------|--------|-------|
| 1 | `claude/refactor-visual-improvements-cP2Sr` | Split TheVoid + core UX |
| 2 | `claude/wave-2-features-and-theming` | Tooltips, palettes, randomizer, export, tour, light theme |
| 3 | `claude/wave-3-polish-and-heavy-hitters` | Audit fixes + perf mode + audio synth + worker scaffold |
| 4 | `claude/wave-4-page-2-original-attractors` | Page 2 — ten original attractors; Page 3 — the menagerie; page group + vetting script |

Each wave opens its own PR against `main`. Don't merge a later wave before the earlier one.

A new wave starts with `git checkout -b claude/wave-N-<slug> origin/<previous-wave-branch>` and `git branch --unset-upstream` (so the first push goes to the new name, not the previous wave's). The container resets between sessions — expect to `git fetch` and re-`npm ci` first.

## PR hygiene

- **Write the PR body to match the branch.** When you open a PR via a fresh `create_pull_request` call, GitHub does *not* auto-copy a previous PR's body — but it's easy to paste the wrong one. Always read the branch's commit log first and draft the body from that.
- **Keep titles ≤ 70 chars.** Put details in the body.
- **Don't open a PR unless the user asks.** Push the branch, then wait.

## Scope discipline

- When the user says "later" or "defer" for a wave, **do not ship it** — even if a prior plan-mode exchange enumerated the scope. Plan approval is not standing authorization; each wave gets its own "go".
- Before starting a new wave, **audit** the prior wave's ship-vs-plan delta. Gap examples from this repo: tour grid spotlight, recorder 60 s cap, last-focused-tile keyboard shortcuts — all advertised in the help modal before they were wired.

## Docs refresh checklist (per wave)

Touch all five, in this order:

1. `docs/CHANGELOG.md` — new `[x.y.0] — <date> — Wave N` entry (Added / Changed / Fixed / Notes)
2. `docs/ARCHITECTURE.md` — new files/dirs in the tree, new hook rows, updated component descriptions
3. `docs/WALKTHROUGH.md` — new toolbar entries, new keyboard shortcuts, new sections for user-visible features
4. `README.md` — Features list, keyboard shortcut table, directory tree
5. `Interactive Attractor Controls.md` — milestone row(s) + appended session log block (User Input / Planner Response turns)
6. `docs/sessions/YYYY-MM-DD-<slug>.md` + its README row — the plan (if plan mode was used) or a design/verification note (if not). The user asked for every session to be saved here.
7. `CHECKPOINT.md` — refresh so it reflects the branch you are leaving, not the one you inherited.

The chat-log file has bitten us before ("its missing out conversation from today"). Always append the session before committing. Session headings in the chat log should not carry a model identifier — say "Claude Code on Web".

## Verification gates

Before any commit:

```bash
npm run lint             # eslint, must be 0 warnings
npx tsc --noEmit         # typecheck, must be clean
npm run build            # optional but run it before heavy-feature commits
npm run vet:attractors   # required after touching any attractor coefficient / dt / init point
```

The worker file should bundle as a separate Vite chunk (e.g. `attractorWorker-*.js`, ~2–4 kB). If it doesn't, the `new URL(..., import.meta.url)` pattern is wrong.

For anything visual, serve the build (`npx vite preview --port 4173`) and screenshot with the pre-installed Chromium via the global `playwright` package (`NODE_PATH=$(npm root -g)`, `executablePath: '/opt/pw-browsers/chromium'`). Route-abort `fonts.googleapis.com` / `fonts.gstatic.com` in the script — the sandbox blocks them and the resets show up as console errors that are not the app's fault.

## Repo-specific gotchas

### React 19 lint rules (`react-hooks/refs`, `react-hooks/purity`)
- **Never write a ref during render.** Sync refs inside `useEffect`.
- **Never read `performance.now()` or other impure calls during render.** Move to effects.
- Long-lived effects (the RAF loop) should not capture hook objects that can change identity. Use a `somethingRef.current = hookValue` indirection inside a small `useEffect`, then read the ref from the loop.
  ```ts
  const synthRef = useRef(audio.synth);
  useEffect(() => { synthRef.current = audio.synth; }, [audio.synth]);
  // render loop reads synthRef.current, not audio.synth
  ```

### Canvas + theme bridge
Canvas can't read Tailwind. `src/utils/themeTokens.ts` exposes `getThemeTokens()` that reads CSS variables from `document.documentElement`. Call it **each frame** (cheap) or at minimum on theme change. Adding a new theme-dependent color means: add CSS var → add Tailwind mapping → add to `getThemeTokens()`.

### Feature flags for scaffolded infra
When shipping infrastructure whose integration is deferred (e.g. the Web Worker), gate it with a `const USE_WORKER = false` in `src/components/constants.ts` and **document the gap in the CHANGELOG** under Notes. Don't leave the code looking complete when it isn't.

### Audio / autoplay
`AudioContext` must be constructed inside a user gesture (the merge click). Default muted, default volume 0.1. Duck to silence on pause via `setTargetAtTime(0, now, 0.1)`.

### Worker types
Worker files need `/// <reference lib="webworker" />` at the top so `DedicatedWorkerGlobalScope` resolves without leaking WebWorker types into the main app's `tsconfig`.

### `+`/`-` keyboard bindings
Always Ctrl/Cmd-passthrough (`if (e.ctrlKey || e.metaKey) return;`) so browser zoom still works. The `KEYBINDINGS` map uses `e.code` values `Minus` and `Equal` (not `Plus`).

### Last-focused tile
`lastFocusedIndexRef` lives in `TheVoid.tsx` and is updated from `AttractorTile.onFocusCapture` + `onPointerEnter`. Keyboard shortcuts (`+/-`, arrows, `M`) dispatch to that index. Tour nav (`←`/`→`) takes priority while the tour modal is open.

### Adding an attractor (Wave 4 pattern)
1. Add the type name to `ClassicAttractorType`, `OriginalAttractorType` or `MenagerieAttractorType` in `types.ts`.
2. Add the calculator to the matching `*Calculations.ts`. Maps and hidden-state systems mutate `pt` and return a zero delta. Anything drawn as dust needs a `DrawStyle` entry (`mode: 'dots'`) — never test `type === 'henon'` in the render loop; use `getDrawStyle()`.
3. Add an `ATTRACTOR_INFO` entry (tooltip + tour) — `badge: 'original'` / `'menagerie'` plus the shared `note`.
4. Add the roster entry in `constants.ts` with `params`, `scale`, `rotation`, and `center` (the orbit's mean position, from the vet script) if the orbit is off-origin. Flat systems use `FACE_CAMERA` (add `z: Math.PI` if "up" must point up).
5. Run `npm run vet:attractors` and copy the measured Lyapunov exponent into the info entry (Page 2 only — Page 3 is informational there, so probe sensitivity by hand). Then screenshot both themes: pale colours (ivory, bone, pure white) vanish on the light theme.
6. Pages are exactly ten each — the synth allocates ten voices and the grid is 5 × 2 on desktop.

### Hidden-state systems (Page 3 pattern)
- Keep per-point memory in a module-level `WeakMap<object, State>` keyed by the point object, and per-tile memory keyed by `ctx.points` (the array). `stateOf(store, key, init)` lazily creates it. Never add fields to `Point3D`.
- Calculators receive `ctx?: StepContext = { points, index }`. Treat it as optional — the worker and the vet script may call without it (`ctxOf(pt, ctx)` falls back to a single-point context).
- Interacting systems that need all accelerations per sub-step compute them when `ctx.index === 0` and cache in the per-tile state (see Cluster).
- `resetPoint()` cannot see hidden state: guard your own state for non-finite values and reinitialise inside the calculator.
- Never normalise a velocity to a constant magnitude when a wall force is supposed to turn the agent around — cap it instead (Murmuration bug, fixed in Wave 4).
- The vet script's LE column is meaningless for these (it perturbs the plotted point only). Probe sensitivity with two copies released 1e-6 apart and print the separation over time.

### Page switch
`handlePageChange` in `TheVoid.tsx` is the only place `attractors.current` is replaced. Anything that caches per-attractor state (speeds, palette, tour index, focused tile) must be reset there. The worker is not re-inited on switch (gated off anyway).

---

## Commit message style

- `feat: <wave name> — <short summary>` for wave commits
- `fix: <area>: <what>` for bug fixes
- `docs: <what>` for pure doc commits
- Body: grouped bullet sections (Audit fixes / Wave 3 heavy hitters / Docs). End with the standard `https://claude.ai/code/session_...` trailer.

## What NOT to do

- Don't run `git amend` or force-push to shared branches without explicit user permission.
- Don't skip `--no-verify` on commits.
- Don't create docs files proactively — only when the user asks (this file included).
- Don't ship Wave N+1 when the user said "later" about Wave N+1.
- Don't paste a prior PR's body into a new PR.
