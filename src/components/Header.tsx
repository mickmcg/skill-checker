import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button } from './ui/button';
import { History, Home, LogIn, Settings, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

// Remove HeaderProps interface and onViewHistory prop
// interface HeaderProps {
//   activePage?: "home" | "history" | "settings";
//   onViewHistory?: () => void; // Removed
// }

const Header = ({ activePage = "home" }: { activePage?: "home" | "history" | "settings" }) => { // Remove onViewHistory prop
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Get navigate function

  // Define handler locally
  const handleHistoryClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
    } else {
      navigate('/history');
    }
  };

  return (
    <header className="w-full h-20 bg-background border-b border-border flex items-center justify-between px-6 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Skill Checker</h1>
      </Link>

      <nav className="flex items-center gap-4">
        <Link to="/">
          <Button
            variant={activePage === "home" ? "default" : "ghost"}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>

        {user ? (
          <>
            {/* Use local handler for History button */}
            <Button
              variant={activePage === "history" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={handleHistoryClick} // Use local handler
            >
              <History className="h-4 w-4" />
              History
            </Button>

            <UserMenu /> {/* Remove onViewHistory prop */}
          </>
        ) : (
          <Link to="/login" state={{ from: location }}> {/* Pass state here */}
            <Button variant="outline" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
