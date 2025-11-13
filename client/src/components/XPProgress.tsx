import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import { getLevelInfo, getLevelProgress } from "@shared/gamification";

interface GamificationProgress {
  currentLevel: number;
  totalXp: number;
  nextLevelXp: number;
  xpProgress: number;
}

export function XPProgress() {
  const { data: progress, isLoading, isError, refetch } = useQuery<GamificationProgress>({
    queryKey: ["/api/gamification/progress"],
    queryFn: async () => {
      const res = await fetch("/api/gamification/progress", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card data-testid="card-xp-progress-loading">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card data-testid="card-xp-progress-error">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">Failed to load progress</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              data-testid="button-retry-xp-progress"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const levelInfo = getLevelInfo(progress.currentLevel);
  const isMaxLevel = progress.currentLevel >= 30;
  
  // Only compute progress metrics for non-max-level users
  let nextLevelInfo = null;
  let xpInCurrentLevel = 0;
  let xpNeededForLevel = 0;
  let percentageProgress = 0;
  
  if (!isMaxLevel) {
    nextLevelInfo = getLevelInfo(progress.currentLevel + 1);
    const progressData = getLevelProgress(progress.totalXp, progress.currentLevel);
    xpInCurrentLevel = progress.totalXp - progressData.currentLevelXp;
    xpNeededForLevel = progressData.nextLevelXp - progressData.currentLevelXp;
    percentageProgress = Math.max(0, Math.min(100, Math.round(progressData.progress * 100)));
  }

  return (
    <Card data-testid="card-xp-progress">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Level Progress
        </CardTitle>
        <CardDescription>
          {isMaxLevel ? (
            `Level ${progress.currentLevel} - Max Level Achieved`
          ) : (
            `Level ${progress.currentLevel} → ${progress.currentLevel + 1}`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" data-testid="emoji-current-level">
              {levelInfo.symbol}
            </span>
            <div>
              <p className="font-medium text-sm" data-testid="text-current-level-label">
                {levelInfo.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {levelInfo.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isMaxLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {xpInCurrentLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
              </span>
              <span className="font-medium text-success">
                {percentageProgress}%
              </span>
            </div>
            <Progress 
              value={percentageProgress} 
              className="h-3"
              data-testid="progress-xp"
            />
          </div>
        )}
        
        {/* Max Level XP Display */}
        {isMaxLevel && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Total XP Earned</p>
            <p className="text-2xl font-bold text-warning">
              {progress.totalXp.toLocaleString()}
            </p>
          </div>
        )}

        {/* Next Level Preview */}
        {!isMaxLevel && nextLevelInfo && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-xl opacity-60" data-testid="emoji-next-level">
              {nextLevelInfo.symbol}
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Next:</p>
              <p className="font-medium text-sm" data-testid="text-next-level-label">
                {nextLevelInfo.label}
              </p>
            </div>
          </div>
        )}

        {/* Max Level Reached */}
        {isMaxLevel && (
          <div className="text-center pt-2 border-t">
            <p className="text-sm font-medium text-warning">
              Max Level Reached! 
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You've achieved immortality in science
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
