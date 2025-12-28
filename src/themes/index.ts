import { ScoreboardTheme } from './types';
import { win98Theme } from './presets/win98';
import { eurovisionTheme } from './presets/eurovision';
import { neonTheme } from './presets/neon';
import { minimalTheme } from './presets/minimal';
import { darkTheme } from './presets/dark';
import { retroTheme } from './presets/retro';

export const themes: ScoreboardTheme[] = [
    retroTheme,
];

export const defaultTheme = win98Theme;

export const getThemeById = (id: string): ScoreboardTheme => {
    return themes.find(t => t.id === id) || defaultTheme;
};

export * from './types';