import type { AttractorType } from '../types';

export interface AttractorInfo {
    name: string;
    discoverer: string;
    year: number;
    equations: string[];
    lyapunov: string;
    blurb: string;
}

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
};

export const getDisplayName = (type: AttractorType): string =>
    ATTRACTOR_INFO[type]?.name ?? type.replace(/_/g, ' ');
