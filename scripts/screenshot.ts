import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';

interface LayoutSettings {
    showVoterPanel: boolean;
    panelPosition: 'left' | 'right';
    variant: 'default' | 'compact';
    showFlags: boolean;
}

interface Config {
    screenshotCount: number;
    scoreboardRangeStart: number;
    scoreboardRangeEnd: number;
    serverUrl: string;
    viewport: { width: number; height: number };
    screenshotsDirectory: string;
    scoreboardsDirectory: string;
    defaultVotingSystem?: string;
    defaultTheme?: string;
    layoutSettings?: LayoutSettings;
}

const defaultLayoutSettings: LayoutSettings = {
    showVoterPanel: true,
    panelPosition: 'left',
    variant: 'compact',
    showFlags: true,
};

const buildLayoutParams = (settings: LayoutSettings): string => {
    const params = new URLSearchParams();
    params.set('voterPanel', String(settings.showVoterPanel));
    params.set('panelPosition', settings.panelPosition);
    params.set('variant', settings.variant);
    params.set('showFlags', String(settings.showFlags));
    return params.toString();
};

interface VotingPhase {
    id: string;
    name: string;
    pointsToShow: number[];
    orderBy: 'voter' | 'placement-asc' | 'placement-desc';
    aggregatePoints?: boolean;
}

interface VotingSystemConfig {
    id: string;
    phases: VotingPhase[];
}

interface Config {
    screenshotCount: number;
    scoreboardRangeStart: number;
    scoreboardRangeEnd: number;
    serverUrl: string;
    viewport: {
        width: number;
        height: number;
    };
    screenshotsDirectory: string;
    scoreboardsDirectory: string;
    defaultVotingSystem?: string;
    countryList: string[];
}

interface ScoreEntry {
    country: string;
    placement: string;
    pointsGained: string;
}

const TELEVOTE_POINTS = [2, 4, 6, 8, 10, 12];

const votingSystems: Record<string, VotingSystemConfig> = {
    modern: {
        id: 'modern',
        phases: [
            { id: 'main', name: 'Voting', pointsToShow: [1, 2, 3, 4, 5, 6, 7, 8, 10, 12], orderBy: 'voter' },
        ],
    },
    classic: {
        id: 'classic',
        phases: [
            { id: 'jury', name: 'Jury Vote', pointsToShow: [1, 3, 5, 7], orderBy: 'voter' },
            { id: 'televote', name: 'Televote Reveal', pointsToShow: [2, 4, 6, 8, 10, 12], orderBy: 'placement-desc', aggregatePoints: true },
        ],
    },
};

const readConfig = (): Config => {
    const configPath = path.resolve('public', 'config.json');
    try {
        const rawData: string = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading config.json:', error);
        process.exit(1);
    }
};

const aggregateTelevotes = (scoreboardsDir: string, totalScoreboards: number): Record<string, { sum: number; placement: number }> => {
    const televoteSums: Record<string, { sum: number; placement: number }> = {};

    for (let i = 1; i <= totalScoreboards; i++) {
        const filePath = path.join(scoreboardsDir, `scoreboard${i}.json`);
        if (!fs.existsSync(filePath)) continue;

        try {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            const entries: ScoreEntry[] = JSON.parse(rawData);

            entries.forEach((entry) => {
                const points = parseInt(entry.pointsGained, 10);
                const placement = parseInt(entry.placement, 10);

                if (!televoteSums[entry.country]) {
                    televoteSums[entry.country] = { sum: 0, placement };
                }

                if (TELEVOTE_POINTS.includes(points)) {
                    televoteSums[entry.country].sum += points;
                }

                televoteSums[entry.country].placement = placement;
            });
        } catch (err) {
            console.error(`Failed to read scoreboard${i}.json`, err);
        }
    }

    return televoteSums;
};

const getTelevoteRevealOrder = (televoteSums: Record<string, { sum: number; placement: number }>): string[] => {
    return Object.entries(televoteSums)
        .sort(([, a], [, b]) => b.placement - a.placement)
        .map(([country]) => country);
};

const config: Config = readConfig();
const {
    screenshotCount,
    scoreboardRangeStart,
    scoreboardRangeEnd,
    serverUrl,
    screenshotsDirectory,
    scoreboardsDirectory,
    defaultVotingSystem = 'modern',
} = config;

const votingSystem = votingSystems[defaultVotingSystem] || votingSystems.modern;

if (!fs.existsSync(screenshotsDirectory)) {
    fs.mkdirSync(screenshotsDirectory, { recursive: true });
    console.info(`Created screenshots directory at ${screenshotsDirectory}`);
}

const takeScreenshot = async (
    browser: Browser,
    baseUrl: string,
    filename: string,
    layoutSettings: LayoutSettings
): Promise<void> => {
    const page: Page = await browser.newPage();
    await page.setViewport({
        width: config.viewport.width,
        height: config.viewport.height,
        deviceScaleFactor: 1,
    });

    try {
        const layoutParams = buildLayoutParams(layoutSettings);
        const separator = baseUrl.includes('?') ? '&' : '?';
        const url = `${baseUrl}${separator}${layoutParams}`;

        console.log(`Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        const filePath = path.join(screenshotsDirectory, filename);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`${filename} saved successfully.`);
    } catch (error) {
        console.error(`Error capturing ${filename}:`, error);
    } finally {
        await page.close();
    }
};

const generateScreenshots = async (): Promise<void> => {
    let browser: Browser;
    const layoutSettings = config.layoutSettings || defaultLayoutSettings;
    try {
        browser = await puppeteer.launch({
            executablePath: await puppeteer.executablePath('chrome'),
        });
        console.info('Browser launched successfully.');
        console.info(`Using voting system: ${votingSystem.id}`);
    } catch (error) {
        console.error('Failed to launch browser:', error);
        process.exit(1);
    }

    for (let phaseIndex = 0; phaseIndex < votingSystem.phases.length; phaseIndex++) {
        const phase = votingSystem.phases[phaseIndex];
        console.info(`\n--- Phase ${phaseIndex + 1}: ${phase.name} ---`);
        console.info(`Points shown: ${phase.pointsToShow.join(', ')}`);
        console.info(`Order: ${phase.orderBy}`);
        console.info(`Aggregate: ${phase.aggregatePoints || false}`);

        if (phase.aggregatePoints && phase.orderBy === 'placement-desc') {
            const publicScoreboardsDir = path.resolve('public', scoreboardsDirectory.replace(/^\//, ''));
            const televoteSums = aggregateTelevotes(publicScoreboardsDir, screenshotCount);
            const revealOrder = getTelevoteRevealOrder(televoteSums);

            console.info(`Televote reveal order (${revealOrder.length} countries):`);
            revealOrder.forEach((country, idx) => {
                console.info(`  ${idx + 1}. ${country} (sum: ${televoteSums[country].sum})`);
            });

            for (let i = 0; i < revealOrder.length; i++) {
                const country = revealOrder[i];
                const url = `${serverUrl}/televote?country=${encodeURIComponent(country)}&index=${i}`;
                const filename = `phase${phaseIndex + 1}_televote_${i + 1}_${country.replace(/\s+/g, '_')}.png`;
                await takeScreenshot(browser, url, filename, layoutSettings);
            }
        } else {
            for (let i = scoreboardRangeStart; i <= Math.min(screenshotCount, scoreboardRangeEnd); i++) {
                const url = `${serverUrl}/scoreboard/${i}?phase=${phase.id}`;
                const filename = votingSystem.phases.length > 1
                    ? `phase${phaseIndex + 1}_${phase.id}_scoreboard${i}.png`
                    : `scoreboard${i}.png`;
                await takeScreenshot(browser, url, filename, layoutSettings);
            }
        }
    }

    try {
        await browser.close();
        console.info('\nBrowser closed successfully.');
    } catch (error) {
        console.error('Error closing browser:', error);
    }

    console.info('\n=== Screenshot Generation Complete ===');
};

generateScreenshots().catch((error: Error) => {
    console.error('Unexpected error during screenshot generation:', error);
    process.exit(1);
});