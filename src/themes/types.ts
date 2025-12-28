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
    pointsGainedBg?: string;
    border: string;
    accent: string;
    first: string;
    second: string;
    third: string;
    gotPoints: string;
    imagePlaceholderBg?: string;
    imagePlaceholderText?: string;
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