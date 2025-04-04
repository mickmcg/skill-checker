import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { RefreshCw, Brain, History, ListChecks, FileSearch } from "lucide-react"; // Replaced Home with Brain

interface ActionButtonsProps {
  onRetry?: () => void;
  onCheckAnswers?: () => void;
  onViewHistory?: () => void;
  onNewQuiz?: () => void; // Changed onReturnHome back to onNewQuiz
}

const ActionButtons = ({
  onRetry = () => {},
  onCheckAnswers = () => {},
  onViewHistory = () => {},
  onNewQuiz = () => {}, // Changed onReturnHome back to onNewQuiz
}: ActionButtonsProps) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    onRetry();
  };

  const handleCheckAnswers = () => { // Renamed handleNewQuiz to handleCheckAnswers
    onCheckAnswers();
  };

  const handleViewHistory = () => {
    onViewHistory();
  };

  const handleNewQuiz = () => { // Changed handleReturnHome to handleNewQuiz
    onNewQuiz(); // Call the onNewQuiz prop
  };

  return (
    <div className="w-full bg-card p-6 rounded-lg shadow-sm space-y-4"> {/* Replaced bg-white with bg-card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleRetry}
          className="flex items-center justify-center gap-2"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Quiz
        </Button>

        <Button
          onClick={handleCheckAnswers}
          className="flex items-center justify-center gap-2"
          variant="outline" // Changed variant from default to outline
        >
          <ListChecks className="h-4 w-4" />
          Check Answers
        </Button>

        <Button
          onClick={handleViewHistory}
          className="flex items-center justify-center gap-2"
          variant="secondary"
        >
          <History className="h-4 w-4" />
          View History
        </Button>

        {/* Changed Return Home to New Quiz */}
        <Button
          onClick={handleNewQuiz}
          className="flex items-center justify-center gap-2"
          variant="default" // Changed variant from secondary to default
        >
          <Brain className="h-4 w-4" />
          New Quiz
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
