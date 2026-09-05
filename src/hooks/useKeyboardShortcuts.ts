import { useEffect } from 'react';

export type ShortcutMap = Record<string, (e: KeyboardEvent) => void>;

export const useKeyboardShortcuts = (shortcuts: ShortcutMap, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target) {
                const tag = target.tagName;
                if (
                    tag === 'INPUT' ||
                    tag === 'TEXTAREA' ||
                    tag === 'SELECT' ||
                    target.isContentEditable
                ) {
                    if (e.code !== 'Escape') return;
                }
            }

            const key = e.code;
            const handler = shortcuts[key] ?? shortcuts[e.key];
            if (handler) {
                handler(e);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [shortcuts, enabled]);
};
