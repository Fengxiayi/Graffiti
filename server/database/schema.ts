/* 通用 PostgreSQL 数据库 schema（Drizzle ORM）
 * 说明：所有用户引用均使用 users.id（uuid 字符串，text 列存储），
 * 避免平台私有类型，可直接在宝塔 / 自建 PostgreSQL 上运行。
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  foreignKey,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

export const timestamptz = (name: string) =>
  timestamp(name, { withTimezone: true, precision: 3 });

// ========== 用户表（自建账号体系） ==========
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).notNull(),
    password: varchar('password', { length: 100 }).notNull(),
    nickname: varchar('nickname', { length: 50 }),
    role: varchar('role', { length: 20 }).notNull().default('user'),
    createdAt: timestamptz('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('users_username_unique').on(table.username),
  ],
);

// ========== 项目表 ==========
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    coverUrl: text('cover_url'),
    description: text('description'),
    isHidden: boolean('is_hidden').notNull().default(false),
    isPinned: boolean('is_pinned').notNull().default(false),
    creatorId: text('creator_id').notNull(),
    createdAt: timestamptz('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamptz('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_projects_pinned').on(table.isPinned, table.createdAt),
  ],
);

// ========== 项目成员表 ==========
export const projectMembers = pgTable(
  'project_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull(),
    userId: text('user_id').notNull(),
    role: varchar('role', { length: 20 }).notNull().default('member'),
    joinedAt: timestamptz('joined_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_project_members_project').on(table.projectId),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: 'project_members_project_id_fkey',
    }).onDelete('cascade'),
  ],
);

// ========== 笔迹表 ==========
export const strokes = pgTable(
  'strokes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull(),
    userId: text('user_id').notNull(),
    strokeData: jsonb('stroke_data').notNull(),
    createdAt: timestamptz('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_strokes_project').on(table.projectId, table.createdAt),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: 'strokes_project_id_fkey',
    }).onDelete('cascade'),
  ],
);

// ========== 涂鸦精选表 ==========
export const galleryItems = pgTable(
  'gallery_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 200 }).notNull(),
    imageUrl: text('image_url').notNull(),
    projectId: uuid('project_id'),
    isPinned: boolean('is_pinned').notNull().default(false),
    likeCount: integer('like_count').notNull().default(0),
    commentCount: integer('comment_count').notNull().default(0),
    creatorId: text('creator_id').notNull(),
    createdAt: timestamptz('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamptz('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_gallery_pinned').on(table.isPinned, table.createdAt),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: 'gallery_items_project_id_fkey',
    }).onDelete('set null'),
  ],
);

// ========== 精选点赞表 ==========
export const galleryLikes = pgTable(
  'gallery_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    galleryId: uuid('gallery_id').notNull(),
    userId: text('user_id').notNull(),
    createdAt: timestamptz('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.galleryId],
      foreignColumns: [galleryItems.id],
      name: 'gallery_likes_gallery_id_fkey',
    }).onDelete('cascade'),
  ],
);

// ========== 精选评论表 ==========
export const galleryComments = pgTable(
  'gallery_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    galleryId: uuid('gallery_id').notNull(),
    content: text('content').notNull(),
    replyTo: uuid('reply_to').references((): AnyPgColumn => galleryComments.id, {
      onDelete: 'set null',
    }),
    creatorId: text('creator_id').notNull(),
    createdAt: timestamptz('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_gallery_comments_gallery').on(table.galleryId, table.createdAt),
    foreignKey({
      columns: [table.galleryId],
      foreignColumns: [galleryItems.id],
      name: 'gallery_comments_gallery_id_fkey',
    }).onDelete('cascade'),
  ],
);

// ========== 消息通知表 ==========
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    type: varchar('type', { length: 30 }).notNull(),
    content: text('content').notNull(),
    relatedId: uuid('related_id'),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamptz('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_notifications_user').on(table.userId, table.createdAt),
  ],
);

// ========== 反馈表 ==========
export const feedbacks = pgTable(
  'feedbacks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    contact: varchar('contact', { length: 200 }),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    creatorId: text('creator_id'),
    createdAt: timestamptz('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_feedbacks_status').on(table.status, table.createdAt),
  ],
);

// 兼容别名
export const usersTable = users;
export const feedbacksTable = feedbacks;
export const galleryCommentsTable = galleryComments;
export const galleryItemsTable = galleryItems;
export const galleryLikesTable = galleryLikes;
export const notificationsTable = notifications;
export const projectMembersTable = projectMembers;
export const projectsTable = projects;
export const strokesTable = strokes;
