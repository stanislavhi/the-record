import type { Attractor, ThemeTokens } from '../components/types';
import { CANVAS_STYLE } from '../components/constants';
import { project } from '../components/utils/projection';
import { advancePoint, calculateAttractorStep, getDrawStyle } from '../components/attractors/attractorCalculations';
import type { TrailGrid } from './trailGrid';

export interface AttractorFrameOptions {
    tokens: ThemeTokens;
    subSteps: number;
    /** shadowBlur for strokes and dots (already capped by the perf preset). */
    glow: number;
    centerX: number;
    centerY: number;
}

/**
 * Steps and draws every attractor for one frame, each clipped to its tile.
 * Trail systems advance every sub-step and are stroked as one glowing path per
 * point; dot systems iterate in place every `stepInterval` sub-steps and are
 * stamped as squares. Both deposit into the trail grid.
 */
export const drawAttractors = (
    ctx: CanvasRenderingContext2D,
    attractors: Attractor[],
    grid: TrailGrid,
    opts: AttractorFrameOptions
): void => {
    const { tokens } = opts;

    for (const attractor of attractors) {
        const rect = attractor.rect;
        if (rect) {
            ctx.strokeStyle = tokens.rectStroke;
            ctx.lineWidth = 1;
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            ctx.save();
            ctx.beginPath();
            ctx.rect(rect.x, rect.y, rect.w, rect.h);
            ctx.clip();
        }

        if (getDrawStyle(attractor.type).mode === 'dots') drawDots(ctx, attractor, grid, opts);
        else drawTrails(ctx, attractor, grid, opts);

        if (rect) ctx.restore();
    }
};

/*
 * Stepping is sub-step-major: every point advances once per sub-step before
 * any point advances again. Interacting systems (Cluster's N-body, Murmuration's
 * boids, Colony's shared torus) compute forces from their neighbours' current
 * positions, so point-major order (all 20 sub-steps of point 0, then point 1)
 * would integrate each body against a frozen, stale swarm and pump energy into
 * the system. Independent systems are unaffected by the order.
 */

// Projected path per point, reused across frames: (subSteps + 1) vertices each.
let pathX = new Float32Array(0);
let pathY = new Float32Array(0);
let pathBreak = new Uint8Array(0);

const ensurePathCapacity = (n: number) => {
    if (pathX.length >= n) return;
    pathX = new Float32Array(n);
    pathY = new Float32Array(n);
    pathBreak = new Uint8Array(n);
};

const drawTrails = (ctx: CanvasRenderingContext2D, attractor: Attractor, grid: TrailGrid, opts: AttractorFrameOptions) => {
    const { tokens, subSteps, glow, centerX, centerY } = opts;
    const points = attractor.points;
    const stride = subSteps + 1;
    ensurePathCapacity(points.length * stride);

    points.forEach((pt, i) => {
        const p = project(pt.x, pt.y, pt.z, attractor, centerX, centerY);
        pathX[i * stride] = p.x;
        pathY[i * stride] = p.y;
    });

    for (let step = 0; step < subSteps; step += 1) {
        const deposit = step % CANVAS_STYLE.trailStepInterval === 0;
        for (let i = 0; i < points.length; i += 1) {
            const pt = points[i];
            const wasReset = advancePoint(attractor, pt, { points, index: i });
            const p = project(pt.x, pt.y, pt.z, attractor, centerX, centerY);
            const v = i * stride + step + 1;
            pathX[v] = p.x;
            pathY[v] = p.y;
            pathBreak[v] = wasReset ? 1 : 0; // a reset teleports the point home: lift the pen
            if (deposit) grid.deposit(p.x, p.y, CANVAS_STYLE.trailGridBoost, pt.color);
        }
    }

    ctx.lineWidth = CANVAS_STYLE.trailLineWidth;
    ctx.lineCap = 'round';
    ctx.shadowBlur = glow;
    points.forEach((pt, i) => {
        const { r, g, b } = pt.color;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${tokens.trailAlpha})`;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1.0)`;
        ctx.beginPath();
        const base = i * stride;
        ctx.moveTo(pathX[base], pathY[base]);
        for (let v = base + 1; v < base + stride; v += 1) {
            if (pathBreak[v]) ctx.moveTo(pathX[v], pathY[v]);
            else ctx.lineTo(pathX[v], pathY[v]);
        }
        ctx.stroke();
    });
    ctx.shadowBlur = 0;
};

const drawDots = (ctx: CanvasRenderingContext2D, attractor: Attractor, grid: TrailGrid, opts: AttractorFrameOptions) => {
    const { subSteps, glow, centerX, centerY } = opts;
    const { stepInterval } = getDrawStyle(attractor.type);
    const points = attractor.points;
    const size = CANVAS_STYLE.henonDotSize;

    ctx.shadowBlur = glow;
    for (let step = 0; step < subSteps; step += stepInterval) {
        for (let i = 0; i < points.length; i += 1) {
            const pt = points[i];
            calculateAttractorStep(attractor.type, pt, attractor.params, { points, index: i });
            const p = project(pt.x, pt.y, pt.z, attractor, centerX, centerY);
            grid.deposit(p.x, p.y, CANVAS_STYLE.henonGridBoost, pt.color);
            const { r, g, b } = pt.color;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1.0)`;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1.0)`;
            ctx.fillRect(p.x, p.y, size, size);
        }
    }
    ctx.shadowBlur = 0;
};
