import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GamificationProgress } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { getLevelProgress } from "@shared/gamification";

interface LevelBadgeProps {
  showLabel?: boolean;
  className?: string;
}

export function LevelBadge({ showLabel = false, className = "" }: LevelBadgeProps) {
  const { user } = useAuth();
  const userId = user?.id || null;

  const { data: progress, isLoading } = useQuery<GamificationProgress>({
    queryKey: ["/api/gamification/progress", { userId }], // User-specific cache key
    queryFn: async () => {
      const res = await fetch("/api/gamification/progress", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
    enabled: !!userId, // Only fetch when authenticated
  });

  if (!userId || isLoading) {
    return <Skeleton className={`h-7 w-16 ${className}`} data-testid="skeleton-level-badge" />;
  }

  if (!progress) {
    return null;
  }

  const levelInfo = progress.levelInfo;
  const progressData = getLevelProgress(progress.totalXp, progress.currentLevel);
  const xpInCurrentLevel = progress.totalXp - progressData.currentLevelXp;
  const xpNeededForLevel = progressData.nextLevelXp - progressData.currentLevelXp;
  const percentageProgress = Math.round(progressData.progress * 100);
  const xpRemaining = Math.max(0, xpNeededForLevel - xpInCurrentLevel);
  const isMaxLevel = progress.currentLevel >= 30;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href="/gamification" data-testid="link-gamification">
          <Badge
            variant="secondary"
            className={`cursor-pointer hover-elevate active-elevate-2 gap-1.5 ${className}`}
            data-testid="badge-level"
            aria-label={`Level ${progress.currentLevel}: ${levelInfo.label}`}
          >
            <span className="text-base" data-testid="text-level-symbol">
              {levelInfo.symbol}
            </span>
            {showLabel ? (
              <span className="font-medium" data-testid="text-level-label">
                {levelInfo.label}
              </span>
            ) : (
              <span className="font-medium" data-testid="text-level-number">
                Lvl {progress.currentLevel}
              </span>
            )}
          </Badge>
        </Link>
      </TooltipTrigger>
      <TooltipContent data-testid="tooltip-level-details" className="max-w-xs">
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-sm">
              {levelInfo.symbol} {levelInfo.label}
            </p>
            <p className="text-xs text-muted-foreground italic">
              "{levelInfo.tagline}"
            </p>
          </div>
          <div className="pt-2 border-t space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total XP:</span>
              <span className="font-medium">{progress.totalXp.toLocaleString()}</span>
            </div>
            {!isMaxLevel && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Level Progress:</span>
                  <span className="font-medium text-success">{percentageProgress}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">XP to Next Level:</span>
                  <span className="font-medium">
                    {xpRemaining.toLocaleString()}
                  </span>
                </div>
              </>
            )}
            {isMaxLevel && (
              <div className="text-xs text-center text-warning font-medium pt-1">
                Max Level Reached!
              </div>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
