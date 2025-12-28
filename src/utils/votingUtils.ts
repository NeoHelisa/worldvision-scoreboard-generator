import { NormalizedScoreEntry } from '../types/ScoreEntry';
import { VotingPhase } from '../types/VotingSystem';
import { CountryTelevoteSum } from '../types/TelevoteData';

export const JURY_POINTS = [1, 3, 5, 7];
export const TELEVOTE_POINTS = [2, 4, 6, 8, 10, 12];

export const isJuryPoints = (points: number): boolean => {
    return JURY_POINTS.includes(points);
};

export const isTelevotePoints = (points: number): boolean => {
    return TELEVOTE_POINTS.includes(points);
};

export const aggregateTelevotesFromScoreboards = async (
    scoreboardsDirectory: string,
    totalScoreboards: number
): Promise<CountryTelevoteSum[]> => {
    const televoteSums: Record<string, number> = {};
    const placements: Record<string, number> = {};

    for (let i = 1; i <= totalScoreboards; i++) {
        try {
            const response = await fetch(`${scoreboardsDirectory}/scoreboard${i}.json`);
            if (!response.ok) continue;

            const rawData = await response.json();
            const entries = normalizeScoreData(rawData);

            entries.forEach((entry) => {
                if (TELEVOTE_POINTS.includes(entry.pointsGained)) {
                    televoteSums[entry.country] = (televoteSums[entry.country] || 0) + entry.pointsGained;
                }
                placements[entry.country] = entry.placement;
            });
        } catch (err) {
            console.error(`Failed to load scoreboard${i}.json`, err);
        }
    }

    return Object.entries(televoteSums)
        .map(([country, televoteSum]) => ({
            country,
            televoteSum,
            placement: placements[country] || 0,
        }))
        .sort((a, b) => b.placement - a.placement);
};

export const aggregateTelevotesFromData = (
    scoreboards: Record<string, NormalizedScoreEntry[]>,
    pointsToInclude: number[] = TELEVOTE_POINTS
): CountryTelevoteSum[] => {
    const televoteSums: Record<string, number> = {};
    const placements: Record<string, number> = {};

    Object.values(scoreboards).forEach((entries) => {
        entries.forEach((entry) => {
            if (pointsToInclude.includes(entry.pointsGained)) {
                televoteSums[entry.country] = (televoteSums[entry.country] || 0) + entry.pointsGained;
            }
            placements[entry.country] = entry.placement;
        });
    });

    return Object.entries(televoteSums)
        .map(([country, televoteSum]) => ({
            country,
            televoteSum,
            placement: placements[country] || 0,
        }))
        .sort((a, b) => b.placement - a.placement);
};

export const filterPointsForPhase = (
    entry: NormalizedScoreEntry,
    phase: VotingPhase
): NormalizedScoreEntry => {
    const shouldShow = phase.pointsToShow.includes(entry.pointsGained);
    return {
        ...entry,
        pointsGained: shouldShow ? entry.pointsGained : 0,
    };
};

export const sortEntriesForPhase = (
    entries: NormalizedScoreEntry[],
    phase: VotingPhase
): NormalizedScoreEntry[] => {
    const sorted = [...entries];

    switch (phase.orderBy) {
        case 'placement-asc':
            return sorted.sort((a, b) => a.placement - b.placement);
        case 'placement-desc':
            return sorted.sort((a, b) => b.placement - a.placement);
        case 'voter':
        default:
            return sorted;
    }
};

import { normalizeScoreData } from '../types/ScoreEntry';