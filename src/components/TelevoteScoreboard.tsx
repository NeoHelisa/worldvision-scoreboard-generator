import React from 'react';
import { NormalizedScoreEntry } from '../types/ScoreEntry';
import { ScoreboardTheme } from '../themes/types';
import { CountryTelevoteSum } from '../types/TelevoteData';
import ScoreEntryItem from './ScoreEntryItem';

interface TelevoteScoreboardProps {
    data: NormalizedScoreEntry[];
    theme: ScoreboardTheme;
    televoteSums: CountryTelevoteSum[];
    currentRevealCountry: string;
    revealedCountries: string[];
    title?: string;
    showFlags?: boolean;
    variant?: 'default' | 'compact';
}

const TelevoteScoreboard: React.FC<TelevoteScoreboardProps> = ({
                                                                   data,
                                                                   theme,
                                                                   televoteSums,
                                                                   currentRevealCountry,
                                                                   revealedCountries,
                                                                   title,
                                                                   showFlags = true,
                                                                   variant = 'default',
                                                               }) => {
    const midpoint = Math.ceil(data.length / 2);
    const leftColumn = data.slice(0, midpoint);
    const rightColumn = data.slice(midpoint);

    const hasWindowFrame = !!theme.assets.windowFrame;

    const isCountryRevealed = (country: string): boolean => {
        return revealedCountries.some(
            (c) => c.toLowerCase() === country.toLowerCase()
        );
    };

    const windowStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.padding,
        backgroundClip: 'padding-box',
        borderRadius: theme.spacing.borderRadius,
        backgroundImage: hasWindowFrame ? `url(${theme.assets.windowFrame})` : undefined,
        backgroundColor: hasWindowFrame ? 'white' : theme.colors.window,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        width: '90%',
        height: '90%',
        position: 'relative',
    };

    const titleStyle: React.CSSProperties = {
        margin: 0,
        fontSize: '14px',
        lineHeight: 1.375,
        position: 'absolute',
        top: '3%',
        left: '6%',
        fontFamily: theme.typography.fontCountry,
        fontWeight: 700,
        textTransform: 'capitalize',
        color: 'transparent',
        textShadow: '0 0 1.75px rgba(255, 255, 255, 0.98)',
    };

    const gridStyle: React.CSSProperties = {
        display: 'flex',
        gap: theme.spacing.columnGap,
        marginTop: '55px',
    };

    const columnStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.itemGap,
    };

    const renderEntry = (entry: NormalizedScoreEntry, index: number) => {
        const revealed = isCountryRevealed(entry.country);

        return (
            <ScoreEntryItem
                key={`${entry.country}-${index}`}
                entry={entry}
                theme={theme}
                showFlags={showFlags}
                variant={variant}
                isTelevote={revealed}
                isJury={false}
            />
        );
    };

    return (
        <div style={windowStyle}>
            <div style={gridStyle}>
                <div style={columnStyle}>
                    {leftColumn.map(renderEntry)}
                </div>
                <div style={columnStyle}>
                    {rightColumn.map((entry, index) => renderEntry(entry, index + midpoint))}
                </div>
            </div>
        </div>
    );
};

export default TelevoteScoreboard;