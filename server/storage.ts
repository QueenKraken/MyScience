import { 
  type UserProfile, 
  type InsertUserProfile,
  type SavedArticle,
  type InsertSavedArticle 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User Profile methods
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Saved Articles methods
  getSavedArticles(userId: string): Promise<SavedArticle[]>;
  getSavedArticle(id: string): Promise<SavedArticle | undefined>;
  saveArticle(article: InsertSavedArticle): Promise<SavedArticle>;
  removeSavedArticle(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private userProfiles: Map<string, UserProfile>;
  private savedArticles: Map<string, SavedArticle>;

  constructor() {
    this.userProfiles = new Map();
    this.savedArticles = new Map();
  }

  // User Profile methods
  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(id);
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const profile: UserProfile = {
      id: insertProfile.id,
      name: insertProfile.name ?? null,
      orcid: insertProfile.orcid ?? null,
      scietyId: insertProfile.scietyId ?? null,
      preferences: insertProfile.preferences as { topics?: string[]; emailNotifications?: boolean; } | null ?? null,
      createdAt: new Date(),
    };
    this.userProfiles.set(profile.id, profile);
    return profile;
  }

  async updateUserProfile(id: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existing = this.userProfiles.get(id);
    if (!existing) return undefined;
    
    const updated: UserProfile = {
      id: existing.id,
      name: updates.name !== undefined ? updates.name ?? null : existing.name,
      orcid: updates.orcid !== undefined ? updates.orcid ?? null : existing.orcid,
      scietyId: updates.scietyId !== undefined ? updates.scietyId ?? null : existing.scietyId,
      preferences: updates.preferences !== undefined ? (updates.preferences as { topics?: string[]; emailNotifications?: boolean; } | null ?? null) : existing.preferences,
      createdAt: existing.createdAt,
    };
    this.userProfiles.set(id, updated);
    return updated;
  }

  // Saved Articles methods
  async getSavedArticles(userId: string): Promise<SavedArticle[]> {
    return Array.from(this.savedArticles.values())
      .filter(article => article.userId === userId)
      .sort((a, b) => {
        const dateA = a.savedAt?.getTime() || 0;
        const dateB = b.savedAt?.getTime() || 0;
        return dateB - dateA; // Most recent first
      });
  }

  async getSavedArticle(id: string): Promise<SavedArticle | undefined> {
    return this.savedArticles.get(id);
  }

  async saveArticle(insertArticle: InsertSavedArticle): Promise<SavedArticle> {
    const id = randomUUID();
    const article: SavedArticle = {
      userId: insertArticle.userId,
      id,
      title: insertArticle.title,
      authors: insertArticle.authors as string[],
      journal: insertArticle.journal,
      publicationDate: insertArticle.publicationDate,
      abstract: insertArticle.abstract,
      tags: insertArticle.tags ? (insertArticle.tags as string[]) : null,
      externalUrl: insertArticle.externalUrl ?? null,
      savedAt: new Date(),
    };
    this.savedArticles.set(id, article);
    return article;
  }

  async removeSavedArticle(id: string): Promise<boolean> {
    return this.savedArticles.delete(id);
  }
}

export const storage = new MemStorage();
