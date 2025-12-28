import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Config {
  defaultTheme: string;
  defaultVotingSystem: string;
}

const defaultConfig: Config = {
  defaultTheme: 'retro',
  defaultVotingSystem: 'modern',
};

const ConfigContext = createContext<Config>(defaultConfig);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<Config>(defaultConfig);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.json');
        if (response.ok) {
          const data = await response.json();
          setConfig({ ...defaultConfig, ...data });
        }
      } catch (err) {
        console.warn('Could not load config.json, using defaults');
      }
    };

    loadConfig();
  }, []);

  return (
      <ConfigContext.Provider value={config}>
        {children}
      </ConfigContext.Provider>
  );
};

export const useConfig = (): Config => {
  return useContext(ConfigContext);
};

export default ConfigContext;