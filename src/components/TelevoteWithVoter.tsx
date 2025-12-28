import React from 'react';
import { NormalizedScoreEntry } from '../types/ScoreEntry';
import { ScoreboardTheme } from '../themes/types';
import { CountryTelevoteSum } from '../types/TelevoteData';
import TelevoteScoreboard from './TelevoteScoreboard';
import VoterPanel from './VoterPanel';
import { ScoreEntryVariant } from './ScoreEntryItem';

interface TelevoteWithVoterProps {
    data: NormalizedScoreEntry[];
    theme: ScoreboardTheme;
    televoteSums: CountryTelevoteSum[];
    currentRevealCountry: string;
    currentRevealIndex: number;
    totalCountries: number;
    revealOrder: string[];
    title?: string;
    panelPosition?: 'left' | 'right';
    showFlags?: boolean;
    variant?: ScoreEntryVariant;
}

const TelevoteWithVoter: React.FC<TelevoteWithVoterProps> = ({
                                                                 data,
                                                                 theme,
                                                                 televoteSums,
                                                                 currentRevealCountry,
                                                                 currentRevealIndex,
                                                                 totalCountries,
                                                                 revealOrder,
                                                                 title,
                                                                 panelPosition = 'left',
                                                                 showFlags = true,
                                                                 variant = 'default',
                                                             }) => {
    const revealedCountries = revealOrder.slice(0, currentRevealIndex + 1);

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: panelPosition === 'left' ? 'row' : 'row-reverse',
        width: '100%',
        height: '100%',
        position: 'relative',
    };

    const scoreboardWrapperStyle: React.CSSProperties = {
        flex: 1,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <div style={containerStyle}>
            <VoterPanel
                countryName={currentRevealCountry}
                currentVoteNumber={currentRevealIndex + 1}
                totalVoters={totalCountries}
                theme={theme}
                position={panelPosition}
                isTelevote={true}
            />
            <div style={scoreboardWrapperStyle}>
                <TelevoteScoreboard
                    data={data}
                    theme={theme}
                    televoteSums={televoteSums}
                    currentRevealCountry={currentRevealCountry}
                    revealedCountries={revealedCountries}
                    title={title}
                    showFlags={showFlags}
                    variant={variant}
                />
            </div>
        </div>
    );
};

export default TelevoteWithVoter;