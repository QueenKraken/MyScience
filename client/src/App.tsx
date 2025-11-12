import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useLevelUpDetection } from "@/hooks/useLevelUpDetection";
import { LevelUpModal } from "@/components/LevelUpModal";
import HomePage from "@/pages/home";
import Landing from "@/pages/landing";
import ProfilePage from "@/pages/profile";
import UserProfilePage from "@/pages/user-profile";
import PeoplePage from "@/pages/people";
import Gamification from "@/pages/Gamification";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Always call hook unconditionally (React Rules of Hooks)
  // Hook internally gates query via enabled flag based on auth
  const { levelUpData, clearLevelUp } = useLevelUpDetection();

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {levelUpData && (
        <LevelUpModal
          isOpen={true}
          onClose={clearLevelUp}
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
        />
      )}
    
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/profile" component={Landing} />
          <Route path="/profiles/:userId" component={Landing} />
          <Route path="/people" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={HomePage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/profiles/:userId" component={UserProfilePage} />
          <Route path="/people" component={PeoplePage} />
          <Route path="/gamification" component={Gamification} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
