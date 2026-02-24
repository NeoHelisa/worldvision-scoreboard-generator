import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScoreboardTheme } from '../themes';
import { themes, defaultTheme, getThemeById } from '../themes';
import useConfig from '../hooks/useConfig';

interface ThemeContextValue {
    theme: ScoreboardTheme;
    setTheme: (themeId: string) => void;
    setCustomTheme: (theme: ScoreboardTheme) => void;
    availableThemes: ScoreboardTheme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const config = useConfig();
    const [theme, setThemeState] = useState<ScoreboardTheme>(defaultTheme);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (initialized) return;

        const savedThemeId = localStorage.getItem('scoreboard-theme');

        if (savedThemeId === 'custom') {
            const savedCustomTheme = localStorage.getItem('custom-theme');
            if (savedCustomTheme) {
                try {
                    setThemeState(JSON.parse(savedCustomTheme));
                    setInitialized(true);
                    return;
                } catch (e) {
                    console.error('Failed to load custom theme');
                }
            }
        }

        if (savedThemeId) {
            setThemeState(getThemeById(savedThemeId));
        } else if (config.defaultTheme) {
            setThemeState(getThemeById(config.defaultTheme));
        }

        setInitialized(true);
    }, [config.defaultTheme, initialized]);

    const setTheme = (themeId: string) => {
        if (themeId === 'custom') {
            const savedCustomTheme = localStorage.getItem('custom-theme');
            if (savedCustomTheme) {
                try {
                    setThemeState(JSON.parse(savedCustomTheme));
                    localStorage.setItem('scoreboard-theme', 'custom');
                    return;
                } catch (e) {
                    console.error('Failed to load custom theme');
                }
            }
            return;
        }

        const newTheme = getThemeById(themeId);
        setThemeState(newTheme);
        localStorage.setItem('scoreboard-theme', themeId);
    };

    const setCustomTheme = (customTheme: ScoreboardTheme) => {
        const themeWithId = { ...customTheme, id: 'custom', name: 'Custom' };
        localStorage.setItem('custom-theme', JSON.stringify(themeWithId));
        localStorage.setItem('scoreboard-theme', 'custom');
        setThemeState(themeWithId);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, setCustomTheme, availableThemes: themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};