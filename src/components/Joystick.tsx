import { memo } from 'react';
import type { Rotation3D } from './types';
import { usePointerDrag } from '../hooks/usePointerDrag';

interface JoystickProps {
    rotation: Rotation3D;
    onRotate: (delta: { dx: number; dy: number }) => void;
    accentColor?: string;
    label?: string;
}

const Joystick = memo(({ rotation, onRotate, accentColor = 'rgb(0, 243, 255)', label = 'ROTATION' }: JoystickProps) => {
    const { onPointerDown } = usePointerDrag(onRotate);

    const needleAngle = (rotation.y * 180) / Math.PI;
    const tiltAngle = Math.max(-45, Math.min(45, (rotation.x * 180) / Math.PI));

    return (
        <div className="flex flex-col items-center">
            <div className="text-value text-gray-400 font-mono tracking-widest mb-2 text-center">
                {label}
            </div>
            <div
                role="slider"
                aria-label="Rotation joystick — drag to rotate"
                aria-valuenow={Math.round(needleAngle)}
                tabIndex={0}
                onPointerDown={onPointerDown}
                className="relative w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-2 border-white/20 select-none hover:border-white/50 focus-visible:border-white/70 focus-visible:ring-2 focus-visible:ring-white/30 transition-all shadow-lg touch-none outline-none"
                style={{ cursor: 'grab', borderColor: `${accentColor}66`, boxShadow: `0 4px 12px ${accentColor}22` }}
            >
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 shadow-inner transition-transform duration-75"
                    style={{
                        backgroundColor: `${accentColor}33`,
                        borderColor: `${accentColor}88`,
                        transform: `translate(-50%, -50%) rotate(${needleAngle}deg) scaleY(${1 - Math.abs(tiltAngle) / 90})`,
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 w-10 h-[2px] -translate-y-1/2 rounded-full origin-left transition-transform duration-75 pointer-events-none"
                    style={{
                        backgroundColor: accentColor,
                        transform: `translateY(-50%) rotate(${needleAngle}deg)`,
                    }}
                />
                <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white/15 rounded-full pointer-events-none" />
                <div className="absolute left-1/2 top-2 bottom-2 w-0.5 bg-white/15 rounded-full pointer-events-none" />
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] opacity-60 pointer-events-none" style={{ color: accentColor }}>↑</div>
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] opacity-60 pointer-events-none" style={{ color: accentColor }}>↓</div>
                <div className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[8px] opacity-60 pointer-events-none" style={{ color: accentColor }}>←</div>
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px] opacity-60 pointer-events-none" style={{ color: accentColor }}>→</div>
            </div>
            <div className="text-[10px] font-mono text-center mt-2 font-bold opacity-70" style={{ color: accentColor }}>
                DRAG TO ROTATE
            </div>
        </div>
    );
});

Joystick.displayName = 'Joystick';
export default Joystick;
