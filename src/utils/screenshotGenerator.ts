import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { NormalizedScoreEntry } from '../types/ScoreEntry';
import { ScoreboardTheme } from '../themes/types';
import { LayoutSettings } from '../context/LayoutContext';
import { VotingPhase } from '../types/VotingSystem';

export interface ScreenshotConfig {
    width: number;
    height: number;
    scale: number;
}

export interface GenerationProgress {
    current: number;
    total: number;
    phase: string;
    status: 'idle' | 'generating' | 'complete' | 'error';
    message?: string;
}

export const defaultScreenshotConfig: ScreenshotConfig = {
    width: 1920,
    height: 1080,
    scale: 1,
};

export const captureElement = async (
    element: HTMLElement,
    config: ScreenshotConfig = defaultScreenshotConfig
): Promise<Blob> => {
    const canvas = await html2canvas(element, {
        width: config.width,
        height: config.height,
        scale: config.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
    });

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to create blob from canvas'));
            }
        }, 'image/png', 1.0);
    });
};

export const generateZipFromBlobs = async (
    files: { name: string; blob: Blob }[]
): Promise<Blob> => {
    const zip = new JSZip();

    files.forEach((file) => {
        zip.file(file.name, file.blob);
    });

    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const getFilenameForScoreboard = (
    boardNumber: string,
    phaseId?: string,
    phaseIndex?: number
): string => {
    if (phaseId && phaseIndex !== undefined) {
        return `phase${phaseIndex + 1}_${phaseId}_scoreboard${boardNumber}.png`;
    }
    return `scoreboard${boardNumber}.png`;
};

export const getFilenameForTelevote = (
    country: string,
    index: number,
    phaseIndex: number
): string => {
    const safeCountry = country.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    return `phase${phaseIndex + 1}_televote_${index + 1}_${safeCountry}.png`;
};