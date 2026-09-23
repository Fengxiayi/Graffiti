import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { feedbacks } from '@server/database/schema';
import type { CreateFeedbackRequest, FeedbackItem } from '@shared/api.interface';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async create(dto: CreateFeedbackRequest, userId?: string): Promise<FeedbackItem> {
    const values: Record<string, unknown> = {
      content: dto.content,
      contact: dto.contact ?? null,
    };
    if (userId) {
      values.createdBy = userId;
    }

    const [inserted] = await this.db
      .insert(feedbacks)
      .values(values as typeof feedbacks.$inferInsert)
      .returning({
        id: feedbacks.id,
        content: feedbacks.content,
        contact: feedbacks.contact,
        status: feedbacks.status,
        createdAt: feedbacks.createdAt,
      });

    return {
      id: inserted.id,
      content: inserted.content,
      contact: inserted.contact,
      status: inserted.status,
      createdAt: inserted.createdAt.toISOString(),
    };
  }
}
