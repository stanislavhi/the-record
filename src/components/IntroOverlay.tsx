import { memo } from 'react';

interface IntroOverlayProps {
    loading: boolean;
}

const IntroOverlay = memo(({ loading }: IntroOverlayProps) => (
    <div className="absolute inset-0 z-overlay flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="flex flex-col items-center gap-4 fade-in">
            <div className="text-2xl font-mono tracking-[0.3em] text-ink-high animate-pulse">
                CLICK TO MERGE
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
