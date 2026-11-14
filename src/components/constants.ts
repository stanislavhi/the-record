import type { Attractor, PerfConfig, PerfMode, RGB } from './types';
import { rgbToHsl, hslToRgb } from './utils/colorUtils';

export const GRID_SIZE = 2;
export const DECAY_RATE = 0.9995;
export const ENERGY_COST = 0.5;
export const ENERGY_REGEN = 0.1;
export const INK_COLOR: RGB = { r: 80, g: 80, b: 80 };

export const ISO_Y = Math.PI / 4;
export const ISO_X = Math.atan(1 / Math.sqrt(2));

export const SUB_STEPS = 20;

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
} as const;

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

export const createInitialAttractors = (): Attractor[] => [
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
