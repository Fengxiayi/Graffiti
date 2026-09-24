import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../database/database.module';
import type { AppDatabase } from '../../database/database.module';
import { notifications } from '../../database/schema';
import type { NotificationItem, NotificationListResponse } from '../../../shared/api.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: AppDatabase,
  ) {}

  async list(userId: string): Promise<NotificationListResponse> {
    const items = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    const unreadResult = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
      ));
    const unreadCount: number = unreadResult[0]?.count ?? 0;

    const resultItems: NotificationItem[] = items.map((item: typeof notifications.$inferSelect) => ({
      id: item.id,
      type: item.type,
      content: item.content,
      relatedId: item.relatedId ?? null,
      isRead: item.isRead,
      createdAt: item.createdAt.toISOString(),
    }));

    return {
      items: resultItems,
      unreadCount,
    };
  }

  async markAsRead(userId: string, id: string): Promise<void> {
    const updated = await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, userId),
      ))
      .returning({ id: notifications.id });

    if (updated.length === 0) {
      throw new NotFoundException('通知不存在');
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async create(
    userId: string,
    type: string,
    content: string,
    relatedId?: string,
  ): Promise<void> {
    await this.db.insert(notifications).values({
      userId,
      type,
      content,
      relatedId: relatedId ?? null,
      isRead: false,
    });
  }
}
