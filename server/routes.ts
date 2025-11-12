import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getUserProgress, getAllBadges, getUserBadges, checkAndAwardBadges } from "./gamification";
import { 
  insertSavedArticleSchema, 
  updateUserProfileSchema,
  insertFollowSchema,
  insertAuthorFollowSchema,
  insertArticleLikeSchema,
  insertUserBlockSchema,
  insertUserMuteSchema,
  insertUserReportSchema,
  insertCommentSchema,
  insertForumPostSchema,
  insertForumPostLikeSchema,
  insertForumPostCommentSchema,
  insertDiscussionSpaceSchema,
  insertDiscussionSpaceMemberSchema,
  insertDiscussionSpaceMessageSchema,
  savedArticles,
  users,
  badges,
  userBadges,
  articleLikes,
  comments,
  forumPosts,
  forumPostComments
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc, sql, inArray, and, isNull } from "drizzle-orm";

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

  app.post('/api/auth/logout', async (req: any, res) => {
    // Handle unauthenticated requests gracefully
    if (!req.logout || !req.session) {
      res.clearCookie('connect.sid');
      return res.json({ success: true });
    }

    req.logout((err: any) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      req.session.destroy((sessionErr: any) => {
        if (sessionErr) {
          console.error("Error destroying session:", sessionErr);
          return res.status(500).json({ error: "Failed to destroy session" });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
      });
    });
  });

  // Update user profile (protected)
  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = updateUserProfileSchema.parse(req.body);
      
      // Get user before update to check badge triggers
      const userBefore = await storage.getUser(userId);
      
      const user = await storage.updateUserProfile(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User profile not found" });
      }
      
      // Check for badge triggers (best-effort, don't block on errors)
      const badgeTriggers: import("@shared/gamification").BadgeTrigger[] = [];
      
      // Check if ORCID was connected (wasn't present before, is present now)
      if (!userBefore?.orcid && user.orcid) {
        badgeTriggers.push("connect_orcid");
      }
      
      // Check if profile is complete (has all key fields filled)
      const isProfileComplete = !!(
        user.firstName &&
        user.lastName &&
        user.bio &&
        user.subjectAreas &&
        user.subjectAreas.length > 0
      );
      
      if (isProfileComplete) {
        badgeTriggers.push("complete_profile");
      }
      
      // Award badges if any triggers matched (non-blocking)
      if (badgeTriggers.length > 0) {
        try {
          await checkAndAwardBadges(userId, badgeTriggers);
        } catch (badgeError) {
          console.error("Error awarding profile badges:", badgeError);
        }
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

  app.get("/api/saved-articles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const article = await storage.getSavedArticle(id);
      
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching saved article:", error);
      res.status(500).json({ error: "Failed to fetch saved article" });
    }
  });

  app.post("/api/saved-articles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Parse the article data (without userId - client shouldn't send it)
      const articleData = insertSavedArticleSchema.parse(req.body);
      // Inject userId server-side for security
      const article = await storage.saveArticle({ ...articleData, userId });
      
      // Award "First Save" badge (best-effort, doesn't block if it fails)
      // TODO (Production): Move to post-commit queue once storage adds transactions
      try {
        await checkAndAwardBadges(userId, ["first_save"]);
      } catch (badgeError) {
        console.error("Error awarding first_save badge:", badgeError);
      }
      
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
      
      // Check for "Connector" badge (5 follows) - service handles threshold check
      // TODO (Production): Move to post-commit queue once storage adds transactions
      try {
        await checkAndAwardBadges(followerId, ["follow_5_users"]);
      } catch (badgeError) {
        console.error("Error awarding follow_5_users badge:", badgeError);
      }
      
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
      
      // Award "First Like" badge (best-effort, doesn't block if it fails)
      // TODO (Production): Move to post-commit queue once storage adds transactions
      try {
        await checkAndAwardBadges(userId, ["first_like"]);
      } catch (badgeError) {
        console.error("Error awarding first_like badge:", badgeError);
      }
      
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

  // ===== Activity Feed =====
  app.get("/api/activity-feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Get user's recent activity
      const earnedBadgesQuery = db.select({
        badge: badges,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(badges.id, userBadges.badgeId))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
      
      const [userSaves, userLikes, earnedBadges, following] = await Promise.all([
        storage.getSavedArticles(userId),
        storage.getUserLikes(userId),
        earnedBadgesQuery,
        storage.getFollowing(userId),
      ]);
      
      // Get followed users' activities
      const followedUserIds = following.map(u => u.id);
      let socialSaves: any[] = [];
      let socialLikes: any[] = [];
      
      if (followedUserIds.length > 0) {
        // Process each followed user's activities separately to avoid array issues
        const socialSavesPromises = followedUserIds.map(id =>
          db.select({
            article: savedArticles,
            user: users,
          })
          .from(savedArticles)
          .innerJoin(users, eq(users.id, savedArticles.userId))
          .where(eq(savedArticles.userId, id))
          .orderBy(desc(savedArticles.savedAt))
          .limit(10)
        );
        
        const socialLikesPromises = followedUserIds.map(id =>
          db.select({
            like: articleLikes,
            user: users,
            article: savedArticles,
          })
          .from(articleLikes)
          .innerJoin(users, eq(users.id, articleLikes.userId))
          .leftJoin(savedArticles, eq(savedArticles.id, articleLikes.articleId))
          .where(eq(articleLikes.userId, id))
          .orderBy(desc(articleLikes.createdAt))
          .limit(10)
        );
        
        const [savesResults, likesResults] = await Promise.all([
          Promise.all(socialSavesPromises),
          Promise.all(socialLikesPromises),
        ]);
        
        // Flatten the results
        socialSaves = savesResults.flat();
        socialLikes = likesResults.flat();
      }
      
      // Aggregate all activities with timestamps
      const activities: any[] = [];
      
      // User's saves
      userSaves.forEach(save => {
        activities.push({
          type: 'save',
          action: `You saved "${save.title}"`,
          timestamp: save.savedAt,
          articleId: save.id,
          articleTitle: save.title,
          externalUrl: save.externalUrl,
          isOwn: true,
        });
      });
      
      // User's likes
      userLikes.forEach(like => {
        activities.push({
          type: 'like',
          action: `You liked an article`,
          timestamp: like.createdAt,
          articleId: like.articleId,
          isOwn: true,
        });
      });
      
      // User's badges
      earnedBadges.forEach(({ badge, earnedAt }: any) => {
        activities.push({
          type: 'badge',
          action: `Earned ${badge.name} badge`,
          timestamp: earnedAt,
          badgeName: badge.name,
          badgeTier: badge.tier,
          badgePoints: badge.points,
          isOwn: true,
        });
      });
      
      // Followed users' saves
      socialSaves.forEach(({ article, user }) => {
        activities.push({
          type: 'social_save',
          action: `${user.firstName || user.email} saved "${article.title}"`,
          timestamp: article.savedAt,
          userId: user.id,
          userName: user.firstName || user.email,
          articleId: article.id,
          articleTitle: article.title,
          externalUrl: article.externalUrl,
          isOwn: false,
        });
      });
      
      // Followed users' likes (only if we have article data)
      socialLikes.forEach(({ like, user, article }) => {
        if (article) {
          activities.push({
            type: 'social_like',
            action: `${user.firstName || user.email} liked "${article.title}"`,
            timestamp: like.createdAt,
            userId: user.id,
            userName: user.firstName || user.email,
            articleId: article.id,
            articleTitle: article.title,
            externalUrl: article.externalUrl,
            isOwn: false,
          });
        }
      });
      
      // Sort by timestamp descending and limit
      activities.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });
      
      const limitedActivities = activities.slice(0, limit);
      
      res.json(limitedActivities);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ error: "Failed to fetch activity feed" });
    }
  });

  // ===== Communication Features =====

  // Comment routes (protected)
  app.post("/api/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment({ ...commentData, userId });
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid comment data", details: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/comments/:articleId", isAuthenticated, async (req: any, res) => {
    try {
      const { articleId } = req.params;
      const comments = await storage.getArticleComments(articleId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.put("/api/comments/:commentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { commentId } = req.params;
      
      // Validate content
      const { content } = z.object({ content: z.string().min(1) }).parse(req.body);
      
      // Verify ownership
      const existingComment = await storage.getComment(commentId);
      if (!existingComment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      if (existingComment.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to edit this comment" });
      }
      
      const comment = await storage.updateComment(commentId, content);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid content", details: error.errors });
      }
      console.error("Error updating comment:", error);
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:commentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { commentId } = req.params;
      
      // Verify ownership
      const existingComment = await storage.getComment(commentId);
      if (!existingComment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      if (existingComment.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this comment" });
      }
      
      await storage.deleteComment(commentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Forum post routes (protected)
  app.post("/api/forum-posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertForumPostSchema.parse(req.body);
      const post = await storage.createForumPost({ ...postData, userId });
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid post data", details: error.errors });
      }
      console.error("Error creating forum post:", error);
      res.status(500).json({ error: "Failed to create forum post" });
    }
  });

  app.get("/api/forum-posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const enrichedPosts = await storage.getForumPostsWithMeta(userId, limit, offset);
      res.json(enrichedPosts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ error: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum-posts/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const posts = await storage.getUserForumPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user forum posts:", error);
      res.status(500).json({ error: "Failed to fetch user forum posts" });
    }
  });

  app.put("/api/forum-posts/:postId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      // Validate content
      const { content } = z.object({ content: z.string().min(1) }).parse(req.body);
      
      // Verify ownership
      const [existingPost] = await db.select().from(forumPosts).where(eq(forumPosts.id, postId));
      if (!existingPost) {
        return res.status(404).json({ error: "Post not found" });
      }
      if (existingPost.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to edit this post" });
      }
      
      const post = await storage.updateForumPost(postId, content);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid content", details: error.errors });
      }
      console.error("Error updating forum post:", error);
      res.status(500).json({ error: "Failed to update forum post" });
    }
  });

  app.delete("/api/forum-posts/:postId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      // Verify ownership
      const [existingPost] = await db.select().from(forumPosts).where(eq(forumPosts.id, postId));
      if (!existingPost) {
        return res.status(404).json({ error: "Post not found" });
      }
      if (existingPost.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this post" });
      }
      
      await storage.deleteForumPost(postId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting forum post:", error);
      res.status(500).json({ error: "Failed to delete forum post" });
    }
  });

  app.post("/api/forum-posts/:postId/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      const hasLiked = await storage.hasLikedForumPost(userId, postId);
      if (hasLiked) {
        return res.status(409).json({ error: "Already liked this post" });
      }
      
      const like = await storage.likeForumPost(userId, postId);
      res.status(201).json(like);
    } catch (error) {
      console.error("Error liking forum post:", error);
      res.status(500).json({ error: "Failed to like forum post" });
    }
  });

  app.delete("/api/forum-posts/:postId/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      const unliked = await storage.unlikeForumPost(userId, postId);
      if (!unliked) {
        return res.status(404).json({ error: "Like not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error unliking forum post:", error);
      res.status(500).json({ error: "Failed to unlike forum post" });
    }
  });

  app.get("/api/forum-posts/:postId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getForumPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching forum post comments:", error);
      res.status(500).json({ error: "Failed to fetch forum post comments" });
    }
  });

  app.post("/api/forum-posts/:postId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      // Validate content
      const { content } = z.object({ content: z.string().min(1) }).parse(req.body);
      
      const comment = await storage.createForumPostComment({ postId, content, userId });
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid content", details: error.errors });
      }
      console.error("Error creating forum post comment:", error);
      res.status(500).json({ error: "Failed to create forum post comment" });
    }
  });

  // Discussion space routes (protected)
  app.post("/api/discussion-spaces", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const spaceData = insertDiscussionSpaceSchema.parse(req.body);
      
      const space = await storage.createDiscussionSpace({ ...spaceData, creatorId: userId });
      
      // Automatically add creator as member with "creator" role
      await storage.addDiscussionSpaceMember({
        spaceId: space.id,
        userId,
        role: "creator"
      });
      
      res.status(201).json(space);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid discussion space data", details: error.errors });
      }
      console.error("Error creating discussion space:", error);
      res.status(500).json({ error: "Failed to create discussion space" });
    }
  });

  app.get("/api/discussion-spaces", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const spaces = await storage.getUserDiscussionSpaces(userId);
      res.json(spaces);
    } catch (error) {
      console.error("Error fetching discussion spaces:", error);
      res.status(500).json({ error: "Failed to fetch discussion spaces" });
    }
  });

  app.get("/api/discussion-spaces/:spaceId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { spaceId } = req.params;
      
      // Verify membership
      const isMember = await storage.isDiscussionSpaceMember(spaceId, userId);
      if (!isMember) {
        return res.status(403).json({ error: "Not a member of this discussion space" });
      }
      
      const space = await storage.getDiscussionSpace(spaceId);
      if (!space) {
        return res.status(404).json({ error: "Discussion space not found" });
      }
      
      res.json(space);
    } catch (error) {
      console.error("Error fetching discussion space:", error);
      res.status(500).json({ error: "Failed to fetch discussion space" });
    }
  });

  app.put("/api/discussion-spaces/:spaceId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { spaceId } = req.params;
      const updates = req.body;
      
      // Verify creator or moderator role
      const space = await storage.getDiscussionSpace(spaceId);
      if (!space) {
        return res.status(404).json({ error: "Discussion space not found" });
      }
      if (space.creatorId !== userId) {
        return res.status(403).json({ error: "Only the creator can update this space" });
      }
      
      const updatedSpace = await storage.updateDiscussionSpace(spaceId, updates);
      res.json(updatedSpace);
    } catch (error) {
      console.error("Error updating discussion space:", error);
      res.status(500).json({ error: "Failed to update discussion space" });
    }
  });

  app.delete("/api/discussion-spaces/:spaceId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { spaceId } = req.params;
      
      // Verify creator role
      const space = await storage.getDiscussionSpace(spaceId);
      if (!space) {
        return res.status(404).json({ error: "Discussion space not found" });
      }
      if (space.creatorId !== userId) {
        return res.status(403).json({ error: "Only the creator can delete this space" });
      }
      
      await storage.deleteDiscussionSpace(spaceId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting discussion space:", error);
      res.status(500).json({ error: "Failed to delete discussion space" });
    }
  });

  app.get("/api/discussion-spaces/:spaceId/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { spaceId } = req.params;
      
      // Verify membership or creator status
      const space = await storage.getDiscussionSpace(spaceId);
      if (!space) {
        return res.status(404).json({ error: "Discussion space not found" });
      }
      
      const isMember = await storage.isDiscussionSpaceMember(spaceId, userId);
      const isCreator = space.creatorId === userId;
      
      if (!isMember && !isCreator) {
        return res.status(403).json({ error: "Not a member of this discussion space" });
      }
      
      const members = await storage.getDiscussionSpaceMembersWithUsers(spaceId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching discussion space members:", error);
      res.status(500).json({ error: "Failed to fetch discussion space members" });
    }
  });

  app.post("/api/discussion-spaces/:spaceId/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { spaceId } = req.params;
      const memberData = insertDiscussionSpaceMemberSchema.parse(req.body);
      
      // Verify creator or moderator role
      const space = await storage.getDiscussionSpace(spaceId);
      if (!space) {
        return res.status(404).json({ error: "Discussion space not found" });
      }
      if (space.creatorId !== userId) {
        return res.status(403).json({ error: "Only the creator can add members" });
      }
      
      // Check if user is already a member
      const isAlreadyMember = await storage.isDiscussionSpaceMember(spaceId, memberData.userId);
      if (isAlreadyMember) {
        return res.status(409).json({ error: "User is already a member of this space" });
      }
      
      const member = await storage.addDiscussionSpaceMember({ ...memberData, spaceId });
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid member data", details: error.errors });
      }
      console.error("Error adding discussion space member:", error);
      res.status(500).json({ error: "Failed to add discussion space member" });
    }
  });

  app.delete("/api/discussion-spaces/:spaceId/members/:memberId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { spaceId, memberId } = req.params;
      
      // Verify creator role or self-removal
      const space = await storage.getDiscussionSpace(spaceId);
      if (!space) {
        return res.status(404).json({ error: "Discussion space not found" });
      }
      
      // Prevent creator from removing themselves
      if (memberId === space.creatorId) {
        return res.status(403).json({ error: "Creator cannot be removed from the space" });
      }
      
      // Only creator or self can remove
      if (space.creatorId !== userId && memberId !== userId) {
        return res.status(403).json({ error: "Not authorized to remove this member" });
      }
      
      await storage.removeDiscussionSpaceMember(spaceId, memberId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing discussion space member:", error);
      res.status(500).json({ error: "Failed to remove discussion space member" });
    }
  });

  app.get("/api/discussion-spaces/:spaceId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { spaceId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      // Verify membership
      const isMember = await storage.isDiscussionSpaceMember(spaceId, userId);
      if (!isMember) {
        return res.status(403).json({ error: "Not a member of this discussion space" });
      }
      
      const messages = await storage.getDiscussionSpaceMessagesWithUsers(spaceId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching discussion space messages:", error);
      res.status(500).json({ error: "Failed to fetch discussion space messages" });
    }
  });

  app.post("/api/discussion-spaces/:spaceId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { spaceId } = req.params;
      const messageData = insertDiscussionSpaceMessageSchema.parse(req.body);
      
      // Verify membership
      const isMember = await storage.isDiscussionSpaceMember(spaceId, userId);
      if (!isMember) {
        return res.status(403).json({ error: "Not a member of this discussion space" });
      }
      
      const message = await storage.createDiscussionSpaceMessage({ ...messageData, spaceId, userId });
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      console.error("Error creating discussion space message:", error);
      res.status(500).json({ error: "Failed to create discussion space message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
