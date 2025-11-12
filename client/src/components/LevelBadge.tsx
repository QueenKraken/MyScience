import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getLevelInfo } from "@shared/gamification";
import type { GamificationProgress } from "@shared/schema";

interface LevelBadgeProps {
  showLabel?: boolean;
  className?: string;
}

export function LevelBadge({ showLabel = false, className = "" }: LevelBadgeProps) {
  const { data: progress, isLoading } = useQuery<GamificationProgress>({
    queryKey: ["/api/gamification/progress"],
  });

  if (isLoading) {
    return <Skeleton className={`h-7 w-16 ${className}`} data-testid="skeleton-level-badge" />;
  }

  if (!progress) {
    return null;
  }

  const levelInfo = getLevelInfo(progress.currentLevel);

  return (
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
  );
}
