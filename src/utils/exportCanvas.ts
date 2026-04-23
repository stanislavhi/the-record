export const snapshotPNG = (canvas: HTMLCanvasElement, filename = `the-record-${Date.now()}.png`) => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export class CanvasRecorder {
    private recorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private stream: MediaStream | null = null;

    start(canvas: HTMLCanvasElement, fps = 60): boolean {
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
            return true;
        } catch {
            this.recorder = null;
            return false;
        }
    }

    stop(): Promise<Blob | null> {
        return new Promise((resolve) => {
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
                resolve(blob);
            };
            rec.stop();
        });
    }

    isRecording(): boolean {
        return this.recorder !== null && this.recorder.state === 'recording';
    }
}

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
