import { useState, useEffect } from 'react';
import { NormalizedScoreEntry, normalizeScoreData } from '../types/ScoreEntry';
import { CountryTelevoteSum } from '../types/TelevoteData';

const TELEVOTE_POINTS = [2, 4, 6, 8, 10, 12];

export const useTelevoteAggregation = (
    scoreboardsDirectory: string,
    totalScoreboards: number
): { data: CountryTelevoteSum[] | null; loading: boolean; error: string | null } => {
    const [data, setData] = useState<CountryTelevoteSum[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const aggregateTelevotes = async () => {
            try {
                const televoteSums: Record<string, number> = {};
                const placements: Record<string, number> = {};

                for (let i = 1; i <= totalScoreboards; i++) {
                    const response = await fetch(`${scoreboardsDirectory}/scoreboard${i}.json`);
                    if (!response.ok) continue;

                    const rawData = await response.json();
                    const entries = normalizeScoreData(rawData);

                    entries.forEach((entry) => {
                        if (TELEVOTE_POINTS.includes(entry.pointsGained)) {
                            televoteSums[entry.country] = (televoteSums[entry.country] || 0) + entry.pointsGained;
                        }
                        if (!placements[entry.country]) {
                            placements[entry.country] = entry.placement;
                        }
                    });
                }

                const result: CountryTelevoteSum[] = Object.entries(televoteSums)
                    .map(([country, televoteSum]) => ({
                        country,
                        televoteSum,
                        placement: placements[country] || 0,
                    }))
                    .sort((a, b) => b.placement - a.placement);

                setData(result);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to aggregate televotes');
                setLoading(false);
            }
        };

        aggregateTelevotes();
    }, [scoreboardsDirectory, totalScoreboards]);

    return { data, loading, error };
};