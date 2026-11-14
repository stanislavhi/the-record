import type { AttractorParams, ForgeAttractorType } from '../types';
import type { AttractorCalculator } from './calculatorTypes';

/*
 * Page 4 — the forge. Ten flows built, not found: each one is a known chaotic
 * flow pushed through a smooth change of coordinates that rewrites its shape.
 *
 *   cover(n)    ξ = ζ^(2/n) in the complex plane ζ = x + iy. Needs a base with
 *               the rotation symmetry (x, y, z) → (−x, −y, z); the two lobes
 *               become n petals (Letellier–Gilmore covers).
 *               ξ̇ = (2/n)·ξ^(1−n/2)·ζ̇ with ζ = ξ^(n/2), ż unchanged.
 *   twist(k)    rotate the plane by k·z, so lobes wind around the axis as they climb.
 *   invert(c,R) spherical inversion p ↦ c + R²(p − c)/|p − c|², an involution:
 *               near parts swell, far parts shrink into bulbs.
 *
 * Each operator is a diffeomorphism of the region the attractor lives in, so the
 * dynamics are conjugate to the base: the Lyapunov spectrum is inherited, the
 * picture is not. All are pure autonomous ODEs → `integrator: 'rk4'`.
 */

type Field = (x: number, y: number, z: number, p: AttractorParams) => [number, number, number];

// ── bases (all symmetric under (x, y, z) → (−x, −y, z)) ─────────────────────
const lorenz: Field = (x, y, z, { sigma, rho, beta }) => [sigma * (y - x), x * (rho - z) - y, x * y - beta * z];
const burkeShaw: Field = (x, y, z, { s, v }) => [-s * (x + y), -y - s * x * z, s * x * y + v];
const shimizuMorioka: Field = (x, y, z, { a, b }) => [y, (1 - z) * x - a * y, x * x - b * z];
const rucklidge: Field = (x, y, z, { kappa, lambda }) => [-kappa * x + lambda * y - y * z, x, -z + y * y];
const fourWing: Field = (x, y, z, { a, b, c }) => [a * x + y * z, b * x + c * y - x * z, -z - x * y];
const chenLee: Field = (x, y, z, { a, b, c }) => [a * x - y * z, b * y + x * z, c * z + (x * y) / 3];

// ── operators ───────────────────────────────────────────────────────────────
/** n-fold cover. Branch-safe: a 2π jump in arg ξ flips ζ and the factor together. */
const cover = (base: Field): Field => (x, y, z, p) => {
    const n = p.n;
    const r = Math.hypot(x, y);
    const th = Math.atan2(y, x);
    const rz = Math.pow(r, n / 2);
    const [du, dv, dz] = base(rz * Math.cos((n * th) / 2), rz * Math.sin((n * th) / 2), z, p);
    const m = (2 / n) * Math.pow(r, 1 - n / 2);
    const c = Math.cos((1 - n / 2) * th);
    const s = Math.sin((1 - n / 2) * th);
    return [m * (c * du - s * dv), m * (s * du + c * dv), dz];
};

/** Plane rotated by k·z: velocity = R(kz)·base(R(−kz)·p) + k·ż·J·p. */
const twist = (base: Field): Field => (x, y, z, p) => {
    const k = p.twist;
    const c = Math.cos(k * z);
    const s = Math.sin(k * z);
    const [du, dv, dz] = base(c * x + s * y, -s * x + c * y, z, p);
    return [c * du - s * dv - k * dz * y, s * du + c * dv + k * dz * x, dz];
};

/** Spherical inversion about (cx, cy, cz) with radius R; the Jacobian is R²(I·r² − 2qqᵀ)/r⁴. */
const invert = (base: Field): Field => (X, Y, Z, p) => {
    const { cx, cy, cz, R } = p;
    const R2 = R * R;
    const px = X - cx, py = Y - cy, pz = Z - cz;
    const p2 = px * px + py * py + pz * pz;
    const qx = (R2 * px) / p2, qy = (R2 * py) / p2, qz = (R2 * pz) / p2;
    const [vx, vy, vz] = base(qx + cx, qy + cy, qz + cz, p);
    const r2 = qx * qx + qy * qy + qz * qz;
    const qv = qx * vx + qy * vy + qz * vz;
    const k = R2 / (r2 * r2);
    return [k * (vx * r2 - 2 * qx * qv), k * (vy * r2 - 2 * qy * qv), k * (vz * r2 - 2 * qz * qv)];
};

const calc = (f: Field): AttractorCalculator => (pt, params) => {
    const [dx, dy, dz] = f(pt.x, pt.y, pt.z, params);
    const dt = params.dt;
    return { dx: dx * dt, dy: dy * dt, dz: dz * dt };
};

export const forgeCalculators: Record<ForgeAttractorType, AttractorCalculator> = {
    trefoil: calc(cover(lorenz)),
    starfish: calc(cover(lorenz)),
    compass: calc(cover(burkeShaw)),
    lantern: calc(invert(chenLee)),
    crown: calc(cover(rucklidge)),
    conch: calc(invert(lorenz)),
    lotus: calc(cover(shimizuMorioka)),
    triskele: calc(cover(fourWing)),
    quatrefoil: calc(cover(chenLee)),
    galaxy: calc(twist(cover(rucklidge))),
};

/**
 * Lift a base-space point into cover coordinates (ξ = ζ^(2/n)); used to seed
 * the roster so every point starts on the attractor's basin, not on the axis.
 */
export const liftToCover = (x: number, y: number, z: number, n: number): { x: number; y: number; z: number } => {
    const r = Math.pow(Math.hypot(x, y), 2 / n);
    const th = (2 * Math.atan2(y, x)) / n;
    return { x: r * Math.cos(th), y: r * Math.sin(th), z };
};
