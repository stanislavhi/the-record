export const snapshotPNG = (canvas: HTMLCanvasElement, filename = `the-record-${Date.now()}.png`) => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const DEFAULT_MAX_RECORD_MS = 60_000;

export class CanvasRecorder {
    private recorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private stream: MediaStream | null = null;
    private startedAt = 0;
    private maxMs = DEFAULT_MAX_RECORD_MS;
    private capTimer: number | null = null;
    private onAutoStop: ((blob: Blob | null) => void) | null = null;

    start(
        canvas: HTMLCanvasElement,
        options: { fps?: number; maxMs?: number; onAutoStop?: (blob: Blob | null) => void } = {}
    ): boolean {
        const { fps = 60, maxMs = DEFAULT_MAX_RECORD_MS, onAutoStop } = options;
        if (this.recorder) return false;
        if (typeof MediaRecorder === 'undefined') return false;
        try {
            this.stream = canvas.captureStream(fps);
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm';
            this.recorder = new MediaRecorder(this.stream, { mimeType });
            this.chunks = [];
            this.recorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.chunks.push(e.data);
            };
            this.recorder.start(1000);
            this.startedAt = performance.now();
            this.maxMs = maxMs;
            this.onAutoStop = onAutoStop ?? null;
            if (maxMs > 0) {
                this.capTimer = window.setTimeout(() => {
                    const cb = this.onAutoStop;
                    this.stop().then((blob) => cb?.(blob));
                }, maxMs);
            }
            return true;
        } catch {
            this.recorder = null;
            return false;
        }
    }

    stop(): Promise<Blob | null> {
        return new Promise((resolve) => {
            if (this.capTimer !== null) {
                clearTimeout(this.capTimer);
                this.capTimer = null;
            }
            if (!this.recorder) {
                resolve(null);
                return;
            }
            const rec = this.recorder;
            rec.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'video/webm' });
                this.stream?.getTracks().forEach((t) => t.stop());
                this.stream = null;
                this.recorder = null;
                this.chunks = [];
                this.onAutoStop = null;
                resolve(blob);
            };
            rec.stop();
        });
    }

    isRecording(): boolean {
        return this.recorder !== null && this.recorder.state === 'recording';
    }

    elapsedMs(): number {
        return this.isRecording() ? performance.now() - this.startedAt : 0;
    }

    maxDurationMs(): number {
        return this.maxMs;
    }
}

export const formatElapsed = (ms: number): string => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

export const downloadBlob = (blob: Blob, filename = `the-record-${Date.now()}.webm`) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
