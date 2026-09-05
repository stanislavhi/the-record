export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface Point3D {
    x: number;
    y: number;
    z: number;
    color: RGB;
}

export interface Rotation3D {
    x: number;
    y: number;
    z: number;
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** Page 1 — the ten textbook systems. */
export type ClassicAttractorType =
    | 'lorenz'
    | 'rossler'
    | 'henon'
    | 'chua'
    | 'sprott'
    | 'four_wing'
    | 'rabinovich'
    | 'halvorsen'
    | 'dadras'
    | 'aizawa';

/** Page 2 — ten systems invented for The Record (see attractors/originalCalculations.ts). */
export type OriginalAttractorType =
    | 'sigil'
    | 'wick'
    | 'cinder'
    | 'gyre'
    | 'moth'
    | 'tidepool'
    | 'ossuary'
    | 'ripple'
    | 'anvil'
    | 'reed';

/**
 * Page 3 — ten systems from ten different classes of dynamics (IFS, complex
 * map, cellular automaton, billiard, Hamiltonian, N-body, delay equation,
 * flocking, quasi-periodic, impact). See attractors/menagerieCalculations.ts.
 */
export type MenagerieAttractorType =
    | 'thicket'
    | 'dendrite'
    | 'colony'
    | 'stadium'
    | 'pendulum'
    | 'cluster'
    | 'echo'
    | 'murmuration'
    | 'loom'
    | 'rebound';

export type AttractorType = ClassicAttractorType | OriginalAttractorType | MenagerieAttractorType;

/** Which set of ten is on screen. */
export type AttractorPage = 'classic' | 'original' | 'menagerie';

export const ATTRACTOR_PAGES: readonly AttractorPage[] = ['classic', 'original', 'menagerie'];

export interface AttractorParams {
    dt: number;
    [key: string]: number;
}

export interface Attractor {
    type: AttractorType;
    points: Point3D[];
    color: RGB;
    params: AttractorParams;
    scale: number;
    offset: { x: number; y: number };
    rect?: Rect;
    rotation?: Rotation3D;
    /** Attractor-space point that should sit at the tile centre (subtracted before projection). */
    center?: Rotation3D;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color?: RGB;
}

export interface OverlayItem {
    index: number;
    type: AttractorType;
    rect: Rect;
    rotation: Rotation3D;
    color: RGB;
    scale: number;
    pointCount: number;
}

export type Theme = 'dark' | 'light';

export type PerfMode = 'low' | 'med' | 'high';

export interface ThemeTokens {
    void: string;
    voidRGB: string;
    rectStroke: string;
    inkHigh: string;
    inkLow: string;
    grid: string;
    glow: number;
    trailAlpha: number;
    gridIntensity: number;
    fadeAlpha: number;
}

export interface PerfConfig {
    subSteps: number;
    maxPoints: number;
    shadowBlur: number;
}
