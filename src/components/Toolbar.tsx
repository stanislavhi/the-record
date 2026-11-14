import { memo } from 'react';
import type { Theme } from './types';

interface ToolbarProps {
    paused: boolean;
    theme: Theme;
    statsVisible: boolean;
    onTogglePause: () => void;
    onResetAll: () => void;
    onToggleTheme: () => void;
    onToggleStats: () => void;
    onToggleHelp: () => void;
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
        onTogglePause,
        onResetAll,
        onToggleTheme,
        onToggleStats,
        onToggleHelp,
    } = props;

    return (
        <div className="pointer-events-none fixed bottom-0 inset-x-0 p-4 flex justify-center z-toolbar">
            <div className="pointer-events-auto flex gap-2 p-2 rounded-lg border backdrop-blur-sm" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
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
