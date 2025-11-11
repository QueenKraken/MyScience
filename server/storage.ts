import { 
  users,
  savedArticles,
  type User, 
  type UpsertUser,
  type SavedArticle,
  type InsertSavedArticle 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<UpsertUser>): Promise<User | undefined>;
  
  // Saved Articles methods
  getSavedArticles(userId: string): Promise<SavedArticle[]>;
  getSavedArticle(id: string): Promise<SavedArticle | undefined>;
  saveArticle(article: InsertSavedArticle): Promise<SavedArticle>;
  removeSavedArticle(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        subjectAreas: userData.subjectAreas || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          orcid: userData.orcid,
          scietyId: userData.scietyId,
          bio: userData.bio,
          subjectAreas: userData.subjectAreas || null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        firstName: updates.firstName,
        lastName: updates.lastName,
        profileImageUrl: updates.profileImageUrl,
        orcid: updates.orcid,
        scietyId: updates.scietyId,
        bio: updates.bio,
        subjectAreas: updates.subjectAreas || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Saved Articles methods
  async getSavedArticles(userId: string): Promise<SavedArticle[]> {
    const articles = await db
      .select()
      .from(savedArticles)
      .where(eq(savedArticles.userId, userId))
      .orderBy(savedArticles.savedAt);
    return articles;
  }

  async getSavedArticle(id: string): Promise<SavedArticle | undefined> {
    const [article] = await db
      .select()
      .from(savedArticles)
      .where(eq(savedArticles.id, id));
    return article;
  }

  async saveArticle(insertArticle: InsertSavedArticle): Promise<SavedArticle> {
    const [article] = await db
      .insert(savedArticles)
      .values({
        ...insertArticle,
        authors: insertArticle.authors || [],
        tags: insertArticle.tags || null,
      })
      .returning();
    return article;
  }

  async removeSavedArticle(id: string): Promise<boolean> {
    const result = await db
      .delete(savedArticles)
      .where(eq(savedArticles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
