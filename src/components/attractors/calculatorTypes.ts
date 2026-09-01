import type { AttractorParams, Point3D } from '../types';

export interface Delta {
    dx: number;
    dy: number;
    dz: number;
}

/**
 * One physics step. Continuous flows return a delta (already multiplied by dt);
 * discrete maps mutate `pt` in place and return a zero delta.
 */
export type AttractorCalculator = (pt: Point3D, params: AttractorParams) => Delta;
