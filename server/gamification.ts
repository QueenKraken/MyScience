import { db } from "./db";
import { users, badges, userBadges } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { calculateLevel, type BadgeTrigger } from "@shared/gamification";

export interface BadgeAward {
  badgeId: string;
  badgeName: string;
  message: string;
  points: number;
  tier: string;
}

export interface LevelUp {
  oldLevel: number;
  newLevel: number;
  symbol: string;
  label: string;
  tagline: string;
}

export interface GamificationUpdate {
  newBadges: BadgeAward[];
  levelUp: LevelUp | null;
  totalXp: number;
  currentLevel: number;
}

/**
 * Award a badge to a user if they haven't already earned it
 */
export async function awardBadgeByTrigger(
  userId: string,
  trigger: BadgeTrigger
): Promise<BadgeAward | null> {
  // Find the badge by trigger
  const [badge] = await db
    .select()
    .from(badges)
    .where(eq(badges.trigger, trigger))
    .limit(1);

  if (!badge) {
    console.log(`No badge found for trigger: ${trigger}`);
    return null;
  }

  // Award the badge - rely on unique constraint to prevent duplicates
  try {
    await db.insert(userBadges).values({
      id: sql`gen_random_uuid()`,
      userId,
      badgeId: badge.id,
    });
  } catch (error: any) {
    // If unique constraint violation, user already has this badge
    if (error?.code === '23505') { // PostgreSQL unique violation code
      return null;
    }
    throw error;
  }

  // Add XP to user
  await addXpToUser(userId, badge.points);

  console.log(
    `✓ Awarded badge "${badge.name}" to user ${userId} (+${badge.points} XP)`
  );

  return {
    badgeId: badge.id,
    badgeName: badge.name,
    message: badge.message,
    points: badge.points,
    tier: badge.tier,
  };
}

/**
 * Add XP to a user and update their level if needed
 * Returns the old level before XP was added
 */
export async function addXpToUser(
  userId: string,
  xpToAdd: number
): Promise<number> {
  // Get current user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const oldLevel = user.level;
  const newTotalXp = user.totalXp + xpToAdd;
  const newLevel = calculateLevel(newTotalXp);

  // Update user
  await db
    .update(users)
    .set({
      totalXp: newTotalXp,
      level: newLevel,
    })
    .where(eq(users.id, userId));

  return oldLevel;
}

/**
 * Check and award multiple badges based on triggers
 * This is a convenience function that checks multiple triggers at once
 */
export async function checkAndAwardBadges(
  userId: string,
  triggers: BadgeTrigger[]
): Promise<GamificationUpdate> {
  const newBadges: BadgeAward[] = [];
  let levelUp: LevelUp | null = null;

  // Get user's level before awarding badges
  const [userBefore] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userBefore) {
    throw new Error(`User not found: ${userId}`);
  }

  const oldLevel = userBefore.level;

  // Award each badge
  for (const trigger of triggers) {
    const award = await awardBadgeByTrigger(userId, trigger);
    if (award) {
      newBadges.push(award);
    }
  }

  // Get user's level after awarding badges
  const [userAfter] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userAfter) {
    throw new Error(`User not found: ${userId}`);
  }

  const newLevel = userAfter.level;

  // Check if user leveled up
  if (newLevel > oldLevel) {
    const { getLevelInfo } = await import("@shared/gamification");
    const levelInfo = getLevelInfo(newLevel);
    
    levelUp = {
      oldLevel,
      newLevel,
      symbol: levelInfo.symbol,
      label: levelInfo.label,
      tagline: levelInfo.tagline,
    };

    // Check if they reached level 30 (award Immortal badge)
    if (newLevel === 30) {
      const immortalBadge = await awardBadgeByTrigger(userId, "reach_level_30");
      if (immortalBadge) {
        newBadges.push(immortalBadge);
      }
    }
  }

  return {
    newBadges,
    levelUp,
    totalXp: userAfter.totalXp,
    currentLevel: userAfter.level,
  };
}

/**
 * Get all badges earned by a user
 */
export async function getUserBadges(userId: string) {
  const earnedBadges = await db
    .select({
      id: userBadges.id,
      badgeId: badges.id,
      name: badges.name,
      message: badges.message,
      points: badges.points,
      tier: badges.tier,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(sql`${userBadges.earnedAt} DESC`);

  return earnedBadges;
}

/**
 * Get all available badges
 */
export async function getAllBadges() {
  return await db.select().from(badges).orderBy(badges.name);
}

/**
 * Get user's gamification progress
 */
export async function getUserProgress(userId: string) {
  const [user] = await db
    .select({
      level: users.level,
      totalXp: users.totalXp,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const { getLevelInfo, getLevelProgress } = await import("@shared/gamification");
  const levelInfo = getLevelInfo(user.level);
  const progress = getLevelProgress(user.totalXp, user.level);

  return {
    level: user.level,
    totalXp: user.totalXp,
    levelInfo,
    progress,
  };
}
