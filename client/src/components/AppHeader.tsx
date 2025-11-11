import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

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
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-app-title">
            MyScience
          </h1>
        </div>

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
