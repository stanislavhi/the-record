import { useCallback, useRef } from 'react';

export interface DragDelta {
    dx: number;
    dy: number;
}

export interface PointerDragHandlers {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
}

export const usePointerDrag = (
    onDrag: (delta: DragDelta) => void,
    onStart?: () => void,
    onEnd?: () => void
): PointerDragHandlers => {
    const lastRef = useRef<{ x: number; y: number } | null>(null);

    const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const el = e.currentTarget;
        el.setPointerCapture?.(e.pointerId);
        lastRef.current = { x: e.clientX, y: e.clientY };
        onStart?.();

        const onMove = (moveEvent: PointerEvent) => {
            if (!lastRef.current) return;
            const dx = moveEvent.clientX - lastRef.current.x;
            const dy = moveEvent.clientY - lastRef.current.y;
            lastRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
            onDrag({ dx, dy });
        };

        const onUp = (upEvent: PointerEvent) => {
            el.releasePointerCapture?.(upEvent.pointerId);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            lastRef.current = null;
            onEnd?.();
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
    }, [onDrag, onStart, onEnd]);

    return { onPointerDown };
};
