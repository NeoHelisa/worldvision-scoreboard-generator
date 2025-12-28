import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    VotingSystemConfig,
    VotingSystemType,
    votingSystems,
    getVotingSystemById,
} from '../types/VotingSystem';

interface VotingSystemContextValue {
    votingSystem: VotingSystemConfig;
    setVotingSystem: (id: VotingSystemType) => void;
    availableSystems: VotingSystemConfig[];
}

const VotingSystemContext = createContext<VotingSystemContextValue | null>(null);

interface VotingSystemProviderProps {
    children: ReactNode;
}

export const VotingSystemProvider: React.FC<VotingSystemProviderProps> = ({ children }) => {
    const [votingSystem, setVotingSystemState] = useState<VotingSystemConfig>(() => {
        const saved = localStorage.getItem('voting-system');
        if (saved) {
            return getVotingSystemById(saved as VotingSystemType);
        }
        return getVotingSystemById('modern');
    });

    useEffect(() => {
        localStorage.setItem('voting-system', votingSystem.id);
    }, [votingSystem]);

    const setVotingSystem = (id: VotingSystemType) => {
        const system = getVotingSystemById(id);
        setVotingSystemState(system);
    };

    return (
        <VotingSystemContext.Provider
            value={{
                votingSystem,
                setVotingSystem,
                availableSystems: votingSystems,
            }}
        >
            {children}
        </VotingSystemContext.Provider>
    );
};

export const useVotingSystem = (): VotingSystemContextValue => {
    const context = useContext(VotingSystemContext);
    if (!context) {
        throw new Error('useVotingSystem must be used within a VotingSystemProvider');
    }
    return context;
};