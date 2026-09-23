import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import {
  projects,
  projectMembers,
  galleryItems,
  galleryComments,
  feedbacks,
  strokes,
} from '@server/database/schema';
import { eq, desc, sql, count } from 'drizzle-orm';
import type {
  AdminProjectListResponse,
  AdminFeedbackListResponse,
  GalleryListResponse,
  ProjectItem,
  FeedbackItem,
  GalleryItem,
} from '@shared/api.interface';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  // ─── Projects ────────────────────────────────────────────────

  async listProjects(page: number, pageSize: number): Promise<AdminProjectListResponse> {
    const items = await this.db
      .select({
        id: projects.id,
        name: projects.name,
        coverUrl: projects.coverUrl,
        description: projects.description,
        isHidden: projects.isHidden,
        isPinned: projects.isPinned,
        creatorId: projects.createdBy,
        memberCount: this.db.$count(projectMembers, eq(projectMembers.projectId, projects.id)),
        strokeCount: this.db.$count(strokes, eq(strokes.projectId, projects.id)),
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [{ total }] = await this.db.select({ total: count() }).from(projects);

    const projectItems: ProjectItem[] = items.map((item: typeof items[number]) => ({
      id: item.id,
      name: item.name,
      coverUrl: item.coverUrl,
      description: item.description,
      isHidden: item.isHidden,
      isPinned: item.isPinned,
      creatorId: item.creatorId,
      memberCount: Number(item.memberCount),
      strokeCount: Number(item.strokeCount),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return { items: projectItems, total: Number(total) };
  }

  async setProjectHidden(id: string, isHidden: boolean, userId: string): Promise<void> {
    const updated = await this.db
      .update(projects)
      .set({ isHidden, updatedAt: new Date(), updatedBy: userId })
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    if (updated.length === 0) {
      throw new NotFoundException('项目不存在');
    }
  }

  async setProjectPinned(id: string, isPinned: boolean, userId: string): Promise<void> {
    const updated = await this.db
      .update(projects)
      .set({ isPinned, updatedAt: new Date(), updatedBy: userId })
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    if (updated.length === 0) {
      throw new NotFoundException('项目不存在');
    }
  }

  async deleteProject(id: string): Promise<void> {
    const deleted = await this.db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    if (deleted.length === 0) {
      throw new NotFoundException('项目不存在');
    }
  }

  // ─── Gallery ─────────────────────────────────────────────────

  async listGallery(page: number, pageSize: number): Promise<GalleryListResponse> {
    const items = await this.db
      .select({
        id: galleryItems.id,
        title: galleryItems.title,
        imageUrl: galleryItems.imageUrl,
        projectId: galleryItems.projectId,
        isPinned: galleryItems.isPinned,
        likeCount: galleryItems.likeCount,
        commentCount: galleryItems.commentCount,
        creatorId: galleryItems.createdBy,
        createdAt: galleryItems.createdAt,
      })
      .from(galleryItems)
      .orderBy(desc(galleryItems.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [{ total }] = await this.db.select({ total: count() }).from(galleryItems);

    const galleryItemList: GalleryItem[] = items.map((item: typeof items[number]) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      projectId: item.projectId,
      isPinned: item.isPinned,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      creatorId: item.creatorId,
      createdAt: item.createdAt.toISOString(),
    }));

    return {
      items: galleryItemList,
      total: Number(total),
      page,
      pageSize,
    };
  }

  async setGalleryPinned(id: string, isPinned: boolean, userId: string): Promise<void> {
    const updated = await this.db
      .update(galleryItems)
      .set({ isPinned, updatedAt: new Date(), updatedBy: userId })
      .where(eq(galleryItems.id, id))
      .returning({ id: galleryItems.id });
    if (updated.length === 0) {
      throw new NotFoundException('精选作品不存在');
    }
  }

  async deleteGalleryItem(id: string): Promise<void> {
    const deleted = await this.db
      .delete(galleryItems)
      .where(eq(galleryItems.id, id))
      .returning({ id: galleryItems.id });
    if (deleted.length === 0) {
      throw new NotFoundException('精选作品不存在');
    }
  }

  async deleteGalleryComment(id: string): Promise<void> {
    await this.db.transaction(async (tx: PostgresJsDatabase) => {
      const deleted = await tx
        .delete(galleryComments)
        .where(eq(galleryComments.id, id))
        .returning({ galleryId: galleryComments.galleryId });
      if (deleted.length === 0) {
        throw new NotFoundException('评论不存在');
      }

      const galleryId: string = deleted[0].galleryId;
      await tx
        .update(galleryItems)
        .set({
          commentCount: sql<number>`${galleryItems.commentCount} - 1`,
        })
        .where(eq(galleryItems.id, galleryId));
    });
  }

  // ─── Feedbacks ───────────────────────────────────────────────

  async listFeedbacks(page: number, pageSize: number): Promise<AdminFeedbackListResponse> {
    const items = await this.db
      .select({
        id: feedbacks.id,
        content: feedbacks.content,
        contact: feedbacks.contact,
        status: feedbacks.status,
        createdAt: feedbacks.createdAt,
      })
      .from(feedbacks)
      .orderBy(desc(feedbacks.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [{ total }] = await this.db.select({ total: count() }).from(feedbacks);

    const feedbackItems: FeedbackItem[] = items.map((item: typeof items[number]) => ({
      id: item.id,
      content: item.content,
      contact: item.contact,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    }));

    return { items: feedbackItems, total: Number(total) };
  }

  async updateFeedbackStatus(id: string, status: string): Promise<void> {
    const updated = await this.db
      .update(feedbacks)
      .set({ status })
      .where(eq(feedbacks.id, id))
      .returning({ id: feedbacks.id });
    if (updated.length === 0) {
      throw new NotFoundException('反馈不存在');
    }
  }
}
