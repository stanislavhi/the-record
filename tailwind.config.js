/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                void: 'var(--color-void)',
                ink: {
                    high: 'var(--color-ink-high)',
                    low: 'var(--color-ink-low)',
                },
                grid: 'var(--color-grid)',
                panel: 'var(--color-panel)',
                border: 'var(--color-border)',
            },
            fontSize: {
                label: ['11px', { lineHeight: '1.2' }],
                value: ['12px', { lineHeight: '1.4' }],
                title: ['14px', { lineHeight: '1.3', letterSpacing: '0.2em' }],
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            zIndex: {
                canvas: '0',
                overlay: '10',
                hud: '40',
                toolbar: '45',
                modal: '100',
            },
            transitionProperty: {
                base: 'background-color, border-color, color, opacity, transform, box-shadow',
            },
        },
    },
    plugins: [],
}
