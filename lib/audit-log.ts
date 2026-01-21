/**
 * Audit Logging Sistemi
 * 
 * Admin panelinde yapılan tüm kritik işlemleri kaydeder.
 * Güvenlik, hesap verebilirlik ve sorun giderme için kullanılır.
 * 
 * @version 1.0.0
 * @lastUpdated 21 Ocak 2026
 */

// import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'APPROVE'
  | 'REJECT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'SETTINGS_CHANGE'
  | 'USER_ROLE_CHANGE'
  | 'BULK_DELETE'
  | 'EXPORT'
  | 'IMPORT'

export interface AuditLogData {
  action: AuditAction
  entityType: string
  entityId?: string
  entityName?: string
  userId: string
  userName: string
  changes?: Record<string, { old: unknown; new: unknown }>
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Audit log kaydı oluştur
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    console.log('[AUDIT LOG]', {
      timestamp: new Date().toISOString(),
      ...data,
    })
  } catch (error) {
    console.error('[AUDIT LOG ERROR]', error)
  }
}

/**
 * Makale oluşturma audit log'u
 */
export async function logArticleCreated(
  articleId: string,
  articleTitle: string,
  userId: string,
  userName: string
): Promise<void> {
  await createAuditLog({
    action: 'CREATE',
    entityType: 'Article',
    entityId: articleId,
    entityName: articleTitle,
    userId,
    userName,
  })
}

/**
 * Makale güncelleme audit log'u
 */
export async function logArticleUpdated(
  articleId: string,
  articleTitle: string,
  userId: string,
  userName: string,
  changes?: Record<string, { old: unknown; new: unknown }>
): Promise<void> {
  await createAuditLog({
    action: 'UPDATE',
    entityType: 'Article',
    entityId: articleId,
    entityName: articleTitle,
    userId,
    userName,
    changes,
  })
}

/**
 * Makale silme audit log'u
 */
export async function logArticleDeleted(
  articleId: string,
  articleTitle: string,
  userId: string,
  userName: string
): Promise<void> {
  await createAuditLog({
    action: 'DELETE',
    entityType: 'Article',
    entityId: articleId,
    entityName: articleTitle,
    userId,
    userName,
  })
}

/**
 * Kullanıcı rol değişikliği audit log'u
 */
export async function logUserRoleChanged(
  targetUserId: string,
  targetUserName: string,
  oldRole: string,
  newRole: string,
  userId: string,
  userName: string
): Promise<void> {
  await createAuditLog({
    action: 'USER_ROLE_CHANGE',
    entityType: 'User',
    entityId: targetUserId,
    entityName: targetUserName,
    userId,
    userName,
    changes: {
      role: { old: oldRole, new: newRole },
    },
  })
}

/**
 * Ayar değişikliği audit log'u
 */
export async function logSettingsChanged(
  settingKey: string,
  oldValue: unknown,
  newValue: unknown,
  userId: string,
  userName: string
): Promise<void> {
  await createAuditLog({
    action: 'SETTINGS_CHANGE',
    entityType: 'Settings',
    entityName: settingKey,
    userId,
    userName,
    changes: {
      [settingKey]: { old: oldValue, new: newValue },
    },
  })
}

/**
 * Toplu silme audit log'u
 */
export async function logBulkDelete(
  entityType: string,
  count: number,
  userId: string,
  userName: string
): Promise<void> {
  await createAuditLog({
    action: 'BULK_DELETE',
    entityType,
    entityName: `${count} ${entityType} silindi`,
    userId,
    userName,
    metadata: { count },
  })
}

/**
 * Veri dışa aktarma audit log'u
 */
export async function logExport(
  entityType: string,
  format: string,
  userId: string,
  userName: string
): Promise<void> {
  await createAuditLog({
    action: 'EXPORT',
    entityType,
    userId,
    userName,
    metadata: { format },
  })
}

/**
 * Veri içe aktarma audit log'u
 */
export async function logImport(
  entityType: string,
  format: string,
  recordCount: number,
  userId: string,
  userName: string
): Promise<void> {
  await createAuditLog({
    action: 'IMPORT',
    entityType,
    userId,
    userName,
    metadata: { format, recordCount },
  })
}
