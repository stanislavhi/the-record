import { memo } from 'react';

interface HelpModalProps {
    open: boolean;
    onClose: () => void;
}

const SHORTCUTS: Array<[string, string]> = [
    ['Space', 'Pause / resume simulation'],
    ['Esc', 'Reset all trails'],
    ['?', 'Toggle this help'],
    ['S', 'Toggle stats overlay'],
    ['T', 'Toggle theme (dark / light)'],
    ['R', 'Randomize all attractors'],
    ['P', 'Snapshot canvas as PNG'],
    ['V', 'Start / stop WebM recording'],
    ['M', 'Mute / unmute audio'],
    ['N', 'Narrative tour'],
    ['+ / −', 'Add / remove point on last-focused tile'],
    ['Arrows', 'Rotate last-focused joystick'],
];

const HelpModal = memo(({ open, onClose }: HelpModalProps) => {
    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            onClick={onClose}
            className="fixed inset-0 z-modal flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-md w-full mx-4 p-6 rounded-lg border font-mono"
                style={{
                    backgroundColor: 'var(--color-panel)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-title text-ink-high">KEYBOARD SHORTCUTS</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close help"
                        className="text-label text-ink-high/60 hover:text-ink-high transition-colors px-2 py-1 border border-border rounded"
                    >
                        ESC
                    </button>
                </div>
                <dl className="space-y-2">
                    {SHORTCUTS.map(([key, desc]) => (
                        <div key={key} className="flex items-center justify-between text-value">
                            <dt>
                                <kbd className="px-2 py-0.5 bg-black/40 border border-border rounded text-ink-high min-w-[44px] inline-block text-center">
                                    {key}
                                </kbd>
                            </dt>
                            <dd className="text-ink-high/70 text-right">{desc}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
});

HelpModal.displayName = 'HelpModal';
export default HelpModal;
