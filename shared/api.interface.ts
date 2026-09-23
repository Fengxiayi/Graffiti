/* 前后端共享的类型写在这里 */

// ========== 项目相关 ==========
export interface ProjectItem {
  id: string;
  name: string;
  coverUrl: string | null;
  description: string | null;
  isHidden: boolean;
  isPinned: boolean;
  creatorId: string;
  memberCount: number;
  strokeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResponse {
  items: ProjectItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  coverUrl?: string;
  isHidden?: boolean;
  isPinned?: boolean;
}

export interface MyProjectsResponse {
  created: ProjectItem[];
  joined: ProjectItem[];
}

// ========== 笔迹相关 ==========
export interface StrokeData {
  type: 'pen' | 'eraser';
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface StrokeItem {
  id: string;
  projectId: string;
  userId: string;
  strokeData: StrokeData;
  createdAt: string;
}

export interface StrokeListResponse {
  items: StrokeItem[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface CreateStrokeRequest {
  projectId: string;
  strokeData: StrokeData;
}

// ========== 涂鸦精选相关 ==========
export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  projectId: string | null;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  creatorId: string;
  createdAt: string;
  isLiked?: boolean;
}

export interface GalleryListResponse {
  items: GalleryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateGalleryRequest {
  title: string;
  imageUrl: string;
  projectId?: string;
}

// ========== 精选评论 ==========
export interface GalleryCommentItem {
  id: string;
  galleryId: string;
  content: string;
  replyTo: string | null;
  creatorId: string;
  createdAt: string;
}

export interface GalleryCommentListResponse {
  items: GalleryCommentItem[];
  total: number;
}

export interface CreateGalleryCommentRequest {
  galleryId: string;
  content: string;
  replyTo?: string;
}

// ========== 通知相关 ==========
export interface NotificationItem {
  id: string;
  type: string;
  content: string;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
}

// ========== 反馈相关 ==========
export interface FeedbackItem {
  id: string;
  content: string;
  contact: string | null;
  status: string;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  content: string;
  contact?: string;
}

export interface UpdateFeedbackStatusRequest {
  status: string;
}

// ========== 用户相关 ==========
export interface UserInfo {
  userId: string;
  name: string;
  avatar: string;
}

// ========== 管理员相关 ==========
export interface AdminProjectListResponse {
  items: ProjectItem[];
  total: number;
}

export interface AdminFeedbackListResponse {
  items: FeedbackItem[];
  total: number;
}
