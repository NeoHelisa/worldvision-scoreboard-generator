import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLayout, parseLayoutFromURL } from '../context/LayoutContext';
import useConfig from '../hooks/useConfig';
import { NormalizedScoreEntry, normalizeScoreData } from '../types/ScoreEntry';
import { CountryTelevoteSum } from '../types/TelevoteData';
import { aggregateTelevotesFromScoreboards } from '../utils/votingUtils';
import { classicVotingSystem } from '../types/VotingSystem';
import TelevoteWithVoter from './TelevoteWithVoter';
import TelevoteScoreboard from './TelevoteScoreboard';

const TelevotePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { theme } = useTheme();
    const { settings } = useLayout();
    const config = useConfig();

    const urlLayoutSettings = parseLayoutFromURL(searchParams);
    const finalSettings = { ...settings, ...urlLayoutSettings };

    const currentCountry = searchParams.get('country') || '';
    const currentIndex = parseInt(searchParams.get('index') || '0', 10);

    const [televoteSums, setTelevoteSums] = useState<CountryTelevoteSum[]>([]);
    const [latestScoreboard, setLatestScoreboard] = useState<NormalizedScoreEntry[]>([]);
    const [revealOrder, setRevealOrder] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const sums = await aggregateTelevotesFromScoreboards(
                    config.scoreboardsDirectory,
                    config.screenshotCount
                );
                setTelevoteSums(sums);

                const order = sums
                    .sort((a, b) => b.placement - a.placement)
                    .map((t) => t.country);
                setRevealOrder(order);

                const lastScoreboardResponse = await fetch(
                    `${config.scoreboardsDirectory}/scoreboard${config.screenshotCount}.json`
                );
                if (lastScoreboardResponse.ok) {
                    const rawData = await lastScoreboardResponse.json();
                    setLatestScoreboard(normalizeScoreData(rawData));
                }

                setLoading(false);
            } catch (err) {
                console.error('Failed to load televote data', err);
                setLoading(false);
            }
        };

        loadData();
    }, [config.scoreboardsDirectory, config.screenshotCount]);

    const previewBackgroundStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
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

    if (loading) {
        return <div>Loading televote data...</div>;
    }

    const televotePhase = classicVotingSystem.phases.find((p) => p.id === 'televote')!;
    const revealedCountries = revealOrder.slice(0, currentIndex + 1);

    return (
        <div style={previewBackgroundStyle}>
            {finalSettings.showVoterPanel ? (
                <TelevoteWithVoter
                    data={latestScoreboard}
                    theme={theme}
                    televoteSums={televoteSums}
                    currentRevealCountry={currentCountry}
                    currentRevealIndex={currentIndex}
                    totalCountries={televoteSums.length}
                    revealOrder={revealOrder}
                    title="Televote Results"
                    phase={televotePhase}
                    variant={finalSettings.variant}
                    showFlags={finalSettings.showFlags}
                    panelPosition={finalSettings.panelPosition}
                />
            ) : (
                <TelevoteScoreboard
                    data={latestScoreboard}
                    theme={theme}
                    televoteSums={televoteSums}
                    currentRevealCountry={currentCountry}
                    revealedCountries={revealedCountries}
                    title="Televote Results"
                    phase={televotePhase}
                    variant={finalSettings.variant}
                    showFlags={finalSettings.showFlags}
                />
            )}
        </div>
    );
};

export default TelevotePage;