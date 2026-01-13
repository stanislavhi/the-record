// Types for TheVoid component

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface Point3D {
    x: number;
    y: number;
    z: number;
    color: RGB;
}

export interface Rotation3D {
    x: number;
    y: number;
    z: number;
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export type AttractorType =
    | 'lorenz'
    | 'rossler'
    | 'henon'
    | 'chua'
    | 'sprott'
    | 'four_wing'
    | 'tsucs'
    | 'rabinovich'
    | 'halvorsen'
    | 'chen'
    | 'dadras'
    | 'aizawa'
    | 'thomas';

export interface AttractorParams {
    dt: number;
    [key: string]: number;
}

export interface Attractor {
    type: AttractorType;
    points: Point3D[];
    color: RGB;
    params: AttractorParams;
    scale: number;
    offset: { x: number; y: number };
    rect?: Rect;
    rotation?: Rotation3D;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color?: RGB;
}

export interface OverlayItem {
    index: number;
    type: string;
    rect: Rect;
    rotation: Rotation3D;
    color: RGB;
    scale: number;
}

export interface MouseState {
    x: number;
    y: number;
    active: boolean;
}
