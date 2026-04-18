import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Attractor, OverlayItem, Particle, RGB, Theme } from './types';
import {
    CANVAS_STYLE,
    DECAY_RATE,
    ENERGY_COST,
    ENERGY_REGEN,
    GRID_SIZE,
    INK_COLOR,
    LAYOUT,
    POINT_LIMITS,
    SUB_STEPS,
    createInitialAttractors,
} from './constants';
import { hexToRgb, hslToRgb, rgbToHsl } from './utils/colorUtils';
import { project } from './utils/projection';
import { calculateAttractorStep, isPointStable, resetPoint } from './attractors/attractorCalculations';
import AttractorGrid from './AttractorGrid';
import StatsHUD from './StatsHUD';
import HelpModal from './HelpModal';
import Toolbar from './Toolbar';
import IntroOverlay from './IntroOverlay';
import PausedOverlay from './PausedOverlay';
import TourModal from './TourModal';
import { useBreakpoint, getGridCols } from '../hooks/useBreakpoint';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTheme } from '../hooks/useTheme';
import { useFPS } from '../hooks/useFPS';
import { getThemeTokens } from '../utils/themeTokens';
import { PALETTES, type PaletteName } from '../utils/palettes';
import { randomizeAttractor } from '../utils/randomParams';
import { snapshotPNG, CanvasRecorder, downloadBlob } from '../utils/exportCanvas';

const buildOverlayItems = (attractors: Attractor[]): OverlayItem[] =>
    attractors
        .filter((a) => a.rect)
        .map((attractor, idx) => ({
            index: idx,
            type: attractor.type,
            rect: attractor.rect!,
            rotation: attractor.rotation ?? { x: 0, y: 0, z: 0 },
            color: attractor.color,
            scale: attractor.scale,
            pointCount: attractor.points.length,
        }));

const TheVoid = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const grid = useRef<number[][]>([]);
    const gridColors = useRef<(RGB | null)[][]>([]);
    const energyRef = useRef<number>(100);
    const mouse = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const isIntroRef = useRef<boolean>(true);
    const pausedRef = useRef<boolean>(false);
    const themeRef = useRef<Theme>('dark');
    const [initialAttractors] = useState(() => createInitialAttractors());
    const attractors = useRef<Attractor[]>(initialAttractors);
    const animationRef = useRef<number>(0);
    const colsRef = useRef(0);
    const rowsRef = useRef(0);
    const recorderRef = useRef<CanvasRecorder | null>(null);

    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    const [speeds, setSpeeds] = useState<number[]>(() =>
        initialAttractors.map((a) => a.params.dt ?? 0.01)
    );
    const [paused, setPaused] = useState(false);
    const [intro, setIntro] = useState(true);
    const [statsVisible, setStatsVisible] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [phase, setPhase] = useState('AWAITING MERGE');
    const [energyState, setEnergyState] = useState(100);
    const [palette, setPalette] = useState<PaletteName>('original');
    const [recording, setRecording] = useState(false);
    const [tourOpen, setTourOpen] = useState(false);
    const [tourIndex, setTourIndex] = useState(0);

    const { theme, toggleTheme } = useTheme();
    const breakpoint = useBreakpoint();
    const { fps, tick: tickFPS } = useFPS();

    useEffect(() => { themeRef.current = theme; }, [theme]);
    useEffect(() => { pausedRef.current = paused; }, [paused]);
    useEffect(() => { isIntroRef.current = intro; }, [intro]);

    const totalPoints = useMemo(
        () => overlayItems.reduce((sum, it) => sum + it.pointCount, 0),
        [overlayItems]
    );

    const tourTypes = useMemo(
        () => initialAttractors.map((a) => a.type),
        [initialAttractors]
    );

    const syncOverlay = useCallback(() => {
        setOverlayItems(buildOverlayItems(attractors.current));
    }, []);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        colsRef.current = Math.ceil(window.innerWidth / GRID_SIZE);
        rowsRef.current = Math.ceil(window.innerHeight / GRID_SIZE);
        grid.current = Array(colsRef.current)
            .fill(0)
            .map(() => Array(rowsRef.current).fill(0));
        gridColors.current = Array(colsRef.current)
            .fill(null)
            .map(() => Array(rowsRef.current).fill(null));

        const count = attractors.current.length;
        const gridCols = getGridCols(breakpoint);
        const gridRows = Math.ceil(count / gridCols);

        const availableW = window.innerWidth - LAYOUT.marginX * 2;
        const availableH = window.innerHeight - (LAYOUT.marginTop + LAYOUT.marginBottom);
        const cellW = (availableW - LAYOUT.gap * (gridCols - 1)) / gridCols;
        const cellH = (availableH - LAYOUT.gap * (gridRows - 1)) / gridRows;

        attractors.current.forEach((attractor, index) => {
            const col = index % gridCols;
            const row = Math.floor(index / gridCols);
            const cellX = LAYOUT.marginX + col * (cellW + LAYOUT.gap);
            const cellY = LAYOUT.marginTop + row * (cellH + LAYOUT.gap);
            attractor.rect = { x: cellX, y: cellY, w: cellW, h: cellH };
            attractor.offset = {
                x: cellX + cellW / 2 - window.innerWidth / 2,
                y: cellY + cellH / 2 - window.innerHeight / 2,
            };
        });

        syncOverlay();
    }, [breakpoint, syncOverlay]);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    const spawnParticle = useCallback((x: number, y: number, vx: number, vy: number, burst = false, chaosColor?: RGB) => {
        if (!burst && !chaosColor && energyRef.current < 5) return;
        if (!burst && !chaosColor) energyRef.current -= ENERGY_COST;
        particles.current.push({
            x,
            y,
            vx: vx * 0.5 + (Math.random() - 0.5) * 2,
            vy: vy * 0.5 + (Math.random() - 0.5) * 2,
            life: burst ? 2.0 : 1.5,
            color: chaosColor,
        });
    }, []);

    const triggerMerge = useCallback(() => {
        if (!isIntroRef.current) return;
        isIntroRef.current = false;
        setIntro(false);
        setPhase('PHASE 10: ACTIVE');
        for (let i = 0; i < 150; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 15 + 5;
            spawnParticle(
                window.innerWidth / 2,
                window.innerHeight / 2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                true
            );
        }
    }, [spawnParticle]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let energyStateTick = 0;

        const render = () => {
            if (pausedRef.current) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }
            tickFPS();
            const tokens = getThemeTokens(themeRef.current);

            ctx.fillStyle = `rgba(${tokens.voidRGB}, ${tokens.fadeAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (isIntroRef.current) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            if (energyRef.current < 100) energyRef.current += ENERGY_REGEN;
            if (energyRef.current > 100) energyRef.current = 100;
            energyStateTick += 1;
            if (energyStateTick % 30 === 0) setEnergyState(energyRef.current);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const cols = colsRef.current;
            const rows = rowsRef.current;

            attractors.current.forEach((attractor) => {
                if (attractor.rect) {
                    ctx.strokeStyle = tokens.rectStroke;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(attractor.rect.x, attractor.rect.y, attractor.rect.w, attractor.rect.h);
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(attractor.rect.x, attractor.rect.y, attractor.rect.w, attractor.rect.h);
                    ctx.clip();
                }

                attractor.points.forEach((pt) => {
                    if (attractor.type !== 'henon') {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${pt.color.r}, ${pt.color.g}, ${pt.color.b}, ${tokens.trailAlpha})`;
                        ctx.lineWidth = CANVAS_STYLE.trailLineWidth;
                        ctx.lineCap = 'round';
                        ctx.shadowBlur = tokens.glow;
                        ctx.shadowColor = `rgba(${pt.color.r}, ${pt.color.g}, ${pt.color.b}, 1.0)`;
                    }

                    const prevP = project(pt.x, pt.y, pt.z, attractor, centerX, centerY);
                    if (attractor.type !== 'henon') ctx.moveTo(prevP.x, prevP.y);

                    for (let step = 0; step < SUB_STEPS; step++) {
                        if (attractor.type === 'henon') {
                            if (step % CANVAS_STYLE.henonStepInterval === 0) {
                                calculateAttractorStep(attractor.type, pt, attractor.params);
                            }
                        } else {
                            const delta = calculateAttractorStep(attractor.type, pt, attractor.params);
                            if (!isPointStable(pt)) resetPoint(pt);
                            pt.x += delta.dx;
                            pt.y += delta.dy;
                            pt.z += delta.dz;
                        }

                        const p = project(pt.x, pt.y, pt.z, attractor, centerX, centerY);

                        if (attractor.type === 'henon') {
                            if (step % CANVAS_STYLE.henonStepInterval === 0) {
                                const gx = Math.floor(p.x / GRID_SIZE);
                                const gy = Math.floor(p.y / GRID_SIZE);
                                if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
                                    grid.current[gx][gy] = Math.min(
                                        grid.current[gx][gy] + CANVAS_STYLE.henonGridBoost,
                                        1.0
                                    );
                                    gridColors.current[gx][gy] = pt.color;
                                }
                                ctx.shadowBlur = tokens.glow;
                                ctx.fillStyle = `rgba(${pt.color.r}, ${pt.color.g}, ${pt.color.b}, 1.0)`;
                                ctx.fillRect(p.x, p.y, CANVAS_STYLE.henonDotSize, CANVAS_STYLE.henonDotSize);
                                ctx.shadowBlur = 0;
                            }
                        } else {
                            ctx.lineTo(p.x, p.y);
                            if (step % CANVAS_STYLE.trailStepInterval === 0) {
                                const gx = Math.floor(p.x / GRID_SIZE);
                                const gy = Math.floor(p.y / GRID_SIZE);
                                if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
                                    grid.current[gx][gy] = Math.min(
                                        grid.current[gx][gy] + CANVAS_STYLE.trailGridBoost,
                                        1.0
                                    );
                                    gridColors.current[gx][gy] = pt.color;
                                }
                            }
                        }
                    }

                    if (attractor.type !== 'henon') {
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                });

                if (attractor.rect) ctx.restore();
            });

            if (mouse.current.active && lastPos.current) {
                const dx = mouse.current.x - lastPos.current.x;
                const dy = mouse.current.y - lastPos.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 5) {
                    spawnParticle(mouse.current.x, mouse.current.y, dx * 0.2, dy * 0.2, false);
                    lastPos.current = { x: mouse.current.x, y: mouse.current.y };
                }
            } else if (mouse.current.active) {
                lastPos.current = { x: mouse.current.x, y: mouse.current.y };
            }

            particles.current.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= CANVAS_STYLE.particleLifeDecay;
                const gx = Math.floor(p.x / GRID_SIZE);
                const gy = Math.floor(p.y / GRID_SIZE);
                if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
                    grid.current[gx][gy] = Math.min(
                        grid.current[gx][gy] + CANVAS_STYLE.trailGridBoost,
                        1.0
                    );
                }
            });
            particles.current = particles.current.filter((p) => p.life > 0);

            ctx.shadowBlur = 0;
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const intensity = grid.current[i][j];
                    if (intensity > 0.01) {
                        grid.current[i][j] *= DECAY_RATE;
                        const rgb = gridColors.current[i][j] || INK_COLOR;
                        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * tokens.gridIntensity})`;
                        ctx.fillRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                    }
                }
            }

            particles.current.forEach((p) => {
                ctx.fillStyle = p.color ? `rgb(${p.color.r},${p.color.g},${p.color.b})` : '#ffffff';
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, CANVAS_STYLE.particleRadius, 0, Math.PI * 2);
                ctx.shadowBlur = tokens.glow;
                ctx.shadowColor = p.color ? `rgb(${p.color.r},${p.color.g},${p.color.b})` : tokens.inkHigh;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            ctx.globalAlpha = 1.0;

            animationRef.current = requestAnimationFrame(render);
        };

        animationRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationRef.current);
    }, [spawnParticle, tickFPS]);

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY, active: true };
        };
        const handlePointerOut = () => {
            mouse.current.active = false;
            lastPos.current = null;
        };
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && target.closest('[data-no-merge]')) return;
            if (isIntroRef.current) triggerMerge();
        };
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerout', handlePointerOut);
        window.addEventListener('click', handleClick, { capture: true });
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerout', handlePointerOut);
            window.removeEventListener('click', handleClick, { capture: true });
        };
    }, [triggerMerge]);

    const handleRotate = useCallback((index: number, delta: { dx: number; dy: number }) => {
        const attr = attractors.current[index];
        if (!attr.rotation) return;
        attr.rotation.y += delta.dx * 0.02;
        attr.rotation.x += delta.dy * 0.02;
    }, []);

    const handleScaleChange = useCallback((index: number, value: number) => {
        attractors.current[index].scale = value;
        setOverlayItems((prev) =>
            prev.map((it) => (it.index === index ? { ...it, scale: value } : it))
        );
    }, []);

    const handleSpeedChange = useCallback((index: number, value: number) => {
        attractors.current[index].params.dt = value;
        setSpeeds((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    }, []);

    const handlePointsChange = useCallback((index: number, delta: number) => {
        const attr = attractors.current[index];
        if (delta > 0 && attr.points.length < POINT_LIMITS.max) {
            const last = attr.points[attr.points.length - 1];
            attr.points.push({
                x: last.x + 0.02,
                y: last.y + 0.02,
                z: last.z + 0.02,
                color: { ...last.color },
            });
        } else if (delta < 0 && attr.points.length > POINT_LIMITS.min) {
            attr.points.pop();
        }
        setOverlayItems((prev) =>
            prev.map((it) =>
                it.index === index ? { ...it, pointCount: attr.points.length } : it
            )
        );
    }, []);

    const handleColorChange = useCallback((index: number, hex: string) => {
        const newColor = hexToRgb(hex);
        const attr = attractors.current[index];
        attr.color = newColor;
        const [h, s, l] = rgbToHsl(newColor.r, newColor.g, newColor.b);
        attr.points.forEach((pt, i) => {
            pt.color = hslToRgb((h + i * 0.02) % 1, s, l);
        });
        setOverlayItems((prev) =>
            prev.map((it) => (it.index === index ? { ...it, color: newColor } : it))
        );
    }, []);

    const handleFlush = useCallback((index: number) => {
        const attr = attractors.current[index];
        if (!attr.rect) return;
        const startX = Math.floor(attr.rect.x / GRID_SIZE);
        const endX = Math.floor((attr.rect.x + attr.rect.w) / GRID_SIZE);
        const startY = Math.floor(attr.rect.y / GRID_SIZE);
        const endY = Math.floor((attr.rect.y + attr.rect.h) / GRID_SIZE);
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                if (grid.current[x] && grid.current[x][y] !== undefined) {
                    grid.current[x][y] = 0;
                    gridColors.current[x][y] = null;
                }
            }
        }
    }, []);

    const handleResetAll = useCallback(() => {
        for (let x = 0; x < colsRef.current; x++) {
            for (let y = 0; y < rowsRef.current; y++) {
                grid.current[x][y] = 0;
                gridColors.current[x][y] = null;
            }
        }
        particles.current = [];
    }, []);

    const applyColorToAttractor = useCallback((index: number, rgb: RGB) => {
        const attr = attractors.current[index];
        attr.color = rgb;
        const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
        attr.points.forEach((pt, i) => {
            pt.color = hslToRgb((h + i * 0.02) % 1, s, l);
        });
    }, []);

    const handleRandomize = useCallback((index: number) => {
        const attr = attractors.current[index];
        const next = randomizeAttractor(attr);
        attr.rotation = next.rotation;
        attr.scale = next.scale;
        attr.params.dt = next.speed;
        applyColorToAttractor(index, next.color);
        setSpeeds((prev) => {
            const out = [...prev];
            out[index] = next.speed;
            return out;
        });
        setOverlayItems((prev) =>
            prev.map((it) =>
                it.index === index
                    ? { ...it, rotation: next.rotation, scale: next.scale, color: next.color }
                    : it
            )
        );
    }, [applyColorToAttractor]);

    const handleRandomizeAll = useCallback(() => {
        for (let i = 0; i < attractors.current.length; i++) handleRandomize(i);
    }, [handleRandomize]);

    const handlePaletteChange = useCallback((next: PaletteName) => {
        setPalette(next);
        const colors = PALETTES[next];
        attractors.current.forEach((_, i) => {
            applyColorToAttractor(i, colors[i % colors.length]);
        });
        setOverlayItems((prev) =>
            prev.map((it) => ({ ...it, color: colors[it.index % colors.length] }))
        );
    }, [applyColorToAttractor]);

    const handleSnapshot = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        snapshotPNG(canvas);
    }, []);

    const handleToggleRecording = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!recorderRef.current) recorderRef.current = new CanvasRecorder();
        const rec = recorderRef.current;
        if (rec.isRecording()) {
            rec.stop().then((blob) => {
                setRecording(false);
                if (blob) downloadBlob(blob);
            });
        } else {
            const started = rec.start(canvas);
            if (started) setRecording(true);
        }
    }, []);

    const handleToggleTour = useCallback(() => {
        setTourOpen((v) => {
            if (!v) setTourIndex(0);
            return !v;
        });
    }, []);

    const handleTourNext = useCallback(() => {
        setTourIndex((i) => Math.min(i + 1, attractors.current.length - 1));
    }, []);

    const handleTourPrev = useCallback(() => {
        setTourIndex((i) => Math.max(i - 1, 0));
    }, []);

    const handleTogglePause = useCallback(() => setPaused((p) => !p), []);
    const handleToggleStats = useCallback(() => setStatsVisible((v) => !v), []);
    const handleToggleHelp = useCallback(() => setHelpOpen((v) => !v), []);

    const shortcuts = useMemo(
        () => ({
            Space: (e: KeyboardEvent) => {
                e.preventDefault();
                handleTogglePause();
            },
            Escape: () => {
                if (helpOpen) setHelpOpen(false);
                else if (tourOpen) setTourOpen(false);
                else handleResetAll();
            },
            '?': () => handleToggleHelp(),
            KeyS: () => handleToggleStats(),
            KeyT: () => toggleTheme(),
            KeyH: () => handleToggleHelp(),
            KeyN: () => handleToggleTour(),
            KeyR: () => handleRandomizeAll(),
            KeyP: () => handleSnapshot(),
            KeyV: () => handleToggleRecording(),
        }),
        [
            handleResetAll,
            handleToggleHelp,
            handleTogglePause,
            handleToggleStats,
            handleToggleTour,
            handleRandomizeAll,
            handleSnapshot,
            handleToggleRecording,
            toggleTheme,
            helpOpen,
            tourOpen,
        ]
    );

    useKeyboardShortcuts(shortcuts);

    return (
        <div className="relative w-full h-full overflow-hidden" data-theme={theme}>
            <canvas ref={canvasRef} className="absolute inset-0 z-canvas" />

            {intro && <IntroOverlay loading={false} />}

            <AttractorGrid
                items={overlayItems}
                speeds={speeds}
                onRotate={handleRotate}
                onScaleChange={handleScaleChange}
                onSpeedChange={handleSpeedChange}
                onPointsChange={handlePointsChange}
                onColorChange={handleColorChange}
                onFlush={handleFlush}
                onRandomize={handleRandomize}
            />

            <PausedOverlay visible={paused} />

            <StatsHUD
                fps={fps}
                pointCount={totalPoints}
                energy={energyState}
                phase={phase}
                visible={statsVisible}
            />

            <div data-no-merge>
                <Toolbar
                    paused={paused}
                    theme={theme}
                    statsVisible={statsVisible}
                    palette={palette}
                    recording={recording}
                    onTogglePause={handleTogglePause}
                    onResetAll={handleResetAll}
                    onToggleTheme={toggleTheme}
                    onToggleStats={handleToggleStats}
                    onToggleHelp={handleToggleHelp}
                    onToggleTour={handleToggleTour}
                    onRandomizeAll={handleRandomizeAll}
                    onPaletteChange={handlePaletteChange}
                    onSnapshot={handleSnapshot}
                    onToggleRecording={handleToggleRecording}
                />
            </div>

            <HelpModal open={helpOpen} onClose={handleToggleHelp} />
            <TourModal
                open={tourOpen}
                types={tourTypes}
                index={tourIndex}
                onNext={handleTourNext}
                onPrev={handleTourPrev}
                onClose={handleToggleTour}
            />
        </div>
    );
};

export default TheVoid;
