import React, { useCallback, memo } from 'react'; // Import memo
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { History, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Remove useLocation

// Remove UserMenuProps interface and onViewHistory prop
// interface UserMenuProps {
//   onViewHistory?: () => void;
// }

const UserMenu = () => { // Remove onViewHistory prop
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  // REMOVED: const location = useLocation();

  // Memoize sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [signOut, navigate]);

  // Memoize history click handler again - Simplified
  const handleHistoryClick = useCallback(() => {
    // Assumes UserMenu is only shown when user is logged in
    navigate('/history');
  }, [navigate]); // Only depends on navigate

  // REMOVED getInitials function as it's not used in simplified trigger

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Added text-foreground for light mode visibility, kept primary-foreground for dark */}
        <Button variant="outline" size="icon" className="rounded-full text-foreground dark:text-primary-foreground"> {/* Use icon size */}
          {/* Use first letter of username or email */}
          {user ? (user.username || user.email)?.charAt(0).toUpperCase() : '?'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            {/* Display username if available, otherwise email */}
            <p className="text-sm font-medium leading-none">{user?.username || user?.email}</p>
            {/* Show email as secondary info if username is displayed */}
            {user?.username && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Use local handler */}
        <DropdownMenuItem onClick={handleHistoryClick} className="cursor-pointer">
          <History className="mr-2 h-4 w-4" />
          <span>Quiz History</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default memo(UserMenu); // Wrap export with memo
