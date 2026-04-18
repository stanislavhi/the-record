import { memo } from 'react';

interface AudioPanelProps {
    muted: boolean;
    volume: number;
    onToggleMute: () => void;
    onVolumeChange: (value: number) => void;
}

const AudioPanel = memo(({ muted, volume, onToggleMute, onVolumeChange }: AudioPanelProps) => {
    return (
        <label
            className="flex items-center gap-2 px-2 py-1 text-label uppercase tracking-widest font-mono rounded border bg-black/30 border-border"
            style={{ backdropFilter: 'blur(6px)' }}
            title="Master audio (M to mute)"
        >
            <button
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                aria-pressed={!muted}
                className={`px-2 rounded transition-base duration-150 ${
                    muted ? 'text-ink-high/60' : 'text-ink-high'
                }`}
            >
                {muted ? '♪ Off' : '♪ On'}
            </button>
            <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                disabled={muted}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                aria-label="Master volume"
                className="w-20 accent-ink-high disabled:opacity-40"
            />
        </label>
    );
});

AudioPanel.displayName = 'AudioPanel';
export default AudioPanel;
