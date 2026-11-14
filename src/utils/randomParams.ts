import type { Attractor, RGB, Rotation3D } from '../components/types';
import { SCALE_LIMITS, SPEED_LIMITS } from '../components/constants';

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export const randomRGB = (): RGB => ({
    r: Math.floor(rand(60, 255)),
    g: Math.floor(rand(60, 255)),
    b: Math.floor(rand(60, 255)),
});

export const randomRotation = (): Rotation3D => ({
    x: rand(-Math.PI, Math.PI),
    y: rand(-Math.PI, Math.PI),
    z: rand(-Math.PI, Math.PI),
});

export const randomScale = (current: number): number => {
    const min = Math.max(SCALE_LIMITS.min, current * 0.5);
    const max = Math.min(SCALE_LIMITS.max, current * 1.5);
    return Math.round(rand(min, max) * 10) / 10;
};

/**
 * 0.5x-1.5x the current dt, clamped to the slider range. Relative, because a
 * global range would push stiff systems (Dadras at 0.002) far past the step
 * size they were vetted at. dt-free systems (maps, dt = 0) stay at 0.
 */
export const randomSpeed = (current: number): number => {
    if (current <= 0) return 0;
    const min = Math.max(SPEED_LIMITS.min, current * 0.5);
    const max = Math.min(SPEED_LIMITS.max, current * 1.5);
    return Math.round(rand(min, max) * 1000) / 1000;
};

export interface RandomizedParams {
    color: RGB;
    rotation: Rotation3D;
    scale: number;
    speed: number;
}

export const randomizeAttractor = (attractor: Attractor): RandomizedParams => ({
    color: randomRGB(),
    rotation: randomRotation(),
    scale: randomScale(attractor.scale),
    speed: randomSpeed(attractor.params.dt),
});
