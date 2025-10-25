import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, BookMarked, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function TestProfileIcon() {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showIcon, setShowIcon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to handle authentication state changes
  useEffect(() => {
    try {
      console.log("TestProfileIcon: Auth state check", { isAuthenticated, userId: user?.id });
      
      // Force show icon for testing if authentication is detected
      if (isAuthenticated === true) {
        console.log("TestProfileIcon: Authentication detected, showing icon");
        setShowIcon(true);
        setError(null);
        return;
      }
      
      if (isAuthenticated === undefined) {
        console.warn("TestProfileIcon: Authentication state is undefined");
        setError("Auth state undefined");
        setShowIcon(false);
        return;
      }

      if (user?.id) {
        console.log("TestProfileIcon: User ID detected, showing icon");
        setShowIcon(true);
        setError(null);
      } else {
        console.log("TestProfileIcon: No authentication, hiding icon");
        setShowIcon(false);
      }
    } catch (err) {
      console.error("TestProfileIcon: Error processing auth state", err);
      setError("Auth error");
      setShowIcon(false);
    }
  }, [isAuthenticated, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      setError("Sign out failed");
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    
    try {
      if (user.user_metadata?.full_name) {
        return user.user_metadata.full_name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      return user.email?.slice(0, 2).toUpperCase() || 'U';
    } catch (err) {
      console.error("Error getting user initials:", err);
      return 'U';
    }
  };

  // Don't render anything if not authenticated
  if (!showIcon) return null;

  return (
    <div 
      className="test-profile-icon-container relative" 
      data-testid="test-profile-icon"
    >
      {error && (
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full" title={error}></div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all duration-300 transform hover:scale-110
                      sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9"
          >
            <Avatar className="h-full w-full border-2 border-white">
              <AvatarFallback className="bg-green-600 text-white text-xs sm:text-sm md:text-base">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 sm:w-48 md:w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'test@example.com'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/bookmarks')}>
            <BookMarked className="mr-2 h-4 w-4" />
            My Library
            <Badge variant="secondary" className="ml-auto">
              Test
            </Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/reading-history')}>
            <History className="mr-2 h-4 w-4" />
            Reading History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}