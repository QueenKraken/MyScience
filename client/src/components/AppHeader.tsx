import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun, User, Home, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import logoImage from "@assets/image_1762907544970.png";
import NotificationDropdown from "@/components/NotificationDropdown";
import { LevelBadge } from "@/components/LevelBadge";

interface AppHeaderProps {
  returnUrl?: string;
  returnSiteName?: string;
}

export default function AppHeader({ 
  returnUrl, 
  returnSiteName = "original site" 
}: AppHeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

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

        <div className="flex items-center gap-2">
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
          <Link href="/profile">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-profile"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <NotificationDropdown />
          <LevelBadge />
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
