import React, { useRef } from 'react';
import {
    useScoreboardData,
    parseCombinedScoreboardFile,
    parseMultipleScoreboardFiles,
} from '../context/ScoreboardDataContext';
import { ScoreEntry } from '../types/ScoreEntry';
import { toast } from 'react-toastify';

const BatchFileUploader: React.FC = () => {
    const {
        setScoreboards,
        clearScoreboards,
        totalScoreboards,
        hasJuryData,
        hasTelevoteData,
        hasModernData
    } = useScoreboardData();
    const combinedInputRef = useRef<HTMLInputElement>(null);
    const multipleInputRef = useRef<HTMLInputElement>(null);

    const handleCombinedFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                if (typeof data !== 'object' || Array.isArray(data)) {
                    throw new Error('Invalid format. Expected object with keys.');
                }

                const parsed = parseCombinedScoreboardFile(data);

                if (Object.keys(parsed).length === 0) {
                    throw new Error('No valid scoreboards found in file.');
                }

                setScoreboards(parsed);

                const juryCount = Object.keys(parsed).filter((k) => k.startsWith('jury_')).length;
                const televoteCount = Object.keys(parsed).filter((k) => k.startsWith('televote_')).length;
                const modernCount = Object.keys(parsed).filter((k) => /^\d+$/.test(k)).length;

                if (juryCount > 0 || televoteCount > 0) {
                    toast.success(`Loaded ${juryCount} jury + ${televoteCount} televote scoreboards`);
                } else if (modernCount > 0) {
                    toast.success(`Loaded ${modernCount} scoreboards`);
                } else {
                    toast.success(`Loaded ${Object.keys(parsed).length} scoreboards`);
                }
            } catch (err) {
                toast.error(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        };
        reader.readAsText(file);

        if (combinedInputRef.current) {
            combinedInputRef.current.value = '';
        }
    };

    const handleMultipleFilesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const fileDataPromises = Array.from(files).map((file) => {
            return new Promise<{ name: string; data: ScoreEntry[] }>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target?.result as string;
                        const data: ScoreEntry[] = JSON.parse(content);
                        resolve({ name: file.name, data });
                    } catch (err) {
                        reject(new Error(`Failed to parse ${file.name}`));
                    }
                };
                reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
                reader.readAsText(file);
            });
        });

        try {
            const fileData = await Promise.all(fileDataPromises);
            const parsed = parseMultipleScoreboardFiles(fileData);
            setScoreboards(parsed);
            toast.success(`Loaded ${Object.keys(parsed).length} scoreboards`);
        } catch (err) {
            toast.error(`Failed to load files: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        if (multipleInputRef.current) {
            multipleInputRef.current.value = '';
        }
    };

    const handleClear = () => {
        clearScoreboards();
        toast.info('Cleared all scoreboards');
    };

    const getStatusText = (): string => {
        const parts: string[] = [];

        if (hasJuryData || hasTelevoteData) {
            const juryCount = hasJuryData ? 'jury' : '';
            const televoteCount = hasTelevoteData ? 'televote' : '';
            parts.push(`Classic: ${[juryCount, televoteCount].filter(Boolean).join(' + ')}`);
        }

        if (hasModernData) {
            parts.push('Modern');
        }

        return `${totalScoreboards} scoreboards (${parts.join(', ')})`;
    };

    return (
        <div className="batch-file-uploader">
            <h3>Batch Upload</h3>

            <div className="upload-options">
                <div className="upload-option">
                    <label>Combined JSON file:</label>
                    <input
                        ref={combinedInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleCombinedFileUpload}
                    />
                    <span className="hint">Single file with all scoreboards</span>
                </div>

                <div className="upload-option">
                    <label>Multiple JSON files:</label>
                    <input
                        ref={multipleInputRef}
                        type="file"
                        accept=".json"
                        multiple
                        onChange={handleMultipleFilesUpload}
                    />
                    <span className="hint">Select multiple scoreboard files</span>
                </div>
            </div>

            {totalScoreboards > 0 && (
                <div className="upload-status">
                    <span className="status-text">{getStatusText()}</span>
                    <button className="clear-btn" onClick={handleClear}>
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default BatchFileUploader;