-- 大展宏涂 · 数据库初始化脚本（PostgreSQL）
-- 用法：psql -U <user> -d <database> -f server/db/init.sql
-- 说明：PostgreSQL 13 及以上内置 gen_random_uuid()；12 及以下需要本扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(50) NOT NULL,
  password varchar(100) NOT NULL,
  nickname varchar(50),
  role varchar(20) NOT NULL DEFAULT 'user',
  created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  cover_url text,
  description text,
  is_hidden boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  creator_id text NOT NULL,
  created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_projects_pinned ON projects (is_pinned, created_at);

-- 项目成员表
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'member',
  joined_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members (project_id);

-- 笔迹表
CREATE TABLE IF NOT EXISTS strokes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  stroke_data jsonb NOT NULL,
  created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_strokes_project ON strokes (project_id, created_at);

-- 涂鸦精选表
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(200) NOT NULL,
  image_url text NOT NULL,
  project_id uuid REFERENCES projects (id) ON DELETE SET NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  creator_id text NOT NULL,
  created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_gallery_pinned ON gallery_items (is_pinned, created_at);

-- 精选点赞表
CREATE TABLE IF NOT EXISTS gallery_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES gallery_items (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 精选评论表
CREATE TABLE IF NOT EXISTS gallery_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES gallery_items (id) ON DELETE CASCADE,
  content text NOT NULL,
  reply_to uuid REFERENCES gallery_comments (id) ON DELETE SET NULL,
  creator_id text NOT NULL,
  created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_gallery ON gallery_comments (gallery_id, created_at);

-- 消息通知表
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type varchar(30) NOT NULL,
  content text NOT NULL,
  related_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at);

-- 反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  contact varchar(200),
  status varchar(20) NOT NULL DEFAULT 'pending',
  creator_id text,
  created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks (status, created_at);
