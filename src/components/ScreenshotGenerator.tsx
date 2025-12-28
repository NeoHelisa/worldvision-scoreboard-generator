import React, { useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { useScoreboardData } from '../context/ScoreboardDataContext';
import { useTheme } from '../context/ThemeContext';
import { useLayout } from '../context/LayoutContext';
import { useVotingSystem } from '../context/VotingSystemContext';
import ScoreboardWithVoter from './ScoreboardWithVoter';
import ScoreboardRenderer from './ScoreboardRenderer';
import { toast } from 'react-toastify';
import { NormalizedScoreEntry } from '../types/ScoreEntry';

interface GenerationProgress {
    current: number;
    total: number;
    status: 'idle' | 'generating' | 'complete' | 'error';
    message?: string;
}

const SCREENSHOT_CONFIG = {
    width: 1920,
    height: 1080,
    scale: 1,
};

const ScreenshotGenerator: React.FC = () => {
    const { scoreboards, getScoreboardKeys } = useScoreboardData();
    const { theme } = useTheme();
    const { settings } = useLayout();
    const { votingSystem } = useVotingSystem();

    const [progress, setProgress] = useState<GenerationProgress>({
        current: 0,
        total: 0,
        status: 'idle',
    });

    const renderContainerRef = useRef<HTMLDivElement>(null);

    const captureScreenshot = async (element: HTMLElement): Promise<Blob> => {
        const canvas = await html2canvas(element, {
            width: SCREENSHOT_CONFIG.width,
            height: SCREENSHOT_CONFIG.height,
            scale: SCREENSHOT_CONFIG.scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
        });

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to create blob'));
            }, 'image/png', 1.0);
        });
    };

    const renderAndCapture = async (
        data: NormalizedScoreEntry[],
        voterCountry: string,
        currentNumber: number,
        totalCount: number,
        isTelevote: boolean = false,
        isJury: boolean = false
    ): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!renderContainerRef.current) {
                reject(new Error('Render container not found'));
                return;
            }

            const container = renderContainerRef.current;
            const root = createRoot(container);

            const previewStyle: React.CSSProperties = {
                width: `${SCREENSHOT_CONFIG.width}px`,
                height: `${SCREENSHOT_CONFIG.height}px`,
                backgroundImage: theme.assets.backgroundImage
                    ? `url(${theme.assets.backgroundImage})`
                    : undefined,
                backgroundColor: theme.colors.background,
                backgroundSize: 'auto 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden',
            };

            const content = settings.showVoterPanel ? (
                <ScoreboardWithVoter
                    data={data}
                    theme={theme}
                    title={voterCountry}
                    voterCountry={voterCountry}
                    currentVoteNumber={currentNumber}
                    totalVoters={totalCount}
                    panelPosition={settings.panelPosition}
                    showFlags={settings.showFlags}
                    variant={settings.variant}
                    isTelevote={isTelevote}
                    isJury={isJury}
                />
            ) : (
                <ScoreboardRenderer
                    data={data}
                    theme={theme}
                    title={voterCountry}
                    showFlags={settings.showFlags}
                    variant={settings.variant}
                    isTelevote={isTelevote}
                    isJury={isJury}
                />
            );

            root.render(<div style={previewStyle}>{content}</div>);

            setTimeout(async () => {
                try {
                    const blob = await captureScreenshot(container);
                    root.unmount();
                    resolve(blob);
                } catch (err) {
                    root.unmount();
                    reject(err);
                }
            }, 150);
        });
    };

    const generateScreenshots = useCallback(async () => {
        const allKeys = Object.keys(scoreboards);
        if (allKeys.length === 0) {
            toast.error('No scoreboards loaded. Please upload data first.');
            return;
        }

        const files: { name: string; blob: Blob }[] = [];

        let keysToProcess: string[] = [];

        if (votingSystem.id === 'classic') {
            const juryKeys = getScoreboardKeys('jury_').sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, ''), 10);
                const numB = parseInt(b.replace(/\D/g, ''), 10);
                return numA - numB;
            });
            const televoteKeys = getScoreboardKeys('televote_').sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, ''), 10);
                const numB = parseInt(b.replace(/\D/g, ''), 10);
                return numA - numB;
            });
            keysToProcess = [...juryKeys, ...televoteKeys];
        } else {
            keysToProcess = allKeys
                .filter((k) => /^\d+$/.test(k))
                .sort((a, b) => parseInt(a) - parseInt(b));
        }

        if (keysToProcess.length === 0) {
            toast.error('No valid scoreboards found for the selected voting system.');
            return;
        }

        setProgress({
            current: 0,
            total: keysToProcess.length,
            status: 'generating',
        });

        try {
            for (let i = 0; i < keysToProcess.length; i++) {
                const key = keysToProcess[i];
                const data = scoreboards[key];

                const voterEntry = data.find((e) => e.isVoter);
                const voterCountry = voterEntry?.country || 'Unknown';
                const currentNumber = parseInt(key.replace(/\D/g, ''), 10) || (i + 1);
                const isTelevote = key.startsWith('televote_');
                const isJury = key.startsWith('jury_');

                setProgress((prev) => ({
                    ...prev,
                    current: i + 1,
                    message: `${voterCountry} (${key})`,
                }));

                const blob = await renderAndCapture(
                    data,
                    voterCountry,
                    currentNumber,
                    keysToProcess.length,
                    isTelevote,
                    isJury
                );

                const filename = `${key}.png`;
                files.push({ name: filename, blob });
            }

            setProgress((prev) => ({
                ...prev,
                status: 'complete',
                message: 'Creating ZIP file...',
            }));

            const zip = new JSZip();
            files.forEach((file) => zip.file(file.name, file.blob));

            const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `scoreboards_${timestamp}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Generated ${files.length} screenshots!`);

            setProgress({
                current: 0,
                total: 0,
                status: 'idle',
            });
        } catch (err) {
            console.error('Screenshot generation failed:', err);
            setProgress((prev) => ({
                ...prev,
                status: 'error',
                message: err instanceof Error ? err.message : 'Unknown error',
            }));
            toast.error('Failed to generate screenshots');
        }
    }, [scoreboards, theme, settings, votingSystem, getScoreboardKeys]);

    const progressPercent =
        progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    const totalScoreboards = Object.keys(scoreboards).length;

    return (
        <div className="screenshot-generator">
            <h3>Generate Screenshots</h3>

            {totalScoreboards === 0 ? (
                <p className="no-data-message">Upload scoreboards first</p>
            ) : (
                <>
                    <p className="data-summary">{totalScoreboards} scoreboards ready</p>

                    <button
                        className="generate-btn"
                        onClick={generateScreenshots}
                        disabled={progress.status === 'generating'}
                    >
                        {progress.status === 'generating' ? 'Generating...' : 'Generate & Download ZIP'}
                    </button>

                    {progress.status === 'generating' && (
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="progress-text">
                                {progress.current} / {progress.total} ({progressPercent}%)
                            </div>
                            {progress.message && (
                                <div className="progress-message">{progress.message}</div>
                            )}
                        </div>
                    )}

                    {progress.status === 'error' && (
                        <div className="error-message">Error: {progress.message}</div>
                    )}
                </>
            )}

            <div
                ref={renderContainerRef}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '-9999px',
                    width: `${SCREENSHOT_CONFIG.width}px`,
                    height: `${SCREENSHOT_CONFIG.height}px`,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
};

export default ScreenshotGenerator;