import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import { galleryItems, galleryLikes, galleryComments } from '@server/database/schema';
import type {
  GalleryItem,
  GalleryListResponse,
  CreateGalleryRequest,
  GalleryCommentItem,
  GalleryCommentListResponse,
  CreateGalleryCommentRequest,
} from '@shared/api.interface';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly notificationsService: NotificationsService,
  ) {}

  private mapGalleryItem(
    item: typeof galleryItems.$inferSelect,
    isLiked: boolean,
  ): GalleryItem {
    return {
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      projectId: item.projectId ?? null,
      isPinned: item.isPinned,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      creatorId: item.createdBy,
      createdAt: item.createdAt.toISOString(),
      isLiked,
    };
  }

  async list(
    page: number,
    pageSize: number,
    currentUserId?: string,
  ): Promise<GalleryListResponse> {
    const offset: number = (page - 1) * pageSize;

    const items = await this.db
      .select()
      .from(galleryItems)
      .orderBy(desc(galleryItems.isPinned), desc(galleryItems.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalResult = await this.db
      .select({ count: count() })
      .from(galleryItems);
    const total: number = totalResult[0]?.count ?? 0;

    let likedIds: Set<string> = new Set();
    if (currentUserId) {
      const likedRecords = await this.db
        .select({ galleryId: galleryLikes.galleryId })
        .from(galleryLikes)
        .where(eq(galleryLikes.userId, currentUserId));
      likedIds = new Set(likedRecords.map((r: { galleryId: string }) => r.galleryId));
    }

    const resultItems: GalleryItem[] = items.map((item: typeof galleryItems.$inferSelect) =>
      this.mapGalleryItem(item, likedIds.has(item.id)),
    );

    return {
      items: resultItems,
      total,
      page,
      pageSize,
    };
  }

  async getById(id: string, currentUserId?: string): Promise<GalleryItem> {
    const items = await this.db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.id, id))
      .limit(1);

    if (items.length === 0) {
      throw new NotFoundException('作品不存在');
    }

    const item: typeof galleryItems.$inferSelect = items[0];
    let isLiked: boolean = false;
    if (currentUserId) {
      const likedRecords = await this.db
        .select()
        .from(galleryLikes)
        .where(and(
          eq(galleryLikes.galleryId, id),
          eq(galleryLikes.userId, currentUserId),
        ))
        .limit(1);
      isLiked = likedRecords.length > 0;
    }

    return this.mapGalleryItem(item, isLiked);
  }

  async create(userId: string, dto: CreateGalleryRequest): Promise<GalleryItem> {
    const inserted = await this.db
      .insert(galleryItems)
      .values({
        title: dto.title,
        imageUrl: dto.imageUrl,
        projectId: dto.projectId ?? null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    return this.mapGalleryItem(inserted[0], false);
  }

  async toggleLike(
    userId: string,
    galleryId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const result = await this.db.transaction(async (tx) => {
      const galleryRecords = await tx
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.id, galleryId))
        .limit(1);

      if (galleryRecords.length === 0) {
        throw new NotFoundException('作品不存在');
      }

      const existing = await tx
        .select()
        .from(galleryLikes)
        .where(and(
          eq(galleryLikes.galleryId, galleryId),
          eq(galleryLikes.userId, userId),
        ))
        .limit(1);

      let liked: boolean;
      let likeCount: number;

      if (existing.length === 0) {
        await tx.insert(galleryLikes).values({
          galleryId,
          userId,
        });
        await tx
          .update(galleryItems)
          .set({ likeCount: sql<number>`${galleryItems.likeCount} + 1` })
          .where(eq(galleryItems.id, galleryId));
        liked = true;
        likeCount = galleryRecords[0].likeCount + 1;
      } else {
        await tx
          .delete(galleryLikes)
          .where(and(
            eq(galleryLikes.galleryId, galleryId),
            eq(galleryLikes.userId, userId),
          ));
        await tx
          .update(galleryItems)
          .set({ likeCount: sql<number>`${galleryItems.likeCount} - 1` })
          .where(eq(galleryItems.id, galleryId));
        liked = false;
        likeCount = Math.max(0, galleryRecords[0].likeCount - 1);
      }

      return { liked, likeCount };
    });

    return result;
  }

  async listComments(galleryId: string): Promise<GalleryCommentListResponse> {
    const comments = await this.db
      .select()
      .from(galleryComments)
      .where(eq(galleryComments.galleryId, galleryId))
      .orderBy(asc(galleryComments.createdAt));

    const totalResult = await this.db
      .select({ count: count() })
      .from(galleryComments)
      .where(eq(galleryComments.galleryId, galleryId));
    const total: number = totalResult[0]?.count ?? 0;

    const items: GalleryCommentItem[] = comments.map(
      (c: typeof galleryComments.$inferSelect) => ({
        id: c.id,
        galleryId: c.galleryId,
        content: c.content,
        replyTo: c.replyTo ?? null,
        creatorId: c.createdBy,
        createdAt: c.createdAt.toISOString(),
      }),
    );

    return { items, total };
  }

  async createComment(
    userId: string,
    dto: CreateGalleryCommentRequest,
  ): Promise<GalleryCommentItem> {
    const result = await this.db.transaction(async (tx) => {
      const galleryRecords = await tx
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.id, dto.galleryId))
        .limit(1);

      if (galleryRecords.length === 0) {
        throw new NotFoundException('作品不存在');
      }

      const inserted = await tx
        .insert(galleryComments)
        .values({
          galleryId: dto.galleryId,
          content: dto.content,
          replyTo: dto.replyTo ?? null,
          createdBy: userId,
        })
        .returning();

      await tx
        .update(galleryItems)
        .set({
          commentCount: sql<number>`${galleryItems.commentCount} + 1`,
        })
        .where(eq(galleryItems.id, dto.galleryId));

      const authorId: string = galleryRecords[0].createdBy;
      const isAuthorComment: boolean = authorId === userId;

      return { comment: inserted[0], authorId, isAuthorComment };
    });

    if (!result.isAuthorComment) {
      await this.notificationsService.create(
        result.authorId,
        'comment',
        '有人评论了你的作品',
        dto.galleryId,
      );
    }

    return {
      id: result.comment.id,
      galleryId: result.comment.galleryId,
      content: result.comment.content,
      replyTo: result.comment.replyTo ?? null,
      creatorId: result.comment.createdBy,
      createdAt: result.comment.createdAt.toISOString(),
    };
  }

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const existing = await this.db
      .select()
      .from(galleryComments)
      .where(eq(galleryComments.id, commentId))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('评论不存在');
    }

    if (existing[0].createdBy !== userId) {
      throw new ForbiddenException('只能删除自己的评论');
    }

    const galleryId: string = existing[0].galleryId;

    await this.db.transaction(async (tx) => {
      await tx
        .delete(galleryComments)
        .where(eq(galleryComments.id, commentId));

      await tx
        .update(galleryItems)
        .set({
          commentCount: sql<number>`GREATEST(${galleryItems.commentCount} - 1, 0)`,
        })
        .where(eq(galleryItems.id, galleryId));
    });
  }

  async getMine(userId: string): Promise<GalleryItem[]> {
    const items = await this.db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.createdBy, userId))
      .orderBy(desc(galleryItems.createdAt));

    const likedIds: string[] = (
      await this.db
        .select({ galleryId: galleryLikes.galleryId })
        .from(galleryLikes)
        .where(eq(galleryLikes.userId, userId))
    ).map((r: { galleryId: string }) => r.galleryId);
    const likedSet: Set<string> = new Set(likedIds);

    return items.map((item: typeof galleryItems.$inferSelect) =>
      this.mapGalleryItem(item, likedSet.has(item.id)),
    );
  }
}
