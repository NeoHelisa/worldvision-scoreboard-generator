export interface ThemeColors {
    background: string;
    backgroundSecondary: string;
    window: string;
    text: string;
    textSecondary: string;
    countryName: string;
    countryNameBg: string;
    pointsOverall: string;
    pointsOverallBg: string;
    pointsHighlightBg: string;
    pointsHighlightText: string;
    pointsGained: string;
    pointsGainedBg: string;
    border: string;
    accent: string;
    first?: string;
    second?: string;
    third?: string;
    gotPoints?: string;
    imagePlaceholderBg?: string;
    imagePlaceholderText?: string;
    points1?: string;
    points2?: string;
    points3?: string;
    points4?: string;
    points5?: string;
    points6?: string;
    points7?: string;
    points8?: string;
    points10?: string;
    points12?: string;
    pointsBubbleText?: string;
    televoteHighlight?: string;
    televoteHighlightText?: string;
}

export interface ThemeTypography {
    fontPrimary: string;
    fontCountry: string;
    fontPoints: string;
    fontVoterCountry?: string;
    fontVoterLabel?: string;
    fontPointsBubble?: string;
    countryNameSize: string;
    pointsSize: string;
    voterCountrySize?: string;
    voterLabelSize?: string;
    pointsBubbleSize?: string;
    voteCounterSize?: string;
}

export interface ThemeSpacing {
    itemGap: string;
    columnGap: string;
    padding: string;
    borderRadius: string;
    itemHeight: string;
}

export interface ThemeEffects {
    glow: boolean;
    glowColor: string;
    shadow: string;
    windowShadow: string;
    itemHover: boolean;
}

export interface ThemeAssets {
    backgroundImage?: string;
    windowFrame?: string;
    logo?: string;
}

export interface ScoreboardTheme {
    id: string;
    name: string;
    description?: string;
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    effects: ThemeEffects;
    assets: ThemeAssets;
}