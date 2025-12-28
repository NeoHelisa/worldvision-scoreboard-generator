export interface ScoreEntry {
    country: string;
    placement: number | string;
    pointsOverall: number | string;
    pointsGained: number | string;
    isVoter?: string | boolean | number;
}

export interface NormalizedScoreEntry {
    country: string;
    placement: number;
    pointsOverall: number;
    pointsGained: number;
    isVoter: boolean;
}

export const normalizeScoreEntry = (entry: ScoreEntry): NormalizedScoreEntry => ({
    country: entry.country,
    placement: typeof entry.placement === 'string' ? parseInt(entry.placement, 10) : entry.placement,
    pointsOverall: typeof entry.pointsOverall === 'string' ? parseInt(entry.pointsOverall, 10) : entry.pointsOverall,
    pointsGained: typeof entry.pointsGained === 'string' ? parseInt(entry.pointsGained, 10) : entry.pointsGained,
    isVoter: entry.isVoter === '1' || entry.isVoter === true || entry.isVoter === 1,
});

export const normalizeScoreData = (data: ScoreEntry[]): NormalizedScoreEntry[] =>
    data.map(normalizeScoreEntry);