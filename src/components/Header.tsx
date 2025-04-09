import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Brain, History, Home, LogIn, Menu, Moon, Sun, Trophy } from 'lucide-react'; // Added Menu icon
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'; // Import Sheet components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'; // Import DropdownMenu components

// Removed activePage prop
const Header = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme(); // Get theme state and setter
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path; // Helper for active state

  // Define handler locally
  const handleHistoryClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
    } else {
      navigate('/history');
    }
  };

  return (
    // Applied bg-header-bg, removed border, kept padding for content, set default text to white
    <header className="w-full h-20 bg-header-bg flex items-center justify-between px-6 shadow-sm text-white">
      <Link to="/" className="flex items-center gap-2">
        {/* Changed icon and text color to white */}
        <Trophy className="h-8 w-8 text-white" />
        <h1 className="text-2xl font-bold text-white">Skill Checker</h1>
      </Link>

      {/* Dark Mode Toggle Dropdown - Moved Here */}
      <div className="ml-4"> {/* Wrapper div for spacing */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Using new headerOutline variant */}
            <Button variant="headerOutline" size="icon" className="h-10 w-10 relative"> {/* Ensure correct size */}
            {/* Restore scale classes, icon should inherit text-white from variant */}
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        {/* Dropdown content uses standard theme colors, no change needed here */}
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
      </div> {/* Close wrapper div */}

      {/* Desktop Navigation - Hidden on small screens */}
      <nav className="hidden md:flex items-center gap-4 ml-auto">
        <Link to="/">
          <Button
            variant={isActive('/') ? 'default' : 'ghost'} // Use isActive helper
            // Added text-white styling for ghost variant on dark background
            className={`flex items-center gap-2 ${!isActive('/') ? 'text-white hover:bg-white/10 hover:text-white' : ''}`}
          >
            <Brain className="h-4 w-4" />
            New Quiz
          </Button>
        </Link>

        {user ? (
          <>
            {/* Use local handler for History button */}
            <Button
              variant={location.pathname.startsWith('/history') ? 'default' : 'ghost'} // Check if path starts with /history
              className={`flex items-center gap-2 ${!location.pathname.startsWith('/history') ? 'text-white hover:bg-white/10 hover:text-white' : ''}`}
              onClick={handleHistoryClick}
            >
              <History className="h-4 w-4" />
              History
            </Button>

            {/* Leaderboard Link */}
            <Link to="/leaderboard">
              <Button
                variant={isActive('/leaderboard') ? 'default' : 'ghost'}
                className={`flex items-center gap-2 ${!isActive('/leaderboard') ? 'text-white hover:bg-white/10 hover:text-white' : ''}`}
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Button>
            </Link>

            {/* Assuming UserMenu adapts or needs separate styling */}
            <UserMenu />
          </>
        ) : (
          <Link to="/login" state={{ from: location }}> {/* Pass state here */}
            {/* Reverting to headerOutline variant, adding color="white" prop to icon */}
            <Button variant="headerOutline" size="default" className="flex gap-2 h-10 px-4 py-2"> {/* Ensure correct size */}
              <LogIn className="h-4 w-4" color="white" /> {/* Set color prop */}
              Login
            </Button>
          </Link>
        )}
      </nav>

      {/* Mobile Navigation - Hamburger Menu */}
      <div className="md:hidden ml-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="headerOutline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-background text-foreground"> {/* Removed p-6 */}
            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-4 mt-6"> {/* Removed h-full */}
              {/* Always visible */}
              <Link to="/" className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                <Brain className="h-5 w-5" />
                New Quiz
              </Link>

              {/* Conditional links based on auth state */}
              {user ? (
                <>
                  {/* Logged-in links */}
                  <button
                    onClick={handleHistoryClick}
                    className="flex items-center gap-2 p-2 rounded hover:bg-accent text-left w-full"
                  >
                    <History className="h-5 w-5" />
                    History
                  </button>
                  <Link to="/leaderboard" className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                    <Trophy className="h-5 w-5" />
                    Leaderboard
                  </Link>
                  {/* Separator and User Menu */}
                  <div className="border-t pt-4"> {/* Removed mt-auto */}
                     <UserMenu />
                  </div>
                </>
              ) : (
                <>
                  {/* Logged-out link */}
                  <Link to="/login" state={{ from: location }} className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                    <LogIn className="h-5 w-5" />
                    Login
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
