// src/ConfigContext.tsx

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { Config } from './types/Config';

export const ConfigContext = createContext<Config | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) {
          throw new Error('Failed to fetch config.json');
        }
        const data: Config = await response.json();
        setConfig(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading config:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  if (error || !config) {
    return <div>Error loading configuration.</div>;
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};
