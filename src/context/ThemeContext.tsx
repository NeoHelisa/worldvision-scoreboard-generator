import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScoreboardTheme } from '../themes/types';
import { themes, defaultTheme, getThemeById } from '../themes';
import useConfig from '../hooks/useConfig';

interface ThemeContextValue {
    theme: ScoreboardTheme;
    setTheme: (themeId: string) => void;
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

        const savedTheme = localStorage.getItem('scoreboard-theme');

        if (savedTheme) {
            setThemeState(getThemeById(savedTheme));
        } else if (config.defaultTheme) {
            setThemeState(getThemeById(config.defaultTheme));
        }

        setInitialized(true);
    }, [config.defaultTheme, initialized]);

    const setTheme = (themeId: string) => {
        const newTheme = getThemeById(themeId);
        setThemeState(newTheme);
        localStorage.setItem('scoreboard-theme', themeId);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themes }}>
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