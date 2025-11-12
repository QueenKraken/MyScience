import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  jsonb,
  integer,
  index,
  unique 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth + extended profile)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Extended profile fields for MyScience
  orcid: text("orcid"),
  scietyId: text("sciety_id"),
  bio: text("bio"),
  subjectAreas: text("subject_areas").array(),
  // Gamification fields
  level: integer("level").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const savedArticles = pgTable(
  "saved_articles", 
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    authors: jsonb("authors").$type<string[]>().notNull(),
    journal: text("journal").notNull(),
    publicationDate: text("publication_date").notNull(),
    abstract: text("abstract").notNull(),
    tags: jsonb("tags").$type<string[]>(),
    externalUrl: text("external_url"),
    savedAt: timestamp("saved_at").defaultNow(),
  },
  (table) => [index("IDX_saved_articles_user").on(table.userId)]
);

// User-to-user follows
export const follows = pgTable(
  "follows",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User who is following
    followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User being followed
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_follows_follower").on(table.followerId),
    index("IDX_follows_following").on(table.followingId),
    unique("UQ_follows_pair").on(table.followerId, table.followingId), // Prevent duplicate follows
  ]
);

// Following specific authors (by name or ORCID)
// Note: Uses author_identifier which combines name and ORCID to handle authors with same name
export const authorFollows = pgTable(
  "author_follows",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    authorIdentifier: text("author_identifier").notNull(), // Unique combo: "Name|ORCID" or just "Name"
    authorName: text("author_name").notNull(), // Display name
    authorOrcid: text("author_orcid"), // Optional ORCID
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_author_follows_user").on(table.userId),
    unique("UQ_author_follows_pair").on(table.userId, table.authorIdentifier), // Prevent duplicate follows using identifier
  ]
);

// Article likes
// Note: articleId can reference EITHER saved_articles.id OR external article identifiers
// No foreign key constraint to allow liking articles not yet saved
// Application layer must validate articleId format and handle cleanup
export const articleLikes = pgTable(
  "article_likes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    articleId: varchar("article_id").notNull(), // Can be savedArticles.id or external identifier (e.g., DOI, URL hash)
    articleSource: text("article_source").notNull().default("external"), // "saved" or "external"
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_article_likes_user").on(table.userId),
    index("IDX_article_likes_article").on(table.articleId),
    unique("UQ_article_likes_pair").on(table.userId, table.articleId), // Prevent duplicate likes
  ]
);

// User blocks (bi-directional hide)
export const userBlocks = pgTable(
  "user_blocks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    blockerId: varchar("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User who blocked
    blockedId: varchar("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User being blocked
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_user_blocks_blocker").on(table.blockerId),
    index("IDX_user_blocks_blocked").on(table.blockedId), // Reverse lookups for "is viewer blocked?"
    unique("UQ_user_blocks_pair").on(table.blockerId, table.blockedId), // Prevent duplicate blocks
  ]
);

// User mutes (client-side hide, doesn't notify target)
export const userMutes = pgTable(
  "user_mutes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    muterId: varchar("muter_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User who muted
    mutedId: varchar("muted_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User being muted
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_user_mutes_muter").on(table.muterId),
    unique("UQ_user_mutes_pair").on(table.muterId, table.mutedId), // Prevent duplicate mutes
  ]
);

// User reports (for moderation)
export const userReports = pgTable(
  "user_reports",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User who reported
    reportedId: varchar("reported_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User being reported
    reason: text("reason").notNull(), // e.g., "harassment", "spam", "inappropriate_content"
    notes: text("notes"), // Optional details
    status: text("status").notNull().default("pending"), // "pending", "reviewed", "resolved"
    createdAt: timestamp("created_at").defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    index("IDX_user_reports_reporter").on(table.reporterId),
    index("IDX_user_reports_status").on(table.status),
  ]
);

// Notifications
export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Recipient
    type: text("type").notNull(), // "new_follower", "author_published", "liked_article"
    actorId: varchar("actor_id").references(() => users.id, { onDelete: "cascade" }), // User who triggered notification
    metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional data
    read: timestamp("read"), // Null = unread
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_notifications_user").on(table.userId),
    index("IDX_notifications_read").on(table.read),
  ]
);

// Gamification: Badge definitions
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // e.g., "First Steps", "Connector"
  trigger: text("trigger").notNull(), // e.g., "create_account", "follow_5_users"
  points: integer("points").notNull(), // XP awarded for earning this badge
  message: text("message").notNull(), // Social share message
  tier: text("tier").notNull(), // "Common", "Rare", "Epic", "Legendary"
  iconUrl: text("icon_url"), // Optional badge icon URL
  createdAt: timestamp("created_at").defaultNow(),
});

// Gamification: User earned badges
export const userBadges = pgTable(
  "user_badges",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    badgeId: varchar("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at").defaultNow(),
  },
  (table) => [
    index("IDX_user_badges_user").on(table.userId),
    index("IDX_user_badges_badge").on(table.badgeId),
    unique("UQ_user_badge_pair").on(table.userId, table.badgeId), // Prevent earning same badge twice
  ]
);

// Bonfire account connections
// NOTE: Tokens should be encrypted at rest using a KMS or similar before storage
export const bonfireAccounts = pgTable(
  "bonfire_accounts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }), // One Bonfire account per user
    bonfireUserId: text("bonfire_user_id").notNull(), // Bonfire's user ID
    accessToken: text("access_token").notNull(), // MUST be encrypted before storage
    refreshToken: text("refresh_token"), // MUST be encrypted before storage
    tokenExpiresAt: timestamp("token_expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("IDX_bonfire_accounts_bonfire_user").on(table.bonfireUserId)]
);

// Zod schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertSavedArticleSchema = createInsertSchema(savedArticles).omit({
  id: true,
  userId: true, // userId is injected server-side from authenticated session
  savedAt: true,
});

// Social feature schemas
export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  followerId: true, // Injected server-side
  createdAt: true,
});

export const insertAuthorFollowSchema = createInsertSchema(authorFollows).omit({
  id: true,
  userId: true, // Injected server-side
  authorIdentifier: true, // Derived server-side from authorName + authorOrcid
  createdAt: true,
});

export const insertArticleLikeSchema = createInsertSchema(articleLikes).omit({
  id: true,
  userId: true, // Injected server-side
  createdAt: true,
});

export const insertUserBlockSchema = createInsertSchema(userBlocks).omit({
  id: true,
  blockerId: true, // Injected server-side
  createdAt: true,
});

export const insertUserMuteSchema = createInsertSchema(userMutes).omit({
  id: true,
  muterId: true, // Injected server-side
  createdAt: true,
});

export const insertUserReportSchema = createInsertSchema(userReports).omit({
  id: true,
  reporterId: true, // Injected server-side
  createdAt: true,
  status: true,
  reviewedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Gamification schemas
export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type InsertSavedArticle = z.infer<typeof insertSavedArticleSchema>;
export type SavedArticle = typeof savedArticles.$inferSelect;

// Social feature types
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type AuthorFollow = typeof authorFollows.$inferSelect;
export type InsertAuthorFollow = z.infer<typeof insertAuthorFollowSchema>;
export type ArticleLike = typeof articleLikes.$inferSelect;
export type InsertArticleLike = z.infer<typeof insertArticleLikeSchema>;
export type UserBlock = typeof userBlocks.$inferSelect;
export type InsertUserBlock = z.infer<typeof insertUserBlockSchema>;
export type UserMute = typeof userMutes.$inferSelect;
export type InsertUserMute = z.infer<typeof insertUserMuteSchema>;
export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type BonfireAccount = typeof bonfireAccounts.$inferSelect;

// Gamification types
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

// Gamification API response types
export interface GamificationProgress {
  currentLevel: number;
  totalXp: number;
}
