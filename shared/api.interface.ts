// ========== 用户相关 ==========
export interface UserInfo {
  userId: string;
  userName: string;
  nickname?: string | null;
  role: 'user' | 'admin';
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

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

export interface MyProjectsResponse {
  created: ProjectItem[];
  joined: ProjectItem[];
}

export interface StrokeData {
  type: string;
  color?: string;
  width?: number;
  points: Array<{ x: number; y: number }>;
  [key: string]: unknown;
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

export interface AdminProjectListResponse {
  items: ProjectItem[];
  total: number;
}

export interface AdminFeedbackListResponse {
  items: FeedbackItem[];
  total: number;
}
