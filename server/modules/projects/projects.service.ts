import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, and, count, inArray } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';

import { projects, projectMembers, strokes } from '@server/database/schema';
import type {
  ProjectItem,
  ProjectListResponse,
  CreateProjectRequest,
  MyProjectsResponse,
} from '@shared/api.interface';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private buildProjectQuery(whereClause?: ReturnType<typeof and>) {
    const base = this.db
      .select({
        id: projects.id,
        name: projects.name,
        coverUrl: projects.coverUrl,
        description: projects.description,
        isHidden: projects.isHidden,
        isPinned: projects.isPinned,
        createdBy: projects.createdBy,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        memberCount: this.db.$count(projectMembers, eq(projectMembers.projectId, projects.id)),
        strokeCount: this.db.$count(strokes, eq(strokes.projectId, projects.id)),
      })
      .from(projects);
    if (whereClause) {
      return base.where(whereClause);
    }
    return base;
  }

  private mapToProjectItem(row: {
    id: string;
    name: string;
    coverUrl: string | null;
    description: string | null;
    isHidden: boolean;
    isPinned: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    memberCount: number;
    strokeCount: number;
  }): ProjectItem {
    return {
      id: row.id,
      name: row.name,
      coverUrl: row.coverUrl,
      description: row.description,
      isHidden: row.isHidden,
      isPinned: row.isPinned,
      creatorId: row.createdBy,
      memberCount: row.memberCount,
      strokeCount: row.strokeCount,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async list(page: number, pageSize: number): Promise<ProjectListResponse> {
    const offset = (page - 1) * pageSize;
    const whereClause = eq(projects.isHidden, false);

    const rows = await this.buildProjectQuery(whereClause)
      .orderBy(desc(projects.isPinned), desc(projects.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [countResult] = await this.db
      .select({ count: count() })
      .from(projects)
      .where(whereClause);

    const items: ProjectItem[] = rows.map((row) => this.mapToProjectItem(row));

    return {
      items,
      total: countResult?.count ?? 0,
      page,
      pageSize,
    };
  }

  async getById(id: string): Promise<ProjectItem> {
    const rows = await this.buildProjectQuery(eq(projects.id, id)).limit(1);
    const row = rows[0];
    if (!row) {
      throw new NotFoundException('项目不存在');
    }
    return this.mapToProjectItem(row);
  }

  async create(userId: string, dto: CreateProjectRequest): Promise<ProjectItem> {
    return this.db.transaction(async (tx) => {
      const [projectRow] = await tx
        .insert(projects)
        .values({
          name: dto.name,
          description: dto.description ?? null,
        })
        .returning({
          id: projects.id,
          name: projects.name,
          coverUrl: projects.coverUrl,
          description: projects.description,
          isHidden: projects.isHidden,
          isPinned: projects.isPinned,
          createdBy: projects.createdBy,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
        });

      await tx.insert(projectMembers).values({
        projectId: projectRow.id,
        userId,
        role: 'owner',
      });

      return this.mapToProjectItem({
        ...projectRow,
        memberCount: 1,
        strokeCount: 0,
      });
    });
  }

  async getMyProjects(userId: string): Promise<MyProjectsResponse> {
    // 我创建的
    const createdRows = await this.buildProjectQuery(
      eq(projects.createdBy, userId),
    ).orderBy(desc(projects.createdAt));

    // 我参与的（通过 project_members 表）
    const membershipRows = await this.db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));

    const joinedProjectIds: string[] = membershipRows
      .map((row: { projectId: string }) => row.projectId)
      .filter((pid: string) => {
        const createdIds: string[] = createdRows.map((r) => r.id);
        return !createdIds.includes(pid);
      });

    let joinedRows: typeof createdRows = [];
    if (joinedProjectIds.length > 0) {
      joinedRows = await this.buildProjectQuery(
        inArray(projects.id, joinedProjectIds),
      ).orderBy(desc(projects.createdAt));
    }

    return {
      created: createdRows.map((row) => this.mapToProjectItem(row)),
      joined: joinedRows.map((row) => this.mapToProjectItem(row)),
    };
  }
}
