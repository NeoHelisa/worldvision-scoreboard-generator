import React from 'react';
import { NormalizedScoreEntry } from '../types/ScoreEntry';
import { ScoreboardTheme } from '../themes/types';
import ScoreboardRenderer from './ScoreboardRenderer';
import VoterPanel from './VoterPanel';
import { ScoreEntryVariant } from './ScoreEntryItem';

interface ScoreboardWithVoterProps {
    data: NormalizedScoreEntry[];
    theme: ScoreboardTheme;
    title?: string;
    voterCountry: string;
    currentVoteNumber: number;
    totalVoters: number;
    panelPosition?: 'left' | 'right';
    showFlags?: boolean;
    variant?: ScoreEntryVariant;
    isTelevote?: boolean;
    isJury?: boolean;
}

const ScoreboardWithVoter: React.FC<ScoreboardWithVoterProps> = ({
                                                                     data,
                                                                     theme,
                                                                     title,
                                                                     voterCountry,
                                                                     currentVoteNumber,
                                                                     totalVoters,
                                                                     panelPosition = 'left',
                                                                     showFlags = true,
                                                                     variant = 'default',
                                                                     isTelevote = false,
                                                                     isJury = false,
                                                                 }) => {
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
                countryName={voterCountry}
                currentVoteNumber={currentVoteNumber}
                totalVoters={totalVoters}
                theme={theme}
                position={panelPosition}
                isTelevote={isTelevote}
            />
            <div style={scoreboardWrapperStyle}>
                <ScoreboardRenderer
                    data={data}
                    theme={theme}
                    title={title}
                    showFlags={showFlags}
                    standalone={false}
                    variant={variant}
                    isTelevote={isTelevote}
                    isJury={isJury}
                />
            </div>
        </div>
    );
};

export default ScoreboardWithVoter;