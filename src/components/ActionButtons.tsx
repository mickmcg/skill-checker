import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { RefreshCw, Home, History, FileText, FileSearch } from "lucide-react"; // Added FileSearch

interface ActionButtonsProps {
  onRetry?: () => void;
  onNewQuiz?: () => void;
  onViewHistory?: () => void;
  onReturnHome?: () => void;
}

const ActionButtons = ({
  onRetry = () => {},
  onNewQuiz = () => {},
  onViewHistory = () => {},
  onReturnHome = () => {},
}: ActionButtonsProps) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    onRetry();
  };

  const handleNewQuiz = () => {
    onNewQuiz();
  };

  const handleViewHistory = () => {
    onViewHistory();
  };

  const handleReturnHome = () => {
    onReturnHome();
  };

  return (
    <div className="w-full bg-card p-6 rounded-lg shadow-sm space-y-4"> {/* Replaced bg-white with bg-card */}
      <h3 className="text-lg font-medium mb-4 text-foreground"> {/* Added text-foreground */}
        What would you like to do next?
      </h3>
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
          onClick={handleNewQuiz}
          className="flex items-center justify-center gap-2"
          variant="default"
        >
          <FileText className="h-4 w-4" />
          New Quiz
        </Button>

        <Button
          onClick={handleViewHistory}
          className="flex items-center justify-center gap-2"
          variant="secondary"
        >
          <History className="h-4 w-4" />
          View History
        </Button>

        {/* Assuming the second "View History" button was intended to be "Return Home" */}
        <Button
          onClick={handleReturnHome} // Changed handler to onReturnHome
          className="flex items-center justify-center gap-2"
          variant="secondary"
        >
          <Home className="h-4 w-4" /> {/* Changed icon to Home */}
          Return Home {/* Changed text */}
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
