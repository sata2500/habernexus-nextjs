/**
 * Admin Panel Type Definitions
 * 
 * Bu dosya admin panelinde kullanılan tüm tip tanımlarını içerir.
 * Tutarlılık ve tip güvenliği için merkezi bir kaynak görevi görür.
 */

// ============================================
// User Types
// ============================================

export type UserRole = 'ADMIN' | 'AUTHOR' | 'USER'

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
  _count?: {
    articles: number
    bookmarks: number
    comments: number
  }
}

export interface UserWithStats extends User {
  _count: {
    articles: number
    bookmarks: number
    comments: number
  }
}

// ============================================
// Article Types
// ============================================

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  summary: string | null
  category: string
  imageUrl: string | null
  viewCount: number
  status: ArticleStatus
  publishedAt: string
  createdAt: string
  updatedAt: string
  authorId: string
  author: {
    id: string
    name: string | null
    email: string
  }
  _count?: {
    bookmarks: number
    votes: number
    comments: number
  }
}

export interface ArticleWithStats extends Article {
  _count: {
    bookmarks: number
    votes: number
    comments: number
  }
}

export interface ArticleCreateInput {
  title: string
  content: string
  summary?: string
  category: string
  imageUrl?: string
  status?: ArticleStatus
}

export interface ArticleUpdateInput extends Partial<ArticleCreateInput> {
  id: string
}

// ============================================
// Comment Types
// ============================================

export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'

export interface Comment {
  id: string
  content: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
  userId: string
  articleId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  article: {
    id: string
    title: string
    slug: string
  }
}

// ============================================
// RSS Feed Types
// ============================================

export type FetchStatus = 'SUCCESS' | 'FAILED' | 'PENDING'

export interface RssFeed {
  id: string
  name: string
  url: string
  category: string
  isActive: boolean
  lastFetch: string | null
  fetchStatus: FetchStatus | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    articles: number
  }
}

export interface RssFeedCreateInput {
  name?: string
  url: string
  category: string
  isActive?: boolean
}

export interface RssFeedUpdateInput extends Partial<RssFeedCreateInput> {
  id: string
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  articles: {
    total: number
    thisWeek: number
    trend: number
  }
  users: {
    total: number
    thisWeek: number
    trend: number
  }
  views: {
    total: number
    thisWeek: number
    trend: number
  }
  comments: {
    total: number
    pending: number
    trend: number
  }
  rss: {
    total: number
    active: number
  }
  bookmarks: number
  votes: number
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// Filter & Sort Types
// ============================================

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  key: string
  direction: SortDirection
}

export interface FilterConfig {
  [key: string]: string | number | boolean | undefined
}

export interface PaginationConfig {
  page: number
  pageSize: number
}

// ============================================
// Form Types
// ============================================

export interface FormField<T = string> {
  value: T
  error?: string
  touched?: boolean
}

export interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

// ============================================
// Settings Types
// ============================================

export interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  logoUrl: string | null
  faviconUrl: string | null
  socialLinks: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  seoDefaults: {
    titleSuffix: string
    defaultDescription: string
    defaultImage: string | null
  }
  analytics: {
    googleAnalyticsId?: string
    googleTagManagerId?: string
  }
}

// ============================================
// Notification Types
// ============================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  dismissible?: boolean
}

// ============================================
// Activity Log Types
// ============================================

export type ActivityAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'APPROVE'
  | 'REJECT'
  | 'LOGIN'
  | 'LOGOUT'

export interface ActivityLog {
  id: string
  action: ActivityAction
  entityType: string
  entityId: string
  entityName: string
  userId: string
  userName: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// ============================================
// Utility Types
// ============================================

/** Tüm özellikleri opsiyonel yapar (nested dahil) */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** Belirli özellikleri zorunlu yapar */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/** Belirli özellikleri hariç tutar */
export type OmitFields<T, K extends keyof T> = Omit<T, K>

/** ID'li entity tipi */
export type WithId<T> = T & { id: string }

/** Timestamp'li entity tipi */
export type WithTimestamps<T> = T & {
  createdAt: string
  updatedAt: string
}
