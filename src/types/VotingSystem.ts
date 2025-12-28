export type VotingSystemType = 'modern' | 'classic';

export interface VotingSystemConfig {
    id: VotingSystemType;
    name: string;
    description: string;
    phases: VotingPhase[];
}

export interface VotingPhase {
    id: string;
    name: string;
    filePrefix: string;
}

export const modernVotingSystem: VotingSystemConfig = {
    id: 'modern',
    name: 'Modern Eurovision',
    description: 'Each country reveals all points (1-12)',
    phases: [
        {
            id: 'main',
            name: 'Voting',
            filePrefix: 'scoreboard',
        },
    ],
};

export const classicVotingSystem: VotingSystemConfig = {
    id: 'classic',
    name: 'Classic Eurovision',
    description: 'Jury points (1, 3, 5, 7), then televote reveal (bottom to top)',
    phases: [
        {
            id: 'jury',
            name: 'Jury Vote',
            filePrefix: 'jury_',
        },
        {
            id: 'televote',
            name: 'Televote Reveal',
            filePrefix: 'televote_',
        },
    ],
};

export const votingSystems: VotingSystemConfig[] = [
    modernVotingSystem,
    classicVotingSystem,
];

export const getVotingSystemById = (id: VotingSystemType): VotingSystemConfig => {
    return votingSystems.find((s) => s.id === id) || modernVotingSystem;
};