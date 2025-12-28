import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScoreEntryVariant } from '../components/ScoreEntryItem';

export interface LayoutSettings {
    showVoterPanel: boolean;
    panelPosition: 'left' | 'right';
    variant: ScoreEntryVariant;
    showFlags: boolean;
}

interface LayoutContextValue {
    settings: LayoutSettings;
    updateSettings: (updates: Partial<LayoutSettings>) => void;
}

const defaultSettings: LayoutSettings = {
    showVoterPanel: true,
    panelPosition: 'left',
    variant: 'compact',
    showFlags: true,
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

interface LayoutProviderProps {
    children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<LayoutSettings>(() => {
        const saved = localStorage.getItem('layout-settings');
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            } catch {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('layout-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (updates: Partial<LayoutSettings>) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    };

    return (
        <LayoutContext.Provider value={{ settings, updateSettings }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = (): LayoutContextValue => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};

export const parseLayoutFromURL = (searchParams: URLSearchParams): Partial<LayoutSettings> => {
    const result: Partial<LayoutSettings> = {};

    if (searchParams.has('voterPanel')) {
        result.showVoterPanel = searchParams.get('voterPanel') === 'true';
    }
    if (searchParams.has('panelPosition')) {
        const pos = searchParams.get('panelPosition');
        if (pos === 'left' || pos === 'right') {
            result.panelPosition = pos;
        }
    }
    if (searchParams.has('variant')) {
        const v = searchParams.get('variant');
        if (v === 'default' || v === 'compact') {
            result.variant = v;
        }
    }
    if (searchParams.has('showFlags')) {
        result.showFlags = searchParams.get('showFlags') === 'true';
    }

    return result;
};

export const buildLayoutURLParams = (settings: LayoutSettings): string => {
    const params = new URLSearchParams();
    params.set('voterPanel', String(settings.showVoterPanel));
    params.set('panelPosition', settings.panelPosition);
    params.set('variant', settings.variant);
    params.set('showFlags', String(settings.showFlags));
    return params.toString();
};