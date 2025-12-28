import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NormalizedScoreEntry, normalizeScoreData, ScoreEntry } from '../types/ScoreEntry';

export interface ScoreboardCollection {
    [key: string]: NormalizedScoreEntry[];
}

interface ScoreboardDataContextValue {
    scoreboards: ScoreboardCollection;
    setScoreboards: (data: ScoreboardCollection) => void;
    clearScoreboards: () => void;
    getScoreboard: (key: string) => NormalizedScoreEntry[] | null;
    getScoreboardKeys: (prefix?: string) => string[];
    totalScoreboards: number;
    hasJuryData: boolean;
    hasTelevoteData: boolean;
    hasModernData: boolean;
}

const ScoreboardDataContext = createContext<ScoreboardDataContextValue | null>(null);

interface ScoreboardDataProviderProps {
    children: ReactNode;
}

export const ScoreboardDataProvider: React.FC<ScoreboardDataProviderProps> = ({ children }) => {
    const [scoreboards, setScoreboardsState] = useState<ScoreboardCollection>({});

    const setScoreboards = (data: ScoreboardCollection) => {
        setScoreboardsState(data);
    };

    const clearScoreboards = () => {
        setScoreboardsState({});
    };

    const getScoreboard = (key: string): NormalizedScoreEntry[] | null => {
        return scoreboards[key] || null;
    };

    const getScoreboardKeys = (prefix?: string): string[] => {
        const keys = Object.keys(scoreboards);
        if (!prefix) return keys;
        return keys.filter((key) => key.startsWith(prefix));
    };

    const totalScoreboards = Object.keys(scoreboards).length;

    const hasJuryData = Object.keys(scoreboards).some((k) => k.startsWith('jury_'));
    const hasTelevoteData = Object.keys(scoreboards).some((k) => k.startsWith('televote_'));
    const hasModernData = Object.keys(scoreboards).some((k) => /^\d+$/.test(k));

    return (
        <ScoreboardDataContext.Provider
            value={{
                scoreboards,
                setScoreboards,
                clearScoreboards,
                getScoreboard,
                getScoreboardKeys,
                totalScoreboards,
                hasJuryData,
                hasTelevoteData,
                hasModernData,
            }}
        >
            {children}
        </ScoreboardDataContext.Provider>
    );
};

export const useScoreboardData = (): ScoreboardDataContextValue => {
    const context = useContext(ScoreboardDataContext);
    if (!context) {
        throw new Error('useScoreboardData must be used within a ScoreboardDataProvider');
    }
    return context;
};

export const parseCombinedScoreboardFile = (
    data: Record<string, any>
): ScoreboardCollection => {
    const result: ScoreboardCollection = {};

    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            result[key] = normalizeScoreData(value as ScoreEntry[]);
        } else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
                if (Array.isArray(subValue)) {
                    const fullKey = `${key}_${subKey}`;
                    result[fullKey] = normalizeScoreData(subValue as ScoreEntry[]);
                }
            });
        }
    });

    return result;
};

export const parseMultipleScoreboardFiles = (
    files: { name: string; data: ScoreEntry[] }[]
): ScoreboardCollection => {
    const result: ScoreboardCollection = {};

    files.forEach((file) => {
        const key = file.name.replace(/\.json$/i, '');
        result[key] = normalizeScoreData(file.data);
    });

    return result;
};