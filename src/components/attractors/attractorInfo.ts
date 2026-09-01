import type { AttractorType } from '../types';

export interface AttractorInfo {
    name: string;
    discoverer: string;
    year: number;
    equations: string[];
    lyapunov: string;
    blurb: string;
    /** Short chip shown next to the credit line (Page 2: "original", Page 3: "menagerie"). */
    badge?: string;
    /** One-line provenance note shown on the tour card. */
    note?: string;
}

/** Credit line shared by every Page 2 / Page 3 system. */
export const ORIGINAL_CREDIT = 'Claude · for The Record';
const ORIGINAL_NOTE = 'Page 2 original — invented for this project, not from the literature';
const MENAGERIE_NOTE = 'Page 3 menagerie — a different class of dynamics, not a strange-attractor flow';

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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
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
        badge: 'original',
        note: ORIGINAL_NOTE,
    },

    // ── Page 3 — the menagerie ──────────────────────────────────────────
    // Ten different classes of dynamics. "Lyapunov" is descriptive here:
    // several of these are stochastic, conservative or quasi-periodic, and a
    // single largest exponent is not the right summary.
    thicket: {
        name: 'Thicket',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'p ← fᵢ(p),  fᵢ(p) = Aᵢ·p + tᵢ',
            'i drawn at random with weight wᵢ',
            'four 3-D affine maps: trunk, two spiral branches, root',
        ],
        lyapunov: 'contractive (IFS)',
        blurb: 'A chaos game. Every step picks one of four shrinking affine maps at random; the dust converges onto a self-similar shrub no matter where it starts.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    dendrite: {
        name: 'Dendrite',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'zₙ₊₁ = ±√(zₙ − c)',
            'c = −0.4 + 0.6i',
            'sign chosen at random each step',
        ],
        lyapunov: 'inverse iteration',
        blurb: 'The Julia set of z² + c, grown backwards. Forward iteration repels from the set; running it in reverse attracts to it, so the dust paints the fractal boundary.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    colony: {
        name: 'Colony',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'white cell → turn right, flip, step',
            'black cell → turn left, flip, step',
            '160 × 160 torus shared by every ant',
        ],
        lyapunov: 'emergent (CA)',
        blurb: "Langton's ants sharing one lattice. Each ant follows two rules and no plan; after ~10 000 steps a highway appears anyway. Add ants and they rewrite each other's trails.",
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    stadium: {
        name: 'Stadium',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'free flight between walls',
            'v ← v − 2(v·n)n at each wall',
            'two semicircles r = 1 joined by straights of length 2',
        ],
        lyapunov: '> 0 (billiard)',
        blurb: 'A Bunimovich stadium. Straight lines only, yet the rounded caps defocus every bounce, so two balls launched a hair apart lose each other within a few reflections.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    pendulum: {
        name: 'Pendulum',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'θ̈₁, θ̈₂ from the double-pendulum Lagrangian',
            'm₁ = m₂ = ℓ₁ = ℓ₂ = 1, g = 9.81, no damping',
            'RK4; plotted point = tip, z = elbow x',
        ],
        lyapunov: '> 0 (Hamiltonian)',
        blurb: 'Ten double pendulums released from almost the same angle. Energy is conserved, nothing is attracted anywhere, and the tips still disagree within seconds.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    cluster: {
        name: 'Cluster',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'aᵢ = Σⱼ G(pⱼ − pᵢ)/(|pⱼ − pᵢ|² + ε²)^{3/2} − k·pᵢ',
            'symplectic Euler: v += a·h, p += v·h',
            'every point attracts every other point in the tile',
        ],
        lyapunov: '> 0 for N ≥ 3',
        blurb: 'The points are the system. Each one pulls on all the others (softened gravity) inside a gentle bowl. One point is an ellipse; three is chaos; add more and watch the swarm.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    echo: {
        name: 'Echo',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'dx/dt = β·x(t−τ) / (1 + x(t−τ)ⁿ) − γx',
            'β = 0.2, γ = 0.1, n = 10, τ = 17',
            'plotted as (x(t), x(t−τ), x(t−2τ))',
        ],
        lyapunov: '≈ 0.006 (Mackey–Glass, τ = 17)',
        blurb: 'A delay equation: the present depends on the past 17 time units. The state is a whole history buffer, not three numbers — the 3-D picture is a delay embedding of one signal.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    murmuration: {
        name: 'Murmuration',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'cohesion: steer toward neighbours\' centre',
            'alignment: match neighbours\' heading',
            'separation: push away when closer than 0.3',
        ],
        lyapunov: 'agent-based',
        blurb: 'Boids in a soft box at constant speed. No leader, no equation of motion for the flock — only three local rules per bird. Add points to grow the flock.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    loom: {
        name: 'Loom',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'x = cos t + a·cos(φt)',
            'y = sin t + a·sin(φt)',
            'z = b·sin(√2·t),  φ = golden ratio',
        ],
        lyapunov: '0 (quasi-periodic)',
        blurb: 'The odd one out: not chaotic at all. Three frequencies with irrational ratios weave a curve that never repeats and never diverges — order that only looks like chaos.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
    rebound: {
        name: 'Rebound',
        discoverer: ORIGINAL_CREDIT,
        year: 2026,
        equations: [
            'ÿ = −g between impacts',
            'plate: h(t) = A·sin(ωt),  A = 0.15, ω = 7',
            'impact: v⁺ = −e(v⁻ − ḣ) + ḣ,  e = 0.6',
        ],
        lyapunov: '> 0 (impact map)',
        blurb: 'A ball on a vibrating plate. Smooth falling, instantaneous kicks. Drawn around a cylinder of drive phase so the bounces stack into a ragged band instead of a seam.',
        badge: 'menagerie',
        note: MENAGERIE_NOTE,
    },
};

export const getDisplayName = (type: AttractorType): string =>
    ATTRACTOR_INFO[type]?.name ?? type.replace(/_/g, ' ');
