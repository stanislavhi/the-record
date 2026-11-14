import type { Particle, RGB } from '../components/types';
import { CANVAS_STYLE, ENERGY_COST, ENERGY_REGEN } from '../components/constants';
import type { TrailGrid } from './trailGrid';

const MAX_ENERGY = 100;
/** Pointer ink is refused below this energy. */
const MIN_SPAWN_ENERGY = 5;
/** Pointer must travel this many px between ink particles. */
const INK_STEP_PX = 5;
const BURST_COUNT = 150;

export interface PointerState {
    x: number;
    y: number;
    active: boolean;
}

/**
 * Short-lived 2D particles plus the energy budget that gates pointer ink.
 * Burst and coloured particles are free; plain pointer ink costs ENERGY_COST.
 */
export class ParticleField {
    particles: Particle[] = [];
    energy = MAX_ENERGY;
    private lastInk: { x: number; y: number } | null = null;

    spawn(x: number, y: number, vx: number, vy: number, opts: { burst?: boolean; color?: RGB } = {}): void {
        const free = opts.burst || opts.color;
        if (!free) {
            if (this.energy < MIN_SPAWN_ENERGY) return;
            this.energy -= ENERGY_COST;
        }
        this.particles.push({
            x,
            y,
            vx: vx * 0.5 + (Math.random() - 0.5) * 2,
            vy: vy * 0.5 + (Math.random() - 0.5) * 2,
            life: opts.burst ? 2.0 : 1.5,
            color: opts.color,
        });
    }

    /** The merge explosion: BURST_COUNT particles radiating from (cx, cy). */
    burst(cx: number, cy: number): void {
        for (let i = 0; i < BURST_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 15 + 5;
            this.spawn(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed, { burst: true });
        }
    }

    regen(): void {
        this.energy = Math.min(MAX_ENERGY, this.energy + ENERGY_REGEN);
    }

    /** Pointer left an element: the next move starts a new stroke instead of bridging the gap. */
    releasePointer(): void {
        this.lastInk = null;
    }

    /** Called once per frame: drops ink when the pointer has moved more than INK_STEP_PX. */
    inkFromPointer(pointer: PointerState): void {
        if (!pointer.active) {
            this.lastInk = null;
            return;
        }
        if (!this.lastInk) {
            this.lastInk = { x: pointer.x, y: pointer.y };
            return;
        }
        const dx = pointer.x - this.lastInk.x;
        const dy = pointer.y - this.lastInk.y;
        if (Math.hypot(dx, dy) > INK_STEP_PX) {
            this.spawn(pointer.x, pointer.y, dx * 0.2, dy * 0.2);
            this.lastInk = { x: pointer.x, y: pointer.y };
        }
    }

    /** Moves particles, ages them, deposits uncoloured ink into the grid, drops dead ones. */
    update(grid: TrailGrid): void {
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= CANVAS_STYLE.particleLifeDecay;
            grid.deposit(p.x, p.y, CANVAS_STYLE.trailGridBoost);
        }
        this.particles = this.particles.filter((p) => p.life > 0);
    }

    draw(ctx: CanvasRenderingContext2D, glow: number, defaultGlowColor: string): void {
        for (const p of this.particles) {
            const rgb = p.color ? `rgb(${p.color.r},${p.color.g},${p.color.b})` : null;
            ctx.fillStyle = rgb ?? '#ffffff';
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, CANVAS_STYLE.particleRadius, 0, Math.PI * 2);
            ctx.shadowBlur = glow;
            ctx.shadowColor = rgb ?? defaultGlowColor;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1.0;
    }

    clear(): void {
        this.particles = [];
    }
}
