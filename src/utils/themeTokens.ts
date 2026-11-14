import type { Theme, ThemeTokens } from '../components/types';

const DARK: ThemeTokens = {
    void: 'rgb(10, 10, 10)',
    inkHigh: 'rgb(0, 243, 255)',
    inkLow: 'rgb(255, 0, 85)',
    grid: 'rgb(26, 26, 26)',
    glow: 10,
    trailAlpha: 0.5,
    gridIntensity: 0.3,
    fadeAlpha: 0.35,
};

const LIGHT: ThemeTokens = {
    void: 'rgb(245, 245, 245)',
    inkHigh: 'rgb(0, 68, 255)',
    inkLow: 'rgb(255, 0, 85)',
    grid: 'rgb(224, 224, 224)',
    glow: 3,
    trailAlpha: 0.65,
    gridIntensity: 0.45,
    fadeAlpha: 0.18,
};

export const getThemeTokens = (theme: Theme): ThemeTokens =>
    theme === 'light' ? LIGHT : DARK;

export const parseRGB = (rgbString: string): { r: number; g: number; b: number } => {
    const m = rgbString.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!m) return { r: 10, g: 10, b: 10 };
    return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
};
