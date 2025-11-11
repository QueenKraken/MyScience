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
  saveArticle(article: InsertSavedArticle & { userId: string }): Promise<SavedArticle>;
  removeSavedArticle(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const insertData = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      orcid: userData.orcid,
      scietyId: userData.scietyId,
      bio: userData.bio,
      subjectAreas: userData.subjectAreas as string[] | null,
    };
    
    const [user] = await db
      .insert(users)
      .values(insertData)
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
          subjectAreas: userData.subjectAreas as string[] | null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<UpsertUser>): Promise<User | undefined> {
    const updateData: any = { updatedAt: new Date() };
    
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
    if (updates.profileImageUrl !== undefined) updateData.profileImageUrl = updates.profileImageUrl;
    if (updates.orcid !== undefined) updateData.orcid = updates.orcid;
    if (updates.scietyId !== undefined) updateData.scietyId = updates.scietyId;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.subjectAreas !== undefined) updateData.subjectAreas = updates.subjectAreas as string[] | null;
    
    const [user] = await db
      .update(users)
      .set(updateData)
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

  async saveArticle(articleData: InsertSavedArticle & { userId: string }): Promise<SavedArticle> {
    const [article] = await db
      .insert(savedArticles)
      .values({
        userId: articleData.userId,
        title: articleData.title,
        authors: articleData.authors as string[],
        journal: articleData.journal,
        publicationDate: articleData.publicationDate,
        abstract: articleData.abstract,
        tags: articleData.tags as string[] | null,
        externalUrl: articleData.externalUrl,
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
