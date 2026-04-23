import { memo } from 'react';

interface StatsHUDProps {
    fps: number;
    pointCount: number;
    energy: number;
    phase: string;
    visible: boolean;
}

const StatsHUD = memo(({ fps, pointCount, energy, phase, visible }: StatsHUDProps) => {
    if (!visible) return null;

    const energyColor = energy < 20 ? 'var(--color-ink-low)' : 'var(--color-ink-high)';

    return (
        <div className="pointer-events-none absolute inset-x-0 top-0 p-6 flex justify-between items-start z-hud fade-in">
            <div className="flex flex-col gap-1">
                <h1 className="text-label tracking-[0.2em] text-ink-high/60 font-bold">THE RECORD</h1>
                <div className="text-value text-ink-high animate-pulse">{phase}</div>
            </div>
            <div className="flex flex-col items-end gap-1 text-label font-mono tabular-nums">
                <div className="flex gap-3">
                    <span className="text-ink-high/50">FPS</span>
                    <span className="text-ink-high w-8 text-right">{fps}</span>
                </div>
                <div className="flex gap-3">
                    <span className="text-ink-high/50">POINTS</span>
                    <span className="text-ink-high w-8 text-right">{pointCount}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-ink-high/50">INK</span>
                    <div className="w-24 h-1 bg-black/60 border border-border relative overflow-hidden">
                        <div
                            className="h-full transition-all duration-150 ease-linear"
                            style={{
                                width: `${Math.max(0, Math.min(100, energy))}%`,
                                backgroundColor: energyColor,
                                boxShadow: `0 0 10px ${energyColor}`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

StatsHUD.displayName = 'StatsHUD';
export default StatsHUD;
