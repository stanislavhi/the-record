import type { RGB } from '../components/types';

export type PaletteName = 'original' | 'neon' | 'pastel' | 'monochrome' | 'warm' | 'cold';

export const PALETTES: Record<PaletteName, RGB[]> = {
    original: [
        { r: 255, g: 255, b: 255 },
        { r: 255, g: 215, b: 0 },
        { r: 255, g: 0, b: 128 },
        { r: 255, g: 100, b: 50 },
        { r: 0, g: 220, b: 255 },
        { r: 50, g: 255, b: 80 },
        { r: 0, g: 250, b: 154 },
        { r: 255, g: 20, b: 180 },
        { r: 255, g: 120, b: 255 },
        { r: 255, g: 140, b: 50 },
    ],
    neon: [
        { r: 0, g: 255, b: 255 }, { r: 255, g: 0, b: 255 }, { r: 255, g: 255, b: 0 },
        { r: 0, g: 255, b: 128 }, { r: 255, g: 0, b: 128 }, { r: 128, g: 0, b: 255 },
        { r: 0, g: 128, b: 255 }, { r: 255, g: 128, b: 0 }, { r: 128, g: 255, b: 0 },
        { r: 255, g: 64, b: 192 },
    ],
    pastel: [
        { r: 255, g: 182, b: 193 }, { r: 176, g: 224, b: 230 }, { r: 221, g: 160, b: 221 },
        { r: 255, g: 218, b: 185 }, { r: 152, g: 251, b: 152 }, { r: 255, g: 255, b: 224 },
        { r: 230, g: 230, b: 250 }, { r: 175, g: 238, b: 238 }, { r: 255, g: 192, b: 203 },
        { r: 240, g: 230, b: 140 },
    ],
    monochrome: [
        { r: 255, g: 255, b: 255 }, { r: 230, g: 230, b: 230 }, { r: 205, g: 205, b: 205 },
        { r: 180, g: 180, b: 180 }, { r: 155, g: 155, b: 155 }, { r: 130, g: 130, b: 130 },
        { r: 200, g: 200, b: 200 }, { r: 170, g: 170, b: 170 }, { r: 140, g: 140, b: 140 },
        { r: 110, g: 110, b: 110 },
    ],
    warm: [
        { r: 255, g: 69, b: 0 }, { r: 255, g: 140, b: 0 }, { r: 255, g: 215, b: 0 },
        { r: 255, g: 99, b: 71 }, { r: 220, g: 20, b: 60 }, { r: 255, g: 165, b: 0 },
        { r: 255, g: 127, b: 80 }, { r: 255, g: 228, b: 181 }, { r: 205, g: 92, b: 92 },
        { r: 255, g: 69, b: 96 },
    ],
    cold: [
        { r: 0, g: 191, b: 255 }, { r: 30, g: 144, b: 255 }, { r: 65, g: 105, b: 225 },
        { r: 138, g: 43, b: 226 }, { r: 0, g: 206, b: 209 }, { r: 72, g: 61, b: 139 },
        { r: 123, g: 104, b: 238 }, { r: 0, g: 255, b: 255 }, { r: 70, g: 130, b: 180 },
        { r: 135, g: 206, b: 250 },
    ],
};

export const PALETTE_LABELS: Record<PaletteName, string> = {
    original: 'Original',
    neon: 'Neon',
    pastel: 'Pastel',
    monochrome: 'Mono',
    warm: 'Warm',
    cold: 'Cold',
};
