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
      {/* Simplified Trigger for debugging */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full"> {/* Use icon size */}
          {user ? user.email?.charAt(0).toUpperCase() : '?'} {/* Simple indicator */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Content remains the same */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              Account
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Use local handler */}
        <DropdownMenuItem onClick={handleHistoryClick} className="cursor-pointer">
          <History className="mr-2 h-4 w-4" />
          <span>Quiz History</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" disabled> {/* Disable unimplemented */}
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
