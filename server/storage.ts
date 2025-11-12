import { 
  users,
  savedArticles,
  follows,
  authorFollows,
  articleLikes,
  userBlocks,
  userMutes,
  userReports,
  notifications,
  comments,
  forumPosts,
  forumPostLikes,
  forumPostComments,
  discussionSpaces,
  discussionSpaceMembers,
  discussionSpaceMessages,
  type User, 
  type UpsertUser,
  type SavedArticle,
  type InsertSavedArticle,
  type Follow,
  type InsertFollow,
  type AuthorFollow,
  type InsertAuthorFollow,
  type ArticleLike,
  type InsertArticleLike,
  type UserBlock,
  type InsertUserBlock,
  type UserMute,
  type InsertUserMute,
  type UserReport,
  type InsertUserReport,
  type Notification,
  type InsertNotification,
  type Comment,
  type InsertComment,
  type ForumPost,
  type InsertForumPost,
  type ForumPostLike,
  type InsertForumPostLike,
  type ForumPostComment,
  type InsertForumPostComment,
  type DiscussionSpace,
  type InsertDiscussionSpace,
  type DiscussionSpaceMember,
  type InsertDiscussionSpaceMember,
  type DiscussionSpaceMessage,
  type InsertDiscussionSpaceMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, isNull, count, sql } from "drizzle-orm";

export type UserSummary = User & {
  followersCount: number;
  followingCount: number;
  isFollowedByViewer?: boolean;
};

export type SearchUsersParams = {
  searchTerm?: string;
  subjectAreas?: string[];
  limit?: number;
  offset?: number;
  excludeUserId?: string;
};

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<UpsertUser>): Promise<User | undefined>;
  getUserSummary(userId: string, viewerId?: string): Promise<UserSummary | undefined>;
  searchUsers(params: SearchUsersParams): Promise<User[]>;
  
  // Saved Articles methods
  getSavedArticles(userId: string): Promise<SavedArticle[]>;
  getSavedArticle(id: string): Promise<SavedArticle | undefined>;
  saveArticle(article: InsertSavedArticle & { userId: string }): Promise<SavedArticle>;
  removeSavedArticle(id: string): Promise<boolean>;
  
  // Follow operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<boolean>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  getFollowStats(userId: string): Promise<{ followersCount: number; followingCount: number }>;
  
  // Author follow operations
  followAuthor(userId: string, authorName: string, authorOrcid?: string): Promise<AuthorFollow>;
  unfollowAuthor(userId: string, authorIdentifier: string): Promise<boolean>;
  getFollowedAuthors(userId: string): Promise<AuthorFollow[]>;
  isFollowingAuthor(userId: string, authorIdentifier: string): Promise<boolean>;
  
  // Article like operations
  likeArticle(userId: string, articleId: string, articleSource: string): Promise<ArticleLike>;
  unlikeArticle(userId: string, articleId: string): Promise<boolean>;
  hasLikedArticle(userId: string, articleId: string): Promise<boolean>;
  getArticleLikes(articleId: string): Promise<number>;
  getUserLikes(userId: string): Promise<ArticleLike[]>;
  
  // Block operations
  blockUser(blockerId: string, blockedId: string): Promise<UserBlock>;
  unblockUser(blockerId: string, blockedId: string): Promise<boolean>;
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;
  getBlockedUsers(userId: string): Promise<User[]>;
  
  // Mute operations
  muteUser(muterId: string, mutedId: string): Promise<UserMute>;
  unmuteUser(muterId: string, mutedId: string): Promise<boolean>;
  isMuted(muterId: string, mutedId: string): Promise<boolean>;
  getMutedUsers(userId: string): Promise<User[]>;
  
  // Report operations
  reportUser(reporterId: string, reportedId: string, reason: string, notes?: string): Promise<UserReport>;
  getUserReports(userId: string): Promise<UserReport[]>;
  getPendingReports(): Promise<UserReport[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
  getUnreadCount(userId: string): Promise<number>;
  
  // Comment operations
  createComment(comment: InsertComment & { userId: string }): Promise<Comment>;
  getArticleComments(articleId: string): Promise<Comment[]>;
  updateComment(commentId: string, content: string): Promise<Comment | undefined>;
  deleteComment(commentId: string): Promise<boolean>;
  getComment(commentId: string): Promise<Comment | undefined>;
  
  // Forum post operations
  createForumPost(post: InsertForumPost & { userId: string }): Promise<ForumPost>;
  getForumPosts(limit?: number, offset?: number): Promise<ForumPost[]>;
  getUserForumPosts(userId: string): Promise<ForumPost[]>;
  updateForumPost(postId: string, content: string): Promise<ForumPost | undefined>;
  deleteForumPost(postId: string): Promise<boolean>;
  likeForumPost(userId: string, postId: string): Promise<ForumPostLike>;
  unlikeForumPost(userId: string, postId: string): Promise<boolean>;
  hasLikedForumPost(userId: string, postId: string): Promise<boolean>;
  getForumPostLikesCount(postId: string): Promise<number>;
  
  // Forum post comment operations
  createForumPostComment(comment: InsertForumPostComment & { userId: string }): Promise<ForumPostComment>;
  getForumPostComments(postId: string): Promise<ForumPostComment[]>;
  updateForumPostComment(commentId: string, content: string): Promise<ForumPostComment | undefined>;
  deleteForumPostComment(commentId: string): Promise<boolean>;
  
  // Discussion space operations
  createDiscussionSpace(space: InsertDiscussionSpace & { creatorId: string }): Promise<DiscussionSpace>;
  getDiscussionSpace(spaceId: string): Promise<DiscussionSpace | undefined>;
  getUserDiscussionSpaces(userId: string): Promise<DiscussionSpace[]>;
  updateDiscussionSpace(spaceId: string, updates: Partial<InsertDiscussionSpace>): Promise<DiscussionSpace | undefined>;
  deleteDiscussionSpace(spaceId: string): Promise<boolean>;
  
  // Discussion space member operations
  addDiscussionSpaceMember(member: InsertDiscussionSpaceMember): Promise<DiscussionSpaceMember>;
  removeDiscussionSpaceMember(spaceId: string, userId: string): Promise<boolean>;
  getDiscussionSpaceMembers(spaceId: string): Promise<DiscussionSpaceMember[]>;
  getDiscussionSpaceMembersWithUsers(spaceId: string): Promise<any[]>;
  isDiscussionSpaceMember(spaceId: string, userId: string): Promise<boolean>;
  
  // Discussion space message operations
  createDiscussionSpaceMessage(message: InsertDiscussionSpaceMessage & { userId: string }): Promise<DiscussionSpaceMessage>;
  getDiscussionSpaceMessages(spaceId: string, limit?: number): Promise<DiscussionSpaceMessage[]>;
  getDiscussionSpaceMessagesWithUsers(spaceId: string, limit?: number): Promise<any[]>;
  updateDiscussionSpaceMessage(messageId: string, content: string): Promise<DiscussionSpaceMessage | undefined>;
  deleteDiscussionSpaceMessage(messageId: string): Promise<boolean>;
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

  async getUserSummary(userId: string, viewerId?: string): Promise<UserSummary | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const stats = await this.getFollowStats(userId);
    const isFollowedByViewer = viewerId 
      ? await this.isFollowing(viewerId, userId)
      : false;

    return {
      ...user,
      followersCount: stats.followersCount,
      followingCount: stats.followingCount,
      isFollowedByViewer,
    };
  }

  async searchUsers(params: SearchUsersParams): Promise<User[]> {
    const { searchTerm, subjectAreas, limit = 20, offset = 0, excludeUserId } = params;
    
    let query = db.select().from(users);
    
    const conditions: any[] = [];
    
    if (searchTerm) {
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${users.firstName}) LIKE ${searchPattern}`,
          sql`LOWER(${users.lastName}) LIKE ${searchPattern}`,
          sql`LOWER(${users.email}) LIKE ${searchPattern}`,
          sql`LOWER(${users.bio}) LIKE ${searchPattern}`
        )
      );
    }
    
    if (subjectAreas && subjectAreas.length > 0) {
      // Use PostgreSQL array overlap operator (&&) with safe parameterization
      // Each subject area is individually bound as a parameter, then assembled into an ARRAY
      conditions.push(
        sql`${users.subjectAreas} && ARRAY[${sql.join(subjectAreas.map(s => sql`${s}`), sql`, `)}]`
      );
    }
    
    if (excludeUserId) {
      conditions.push(sql`${users.id} != ${excludeUserId}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const results = await query
      .orderBy(users.firstName, users.lastName)
      .limit(limit)
      .offset(offset);
    
    return results;
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

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    
    // Create notification for the followed user
    await this.createNotification({
      userId: followingId,
      type: "new_follower",
      actorId: followerId,
      metadata: {},
    });
    
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
    return !!follow;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        orcid: users.orcid,
        scietyId: users.scietyId,
        bio: users.bio,
        subjectAreas: users.subjectAreas,
        level: users.level,
        totalXp: users.totalXp,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    return result;
  }

  async getFollowing(userId: string): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        orcid: users.orcid,
        scietyId: users.scietyId,
        bio: users.bio,
        subjectAreas: users.subjectAreas,
        level: users.level,
        totalXp: users.totalXp,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    return result;
  }

  async getFollowStats(userId: string): Promise<{ followersCount: number; followingCount: number }> {
    const [followersResult] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, userId));
    
    const [followingResult] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    return {
      followersCount: followersResult?.count || 0,
      followingCount: followingResult?.count || 0,
    };
  }

  // Author follow operations
  async followAuthor(userId: string, authorName: string, authorOrcid?: string): Promise<AuthorFollow> {
    // Create unique identifier: "Name|ORCID" or just "Name"
    const authorIdentifier = authorOrcid ? `${authorName}|${authorOrcid}` : authorName;
    
    const [authorFollow] = await db
      .insert(authorFollows)
      .values({
        userId,
        authorIdentifier,
        authorName,
        authorOrcid: authorOrcid || null,
      })
      .returning();
    
    return authorFollow;
  }

  async unfollowAuthor(userId: string, authorIdentifier: string): Promise<boolean> {
    const result = await db
      .delete(authorFollows)
      .where(and(
        eq(authorFollows.userId, userId),
        eq(authorFollows.authorIdentifier, authorIdentifier)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getFollowedAuthors(userId: string): Promise<AuthorFollow[]> {
    const authors = await db
      .select()
      .from(authorFollows)
      .where(eq(authorFollows.userId, userId))
      .orderBy(desc(authorFollows.createdAt));
    return authors;
  }

  async isFollowingAuthor(userId: string, authorIdentifier: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(authorFollows)
      .where(and(
        eq(authorFollows.userId, userId),
        eq(authorFollows.authorIdentifier, authorIdentifier)
      ));
    return !!follow;
  }

  // Article like operations
  async likeArticle(userId: string, articleId: string, articleSource: string = "external"): Promise<ArticleLike> {
    const [like] = await db
      .insert(articleLikes)
      .values({ userId, articleId, articleSource })
      .returning();
    return like;
  }

  async unlikeArticle(userId: string, articleId: string): Promise<boolean> {
    const result = await db
      .delete(articleLikes)
      .where(and(
        eq(articleLikes.userId, userId),
        eq(articleLikes.articleId, articleId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async hasLikedArticle(userId: string, articleId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(articleLikes)
      .where(and(
        eq(articleLikes.userId, userId),
        eq(articleLikes.articleId, articleId)
      ));
    return !!like;
  }

  async getArticleLikes(articleId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(articleLikes)
      .where(eq(articleLikes.articleId, articleId));
    return result?.count || 0;
  }

  async getUserLikes(userId: string): Promise<ArticleLike[]> {
    const likes = await db
      .select()
      .from(articleLikes)
      .where(eq(articleLikes.userId, userId))
      .orderBy(desc(articleLikes.createdAt));
    return likes;
  }

  // Block operations
  async blockUser(blockerId: string, blockedId: string): Promise<UserBlock> {
    const [block] = await db
      .insert(userBlocks)
      .values({ blockerId, blockedId })
      .returning();
    
    // Remove any existing follow relationships
    await this.unfollowUser(blockerId, blockedId);
    await this.unfollowUser(blockedId, blockerId);
    
    return block;
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
    const result = await db
      .delete(userBlocks)
      .where(and(
        eq(userBlocks.blockerId, blockerId),
        eq(userBlocks.blockedId, blockedId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(userBlocks)
      .where(and(
        eq(userBlocks.blockerId, blockerId),
        eq(userBlocks.blockedId, blockedId)
      ));
    return !!block;
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        orcid: users.orcid,
        scietyId: users.scietyId,
        bio: users.bio,
        subjectAreas: users.subjectAreas,
        level: users.level,
        totalXp: users.totalXp,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(userBlocks)
      .innerJoin(users, eq(userBlocks.blockedId, users.id))
      .where(eq(userBlocks.blockerId, userId));
    return result;
  }

  // Mute operations
  async muteUser(muterId: string, mutedId: string): Promise<UserMute> {
    const [mute] = await db
      .insert(userMutes)
      .values({ muterId, mutedId })
      .returning();
    return mute;
  }

  async unmuteUser(muterId: string, mutedId: string): Promise<boolean> {
    const result = await db
      .delete(userMutes)
      .where(and(
        eq(userMutes.muterId, muterId),
        eq(userMutes.mutedId, mutedId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isMuted(muterId: string, mutedId: string): Promise<boolean> {
    const [mute] = await db
      .select()
      .from(userMutes)
      .where(and(
        eq(userMutes.muterId, muterId),
        eq(userMutes.mutedId, mutedId)
      ));
    return !!mute;
  }

  async getMutedUsers(userId: string): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        orcid: users.orcid,
        scietyId: users.scietyId,
        bio: users.bio,
        subjectAreas: users.subjectAreas,
        level: users.level,
        totalXp: users.totalXp,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(userMutes)
      .innerJoin(users, eq(userMutes.mutedId, users.id))
      .where(eq(userMutes.muterId, userId));
    return result;
  }

  // Report operations
  async reportUser(reporterId: string, reportedId: string, reason: string, notes?: string): Promise<UserReport> {
    const [report] = await db
      .insert(userReports)
      .values({
        reporterId,
        reportedId,
        reason,
        notes: notes || null,
      })
      .returning();
    return report;
  }

  async getUserReports(userId: string): Promise<UserReport[]> {
    const reports = await db
      .select()
      .from(userReports)
      .where(eq(userReports.reportedId, userId))
      .orderBy(desc(userReports.createdAt));
    return reports;
  }

  async getPendingReports(): Promise<UserReport[]> {
    const reports = await db
      .select()
      .from(userReports)
      .where(eq(userReports.status, "pending"))
      .orderBy(desc(userReports.createdAt));
    return reports;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(isNull(notifications.read));
    }
    
    const result = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return result;
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: new Date() })
      .where(eq(notifications.id, notificationId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: new Date() })
      .where(and(
        eq(notifications.userId, userId),
        isNull(notifications.read)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        isNull(notifications.read)
      ));
    return result?.count || 0;
  }

  // Comment operations
  async createComment(commentData: InsertComment & { userId: string }): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        articleId: commentData.articleId,
        userId: commentData.userId,
        parentCommentId: commentData.parentCommentId || null,
        content: commentData.content,
      })
      .returning();
    return comment;
  }

  async getArticleComments(articleId: string): Promise<Comment[]> {
    const result = await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.articleId, articleId),
        isNull(comments.deletedAt)
      ))
      .orderBy(comments.createdAt);
    return result;
  }

  async updateComment(commentId: string, content: string): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ 
        content, 
        editedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(comments.id, commentId))
      .returning();
    return comment;
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await db
      .update(comments)
      .set({ deletedAt: new Date() })
      .where(eq(comments.id, commentId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getComment(commentId: string): Promise<Comment | undefined> {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));
    return comment;
  }

  // Forum post operations
  async createForumPost(postData: InsertForumPost & { userId: string }): Promise<ForumPost> {
    const [post] = await db
      .insert(forumPosts)
      .values({
        userId: postData.userId,
        content: postData.content,
        linkedArticleId: postData.linkedArticleId || null,
      })
      .returning();
    return post;
  }

  async getForumPosts(limit: number = 50, offset: number = 0): Promise<ForumPost[]> {
    const posts = await db
      .select()
      .from(forumPosts)
      .where(isNull(forumPosts.deletedAt))
      .orderBy(desc(forumPosts.createdAt))
      .limit(limit)
      .offset(offset);
    return posts;
  }

  async getForumPostsWithMeta(userId: string, limit: number = 50, offset: number = 0) {
    const posts = await db
      .select()
      .from(forumPosts)
      .where(isNull(forumPosts.deletedAt))
      .orderBy(desc(forumPosts.createdAt))
      .limit(limit)
      .offset(offset);

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const [postUser] = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          })
          .from(users)
          .where(eq(users.id, post.userId));

        const [likesData] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(forumPostLikes)
          .where(eq(forumPostLikes.postId, post.id));

        const [userLike] = await db
          .select()
          .from(forumPostLikes)
          .where(and(
            eq(forumPostLikes.postId, post.id),
            eq(forumPostLikes.userId, userId)
          ));

        const [commentsData] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(forumPostComments)
          .where(and(
            eq(forumPostComments.postId, post.id),
            isNull(forumPostComments.deletedAt)
          ));

        let linkedArticle = null;
        if (post.linkedArticleId) {
          const [article] = await db
            .select({
              id: savedArticles.id,
              title: savedArticles.title,
            })
            .from(savedArticles)
            .where(eq(savedArticles.id, post.linkedArticleId));
          linkedArticle = article || null;
        }

        return {
          ...post,
          user: postUser || null,
          likesCount: likesData?.count || 0,
          isLiked: !!userLike,
          commentsCount: commentsData?.count || 0,
          linkedArticle,
        };
      })
    );

    return enrichedPosts;
  }

  async getUserForumPosts(userId: string): Promise<ForumPost[]> {
    const posts = await db
      .select()
      .from(forumPosts)
      .where(and(
        eq(forumPosts.userId, userId),
        isNull(forumPosts.deletedAt)
      ))
      .orderBy(desc(forumPosts.createdAt));
    return posts;
  }

  async updateForumPost(postId: string, content: string): Promise<ForumPost | undefined> {
    const [post] = await db
      .update(forumPosts)
      .set({ 
        content, 
        editedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(forumPosts.id, postId))
      .returning();
    return post;
  }

  async deleteForumPost(postId: string): Promise<boolean> {
    const result = await db
      .update(forumPosts)
      .set({ deletedAt: new Date() })
      .where(eq(forumPosts.id, postId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async likeForumPost(userId: string, postId: string): Promise<ForumPostLike> {
    const [like] = await db
      .insert(forumPostLikes)
      .values({ userId, postId })
      .returning();
    return like;
  }

  async unlikeForumPost(userId: string, postId: string): Promise<boolean> {
    const result = await db
      .delete(forumPostLikes)
      .where(and(
        eq(forumPostLikes.userId, userId),
        eq(forumPostLikes.postId, postId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async hasLikedForumPost(userId: string, postId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(forumPostLikes)
      .where(and(
        eq(forumPostLikes.userId, userId),
        eq(forumPostLikes.postId, postId)
      ));
    return !!like;
  }

  async getForumPostLikesCount(postId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(forumPostLikes)
      .where(eq(forumPostLikes.postId, postId));
    return result?.count || 0;
  }

  // Forum post comment operations
  async createForumPostComment(commentData: InsertForumPostComment & { userId: string }): Promise<ForumPostComment> {
    const [comment] = await db
      .insert(forumPostComments)
      .values({
        postId: commentData.postId,
        userId: commentData.userId,
        content: commentData.content,
      })
      .returning();
    return comment;
  }

  async getForumPostComments(postId: string): Promise<ForumPostComment[]> {
    const result = await db
      .select()
      .from(forumPostComments)
      .where(and(
        eq(forumPostComments.postId, postId),
        isNull(forumPostComments.deletedAt)
      ))
      .orderBy(forumPostComments.createdAt);
    return result;
  }

  async updateForumPostComment(commentId: string, content: string): Promise<ForumPostComment | undefined> {
    const [comment] = await db
      .update(forumPostComments)
      .set({ 
        content, 
        editedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(forumPostComments.id, commentId))
      .returning();
    return comment;
  }

  async deleteForumPostComment(commentId: string): Promise<boolean> {
    const result = await db
      .update(forumPostComments)
      .set({ deletedAt: new Date() })
      .where(eq(forumPostComments.id, commentId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Discussion space operations
  async createDiscussionSpace(spaceData: InsertDiscussionSpace & { creatorId: string }): Promise<DiscussionSpace> {
    const [space] = await db
      .insert(discussionSpaces)
      .values({
        creatorId: spaceData.creatorId,
        name: spaceData.name,
        description: spaceData.description || null,
        linkedArticleId: spaceData.linkedArticleId || null,
        subjectArea: spaceData.subjectArea || null,
        isPrivate: spaceData.isPrivate ?? 1,
      })
      .returning();
    return space;
  }

  async getDiscussionSpace(spaceId: string): Promise<DiscussionSpace | undefined> {
    const [space] = await db
      .select()
      .from(discussionSpaces)
      .where(eq(discussionSpaces.id, spaceId));
    return space;
  }

  async getUserDiscussionSpaces(userId: string): Promise<DiscussionSpace[]> {
    const result = await db
      .select({
        id: discussionSpaces.id,
        creatorId: discussionSpaces.creatorId,
        name: discussionSpaces.name,
        description: discussionSpaces.description,
        linkedArticleId: discussionSpaces.linkedArticleId,
        subjectArea: discussionSpaces.subjectArea,
        isPrivate: discussionSpaces.isPrivate,
        createdAt: discussionSpaces.createdAt,
        updatedAt: discussionSpaces.updatedAt,
      })
      .from(discussionSpaceMembers)
      .innerJoin(discussionSpaces, eq(discussionSpaceMembers.spaceId, discussionSpaces.id))
      .where(eq(discussionSpaceMembers.userId, userId))
      .orderBy(desc(discussionSpaces.updatedAt));
    return result;
  }

  async updateDiscussionSpace(spaceId: string, updates: Partial<InsertDiscussionSpace>): Promise<DiscussionSpace | undefined> {
    const [space] = await db
      .update(discussionSpaces)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(discussionSpaces.id, spaceId))
      .returning();
    return space;
  }

  async deleteDiscussionSpace(spaceId: string): Promise<boolean> {
    const result = await db
      .delete(discussionSpaces)
      .where(eq(discussionSpaces.id, spaceId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Discussion space member operations
  async addDiscussionSpaceMember(memberData: InsertDiscussionSpaceMember): Promise<DiscussionSpaceMember> {
    const [member] = await db
      .insert(discussionSpaceMembers)
      .values({
        spaceId: memberData.spaceId,
        userId: memberData.userId,
        role: memberData.role || "member",
      })
      .returning();
    return member;
  }

  async removeDiscussionSpaceMember(spaceId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(discussionSpaceMembers)
      .where(and(
        eq(discussionSpaceMembers.spaceId, spaceId),
        eq(discussionSpaceMembers.userId, userId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getDiscussionSpaceMembers(spaceId: string): Promise<DiscussionSpaceMember[]> {
    const members = await db
      .select()
      .from(discussionSpaceMembers)
      .where(eq(discussionSpaceMembers.spaceId, spaceId))
      .orderBy(discussionSpaceMembers.joinedAt);
    return members;
  }

  async getDiscussionSpaceMembersWithUsers(spaceId: string) {
    const members = await db
      .select()
      .from(discussionSpaceMembers)
      .where(eq(discussionSpaceMembers.spaceId, spaceId))
      .orderBy(discussionSpaceMembers.joinedAt);

    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          })
          .from(users)
          .where(eq(users.id, member.userId));

        return {
          ...member,
          user: user || null,
        };
      })
    );

    return enrichedMembers;
  }

  async isDiscussionSpaceMember(spaceId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(discussionSpaceMembers)
      .where(and(
        eq(discussionSpaceMembers.spaceId, spaceId),
        eq(discussionSpaceMembers.userId, userId)
      ));
    return !!member;
  }

  // Discussion space message operations
  async createDiscussionSpaceMessage(messageData: InsertDiscussionSpaceMessage & { userId: string }): Promise<DiscussionSpaceMessage> {
    const [message] = await db
      .insert(discussionSpaceMessages)
      .values({
        spaceId: messageData.spaceId,
        userId: messageData.userId,
        content: messageData.content,
      })
      .returning();
    return message;
  }

  async getDiscussionSpaceMessages(spaceId: string, limit: number = 100): Promise<DiscussionSpaceMessage[]> {
    const messages = await db
      .select()
      .from(discussionSpaceMessages)
      .where(and(
        eq(discussionSpaceMessages.spaceId, spaceId),
        isNull(discussionSpaceMessages.deletedAt)
      ))
      .orderBy(discussionSpaceMessages.createdAt)
      .limit(limit);
    return messages;
  }

  async getDiscussionSpaceMessagesWithUsers(spaceId: string, limit: number = 100) {
    const messages = await db
      .select()
      .from(discussionSpaceMessages)
      .where(and(
        eq(discussionSpaceMessages.spaceId, spaceId),
        isNull(discussionSpaceMessages.deletedAt)
      ))
      .orderBy(discussionSpaceMessages.createdAt)
      .limit(limit);

    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          })
          .from(users)
          .where(eq(users.id, message.userId));

        return {
          ...message,
          user: user || null,
        };
      })
    );

    return enrichedMessages;
  }

  async updateDiscussionSpaceMessage(messageId: string, content: string): Promise<DiscussionSpaceMessage | undefined> {
    const [message] = await db
      .update(discussionSpaceMessages)
      .set({ 
        content, 
        editedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(discussionSpaceMessages.id, messageId))
      .returning();
    return message;
  }

  async deleteDiscussionSpaceMessage(messageId: string): Promise<boolean> {
    const result = await db
      .update(discussionSpaceMessages)
      .set({ deletedAt: new Date() })
      .where(eq(discussionSpaceMessages.id, messageId));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
