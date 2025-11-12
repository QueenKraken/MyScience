import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GamificationProgress } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

const LEVEL_STORAGE_KEY_PREFIX = "myScience_lastKnownLevel";

function getLevelStorageKey(userId: string | null): string | null {
  if (!userId) return null;
  return `${LEVEL_STORAGE_KEY_PREFIX}_${userId}`;
}

export function useLevelUpDetection() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  
  const [levelUpData, setLevelUpData] = useState<{
    oldLevel: number;
    newLevel: number;
  } | null>(null);

  const { data: progress } = useQuery<GamificationProgress>({
    queryKey: ["/api/gamification/progress", { userId }], // User-specific cache key
    queryFn: async () => {
      const res = await fetch("/api/gamification/progress", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
    enabled: !!userId, // Only fetch if user is authenticated
  });

  // Clear level-up state when user changes (login/logout/account switch)
  useEffect(() => {
    setLevelUpData(null);
  }, [userId]);

  useEffect(() => {
    if (!progress || !userId) return;

    const storageKey = getLevelStorageKey(userId);
    if (!storageKey) return;

    const lastKnownLevel = localStorage.getItem(storageKey);
    const currentLevel = progress.currentLevel;

    if (lastKnownLevel === null) {
      // First time - just store the current level
      localStorage.setItem(storageKey, currentLevel.toString());
      return;
    }

    const previousLevel = parseInt(lastKnownLevel, 10);

    if (currentLevel > previousLevel) {
      // Level up detected!
      setLevelUpData({
        oldLevel: previousLevel,
        newLevel: currentLevel,
      });
      // Update stored level
      localStorage.setItem(storageKey, currentLevel.toString());
    } else if (currentLevel < previousLevel) {
      // Level decreased (shouldn't happen in normal flow, but handle it)
      localStorage.setItem(storageKey, currentLevel.toString());
    }
  }, [progress, userId]);

  const clearLevelUp = () => {
    setLevelUpData(null);
  };

  return {
    levelUpData,
    clearLevelUp,
  };
}
