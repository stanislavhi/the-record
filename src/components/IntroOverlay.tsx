import { memo } from 'react';

interface IntroOverlayProps {
    loading: boolean;
    onMerge: () => void;
}

const IntroOverlay = memo(({ loading, onMerge }: IntroOverlayProps) => (
    <div
        className="fixed inset-0 flex flex-col items-center justify-center select-none cursor-pointer"
        style={{
            zIndex: 9999,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#0a0a0a',
        }}
        onClick={onMerge}
    >
        <div className="flex flex-col items-center gap-6 fade-in">
            <div
                className="text-3xl font-mono tracking-[0.4em] animate-pulse"
                style={{
                    color: 'var(--color-ink-high)',
                    textShadow: '0 0 20px var(--color-ink-high), 0 0 40px var(--color-ink-high)',
                }}
            >
                CLICK TO MERGE
            </div>
            <div
                className="text-sm font-mono tracking-[0.15em] opacity-40"
                style={{ color: 'var(--color-ink-high)' }}
            >
                the record awaits
            </div>
            {loading && (
                <div className="flex gap-2" aria-live="polite" aria-label="Loading">
                    <span className="loading-dot w-2 h-2 bg-ink-high rounded-full" style={{ animationDelay: '0ms' }} />
                    <span className="loading-dot w-2 h-2 bg-ink-high rounded-full" style={{ animationDelay: '150ms' }} />
                    <span className="loading-dot w-2 h-2 bg-ink-high rounded-full" style={{ animationDelay: '300ms' }} />
                </div>
            )}
        </div>
    </div>
));

IntroOverlay.displayName = 'IntroOverlay';
export default IntroOverlay;

