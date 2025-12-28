import React, { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useConfig from '../hooks/useConfig';
import useFetch from '../hooks/useFetch';
import { useTheme } from '../context/ThemeContext';
import { useLayout, parseLayoutFromURL } from '../context/LayoutContext';
import { toast } from 'react-toastify';
import { NormalizedScoreEntry, normalizeScoreData, ScoreEntry } from '../types/ScoreEntry';
import { VotingPhase, getVotingSystemById } from '../types/VotingSystem';
import ScoreboardRenderer from './ScoreboardRenderer';
import ScoreboardWithVoter from './ScoreboardWithVoter';

const ScoreboardPage: React.FC = () => {
  const { boardNumber } = useParams<{ boardNumber?: string }>();
  const [searchParams] = useSearchParams();
  const config = useConfig();
  const { theme } = useTheme();
  const { settings } = useLayout();

  const urlLayoutSettings = parseLayoutFromURL(searchParams);
  const finalSettings = { ...settings, ...urlLayoutSettings };

  const phaseId = searchParams.get('phase') || 'main';
  const votingSystemId = searchParams.get('system') || config.defaultVotingSystem || 'modern';
  const votingSystem = getVotingSystemById(votingSystemId as 'modern' | 'classic');
  const phase: VotingPhase | undefined = votingSystem.phases.find((p) => p.id === phaseId);

  const scoreboardUrl = boardNumber
      ? `${config.scoreboardsDirectory}/scoreboard${boardNumber}.json`
      : '';

  const { data: rawData, loading, error } = useFetch<ScoreEntry[]>(scoreboardUrl);

  const scoreboardData: NormalizedScoreEntry[] | null = useMemo(() => {
    if (!rawData) return null;
    return normalizeScoreData(rawData);
  }, [rawData]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load scoreboard: ${error}`);
    }
  }, [error]);

  const voterEntry = scoreboardData?.find((entry) => entry.isVoter);
  const voterCountry = voterEntry?.country || 'Unknown';

  const countryName = useMemo(
      () =>
          boardNumber
              ? config.countryList[parseInt(boardNumber) - 1] || 'Unknown Country'
              : 'Unknown Country',
      [config.countryList, boardNumber]
  );

  const previewBackgroundStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundImage: theme.assets.backgroundImage
        ? `url(${theme.assets.backgroundImage})`
        : undefined,
    backgroundColor: theme.colors.background,
    backgroundSize: 'auto 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  if (!boardNumber) {
    return (
        <div className="scoreboard-page">
          <p>Invalid scoreboard number.</p>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="scoreboard-page">
          <div>Loading...</div>
        </div>
    );
  }

  if (error || !scoreboardData || scoreboardData.length === 0) {
    return (
        <div className="scoreboard-page">
          <p>Error loading data.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );
  }

  return (
      <div className="scoreboard-page" style={previewBackgroundStyle}>
        {finalSettings.showVoterPanel ? (
            <ScoreboardWithVoter
                data={scoreboardData}
                theme={theme}
                title={countryName}
                voterCountry={voterCountry}
                currentVoteNumber={parseInt(boardNumber)}
                totalVoters={config.countryList.length}
                panelPosition={finalSettings.panelPosition}
                showFlags={finalSettings.showFlags}
                variant={finalSettings.variant}
                phase={phase}
            />
        ) : (
            <ScoreboardRenderer
                data={scoreboardData}
                theme={theme}
                title={countryName}
                showFlags={finalSettings.showFlags}
                variant={finalSettings.variant}
                phase={phase}
            />
        )}
      </div>
  );
};

export default ScoreboardPage;