/**
 * Data Transfer Export
 * 
 * Functions for exporting all data from a HaberNexus instance
 * for migration to another instance.
 */

import { prisma } from '@/lib/prisma';
import {
  ExportPackage,
  ExportMetadata,
  TableData,
  TRANSFER_EXPIRATION_HOURS,
} from './types';
import {
  generateTransferCode,
  generateSecretKey,
  hashSecretKey,
  encryptData,
  generateChecksum,
} from './encryption';

// Get package version from package.json
const APP_VERSION = '3.1.1';

/**
 * Export all data from the database
 */
async function exportAllTables(): Promise<TableData> {
  // Export all tables in parallel for better performance
  const [
    users,
    accounts,
    sessions,
    articles,
    rssFeeds,
    systemSettings,
    promptTemplates,
    imageSettings,
    bookmarks,
    articleVotes,
    comments,
    commentLikes,
    follows,
    notifications,
    newsletterSubscriptions,
    contactMessages,
    userPreferences,
    authorProfiles,
    imageErrors,
    imageStats,
    deploymentSettings,
    deploymentHistory,
    dataTransfers,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.account.findMany(),
    prisma.session.findMany(),
    prisma.article.findMany(),
    prisma.rssFeed.findMany(),
    prisma.systemSetting.findMany(),
    prisma.promptTemplate.findMany(),
    prisma.imageSettings.findMany(),
    prisma.bookmark.findMany(),
    prisma.articleVote.findMany(),
    prisma.comment.findMany(),
    prisma.commentLike.findMany(),
    prisma.follow.findMany(),
    prisma.notification.findMany(),
    prisma.newsletterSubscription.findMany(),
    prisma.contactMessage.findMany(),
    prisma.userPreferences.findMany(),
    prisma.authorProfile.findMany(),
    prisma.imageError.findMany(),
    prisma.imageStats.findMany(),
    prisma.deploymentSettings.findMany(),
    prisma.deploymentHistory.findMany(),
    prisma.dataTransfer.findMany(),
  ]);

  return {
    users,
    accounts,
    sessions,
    articles,
    rssFeeds,
    systemSettings,
    promptTemplates,
    imageSettings,
    bookmarks,
    articleVotes,
    comments,
    commentLikes,
    follows,
    notifications,
    newsletterSubscriptions,
    contactMessages,
    userPreferences,
    authorProfiles,
    imageErrors,
    imageStats,
    deploymentSettings,
    deploymentHistory,
    dataTransfers,
  };
}

/**
 * Count total records in all tables
 */
function countRecords(tables: TableData): number {
  return Object.values(tables).reduce((sum, arr) => sum + arr.length, 0);
}

/**
 * Create an export package with all data
 */
export async function createExportPackage(
  exportedBy: string,
  source: string
): Promise<{
  package: ExportPackage;
  encryptedData: string;
  code: string;
  secretKey: string;
  expiresAt: Date;
}> {
  // Export all tables
  const tables = await exportAllTables();
  
  // Calculate metadata
  const tablesCount = Object.keys(tables).length;
  const recordsCount = countRecords(tables);
  
  const metadata: ExportMetadata = {
    tablesCount,
    recordsCount,
    exportedBy,
    appVersion: APP_VERSION,
  };
  
  // Create package without checksum first
  const packageWithoutChecksum: Omit<ExportPackage, 'checksum'> = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    source,
    tables,
    metadata,
  };
  
  // Generate checksum from package data
  const packageJson = JSON.stringify(packageWithoutChecksum);
  const checksum = generateChecksum(packageJson);
  
  // Create final package with checksum
  const exportPackage: ExportPackage = {
    ...packageWithoutChecksum,
    checksum,
  };
  
  // Generate transfer credentials
  const code = generateTransferCode();
  const secretKey = generateSecretKey();
  const expiresAt = new Date(Date.now() + TRANSFER_EXPIRATION_HOURS * 60 * 60 * 1000);
  
  // Encrypt the package
  const encryptedData = await encryptData(JSON.stringify(exportPackage), secretKey);
  
  // Store transfer record in database
  await prisma.dataTransfer.create({
    data: {
      code,
      secretKey: hashSecretKey(secretKey),
      status: 'ready',
      fileName: `habernexus-export-${code.slice(0, 8)}.enc`,
      fileSize: Buffer.byteLength(encryptedData, 'utf-8'),
      tablesCount,
      recordsCount,
      expiresAt,
      createdBy: exportedBy,
    },
  });
  
  return {
    package: exportPackage,
    encryptedData,
    code,
    secretKey,
    expiresAt,
  };
}

/**
 * Get transfer status by code
 */
export async function getTransferStatus(code: string) {
  const transfer = await prisma.dataTransfer.findUnique({
    where: { code },
  });
  
  if (!transfer) {
    return null;
  }
  
  // Check if expired
  const isExpired = new Date() > transfer.expiresAt;
  
  // Update status if expired
  if (isExpired && transfer.status !== 'expired' && transfer.status !== 'used') {
    await prisma.dataTransfer.update({
      where: { code },
      data: { status: 'expired' },
    });
    transfer.status = 'expired';
  }
  
  return {
    code: transfer.code,
    status: transfer.status,
    fileName: transfer.fileName,
    fileSize: transfer.fileSize,
    tablesCount: transfer.tablesCount,
    recordsCount: transfer.recordsCount,
    expiresAt: transfer.expiresAt.toISOString(),
    createdAt: transfer.createdAt.toISOString(),
    isExpired,
  };
}

/**
 * Mark transfer as used
 */
export async function markTransferAsUsed(code: string, usedBy: string) {
  await prisma.dataTransfer.update({
    where: { code },
    data: {
      status: 'used',
      usedAt: new Date(),
      usedBy,
    },
  });
}

/**
 * Clean up expired transfers
 */
export async function cleanupExpiredTransfers() {
  const now = new Date();
  
  await prisma.dataTransfer.updateMany({
    where: {
      expiresAt: { lt: now },
      status: { notIn: ['used', 'expired'] },
    },
    data: {
      status: 'expired',
    },
  });
}
