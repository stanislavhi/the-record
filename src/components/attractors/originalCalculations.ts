import type { OriginalAttractorType } from '../types';
import type { AttractorCalculator } from './calculatorTypes';

/**
 * Page 2 — ten systems invented for The Record.
 *
 * None of these are lifted from the literature. Each started as a deliberate
 * twist on a known chaos mechanism (stretch-and-fold, thermostat, jerk,
 * rotation-with-radial-pumping, folded map), then had its parameters found
 * by a numerical sweep that kept only regimes with a positive largest
 * Lyapunov exponent, no divergence, and a bounded, well-spread orbit under
 * the app's own forward-Euler integrator. `npm run vet:attractors` re-runs
 * that vetting against this exact file.
 *
 * Coefficient names follow the classic set (a, b, c, ...) so the randomizer
 * and control panel work unchanged.
 */

/** Sigil — Lorenz skeleton whose gain is cos(w·z) instead of (ρ − z). */
const sigil: AttractorCalculator = (pt, params) => {
    const { a, b, c, w, dt } = params;
    return {
        dx: a * (pt.y - pt.x) * dt,
        dy: (b * pt.x * Math.cos(w * pt.z) - pt.y) * dt,
        dz: (pt.x * pt.y - c * pt.z) * dt,
    };
};

/** Wick — Lorenz with an always-positive |xy| pump on z, so the flame never inverts. */
const wick: AttractorCalculator = (pt, params) => {
    const { a, b, c, dt } = params;
    return {
        dx: a * (pt.y - pt.x) * dt,
        dy: (pt.x * (b - pt.z) - pt.y) * dt,
        dz: (Math.abs(pt.x * pt.y) - c * pt.z) * dt,
    };
};

/** Cinder — Chua's circuit with the piecewise diode replaced by a tanh saturation. */
const cinder: AttractorCalculator = (pt, params) => {
    const { a, b, m0, m1, dt } = params;
    const h = m1 * pt.x + (m0 - m1) * Math.tanh(pt.x);
    return {
        dx: a * (pt.y - pt.x - h) * dt,
        dy: (pt.x - pt.y + pt.z) * dt,
        dz: -b * pt.y * dt,
    };
};

/** Gyre — Dadras-style scrolls with a cos(x) ripple injected into the z equation. */
const gyre: AttractorCalculator = (pt, params) => {
    const { a, b, c, d, e, k, dt } = params;
    return {
        dx: (pt.y - a * pt.x + b * pt.y * pt.z) * dt,
        dy: (c * pt.y - pt.x * pt.z + pt.z) * dt,
        dz: (d * pt.x * pt.y - e * pt.z + k * Math.cos(pt.x)) * dt,
    };
};

/** Moth — minimal jerk-like flow with a tanh(y)·y thermostat on z. */
const moth: AttractorCalculator = (pt, params) => {
    const { a, b, c, dt } = params;
    return {
        dx: pt.y * dt,
        dy: (-pt.x + pt.y * pt.z) * dt,
        dz: (b - a * Math.tanh(pt.y) * pt.y - c * pt.z) * dt,
    };
};

/** Tidepool — planar rotation whose radial growth is set by z; z is fed by y and drained by x². */
const tidepool: AttractorCalculator = (pt, params) => {
    const { a, b, c, d, e, dt } = params;
    const r2 = pt.x * pt.x + pt.y * pt.y;
    const g = pt.z - r2 * d;
    return {
        dx: (-c * pt.y + pt.x * g) * dt,
        dy: (c * pt.x + pt.y * g) * dt,
        dz: (a - b * pt.z - pt.x * pt.x + e * pt.y) * dt,
    };
};

/** Ossuary — Nosé–Hoover thermostat with a sin(w·x) forcing term on the velocity. */
const ossuary: AttractorCalculator = (pt, params) => {
    const { a, k, w, dt } = params;
    return {
        dx: pt.y * dt,
        dy: (-pt.x - pt.y * pt.z + k * Math.sin(w * pt.x)) * dt,
        dz: (pt.y * pt.y - a) * dt,
    };
};

/** Ripple — discrete 3D map: sine/cosine folds where z feeds back into both x and y. */
const ripple: AttractorCalculator = (pt, params) => {
    const { a, b, c, d, e } = params;
    const { x, y, z } = pt;
    pt.x = Math.sin(a * y) - z * Math.cos(b * x);
    pt.y = z * Math.sin(c * x) - Math.cos(d * y);
    pt.z = e * Math.sin(x);
    return { dx: 0, dy: 0, dz: 0 };
};

/** Anvil — jerk system: sinusoidal restoring force plus a cubic brake. */
const anvil: AttractorCalculator = (pt, params) => {
    const { a, b, k, dt } = params;
    return {
        dx: pt.y * dt,
        dy: pt.z * dt,
        dz: (-a * pt.z - pt.y + k * Math.sin(pt.x) - b * pt.x * pt.x * pt.x) * dt,
    };
};

/** Reed — jerk system with a square-root restoring force (stiff near zero, soft far out). */
const reed: AttractorCalculator = (pt, params) => {
    const { a, b, c, k, dt } = params;
    const root = Math.sign(pt.x) * Math.sqrt(Math.abs(pt.x));
    return {
        dx: pt.y * dt,
        dy: pt.z * dt,
        dz: (-a * pt.z - b * pt.y + k * root - c * pt.x * pt.x * pt.x) * dt,
    };
};

export const originalCalculators: Record<OriginalAttractorType, AttractorCalculator> = {
    sigil,
    wick,
    cinder,
    gyre,
    moth,
    tidepool,
    ossuary,
    ripple,
    anvil,
    reed,
};
