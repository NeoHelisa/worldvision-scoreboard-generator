import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemeEditor from './ThemeEditor';

const ThemeSelector: React.FC = () => {
    const { theme, setTheme, setCustomTheme, availableThemes } = useTheme();
    const [showEditor, setShowEditor] = useState(false);

    const hasCustomTheme = localStorage.getItem('custom-theme') !== null;

    const handleCustomClick = () => {
        if (hasCustomTheme && theme.id !== 'custom') {
            setTheme('custom');
        }
        setShowEditor(true);
    };

    return (
        <div className="theme-selector">
            <h3>Select Theme</h3>
            <div className="theme-options" style={{ display: 'flex', flexDirection: 'column' }}>
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

                <button
                    className={`theme-option custom-theme-btn ${theme.id === 'custom' ? 'active' : ''}`}
                    onClick={handleCustomClick}
                >
                    <span className="theme-name">
                        {hasCustomTheme ? '✓ Custom' : '+ Custom'}
                    </span>
                </button>
            </div>

            {showEditor && (
                <ThemeEditor
                    currentTheme={theme}
                    onThemeChange={(customTheme) => {
                        setCustomTheme(customTheme);
                        setShowEditor(false);
                    }}
                    onClose={() => setShowEditor(false)}
                />
            )}
        </div>
    );
};

export default ThemeSelector;