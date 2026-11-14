import type { Attractor } from '../components/types';
import { LAYOUT } from '../components/constants';

/**
 * Assigns each attractor a tile (`rect`) in a `gridCols`-wide grid filling the
 * viewport, and an `offset` = tile centre minus viewport centre, which
 * projection adds so every attractor is centred in its own tile.
 */
export const layoutTiles = (attractors: Attractor[], width: number, height: number, gridCols: number): void => {
    const gridRows = Math.ceil(attractors.length / gridCols);
    const availableW = width - LAYOUT.marginX * 2;
    const availableH = height - (LAYOUT.marginTop + LAYOUT.marginBottom);
    const cellW = (availableW - LAYOUT.gap * (gridCols - 1)) / gridCols;
    const cellH = (availableH - LAYOUT.gap * (gridRows - 1)) / gridRows;

    attractors.forEach((attractor, index) => {
        const x = LAYOUT.marginX + (index % gridCols) * (cellW + LAYOUT.gap);
        const y = LAYOUT.marginTop + Math.floor(index / gridCols) * (cellH + LAYOUT.gap);
        attractor.rect = { x, y, w: cellW, h: cellH };
        attractor.offset = { x: x + cellW / 2 - width / 2, y: y + cellH / 2 - height / 2 };
    });
};
