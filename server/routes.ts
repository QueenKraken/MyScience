import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSavedArticleSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (Replit Auth integration)
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile (protected)
  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = updateUserProfileSchema.parse(req.body);
      
      const user = await storage.updateUserProfile(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User profile not found" });
      }
      
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // Saved Articles routes (protected)
  app.get("/api/saved-articles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const articles = await storage.getSavedArticles(userId);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching saved articles:", error);
      res.status(500).json({ error: "Failed to fetch saved articles" });
    }
  });

  app.post("/api/saved-articles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Parse the article data (without userId - client shouldn't send it)
      const articleData = insertSavedArticleSchema.parse(req.body);
      // Inject userId server-side for security
      const article = await storage.saveArticle({ ...articleData, userId });
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid article data", details: error.errors });
      }
      console.error("Error saving article:", error);
      res.status(500).json({ error: "Failed to save article" });
    }
  });

  app.delete("/api/saved-articles/:articleId", isAuthenticated, async (req: any, res) => {
    try {
      const { articleId } = req.params;
      const deleted = await storage.removeSavedArticle(articleId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting saved article:", error);
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
