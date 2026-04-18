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

export const randomSpeed = (): number =>
    Math.round(rand(SPEED_LIMITS.min, SPEED_LIMITS.max) * 1000) / 1000;

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
    speed: randomSpeed(),
});
