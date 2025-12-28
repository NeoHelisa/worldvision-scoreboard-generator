import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { VotingSystemProvider } from './context/VotingSystemContext';
import HomePage from './components/HomePage';
import ScoreboardPage from './components/ScoreboardPage';
import TelevotePage from './components/TelevotePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => (
    <ThemeProvider>
        <VotingSystemProvider>
            <div className="app">
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/scoreboard/:boardNumber" element={<ScoreboardPage />} />
                        <Route path="/televote" element={<TelevotePage />} />
                        <Route path="*" element={<h1>Page not found</h1>} />
                    </Routes>
                </Router>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </div>
        </VotingSystemProvider>
    </ThemeProvider>
);

export default App;