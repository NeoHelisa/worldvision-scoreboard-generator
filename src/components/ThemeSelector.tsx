import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector: React.FC = () => {
    const { theme, setTheme, availableThemes } = useTheme();

    return (
        <div className="theme-selector">
            <h3>Select Theme</h3>
            <div className="theme-options" style={{display: "flex", flexDirection: "column"}}>
                {availableThemes.map((t) => (
                    <button
                        key={t.id}
                        className={`theme-option ${theme.id === t.id ? 'active' : ''}`}
                        onClick={() => setTheme(t.id)}
                    >
                        <span className="theme-name">{t.name}</span>
                        {t.description && <span className="theme-desc">{t.description}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeSelector;