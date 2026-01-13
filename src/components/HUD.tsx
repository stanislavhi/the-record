import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface HUDRef {
    updateEnergy: (value: number) => void;
    updateEntropy: (value: number) => void;
    updatePhase: (phase: string) => void;
}

const HUD = forwardRef<HUDRef, {}>((_, ref) => {
    const energyBarRef = useRef<HTMLDivElement>(null);
    const entropyRef = useRef<HTMLSpanElement>(null);
    const [phase, setPhase] = useState<string>("PHASE 10: ACTIVE");

    useImperativeHandle(ref, () => ({
        updateEnergy: (value: number) => {
            if (energyBarRef.current) {
                // Visual update without React comparison
                energyBarRef.current.style.width = `${value}%`;
                // Color shift based on energy
                if (value < 20) {
                    energyBarRef.current.style.backgroundColor = '#ff0055'; // Low Ink
                    energyBarRef.current.style.boxShadow = '0 0 10px #ff0055';
                } else {
                    energyBarRef.current.style.backgroundColor = '#00f3ff'; // High Ink
                    energyBarRef.current.style.boxShadow = '0 0 10px #00f3ff';
                }
            }
        },
        updateEntropy: (value: number) => {
            if (entropyRef.current) {
                entropyRef.current.innerText = value.toFixed(2);
            }
        },
        updatePhase: (newPhase: string) => {
            setPhase(newPhase);
        }
    }));

    return (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-50">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h1 className="text-sm tracking-[0.2em] text-gray-500 font-bold">THE RECORD</h1>
                    <div className="text-xs text-ink-high animate-pulse">{phase}</div>
                </div>
                <div className="text-right hidden">
                    {/* Entropy Hidden */}
                </div>
            </div>

            {/* Bottom Bar: Energy */}
            <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between text-xs mb-1 text-ink-high">
                    <span>INK LEVELS</span>
                    <span>FLUX CAPACITANCE</span>
                </div>
                <div className="h-1 bg-gray-900 w-full overflow-hidden relative border border-gray-800">
                    <div
                        ref={energyBarRef}
                        className="h-full bg-ink-high transition-all duration-100 ease-linear shadow-[0_0_10px_#00f3ff]"
                        style={{ width: '100%' }}
                    ></div>
                </div>
            </div>
        </div>
    );
});

export default HUD;
