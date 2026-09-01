#!/usr/bin/env node
// Numerically vets every attractor exactly as the app integrates it:
// forward Euler (or in-place map iteration) at the attractor's default dt,
// point 0 only. Reports bounds, orbit centre, spread, divergence resets,
// and the largest Lyapunov exponent (Benettin renormalisation).
//
//   npm run vet:attractors            # page 2 (originals)
//   npm run vet:attractors -- classic # page 1
//   npm run vet:attractors -- all
//
// Bundles the real TypeScript through esbuild so the numbers always match
// what ships in src/components/attractors/*.ts and src/components/constants.ts.

import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const which = process.argv[2] ?? 'original';
const pages = which === 'all' ? ['classic', 'original', 'menagerie'] : [which];

const STEPS = Number(process.env.VET_STEPS ?? 400000);
const TRANSIENT = Math.floor(STEPS / 10);

const dir = mkdtempSync(join(tmpdir(), 'vet-attractors-'));
const out = join(dir, 'bundle.mjs');
await build({
    stdin: {
        contents: `
            export { createInitialAttractors } from './src/components/constants.ts';
            export { calculateAttractorStep, isPointStable, resetPoint, isDiscrete } from './src/components/attractors/attractorCalculations.ts';
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
        const d = lib.calculateAttractorStep(type, pt, params, pt === p ? ctxP : ctxQ);
        if (!discrete) { pt.x += d.dx; pt.y += d.dy; pt.z += d.dz; }
    };

    let lyap = 0, lyapN = 0, resets = 0, n = 0;
    const sum = [0, 0, 0], sum2 = [0, 0, 0];
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < STEPS; i++) {
        step(p); step(q);
        if (!lib.isPointStable(p)) {
            lib.resetPoint(p); q.x = p.x + eps; q.y = p.y + eps; q.z = p.z + eps;
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
    const verdict = resets > 0 ? 'UNSTABLE' : le > 0.02 ? 'chaotic' : le > 0 ? 'weak' : 'not chaotic';
    return { type, le, resets, mean, sd, ext, verdict, discrete };
}

const f = (a) => a.map((v) => v.toFixed(2).padStart(6)).join(' ');
let failed = 0;
for (const page of pages) {
    console.log(`\n== page: ${page}  (steps=${STEPS})`);
    if (page === 'classic') {
        console.log('(informational — textbook Lyapunov values assume exact integration; this measures the app\'s Euler step)');
    }
    if (page === 'menagerie') {
        console.log('(informational — hidden-state, stochastic, conservative and interacting systems: the LE column only tracks the plotted point, so read bounds/centre/extent and treat LE as a rough hint)');
    }
    console.log('type        LE      resets  mean[x y z]           sd[x y z]             extent[x y z]         verdict');
    for (const a of lib.createInitialAttractors(page)) {
        const r = vet(a);
        // Only the originals are gated: their parameters were chosen by this script.
        if (page === 'original' && (r.verdict === 'UNSTABLE' || r.verdict === 'not chaotic')) failed++;
        console.log(
            `${r.type.padEnd(11)} ${r.le.toFixed(3).padStart(6)}  ${String(r.resets).padStart(5)}  ` +
            `[${f(r.mean)}]  [${f(r.sd)}]  [${f(r.ext)}]  ${r.verdict}${r.discrete ? ' (map)' : ''}`
        );
    }
}
rmSync(dir, { recursive: true, force: true });
if (failed) {
    console.error(`\n${failed} attractor(s) failed vetting`);
    process.exit(1);
}
