import type { RGB, Rect } from '../components/types';
import { DECAY_RATE, GRID_SIZE, INK_COLOR } from '../components/constants';

/** Cells at or below this intensity are neither painted nor decayed. */
const VISIBLE_THRESHOLD = 0.01;

/**
 * The persistent trail buffer ("the Record"): one cell per `cellSize` px,
 * intensity 0..1, plus the last colour deposited in each cell.
 * Flat column-major storage: index = gx * rows + gy.
 */
export class TrailGrid {
    cols = 0;
    rows = 0;
    private cells = new Float32Array(0);
    private colors: (RGB | null)[] = [];
    private readonly cellSize: number;

    constructor(cellSize: number = GRID_SIZE) {
        this.cellSize = cellSize;
    }

    /** Reallocates the buffer for a new viewport. Existing trails are discarded. */
    resize(width: number, height: number): void {
        this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);
        this.cells = new Float32Array(this.cols * this.rows);
        this.colors = new Array(this.cols * this.rows).fill(null);
    }

    /** Adds intensity at a canvas pixel (capped at 1). `color` is kept unless omitted. */
    deposit(px: number, py: number, amount: number, color?: RGB): void {
        const gx = Math.floor(px / this.cellSize);
        const gy = Math.floor(py / this.cellSize);
        if (gx < 0 || gx >= this.cols || gy < 0 || gy >= this.rows) return;
        const i = gx * this.rows + gy;
        const next = this.cells[i] + amount;
        this.cells[i] = next > 1 ? 1 : next;
        if (color) this.colors[i] = color;
    }

    /** Zeroes every cell covering `rect` (inclusive edges). */
    clearRect(rect: Rect): void {
        const x0 = Math.max(0, Math.floor(rect.x / this.cellSize));
        const x1 = Math.min(this.cols - 1, Math.floor((rect.x + rect.w) / this.cellSize));
        const y0 = Math.max(0, Math.floor(rect.y / this.cellSize));
        const y1 = Math.min(this.rows - 1, Math.floor((rect.y + rect.h) / this.cellSize));
        for (let gx = x0; gx <= x1; gx++) {
            const base = gx * this.rows;
            for (let gy = y0; gy <= y1; gy++) {
                this.cells[base + gy] = 0;
                this.colors[base + gy] = null;
            }
        }
    }

    clear(): void {
        this.cells.fill(0);
        this.colors.fill(null);
    }

    /**
     * Paints every visible cell with alpha = intensity * alphaScale, decaying it
     * by DECAY_RATE in the same pass (the painted alpha is the pre-decay value).
     */
    paint(ctx: CanvasRenderingContext2D, alphaScale: number): void {
        const { cols, rows, cells, colors, cellSize } = this;
        for (let gx = 0; gx < cols; gx++) {
            const base = gx * rows;
            for (let gy = 0; gy < rows; gy++) {
                const i = base + gy;
                const intensity = cells[i];
                if (intensity <= VISIBLE_THRESHOLD) continue;
                cells[i] = intensity * DECAY_RATE;
                const rgb = colors[i] ?? INK_COLOR;
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * alphaScale})`;
                ctx.fillRect(gx * cellSize, gy * cellSize, cellSize, cellSize);
            }
        }
    }
}
