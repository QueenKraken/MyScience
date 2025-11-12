import { db } from "./db";
import { badges } from "@shared/schema";
import { BADGE_DEFINITIONS } from "@shared/gamification";
import { eq } from "drizzle-orm";

export async function seedBadges() {
  console.log("Seeding badges...");
  
  try {
    // Use onConflictDoUpdate for atomic upsert
    for (const badgeDef of BADGE_DEFINITIONS) {
      await db
        .insert(badges)
        .values({
          name: badgeDef.name,
          trigger: badgeDef.trigger,
          points: badgeDef.points,
          message: badgeDef.message,
          tier: badgeDef.tier,
        })
        .onConflictDoUpdate({
          target: badges.name,
          set: {
            trigger: badgeDef.trigger,
            points: badgeDef.points,
            message: badgeDef.message,
            tier: badgeDef.tier,
          },
        });
      console.log(`✓ Seeded badge: ${badgeDef.name}`);
    }
    
    console.log(`✓ Badge seeding complete (${BADGE_DEFINITIONS.length} badges)`);
  } catch (error) {
    console.error("Error seeding badges:", error);
    throw error;
  }
}
