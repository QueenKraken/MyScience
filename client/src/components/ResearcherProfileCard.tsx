import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookMarked, TrendingUp, Calendar, Settings } from "lucide-react";
import { Link } from "wouter";

interface ResearcherProfileCardProps {
  userName: string | null;
  jobRole?: string;
  institution?: string;
  avatarUrl?: string;
  savedCount: number;
  readThisWeek?: number;
  topTopics?: string[];
  onViewSaved?: () => void;
}

export function ResearcherProfileCard({
  userName,
  jobRole,
  institution,
  avatarUrl,
  savedCount,
  readThisWeek = 0,
  topTopics = [],
  onViewSaved,
}: ResearcherProfileCardProps) {
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Card className="p-6 animate-fade-in shadow-sm" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16" data-testid="avatar-user">
            <AvatarImage src={avatarUrl} alt={userName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-heading text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-xl font-semibold mb-1 truncate" data-testid="text-user-name">
              {userName || "Welcome, Researcher"}
            </h3>
            <p className="text-sm text-muted-foreground mb-2" data-testid="text-user-job-role">
              {jobRole || "Researcher"}
            </p>
            {institution && (
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-institution">
                {institution}
              </p>
            )}
          </div>

          <Link href="/profile">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-profile-settings"
              aria-label="Profile settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onViewSaved}
            disabled={savedCount === 0}
            className="space-y-1 text-left hover-elevate active-elevate-2 rounded-lg p-3 -m-3 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="button-view-saved-profile"
            aria-label={savedCount > 0 ? "View saved articles" : "No saved articles yet"}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookMarked className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-medium">Saved</span>
            </div>
            <p className="text-2xl font-bold font-heading" data-testid="text-stat-saved">
              {savedCount}
            </p>
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">This week</span>
            </div>
            <p className="text-2xl font-bold font-heading" data-testid="text-stat-weekly">
              {readThisWeek}
            </p>
          </div>
        </div>

        {/* Top Topics */}
        {topTopics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Your interests</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {topTopics.slice(0, 3).map((topic, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="text-xs"
                  data-testid={`badge-topic-${idx}`}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
