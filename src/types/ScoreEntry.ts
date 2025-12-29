export interface ScoreEntry {
    country: string;
    placement: number | string;
    pointsOverall: number | string;
    pointsGained: number | string;
    isVoter?: string | boolean | number;
}

export interface NormalizedScoreEntry {
    country: string;
    placement: number | string;
    pointsOverall: number;
    pointsGained: number;
    isVoter: boolean;
}

export const normalizeScoreEntry = (entry: ScoreEntry): NormalizedScoreEntry => {
    let placement: number | string = entry.placement;

    if (typeof entry.placement === 'string') {
        if (entry.placement === 'voter' || entry.placement === 'revealed') {
            placement = entry.placement;
        } else {
            placement = parseInt(entry.placement, 10);
        }
    }

    return {
        country: entry.country,
        placement,
        pointsOverall: typeof entry.pointsOverall === 'string' ? parseInt(entry.pointsOverall, 10) : entry.pointsOverall,
        pointsGained: typeof entry.pointsGained === 'string' ? parseInt(entry.pointsGained, 10) : entry.pointsGained,
        isVoter: entry.isVoter === '1' || entry.isVoter === true || entry.isVoter === 1,
    };
};

export const normalizeScoreData = (data: ScoreEntry[]): NormalizedScoreEntry[] =>
    data.map(normalizeScoreEntry);

export const isVoterEntry = (entry: NormalizedScoreEntry): boolean =>
    entry.placement === 'voter' || entry.placement === 'revealed';

export const getScoreboardEntries = (data: NormalizedScoreEntry[]): NormalizedScoreEntry[] =>
    data.filter(entry => !isVoterEntry(entry));

export const getVoterEntry = (data: NormalizedScoreEntry[]): NormalizedScoreEntry | undefined =>
    data.find(entry => entry.isVoter);