import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.scss';
import { ConfigProvider } from './ConfigContext';
import { ThemeProvider } from './context/ThemeContext';
import { VotingSystemProvider } from './context/VotingSystemContext';
import { LayoutProvider } from './context/LayoutContext';
import { ScoreboardDataProvider } from './context/ScoreboardDataContext';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ConfigProvider>
            <ThemeProvider>
                <VotingSystemProvider>
                    <LayoutProvider>
                        <ScoreboardDataProvider>
                            <ErrorBoundary>
                                <App />
                            </ErrorBoundary>
                        </ScoreboardDataProvider>
                    </LayoutProvider>
                </VotingSystemProvider>
            </ThemeProvider>
        </ConfigProvider>
    </React.StrictMode>
);