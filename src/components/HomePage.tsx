import React, { useState, useMemo, useEffect } from 'react';
import ThemeSelector from './ThemeSelector';
import BatchFileUploader from './BatchFileUploader';
import VotingSystemSelector from './VotingSystemSelector';
import ScreenshotGenerator from './ScreenshotGenerator';
import ScoreboardRenderer from './ScoreboardRenderer';
import ScoreboardWithVoter from './ScoreboardWithVoter';
import { useTheme } from '../context/ThemeContext';
import { useLayout } from '../context/LayoutContext';
import { useVotingSystem } from '../context/VotingSystemContext';
import { useScoreboardData } from '../context/ScoreboardDataContext';
import {getVoterEntry} from "../types/ScoreEntry";

const HomePage: React.FC = () => {
    const { theme } = useTheme();
    const { settings, updateSettings } = useLayout();
    const { votingSystem } = useVotingSystem();
    const {
        scoreboards,
        getScoreboardKeys,
        hasJuryData,
        hasTelevoteData,
        hasModernData,
    } = useScoreboardData();

    const [selectedPhase, setSelectedPhase] = useState<string>('jury');
    const [selectedBoardKey, setSelectedBoardKey] = useState<string>('');

    const availableKeys = useMemo(() => {
        let keys: string[] = [];

        if (votingSystem.id === 'classic') {
            if (selectedPhase === 'jury') {
                keys = getScoreboardKeys('jury_');
            } else if (selectedPhase === 'televote') {
                keys = getScoreboardKeys('televote_');
            }
        } else {
            keys = getScoreboardKeys().filter((k) => /^\d+$/.test(k));
        }

        return keys.sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
        });
    }, [votingSystem.id, selectedPhase, getScoreboardKeys]);

    const previewData = useMemo(() => {
        if (!selectedBoardKey) return null;
        return scoreboards[selectedBoardKey] || null;
    }, [selectedBoardKey, scoreboards]);

    const voterEntry = previewData ? getVoterEntry(previewData) : undefined;
    const voterCountry = voterEntry?.country || 'Unknown';

    const currentNumber = parseInt(selectedBoardKey.replace(/\D/g, ''), 10) || 1;

    const isTelevotePhase = selectedPhase === 'televote';
    const isJuryPhase = selectedPhase === 'jury';

    useEffect(() => {
        if (availableKeys.length > 0 && !availableKeys.includes(selectedBoardKey)) {
            setSelectedBoardKey(availableKeys[0]);
        }
    }, [availableKeys, selectedBoardKey]);

    useEffect(() => {
        if (votingSystem.id === 'classic') {
            if (hasJuryData && !hasTelevoteData) {
                setSelectedPhase('jury');
            } else if (hasTelevoteData && !hasJuryData) {
                setSelectedPhase('televote');
            } else if (hasJuryData) {
                setSelectedPhase('jury');
            }
        }
    }, [votingSystem.id, hasJuryData, hasTelevoteData]);

    const previewBackgroundStyle: React.CSSProperties = {
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundImage: theme.assets.backgroundImage
            ? `url(${theme.assets.backgroundImage})`
            : undefined,
        backgroundColor: theme.colors.background,
        backgroundSize: 'auto 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    };

    const hasData = Object.keys(scoreboards).length > 0;
    const hasClassicData = hasJuryData || hasTelevoteData;
    const showClassicControls = votingSystem.id === 'classic' && hasClassicData;

    const formatKeyLabel = (key: string): string => {
        if (key.startsWith('jury_')) {
            return `Jury #${key.replace('jury_', '')}`;
        }
        if (key.startsWith('televote_')) {
            return `Televote #${key.replace('televote_', '')}`;
        }
        return `Scoreboard #${key}`;
    };

    return (
        <div className="home-page">
            <header>
                <h1>Scoreboard Generator</h1>
                <p>Upload your data and choose a theme</p>
            </header>

            <div className="controls-section">
                <ThemeSelector />
                <VotingSystemSelector />
                <BatchFileUploader />
                <ScreenshotGenerator />

                <div className="layout-options">
                    <h3>Layout Options</h3>

                    <div className="option-group">
                        <span className="option-label">Row Style</span>
                        <div className="option-buttons">
                            <button
                                className={settings.variant === 'default' ? 'active' : ''}
                                onClick={() => updateSettings({ variant: 'default' })}
                            >
                                Default
                            </button>
                            <button
                                className={settings.variant === 'compact' ? 'active' : ''}
                                onClick={() => updateSettings({ variant: 'compact' })}
                            >
                                Compact
                            </button>
                        </div>
                    </div>

                    <div className="option-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.showFlags}
                                onChange={(e) => updateSettings({ showFlags: e.target.checked })}
                            />
                            Show Flags
                        </label>
                    </div>

                    <div className="option-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.showVoterPanel}
                                onChange={(e) => updateSettings({ showVoterPanel: e.target.checked })}
                            />
                            Show Voter Panel
                        </label>
                        {settings.showVoterPanel && (
                            <div className="panel-position">
                                <label>
                                    <input
                                        type="radio"
                                        name="panelPosition"
                                        value="left"
                                        checked={settings.panelPosition === 'left'}
                                        onChange={() => updateSettings({ panelPosition: 'left' })}
                                    />
                                    Left
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="panelPosition"
                                        value="right"
                                        checked={settings.panelPosition === 'right'}
                                        onChange={() => updateSettings({ panelPosition: 'right' })}
                                    />
                                    Right
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {hasData && (
                <div className="preview-section">
                    <div className="preview-header">
                        <h2>Preview</h2>
                        <div className="preview-selectors">
                            {showClassicControls && (
                                <select
                                    value={selectedPhase}
                                    onChange={(e) => setSelectedPhase(e.target.value)}
                                    className="phase-selector"
                                >
                                    {hasJuryData && <option value="jury">Jury Phase</option>}
                                    {hasTelevoteData && <option value="televote">Televote Phase</option>}
                                </select>
                            )}

                            {availableKeys.length > 0 && (
                                <select
                                    value={selectedBoardKey}
                                    onChange={(e) => setSelectedBoardKey(e.target.value)}
                                    className="board-selector"
                                >
                                    {availableKeys.map((key) => (
                                        <option key={key} value={key}>
                                            {formatKeyLabel(key)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {availableKeys.length === 0 && (
                        <div className="no-data-message">
                            <p>
                                No scoreboards found for the selected voting system.
                                {votingSystem.id === 'classic' && hasModernData && (
                                    <span> Try switching to "Modern Eurovision" or upload classic format data.</span>
                                )}
                                {votingSystem.id === 'modern' && hasClassicData && (
                                    <span> Try switching to "Classic Eurovision" or upload modern format data.</span>
                                )}
                            </p>
                        </div>
                    )}

                    {previewData && (
                        <div className="preview-frame" style={previewBackgroundStyle}>
                            {settings.showVoterPanel ? (
                                <ScoreboardWithVoter
                                    data={previewData}
                                    theme={theme}
                                    title={voterCountry}
                                    voterCountry={voterCountry}
                                    currentVoteNumber={currentNumber}
                                    totalVoters={availableKeys.length}
                                    panelPosition={settings.panelPosition}
                                    variant={settings.variant}
                                    showFlags={settings.showFlags}
                                    isTelevote={isTelevotePhase}
                                    isJury={isJuryPhase}
                                />
                            ) : (
                                <ScoreboardRenderer
                                    data={previewData}
                                    theme={theme}
                                    title={voterCountry}
                                    variant={settings.variant}
                                    showFlags={settings.showFlags}
                                    isTelevote={isTelevotePhase}
                                    isJury={isJuryPhase}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HomePage;