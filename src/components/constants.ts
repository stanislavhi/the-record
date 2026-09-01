import type { Attractor, AttractorPage, PerfConfig, PerfMode, RGB } from './types';
import { rgbToHsl, hslToRgb } from './utils/colorUtils';

export const GRID_SIZE = 2;
export const DECAY_RATE = 0.9995;
export const ENERGY_COST = 0.5;
export const ENERGY_REGEN = 0.1;
export const INK_COLOR: RGB = { r: 80, g: 80, b: 80 };

export const ISO_Y = Math.PI / 4;
export const ISO_X = Math.atan(1 / Math.sqrt(2));

export const SUB_STEPS = 20;

// Feature flag — when true, physics runs in a Web Worker with trajectory
// buffers transferred per frame. Default off: main-thread path is battle-tested.
// Flip to enable offload; toolbar stays on the main-thread draw pipeline either way.
export const USE_WORKER = false;

export const LAYOUT = {
    marginX: 20,
    marginTop: 30,
    marginBottom: 20,
    gap: 30,
    breakpoints: {
        mobile: 640,
        tablet: 1024,
    },
    cols: {
        mobile: 2,
        tablet: 3,
        desktop: 5,
    },
} as const;

export const CANVAS_STYLE = {
    fadeAlpha: 0.35,
    trailAlpha: 0.5,
    trailLineWidth: 2.5,
    shadowBlur: 10,
    rectStroke: 'rgba(50, 50, 50, 0.5)',
    introFont: '24px "JetBrains Mono"',
    introPulseMs: 500,
    henonGridBoost: 0.1,
    trailGridBoost: 0.05,
    henonStepInterval: 20,
    trailStepInterval: 2,
    henonDotSize: 4,
    gridIntensityDraw: 0.3,
    particleRadius: 2,
    particleLifeDecay: 0.01,
} as const;

export const Z_INDEX = {
    canvas: 0,
    overlay: 10,
    hud: 40,
    toolbar: 45,
    modal: 100,
} as const;

export const KEYBINDINGS = {
    pause: 'Space',
    resetAll: 'Escape',
    help: '?',
    stats: 'KeyS',
    theme: 'KeyT',
    mute: 'KeyM',
    tour: 'KeyN',
    randomize: 'KeyR',
    snapshot: 'KeyP',
    recordToggle: 'KeyV',
    pointsDec: 'Minus',
    pointsInc: 'Equal',
    page1: 'Digit1',
    page2: 'Digit2',
} as const;

export const PAGE_STORAGE_KEY = 'attractorPage';
export const DEFAULT_PAGE: AttractorPage = 'classic';

export const PERF_PRESETS: Record<PerfMode, PerfConfig> = {
    low: { subSteps: 1, maxPoints: 5, shadowBlur: 0 },
    med: { subSteps: 20, maxPoints: 10, shadowBlur: 10 },
    high: { subSteps: 40, maxPoints: 20, shadowBlur: 14 },
};

export const POINT_LIMITS = { min: 1, max: 50 } as const;
export const SPEED_LIMITS = { min: 0.001, max: 0.03, step: 0.001 } as const;
export const SCALE_LIMITS = { min: 0.1, max: 100, step: 0.1 } as const;

const initPoints = (x: number, y: number, z: number, color: RGB) => {
    const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
    return Array(10).fill(0).map((_, i) => ({
        x: x + i * 0.02,
        y: y + i * 0.02,
        z: z + i * 0.02,
        color: hslToRgb((h + i * 0.02) % 1, s, l)
    }));
};

/** Page 1 — the ten classics. */
export const createClassicAttractors = (): Attractor[] => [
    { type: 'lorenz', points: initPoints(0.1, 0, 0, { r: 255, g: 255, b: 255 }), color: { r: 255, g: 255, b: 255 }, params: { sigma: 10, rho: 28, beta: 8 / 3, dt: 0.008 }, scale: 2.1, offset: { x: 0, y: 0 }, rotation: { x: -1.3, y: 0, z: 0.4 } },
    { type: 'rossler', points: initPoints(0.1, 0.1, 0.1, { r: 255, g: 215, b: 0 }), color: { r: 255, g: 215, b: 0 }, params: { a: 0.2, b: 0.2, c: 5.7, dt: 0.02 }, scale: 2.4, offset: { x: 0, y: 0 }, rotation: { x: -1.4, y: 1.5, z: 0.5 } },
    { type: 'henon', points: initPoints(0, 0, 0, { r: 255, g: 0, b: 128 }), color: { r: 255, g: 0, b: 128 }, params: { a: 1.4, b: 0.3, dt: 0 }, scale: 40, offset: { x: 0, y: 0 } },
    { type: 'chua', points: initPoints(0.1, 0, 0, { r: 255, g: 100, b: 50 }), color: { r: 255, g: 100, b: 50 }, params: { alpha: 15.6, beta: 28, m0: -1.143, m1: -0.714, dt: 0.02 }, scale: 21, offset: { x: 0, y: 0 }, rotation: { x: -0.4, y: 0.6, z: 0.1 } },
    { type: 'sprott', points: initPoints(0.1, 0.1, 0.1, { r: 0, g: 220, b: 255 }), color: { r: 0, g: 220, b: 255 }, params: { a: 2.07, b: 1.79, dt: 0.015 }, scale: 18, offset: { x: 0, y: 0 }, rotation: { x: -0.5, y: 0, z: 0.5 } },
    { type: 'four_wing', points: initPoints(0.1, 0.1, 0.1, { r: 50, g: 255, b: 80 }), color: { r: 50, g: 255, b: 80 }, params: { a: 0.2, b: 0.01, c: -0.4, dt: 0.04 }, scale: 16, offset: { x: 0, y: 0 }, rotation: { x: -0.5, y: 1.5, z: 0.2 } },
    { type: 'rabinovich', points: initPoints(0.1, 0.1, 0.1, { r: 0, g: 250, b: 154 }), color: { r: 0, g: 250, b: 154 }, params: { alpha: 0.2, gamma: 0.1, dt: 0.01 }, scale: 35, offset: { x: 0, y: 0 }, rotation: { x: -0.8, y: 2.5, z: 0.5 } },
    { type: 'halvorsen', points: initPoints(0.1, 0, 0, { r: 255, g: 20, b: 180 }), color: { r: 255, g: 20, b: 180 }, params: { a: 1.89, dt: 0.01 }, scale: 6, offset: { x: 0, y: 0 }, rotation: { x: -0.8, y: 0, z: 0 } },
    { type: 'dadras', points: initPoints(0.1, 0.1, 0, { r: 255, g: 120, b: 255 }), color: { r: 255, g: 120, b: 255 }, params: { p: 3, q: 2.7, r: 1.7, s: 2, e: 9, dt: 0.002 }, scale: 7.2, offset: { x: 0, y: 0 }, rotation: { x: -1.0, y: 0, z: 0 } },
    { type: 'aizawa', points: initPoints(0.1, 0, 0, { r: 255, g: 140, b: 50 }), color: { r: 255, g: 140, b: 50 }, params: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1, dt: 0.01 }, scale: 24, offset: { x: 0, y: 0 }, rotation: { x: -1.3, y: 0, z: 0 } },
];

/**
 * Page 2 — ten originals. Parameters, scales and centres come from the
 * numerical sweep in `scripts/vet-attractors.mjs` (positive Lyapunov, bounded,
 * no Euler blow-ups at the default dt). `center` is the orbit's mean position
 * so systems that live away from the origin still sit in the middle of their tile.
 */
export const createOriginalAttractors = (): Attractor[] => [
    { type: 'sigil', points: initPoints(0.1, 0.1, 0.1, { r: 160, g: 80, b: 255 }), color: { r: 160, g: 80, b: 255 }, params: { a: 10, b: 30, c: 8 / 3, w: 0.6, dt: 0.008 }, scale: 9, offset: { x: 0, y: 0 }, rotation: { x: -1.1, y: 0.4, z: 0.2 }, center: { x: 0, y: 0, z: 2.4 } },
    { type: 'wick', points: initPoints(1, 1, 38, { r: 255, g: 200, b: 90 }), color: { r: 255, g: 200, b: 90 }, params: { a: 4, b: 40, c: 1, dt: 0.008 }, scale: 2.4, offset: { x: 0, y: 0 }, rotation: { x: -1.3, y: 0, z: 0.4 }, center: { x: 0, y: 0, z: 38.7 } },
    { type: 'cinder', points: initPoints(0.1, 0, 0, { r: 255, g: 70, b: 40 }), color: { r: 255, g: 70, b: 40 }, params: { a: 15.6, b: 28, m0: -1.5, m1: -0.3, dt: 0.01 }, scale: 20, offset: { x: 0, y: 0 }, rotation: { x: -0.4, y: 0.6, z: 0.1 } },
    { type: 'gyre', points: initPoints(0.1, 0.1, 0, { r: 0, g: 200, b: 180 }), color: { r: 0, g: 200, b: 180 }, params: { a: 3, b: 2.7, c: 2.5, d: 4, e: 9, k: 0.5, dt: 0.005 }, scale: 7, offset: { x: 0, y: 0 }, rotation: { x: -1.0, y: 0.3, z: 0 }, center: { x: 1, y: 0, z: 0.2 } },
    { type: 'moth', points: initPoints(0.1, 0.1, 0.1, { r: 255, g: 120, b: 180 }), color: { r: 255, g: 120, b: 180 }, params: { a: 4, b: 5, c: 0.1, dt: 0.015 }, scale: 9, offset: { x: 0, y: 0 }, rotation: { x: -0.6, y: 0.8, z: 0.3 } },
    { type: 'tidepool', points: initPoints(0.5, 0, 0.1, { r: 60, g: 220, b: 160 }), color: { r: 60, g: 220, b: 160 }, params: { a: 3, b: 0.2, c: 5, d: 0.05, e: 4, dt: 0.01 }, scale: 12, offset: { x: 0, y: 0 }, rotation: { x: -1.2, y: 0, z: 0 } },
    { type: 'ossuary', points: initPoints(0.1, 0.1, 0.1, { r: 200, g: 170, b: 255 }), color: { r: 200, g: 170, b: 255 }, params: { a: 1, k: 2, w: 5, dt: 0.01 }, scale: 22, offset: { x: 0, y: 0 }, rotation: { x: -0.8, y: 0.5, z: 0.2 } },
    { type: 'ripple', points: initPoints(0.1, 0.2, 0.3, { r: 120, g: 200, b: 255 }), color: { r: 120, g: 200, b: 255 }, params: { a: 2.24, b: 0.43, c: -0.65, d: -2.43, e: 0.6, dt: 0 }, scale: 60, offset: { x: 0, y: 0 } },
    { type: 'anvil', points: initPoints(0.1, 0, 0, { r: 170, g: 190, b: 210 }), color: { r: 170, g: 190, b: 210 }, params: { a: 1.2, b: 0.2, k: 2, dt: 0.01 }, scale: 28, offset: { x: 0, y: 0 }, rotation: { x: -0.7, y: 0.9, z: 0 } },
    { type: 'reed', points: initPoints(0.1, 0, 0, { r: 180, g: 255, b: 60 }), color: { r: 180, g: 255, b: 60 }, params: { a: 0.7, b: 2, c: 0.2, k: 2, dt: 0.01 }, scale: 20, offset: { x: 0, y: 0 }, rotation: { x: -0.9, y: -0.6, z: 0.1 }, center: { x: -0.3, y: 0, z: 0 } },
];

export const createInitialAttractors = (page: AttractorPage = DEFAULT_PAGE): Attractor[] =>
    page === 'original' ? createOriginalAttractors() : createClassicAttractors();

export const readSavedPage = (): AttractorPage => {
    if (typeof window === 'undefined') return DEFAULT_PAGE;
    const saved = window.localStorage.getItem(PAGE_STORAGE_KEY);
    return saved === 'original' || saved === 'classic' ? saved : DEFAULT_PAGE;
};
