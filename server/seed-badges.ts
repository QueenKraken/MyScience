import { db } from "./db";
import { badges } from "@shared/schema";
import { BADGE_DEFINITIONS } from "@shared/gamification";
import { eq } from "drizzle-orm";

export async function seedBadges() {
  console.log("Seeding badges...");
  
  try {
    for (const badgeDef of BADGE_DEFINITIONS) {
      // Check if badge already exists
      const existing = await db
        .select()
        .from(badges)
        .where(eq(badges.name, badgeDef.name))
        .limit(1);
      
      if (existing.length === 0) {
        // Insert new badge
        await db.insert(badges).values({
          name: badgeDef.name,
          trigger: badgeDef.trigger,
          points: badgeDef.points,
          message: badgeDef.message,
          tier: badgeDef.tier,
        });
        console.log(`✓ Created badge: ${badgeDef.name}`);
      } else {
        // Update existing badge in case definitions changed
        await db
          .update(badges)
          .set({
            trigger: badgeDef.trigger,
            points: badgeDef.points,
            message: badgeDef.message,
            tier: badgeDef.tier,
          })
          .where(eq(badges.name, badgeDef.name));
        console.log(`↻ Updated badge: ${badgeDef.name}`);
      }
    }
    
    console.log(`✓ Badge seeding complete (${BADGE_DEFINITIONS.length} badges)`);
  } catch (error) {
    console.error("Error seeding badges:", error);
    throw error;
  }
}
