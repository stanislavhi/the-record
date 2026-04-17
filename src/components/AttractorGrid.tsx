import { memo } from 'react';
import type { OverlayItem } from './types';
import AttractorTile from './AttractorTile';

interface AttractorGridProps {
    items: OverlayItem[];
    speeds: number[];
    onRotate: (index: number, delta: { dx: number; dy: number }) => void;
    onScaleChange: (index: number, value: number) => void;
    onSpeedChange: (index: number, value: number) => void;
    onPointsChange: (index: number, delta: number) => void;
    onColorChange: (index: number, hex: string) => void;
    onFlush: (index: number) => void;
}

const AttractorGrid = memo((props: AttractorGridProps) => {
    const { items, speeds, ...handlers } = props;
    return (
        <>
            {items.map((item) => (
                <AttractorTile
                    key={item.index}
                    item={item}
                    speed={speeds[item.index] ?? 0.01}
                    {...handlers}
                />
            ))}
        </>
    );
});

AttractorGrid.displayName = 'AttractorGrid';
export default AttractorGrid;
