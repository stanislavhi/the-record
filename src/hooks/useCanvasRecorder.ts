import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { CanvasRecorder, downloadBlob, formatElapsed } from '../utils/exportCanvas';

/**
 * WebM recording of a canvas. Toggling starts/stops; the recorder's own soft
 * cap may auto-stop. Either way the finished blob is downloaded.
 * `elapsedLabel` is null while idle and refreshes every 500 ms while recording.
 */
export const useCanvasRecorder = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    const recorderRef = useRef<CanvasRecorder | null>(null);
    const [recording, setRecording] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(0);

    const finish = useCallback((blob: Blob | null) => {
        setRecording(false);
        setElapsedMs(0);
        if (blob) downloadBlob(blob);
    }, []);

    const toggle = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        recorderRef.current ??= new CanvasRecorder();
        const rec = recorderRef.current;
        if (rec.isRecording()) {
            rec.stop().then(finish);
        } else if (rec.start(canvas, { onAutoStop: finish })) {
            setRecording(true);
            setElapsedMs(0);
        }
    }, [canvasRef, finish]);

    useEffect(() => {
        if (!recording) return;
        const id = window.setInterval(() => {
            if (recorderRef.current) setElapsedMs(recorderRef.current.elapsedMs());
        }, 500);
        return () => window.clearInterval(id);
    }, [recording]);

    return { recording, elapsedLabel: recording ? formatElapsed(elapsedMs) : null, toggle };
};
