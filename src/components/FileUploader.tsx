import React, { useCallback, useState } from 'react';
import { ScoreEntry, NormalizedScoreEntry, normalizeScoreData } from '../types/ScoreEntry';

interface FileUploaderProps {
    onDataLoaded: (data: NormalizedScoreEntry[], filename: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadedFile, setLoadedFile] = useState<string | null>(null);

    const validateScoreEntry = (entry: unknown): entry is ScoreEntry => {
        if (typeof entry !== 'object' || entry === null) return false;
        const e = entry as Record<string, unknown>;

        const hasCountry = typeof e.country === 'string';
        const hasPlacement = typeof e.placement === 'string' || typeof e.placement === 'number';
        const hasPointsOverall = typeof e.pointsOverall === 'string' || typeof e.pointsOverall === 'number';
        const hasPointsGained = typeof e.pointsGained === 'string' || typeof e.pointsGained === 'number';

        return hasCountry && hasPlacement && hasPointsOverall && hasPointsGained;
    };

    const processFile = useCallback((file: File) => {
        setError(null);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;

                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(content);

                    if (!Array.isArray(data)) {
                        throw new Error('JSON must be an array of score entries');
                    }

                    if (data.length === 0) {
                        throw new Error('JSON array is empty');
                    }

                    if (!data.every(validateScoreEntry)) {
                        const invalidIndex = data.findIndex(entry => !validateScoreEntry(entry));
                        throw new Error(`Invalid entry at index ${invalidIndex}. Required fields: country, placement, pointsOverall, pointsGained`);
                    }

                    const normalizedData = normalizeScoreData(data);
                    setLoadedFile(file.name);
                    onDataLoaded(normalizedData, file.name);

                } else if (file.name.endsWith('.csv')) {
                    const data = parseCSV(content);
                    const normalizedData = normalizeScoreData(data);
                    setLoadedFile(file.name);
                    onDataLoaded(normalizedData, file.name);
                } else {
                    throw new Error('Unsupported file format. Use .json or .csv');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to parse file');
                setLoadedFile(null);
            }
        };

        reader.onerror = () => {
            setError('Failed to read file');
            setLoadedFile(null);
        };

        reader.readAsText(file);
    }, [onDataLoaded]);

    const parseCSV = (content: string): ScoreEntry[] => {
        const lines = content.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV must have a header row and at least one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const countryIdx = headers.findIndex(h => h === 'country');
        const placementIdx = headers.findIndex(h => h === 'placement');
        const pointsGainedIdx = headers.findIndex(h =>
            h === 'pointsgained' || h === 'points_gained' || h === 'gained'
        );
        const pointsOverallIdx = headers.findIndex(h =>
            h === 'pointsoverall' || h === 'points_overall' || h === 'overall' || h === 'total'
        );
        const isVoterIdx = headers.findIndex(h =>
            h === 'isvoter' || h === 'is_voter' || h === 'voter'
        );

        if (countryIdx === -1) {
            throw new Error('CSV must have a "country" column');
        }

        return lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            return {
                country: values[countryIdx] || '',
                placement: placementIdx !== -1 ? values[placementIdx] : String(index + 1),
                pointsGained: pointsGainedIdx !== -1 ? values[pointsGainedIdx] : '0',
                pointsOverall: pointsOverallIdx !== -1 ? values[pointsOverallIdx] : '0',
                isVoter: isVoterIdx !== -1 ? values[isVoterIdx] : '0',
            };
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleClear = () => {
        setLoadedFile(null);
        setError(null);
    };

    return (
        <div className="file-uploader">
            <h3>Upload Scoreboard</h3>
            <div
                className={`drop-zone ${dragActive ? 'active' : ''} ${loadedFile ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleChange}
                    id="file-input"
                />
                <label htmlFor="file-input">
                    {loadedFile ? (
                        <>
                            <span className="file-name">{loadedFile}</span>
                            <span className="file-hint">Click or drop to replace</span>
                        </>
                    ) : (
                        <>
                            <span>Drop your scoreboard file here</span>
                            <span className="file-types">Supports .json and .csv</span>
                        </>
                    )}
                </label>
            </div>
            {loadedFile && (
                <button className="clear-btn" onClick={handleClear}>Clear</button>
            )}
            {error && <p className="upload-error">{error}</p>}
        </div>
    );
};

export default FileUploader;