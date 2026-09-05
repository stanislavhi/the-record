import { memo } from 'react';

interface PausedOverlayProps {
    visible: boolean;
}

const PausedOverlay = memo(({ visible }: PausedOverlayProps) => {
    if (!visible) return null;
    return (
        <div className="absolute inset-0 z-overlay flex items-center justify-center pointer-events-none bg-black/30 fade-in">
            <div className="text-center font-mono">
                <div className="text-3xl tracking-[0.4em] text-ink-high animate-pulse">PAUSED</div>
                <div className="text-label text-ink-high/60 mt-2">Press Space to resume</div>
            </div>
        </div>
    );
});

PausedOverlay.displayName = 'PausedOverlay';
export default PausedOverlay;
