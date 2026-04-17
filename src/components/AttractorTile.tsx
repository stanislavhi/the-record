import { memo } from 'react';
import type { OverlayItem } from './types';
import Joystick from './Joystick';
import ControlPanel from './ControlPanel';
import { getDisplayName } from './attractors/attractorInfo';

interface AttractorTileProps {
    item: OverlayItem;
    speed: number;
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
        onRotate,
        onScaleChange,
        onSpeedChange,
        onPointsChange,
        onColorChange,
        onFlush,
    } = props;

    const accent = `rgb(${item.color.r}, ${item.color.g}, ${item.color.b})`;
    const glow = `rgba(${item.color.r}, ${item.color.g}, ${item.color.b}, 0.5)`;
    const displayName = getDisplayName(item.type);

    return (
        <div
            style={{
                position: 'absolute',
                left: item.rect.x,
                top: item.rect.y,
                width: item.rect.w,
                height: item.rect.h,
                pointerEvents: 'none',
            }}
            className="group flex flex-col justify-between p-4 box-border z-overlay"
        >
            <h3
                className="text-label font-bold tracking-[0.2em] uppercase text-center transition-base duration-200 group-hover:opacity-100 opacity-75"
                style={{ color: accent, textShadow: `0 0 10px ${glow}` }}
            >
                {displayName}
            </h3>

            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-base duration-200">
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
        </div>
    );
});

AttractorTile.displayName = 'AttractorTile';
export default AttractorTile;
