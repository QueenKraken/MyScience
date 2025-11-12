import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getUserProgress, getAllBadges, getUserBadges } from "./gamification";
import { 
  insertSavedArticleSchema, 
  updateUserProfileSchema,
  insertFollowSchema,
  insertAuthorFollowSchema,
  insertArticleLikeSchema,
  insertUserBlockSchema,
  insertUserMuteSchema,
  insertUserReportSchema
} from "@shared/schema";
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

  // User discovery and profile routes
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const viewerId = req.user.claims.sub;
      const search = req.query.search as string | undefined;
      const subjects = req.query.subjects as string | string[] | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const subjectAreas = subjects 
        ? (Array.isArray(subjects) ? subjects : [subjects])
        : undefined;
      
      const users = await storage.searchUsers({
        searchTerm: search,
        subjectAreas,
        limit,
        offset,
        excludeUserId: viewerId,
      });
      
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ error: "Failed to search users" });
    }
  });

  app.get("/api/users/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const viewerId = req.user.claims.sub;
      const { userId } = req.params;
      
      const userSummary = await storage.getUserSummary(userId, viewerId);
      if (!userSummary) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(userSummary);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // Gamification API endpoints
  app.get("/api/gamification/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching gamification progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.get("/api/gamification/badges", isAuthenticated, async (_req: any, res) => {
    try {
      const allBadges = await getAllBadges();
      res.json(allBadges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  app.get("/api/gamification/user-badges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadgesData = await getUserBadges(userId);
      res.json(userBadgesData);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ error: "Failed to fetch user badges" });
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

  // ===== Social Features: Follow Users =====
  app.post("/api/social/follows", isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { followingId } = insertFollowSchema.parse(req.body);
      
      // Prevent self-follow
      if (followerId === followingId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }
      
      // Check if already following
      const alreadyFollowing = await storage.isFollowing(followerId, followingId);
      if (alreadyFollowing) {
        return res.status(409).json({ error: "Already following this user" });
      }
      
      const follow = await storage.followUser(followerId, followingId);
      res.status(201).json(follow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error following user:", error);
      res.status(500).json({ error: "Failed to follow user" });
    }
  });

  app.delete("/api/social/follows/:followingId", isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { followingId } = req.params;
      
      const unfollowed = await storage.unfollowUser(followerId, followingId);
      if (!unfollowed) {
        return res.status(404).json({ error: "Follow relationship not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  });

  app.get("/api/social/follows/check/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { userId } = req.params;
      
      const isFollowing = await storage.isFollowing(followerId, userId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ error: "Failed to check follow status" });
    }
  });

  app.get("/api/social/followers/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ error: "Failed to fetch followers" });
    }
  });

  app.get("/api/social/following/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ error: "Failed to fetch following" });
    }
  });

  app.get("/api/social/follow-stats/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getFollowStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching follow stats:", error);
      res.status(500).json({ error: "Failed to fetch follow stats" });
    }
  });

  // ===== Social Features: Follow Authors =====
  app.post("/api/social/author-follows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { authorName, authorOrcid } = insertAuthorFollowSchema.parse(req.body);
      
      const authorFollow = await storage.followAuthor(userId, authorName, authorOrcid || undefined);
      res.status(201).json(authorFollow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      // Handle unique constraint violation (already following)
      if ((error as any).code === '23505') {
        return res.status(409).json({ error: "Already following this author" });
      }
      console.error("Error following author:", error);
      res.status(500).json({ error: "Failed to follow author" });
    }
  });

  app.delete("/api/social/author-follows/:authorIdentifier", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const authorIdentifier = decodeURIComponent(req.params.authorIdentifier);
      
      const unfollowed = await storage.unfollowAuthor(userId, authorIdentifier);
      if (!unfollowed) {
        return res.status(404).json({ error: "Author follow not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error unfollowing author:", error);
      res.status(500).json({ error: "Failed to unfollow author" });
    }
  });

  app.get("/api/social/author-follows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const authors = await storage.getFollowedAuthors(userId);
      res.json(authors);
    } catch (error) {
      console.error("Error fetching followed authors:", error);
      res.status(500).json({ error: "Failed to fetch followed authors" });
    }
  });

  app.get("/api/social/author-follows/check/:authorIdentifier", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const authorIdentifier = decodeURIComponent(req.params.authorIdentifier);
      
      const isFollowing = await storage.isFollowingAuthor(userId, authorIdentifier);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking author follow status:", error);
      res.status(500).json({ error: "Failed to check author follow status" });
    }
  });

  // ===== Social Features: Article Likes =====
  app.post("/api/social/article-likes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = insertArticleLikeSchema.parse(req.body);
      
      // Default to "external" source - frontend can specify "saved" if it's a saved article
      const articleSource = req.body.articleSource || "external";
      
      const like = await storage.likeArticle(userId, articleId, articleSource);
      res.status(201).json(like);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      // Handle unique constraint violation (already liked)
      if ((error as any).code === '23505') {
        return res.status(409).json({ error: "Already liked this article" });
      }
      console.error("Error liking article:", error);
      res.status(500).json({ error: "Failed to like article" });
    }
  });

  app.delete("/api/social/article-likes/:articleId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.params;
      
      const unliked = await storage.unlikeArticle(userId, articleId);
      if (!unliked) {
        return res.status(404).json({ error: "Like not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error unliking article:", error);
      res.status(500).json({ error: "Failed to unlike article" });
    }
  });

  app.get("/api/social/article-likes/check/:articleId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.params;
      
      const hasLiked = await storage.hasLikedArticle(userId, articleId);
      res.json({ hasLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ error: "Failed to check like status" });
    }
  });

  app.get("/api/social/article-likes/count/:articleId", isAuthenticated, async (req: any, res) => {
    try {
      const { articleId } = req.params;
      const count = await storage.getArticleLikes(articleId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching article likes count:", error);
      res.status(500).json({ error: "Failed to fetch likes count" });
    }
  });

  app.get("/api/social/user-likes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const likes = await storage.getUserLikes(userId);
      res.json(likes);
    } catch (error) {
      console.error("Error fetching user likes:", error);
      res.status(500).json({ error: "Failed to fetch user likes" });
    }
  });

  // ===== Social Features: Block Users =====
  app.post("/api/social/blocks", isAuthenticated, async (req: any, res) => {
    try {
      const blockerId = req.user.claims.sub;
      const { blockedId } = insertUserBlockSchema.parse(req.body);
      
      if (blockerId === blockedId) {
        return res.status(400).json({ error: "Cannot block yourself" });
      }
      
      const block = await storage.blockUser(blockerId, blockedId);
      res.status(201).json(block);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      if ((error as any).code === '23505') {
        return res.status(409).json({ error: "User already blocked" });
      }
      console.error("Error blocking user:", error);
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  app.delete("/api/social/blocks/:blockedId", isAuthenticated, async (req: any, res) => {
    try {
      const blockerId = req.user.claims.sub;
      const { blockedId } = req.params;
      
      const unblocked = await storage.unblockUser(blockerId, blockedId);
      if (!unblocked) {
        return res.status(404).json({ error: "Block not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ error: "Failed to unblock user" });
    }
  });

  app.get("/api/social/blocks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blockedUsers = await storage.getBlockedUsers(userId);
      res.json(blockedUsers);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      res.status(500).json({ error: "Failed to fetch blocked users" });
    }
  });

  // ===== Social Features: Mute Users =====
  app.post("/api/social/mutes", isAuthenticated, async (req: any, res) => {
    try {
      const muterId = req.user.claims.sub;
      const { mutedId } = insertUserMuteSchema.parse(req.body);
      
      if (muterId === mutedId) {
        return res.status(400).json({ error: "Cannot mute yourself" });
      }
      
      const mute = await storage.muteUser(muterId, mutedId);
      res.status(201).json(mute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      if ((error as any).code === '23505') {
        return res.status(409).json({ error: "User already muted" });
      }
      console.error("Error muting user:", error);
      res.status(500).json({ error: "Failed to mute user" });
    }
  });

  app.delete("/api/social/mutes/:mutedId", isAuthenticated, async (req: any, res) => {
    try {
      const muterId = req.user.claims.sub;
      const { mutedId } = req.params;
      
      const unmuted = await storage.unmuteUser(muterId, mutedId);
      if (!unmuted) {
        return res.status(404).json({ error: "Mute not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error unmuting user:", error);
      res.status(500).json({ error: "Failed to unmute user" });
    }
  });

  app.get("/api/social/mutes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mutedUsers = await storage.getMutedUsers(userId);
      res.json(mutedUsers);
    } catch (error) {
      console.error("Error fetching muted users:", error);
      res.status(500).json({ error: "Failed to fetch muted users" });
    }
  });

  // ===== Social Features: Report Users =====
  app.post("/api/social/reports", isAuthenticated, async (req: any, res) => {
    try {
      const reporterId = req.user.claims.sub;
      const { reportedId, reason, notes } = insertUserReportSchema.parse(req.body);
      
      if (reporterId === reportedId) {
        return res.status(400).json({ error: "Cannot report yourself" });
      }
      
      const report = await storage.reportUser(reporterId, reportedId, reason, notes || undefined);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error reporting user:", error);
      res.status(500).json({ error: "Failed to report user" });
    }
  });

  // ===== Notifications =====
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unreadOnly = req.query.unreadOnly === 'true';
      
      const notifications = await storage.getNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  app.put("/api/notifications/:notificationId/read", isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      const marked = await storage.markNotificationAsRead(notificationId);
      
      if (!marked) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/mark-all-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
