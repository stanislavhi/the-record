import type { Attractor, RGB } from './types';
import { rgbToHsl, hslToRgb } from './utils/colorUtils';

// Grid and rendering constants
export const GRID_SIZE = 2; // Max High Definition
export const DECAY_RATE = 0.9995;
export const ENERGY_COST = 0.5;
export const ENERGY_REGEN = 0.1;
export const INK_COLOR: RGB = { r: 80, g: 80, b: 80 };

// Isometric projection constants
export const ISO_Y = Math.PI / 4; // 45 deg
export const ISO_X = Math.atan(1 / Math.sqrt(2)); // ~35.264 deg

// Animation constants
export const SUB_STEPS = 20;

// Helper to initialize attractor points with color gradient
const initPoints = (x: number, y: number, z: number, color: RGB) => {
    const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
    return Array(10).fill(0).map((_, i) => ({
        x: x + i * 0.02,
        y: y + i * 0.02,
        z: z + i * 0.02,
        color: hslToRgb((h + i * 0.02) % 1, s, l)
    }));
};

// Initial attractor configurations
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
