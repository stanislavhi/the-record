import type { AttractorType } from '../types';

export interface AttractorInfo {
    name: string;
    discoverer: string;
    year: number;
    equations: string[];
    lyapunov: string;
    blurb: string;
    /** True for the Page 2 systems invented for The Record. */
    original?: boolean;
}

/** Credit line shared by every Page 2 system. */
export const ORIGINAL_CREDIT = 'Claude · for The Record';

export const ATTRACTOR_INFO: Record<AttractorType, AttractorInfo> = {
    lorenz: {
        name: 'Lorenz',
        discoverer: 'Edward Lorenz',
        year: 1963,
        equations: [
            'dx/dt = σ(y − x)',
            'dy/dt = x(ρ − z) − y',
            'dz/dt = xy − βz',
        ],
        lyapunov: '≈ 0.906',
        blurb: 'The butterfly. A simplified model of atmospheric convection that gave us chaos theory and the butterfly effect.',
    },
    rossler: {
        name: 'Rössler',
        discoverer: 'Otto Rössler',
        year: 1976,
        equations: [
            'dx/dt = −y − z',
            'dy/dt = x + ay',
            'dz/dt = b + z(x − c)',
        ],
        lyapunov: '≈ 0.0714',
        blurb: 'A deliberately simplified Lorenz system — one nonlinear term, a single folded band.',
    },
    henon: {
        name: 'Hénon',
        discoverer: 'Michel Hénon',
        year: 1976,
        equations: [
            'xₙ₊₁ = 1 − ax² + y',
            'yₙ₊₁ = bx',
        ],
        lyapunov: '≈ 0.419',
        blurb: 'A discrete-time map, not a flow. Each iteration traces a point across the fractal strange attractor.',
    },
    chua: {
        name: 'Chua',
        discoverer: 'Leon Chua',
        year: 1983,
        equations: [
            'dx/dt = α(y − x − f(x))',
            'dy/dt = x − y + z',
            'dz/dt = −βy',
        ],
        lyapunov: '≈ 0.3',
        blurb: 'Born from an electronic circuit. The first physically realized chaotic system in hardware.',
    },
    sprott: {
        name: 'Sprott',
        discoverer: 'Julien Sprott',
        year: 1994,
        equations: [
            'dx/dt = y + 2xy + xz',
            'dy/dt = 1 − ax² + yz',
            'dz/dt = x − x² − y²',
        ],
        lyapunov: '≈ 0.15',
        blurb: 'Part of a catalog of 19 algebraically simple chaotic flows Sprott discovered by brute-force search.',
    },
    four_wing: {
        name: 'Four-Wing',
        discoverer: 'Qi et al.',
        year: 2005,
        equations: [
            'dx/dt = ax + yz',
            'dy/dt = bx + cy − xz',
            'dz/dt = −z − xy',
        ],
        lyapunov: '≈ 0.5',
        blurb: 'Four-lobed topology — trajectories weave across all four wings unpredictably.',
    },
    rabinovich: {
        name: 'Rabinovich-Fabrikant',
        discoverer: 'Rabinovich & Fabrikant',
        year: 1979,
        equations: [
            'dx/dt = y(z − 1 + x²) + γx',
            'dy/dt = x(3z + 1 − x²) + γy',
            'dz/dt = −2z(α + xy)',
        ],
        lyapunov: '≈ 0.14',
        blurb: 'A model of wave propagation in nonequilibrium media. Extremely sensitive to parameters.',
    },
    halvorsen: {
        name: 'Halvorsen',
        discoverer: 'Arne Halvorsen',
        year: 1994,
        equations: [
            'dx/dt = −ax − 4y − 4z − y²',
            'dy/dt = −ay − 4z − 4x − z²',
            'dz/dt = −az − 4x − 4y − x²',
        ],
        lyapunov: '≈ 0.79',
        blurb: 'Cyclic symmetry — the same equation rotated through x, y, z. Elegant and ribbon-like.',
    },
    dadras: {
        name: 'Dadras',
        discoverer: 'Sara Dadras',
        year: 2009,
        equations: [
            'dx/dt = y − px + qyz',
            'dy/dt = ry − xz + z',
            'dz/dt = sxy − ez',
        ],
        lyapunov: '≈ 0.2',
        blurb: 'A modern three-scroll attractor designed with specific bifurcation behaviors in mind.',
    },
    aizawa: {
        name: 'Aizawa',
        discoverer: 'Yoji Aizawa',
        year: 1982,
        equations: [
            'dx/dt = (z − b)x − dy',
            'dy/dt = dx + (z − b)y',
            'dz/dt = c + az − z³/3 − (x² + y²)(1 + ez) + fzx³',
        ],
        lyapunov: '≈ 0.15',
        blurb: 'Spherical shape — a torus tangled with polar filaments. Unusual topology among 3D flows.',
    },

    // ── Page 2 — originals ──────────────────────────────────────────────
    // Lyapunov values below were measured with scripts/vet-attractors.mjs
    // (largest exponent, forward Euler at the default dt, 400k steps).
    sigil: {
        name: 'Sigil',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = a(y − x)',
            'dy/dt = b·x·cos(wz) − y',
            'dz/dt = xy − cz',
        ],
        lyapunov: '≈ 1.40',
        blurb: 'Lorenz with its gain replaced by cos(wz). The wings collapse into a tight, fast-flickering knot that never settles on a side.',
        original: true,
    },
    wick: {
        name: 'Wick',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = a(y − x)',
            'dy/dt = x(b − z) − y',
            'dz/dt = |xy| − cz',
        ],
        lyapunov: '≈ 1.00',
        blurb: 'The z pump can only push upward, so the flame is lopsided: one tall lobe fed by both wings, hovering far above the origin.',
        original: true,
    },
    cinder: {
        name: 'Cinder',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = a(y − x − h(x)),  h = m₁x + (m₀ − m₁)tanh(x)',
            'dy/dt = x − y + z',
            'dz/dt = −by',
        ],
        lyapunov: '≈ 0.73',
        blurb: "Chua's circuit with the diode's sharp corners smoothed into a tanh. A softer, rounder double scroll — the embers of the original.",
        original: true,
    },
    gyre: {
        name: 'Gyre',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = y − ax + byz',
            'dy/dt = cy − xz + z',
            'dz/dt = dxy − ez + k·cos(x)',
        ],
        lyapunov: '≈ 0.98',
        blurb: 'Three scrolls with a cos(x) ripple riding on the z equation. The ripple nudges orbits between scrolls at irregular intervals.',
        original: true,
    },
    moth: {
        name: 'Moth',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = y',
            'dy/dt = −x + yz',
            'dz/dt = b − a·y·tanh(y) − cz',
        ],
        lyapunov: '≈ 0.20',
        blurb: 'A thermostat that only bites once |y| grows. Slow drift near the centre, sudden wide loops when the wings open.',
        original: true,
    },
    tidepool: {
        name: 'Tidepool',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = −cy + x(z − d·r²)',
            'dy/dt = cx + y(z − d·r²)',
            'dz/dt = a − bz − x² + ey',
        ],
        lyapunov: '≈ 0.28',
        blurb: 'A spiral whose radius is dialled by z, while z is drained by x² and topped up by y. Orbits swell, stall, and drain like a tide.',
        original: true,
    },
    ossuary: {
        name: 'Ossuary',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = y',
            'dy/dt = −x − yz + k·sin(wx)',
            'dz/dt = y² − a',
        ],
        lyapunov: '≈ 0.10',
        blurb: 'A Nosé–Hoover thermostat rattled by a sin(wx) forcing. Layered shells — bone-like rings stacked around a hollow core.',
        original: true,
    },
    ripple: {
        name: 'Ripple',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'xₙ₊₁ = sin(a·y) − z·cos(b·x)',
            'yₙ₊₁ = z·sin(c·x) − cos(d·y)',
            'zₙ₊₁ = e·sin(x)',
        ],
        lyapunov: '≈ 0.39 / iter',
        blurb: 'A discrete map, drawn as dust like Hénon. z is a delayed echo of x that folds back into both other coordinates.',
        original: true,
    },
    anvil: {
        name: 'Anvil',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = y',
            'dy/dt = z',
            'dz/dt = −az − y + k·sin(x) − bx³',
        ],
        lyapunov: '≈ 0.11',
        blurb: 'A jerk system: a sinusoidal kick fights a cubic brake. Heavy, blocky loops that ring like struck metal.',
        original: true,
    },
    reed: {
        name: 'Reed',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = y',
            'dy/dt = z',
            'dz/dt = −az − by + k·sgn(x)√|x| − cx³',
        ],
        lyapunov: '≈ 0.10',
        blurb: 'The restoring force is a square root: stiff near zero, soft far out. Thin, swaying strands that bend but rarely break.',
        original: true,
    },
};

export const getDisplayName = (type: AttractorType): string =>
    ATTRACTOR_INFO[type]?.name ?? type.replace(/_/g, ' ');
