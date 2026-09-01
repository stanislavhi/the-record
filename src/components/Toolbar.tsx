import { memo } from 'react';
import type { AttractorPage, PerfMode, Theme } from './types';
import { PALETTE_LABELS, type PaletteName } from '../utils/palettes';

const PERF_LABELS: Record<PerfMode, string> = {
    low: 'Low',
    med: 'Med',
    high: 'High',
};

interface ToolbarProps {
    paused: boolean;
    theme: Theme;
    statsVisible: boolean;
    palette: PaletteName;
    perfMode: PerfMode;
    recording: boolean;
    recordElapsedLabel: string | null;
    page: AttractorPage;
    onPageChange: (page: AttractorPage) => void;
    onTogglePause: () => void;
    onResetAll: () => void;
    onToggleTheme: () => void;
    onToggleStats: () => void;
    onToggleHelp: () => void;
    onToggleTour: () => void;
    onRandomizeAll: () => void;
    onPaletteChange: (palette: PaletteName) => void;
    onPerfModeChange: (mode: PerfMode) => void;
    onSnapshot: () => void;
    onToggleRecording: () => void;
}

interface ButtonProps {
    label: string;
    title: string;
    onClick: () => void;
    active?: boolean;
}

const ToolbarButton = ({ label, title, onClick, active }: ButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        aria-pressed={active}
        className={`px-3 py-1 text-label uppercase tracking-widest font-mono rounded border transition-base duration-150 focus-visible:ring-2 focus-visible:ring-ink-high/60 ${
            active
                ? 'bg-ink-high/20 text-ink-high border-ink-high/60'
                : 'bg-black/30 text-ink-high/70 border-border hover:bg-ink-high/10 hover:text-ink-high'
        }`}
        style={{ backdropFilter: 'blur(6px)' }}
    >
        {label}
    </button>
);

const Toolbar = memo((props: ToolbarProps) => {
    const {
        paused,
        theme,
        statsVisible,
        palette,
        perfMode,
        recording,
        recordElapsedLabel,
        page,
        onPageChange,
        onTogglePause,
        onResetAll,
        onToggleTheme,
        onToggleStats,
        onToggleHelp,
        onToggleTour,
        onRandomizeAll,
        onPaletteChange,
        onPerfModeChange,
        onSnapshot,
        onToggleRecording,
    } = props;

    return (
        <div className="pointer-events-none fixed bottom-0 inset-x-0 p-4 flex justify-center z-toolbar">
            <div
                className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 p-2 rounded-lg border backdrop-blur-sm max-w-[95vw]"
                style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
            >
                <ToolbarButton
                    label={paused ? 'Resume' : 'Pause'}
                    title="Pause or resume the simulation (Space)"
                    onClick={onTogglePause}
                    active={paused}
                />
                <ToolbarButton
                    label="Reset"
                    title="Reset all trails (Esc)"
                    onClick={onResetAll}
                />
                <ToolbarButton
                    label="🎲 All"
                    title="Randomize every attractor"
                    onClick={onRandomizeAll}
                />
                <ToolbarButton
                    label={page === 'original' ? 'Page 1' : 'Page 2 ✦'}
                    title={
                        page === 'original'
                            ? 'Back to the ten classic attractors (1)'
                            : 'Page 2 — ten original attractors invented for The Record (2)'
                    }
                    onClick={() => onPageChange(page === 'original' ? 'classic' : 'original')}
                    active={page === 'original'}
                />
                <label
                    className="flex items-center gap-1 px-2 py-1 text-label uppercase tracking-widest font-mono rounded border bg-black/30 border-border"
                    style={{ backdropFilter: 'blur(6px)' }}
                    title="Apply a color palette to all attractors"
                >
                    <span className="text-ink-high/70">Palette</span>
                    <select
                        aria-label="Color palette"
                        value={palette}
                        onChange={(e) => onPaletteChange(e.target.value as PaletteName)}
                        className="bg-transparent text-ink-high border-0 outline-none cursor-pointer font-mono text-label uppercase tracking-widest"
                    >
                        {(Object.keys(PALETTE_LABELS) as PaletteName[]).map((p) => (
                            <option key={p} value={p} className="bg-black text-ink-high">
                                {PALETTE_LABELS[p]}
                            </option>
                        ))}
                    </select>
                </label>
                <label
                    className="flex items-center gap-1 px-2 py-1 text-label uppercase tracking-widest font-mono rounded border bg-black/30 border-border"
                    style={{ backdropFilter: 'blur(6px)' }}
                    title="Performance preset (substeps + glow)"
                >
                    <span className="text-ink-high/70">Perf</span>
                    <select
                        aria-label="Performance mode"
                        value={perfMode}
                        onChange={(e) => onPerfModeChange(e.target.value as PerfMode)}
                        className="bg-transparent text-ink-high border-0 outline-none cursor-pointer font-mono text-label uppercase tracking-widest"
                    >
                        {(Object.keys(PERF_LABELS) as PerfMode[]).map((m) => (
                            <option key={m} value={m} className="bg-black text-ink-high">
                                {PERF_LABELS[m]}
                            </option>
                        ))}
                    </select>
                </label>
                <ToolbarButton
                    label="PNG"
                    title="Save a PNG snapshot"
                    onClick={onSnapshot}
                />
                <ToolbarButton
                    label={recording ? `■ ${recordElapsedLabel ?? '00:00'}` : '● Rec'}
                    title={
                        recording
                            ? 'Stop recording and download WebM (auto-stops at 60s)'
                            : 'Record WebM video (max 60s)'
                    }
                    onClick={onToggleRecording}
                    active={recording}
                />
                <ToolbarButton
                    label="Tour"
                    title="Start the narrative tour (N)"
                    onClick={onToggleTour}
                />
                <ToolbarButton
                    label={theme === 'dark' ? '☽ Dark' : '☀ Light'}
                    title="Toggle theme (T)"
                    onClick={onToggleTheme}
                />
                <ToolbarButton
                    label="Stats"
                    title="Toggle stats overlay (S)"
                    onClick={onToggleStats}
                    active={statsVisible}
                />
                <ToolbarButton
                    label="?"
                    title="Keyboard shortcuts (?)"
                    onClick={onToggleHelp}
                />
            </div>
        </div>
    );
});

Toolbar.displayName = 'Toolbar';
export default Toolbar;
