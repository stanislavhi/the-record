import { useEffect, useState } from 'react';
import { LAYOUT } from '../components/constants';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const getBreakpoint = (width: number): Breakpoint => {
    if (width < LAYOUT.breakpoints.mobile) return 'mobile';
    if (width < LAYOUT.breakpoints.tablet) return 'tablet';
    return 'desktop';
};

export const useBreakpoint = (): Breakpoint => {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
        typeof window === 'undefined' ? 'desktop' : getBreakpoint(window.innerWidth)
    );

    useEffect(() => {
        const onResize = () => setBreakpoint(getBreakpoint(window.innerWidth));
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return breakpoint;
};

export const getGridCols = (breakpoint: Breakpoint): number => LAYOUT.cols[breakpoint];
