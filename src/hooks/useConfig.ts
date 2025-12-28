// src/hooks/useConfig.ts

import { useContext } from 'react';
import { ConfigContext } from '../ConfigContext';
import { Config } from '../types/Config';

const useConfig = (): Config => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export default useConfig;
