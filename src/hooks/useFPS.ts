import { useCallback, useEffect, useRef, useState } from 'react';

const SAMPLE_INTERVAL_MS = 500;

export const useFPS = () => {
    const [fps, setFps] = useState(0);
    const framesRef = useRef(0);
    const lastSampleRef = useRef<number | null>(null);

    useEffect(() => {
        lastSampleRef.current = performance.now();
    }, []);

    const tick = useCallback(() => {
        framesRef.current += 1;
        if (lastSampleRef.current == null) return;
        const now = performance.now();
        const elapsed = now - lastSampleRef.current;
        if (elapsed >= SAMPLE_INTERVAL_MS) {
            setFps(Math.round((framesRef.current * 1000) / elapsed));
            framesRef.current = 0;
            lastSampleRef.current = now;
        }
    }, []);

    return { fps, tick };
};
