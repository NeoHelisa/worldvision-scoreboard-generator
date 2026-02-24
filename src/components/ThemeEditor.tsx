import React, { useState, useEffect, useRef } from 'react';
import { ScoreboardTheme } from '../themes/types';
import { defaultTheme } from '../themes';
import './ThemeEditor.scss';

interface ThemeEditorProps {
    currentTheme: ScoreboardTheme;
    onThemeChange: (theme: ScoreboardTheme) => void;
    onClose: () => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({
                                                     currentTheme,
                                                     onThemeChange,
                                                     onClose,
                                                 }) => {
    const [customTheme, setCustomTheme] = useState<ScoreboardTheme>(() => {
        const saved = localStorage.getItem('custom-theme');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return { ...currentTheme, id: 'custom', name: 'Custom' };
            }
        }
        return { ...currentTheme, id: 'custom', name: 'Custom' };
    });

    const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'assets'>('colors');

    const updateColor = (key: keyof ScoreboardTheme['colors'], value: string) => {
        setCustomTheme((prev) => ({
            ...prev,
            colors: { ...prev.colors, [key]: value },
        }));
    };

    const updateTypography = (key: keyof ScoreboardTheme['typography'], value: string) => {
        setCustomTheme((prev) => ({
            ...prev,
            typography: { ...prev.typography, [key]: value },
        }));
    };

    const updateSpacing = (key: keyof ScoreboardTheme['spacing'], value: string) => {
        setCustomTheme((prev) => ({
            ...prev,
            spacing: { ...prev.spacing, [key]: value },
        }));
    };

    const updateEffects = (key: keyof ScoreboardTheme['effects'], value: any) => {
        setCustomTheme((prev) => ({
            ...prev,
            effects: { ...prev.effects, [key]: value },
        }));
    };

    const updateAssets = (key: keyof ScoreboardTheme['assets'], value: string) => {
        setCustomTheme((prev) => ({
            ...prev,
            assets: { ...prev.assets, [key]: value || undefined },
        }));
    };

    const handleApply = () => {
        onThemeChange(customTheme);
    };

    const handleReset = () => {
        const resetTheme: ScoreboardTheme = {
            ...defaultTheme,
            id: 'custom',
            name: 'Custom',
        };
        setCustomTheme(resetTheme);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(customTheme, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'custom-theme.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const imported = JSON.parse(content);

                if (!imported.colors || !imported.typography || !imported.spacing) {
                    alert('Invalid theme file: missing required sections');
                    return;
                }

                setCustomTheme({
                    ...imported,
                    id: 'custom',
                    name: 'Custom',
                    effects: imported.effects || {
                        glow: false,
                        glowColor: 'transparent',
                        shadow: 'none',
                        windowShadow: 'none',
                        itemHover: false,
                    },
                    assets: imported.assets || {},
                });
            } catch (err) {
                alert('Failed to import theme file');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const ColorInput: React.FC<{
        label: string;
        colorKey: keyof ScoreboardTheme['colors'];
        description?: string;
    }> = ({ label, colorKey, description }) => {
        const value = customTheme.colors[colorKey] || '';
        const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(value);

        return (
            <div className="editor-field">
                <label>
                    <span className="field-label">{label}</span>
                    {description && <span className="field-description">{description}</span>}
                </label>
                <div className="color-input-wrapper">
                    <input
                        type="color"
                        value={isValidHex ? value : '#000000'}
                        onChange={(e) => updateColor(colorKey, e.target.value)}
                    />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updateColor(colorKey, e.target.value)}
                        placeholder="#000000 or transparent"
                    />
                </div>
            </div>
        );
    };

    const TextInput: React.FC<{
        label: string;
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        description?: string;
    }> = ({ label, value, onChange, placeholder, description }) => {
        const [localValue, setLocalValue] = useState(value);
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        const handleBlur = () => {
            onChange(localValue);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                onChange(localValue);
            }
        };

        return (
            <div className="editor-field">
                <label>
                    <span className="field-label">{label}</span>
                    {description && <span className="field-description">{description}</span>}
                </label>
                <input
                    ref={inputRef}
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                />
            </div>
        );
    };

    const FontInput: React.FC<{
        label: string;
        fontKey: keyof ScoreboardTheme['typography'];
        description?: string;
    }> = ({ label, fontKey, description }) => {
        const value = customTheme.typography[fontKey] || '';

        const extractFontName = (fontString: string): string => {
            const match = fontString.match(/'([^']+)'/);
            return match ? match[1] : fontString;
        };

        const isCursive = (fontString: string): boolean => {
            return fontString.includes('cursive');
        };

        const isItalic = (fontString: string): boolean => {
            return fontString.includes('italic');
        };

        const buildFontString = (fontName: string, cursive: boolean, italic: boolean): string => {
            const fallback = cursive ? 'cursive' : 'sans-serif';
            const italicPrefix = italic ? 'italic ' : '';
            return `${italicPrefix}'${fontName}', ${fallback}`;
        };

        const currentFontName = extractFontName(value);
        const currentCursive = isCursive(value);
        const currentItalic = isItalic(value);

        const fontPresets = [
            'Accidental Presidency',
            'Brush Script MT',
            'Abril Display',
            'Abril Fatface',
            'Above The Beyond Script',
            'Arial',
            'Georgia',
            'Times New Roman',
            'Helvetica',
            'Verdana',
            'Impact',
            'Comic Sans MS',
            'Courier New',
        ];

        const handleFontNameChange = (newName: string) => {
            updateTypography(fontKey, buildFontString(newName, currentCursive, currentItalic));
        };

        const handleCursiveChange = (cursive: boolean) => {
            updateTypography(fontKey, buildFontString(currentFontName, cursive, currentItalic));
        };

        const handleItalicChange = (italic: boolean) => {
            updateTypography(fontKey, buildFontString(currentFontName, currentCursive, italic));
        };

        return (
            <div className="editor-field font-field">
                <label>
                    <span className="field-label">{label}</span>
                    {description && <span className="field-description">{description}</span>}
                </label>
                <div className="font-input-wrapper">
                    <select
                        value={fontPresets.includes(currentFontName) ? currentFontName : '__custom__'}
                        onChange={(e) => {
                            if (e.target.value !== '__custom__') {
                                handleFontNameChange(e.target.value);
                            }
                        }}
                    >
                        {fontPresets.map((font) => (
                            <option key={font} value={font}>
                                {font}
                            </option>
                        ))}
                        {!fontPresets.includes(currentFontName) && (
                            <option value="__custom__">{currentFontName} (custom)</option>
                        )}
                    </select>
                    <input
                        type="text"
                        value={currentFontName}
                        onChange={(e) => handleFontNameChange(e.target.value)}
                        placeholder="Custom font name"
                        className="custom-font-name"
                    />
                </div>
                <div className="font-options">
                    <label className="checkbox-inline">
                        <input
                            type="checkbox"
                            checked={currentCursive}
                            onChange={(e) => handleCursiveChange(e.target.checked)}
                        />
                        <span>Cursive fallback</span>
                    </label>
                    <label className="checkbox-inline">
                        <input
                            type="checkbox"
                            checked={currentItalic}
                            onChange={(e) => handleItalicChange(e.target.checked)}
                        />
                        <span>Italic</span>
                    </label>
                </div>
                <div className="font-preview" style={{ fontFamily: value }}>
                    Preview Text ABC 123
                </div>
            </div>
        );
    };

    const CheckboxInput: React.FC<{
        label: string;
        checked: boolean;
        onChange: (checked: boolean) => void;
        description?: string;
    }> = ({ label, checked, onChange, description }) => (
        <div className="editor-field checkbox-field">
            <label>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span className="field-label">{label}</span>
            </label>
            {description && <span className="field-description">{description}</span>}
        </div>
    );

    const AssetInput: React.FC<{
        label: string;
        assetKey: keyof ScoreboardTheme['assets'];
        placeholder?: string;
        description?: string;
    }> = ({ label, assetKey, placeholder, description }) => {
        const value = customTheme.assets[assetKey] || '';
        const [localValue, setLocalValue] = useState(value);

        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        const handleBlur = () => {
            updateAssets(assetKey, localValue);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                updateAssets(assetKey, localValue);
            }
        };

        return (
            <div className="editor-field">
                <label>
                    <span className="field-label">{label}</span>
                    {description && <span className="field-description">{description}</span>}
                </label>
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                />
                {localValue && (
                    <button
                        className="clear-btn"
                        onClick={() => {
                            setLocalValue('');
                            updateAssets(assetKey, '');
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="theme-editor-overlay" onClick={onClose}>
            <div className="theme-editor" onClick={(e) => e.stopPropagation()}>
                <div className="editor-header">
                    <h2>Custom Theme Editor</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="editor-tabs">
                    <button
                        className={activeTab === 'colors' ? 'active' : ''}
                        onClick={() => setActiveTab('colors')}
                    >
                        Colors
                    </button>
                    <button
                        className={activeTab === 'typography' ? 'active' : ''}
                        onClick={() => setActiveTab('typography')}
                    >
                        Typography
                    </button>
                    <button
                        className={activeTab === 'spacing' ? 'active' : ''}
                        onClick={() => setActiveTab('spacing')}
                    >
                        Spacing
                    </button>
                    <button
                        className={activeTab === 'assets' ? 'active' : ''}
                        onClick={() => setActiveTab('assets')}
                    >
                        Assets
                    </button>
                </div>

                <div className="editor-content">
                    {activeTab === 'colors' && (
                        <div className="editor-section">
                            <h3>Background</h3>
                            <ColorInput label="Background" colorKey="background" description="Main background color" />
                            <ColorInput label="Secondary Background" colorKey="backgroundSecondary" description="Voter panel background (use 'transparent' for none)" />
                            <ColorInput label="Window" colorKey="window" description="Scoreboard window background" />

                            <h3>Text</h3>
                            <ColorInput label="Text" colorKey="text" description="Main text color" />
                            <ColorInput label="Text Secondary" colorKey="textSecondary" />
                            <ColorInput label="Country Name" colorKey="countryName" description="Country name in scoreboard" />
                            <ColorInput label="Country Name Background" colorKey="countryNameBg" />

                            <h3>Points Display (Overall)</h3>
                            <ColorInput label="Points Overall Text" colorKey="pointsOverall" description="Total points text color" />
                            <ColorInput label="Points Overall Background" colorKey="pointsOverallBg" />
                            <ColorInput label="Points Highlight Background" colorKey="pointsHighlightBg" description="Background when country receives points" />
                            <ColorInput label="Points Highlight Text" colorKey="pointsHighlightText" />

                            <h3>Points Bubble (Default)</h3>
                            <ColorInput label="Bubble Text" colorKey="pointsGained" description="Default bubble text color" />
                            <ColorInput label="Bubble Background" colorKey="pointsGainedBg" description="Default bubble background" />
                            <ColorInput label="Bubble Text (All Points)" colorKey="pointsBubbleText" description="Override text color for all point bubbles" />

                            <h3>Points Bubble Colors (by Value)</h3>
                            <div className="points-color-grid">
                                <ColorInput label="1 Point" colorKey="points1" />
                                <ColorInput label="2 Points" colorKey="points2" />
                                <ColorInput label="3 Points" colorKey="points3" />
                                <ColorInput label="4 Points" colorKey="points4" />
                                <ColorInput label="5 Points" colorKey="points5" />
                                <ColorInput label="6 Points" colorKey="points6" />
                                <ColorInput label="7 Points" colorKey="points7" />
                                <ColorInput label="8 Points" colorKey="points8" />
                                <ColorInput label="10 Points" colorKey="points10" />
                                <ColorInput label="12 Points" colorKey="points12" />
                            </div>

                            <h3>Televote Reveal (Classic Mode)</h3>
                            <ColorInput label="Televote Highlight" colorKey="televoteHighlight" description="Background when revealing televote points" />
                            <ColorInput label="Televote Highlight Text" colorKey="televoteHighlightText" description="Text color when revealing televote" />

                            <h3>Accents</h3>
                            <ColorInput label="Border" colorKey="border" />
                            <ColorInput label="Accent" colorKey="accent" />

                            <h3>Placeholders</h3>
                            <ColorInput label="Image Placeholder Background" colorKey="imagePlaceholderBg" />
                            <ColorInput label="Image Placeholder Text" colorKey="imagePlaceholderText" description="Color of '?' placeholder" />
                        </div>
                    )}

                    {activeTab === 'typography' && (
                        <div className="editor-section">
                            <h3>Fonts</h3>
                            <FontInput
                                label="Primary Font"
                                fontKey="fontPrimary"
                            />
                            <FontInput
                                label="Country Name Font"
                                fontKey="fontCountry"
                                description="Font for country names in scoreboard"
                            />
                            <FontInput
                                label="Points Font"
                                fontKey="fontPoints"
                            />
                            <FontInput
                                label="Voter Country Font"
                                fontKey="fontVoterCountry"
                                description="Font in voter panel"
                            />
                            <FontInput
                                label="Voter Label Font"
                                fontKey="fontVoterLabel"
                                description="'voting' / 'now receiving points' label"
                            />
                            <FontInput
                                label="Points Bubble Font"
                                fontKey="fontPointsBubble"
                            />

                            <h3>Font Sizes</h3>
                            <TextInput
                                label="Country Name Size"
                                value={customTheme.typography.countryNameSize}
                                onChange={(v) => updateTypography('countryNameSize', v)}
                                placeholder="1.25rem or 14pt"
                            />
                            <TextInput
                                label="Points Size"
                                value={customTheme.typography.pointsSize}
                                onChange={(v) => updateTypography('pointsSize', v)}
                                placeholder="1.75rem"
                            />
                            <TextInput
                                label="Voter Country Size"
                                value={customTheme.typography.voterCountrySize || ''}
                                onChange={(v) => updateTypography('voterCountrySize', v)}
                                placeholder="3rem or 30pt"
                            />
                            <TextInput
                                label="Voter Label Size"
                                value={customTheme.typography.voterLabelSize || ''}
                                onChange={(v) => updateTypography('voterLabelSize', v)}
                                placeholder="2rem or 18pt"
                            />
                            <TextInput
                                label="Vote Counter Size"
                                value={customTheme.typography.voteCounterSize || ''}
                                onChange={(v) => updateTypography('voteCounterSize', v)}
                                placeholder="1.5rem or 24pt"
                                description="Size of '1 / 10' counter in voter panel"
                            />
                            <TextInput
                                label="Points Bubble Size"
                                value={customTheme.typography.pointsBubbleSize || ''}
                                onChange={(v) => updateTypography('pointsBubbleSize', v)}
                                placeholder="0.875rem"
                            />
                        </div>
                    )}

                    {activeTab === 'spacing' && (
                        <div className="editor-section">
                            <h3>Spacing</h3>
                            <TextInput
                                label="Item Gap"
                                value={customTheme.spacing.itemGap}
                                onChange={(v) => updateSpacing('itemGap', v)}
                                placeholder="8px"
                                description="Gap between scoreboard rows"
                            />
                            <TextInput
                                label="Column Gap"
                                value={customTheme.spacing.columnGap}
                                onChange={(v) => updateSpacing('columnGap', v)}
                                placeholder="20%"
                                description="Gap between left/right columns"
                            />
                            <TextInput
                                label="Padding"
                                value={customTheme.spacing.padding}
                                onChange={(v) => updateSpacing('padding', v)}
                                placeholder="20px"
                            />
                            <TextInput
                                label="Border Radius"
                                value={customTheme.spacing.borderRadius}
                                onChange={(v) => updateSpacing('borderRadius', v)}
                                placeholder="0px"
                            />
                            <TextInput
                                label="Item Height"
                                value={customTheme.spacing.itemHeight}
                                onChange={(v) => updateSpacing('itemHeight', v)}
                                placeholder="auto"
                            />

                            <h3>Effects</h3>
                            <CheckboxInput
                                label="Enable Glow"
                                checked={customTheme.effects.glow}
                                onChange={(v) => updateEffects('glow', v)}
                            />
                            <CheckboxInput
                                label="Item Hover Effect"
                                checked={customTheme.effects.itemHover}
                                onChange={(v) => updateEffects('itemHover', v)}
                            />
                        </div>
                    )}

                    {activeTab === 'assets' && (
                        <div className="editor-section">
                            <h3>Images</h3>
                            <AssetInput
                                label="Background Image"
                                assetKey="backgroundImage"
                                placeholder="/backgrounds/your_image.png"
                                description="Path to background image"
                            />
                            <AssetInput
                                label="Window Frame"
                                assetKey="windowFrame"
                                placeholder="/frames/frame.png"
                                description="Optional window frame image"
                            />

                            <div className="asset-hint">
                                <p>📁 Place images in:</p>
                                <ul>
                                    <li><code>public/backgrounds/</code> for background images</li>
                                    <li><code>public/frames/</code> for window frames</li>
                                </ul>
                                <p>Then reference them as <code>/backgrounds/filename.png</code></p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="editor-actions">
                    <div className="action-group-left">
                        <button className="btn-secondary" onClick={handleReset}>
                            Reset
                        </button>
                        <button className="btn-secondary" onClick={handleExport}>
                            Export
                        </button>
                        <label className="btn-secondary import-btn">
                            Import
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <div className="action-group-right">
                        <button className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleApply}>
                            Apply Theme
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeEditor;