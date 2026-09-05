import type { AttractorParams, Point3D } from '../types';

export interface Delta {
    dx: number;
    dy: number;
    dz: number;
}

/**
 * Extra context handed to calculators that need more than one point:
 * the tile's full point list (for interacting systems such as N-body and
 * flocking) and the index of the point being stepped. Optional — the
 * classic and original calculators ignore it, and the worker/vet script
 * may call without it.
 */
export interface StepContext {
    points: Point3D[];
    index: number;
}

/**
 * One physics step. Continuous flows return a delta (already multiplied by dt);
 * maps and hidden-state systems mutate `pt` in place and return a zero delta.
 */
export type AttractorCalculator = (pt: Point3D, params: AttractorParams, ctx?: StepContext) => Delta;

/** How the render loop should draw a system. */
export interface DrawStyle {
    /** `trail` strokes a line through every sub-step; `dots` stamps a glowing square. */
    mode: 'trail' | 'dots';
    /** Step the system every N sub-steps (1 = every sub-step). */
    stepInterval: number;
}
