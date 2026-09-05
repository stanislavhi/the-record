import { useEffect, useRef } from 'react';

export interface AnimationFrameOptions {
    paused?: boolean;
}

export const useAnimationFrame = (
    callback: (deltaMs: number) => void,
    options: AnimationFrameOptions = {}
) => {
    const { paused = false } = options;
    const callbackRef = useRef(callback);
    const pausedRef = useRef(paused);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    useEffect(() => {
        let frameId = 0;
        let prev = performance.now();

        const tick = (now: number) => {
            const delta = now - prev;
            prev = now;
            if (!pausedRef.current) {
                callbackRef.current(delta);
            }
            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, []);
};
