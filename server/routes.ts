import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProfileSchema, insertSavedArticleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User Profile routes
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        // Create a new profile for first-time users
        const newProfile = await storage.createUserProfile({
          id: userId,
          name: null,
          orcid: null,
          scietyId: null,
          preferences: null,
        });
        return res.json(newProfile);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = insertUserProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updateUserProfile(userId, updates);
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // Saved Articles routes
  app.get("/api/user/:userId/saved-articles", async (req, res) => {
    try {
      const { userId } = req.params;
      const articles = await storage.getSavedArticles(userId);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching saved articles:", error);
      res.status(500).json({ error: "Failed to fetch saved articles" });
    }
  });

  app.post("/api/saved-articles", async (req, res) => {
    try {
      const articleData = insertSavedArticleSchema.parse(req.body);
      const article = await storage.saveArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid article data", details: error.errors });
      }
      console.error("Error saving article:", error);
      res.status(500).json({ error: "Failed to save article" });
    }
  });

  app.delete("/api/saved-articles/:articleId", async (req, res) => {
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
