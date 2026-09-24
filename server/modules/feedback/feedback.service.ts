import { Injectable, Inject, Logger } from '@nestjs/common';

import { DATABASE_CONNECTION } from '../../database/database.module';
import type { AppDatabase } from '../../database/database.module';
import { feedbacks } from '../../database/schema';
import type { CreateFeedbackRequest, FeedbackItem } from '../../../shared/api.interface';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(@Inject(DATABASE_CONNECTION) private readonly db: AppDatabase) {}

  async create(dto: CreateFeedbackRequest, userId?: string): Promise<FeedbackItem> {
    const values: Record<string, unknown> = {
      content: dto.content,
      contact: dto.contact ?? null,
      creatorId: userId ?? null,
    };

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
