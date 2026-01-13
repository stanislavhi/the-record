import type { Attractor, Rotation3D } from '../types';
import { ISO_X, ISO_Y } from '../constants';

/**
 * Apply rotation around X axis
 */
const rotateX = (x: number, y: number, z: number, angle: number) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x, y: y * c - z * s, z: y * s + z * c };
};

/**
 * Apply rotation around Y axis
 */
const rotateY = (x: number, y: number, z: number, angle: number) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: x * c + z * s, y, z: -x * s + z * c };
};

/**
 * Apply rotation around Z axis
 */
const rotateZ = (x: number, y: number, z: number, angle: number) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: x * c - y * s, y: x * s + y * c, z };
};

/**
 * Project 3D point to 2D screen coordinates with object rotation and isometric camera
 */
export const project = (
    x: number,
    y: number,
    z: number,
    attractor: Attractor,
    centerX: number,
    centerY: number
): { x: number; y: number } => {
    let px = x, py = y, pz = z;

    // 1. Object Rotation (Individual)
    const rotation: Rotation3D = attractor.rotation || { x: 0, y: 0, z: 0 };

    if (rotation.x) {
        const rotated = rotateX(px, py, pz, rotation.x);
        px = rotated.x; py = rotated.y; pz = rotated.z;
    }
    if (rotation.y) {
        const rotated = rotateY(px, py, pz, rotation.y);
        px = rotated.x; py = rotated.y; pz = rotated.z;
    }
    if (rotation.z) {
        const rotated = rotateZ(px, py, pz, rotation.z);
        px = rotated.x; py = rotated.y; pz = rotated.z;
    }

    // 2. Global Isometric Rotation (Camera) - Rotate Y (45 deg)
    {
        const rotated = rotateY(px, py, pz, ISO_Y);
        px = rotated.x; py = rotated.y; pz = rotated.z;
    }

    // 3. Rotate X (35.26 deg)
    {
        const rotated = rotateX(px, py, pz, ISO_X);
        py = rotated.y;
    }

    return {
        x: centerX + attractor.offset.x + px * attractor.scale,
        y: centerY + attractor.offset.y + py * attractor.scale
    };
};
