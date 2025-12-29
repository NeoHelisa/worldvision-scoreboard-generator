import React from 'react';
import { NormalizedScoreEntry, getScoreboardEntries } from '../types/ScoreEntry';
import { ScoreboardTheme } from '../themes/types';
import ScoreEntryItem, { ScoreEntryVariant } from './ScoreEntryItem';

interface ScoreboardRendererProps {
    data: NormalizedScoreEntry[];
    theme: ScoreboardTheme;
    title?: string;
    orderLabel?: string;
    showFlags?: boolean;
    standalone?: boolean;
    variant?: ScoreEntryVariant;
    isTelevote?: boolean;
    isJury?: boolean;
}

const ScoreboardRenderer: React.FC<ScoreboardRendererProps> = ({
                                                                   data,
                                                                   theme,
                                                                   title,
                                                                   orderLabel,
                                                                   showFlags = true,
                                                                   standalone = true,
                                                                   variant = 'default',
                                                                   isTelevote = false,
                                                                   isJury = false,
                                                               }) => {
    const scoreboardData = getScoreboardEntries(data);

    const midpoint = Math.ceil(scoreboardData.length / 2);
    const leftColumn = scoreboardData.slice(0, midpoint);
    const rightColumn = scoreboardData.slice(midpoint);

    const hasWindowFrame = !!theme.assets.windowFrame;

    const windowStyle: React.CSSProperties = standalone
        ? {
            position: 'absolute',
            right: '50%',
            top: '50%',
            transform: 'translateY(-50%) translateX(50%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.padding,
            backgroundClip: 'padding-box',
            borderRadius: theme.spacing.borderRadius,
            backgroundImage: hasWindowFrame
                ? `url(${theme.assets.windowFrame})`
                : undefined,
            backgroundColor: hasWindowFrame ? 'white' : theme.colors.window,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            width: '68%',
            height: '81%',
        }
        : {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.padding,
            backgroundClip: 'padding-box',
            borderRadius: theme.spacing.borderRadius,
            backgroundImage: hasWindowFrame
                ? `url(${theme.assets.windowFrame})`
                : undefined,
            backgroundColor: hasWindowFrame ? 'white' : theme.colors.window,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            width: '90%',
            height: '90%',
            position: 'relative',
        };

    const gridStyle: React.CSSProperties = {
        display: 'flex',
        gap: theme.spacing.columnGap,
        marginTop: '55px',
        width: '100%',
        justifyContent: 'center',
    };

    const columnStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.itemGap,
        width: '45%',
        minWidth: '300px',
        maxWidth: '400px',
    };

    const orderStyle: React.CSSProperties = {
        position: 'absolute',
        margin: 0,
        fontSize: '14px',
        lineHeight: 1.5,
        bottom: '8px',
        right: '1.75rem',
        color: 'transparent',
        fontFamily: theme.typography.fontCountry,
        textShadow: '0 0 1.65px rgba(0, 0, 0, 0.98)',
    };

    return (
        <div style={windowStyle}>
            <div style={gridStyle}>
                <div style={columnStyle}>
                    {leftColumn.map((entry, index) => (
                        <ScoreEntryItem
                            key={`${entry.country}-${index}`}
                            entry={entry}
                            theme={theme}
                            showFlags={showFlags}
                            variant={variant}
                            isTelevote={isTelevote}
                            isJury={isJury}
                        />
                    ))}
                </div>
                <div style={columnStyle}>
                    {rightColumn.map((entry, index) => (
                        <ScoreEntryItem
                            key={`${entry.country}-${index}`}
                            entry={entry}
                            theme={theme}
                            showFlags={showFlags}
                            variant={variant}
                            isTelevote={isTelevote}
                            isJury={isJury}
                        />
                    ))}
                </div>
            </div>

            {orderLabel && <span style={orderStyle}>{orderLabel}</span>}
        </div>
    );
};

export default ScoreboardRenderer;