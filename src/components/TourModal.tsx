import { memo, useEffect } from 'react';
import type { AttractorType } from './types';
import { ATTRACTOR_INFO } from './attractors/attractorInfo';

interface TourModalProps {
    open: boolean;
    types: AttractorType[];
    index: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}

const TourModal = memo((props: TourModalProps) => {
    const { open, types, index, onNext, onPrev, onClose } = props;

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') onNext();
            else if (e.key === 'ArrowLeft') onPrev();
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onNext, onPrev, onClose]);

    if (!open) return null;
    const type = types[index];
    const info = ATTRACTOR_INFO[type];
    if (!info) return null;

    return (
        <div
            className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-title"
        >
            <div
                className="relative max-w-md w-[92vw] rounded-lg border p-6"
                style={{
                    backgroundColor: 'var(--color-panel)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-2 text-label font-mono uppercase tracking-widest opacity-70">
                    <span>
                        {index + 1} / {types.length}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close tour"
                        className="opacity-60 hover:opacity-100 transition-base duration-150"
                    >
                        ✕
                    </button>
                </div>
                <h2
                    id="tour-title"
                    className="text-title font-bold tracking-wider uppercase"
                    style={{ color: 'var(--color-ink-high)' }}
                >
                    {info.name}
                </h2>
                <div className="text-value opacity-70 mt-1">
                    {info.discoverer} · {info.year} · Lyapunov {info.lyapunov}
                </div>
                {info.original && (
                    <div className="mt-1 text-label font-mono uppercase tracking-widest opacity-60">
                        Page 2 original — invented for this project, not from the literature
                    </div>
                )}
                <div className="mt-3 flex flex-col gap-1 font-mono text-value leading-snug">
                    {info.equations.map((eq) => (
                        <div key={eq}>{eq}</div>
                    ))}
                </div>
                <p className="mt-3 text-value leading-relaxed opacity-90">{info.blurb}</p>
                <div className="mt-5 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={onPrev}
                        disabled={index === 0}
                        className="px-3 py-1 text-label font-mono uppercase tracking-widest rounded border bg-black/30 border-border hover:bg-ink-high/10 hover:text-ink-high text-ink-high/70 disabled:opacity-30 disabled:cursor-not-allowed transition-base duration-150"
                    >
                        ← Prev
                    </button>
                    <div className="text-label font-mono opacity-50">← → to navigate</div>
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={index >= types.length - 1}
                        className="px-3 py-1 text-label font-mono uppercase tracking-widest rounded border bg-ink-high/20 border-ink-high/60 text-ink-high hover:bg-ink-high/30 disabled:opacity-30 disabled:cursor-not-allowed transition-base duration-150"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
});

TourModal.displayName = 'TourModal';
export default TourModal;
