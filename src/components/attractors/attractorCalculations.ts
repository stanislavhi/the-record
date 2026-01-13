import type { AttractorType, AttractorParams, Point3D } from '../types';

interface Delta {
    dx: number;
    dy: number;
    dz: number;
}

type AttractorCalculator = (pt: Point3D, params: AttractorParams) => Delta;

const lorenz: AttractorCalculator = (pt, params) => {
    const { sigma, rho, beta, dt } = params;
    return {
        dx: sigma * (pt.y - pt.x) * dt,
        dy: (pt.x * (rho - pt.z) - pt.y) * dt,
        dz: (pt.x * pt.y - beta * pt.z) * dt
    };
};

const rossler: AttractorCalculator = (pt, params) => {
    const { a, b, c, dt } = params;
    return {
        dx: (-pt.y - pt.z) * dt,
        dy: (pt.x + a * pt.y) * dt,
        dz: (b + pt.z * (pt.x - c)) * dt
    };
};

const henon: AttractorCalculator = (pt, params) => {
    const { a, b } = params;
    const nextX = 1 - a * pt.x * pt.x + pt.y;
    const nextY = b * pt.x;
    // Henon is a discrete map, update point directly
    pt.x = nextX;
    pt.y = nextY;
    return { dx: 0, dy: 0, dz: 0 };
};

const chua: AttractorCalculator = (pt, params) => {
    const { alpha, beta, m0, m1, dt } = params;
    const f_x = m1 * pt.x + 0.5 * (m0 - m1) * (Math.abs(pt.x + 1) - Math.abs(pt.x - 1));
    return {
        dx: alpha * (pt.y - pt.x - f_x) * dt,
        dy: (pt.x - pt.y + pt.z) * dt,
        dz: -beta * pt.y * dt
    };
};

const sprott: AttractorCalculator = (pt, params) => {
    const { a, b, dt } = params;
    return {
        dx: a * (pt.y - pt.x) * dt,
        dy: pt.x * pt.z * dt,
        dz: (b - pt.y * pt.y) * dt
    };
};

const fourWing: AttractorCalculator = (pt, params) => {
    const { a, b, c, dt } = params;
    return {
        dx: (a * pt.x + pt.y * pt.z) * dt,
        dy: (b * pt.x + c * pt.y - pt.x * pt.z) * dt,
        dz: (-pt.z - pt.x * pt.y) * dt
    };
};

const tsucs: AttractorCalculator = (pt, params) => {
    const { a, c, d, e, dt } = params;
    return {
        dx: (a * (pt.y - pt.x) + d * pt.x * pt.z) * dt,
        dy: (c * pt.y - pt.x * pt.z) * dt,
        dz: (params.b * pt.z + pt.x * pt.y - e * pt.x * pt.x) * dt
    };
};

const rabinovich: AttractorCalculator = (pt, params) => {
    const { alpha, gamma, dt } = params;
    return {
        dx: (pt.y * (pt.z - 1 + pt.x * pt.x) + gamma * pt.x) * dt,
        dy: (pt.x * (3 * pt.z + 1 - pt.x * pt.x) + gamma * pt.y) * dt,
        dz: -2 * pt.z * (alpha + pt.x * pt.y) * dt
    };
};

const halvorsen: AttractorCalculator = (pt, params) => {
    const { a, dt } = params;
    return {
        dx: (-a * pt.x - 4 * pt.y - 4 * pt.z - pt.y * pt.y) * dt,
        dy: (-a * pt.y - 4 * pt.z - 4 * pt.x - pt.z * pt.z) * dt,
        dz: (-a * pt.z - 4 * pt.x - 4 * pt.y - pt.x * pt.x) * dt
    };
};

const chen: AttractorCalculator = (pt, params) => {
    const { a, b, c, dt } = params;
    return {
        dx: a * (pt.y - pt.x) * dt,
        dy: ((c - a) * pt.x - pt.x * pt.z + c * pt.y) * dt,
        dz: (pt.x * pt.y - b * pt.z) * dt
    };
};

const dadras: AttractorCalculator = (pt, params) => {
    const { p, q, r, s, e, dt } = params;
    return {
        dx: (pt.y - p * pt.x + q * pt.y * pt.z) * dt,
        dy: (r * pt.y - pt.x * pt.z + pt.z) * dt,
        dz: (s * pt.x * pt.y - e * pt.z) * dt
    };
};

const aizawa: AttractorCalculator = (pt, params) => {
    const { a, b, c, d, e, f, dt } = params;
    return {
        dx: ((pt.z - b) * pt.x - d * pt.y) * dt,
        dy: (d * pt.x + (pt.z - b) * pt.y) * dt,
        dz: (c + a * pt.z - (pt.z * pt.z * pt.z) / 3 - (pt.x * pt.x + pt.y * pt.y) * (1 + e * pt.z) + f * pt.z * pt.x * pt.x * pt.x) * dt
    };
};

const thomas: AttractorCalculator = (pt, params) => {
    const { b, dt } = params;
    return {
        dx: (Math.sin(pt.y) - b * pt.x) * dt,
        dy: (Math.sin(pt.z) - b * pt.y) * dt,
        dz: (Math.sin(pt.x) - b * pt.z) * dt
    };
};

const calculators: Record<AttractorType, AttractorCalculator> = {
    lorenz,
    rossler,
    henon,
    chua,
    sprott,
    four_wing: fourWing,
    tsucs,
    rabinovich,
    halvorsen,
    chen,
    dadras,
    aizawa,
    thomas
};

/**
 * Calculate the next step for an attractor point
 * @returns Delta values to add to the point (for continuous attractors)
 */
export const calculateAttractorStep = (
    type: AttractorType,
    pt: Point3D,
    params: AttractorParams
): Delta => {
    const calculator = calculators[type];
    if (calculator) {
        return calculator(pt, params);
    }
    return { dx: 0, dy: 0, dz: 0 };
};

/**
 * Check if point values are stable (not NaN or too large)
 */
export const isPointStable = (pt: Point3D): boolean => {
    return !isNaN(pt.x) && Math.abs(pt.x) <= 1000 &&
        !isNaN(pt.y) && Math.abs(pt.y) <= 1000 &&
        !isNaN(pt.z) && Math.abs(pt.z) <= 1000;
};

/**
 * Reset point to initial values if unstable
 */
export const resetPoint = (pt: Point3D): void => {
    pt.x = 0.1;
    pt.y = 0.1;
    pt.z = 0.1;
};
