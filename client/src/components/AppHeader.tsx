import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Moon, Sun, User, Home, Users, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/image_1762907544970.png";
import NotificationDropdown from "@/components/NotificationDropdown";
import { LevelBadge } from "@/components/LevelBadge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  returnUrl?: string;
  returnSiteName?: string;
}

export default function AppHeader({ 
  returnUrl, 
  returnSiteName = "original site" 
}: AppHeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleReturn = () => {
    if (returnUrl) {
      // Open original article in new tab (preserving MyScience session)
      window.open(returnUrl, '_blank');
    } else {
      console.log("Return to", returnSiteName);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background" data-testid="header-main">
      <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
        <Link href="/">
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg px-2 py-1 -ml-2 cursor-pointer" data-testid="link-logo">
            <img 
              src={logoImage} 
              alt="MyScience" 
              className="h-10 w-auto dark:brightness-0 dark:invert"
              data-testid="img-logo"
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {returnUrl && (
            <Button 
              variant="outline" 
              onClick={handleReturn}
              data-testid="button-return"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to {returnSiteName}
            </Button>
          )}
          
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-1">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-home"
                    aria-label="Home"
                  >
                    <Home className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/people">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-people"
                    aria-label="People"
                  >
                    <Users className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid="button-user-menu"
                      aria-label="User menu"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" data-testid="dropdown-user-menu">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" data-testid="link-profile-menu">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <NotificationDropdown />
                <div className="w-2" />
              </div>
              
              <LevelBadge />
            </>
          ) : (
            <Button 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Sign In
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            data-testid="button-theme-toggle"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
