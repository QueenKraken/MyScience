import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getLevelInfo, LEVEL_DATA, BADGE_DEFINITIONS } from "@shared/gamification";
import type { BadgeTier } from "@shared/gamification";
import type { Badge, UserBadge, GamificationProgress } from "@shared/schema";
import { Trophy, Award, Zap, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const tierIcons: Record<BadgeTier, typeof Trophy> = {
  Common: Zap,
  Rare: Award,
  Epic: Star,
  Legendary: Trophy,
};

const tierColors: Record<BadgeTier, string> = {
  Common: "text-slate-600 dark:text-slate-400",
  Rare: "text-blue-600 dark:text-blue-400",
  Epic: "text-purple-600 dark:text-purple-400",
  Legendary: "text-amber-600 dark:text-amber-400",
};

export default function Gamification() {
  const { user } = useAuth();
  const userId = user?.id || null;

  const { data: progress, isLoading: progressLoading } = useQuery<GamificationProgress>({
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

  const { data: badges, isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ["/api/gamification/badges"],
    queryFn: async () => {
      const res = await fetch("/api/gamification/badges", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch badges");
      return res.json();
    },
    enabled: !!userId, // Only fetch when authenticated
  });

  const { data: userBadges, isLoading: userBadgesLoading } = useQuery<UserBadge[]>({
    queryKey: ["/api/gamification/user-badges", { userId }], // User-specific cache key
    queryFn: async () => {
      const res = await fetch("/api/gamification/user-badges", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user badges");
      return res.json();
    },
    enabled: !!userId, // Only fetch when authenticated
  });

  if (progressLoading || badgesLoading || userBadgesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!progress || !badges || !userBadges) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Unable to load gamification data.</p>
      </div>
    );
  }

  const levelInfo = progress.levelInfo;
  const nextLevelInfo = getLevelInfo(progress.currentLevel + 1);
  const xpInCurrentLevel = progress.totalXp - progress.progress.currentLevelXp;
  const xpNeededForLevel = progress.progress.nextLevelXp - progress.progress.currentLevelXp;
  const progressPercent = progress.progress.progress * 100;

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2" data-testid="heading-gamification">
          Your Progress
        </h1>
        <p className="text-muted-foreground" data-testid="text-gamification-description">
          Track your journey through the research community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2" data-testid="card-level-progress">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <div>
              <CardTitle data-testid="text-current-level">Level {progress.currentLevel}</CardTitle>
              <CardDescription data-testid="text-level-label">{levelInfo.label}</CardDescription>
            </div>
            <div className="text-6xl" data-testid="text-level-symbol">
              {levelInfo.symbol}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm italic text-muted-foreground mb-4" data-testid="text-level-tagline">
                "{levelInfo.tagline}"
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground" data-testid="text-xp-current">
                    {xpInCurrentLevel.toLocaleString()} XP
                  </span>
                  <span className="font-medium" data-testid="text-xp-needed">
                    {xpNeededForLevel.toLocaleString()} XP needed
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" data-testid="progress-level" />
              </div>
            </div>
            {progress.currentLevel < 30 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl" data-testid="text-next-level-symbol">
                    {nextLevelInfo.symbol}
                  </div>
                  <div>
                    <p className="font-medium" data-testid="text-next-level-title">
                      Next: {nextLevelInfo.label}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid="text-next-level-tagline">
                      {nextLevelInfo.tagline}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stats">
          <CardHeader>
            <CardTitle data-testid="text-stats-title">Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-xp">
                {progress.totalXp.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-badges-earned">
                {userBadges.length}/{badges.length}
              </p>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-badges">
        <CardHeader>
          <CardTitle data-testid="text-badges-title">Badge Collection</CardTitle>
          <CardDescription data-testid="text-badges-description">
            Earn badges by exploring and contributing to the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const TierIcon = tierIcons[badge.tier as BadgeTier];
              const tierColor = tierColors[badge.tier as BadgeTier];
              const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);

              return (
                <div
                  key={badge.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isEarned
                      ? "bg-card hover-elevate"
                      : "bg-muted/30 opacity-60"
                  }`}
                  data-testid={`badge-card-${badge.trigger}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${tierColor} flex-shrink-0`}>
                      <TierIcon className="w-6 h-6" data-testid={`icon-tier-${badge.tier.toLowerCase()}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            isEarned ? "" : "text-muted-foreground"
                          }`}
                          data-testid={`text-badge-name-${badge.trigger}`}
                        >
                          {badge.name}
                        </h3>
                        {isEarned && (
                          <BadgeComponent variant="secondary" className="text-xs" data-testid={`badge-earned-${badge.trigger}`}>
                            Earned
                          </BadgeComponent>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`text-badge-message-${badge.trigger}`}>
                        {badge.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <BadgeComponent variant="outline" className={tierColor} data-testid={`badge-tier-${badge.trigger}`}>
                          {badge.tier}
                        </BadgeComponent>
                        <span className="text-muted-foreground" data-testid={`text-badge-points-${badge.trigger}`}>
                          {badge.points} XP
                        </span>
                      </div>
                      {isEarned && userBadge && userBadge.earnedAt && (
                        <p className="text-xs text-muted-foreground mt-2" data-testid={`text-badge-earned-date-${badge.trigger}`}>
                          Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-all-levels">
        <CardHeader>
          <CardTitle data-testid="text-all-levels-title">All Levels</CardTitle>
          <CardDescription data-testid="text-all-levels-description">
            The complete journey from beginner to master
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEVEL_DATA.map((level) => {
              const isCurrentLevel = level.level === progress.currentLevel;
              const isPastLevel = level.level < progress.currentLevel;

              return (
                <div
                  key={level.level}
                  className={`rounded-lg border p-3 transition-all ${
                    isCurrentLevel
                      ? "bg-primary/10 border-primary"
                      : isPastLevel
                      ? "bg-card"
                      : "bg-muted/30 opacity-60"
                  }`}
                  data-testid={`level-card-${level.level}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl" data-testid={`text-level-${level.level}-symbol`}>
                      {level.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`font-semibold text-sm ${
                            isCurrentLevel || isPastLevel ? "" : "text-muted-foreground"
                          }`}
                          data-testid={`text-level-${level.level}-title`}
                        >
                          Lvl {level.level}: {level.label}
                        </p>
                        {isCurrentLevel && (
                          <BadgeComponent variant="default" className="text-xs" data-testid="badge-current-level">
                            Current
                          </BadgeComponent>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground" data-testid={`text-level-${level.level}-tagline`}>
                        {level.tagline}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`text-level-${level.level}-xp`}>
                        {level.xpRequired.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
