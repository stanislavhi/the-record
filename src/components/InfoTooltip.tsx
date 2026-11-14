import { memo } from 'react';
import type { AttractorType } from './types';
import { ATTRACTOR_INFO } from './attractors/attractorInfo';

interface InfoTooltipProps {
    type: AttractorType;
    accentColor: string;
    id: string;
}

const InfoTooltip = memo(({ type, accentColor, id }: InfoTooltipProps) => {
    const info = ATTRACTOR_INFO[type];
    if (!info) return null;

    return (
        <div
            id={id}
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full mt-2 w-[260px] -translate-x-1/2 rounded-md border px-3 py-2 text-value opacity-0 shadow-lg backdrop-blur-sm transition-base duration-150 group-hover/title:opacity-100 group-focus-within/title:opacity-100 z-toolbar"
            style={{
                background: 'color-mix(in srgb, var(--color-panel) 92%, transparent)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-foreground)',
            }}
        >
            <div
                className="text-label font-semibold tracking-wider uppercase"
                style={{ color: accentColor }}
            >
                {info.name}
            </div>
            <div className="mt-0.5 text-[10px] opacity-70">
                {info.discoverer} · {info.year}
                {info.badge && (
                    <span
                        className="ml-1.5 rounded-sm border px-1 py-px text-[9px] uppercase tracking-wider"
                        style={{ borderColor: accentColor, color: accentColor }}
                    >
                        {info.badge}
                    </span>
                )}
            </div>
            <div className="mt-2 flex flex-col gap-0.5 font-mono text-[10px] leading-snug opacity-90">
                {info.equations.map((eq) => (
                    <div key={eq}>{eq}</div>
                ))}
            </div>
            <div className="mt-2 text-[10px] opacity-70">
                Lyapunov <span className="opacity-100">{info.lyapunov}</span>
            </div>
            <div className="mt-2 text-[11px] leading-snug opacity-85">
                {info.blurb}
            </div>
        </div>
    );
});

InfoTooltip.displayName = 'InfoTooltip';
export default InfoTooltip;
