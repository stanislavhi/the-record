import type { MenagerieAttractorType, Point3D } from '../types';
import type { AttractorCalculator, DrawStyle, StepContext } from './calculatorTypes';

/**
 * Page 3 — the Menagerie.
 *
 * Nothing here is a strange attractor in the Page 1 / Page 2 sense. Each tile
 * is a different *class* of dynamical system, driven through the same
 * point-and-trail pipeline:
 *
 *   thicket      iterated function system (chaos game on 3D affine maps)
 *   dendrite     complex dynamics (Julia set by inverse iteration)
 *   colony       cellular automaton (Langton's ants on a shared torus)
 *   stadium      billiards (Bunimovich stadium, specular reflection)
 *   pendulum     Hamiltonian mechanics (double pendulum, RK4)
 *   cluster      N-body gravity between the tile's own points
 *   echo         delay differential equation (Mackey–Glass, delay-embedded)
 *   murmuration  agent-based flocking (boids in a soft box)
 *   loom         quasi-periodic motion (three incommensurate frequencies)
 *   rebound      impact dynamics (ball on a vibrating plate)
 *
 * Systems that need memory keep it in WeakMaps keyed by the point object
 * (per point) or by the tile's points array (shared), so state follows the
 * point through add/remove/page-switch without touching the Point3D type.
 * Every calculator mutates `pt` in place and returns a zero delta; the draw
 * style below decides whether the render loop strokes a trail or stamps dots.
 */

const ZERO = { dx: 0, dy: 0, dz: 0 };

const finite = (...v: number[]) => v.every(Number.isFinite);

const stateOf = <S>(store: WeakMap<object, S>, key: object, init: () => S): S => {
    let s = store.get(key);
    if (!s) {
        s = init();
        store.set(key, s);
    }
    return s;
};

const ctxOf = (pt: Point3D, ctx?: StepContext): StepContext => ctx ?? { points: [pt], index: 0 };

// ── 1. Thicket — iterated function system ───────────────────────────────────

interface Affine {
    m: number[]; // 3×3 row-major
    t: [number, number, number];
    p: number; // cumulative probability
}

const mat = (scale: [number, number, number], rz: number, ry: number, rx: number): number[] => {
    const cz = Math.cos(rz), sz = Math.sin(rz);
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cx = Math.cos(rx), sx = Math.sin(rx);
    // R = Rz · Ry · Rx, then scale columns
    const r = [
        cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
        sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
        -sy, cy * sx, cy * cx,
    ];
    return r.map((v, i) => v * scale[i % 3]);
};

// Four maps: a leaning trunk, two spiralling side branches, and a squat root.
const THICKET_MAPS: Affine[] = (() => {
    const raw: Array<{ m: number[]; t: [number, number, number]; w: number }> = [
        { m: mat([0.72, 0.72, 0.72], 0.22, 0.25, 0.1), t: [0, 1.15, 0], w: 0.46 },
        { m: mat([0.48, 0.48, 0.48], -1.25, 0.55, -0.3), t: [0.75, 0.65, 0.3], w: 0.24 },
        { m: mat([0.48, 0.48, 0.48], 1.25, -0.55, 0.3), t: [-0.75, 0.65, -0.3], w: 0.24 },
        { m: mat([0.08, 0.5, 0.08], 0, 0, 0), t: [0, 0, 0], w: 0.06 },
    ];
    let acc = 0;
    return raw.map((r) => ({ m: r.m, t: r.t, p: (acc += r.w) }));
})();

const thicket: AttractorCalculator = (pt) => {
    const u = Math.random();
    const f = THICKET_MAPS.find((a) => u <= a.p) ?? THICKET_MAPS[THICKET_MAPS.length - 1];
    const { x, y, z } = pt;
    const m = f.m;
    pt.x = m[0] * x + m[1] * y + m[2] * z + f.t[0];
    pt.y = m[3] * x + m[4] * y + m[5] * z + f.t[1];
    pt.z = m[6] * x + m[7] * y + m[8] * z + f.t[2];
    if (!finite(pt.x, pt.y, pt.z)) { pt.x = 0; pt.y = 0; pt.z = 0; }
    return ZERO;
};

// ── 2. Dendrite — Julia set by inverse iteration ────────────────────────────
// z_{n+1} = ±sqrt(z_n − c). Backward iteration is attracted to the Julia set,
// so the orbit paints it as dust regardless of where it starts.

const dendrite: AttractorCalculator = (pt, params) => {
    const { cr, ci } = params;
    const wr = pt.x - cr;
    const wi = pt.y - ci;
    const r = Math.hypot(wr, wi);
    const sr = Math.sqrt(r);
    const half = Math.atan2(wi, wr) / 2;
    const sign = Math.random() < 0.5 ? 1 : -1;
    pt.x = sign * sr * Math.cos(half);
    pt.y = sign * sr * Math.sin(half);
    pt.z = 0;
    if (!finite(pt.x, pt.y)) { pt.x = 0.1; pt.y = 0.1; }
    return ZERO;
};

// ── 3. Colony — Langton's ants on a shared torus ────────────────────────────

const COLONY_N = 160;
interface Ant { i: number; j: number; d: number } // d: 0=N 1=E 2=S 3=W
const antStore = new WeakMap<object, Ant>();
const latticeStore = new WeakMap<object, Uint8Array>();
const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

const colony: AttractorCalculator = (pt, _params, ctx) => {
    const c = ctxOf(pt, ctx);
    const lattice = stateOf(latticeStore, c.points, () => new Uint8Array(COLONY_N * COLONY_N));
    const ant = stateOf(antStore, pt, () => ({
        i: (COLONY_N / 2 + ((c.index * 7) % 11 - 5) * 4 + COLONY_N) % COLONY_N,
        j: (COLONY_N / 2 + ((c.index * 5) % 9 - 4) * 4 + COLONY_N) % COLONY_N,
        d: c.index % 4,
    }));
    const idx = ant.i * COLONY_N + ant.j;
    const black = lattice[idx] === 1;
    ant.d = (ant.d + (black ? 3 : 1)) % 4; // white → turn right, black → turn left
    lattice[idx] = black ? 0 : 1;
    ant.i = (ant.i + DIRS[ant.d][0] + COLONY_N) % COLONY_N;
    ant.j = (ant.j + DIRS[ant.d][1] + COLONY_N) % COLONY_N;
    pt.x = ant.j - COLONY_N / 2;
    pt.y = COLONY_N / 2 - ant.i;
    pt.z = 0;
    return ZERO;
};

// ── 4. Stadium — Bunimovich billiard ────────────────────────────────────────

interface Ball { vx: number; vy: number }
const ballStore = new WeakMap<object, Ball>();

const stadium: AttractorCalculator = (pt, params, ctx) => {
    const { a, r, k, dt } = params; // a = half straight length, r = cap radius
    const c = ctxOf(pt, ctx);
    const b = stateOf(ballStore, pt, () => {
        const th = 0.7 + c.index * 0.61;
        return { vx: Math.cos(th), vy: Math.sin(th) };
    });
    const h = dt * k;
    pt.x += b.vx * h;
    pt.y += b.vy * h;
    if (Math.abs(pt.x) <= a) {
        if (Math.abs(pt.y) > r) {
            pt.y = Math.sign(pt.y) * r;
            b.vy = -b.vy;
        }
    } else {
        const cx = Math.sign(pt.x) * a;
        const dx = pt.x - cx;
        const dy = pt.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > r * r) {
            const d = Math.sqrt(d2);
            const nx = dx / d, ny = dy / d;
            const dot = b.vx * nx + b.vy * ny;
            b.vx -= 2 * dot * nx;
            b.vy -= 2 * dot * ny;
            pt.x = cx + nx * r * 0.999;
            pt.y = ny * r * 0.999;
        }
    }
    pt.z = 0;
    if (!finite(pt.x, pt.y, b.vx, b.vy)) { pt.x = 0; pt.y = 0; b.vx = 1; b.vy = 0.3; }
    return ZERO;
};

// ── 5. Pendulum — double pendulum, RK4 ──────────────────────────────────────

interface Pend { t1: number; t2: number; w1: number; w2: number }
const pendStore = new WeakMap<object, Pend>();

const pendulumAccel = (t1: number, t2: number, w1: number, w2: number, g: number) => {
    // m1 = m2 = 1, l1 = l2 = 1
    const d = t1 - t2;
    const sd = Math.sin(d), cd = Math.cos(d);
    const den = 3 - Math.cos(2 * d);
    const a1 = (-g * 3 * Math.sin(t1) - g * Math.sin(t1 - 2 * t2) - 2 * sd * (w2 * w2 + w1 * w1 * cd)) / den;
    const a2 = (2 * sd * (2 * w1 * w1 + 2 * g * Math.cos(t1) + w2 * w2 * cd)) / den;
    return [a1, a2];
};

const pendulum: AttractorCalculator = (pt, params) => {
    const { g, k, damping, dt } = params;
    const s = stateOf(pendStore, pt, () => ({ t1: 2.2 + pt.x, t2: 2.2 + pt.y, w1: 0, w2: 0 }));
    const h = dt * k;
    // RK4 on (t1, t2, w1, w2)
    const f = (t1: number, t2: number, w1: number, w2: number) => {
        const [a1, a2] = pendulumAccel(t1, t2, w1, w2, g);
        return [w1, w2, a1 - damping * w1, a2 - damping * w2];
    };
    const k1 = f(s.t1, s.t2, s.w1, s.w2);
    const k2 = f(s.t1 + h / 2 * k1[0], s.t2 + h / 2 * k1[1], s.w1 + h / 2 * k1[2], s.w2 + h / 2 * k1[3]);
    const k3 = f(s.t1 + h / 2 * k2[0], s.t2 + h / 2 * k2[1], s.w1 + h / 2 * k2[2], s.w2 + h / 2 * k2[3]);
    const k4 = f(s.t1 + h * k3[0], s.t2 + h * k3[1], s.w1 + h * k3[2], s.w2 + h * k3[3]);
    s.t1 += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    s.t2 += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    s.w1 += h / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
    s.w2 += h / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]);
    if (!finite(s.t1, s.t2, s.w1, s.w2)) { s.t1 = 2.2; s.t2 = 2.2; s.w1 = 0; s.w2 = 0; }
    // Plot the tip; lift into 3D with the elbow's x so the ribbon has depth.
    pt.x = Math.sin(s.t1) + Math.sin(s.t2);
    pt.y = -Math.cos(s.t1) - Math.cos(s.t2);
    pt.z = Math.sin(s.t1);
    return ZERO;
};

// ── 6. Cluster — N-body gravity between the tile's points ───────────────────

interface Body { vx: number; vy: number; vz: number }
interface ClusterShared { acc: Float32Array; n: number }
const bodyStore = new WeakMap<object, Body>();
const clusterStore = new WeakMap<object, ClusterShared>();

const cluster: AttractorCalculator = (pt, params, ctx) => {
    const { G, spring, eps, k, dt } = params;
    const c = ctxOf(pt, ctx);
    const pts = c.points;
    const shared = stateOf(clusterStore, pts, () => ({ acc: new Float32Array(0), n: 0 }));
    // Kick-drift (symplectic Euler): accelerations for every body are computed
    // once per sub-step, when the first body is stepped.
    if (c.index === 0 || shared.acc.length !== pts.length * 3) {
        if (shared.acc.length !== pts.length * 3) shared.acc = new Float32Array(pts.length * 3);
        const acc = shared.acc;
        acc.fill(0);
        const e2 = eps * eps;
        for (let i = 0; i < pts.length; i++) {
            const pi = pts[i];
            let ax = -spring * pi.x, ay = -spring * pi.y, az = -spring * pi.z;
            for (let j = 0; j < pts.length; j++) {
                if (i === j) continue;
                const pj = pts[j];
                const dx = pj.x - pi.x, dy = pj.y - pi.y, dz = pj.z - pi.z;
                const r2 = dx * dx + dy * dy + dz * dz + e2;
                const inv = G / (r2 * Math.sqrt(r2));
                ax += dx * inv; ay += dy * inv; az += dz * inv;
            }
            acc[i * 3] = ax; acc[i * 3 + 1] = ay; acc[i * 3 + 2] = az;
        }
    }
    const b = stateOf(bodyStore, pt, () => {
        // First touch: spread the bodies on a ring with tangential velocity,
        // instead of the near-identical seeds the roster gives every point.
        const th = c.index * 2.4;
        pt.x = Math.cos(th) * 1.2;
        pt.y = Math.sin(th) * 1.2;
        pt.z = Math.sin(th * 2) * 0.3;
        return { vx: -Math.sin(th) * 0.7, vy: Math.cos(th) * 0.7, vz: Math.sin(th * 0.5) * 0.3 };
    });
    const i = c.index * 3;
    const h = dt * k;
    b.vx += shared.acc[i] * h;
    b.vy += shared.acc[i + 1] * h;
    b.vz += shared.acc[i + 2] * h;
    pt.x += b.vx * h;
    pt.y += b.vy * h;
    pt.z += b.vz * h;
    if (!finite(pt.x, pt.y, pt.z, b.vx, b.vy, b.vz)) {
        pt.x = 0.5; pt.y = 0; pt.z = 0; b.vx = 0; b.vy = 0.5; b.vz = 0;
    }
    return ZERO;
};

// ── 7. Echo — Mackey–Glass delay equation ───────────────────────────────────

const ECHO_LEN = 4096;
interface EchoState { buf: Float32Array; head: number }
const echoStore = new WeakMap<object, EchoState>();

const echo: AttractorCalculator = (pt, params) => {
    const { beta, gamma, n, tau, k, dt } = params;
    const s = stateOf(echoStore, pt, () => {
        const buf = new Float32Array(ECHO_LEN);
        buf.fill(0.6 + pt.x); // constant history; the offset per point seeds divergence
        return { buf, head: 0 };
    });
    const h = dt * k;
    const d = Math.min(ECHO_LEN - 1, Math.max(1, Math.round(tau / h)));
    const at = (back: number) => s.buf[(s.head - back + ECHO_LEN * 2) % ECHO_LEN];
    const x = at(0);
    const xd = at(d);
    const xd2 = at(Math.min(ECHO_LEN - 1, 2 * d));
    const xdn = Math.pow(xd, n);
    let next = x + h * ((beta * xd) / (1 + xdn) - gamma * x);
    if (!Number.isFinite(next) || next < 0 || next > 10) next = 0.6;
    s.head = (s.head + 1) % ECHO_LEN;
    s.buf[s.head] = next;
    // Delay embedding: (x(t), x(t − τ), x(t − 2τ))
    pt.x = next;
    pt.y = xd;
    pt.z = xd2;
    return ZERO;
};

// ── 8. Murmuration — boids ──────────────────────────────────────────────────

const boidStore = new WeakMap<object, Body>();

const murmuration: AttractorCalculator = (pt, params, ctx) => {
    const { radius, sep, speed, box, wCoh, wAli, wSep, wWall, k, dt } = params;
    const c = ctxOf(pt, ctx);
    const me = stateOf(boidStore, pt, () => {
        // First touch: scatter the bird through the box with its own heading.
        const th = c.index * 1.9;
        pt.x = Math.cos(th) * 0.8;
        pt.y = Math.sin(th * 1.3) * 0.8;
        pt.z = Math.sin(th * 0.6) * 0.8;
        return { vx: Math.cos(th) * speed, vy: Math.sin(th) * speed, vz: Math.sin(th * 0.7) * speed * 0.5 };
    });
    let cx = 0, cy = 0, cz = 0, ax = 0, ay = 0, az = 0, sx = 0, sy = 0, sz = 0, n = 0;
    for (const other of c.points) {
        if (other === pt) continue;
        const dx = other.x - pt.x, dy = other.y - pt.y, dz = other.z - pt.z;
        const d = Math.hypot(dx, dy, dz);
        if (d > radius || d === 0) continue;
        n++;
        cx += other.x; cy += other.y; cz += other.z;
        const ov = boidStore.get(other);
        if (ov) { ax += ov.vx; ay += ov.vy; az += ov.vz; }
        if (d < sep) {
            const push = (sep - d) / sep / d;
            sx -= dx * push; sy -= dy * push; sz -= dz * push;
        }
    }
    let fx = 0, fy = 0, fz = 0;
    if (n > 0) {
        fx += wCoh * (cx / n - pt.x) + wAli * (ax / n - me.vx) + wSep * sx;
        fy += wCoh * (cy / n - pt.y) + wAli * (ay / n - me.vy) + wSep * sy;
        fz += wCoh * (cz / n - pt.z) + wAli * (az / n - me.vz) + wSep * sz;
    }
    // Soft box: spring back once outside ±box
    const wall = (v: number) => (Math.abs(v) > box ? -wWall * (v - Math.sign(v) * box) : 0);
    fx += wall(pt.x); fy += wall(pt.y); fz += wall(pt.z);
    const h = dt * k;
    me.vx += fx * h; me.vy += fy * h; me.vz += fz * h;
    // Cap speed only. A constant-speed normalisation (or a minimum-speed
    // floor) would undo the wall's deceleration every step and let a lone
    // bird fly straight out of the box. A gentle thrust along the heading
    // keeps the flock cruising without pinning the speed.
    const sp = Math.hypot(me.vx, me.vy, me.vz);
    if (sp > speed) {
        me.vx *= speed / sp; me.vy *= speed / sp; me.vz *= speed / sp;
    } else if (sp > 1e-6) {
        const thrust = 1 + (speed - sp) * h;
        me.vx *= thrust; me.vy *= thrust; me.vz *= thrust;
    }
    pt.x += me.vx * h; pt.y += me.vy * h; pt.z += me.vz * h;
    if (!finite(pt.x, pt.y, pt.z, me.vx, me.vy, me.vz)) {
        pt.x = 0; pt.y = 0; pt.z = 0; me.vx = speed; me.vy = 0; me.vz = 0;
    }
    return ZERO;
};

// ── 9. Loom — quasi-periodic torus curve ────────────────────────────────────

const loomStore = new WeakMap<object, { t: number }>();

const loom: AttractorCalculator = (pt, params, ctx) => {
    const { a, b, phi, psi, k, dt } = params;
    const c = ctxOf(pt, ctx);
    const s = stateOf(loomStore, pt, () => ({ t: c.index * 0.9 }));
    s.t += dt * k;
    const t = s.t;
    pt.x = Math.cos(t) + a * Math.cos(phi * t);
    pt.y = Math.sin(t) + a * Math.sin(phi * t);
    pt.z = b * Math.sin(psi * t);
    return ZERO;
};

// ── 10. Rebound — ball on a vibrating plate ─────────────────────────────────

interface Bounce { y: number; v: number; t: number }
const bounceStore = new WeakMap<object, Bounce>();

const rebound: AttractorCalculator = (pt, params) => {
    const { A, omega, e, g, k, R, dt } = params;
    const s = stateOf(bounceStore, pt, () => ({ y: 1 + pt.y, v: 0, t: 0 }));
    const h = dt * k;
    s.v -= g * h;
    s.y += s.v * h;
    s.t += h;
    const plate = A * Math.sin(omega * s.t);
    if (s.y < plate) {
        const plateV = A * omega * Math.cos(omega * s.t);
        s.y = plate;
        s.v = -e * (s.v - plateV) + plateV;
    }
    if (!finite(s.y, s.v, s.t) || s.y > 40) { s.y = 1; s.v = 0; }
    // Drive phase around a cylinder of radius R, height up: no wrap seam to draw.
    pt.x = R * Math.cos(omega * s.t);
    pt.z = R * Math.sin(omega * s.t);
    pt.y = s.y;
    return ZERO;
};

export const menagerieCalculators: Record<MenagerieAttractorType, AttractorCalculator> = {
    thicket,
    dendrite,
    colony,
    stadium,
    pendulum,
    cluster,
    echo,
    murmuration,
    loom,
    rebound,
};

export const MENAGERIE_DRAW_STYLES: Record<MenagerieAttractorType, DrawStyle> = {
    // Dust systems stamp every other sub-step: 10 glowing dots per point per
    // frame is enough to build the picture without paying shadowBlur 20×.
    thicket: { mode: 'dots', stepInterval: 2 },
    dendrite: { mode: 'dots', stepInterval: 2 },
    colony: { mode: 'dots', stepInterval: 2 },
    stadium: { mode: 'trail', stepInterval: 1 },
    pendulum: { mode: 'trail', stepInterval: 1 },
    cluster: { mode: 'trail', stepInterval: 1 },
    echo: { mode: 'trail', stepInterval: 1 },
    murmuration: { mode: 'trail', stepInterval: 1 },
    loom: { mode: 'trail', stepInterval: 1 },
    rebound: { mode: 'trail', stepInterval: 1 },
};
