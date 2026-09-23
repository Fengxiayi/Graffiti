import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, and, asc, gt } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';

import { strokes, projects } from '@server/database/schema';
import type {
  StrokeItem,
  StrokeListResponse,
  StrokeData,
} from '@shared/api.interface';

@Injectable()
export class StrokesService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private mapToStrokeItem(row: {
    id: string;
    projectId: string;
    userId: string;
    strokeData: unknown;
    createdAt: Date;
  }): StrokeItem {
    return {
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      strokeData: row.strokeData as StrokeData,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async listByProject(
    projectId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<StrokeListResponse> {
    // 校验项目存在
    const projectRows = await this.db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (projectRows.length === 0) {
      throw new NotFoundException('项目不存在');
    }

    const whereConditions = [eq(strokes.projectId, projectId)];
    if (cursor) {
      const cursorDate = new Date(cursor);
      whereConditions.push(gt(strokes.createdAt, cursorDate));
    }

    const rows = await this.db
      .select({
        id: strokes.id,
        projectId: strokes.projectId,
        userId: strokes.userId,
        strokeData: strokes.strokeData,
        createdAt: strokes.createdAt,
      })
      .from(strokes)
      .where(and(...whereConditions))
      .orderBy(asc(strokes.createdAt), asc(strokes.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const visibleRows = hasMore ? rows.slice(0, limit) : rows;
    const items: StrokeItem[] = visibleRows.map((row) => this.mapToStrokeItem(row));

    const nextCursor = items.length > 0 && hasMore ? items[items.length - 1].createdAt : null;

    return {
      items,
      hasMore,
      nextCursor,
    };
  }

  async create(
    userId: string,
    projectId: string,
    strokeData: StrokeData,
  ): Promise<StrokeItem> {
    // 校验项目存在
    const projectRows = await this.db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (projectRows.length === 0) {
      throw new NotFoundException('项目不存在');
    }

    const [row] = await this.db
      .insert(strokes)
      .values({
        projectId,
        userId,
        strokeData,
      })
      .returning({
        id: strokes.id,
        projectId: strokes.projectId,
        userId: strokes.userId,
        strokeData: strokes.strokeData,
        createdAt: strokes.createdAt,
      });

    return this.mapToStrokeItem(row);
  }

  async delete(userId: string, strokeId: string, isAdmin: boolean): Promise<void> {
    const rows = await this.db
      .select({
        id: strokes.id,
        userId: strokes.userId,
      })
      .from(strokes)
      .where(eq(strokes.id, strokeId))
      .limit(1);

    const stroke = rows[0];
    if (!stroke) {
      throw new NotFoundException('笔迹不存在');
    }

    if (!isAdmin && stroke.userId !== userId) {
      throw new ForbiddenException('无权删除他人笔迹');
    }

    await this.db.delete(strokes).where(eq(strokes.id, strokeId));
  }
}
