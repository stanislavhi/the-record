import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AttractorPage, PerfMode } from './types';
import {
    CANVAS_STYLE,
    DEFAULT_PAGE,
    PAGE_LABELS,
    PAGE_STORAGE_KEY,
    PERF_PRESETS,
    USE_WORKER,
    createInitialAttractors,
    isAttractorPage,
} from './constants';
import AttractorGrid from './AttractorGrid';
import StatsHUD from './StatsHUD';
import HelpModal from './HelpModal';
import Toolbar from './Toolbar';
import IntroOverlay from './IntroOverlay';
import PausedOverlay from './PausedOverlay';
import TourModal from './TourModal';
import AudioPanel from './AudioPanel';
import { useBreakpoint, getGridCols } from '../hooks/useBreakpoint';
import { useTheme } from '../hooks/useTheme';
import { useFPS } from '../hooks/useFPS';
import { useAttractorSynth } from '../hooks/useAttractorSynth';
import { useAttractorWorker } from '../hooks/useAttractorWorker';
import { usePersistentState } from '../hooks/usePersistentState';
import { useCanvasRecorder } from '../hooks/useCanvasRecorder';
import { useAttractorRoster } from '../hooks/useAttractorRoster';
import { useAppShortcuts } from '../hooks/useAppShortcuts';
import { getThemeTokens } from '../utils/themeTokens';
import { snapshotPNG } from '../utils/exportCanvas';
import { TrailGrid } from '../engine/trailGrid';
import { ParticleField, type PointerState } from '../engine/particleField';
import { drawAttractors } from '../engine/drawAttractors';

const isPerfMode = (v: unknown): v is PerfMode => v === 'low' || v === 'med' || v === 'high';
/** Push energy into React state every N frames (the HUD doesn't need 60 Hz). */
const ENERGY_UI_EVERY = 30;
/** Feed the synth every N frames. */
const AUDIO_EVERY = 4;

/**
 * Composition root: owns the canvas, the frame loop and the app-level UI state,
 * and wires the engine (engine/*) to the overlay components. Simulation state
 * lives in refs so the 60 fps loop never triggers a React render.
 */
const TheVoid = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [grid] = useState(() => new TrailGrid());
    const [field] = useState(() => new ParticleField());
    const pointerRef = useRef<PointerState>({ x: 0, y: 0, active: false });
    const focusedIndexRef = useRef(0);

    const [page, setPage] = usePersistentState<AttractorPage>(PAGE_STORAGE_KEY, DEFAULT_PAGE, isAttractorPage);
    const [perfMode, setPerfMode] = usePersistentState<PerfMode>('perfMode', 'med', isPerfMode);
    const [initialAttractors] = useState(() => createInitialAttractors(page));
    const roster = useAttractorRoster(initialAttractors);
    const { attractors, layout, rectOf } = roster;

    const [paused, setPaused] = useState(false);
    const [intro, setIntro] = useState(true);
    const [statsVisible, setStatsVisible] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [tourOpen, setTourOpen] = useState(false);
    const [tourIndex, setTourIndex] = useState(0);
    const [phase, setPhase] = useState('AWAITING MERGE');
    const [energy, setEnergy] = useState(100);

    const { theme, toggleTheme } = useTheme();
    const breakpoint = useBreakpoint();
    const { fps, tick: tickFPS } = useFPS();
    const audio = useAttractorSynth(initialAttractors.length);
    const recorder = useCanvasRecorder(canvasRef);

    // Worker physics is scaffolded but off (USE_WORKER); seeded with the mount-time page only.
    useAttractorWorker({
        enabled: USE_WORKER,
        attractors: initialAttractors,
        subSteps: PERF_PRESETS[perfMode].subSteps,
        henonStepInterval: CANVAS_STYLE.henonStepInterval,
    });

    // Mirrors read by the frame loop without re-subscribing it.
    const live = useRef({ paused, intro, theme, perfMode, page, synth: audio.synth });
    useEffect(() => {
        live.current = { paused, intro, theme, perfMode, page, synth: audio.synth };
    }, [paused, intro, theme, perfMode, page, audio.synth]);
    useEffect(() => {
        audio.duck(paused);
    }, [paused, audio]);

    const pageTypes = useMemo(() => roster.overlayItems.map((it) => it.type), [roster.overlayItems]);
    const totalPoints = useMemo(
        () => roster.overlayItems.reduce((sum, it) => sum + it.pointCount, 0),
        [roster.overlayItems]
    );

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        grid.resize(canvas.width, canvas.height);
        layout(canvas.width, canvas.height, getGridCols(breakpoint));
    }, [breakpoint, grid, layout]);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    const triggerMerge = useCallback(() => {
        if (!live.current.intro) return;
        live.current.intro = false; // block a double merge before the effect runs
        setIntro(false);
        setPhase(PAGE_LABELS[live.current.page].phase);
        audio.start();
        field.burst(window.innerWidth / 2, window.innerHeight / 2);
    }, [audio, field]);

    // Frame loop.
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d', { alpha: false });
        if (!canvas || !ctx) return;
        let raf = 0;
        let frame = 0;

        const render = () => {
            raf = requestAnimationFrame(render);
            const { paused, intro, theme, perfMode, synth } = live.current;
            if (paused) return;
            tickFPS();
            const tokens = getThemeTokens(theme);
            const perf = PERF_PRESETS[perfMode];

            ctx.fillStyle = `rgba(${tokens.voidRGB}, ${tokens.fadeAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (intro) return;

            frame += 1;
            field.regen();
            if (frame % ENERGY_UI_EVERY === 0) setEnergy(field.energy);
            if (frame % AUDIO_EVERY === 0 && synth.isStarted) {
                attractors.current.forEach((a, i) => {
                    const pt = a.points[0];
                    if (pt) synth.update(i, { x: pt.x, y: pt.y, z: pt.z });
                });
            }

            drawAttractors(ctx, attractors.current, grid, {
                tokens,
                subSteps: perf.subSteps,
                glow: Math.min(tokens.glow, perf.shadowBlur),
                centerX: canvas.width / 2,
                centerY: canvas.height / 2,
            });
            field.inkFromPointer(pointerRef.current);
            field.update(grid);
            ctx.shadowBlur = 0;
            grid.paint(ctx, tokens.gridIntensity);
            field.draw(ctx, tokens.glow, tokens.inkHigh);
        };

        raf = requestAnimationFrame(render);
        return () => cancelAnimationFrame(raf);
    }, [attractors, grid, field, tickFPS]);

    // Pointer ink + click-to-merge.
    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
        };
        const onOut = () => {
            pointerRef.current.active = false;
            field.releasePointer();
        };
        const onClick = (e: MouseEvent) => {
            if ((e.target as HTMLElement | null)?.closest('[data-no-merge]')) return;
            triggerMerge();
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerout', onOut);
        window.addEventListener('click', onClick, { capture: true });
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerout', onOut);
            window.removeEventListener('click', onClick, { capture: true });
        };
    }, [triggerMerge, field]);

    const handleFlush = useCallback((index: number) => {
        const rect = rectOf(index);
        if (rect) grid.clearRect(rect);
    }, [rectOf, grid]);

    const handleResetAll = useCallback(() => {
        grid.clear();
        field.clear();
    }, [grid, field]);

    /** Rebuilds the roster for another page: fresh attractors, cleared trails, new layout, reset per-tile UI. */
    const handlePageChange = useCallback((next: AttractorPage) => {
        if (next === page) return;
        roster.replace(createInitialAttractors(next));
        focusedIndexRef.current = 0;
        setPage(next);
        setTourIndex(0);
        if (!live.current.intro) setPhase(PAGE_LABELS[next].phase);
        handleResetAll();
        resizeCanvas();
    }, [page, roster, setPage, handleResetAll, resizeCanvas]);

    const handleSnapshot = useCallback(() => {
        if (canvasRef.current) snapshotPNG(canvasRef.current);
    }, []);

    const toggleTour = useCallback(() => {
        setTourOpen((open) => {
            if (!open) setTourIndex(0);
            return !open;
        });
    }, []);
    const tourCount = pageTypes.length;
    const tourNext = useCallback(() => setTourIndex((i) => Math.min(i + 1, tourCount - 1)), [tourCount]);
    const tourPrev = useCallback(() => setTourIndex((i) => Math.max(i - 1, 0)), []);
    const togglePause = useCallback(() => setPaused((p) => !p), []);
    const toggleStats = useCallback(() => setStatsVisible((v) => !v), []);
    const toggleHelp = useCallback(() => setHelpOpen((v) => !v), []);
    const handleTileFocus = useCallback((index: number) => {
        focusedIndexRef.current = index;
    }, []);

    const shortcutActions = useMemo(() => ({
        helpOpen,
        tourOpen,
        togglePause,
        closeHelp: () => setHelpOpen(false),
        closeTour: () => setTourOpen(false),
        resetAll: handleResetAll,
        toggleHelp,
        toggleStats,
        toggleTheme,
        toggleTour,
        randomizeAll: roster.randomizeAll,
        snapshot: handleSnapshot,
        toggleRecording: recorder.toggle,
        toggleMute: audio.toggleMute,
        setPage: handlePageChange,
        focusedIndex: () => focusedIndexRef.current,
        changePoints: roster.changePoints,
        rotate: roster.rotate,
    }), [
        helpOpen, tourOpen, togglePause, handleResetAll, toggleHelp, toggleStats, toggleTheme, toggleTour,
        roster.randomizeAll, roster.changePoints, roster.rotate, handleSnapshot, recorder.toggle, audio.toggleMute,
        handlePageChange,
    ]);
    useAppShortcuts(shortcutActions);

    return (
        <div className="relative w-full h-full overflow-hidden" data-theme={theme}>
            <canvas ref={canvasRef} className="absolute inset-0 z-canvas" />

            {intro && <IntroOverlay loading={false} />}

            <AttractorGrid
                items={roster.overlayItems}
                speeds={roster.speeds}
                spotlightIndex={tourOpen ? tourIndex : null}
                onRotate={roster.rotate}
                onScaleChange={roster.setScale}
                onSpeedChange={roster.setSpeed}
                onPointsChange={roster.changePoints}
                onColorChange={roster.setColor}
                onFlush={handleFlush}
                onRandomize={roster.randomize}
                onTileFocus={handleTileFocus}
            />

            <PausedOverlay visible={paused} />

            <StatsHUD fps={fps} pointCount={totalPoints} energy={energy} phase={phase} visible={statsVisible} />

            <div data-no-merge className="pointer-events-none fixed bottom-16 inset-x-0 flex justify-center z-toolbar">
                <div className="pointer-events-auto">
                    <AudioPanel
                        muted={audio.muted}
                        volume={audio.volume}
                        onToggleMute={audio.toggleMute}
                        onVolumeChange={audio.setVolume}
                    />
                </div>
            </div>

            <div data-no-merge>
                <Toolbar
                    paused={paused}
                    theme={theme}
                    statsVisible={statsVisible}
                    palette={roster.palette}
                    perfMode={perfMode}
                    recording={recorder.recording}
                    recordElapsedLabel={recorder.elapsedLabel}
                    page={page}
                    onPageChange={handlePageChange}
                    onTogglePause={togglePause}
                    onResetAll={handleResetAll}
                    onToggleTheme={toggleTheme}
                    onToggleStats={toggleStats}
                    onToggleHelp={toggleHelp}
                    onToggleTour={toggleTour}
                    onRandomizeAll={roster.randomizeAll}
                    onPaletteChange={roster.applyPalette}
                    onPerfModeChange={setPerfMode}
                    onSnapshot={handleSnapshot}
                    onToggleRecording={recorder.toggle}
                />
            </div>

            <HelpModal open={helpOpen} onClose={toggleHelp} />
            <TourModal
                open={tourOpen}
                types={pageTypes}
                index={tourIndex}
                onNext={tourNext}
                onPrev={tourPrev}
                onClose={toggleTour}
            />
        </div>
    );
};

export default TheVoid;
