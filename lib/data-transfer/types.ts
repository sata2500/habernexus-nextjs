/**
 * Data Transfer Types
 * 
 * Type definitions for the data transfer system that enables
 * migration of data between HaberNexus instances.
 */

// Transfer status types
export type TransferStatus = 'pending' | 'ready' | 'used' | 'expired';

// Export package structure
export interface ExportPackage {
  version: string;
  createdAt: string;
  source: string;
  checksum: string;
  tables: TableData;
  settings?: SettingsData;
  metadata: ExportMetadata;
}

// Metadata about the export
export interface ExportMetadata {
  tablesCount: number;
  recordsCount: number;
  exportedBy: string;
  appVersion: string;
}

// All table data
export interface TableData {
  users: unknown[];
  accounts: unknown[];
  sessions: unknown[];
  articles: unknown[];
  rssFeeds: unknown[];
  systemSettings: unknown[];
  promptTemplates: unknown[];
  imageSettings: unknown[];
  bookmarks: unknown[];
  articleVotes: unknown[];
  comments: unknown[];
  commentLikes: unknown[];
  follows: unknown[];
  notifications: unknown[];
  newsletterSubscriptions: unknown[];
  contactMessages: unknown[];
  userPreferences: unknown[];
  authorProfiles: unknown[];
  imageErrors: unknown[];
  imageStats: unknown[];
  deploymentSettings: unknown[];
  deploymentHistory: unknown[];
  dataTransfers: unknown[];
}

// Settings data (optional)
export interface SettingsData {
  envVariables?: Record<string, string>;
}

// Export result
export interface ExportResult {
  success: boolean;
  code?: string;
  secretKey?: string;
  expiresAt?: string;
  error?: string;
}

// Import result
export interface ImportResult {
  success: boolean;
  tablesImported?: number;
  recordsImported?: number;
  error?: string;
  details?: ImportDetails;
}

// Import details per table
export interface ImportDetails {
  [tableName: string]: {
    imported: number;
    skipped: number;
    errors: number;
  };
}

// Transfer info for status check
export interface TransferInfo {
  code: string;
  status: TransferStatus;
  fileName?: string;
  fileSize?: number;
  tablesCount?: number;
  recordsCount?: number;
  expiresAt: string;
  createdAt: string;
  isExpired: boolean;
}

// Encryption config
export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
}

// Default encryption configuration
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 32,
  iterations: 100000,
};

// Transfer expiration time in hours
export const TRANSFER_EXPIRATION_HOURS = 24;

// Table names for export/import
export const EXPORTABLE_TABLES = [
  'user',
  'account',
  'session',
  'article',
  'rssFeed',
  'systemSetting',
  'promptTemplate',
  'imageSettings',
  'bookmark',
  'articleVote',
  'comment',
  'commentLike',
  'follow',
  'notification',
  'newsletterSubscription',
  'contactMessage',
  'userPreferences',
  'authorProfile',
  'imageError',
  'imageStats',
  'deploymentSettings',
  'deploymentHistory',
] as const;

export type ExportableTable = typeof EXPORTABLE_TABLES[number];
