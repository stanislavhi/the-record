/// <reference lib="webworker" />
import type { AttractorParams, AttractorType } from '../components/types';
import {
    calculateAttractorStep,
    isDiscrete,
    isPointStable,
    resetPoint,
} from '../components/attractors/attractorCalculations';

interface AttractorSnapshot {
    type: AttractorType;
    params: AttractorParams;
    pointCount: number;
    /** flat [x, y, z, ...] — length = pointCount * 3 */
    points: Float32Array;
}

interface InitMessage {
    type: 'init';
    subSteps: number;
    henonStepInterval: number;
    attractors: Array<{
        type: AttractorType;
        params: AttractorParams;
        pointCount: number;
        points: Float32Array;
    }>;
}

interface StepMessage {
    type: 'step';
}

interface SetParamsMessage {
    type: 'setParams';
    index: number;
    params: AttractorParams;
}

interface SetPointCountMessage {
    type: 'setPointCount';
    index: number;
    points: Float32Array;
}

interface SetSubStepsMessage {
    type: 'setSubSteps';
    subSteps: number;
}

type IncomingMessage =
    | InitMessage
    | StepMessage
    | SetParamsMessage
    | SetPointCountMessage
    | SetSubStepsMessage;

let attractors: AttractorSnapshot[] = [];
let subSteps = 20;
let henonStepInterval = 20;

const workerSelf: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

const runStep = () => {
    const trajectories: Float32Array[] = attractors.map(() => new Float32Array(0));

    attractors.forEach((attr, aIdx) => {
        const pointCount = attr.pointCount;
        const discrete = isDiscrete(attr.type);
        const buf = new Float32Array(pointCount * subSteps * 3);
        for (let p = 0; p < pointCount; p++) {
            const base = p * 3;
            const pt = {
                x: attr.points[base],
                y: attr.points[base + 1],
                z: attr.points[base + 2],
                color: { r: 0, g: 0, b: 0 },
            };
            for (let s = 0; s < subSteps; s++) {
                if (discrete) {
                    if (s % henonStepInterval === 0) {
                        calculateAttractorStep(attr.type, pt, attr.params);
                    }
                } else {
                    const delta = calculateAttractorStep(attr.type, pt, attr.params);
                    if (!isPointStable(pt)) resetPoint(pt);
                    pt.x += delta.dx;
                    pt.y += delta.dy;
                    pt.z += delta.dz;
                }
                const bi = (p * subSteps + s) * 3;
                buf[bi] = pt.x;
                buf[bi + 1] = pt.y;
                buf[bi + 2] = pt.z;
            }
            attr.points[base] = pt.x;
            attr.points[base + 1] = pt.y;
            attr.points[base + 2] = pt.z;
        }
        trajectories[aIdx] = buf;
    });

    workerSelf.postMessage(
        { type: 'frame', trajectories },
        { transfer: trajectories.map((t) => t.buffer) as Transferable[] }
    );
};

workerSelf.onmessage = (e: MessageEvent<IncomingMessage>) => {
    const msg = e.data;
    switch (msg.type) {
        case 'init':
            subSteps = msg.subSteps;
            henonStepInterval = msg.henonStepInterval;
            attractors = msg.attractors.map((a) => ({
                type: a.type,
                params: { ...a.params },
                pointCount: a.pointCount,
                points: new Float32Array(a.points),
            }));
            workerSelf.postMessage({ type: 'ready' });
            break;
        case 'setParams':
            if (attractors[msg.index]) {
                attractors[msg.index].params = { ...msg.params };
            }
            break;
        case 'setPointCount':
            if (attractors[msg.index]) {
                attractors[msg.index].points = new Float32Array(msg.points);
                attractors[msg.index].pointCount = msg.points.length / 3;
            }
            break;
        case 'setSubSteps':
            subSteps = msg.subSteps;
            break;
        case 'step':
            runStep();
            break;
    }
};
