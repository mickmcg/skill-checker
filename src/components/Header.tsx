import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { History, Home, LogIn, Moon, Sun, Trophy } from 'lucide-react'; // Added Moon, Sun icons
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'; // Import DropdownMenu components

// Remove HeaderProps interface and onViewHistory prop
// interface HeaderProps {
//   activePage?: "home" | "history" | "settings";
//   onViewHistory?: () => void; // Removed
// }

const Header = ({ activePage = "home" }: { activePage?: "home" | "history" | "settings" }) => { // Remove onViewHistory prop
  const { user } = useAuth();
  const { theme, setTheme } = useTheme(); // Get theme state and setter
  const location = useLocation();
  const navigate = useNavigate();

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

        {/* Dark Mode Toggle Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
};

export default Header;
