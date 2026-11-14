import { useMemo } from 'react';
import type { AttractorPage } from '../components/types';
import { useKeyboardShortcuts, type ShortcutMap } from './useKeyboardShortcuts';

const ROTATE_STEP_PX = 5;

export interface AppShortcutActions {
    helpOpen: boolean;
    tourOpen: boolean;
    togglePause: () => void;
    closeHelp: () => void;
    closeTour: () => void;
    resetAll: () => void;
    toggleHelp: () => void;
    toggleStats: () => void;
    toggleTheme: () => void;
    toggleTour: () => void;
    randomizeAll: () => void;
    snapshot: () => void;
    toggleRecording: () => void;
    toggleMute: () => void;
    setPage: (page: AttractorPage) => void;
    /** Point-count and rotation keys act on the last focused tile. */
    focusedIndex: () => number;
    changePoints: (index: number, delta: number) => void;
    rotate: (index: number, delta: { dx: number; dy: number }) => void;
}

/** Keyboard map for the whole app (see HelpModal for the user-facing list). */
export const useAppShortcuts = (a: AppShortcutActions) => {
    const shortcuts = useMemo<ShortcutMap>(() => {
        const plain = (e: KeyboardEvent) => !(e.ctrlKey || e.metaKey || e.altKey);
        const page = (p: AttractorPage) => (e: KeyboardEvent) => {
            if (plain(e)) a.setPage(p);
        };
        const points = (delta: number) => (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) return; // keep browser zoom
            e.preventDefault();
            a.changePoints(a.focusedIndex(), delta);
        };
        const rotate = (dx: number, dy: number) => (e: KeyboardEvent) => {
            if (a.tourOpen) return; // arrows navigate the tour
            e.preventDefault();
            a.rotate(a.focusedIndex(), { dx, dy });
        };
        return {
            Space: (e) => {
                e.preventDefault();
                a.togglePause();
            },
            Escape: () => {
                if (a.helpOpen) a.closeHelp();
                else if (a.tourOpen) a.closeTour();
                else a.resetAll();
            },
            '?': a.toggleHelp,
            KeyH: a.toggleHelp,
            KeyS: a.toggleStats,
            KeyT: a.toggleTheme,
            KeyN: a.toggleTour,
            KeyR: a.randomizeAll,
            KeyP: a.snapshot,
            KeyV: a.toggleRecording,
            KeyM: a.toggleMute,
            Digit1: page('classic'),
            Digit2: page('original'),
            Digit3: page('menagerie'),
            Digit4: page('forge'),
            Minus: points(-1),
            Equal: points(1),
            ArrowUp: rotate(0, -ROTATE_STEP_PX),
            ArrowDown: rotate(0, ROTATE_STEP_PX),
            ArrowLeft: rotate(-ROTATE_STEP_PX, 0),
            ArrowRight: rotate(ROTATE_STEP_PX, 0),
        };
    }, [a]);

    useKeyboardShortcuts(shortcuts);
};
