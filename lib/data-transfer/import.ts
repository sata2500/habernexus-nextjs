/**
 * Data Transfer Import
 * 
 * Functions for importing data from an export package
 * into a HaberNexus instance.
 */

import { prisma } from '@/lib/prisma';
import { ExportPackage, ImportResult, ImportDetails } from './types';
import { decryptData, verifyChecksum, verifySecretKey } from './encryption';

/**
 * Validate and decrypt an export package
 */
export async function decryptAndValidatePackage(
  encryptedData: string,
  secretKey: string
): Promise<{ success: boolean; package?: ExportPackage; error?: string }> {
  try {
    // Decrypt the data
    const decryptedJson = await decryptData(encryptedData, secretKey);
    const exportPackage: ExportPackage = JSON.parse(decryptedJson);
    
    // Verify checksum
    const { checksum, ...packageWithoutChecksum } = exportPackage;
    const packageJson = JSON.stringify(packageWithoutChecksum);
    
    if (!verifyChecksum(packageJson, checksum)) {
      return { success: false, error: 'Veri bütünlüğü doğrulaması başarısız. Dosya bozulmuş olabilir.' };
    }
    
    // Validate version
    if (exportPackage.version !== '1.0') {
      return { success: false, error: `Desteklenmeyen paket versiyonu: ${exportPackage.version}` };
    }
    
    return { success: true, package: exportPackage };
  } catch (error) {
    console.error('Decrypt error:', error);
    return { 
      success: false, 
      error: 'Şifre çözme başarısız. Yanlış anahtar veya bozuk dosya.' 
    };
  }
}

/**
 * Verify transfer code and secret key
 */
export async function verifyTransferCredentials(
  code: string,
  secretKey: string
): Promise<{ valid: boolean; error?: string }> {
  const transfer = await prisma.dataTransfer.findUnique({
    where: { code },
  });
  
  if (!transfer) {
    return { valid: false, error: 'Geçersiz aktarım kodu.' };
  }
  
  if (transfer.status === 'used') {
    return { valid: false, error: 'Bu aktarım kodu zaten kullanılmış.' };
  }
  
  if (transfer.status === 'expired' || new Date() > transfer.expiresAt) {
    return { valid: false, error: 'Aktarım kodunun süresi dolmuş.' };
  }
  
  if (!verifySecretKey(secretKey, transfer.secretKey)) {
    return { valid: false, error: 'Geçersiz şifreleme anahtarı.' };
  }
  
  return { valid: true };
}

/**
 * Import all data from an export package
 * Uses transactions to ensure data integrity
 */
export async function importDataFromPackage(
  exportPackage: ExportPackage,
  importedBy: string,
  options: {
    clearExisting?: boolean;
    skipUsers?: boolean;
  } = {}
): Promise<ImportResult> {
  const { tables } = exportPackage;
  const details: ImportDetails = {};
  let totalImported = 0;
  let tablesImported = 0;
  
  try {
    // Use a transaction for data integrity
    await prisma.$transaction(async (tx) => {
      // Clear existing data if requested
      if (options.clearExisting) {
        // Delete in reverse order of dependencies
        await tx.commentLike.deleteMany();
        await tx.comment.deleteMany();
        await tx.articleVote.deleteMany();
        await tx.bookmark.deleteMany();
        await tx.notification.deleteMany();
        await tx.follow.deleteMany();
        await tx.imageStats.deleteMany();
        await tx.imageError.deleteMany();
        await tx.contactMessage.deleteMany();
        await tx.newsletterSubscription.deleteMany();
        await tx.deploymentHistory.deleteMany();
        await tx.deploymentSettings.deleteMany();
        await tx.imageSettings.deleteMany();
        await tx.promptTemplate.deleteMany();
        await tx.systemSetting.deleteMany();
        await tx.article.deleteMany();
        await tx.rssFeed.deleteMany();
        await tx.authorProfile.deleteMany();
        await tx.userPreferences.deleteMany();
        await tx.session.deleteMany();
        await tx.account.deleteMany();
        if (!options.skipUsers) {
          await tx.user.deleteMany();
        }
      }
      
      // Import users first (if not skipped)
      if (!options.skipUsers && tables.users.length > 0) {
        const result = await importTable(tx, 'user', tables.users);
        details.users = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import accounts
      if (tables.accounts.length > 0) {
        const result = await importTable(tx, 'account', tables.accounts);
        details.accounts = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import sessions
      if (tables.sessions.length > 0) {
        const result = await importTable(tx, 'session', tables.sessions);
        details.sessions = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import RSS feeds
      if (tables.rssFeeds.length > 0) {
        const result = await importTable(tx, 'rssFeed', tables.rssFeeds);
        details.rssFeeds = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import articles
      if (tables.articles.length > 0) {
        const result = await importTable(tx, 'article', tables.articles);
        details.articles = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import system settings
      if (tables.systemSettings.length > 0) {
        const result = await importTable(tx, 'systemSetting', tables.systemSettings);
        details.systemSettings = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import prompt templates
      if (tables.promptTemplates.length > 0) {
        const result = await importTable(tx, 'promptTemplate', tables.promptTemplates);
        details.promptTemplates = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import image settings
      if (tables.imageSettings.length > 0) {
        const result = await importTable(tx, 'imageSettings', tables.imageSettings);
        details.imageSettings = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import author profiles
      if (tables.authorProfiles.length > 0) {
        const result = await importTable(tx, 'authorProfile', tables.authorProfiles);
        details.authorProfiles = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import user preferences
      if (tables.userPreferences.length > 0) {
        const result = await importTable(tx, 'userPreferences', tables.userPreferences);
        details.userPreferences = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import bookmarks
      if (tables.bookmarks.length > 0) {
        const result = await importTable(tx, 'bookmark', tables.bookmarks);
        details.bookmarks = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import article votes
      if (tables.articleVotes.length > 0) {
        const result = await importTable(tx, 'articleVote', tables.articleVotes);
        details.articleVotes = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import comments
      if (tables.comments.length > 0) {
        const result = await importTable(tx, 'comment', tables.comments);
        details.comments = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import comment likes
      if (tables.commentLikes.length > 0) {
        const result = await importTable(tx, 'commentLike', tables.commentLikes);
        details.commentLikes = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import follows
      if (tables.follows.length > 0) {
        const result = await importTable(tx, 'follow', tables.follows);
        details.follows = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import notifications
      if (tables.notifications.length > 0) {
        const result = await importTable(tx, 'notification', tables.notifications);
        details.notifications = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import newsletter subscriptions
      if (tables.newsletterSubscriptions.length > 0) {
        const result = await importTable(tx, 'newsletterSubscription', tables.newsletterSubscriptions);
        details.newsletterSubscriptions = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import contact messages
      if (tables.contactMessages.length > 0) {
        const result = await importTable(tx, 'contactMessage', tables.contactMessages);
        details.contactMessages = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import image errors
      if (tables.imageErrors.length > 0) {
        const result = await importTable(tx, 'imageError', tables.imageErrors);
        details.imageErrors = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import image stats
      if (tables.imageStats.length > 0) {
        const result = await importTable(tx, 'imageStats', tables.imageStats);
        details.imageStats = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import deployment settings
      if (tables.deploymentSettings.length > 0) {
        const result = await importTable(tx, 'deploymentSettings', tables.deploymentSettings);
        details.deploymentSettings = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
      
      // Import deployment history
      if (tables.deploymentHistory.length > 0) {
        const result = await importTable(tx, 'deploymentHistory', tables.deploymentHistory);
        details.deploymentHistory = result;
        totalImported += result.imported;
        if (result.imported > 0) tablesImported++;
      }
    });
    
    return {
      success: true,
      tablesImported,
      recordsImported: totalImported,
      details,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.',
      details,
    };
  }
}

/**
 * Import a single table's data
 */
async function importTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  tableName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  const errors = 0;
  
  for (const record of data) {
    try {
      // Convert date strings back to Date objects
      const processedRecord = processDateFields(record);
      
      // Use upsert to handle existing records
      await tx[tableName].upsert({
        where: { id: processedRecord.id },
        update: processedRecord,
        create: processedRecord,
      });
      imported++;
    } catch (error) {
      // If upsert fails (e.g., unique constraint on non-id field), try create
      try {
        const processedRecord = processDateFields(record);
        await tx[tableName].create({
          data: processedRecord,
        });
        imported++;
      } catch {
        // Record already exists or other error
        console.warn(`Skipped record in ${tableName}:`, error);
        skipped++;
      }
    }
  }
  
  return { imported, skipped, errors };
}

/**
 * Process date fields in a record
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processDateFields(record: any): any {
  const dateFields = [
    'createdAt', 'updatedAt', 'publishedAt', 'expiresAt', 'usedAt',
    'emailVerified', 'expires', 'lastFetch', 'resolvedAt', 'startedAt', 'completedAt'
  ];
  
  const processed = { ...record };
  
  for (const field of dateFields) {
    if (processed[field] && typeof processed[field] === 'string') {
      processed[field] = new Date(processed[field]);
    }
  }
  
  return processed;
}
