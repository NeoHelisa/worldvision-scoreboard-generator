import { VotingSystemType } from './VotingSystem';

export interface Viewport {
  width: number;
  height: number;
}

export interface Config {
  countryList: string[];
  screenshotCount: number;
  scoreboardRangeStart: number;
  scoreboardRangeEnd: number;
  serverUrl: string;
  viewport: Viewport;
  scoreboardsDirectory: string;
  screenshotsDirectory: string;
  showScoreboardImage: boolean;
  defaultTheme?: string;
  defaultVotingSystem?: VotingSystemType;
}