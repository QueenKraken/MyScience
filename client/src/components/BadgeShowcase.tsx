import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award } from "lucide-react";
import type { BadgeTier } from "@shared/gamification";

interface UserBadge {
  id: string;
  badgeId: string;
  name: string;
  tier: BadgeTier;
  points: number;
  message: string;
  earnedAt: string;
}

interface BadgeShowcaseProps {
  userId?: string;
}

const tierColors = {
  Common: {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    border: "border-border",
    glow: "",
  },
  Rare: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    glow: "shadow-sm shadow-primary/20",
  },
  Epic: {
    bg: "bg-epic/10",
    text: "text-epic",
    border: "border-epic/30",
    glow: "shadow-md shadow-epic/30",
  },
  Legendary: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/30",
    glow: "shadow-lg shadow-warning/40",
  },
};

export function BadgeShowcase({ userId }: BadgeShowcaseProps) {
  const { data: userBadges, isLoading } = useQuery<UserBadge[]>({
    queryKey: userId ? ["/api/gamification/user-badges", userId] : ["/api/gamification/user-badges"],
  });

  if (isLoading) {
    return (
      <Card data-testid="card-badge-showcase-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            MyBadges
          </CardTitle>
          <CardDescription>Your earned achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedBadges = [...(userBadges || [])].sort((a, b) => {
    const tierOrder = { Legendary: 0, Epic: 1, Rare: 2, Common: 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  return (
    <Card data-testid="card-badge-showcase">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          MyBadges
        </CardTitle>
        <CardDescription>
          {userBadges?.length || 0} {userBadges?.length === 1 ? "achievement" : "achievements"} unlocked
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!userBadges || userBadges.length === 0 ? (
          <div className="text-center py-8" data-testid="empty-badges">
            <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No badges earned yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start saving articles, liking content, and engaging with the community!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="grid-badges">
            {sortedBadges.map((userBadge) => {
              const tier = userBadge.tier;
              const colors = tierColors[tier];
              
              return (
                <div
                  key={userBadge.id}
                  className={`
                    relative rounded-lg border p-4 transition-all hover-elevate
                    ${colors.bg} ${colors.border} ${colors.glow}
                  `}
                  data-testid={`badge-item-${userBadge.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className={`font-semibold text-sm ${colors.text}`}>
                      {userBadge.name}
                    </h4>
                    <Badge 
                      variant={tier === "Common" ? "secondary" : "outline"}
                      className={`text-xs shrink-0 ${colors.text} ${colors.border}`}
                      data-testid={`badge-tier-${tier.toLowerCase()}`}
                    >
                      {tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {userBadge.message}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${colors.text}`}>
                      +{userBadge.points} XP
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(userBadge.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
