import { memo } from 'react';
import type { RGB } from './types';
import { rgbToHex } from './utils/colorUtils';
import { POINT_LIMITS, SCALE_LIMITS, SPEED_LIMITS } from './constants';

interface ControlPanelProps {
    accentColor: string;
    color: RGB;
    pointCount: number;
    scale: number;
    speed: number;
    onColorChange: (hex: string) => void;
    onPointsChange: (delta: number) => void;
    onScaleChange: (value: number) => void;
    onSpeedChange: (value: number) => void;
    onFlush: () => void;
}

const ControlPanel = memo((props: ControlPanelProps) => {
    const {
        accentColor,
        color,
        pointCount,
        scale,
        speed,
        onColorChange,
        onPointsChange,
        onScaleChange,
        onSpeedChange,
        onFlush,
    } = props;

    return (
        <div
            className="pointer-events-auto flex flex-col gap-2 p-3 rounded-lg border backdrop-blur-sm fade-in transition-base duration-200"
            style={{
                backgroundColor: 'var(--color-panel)',
                borderColor: 'var(--color-border)',
            }}
        >
            <section>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-label text-gray-400 font-mono tracking-widest">PHYSICS</span>
                </div>

                <label className="flex flex-col gap-1 mb-2">
                    <div className="flex justify-between text-label text-gray-500 font-mono">
                        <span>SCALE</span>
                        <span>{scale.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        aria-label="Scale"
                        min={SCALE_LIMITS.min}
                        max={SCALE_LIMITS.max}
                        step={SCALE_LIMITS.step}
                        value={scale}
                        onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-lg cursor-pointer"
                    />
                </label>

                <label className="flex flex-col gap-1 mb-2">
                    <div className="flex justify-between text-label text-gray-500 font-mono">
                        <span>SPEED</span>
                        <span>{speed.toFixed(3)}</span>
                    </div>
                    <input
                        type="range"
                        aria-label="Speed"
                        min={SPEED_LIMITS.min}
                        max={SPEED_LIMITS.max}
                        step={SPEED_LIMITS.step}
                        value={speed}
                        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-lg cursor-pointer"
                    />
                </label>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-label text-gray-400 font-mono">POINTS</span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            aria-label="Decrease points"
                            onClick={() => onPointsChange(-1)}
                            disabled={pointCount <= POINT_LIMITS.min}
                            className="w-6 h-6 text-sm font-bold bg-gray-800 hover:bg-ink-low/40 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded border border-white/10 transition-base duration-150 focus-visible:ring-2 focus-visible:ring-ink-low/60"
                        >
                            −
                        </button>
                        <span className="text-value text-white font-mono w-6 text-center tabular-nums">
                            {pointCount}
                        </span>
                        <button
                            type="button"
                            aria-label="Increase points"
                            onClick={() => onPointsChange(1)}
                            disabled={pointCount >= POINT_LIMITS.max}
                            className="w-6 h-6 text-sm font-bold bg-gray-800 hover:bg-ink-high/40 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded border border-white/10 transition-base duration-150 focus-visible:ring-2 focus-visible:ring-ink-high/60"
                        >
                            +
                        </button>
                    </div>
                </div>
            </section>

            <section className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2">
                        <span className="text-label text-gray-500 font-mono">COLOR</span>
                        <input
                            type="color"
                            aria-label="Attractor color"
                            className="w-5 h-5 rounded cursor-pointer"
                            value={rgbToHex(color)}
                            onChange={(e) => onColorChange(e.target.value)}
                            style={{ boxShadow: `0 0 6px ${accentColor}88` }}
                        />
                    </label>
                    <button
                        type="button"
                        aria-label="Flush this attractor's trail"
                        onClick={onFlush}
                        className="px-2 py-0.5 text-label font-mono uppercase bg-ink-low/10 hover:bg-ink-low text-ink-low hover:text-white rounded border border-ink-low/30 transition-base duration-150 focus-visible:ring-2 focus-visible:ring-ink-low/60"
                    >
                        Flush
                    </button>
                </div>
            </section>
        </div>
    );
});

ControlPanel.displayName = 'ControlPanel';
export default ControlPanel;
