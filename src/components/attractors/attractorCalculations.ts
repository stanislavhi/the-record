import type { AttractorType, AttractorParams, ClassicAttractorType, Point3D } from '../types';
import type { AttractorCalculator, Delta, DrawStyle, StepContext } from './calculatorTypes';
import { originalCalculators } from './originalCalculations';
import { menagerieCalculators, MENAGERIE_DRAW_STYLES } from './menagerieCalculations';

export type { AttractorCalculator, Delta, DrawStyle, StepContext } from './calculatorTypes';

const lorenz: AttractorCalculator = (pt, params) => {
    const { sigma, rho, beta, dt } = params;
    return {
        dx: sigma * (pt.y - pt.x) * dt,
        dy: (pt.x * (rho - pt.z) - pt.y) * dt,
        dz: (pt.x * pt.y - beta * pt.z) * dt,
    };
};

const rossler: AttractorCalculator = (pt, params) => {
    const { a, b, c, dt } = params;
    return {
        dx: (-pt.y - pt.z) * dt,
        dy: (pt.x + a * pt.y) * dt,
        dz: (b + pt.z * (pt.x - c)) * dt,
    };
};

const henon: AttractorCalculator = (pt, params) => {
    const { a, b } = params;
    const nextX = 1 - a * pt.x * pt.x + pt.y;
    const nextY = b * pt.x;
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
        dz: -beta * pt.y * dt,
    };
};

const sprott: AttractorCalculator = (pt, params) => {
    const { a, b, dt } = params;
    return {
        dx: a * (pt.y - pt.x) * dt,
        dy: pt.x * pt.z * dt,
        dz: (b - pt.y * pt.y) * dt,
    };
};

const fourWing: AttractorCalculator = (pt, params) => {
    const { a, b, c, dt } = params;
    return {
        dx: (a * pt.x + pt.y * pt.z) * dt,
        dy: (b * pt.x + c * pt.y - pt.x * pt.z) * dt,
        dz: (-pt.z - pt.x * pt.y) * dt,
    };
};

const rabinovich: AttractorCalculator = (pt, params) => {
    const { alpha, gamma, dt } = params;
    return {
        dx: (pt.y * (pt.z - 1 + pt.x * pt.x) + gamma * pt.x) * dt,
        dy: (pt.x * (3 * pt.z + 1 - pt.x * pt.x) + gamma * pt.y) * dt,
        dz: -2 * pt.z * (alpha + pt.x * pt.y) * dt,
    };
};

const halvorsen: AttractorCalculator = (pt, params) => {
    const { a, dt } = params;
    return {
        dx: (-a * pt.x - 4 * pt.y - 4 * pt.z - pt.y * pt.y) * dt,
        dy: (-a * pt.y - 4 * pt.z - 4 * pt.x - pt.z * pt.z) * dt,
        dz: (-a * pt.z - 4 * pt.x - 4 * pt.y - pt.x * pt.x) * dt,
    };
};

const dadras: AttractorCalculator = (pt, params) => {
    const { p, q, r, s, e, dt } = params;
    return {
        dx: (pt.y - p * pt.x + q * pt.y * pt.z) * dt,
        dy: (r * pt.y - pt.x * pt.z + pt.z) * dt,
        dz: (s * pt.x * pt.y - e * pt.z) * dt,
    };
};

const aizawa: AttractorCalculator = (pt, params) => {
    const { a, b, c, d, e, f, dt } = params;
    return {
        dx: ((pt.z - b) * pt.x - d * pt.y) * dt,
        dy: (d * pt.x + (pt.z - b) * pt.y) * dt,
        dz:
            (c + a * pt.z - (pt.z * pt.z * pt.z) / 3 -
                (pt.x * pt.x + pt.y * pt.y) * (1 + e * pt.z) +
                f * pt.z * pt.x * pt.x * pt.x) * dt,
    };
};

const classicCalculators: Record<ClassicAttractorType, AttractorCalculator> = {
    lorenz,
    rossler,
    henon,
    chua,
    sprott,
    four_wing: fourWing,
    rabinovich,
    halvorsen,
    dadras,
    aizawa,
};

const calculators: Record<AttractorType, AttractorCalculator> = {
    ...classicCalculators,
    ...originalCalculators,
    ...menagerieCalculators,
};

const TRAIL: DrawStyle = { mode: 'trail', stepInterval: 1 };
/** Classic maps step once per 20 sub-steps so the dust builds at the original pace. */
const CLASSIC_DOTS: DrawStyle = { mode: 'dots', stepInterval: 20 };

const DRAW_STYLES: Partial<Record<AttractorType, DrawStyle>> = {
    henon: CLASSIC_DOTS,
    ripple: CLASSIC_DOTS,
    ...MENAGERIE_DRAW_STYLES,
};

/**
 * How the render loop should draw a type: `dots` systems iterate in place and
 * are stamped as glowing squares every `stepInterval` sub-steps; `trail`
 * systems are stroked through every sub-step.
 */
export const getDrawStyle = (type: AttractorType): DrawStyle => DRAW_STYLES[type] ?? TRAIL;

/** True for systems drawn as dots (Hénon, Ripple, and the Page 3 dust systems). */
export const isDiscrete = (type: AttractorType): boolean => getDrawStyle(type).mode === 'dots';

export const calculateAttractorStep = (
    type: AttractorType,
    pt: Point3D,
    params: AttractorParams,
    ctx?: StepContext
): Delta => {
    const calculator = calculators[type];
    if (calculator) return calculator(pt, params, ctx);
    return { dx: 0, dy: 0, dz: 0 };
};

export const isPointStable = (pt: Point3D): boolean =>
    !isNaN(pt.x) && Math.abs(pt.x) <= 1000 &&
    !isNaN(pt.y) && Math.abs(pt.y) <= 1000 &&
    !isNaN(pt.z) && Math.abs(pt.z) <= 1000;

export const resetPoint = (pt: Point3D): void => {
    pt.x = 0.1;
    pt.y = 0.1;
    pt.z = 0.1;
};
