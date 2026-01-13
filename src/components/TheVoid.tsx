import React, { useRef, useEffect, useState } from 'react';
import type { HUDRef } from './HUD';
import type { Attractor, Particle, OverlayItem, RGB } from './types';
import {
    GRID_SIZE,
    DECAY_RATE,
    ENERGY_COST,
    ENERGY_REGEN,
    INK_COLOR,
    SUB_STEPS,
    createInitialAttractors
} from './constants';
import { rgbToHsl, hslToRgb, rgbToHex, hexToRgb } from './utils/colorUtils';
import { project } from './utils/projection';
import { calculateAttractorStep, isPointStable, resetPoint } from './attractors/attractorCalculations';

interface TheVoidProps {
    hudRef: React.RefObject<HUDRef | null>;
}

const TheVoid: React.FC<TheVoidProps> = ({ hudRef }) => {
    const particles = useRef<Particle[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    const [, forceUpdate] = useState(0); // Force re-render trigger

    const grid = useRef<number[][]>([]);
    const gridColors = useRef<(RGB | null)[][]>([]);
    const energy = useRef<number>(100);
    const entropy = useRef<number>(0);
    const mouse = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const isIntro = useRef<boolean>(true);
    const attractors = useRef<Attractor[]>(createInitialAttractors());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let cols = 0;
        let rows = 0;

        if (hudRef.current) {
            hudRef.current.updatePhase("AWAITING MERGE");
        }

        const initGrid = () => {
            cols = Math.ceil(window.innerWidth / GRID_SIZE);
            rows = Math.ceil(window.innerHeight / GRID_SIZE);
            grid.current = Array(cols).fill(0).map(() => Array(rows).fill(0));
            gridColors.current = Array(cols).fill(null).map(() => Array(rows).fill(null));
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initGrid();

            const count = attractors.current.length;
            const gridCols = 5;
            const gridRows = Math.ceil(count / gridCols);

            const marginX = 20;
            const marginTop = 30;
            const marginBottom = 20;

            const availableW = window.innerWidth - (marginX * 2);
            const availableH = window.innerHeight - (marginTop + marginBottom);

            const GAP = 30;
            const cellW = (availableW - (GAP * (gridCols - 1))) / gridCols;
            const cellH = (availableH - (GAP * (gridRows - 1))) / gridRows;

            const newItems: OverlayItem[] = [];
            attractors.current.forEach((attractor, index) => {
                const col = index % gridCols;
                const row = Math.floor(index / gridCols);

                const cellX = marginX + (col * (cellW + GAP));
                const cellY = marginTop + (row * (cellH + GAP));

                const cx = cellX + cellW / 2;
                const cy = cellY + cellH / 2;

                attractor.rect = { x: cellX, y: cellY, w: cellW, h: cellH };
                attractor.offset = {
                    x: cx - window.innerWidth / 2,
                    y: cy - window.innerHeight / 2
                };

                newItems.push({
                    index,
                    type: attractor.type,
                    rect: attractor.rect,
                    rotation: attractor.rotation || { x: 0, y: 0, z: 0 },
                    color: attractor.color,
                    scale: attractor.scale
                });
            });
            setOverlayItems(newItems);
        };

        resizeCanvas();

        const spawnParticle = (x: number, y: number, vx: number, vy: number, burst = false, chaosColor?: RGB) => {
            if (!burst && !chaosColor && energy.current < 5) return;

            if (!burst && !chaosColor) {
                energy.current -= ENERGY_COST;
            }

            particles.current.push({
                x, y,
                vx: vx * 0.5 + (Math.random() - 0.5) * 2,
                vy: vy * 0.5 + (Math.random() - 0.5) * 2,
                life: burst ? 2.0 : 1.5,
                color: chaosColor
            });
        };

        const triggerMerge = () => {
            isIntro.current = false;
            if (hudRef.current) {
                hudRef.current.updatePhase("PHASE 10: ACTIVE");
            }
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
        };

        const render = () => {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.35)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (isIntro.current) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px "JetBrains Mono"';
                ctx.textAlign = 'center';
                const alpha = (Math.sin(Date.now() / 500) + 1) / 2 * 0.5 + 0.5;
                ctx.globalAlpha = alpha;
                ctx.fillText("CLICK TO MERGE", canvas.width / 2, canvas.height / 2);
                ctx.globalAlpha = 1.0;
            } else {
                if (energy.current < 100) energy.current += ENERGY_REGEN;
                if (energy.current > 100) energy.current = 100;

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                attractors.current.forEach(attractor => {
                    if (attractor.rect) {
                        ctx.strokeStyle = `rgba(50, 50, 50, 0.5)`;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(attractor.rect.x, attractor.rect.y, attractor.rect.w, attractor.rect.h);

                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(attractor.rect.x, attractor.rect.y, attractor.rect.w, attractor.rect.h);
                        ctx.clip();
                    }

                    attractor.points.forEach(pt => {
                        if (attractor.type !== 'henon') {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(${pt.color.r}, ${pt.color.g}, ${pt.color.b}, 0.5)`;
                            ctx.lineWidth = 2.5;
                            ctx.lineCap = 'round';
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = `rgba(${pt.color.r}, ${pt.color.g}, ${pt.color.b}, 1.0)`;
                        }

                        const prevP = project(pt.x, pt.y, pt.z, attractor, centerX, centerY);
                        if (attractor.type !== 'henon') {
                            ctx.moveTo(prevP.x, prevP.y);
                        }

                        for (let step = 0; step < SUB_STEPS; step++) {
                            if (attractor.type === 'henon') {
                                if (step % 20 === 0) {
                                    calculateAttractorStep(attractor.type, pt, attractor.params);
                                }
                            } else {
                                const delta = calculateAttractorStep(attractor.type, pt, attractor.params);

                                if (!isPointStable(pt)) {
                                    resetPoint(pt);
                                }
                                pt.x += delta.dx;
                                pt.y += delta.dy;
                                pt.z += delta.dz;
                            }

                            const p = project(pt.x, pt.y, pt.z, attractor, centerX, centerY);

                            if (attractor.type === 'henon') {
                                if (step % 20 === 0) {
                                    const gx = Math.floor(p.x / GRID_SIZE);
                                    const gy = Math.floor(p.y / GRID_SIZE);
                                    if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
                                        grid.current[gx][gy] = Math.min(grid.current[gx][gy] + 0.1, 1.0);
                                        gridColors.current[gx][gy] = pt.color;
                                    }
                                    ctx.shadowBlur = 10;
                                    ctx.fillStyle = `rgba(${pt.color.r}, ${pt.color.g}, ${pt.color.b}, 1.0)`;
                                    ctx.fillRect(p.x, p.y, 4, 4);
                                    ctx.shadowBlur = 0;
                                }
                            } else {
                                ctx.lineTo(p.x, p.y);
                                if (step % 2 === 0) {
                                    const gx = Math.floor(p.x / GRID_SIZE);
                                    const gy = Math.floor(p.y / GRID_SIZE);
                                    if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
                                        grid.current[gx][gy] = Math.min(grid.current[gx][gy] + 0.05, 1.0);
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

                    if (attractor.rect) {
                        ctx.restore();
                    }
                });

                if (hudRef.current) {
                    hudRef.current.updateEnergy(energy.current);
                    hudRef.current.updateEntropy(entropy.current);
                }

                if (!isIntro.current && mouse.current.active && lastPos.current) {
                    const dx = mouse.current.x - lastPos.current.x;
                    const dy = mouse.current.y - lastPos.current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 5) {
                        spawnParticle(mouse.current.x, mouse.current.y, dx * 0.2, dy * 0.2, false, undefined);
                        lastPos.current = { x: mouse.current.x, y: mouse.current.y };
                    }
                } else if (mouse.current.active) {
                    lastPos.current = { x: mouse.current.x, y: mouse.current.y };
                }

                particles.current.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= 0.01;
                    const gx = Math.floor(p.x / GRID_SIZE);
                    const gy = Math.floor(p.y / GRID_SIZE);
                    if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
                        grid.current[gx][gy] = Math.min(grid.current[gx][gy] + 0.05, 1.0);
                    }
                });
                particles.current = particles.current.filter(p => p.life > 0);

                ctx.shadowBlur = 0;
                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        const intensity = grid.current[i][j];
                        if (intensity > 0.01) {
                            grid.current[i][j] *= DECAY_RATE;
                            const rgb = gridColors.current[i][j] || INK_COLOR;
                            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.3})`;
                            ctx.fillRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                        }
                    }
                }

                particles.current.forEach(p => {
                    ctx.fillStyle = p.color ? `rgb(${p.color.r},${p.color.g},${p.color.b})` : '#ffffff';
                    ctx.globalAlpha = p.life;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = p.color ? `rgb(${p.color.r},${p.color.g},${p.color.b})` : '#00f3ff';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
                ctx.globalAlpha = 1.0;
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY, active: true };
        };
        const handleMouseLeave = () => {
            mouse.current.active = false;
            lastPos.current = null;
        };
        const handleClick = () => {
            if (isIntro.current) {
                triggerMerge();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);
        window.addEventListener('click', handleClick, { capture: true });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            window.removeEventListener('click', handleClick, { capture: true });
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleColorChange = (index: number, hex: string) => {
        const newColor = hexToRgb(hex);
        attractors.current[index].color = newColor;
        attractors.current[index].points.forEach((pt, i) => {
            const [h, s, l] = rgbToHsl(newColor.r, newColor.g, newColor.b);
            pt.color = hslToRgb((h + i * 0.02) % 1, s, l);
        });
        setOverlayItems(prev => prev.map(item =>
            item.index === index ? { ...item, color: newColor } : item
        ));
    };

    const handleFlush = (index: number) => {
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
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            {overlayItems.map((item) => (
                <div
                    key={item.index}
                    style={{
                        position: 'absolute',
                        left: item.rect.x,
                        top: item.rect.y,
                        width: item.rect.w,
                        height: item.rect.h,
                        pointerEvents: 'none',
                    }}
                    className="flex flex-col justify-between p-4 box-border z-10"
                >
                    <h3
                        className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 text-center"
                        style={{
                            color: `rgba(${item.color.r}, ${item.color.g}, ${item.color.b}, 1)`,
                            textShadow: `0 0 10px rgba(${item.color.r}, ${item.color.g}, ${item.color.b}, 0.5)`
                        }}
                    >
                        {item.type.replace(/_/g, ' ')}
                    </h3>

                    <div className="pointer-events-auto flex flex-col gap-1 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-[#050505]/90 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
                        <div className="text-[9px] text-gray-500 font-mono tracking-widest mb-1 text-center">SCALE</div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 mb-2">
                            <input
                                type="range"
                                min="0.1"
                                max="100"
                                step="0.1"
                                defaultValue={item.scale}
                                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                                onChange={(e) => {
                                    attractors.current[item.index].scale = parseFloat(e.target.value);
                                }}
                            />
                        </div>

                        <div className="text-[11px] text-gray-400 font-mono tracking-widest mb-2 text-center">ROTATION</div>
                        <div
                            className="relative w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-2 border-cyan-500/40 select-none hover:border-cyan-400/70 transition-all shadow-lg shadow-cyan-500/10"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                let lastX = e.clientX;
                                let lastY = e.clientY;

                                const onMove = (moveEvent: MouseEvent) => {
                                    const deltaX = moveEvent.clientX - lastX;
                                    const deltaY = moveEvent.clientY - lastY;
                                    lastX = moveEvent.clientX;
                                    lastY = moveEvent.clientY;

                                    const attr = attractors.current[item.index];
                                    if (attr.rotation) {
                                        attr.rotation.y += deltaX * 0.02;
                                        attr.rotation.x += deltaY * 0.02;
                                    }
                                };

                                const onUp = () => {
                                    window.removeEventListener('mousemove', onMove);
                                    window.removeEventListener('mouseup', onUp);
                                };

                                window.addEventListener('mousemove', onMove);
                                window.addEventListener('mouseup', onUp);
                            }}
                        >
                            {/* Center Knob */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500/30 rounded-full border-2 border-cyan-400/50 shadow-inner" />
                            {/* Crosshairs */}
                            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white/20 rounded-full" />
                            <div className="absolute left-1/2 top-2 bottom-2 w-0.5 bg-white/20 rounded-full" />
                            {/* Direction indicators */}
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] text-cyan-400/60">↑</div>
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-cyan-400/60">↓</div>
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] text-cyan-400/60">←</div>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-cyan-400/60">→</div>
                        </div>
                        <div className="text-[10px] text-cyan-500/70 font-mono text-center mt-2 font-bold">DRAG TO ROTATE</div>

                        {/* Points Control */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-white/10">
                            <span className="text-[10px] text-gray-400 font-mono">POINTS</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        const attr = attractors.current[item.index];
                                        if (attr.points.length > 1) {
                                            attr.points.pop();
                                            forceUpdate(n => n + 1);
                                        }
                                    }}
                                    className="w-6 h-6 text-sm font-bold bg-gray-800 hover:bg-red-500/50 text-gray-400 hover:text-white rounded border border-white/10 transition-all"
                                >
                                    −
                                </button>
                                <span className="text-[10px] text-white font-mono w-6 text-center">
                                    {attractors.current[item.index]?.points.length || 10}
                                </span>
                                <button
                                    onClick={() => {
                                        const attr = attractors.current[item.index];
                                        if (attr.points.length < 50) {
                                            const lastPoint = attr.points[attr.points.length - 1];
                                            attr.points.push({
                                                x: lastPoint.x + 0.02,
                                                y: lastPoint.y + 0.02,
                                                z: lastPoint.z + 0.02,
                                                color: { ...lastPoint.color }
                                            });
                                            forceUpdate(n => n + 1);
                                        }
                                    }}
                                    className="w-6 h-6 text-sm font-bold bg-gray-800 hover:bg-green-500/50 text-gray-400 hover:text-white rounded border border-white/10 transition-all"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Speed Control */}
                        <div className="flex items-center justify-between gap-2 mt-2">
                            <span className="text-[10px] text-gray-400 font-mono">SPEED</span>
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="range"
                                    min="0.001"
                                    max="0.03"
                                    step="0.001"
                                    defaultValue={attractors.current[item.index]?.params.dt || 0.01}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                    onChange={(e) => {
                                        attractors.current[item.index].params.dt = parseFloat(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 font-mono">COLOR</span>
                                <input
                                    type="color"
                                    className="w-4 h-4 rounded cursor-pointer bg-transparent p-0 border-none appearance-none"
                                    defaultValue={rgbToHex(item.color)}
                                    onChange={(e) => handleColorChange(item.index, e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => handleFlush(item.index)}
                                className="px-2 py-0.5 text-[9px] font-mono uppercase bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded border border-red-500/20 transition-all"
                            >
                                Flush
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TheVoid;
