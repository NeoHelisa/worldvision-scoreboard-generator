import React from 'react';
import { ScoreboardTheme } from '../themes/types';
import { useImageLoader, formatCountryForPath } from '../hooks/useImageLoader';

interface VoterPanelProps {
    countryName: string;
    currentVoteNumber: number;
    totalVoters: number;
    theme: ScoreboardTheme;
    position?: 'left' | 'right';
    isTelevote?: boolean;
    showImages?: boolean;
}

const VoterPanel: React.FC<VoterPanelProps> = ({
                                                   countryName,
                                                   currentVoteNumber,
                                                   totalVoters,
                                                   theme,
                                                   position = 'left',
                                                   isTelevote = false,
                                                   showImages = true,
                                               }) => {
    const countryKey = formatCountryForPath(countryName);
    const voterImageSrc = useImageLoader(showImages ? `/voters_images/${countryKey}` : null);
    const artistImageSrc = useImageLoader(showImages ? `/artists_images/${countryKey}` : null);

    const isTransparent = theme.colors.backgroundSecondary === 'transparent';
    const hideImages = !showImages || (!voterImageSrc && !artistImageSrc);

    const extractFontStyle = (fontString: string): { fontFamily: string; fontStyle: 'italic' | 'normal' } => {
        const isItalic = fontString.toLowerCase().startsWith('italic ');
        const fontFamily = isItalic ? fontString.replace(/^italic\s+/i, '') : fontString;
        return {
            fontFamily,
            fontStyle: isItalic ? 'italic' : 'normal',
        };
    };

    const voterCountryFont = extractFontStyle(theme.typography.fontVoterCountry || theme.typography.fontCountry);
    const voterLabelFont = extractFontStyle(theme.typography.fontVoterLabel || theme.typography.fontPrimary);
    const voteCounterFont = extractFontStyle(theme.typography.fontPoints);

    const panelWrapperStyle: React.CSSProperties = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
    };

    const borderLineStyle: React.CSSProperties = {
        position: 'absolute',
        top: '10%',
        height: '80%',
        width: '2px',
        backgroundColor: theme.colors.border || '#000000',
        ...(position === 'left' ? { right: 0 } : { left: 0 }),
    };

    const panelStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: hideImages ? '280px' : '350px',
        background: isTransparent
            ? 'transparent'
            : 'linear-gradient(130deg, rgba(0, 0, 0, 0.90), rgba(0, 0, 0, 0.5))',
        backdropFilter: isTransparent ? 'none' : 'blur(10px)',
        backgroundColor: theme.colors.backgroundSecondary,
        borderLeft: isTransparent ? 'none' : `3px solid ${theme.colors.accent}`,
        borderRight: isTransparent ? 'none' : `3px solid ${theme.colors.accent}`,
        boxShadow: theme.effects.glow ? `0 0 15px ${theme.effects.glowColor}` : 'none',
        padding: '30px 20px',
        gap: hideImages ? '15px' : '20px',
    };

    const countryNameStyle: React.CSSProperties = {
        fontSize: theme.typography.voterCountrySize || '2rem',
        fontWeight: 400,
        fontFamily: voterCountryFont.fontFamily,
        fontStyle: voterCountryFont.fontStyle,
        color: theme.colors.text,
        textTransform: 'lowercase',
        textAlign: 'center',
        margin: 0,
    };

    const labelStyle: React.CSSProperties = {
        fontSize: theme.typography.voterLabelSize || '1.5rem',
        fontWeight: 400,
        color: theme.colors.text,
        textTransform: 'lowercase',
        letterSpacing: '2px',
        fontFamily: voterLabelFont.fontFamily,
        fontStyle: voterLabelFont.fontStyle,
        textAlign: 'center',
    };

    const imageContainerStyle: React.CSSProperties = {
        width: '200px',
        height: '200px',
        borderRadius: theme.spacing.borderRadius,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '-20px 0',
    };

    const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    };

    const placeholderStyle: React.CSSProperties = {
        fontFamily: theme.typography.fontPrimary,
        fontSize: '5rem',
        fontWeight: 600,
        fontStyle: 'italic',
        color: theme.colors.imagePlaceholderText || '#000000',
        userSelect: 'none',
    };

    const voteCountStyle: React.CSSProperties = {
        fontSize: theme.typography.voteCounterSize || '1.5rem',
        fontWeight: 700,
        color: theme.colors.text,
        fontFamily: voteCounterFont.fontFamily,
        fontStyle: voteCounterFont.fontStyle,
        letterSpacing: '-1px',
    };

    const showVoterPlaceholder = isTelevote || !voterImageSrc;
    const labelText = isTelevote ? 'Now Receiving Points' : 'Now Voting';

    return (
        <div style={panelWrapperStyle}>
            <div style={panelStyle}>
                <h2 style={countryNameStyle}>{countryName}</h2>

                <span style={labelStyle}>{labelText}</span>

                {showImages && !hideImages && (
                    <>
                        <div style={imageContainerStyle}>
                            {showVoterPlaceholder ? (
                                <span style={placeholderStyle}>?</span>
                            ) : (
                                <img src={voterImageSrc} alt={`${countryName} voter`} style={imageStyle} />
                            )}
                        </div>

                        {artistImageSrc && (
                            <div style={imageContainerStyle}>
                                <img src={artistImageSrc} alt={`${countryName} artist`} style={imageStyle} />
                            </div>
                        )}
                    </>
                )}

                <span style={voteCountStyle}>
                    {currentVoteNumber} / {totalVoters}
                </span>
            </div>
            <div style={borderLineStyle} />
        </div>
    );
};

export default VoterPanel;