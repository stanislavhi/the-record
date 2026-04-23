import { memo, useState, useCallback, useRef, useEffect } from 'react';
import type { OverlayItem } from './types';
import Joystick from './Joystick';
import ControlPanel from './ControlPanel';
import { getDisplayName } from './attractors/attractorInfo';

interface AttractorTileProps {
    item: OverlayItem;
    speed: number;
    locked: boolean;
    onRotate: (index: number, delta: { dx: number; dy: number }) => void;
    onScaleChange: (index: number, value: number) => void;
    onSpeedChange: (index: number, value: number) => void;
    onPointsChange: (index: number, delta: number) => void;
    onColorChange: (index: number, hex: string) => void;
    onFlush: (index: number) => void;
}

const AttractorTile = memo((props: AttractorTileProps) => {
    const {
        item,
        speed,
        locked,
        onRotate,
        onScaleChange,
        onSpeedChange,
        onPointsChange,
        onColorChange,
        onFlush,
    } = props;

    const [open, setOpen] = useState(false);
    const tileRef = useRef<HTMLDivElement>(null);

    const accent = `rgb(${item.color.r}, ${item.color.g}, ${item.color.b})`;
    const glow = `rgba(${item.color.r}, ${item.color.g}, ${item.color.b}, 0.5)`;
    const displayName = getDisplayName(item.type);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleTileClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('input, button, [role="slider"]')) return;
        setOpen((v) => !v);
    }, []);

    // Close panel when clicking outside
    useEffect(() => {
        if (!open) return;
        const handleOutsideClick = (e: MouseEvent) => {
            if (tileRef.current && !tileRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('pointerdown', handleOutsideClick);
        return () => document.removeEventListener('pointerdown', handleOutsideClick);
    }, [open]);

    // Force close when locked (intro phase)
    useEffect(() => {
        if (locked) setOpen(false);
    }, [locked]);

    return (
        <div
            ref={tileRef}
            style={{
                position: 'absolute',
                left: item.rect.x,
                top: item.rect.y,
                width: item.rect.w,
                height: item.rect.h,
                // Tile is transparent to pointer events when closed — only the hint button is clickable
                pointerEvents: open ? 'auto' : 'none',
            }}
            className="flex flex-col justify-between p-4 box-border z-overlay"
            onClick={open ? handleTileClick : undefined}
        >
            {/* Attractor name */}
            <h3
                className="text-label font-bold tracking-[0.2em] uppercase text-center opacity-75 pointer-events-none select-none"
                style={{ color: accent, textShadow: `0 0 10px ${glow}` }}
            >
                {displayName}
            </h3>

            {/* Hint button — only clickable element when controls are closed */}
            {!open && !locked && (
                <button
                    type="button"
                    onClick={handleOpen}
                    className="self-center px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-full border backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 select-none"
                    style={{
                        pointerEvents: 'auto',
                        color: 'var(--color-ink-high)',
                        borderColor: 'var(--color-ink-high)',
                        backgroundColor: 'rgba(0, 243, 255, 0.08)',
                        textShadow: '0 0 8px var(--color-ink-high)',
                        boxShadow: '0 0 12px rgba(0, 243, 255, 0.15)',
                    }}
                >
                    ⚙ tap to control
                </button>
            )}

            {/* Controls — fully interactive when open */}
            {open && (
                <div className="flex flex-col gap-2 fade-in">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="self-end px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded border transition-all duration-150 hover:scale-105 active:scale-95"
                        style={{
                            color: 'var(--color-ink-low)',
                            borderColor: 'rgba(255, 0, 85, 0.3)',
                            backgroundColor: 'rgba(255, 0, 85, 0.08)',
                        }}
                    >
                        ✕ minimize
                    </button>
                    <Joystick
                        rotation={item.rotation}
                        accentColor={accent}
                        onRotate={(delta) => onRotate(item.index, delta)}
                    />
                    <ControlPanel
                        accentColor={accent}
                        color={item.color}
                        pointCount={item.pointCount}
                        scale={item.scale}
                        speed={speed}
                        onColorChange={(hex) => onColorChange(item.index, hex)}
                        onPointsChange={(delta) => onPointsChange(item.index, delta)}
                        onScaleChange={(v) => onScaleChange(item.index, v)}
                        onSpeedChange={(v) => onSpeedChange(item.index, v)}
                        onFlush={() => onFlush(item.index)}
                    />
                </div>
            )}
        </div>
    );
});

AttractorTile.displayName = 'AttractorTile';
export default AttractorTile;
