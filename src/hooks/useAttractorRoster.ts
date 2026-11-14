import { useCallback, useRef, useState } from 'react';
import type { Attractor, OverlayItem, RGB } from '../components/types';
import { POINT_LIMITS } from '../components/constants';
import { hexToRgb, hslToRgb, rgbToHsl } from '../components/utils/colorUtils';
import { randomizeAttractor } from '../utils/randomParams';
import { PALETTES, type PaletteName } from '../utils/palettes';
import { layoutTiles } from '../engine/layout';

const ROTATE_RAD_PER_PX = 0.02;

const toOverlayItems = (attractors: Attractor[]): OverlayItem[] =>
    attractors
        .filter((a) => a.rect)
        .map((a, index) => ({
            index,
            type: a.type,
            rect: a.rect!,
            rotation: a.rotation ?? { x: 0, y: 0, z: 0 },
            color: a.color,
            scale: a.scale,
            pointCount: a.points.length,
            // Maps and dt-free systems (Hénon, Ripple, Thicket, ...) ignore dt.
            speedAdjustable: a.params.dt > 0,
        }));

const speedsOf = (attractors: Attractor[]) => attractors.map((a) => a.params.dt ?? 0.01);

/** Recolours the attractor and gives each swarm point a small hue step. */
const applyColor = (attr: Attractor, rgb: RGB) => {
    attr.color = rgb;
    const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
    attr.points.forEach((pt, i) => {
        pt.color = hslToRgb((h + i * 0.02) % 1, s, l);
    });
};

/**
 * Owns the live attractor list (a ref, mutated by the render loop at 60 fps)
 * and the React-side snapshot the overlay renders from (`overlayItems`,
 * `speeds`, `palette`). Every control writes the ref first, then patches the
 * snapshot, so the simulation never waits on a re-render.
 */
export const useAttractorRoster = (initial: Attractor[]) => {
    const attractors = useRef<Attractor[]>(initial);
    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    const [speeds, setSpeeds] = useState<number[]>(() => speedsOf(initial));
    const [palette, setPalette] = useState<PaletteName>('original');

    const patchItem = useCallback((index: number, patch: Partial<OverlayItem>) => {
        setOverlayItems((prev) => prev.map((it) => (it.index === index ? { ...it, ...patch } : it)));
    }, []);

    const patchSpeed = useCallback((index: number, value: number) => {
        setSpeeds((prev) => prev.map((v, i) => (i === index ? value : v)));
    }, []);

    /** Lays the roster out in a `gridCols`-wide grid over the viewport and refreshes the overlay. */
    const layout = useCallback((width: number, height: number, gridCols: number) => {
        layoutTiles(attractors.current, width, height, gridCols);
        setOverlayItems(toOverlayItems(attractors.current));
    }, []);

    const rectOf = useCallback((index: number) => attractors.current[index]?.rect, []);

    /** Swaps in a new roster (page change). Caller re-lays out and syncs. */
    const replace = useCallback((fresh: Attractor[]) => {
        attractors.current = fresh;
        setSpeeds(speedsOf(fresh));
        setPalette('original');
    }, []);

    const rotate = useCallback((index: number, delta: { dx: number; dy: number }) => {
        const attr = attractors.current[index];
        if (!attr?.rotation) return;
        attr.rotation.y += delta.dx * ROTATE_RAD_PER_PX;
        attr.rotation.x += delta.dy * ROTATE_RAD_PER_PX;
        // Copy, so the memoised tile sees a new object and the joystick needle follows.
        patchItem(index, { rotation: { ...attr.rotation } });
    }, [patchItem]);

    const setScale = useCallback((index: number, value: number) => {
        attractors.current[index].scale = value;
        patchItem(index, { scale: value });
    }, [patchItem]);

    const setSpeed = useCallback((index: number, value: number) => {
        attractors.current[index].params.dt = value;
        patchSpeed(index, value);
    }, [patchSpeed]);

    const changePoints = useCallback((index: number, delta: number) => {
        const attr = attractors.current[index];
        if (!attr) return;
        if (delta > 0 && attr.points.length < POINT_LIMITS.max) {
            const last = attr.points[attr.points.length - 1];
            attr.points.push({ x: last.x + 0.02, y: last.y + 0.02, z: last.z + 0.02, color: { ...last.color } });
        } else if (delta < 0 && attr.points.length > POINT_LIMITS.min) {
            attr.points.pop();
        }
        patchItem(index, { pointCount: attr.points.length });
    }, [patchItem]);

    const setColor = useCallback((index: number, hex: string) => {
        const rgb = hexToRgb(hex);
        applyColor(attractors.current[index], rgb);
        patchItem(index, { color: rgb });
    }, [patchItem]);

    const randomize = useCallback((index: number) => {
        const attr = attractors.current[index];
        const next = randomizeAttractor(attr);
        attr.rotation = next.rotation;
        attr.scale = next.scale;
        attr.params.dt = next.speed;
        applyColor(attr, next.color);
        patchSpeed(index, next.speed);
        patchItem(index, { rotation: next.rotation, scale: next.scale, color: next.color });
    }, [patchItem, patchSpeed]);

    const randomizeAll = useCallback(() => {
        attractors.current.forEach((_, i) => randomize(i));
    }, [randomize]);

    const applyPalette = useCallback((name: PaletteName) => {
        setPalette(name);
        const colors = PALETTES[name];
        attractors.current.forEach((attr, i) => applyColor(attr, colors[i % colors.length]));
        setOverlayItems((prev) => prev.map((it) => ({ ...it, color: colors[it.index % colors.length] })));
    }, []);

    return {
        attractors,
        overlayItems,
        speeds,
        palette,
        layout,
        rectOf,
        replace,
        rotate,
        setScale,
        setSpeed,
        changePoints,
        setColor,
        randomize,
        randomizeAll,
        applyPalette,
    };
};
