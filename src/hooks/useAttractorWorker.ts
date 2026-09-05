import { useEffect, useRef } from 'react';
import type { Attractor } from '../components/types';

type FrameCallback = (trajectories: Float32Array[]) => void;

interface WorkerHandle {
    postStep: () => void;
    syncParams: (index: number, params: Attractor['params']) => void;
    syncPoints: (index: number, points: Float32Array) => void;
    syncSubSteps: (subSteps: number) => void;
    onFrame: (cb: FrameCallback) => void;
    isReady: () => boolean;
    dispose: () => void;
}

export interface UseAttractorWorkerOptions {
    enabled: boolean;
    attractors: Attractor[];
    subSteps: number;
    henonStepInterval: number;
}

const attractorsToInitPayload = (attractors: Attractor[]) =>
    attractors.map((a) => {
        const pts = new Float32Array(a.points.length * 3);
        for (let i = 0; i < a.points.length; i++) {
            pts[i * 3] = a.points[i].x;
            pts[i * 3 + 1] = a.points[i].y;
            pts[i * 3 + 2] = a.points[i].z;
        }
        return {
            type: a.type,
            params: { ...a.params },
            pointCount: a.points.length,
            points: pts,
        };
    });

export const useAttractorWorker = (options: UseAttractorWorkerOptions): WorkerHandle | null => {
    const handleRef = useRef<WorkerHandle | null>(null);

    useEffect(() => {
        if (!options.enabled) return;
        if (typeof Worker === 'undefined') return;

        let ready = false;
        let frameCb: FrameCallback = () => {};
        const worker = new Worker(
            new URL('../workers/attractorWorker.ts', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (e: MessageEvent) => {
            const msg = e.data;
            if (msg?.type === 'ready') {
                ready = true;
            } else if (msg?.type === 'frame') {
                frameCb(msg.trajectories as Float32Array[]);
            }
        };

        const init = attractorsToInitPayload(options.attractors);
        worker.postMessage(
            {
                type: 'init',
                subSteps: options.subSteps,
                henonStepInterval: options.henonStepInterval,
                attractors: init,
            },
            init.map((a) => a.points.buffer) as Transferable[]
        );

        const handle: WorkerHandle = {
            postStep: () => {
                if (ready) worker.postMessage({ type: 'step' });
            },
            syncParams: (index, params) => {
                worker.postMessage({ type: 'setParams', index, params: { ...params } });
            },
            syncPoints: (index, points) => {
                worker.postMessage(
                    { type: 'setPointCount', index, points },
                    [points.buffer]
                );
            },
            syncSubSteps: (subSteps) => {
                worker.postMessage({ type: 'setSubSteps', subSteps });
            },
            onFrame: (cb) => {
                frameCb = cb;
            },
            isReady: () => ready,
            dispose: () => worker.terminate(),
        };

        handleRef.current = handle;
        return () => {
            handle.dispose();
            handleRef.current = null;
        };
        // init payload and deps are stable per hook mount; reinit happens on full unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.enabled]);

    return handleRef.current;
};
