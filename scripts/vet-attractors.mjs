#!/usr/bin/env node
// Numerically vets every attractor exactly as the app integrates it:
// the same advancePoint() the render loop uses (RK4 for the classics,
// forward Euler for the rest) or in-place map iteration, at the attractor's
// default dt, point 0 only. Reports bounds, orbit centre, spread, divergence resets,
// and the largest Lyapunov exponent (Benettin renormalisation).
//
//   npm run vet:attractors            # page 2 (originals)
//   npm run vet:attractors -- classic # page 1
//   npm run vet:attractors -- all
//
// Gate: every classic, original and forge system must be 'chaotic' (LE > 0.02, no resets);
// 'weak' fails. The menagerie is informational only.
//
// Bundles the real TypeScript through esbuild so the numbers always match
// what ships in src/components/attractors/*.ts and src/components/constants.ts.

import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const which = process.argv[2] ?? 'original';
const pages = which === 'all' ? ['classic', 'original', 'menagerie', 'forge'] : [which];

const STEPS = Number(process.env.VET_STEPS ?? 400000);
const TRANSIENT = Math.floor(STEPS / 10);

const dir = mkdtempSync(join(tmpdir(), 'vet-attractors-'));
const out = join(dir, 'bundle.mjs');
await build({
    stdin: {
        contents: `
            export { createInitialAttractors } from './src/components/constants.ts';
            export { advancePoint, calculateAttractorStep, isPointStable, resetPoint, isDiscrete } from './src/components/attractors/attractorCalculations.ts';
        `,
        resolveDir: process.cwd(),
        loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile: out,
    logLevel: 'silent',
});
const lib = await import(pathToFileURL(out).href);

const clone = (p) => ({ x: p.x, y: p.y, z: p.z, color: p.color });

function vet(attractor) {
    const { type, params } = attractor;
    const discrete = lib.isDiscrete(type);
    const dt = discrete ? 1 : params.dt;
    const p = clone(attractor.points[0]);
    const eps = 1e-7;
    const q = { ...p, x: p.x + eps, y: p.y + eps, z: p.z + eps };
    const d0 = Math.sqrt(3) * eps;

    // Each trajectory gets its own single-point context so hidden state and
    // neighbour lookups (Page 3) stay separate between the two copies.
    const ctxP = { points: [p], index: 0 };
    const ctxQ = { points: [q], index: 0 };
    const step = (pt) => {
        const ctx = pt === p ? ctxP : ctxQ;
        if (discrete) lib.calculateAttractorStep(type, pt, params, ctx);
        else lib.advancePoint(attractor, pt, ctx);
    };

    let lyap = 0, lyapN = 0, resets = 0, n = 0;
    const sum = [0, 0, 0], sum2 = [0, 0, 0];
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < STEPS; i++) {
        step(p); step(q);
        if (!lib.isPointStable(p)) {
            lib.resetPoint(p, attractor.home); q.x = p.x + eps; q.y = p.y + eps; q.z = p.z + eps;
            resets++; continue;
        }
        if (!lib.isPointStable(q)) { q.x = p.x + eps; q.y = p.y + eps; q.z = p.z + eps; }
        const dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z;
        const d = Math.hypot(dx, dy, dz);
        if (i >= TRANSIENT) {
            if (d > 0) { lyap += Math.log(d / d0); lyapN++; }
            const v = [p.x, p.y, p.z];
            for (let k = 0; k < 3; k++) {
                sum[k] += v[k]; sum2[k] += v[k] * v[k];
                if (v[k] < min[k]) min[k] = v[k];
                if (v[k] > max[k]) max[k] = v[k];
            }
            n++;
        }
        if (d > 0) { const s = d0 / d; q.x = p.x + dx * s; q.y = p.y + dy * s; q.z = p.z + dz * s; }
    }

    const le = lyapN ? lyap / (lyapN * dt) : NaN;
    const mean = sum.map((s) => s / n);
    const sd = sum2.map((s, k) => Math.sqrt(Math.max(0, s / n - mean[k] * mean[k])));
    const ext = max.map((m, k) => Math.max(Math.abs(m - mean[k]), Math.abs(min[k] - mean[k])));
    const verdict = resets > 0 ? 'UNSTABLE'
        : !Number.isFinite(le) ? 'n/a'
        : le > 0.02 ? 'chaotic' : le > 0 ? 'weak' : 'not chaotic';
    return { type, le, resets, mean, sd, ext, verdict, discrete };
}

/**
 * Whole-swarm check in the render loop's order: every point advances once per
 * sub-step (sub-step-major). The single-point LE above cannot see interacting
 * systems (N-body, boids) blow up; this can. Any reset fails the gate.
 */
const SWARM_SUBSTEPS = Number(process.env.VET_SWARM_STEPS ?? 60000);
function vetSwarm(attractor) {
    const discrete = lib.isDiscrete(attractor.type);
    const points = attractor.points.map(clone);
    const c = attractor.center ?? { x: 0, y: 0, z: 0 };
    let resets = 0, maxR = 0;
    for (let s = 0; s < SWARM_SUBSTEPS; s++) {
        for (let index = 0; index < points.length; index++) {
            const pt = points[index];
            if (discrete) lib.calculateAttractorStep(attractor.type, pt, attractor.params, { points, index });
            else if (lib.advancePoint(attractor, pt, { points, index })) resets++;
            const r = Math.hypot(pt.x - c.x, pt.y - c.y, pt.z - c.z);
            if (r > maxR) maxR = r;
        }
    }
    return { resets, maxR };
}

const f = (a) => a.map((v) => v.toFixed(2).padStart(6)).join(' ');
let failed = 0;
for (const page of pages) {
    console.log(`\n== page: ${page}  (steps=${STEPS})`);
    if (page === 'classic') {
        console.log('(classic flows integrate with RK4, so LE should track the textbook values)');
    }
    if (page === 'menagerie') {
        console.log('(informational — hidden-state, stochastic, conservative and interacting systems: the LE column only tracks the plotted point, so read bounds/centre/extent and treat LE as a rough hint)');
    }
    console.log('type        LE      resets  mean[x y z]           sd[x y z]             extent[x y z]         swarm resets/maxR   verdict');
    for (const a of lib.createInitialAttractors(page)) {
        const r = vet(a);
        const sw = vetSwarm(lib.createInitialAttractors(page).find((x) => x.type === a.type));
        // Classics and originals must be robustly chaotic; the menagerie LE is informational.
        // Every page must keep its full swarm bounded.
        const swarmOk = sw.resets === 0;
        if ((page !== 'menagerie' && r.verdict !== 'chaotic') || !swarmOk) failed++;
        console.log(
            `${r.type.padEnd(11)} ${(Number.isFinite(r.le) ? r.le.toFixed(3) : 'n/a').padStart(6)}  ${String(r.resets).padStart(5)}  ` +
            `[${f(r.mean)}]  [${f(r.sd)}]  [${f(r.ext)}]  ${String(sw.resets).padStart(5)} / ${sw.maxR.toFixed(2).padStart(7)}   ` +
            `${swarmOk ? r.verdict : 'SWARM UNSTABLE'}${r.discrete ? ' (map)' : ''}`
        );
    }
}
rmSync(dir, { recursive: true, force: true });
if (failed) {
    console.error(`\n${failed} attractor(s) failed vetting`);
    process.exit(1);
}
