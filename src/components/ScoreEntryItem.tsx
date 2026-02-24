import React from 'react';
import { NormalizedScoreEntry } from '../types/ScoreEntry';
import { ScoreboardTheme } from '../themes/types';
import { useImageLoader, formatCountryForPath } from '../hooks/useImageLoader';

export type ScoreEntryVariant = 'default' | 'compact';

interface ScoreEntryItemProps {
    entry: NormalizedScoreEntry;
    theme: ScoreboardTheme;
    showFlags?: boolean;
    variant?: ScoreEntryVariant;
    isTelevote?: boolean;
    isJury?: boolean;
    hasReceivedTelevote?: boolean;
}

const DEFAULT_POINT_COLORS: Record<number, string> = {
    1: '#82b7ca',
    2: '#6fa8dc',
    3: '#72a175',
    4: '#93c47d',
    5: '#c26c02',
    6: '#e69138',
    7: '#ff0000',
    8: '#cc0000',
    10: '#9900ff',
    12: '#ff00ff',
};

const DEFAULT_TELEVOTE_COLOR = '#DAA520';

const ScoreEntryItem: React.FC<ScoreEntryItemProps> = ({
                                                           entry,
                                                           theme,
                                                           showFlags = true,
                                                           variant = 'default',
                                                           isTelevote = false,
                                                           isJury = false,
                                                           hasReceivedTelevote = false,
                                                       }) => {
    const shouldLoadFlag = showFlags && variant !== 'compact';
    const countryKey = formatCountryForPath(entry.country);
    const flagSrc = useImageLoader(shouldLoadFlag ? `/flags/${countryKey}` : null);

    const hasPoints = entry.pointsGained > 0;
    const isHighlighted = entry.pointsGained >= 8;
    const gotPoints = entry.pointsGained >= 1 && entry.pointsGained <= 7;

    const showGoldenHighlight = isTelevote && (hasPoints || hasReceivedTelevote);

    const getPointColor = (points: number): string => {
        const themeColors: Record<number, string | undefined> = {
            1: theme.colors.points1,
            2: theme.colors.points2,
            3: theme.colors.points3,
            4: theme.colors.points4,
            5: theme.colors.points5,
            6: theme.colors.points6,
            7: theme.colors.points7,
            8: theme.colors.points8,
            10: theme.colors.points10,
            12: theme.colors.points12,
        };

        return themeColors[points] || DEFAULT_POINT_COLORS[points] || theme.colors.pointsGainedBg || '#ff0000';
    };

    const getTelevoteColor = (): string => {
        return theme.colors.televoteHighlight || DEFAULT_TELEVOTE_COLOR;
    };

    const getTelevoteTextColor = (): string => {
        return theme.colors.televoteHighlightText || '#ffffff';
    };

    const getPointsBubbleColor = (): string => {
        if (isTelevote && hasPoints) {
            return getTelevoteColor();
        }

        if (isJury && hasPoints) {
            return getPointColor(entry.pointsGained);
        }

        if (hasPoints) {
            return getPointColor(entry.pointsGained);
        }

        return theme.colors.pointsGainedBg || '#ff0000';
    };

    const getPointsBubbleTextColor = (): string => {
        if (isTelevote && hasPoints) {
            return getTelevoteTextColor();
        }

        if ((isJury || hasPoints) && theme.colors.pointsBubbleText) {
            return theme.colors.pointsBubbleText;
        }

        return theme.colors.pointsGained || '#ffffff';
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        height: theme.spacing.itemHeight,
        transition: theme.effects.itemHover ? 'transform 0.15s ease' : 'none',
        width: '100%',
    };

    const flagContainerStyle: React.CSSProperties = {
        width: '32px',
        minWidth: '32px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const countryStyle: React.CSSProperties = {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: theme.typography.fontCountry,
        fontSize: theme.typography.countryNameSize,
        fontWeight: 700,
        color: theme.colors.countryName,
        backgroundColor: theme.colors.countryNameBg,
        padding: '6px 7px',
        height: '100%',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    };

    const pointsOverallStyle: React.CSSProperties = {
        fontFamily: theme.typography.fontPoints,
        fontSize: theme.typography.pointsSize,
        fontWeight: 700,
        width: '50px',
        minWidth: '50px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '3px',
        margin: 0,
    };

    const getPointsOverallStyle = (): React.CSSProperties => {
        const hasReceivedPoints = isHighlighted || gotPoints;

        if (showGoldenHighlight) {
            return {
                ...pointsOverallStyle,
                color: getTelevoteTextColor(),
                backgroundColor: getTelevoteColor(),
                border: `1px solid ${getTelevoteColor()}`,
                borderRadius: theme.spacing.borderRadius,
            };
        }

        if (hasReceivedPoints) {
            return {
                ...pointsOverallStyle,
                color: theme.colors.pointsHighlightText || '#ffffff',
                backgroundColor: theme.colors.pointsHighlightBg,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.spacing.borderRadius,
            };
        }

        return {
            ...pointsOverallStyle,
            color: theme.colors.pointsOverall,
            backgroundColor: theme.colors.pointsOverallBg,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.spacing.borderRadius,
        };
    };

    const pointsGainedContainerStyle: React.CSSProperties = {
        width: '50px',
        minWidth: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const getPointsGainedStyle = (): React.CSSProperties => {
        const bubbleColor = getPointsBubbleColor();
        const bubbleTextColor = getPointsBubbleTextColor();
        const hasBubbleBg = !!theme.colors.pointsGainedBg || isJury || isTelevote || hasPoints;
        const isLargeNumber = entry.pointsGained >= 100;
        const isMediumNumber = entry.pointsGained >= 10;

        let fontSize = theme.typography.pointsBubbleSize || theme.typography.pointsSize;
        if (isLargeNumber) {
            fontSize = `calc(${fontSize} * 0.65)`;
        } else if (isMediumNumber) {
            fontSize = `calc(${fontSize} * 0.85)`;
        }

        return {
            fontFamily: theme.typography.fontPointsBubble || theme.typography.fontPoints,
            fontSize,
            fontWeight: 400,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
            color: bubbleTextColor,
            backgroundColor: hasPoints ? bubbleColor : 'transparent',
            borderRadius: hasBubbleBg ? '50%' : theme.spacing.borderRadius,
            width: '100%',
            height: '100%',
            minWidth: '1.75rem',
            aspectRatio: '1/1',
            padding: 0,
        };
    };

    const flagStyle: React.CSSProperties = {
        width: '32px',
        height: '24px',
        objectFit: 'cover',
    };

    if (variant === 'compact') {
        return (
            <div style={containerStyle}>
                <span style={getPointsOverallStyle()}>{entry.pointsOverall}</span>
                <span style={countryStyle}>{entry.country}</span>
                <div style={pointsGainedContainerStyle}>
                    {hasPoints && (
                        <span style={getPointsGainedStyle()}>{entry.pointsGained}</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={flagContainerStyle}>
                {showFlags && flagSrc && (
                    <img src={flagSrc} alt="" style={flagStyle} />
                )}
            </div>
            <p style={countryStyle}>{entry.country}</p>
            <p style={getPointsOverallStyle()}>{entry.pointsOverall}</p>
            <div style={pointsGainedContainerStyle}>
                {hasPoints && (
                    <p style={getPointsGainedStyle()}>{entry.pointsGained}</p>
                )}
            </div>
        </div>
    );
};

export default ScoreEntryItem;