import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/home';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext'; // Import QuizProvider
import QuizSettings from './components/QuizSettings';
import QuizInterface from './components/QuizInterface';
import HistorySection from './components/HistorySection';
import QuizDetails from './components/QuizDetails'; // Import QuizDetails
import AuthForms from './components/AuthForms';
import ResultsSummary from './components/ResultsSummary'; // Import ResultsSummary
import { Leaderboard } from './components/Leaderboard'; // Import Leaderboard
import Settings from './components/Settings'; // Import Settings
import { Toaster } from "./components/ui/toaster"; // Import Toaster

function App() {
  return (
    <AuthProvider>
      <QuizProvider> {/* Wrap with QuizProvider */}
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthForms />} />
            <Route path="/quiz-settings" element={<QuizSettings />} />
            <Route path="/quiz" element={<QuizInterface />} />
            <Route path="/results" element={<ResultsSummary />} /> {/* Add route for results */}
            <Route path="/history" element={<HistorySection />} />
            <Route path="/history/:quizId" element={<QuizDetails />} /> {/* Add route for quiz details */}
            <Route path="/leaderboard" element={<Leaderboard />} /> {/* Add route for leaderboard */}
            <Route path="/settings" element={<Settings />} /> {/* Add route for settings */}
            {import.meta.env.VITE_TEMPO === 'true' && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
        </Suspense>
        <Toaster /> {/* Add Toaster here */}
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;
