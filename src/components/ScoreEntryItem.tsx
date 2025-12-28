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
}

const JURY_POINT_COLORS: Record<number, string> = {
    1: '#82b7ca',
    3: '#72a175',
    5: '#c26c02',
    7: '#ff0000',
};

const GOLDEN_COLOR = '#DAA520';

const ScoreEntryItem: React.FC<ScoreEntryItemProps> = ({
                                                           entry,
                                                           theme,
                                                           showFlags = true,
                                                           variant = 'default',
                                                           isTelevote = false,
                                                           isJury = false,
                                                       }) => {
    const shouldLoadFlag = showFlags && variant !== 'compact';
    const countryKey = formatCountryForPath(entry.country);
    const flagSrc = useImageLoader(shouldLoadFlag ? `/flags/${countryKey}` : null);

    const hasPoints = entry.pointsGained > 0;
    const isHighlighted = entry.pointsGained >= 8;
    const gotPoints = entry.pointsGained >= 1 && entry.pointsGained <= 7;

    const hasReceivedTelevote = isTelevote && hasPoints;

    const getPointsBubbleColor = (): string => {
        if (isTelevote && hasPoints) {
            return GOLDEN_COLOR;
        }

        if (isJury && hasPoints) {
            return JURY_POINT_COLORS[entry.pointsGained] || theme.colors.pointsGainedBg || '#ff0000';
        }

        return theme.colors.pointsGainedBg || '#ff0000';
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
        fontFamily: theme.typography.fontCountry,
        fontSize: theme.typography.pointsSize,
        fontWeight: 700,
        width: '50px',
        minWidth: '50px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '8px 3px 3px',
        margin: 0,
    };

    const getPointsOverallStyle = (): React.CSSProperties => {
        const hasReceivedPoints = isHighlighted || gotPoints;

        if (hasReceivedTelevote) {
            return {
                ...pointsOverallStyle,
                color: '#ffffff',
                backgroundColor: GOLDEN_COLOR,
                border: `1px solid ${GOLDEN_COLOR}`,
                borderRadius: theme.spacing.borderRadius,
            };
        }

        return {
            ...pointsOverallStyle,
            color: hasReceivedPoints
                ? (theme.colors.pointsHighlightText || '#ffffff')
                : theme.colors.pointsOverall,
            backgroundColor: hasReceivedPoints
                ? theme.colors.pointsHighlightBg
                : theme.colors.pointsOverallBg,
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
        const hasBubbleBg = !!theme.colors.pointsGainedBg || isJury || isTelevote;
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
            color: '#ffffff',
            backgroundColor: hasPoints ? bubbleColor : 'transparent',
            borderRadius: hasBubbleBg ? '50%' : theme.spacing.borderRadius,
            width: '1.75rem',
            height: '1.75rem',
            minWidth: '1.75rem',
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