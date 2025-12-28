import React from 'react';
import { useVotingSystem } from '../context/VotingSystemContext';
import { VotingSystemType } from '../types/VotingSystem';

const VotingSystemSelector: React.FC = () => {
    const { votingSystem, setVotingSystem, availableSystems } = useVotingSystem();

    const handleSelect = (id: VotingSystemType) => {
        setVotingSystem(id);
    };

    return (
        <div className="voting-system-selector">
            <h3>Voting System</h3>
            <div className="system-options">
                {availableSystems.map((system) => (
                    <button
                        key={system.id}
                        className={`system-btn ${votingSystem.id === system.id ? 'active' : ''}`}
                        onClick={() => handleSelect(system.id)}
                    >
                        <span className="system-name">{system.name}</span>
                        {system.description && (
                            <span className="system-description">{system.description}</span>
                        )}
                    </button>
                ))}
            </div>

            {votingSystem.phases.length > 1 && (
                <div className="phase-info">
                    <span className="phase-label">Phases:</span>
                    <div className="phase-list">
                        {votingSystem.phases.map((phase, index) => (
                            <span key={phase.id} className="phase-item">
                                {index + 1}. {phase.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VotingSystemSelector;