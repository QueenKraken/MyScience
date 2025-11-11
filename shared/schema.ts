import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey(),
  name: text("name"),
  orcid: text("orcid"),
  scietyId: text("sciety_id"),
  preferences: jsonb("preferences").$type<{
    topics?: string[];
    emailNotifications?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedArticles = pgTable("saved_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  authors: jsonb("authors").$type<string[]>().notNull(),
  journal: text("journal").notNull(),
  publicationDate: text("publication_date").notNull(),
  abstract: text("abstract").notNull(),
  tags: jsonb("tags").$type<string[]>(),
  externalUrl: text("external_url"),
  savedAt: timestamp("saved_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  createdAt: true,
});

export const insertSavedArticleSchema = createInsertSchema(savedArticles).omit({
  id: true,
  savedAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertSavedArticle = z.infer<typeof insertSavedArticleSchema>;
export type SavedArticle = typeof savedArticles.$inferSelect;
