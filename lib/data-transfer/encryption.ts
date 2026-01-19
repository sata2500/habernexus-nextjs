/**
 * Data Transfer Encryption
 * 
 * Provides encryption and decryption functions for secure data transfer
 * between HaberNexus instances using AES-256-GCM.
 */

import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import { DEFAULT_ENCRYPTION_CONFIG, EncryptionConfig } from './types';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Generate a random transfer code (UUID v4 format)
 */
export function generateTransferCode(): string {
  return crypto.randomUUID();
}

/**
 * Generate a random secret key for encryption
 */
export function generateSecretKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a secret key for storage (we don't store the actual key)
 */
export function hashSecretKey(secretKey: string): string {
  return crypto.createHash('sha256').update(secretKey).digest('hex');
}

/**
 * Verify a secret key against its hash
 */
export function verifySecretKey(secretKey: string, hash: string): boolean {
  const computedHash = hashSecretKey(secretKey);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
}

/**
 * Derive an encryption key from a password/secret using PBKDF2
 */
function deriveKey(
  secret: string,
  salt: Buffer,
  config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG
): Buffer {
  return crypto.pbkdf2Sync(
    secret,
    salt,
    config.iterations,
    config.keyLength,
    'sha256'
  );
}

/**
 * Encrypt data using AES-256-GCM
 * Returns a base64 encoded string containing salt + iv + authTag + ciphertext
 */
export async function encryptData(
  data: string,
  secretKey: string,
  config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG
): Promise<string> {
  // Compress data first
  const compressed = await gzip(Buffer.from(data, 'utf-8'));
  
  // Generate random salt and IV
  const salt = crypto.randomBytes(config.saltLength);
  const iv = crypto.randomBytes(config.ivLength);
  
  // Derive key from secret
  const key = deriveKey(secretKey, salt, config);
  
  // Create cipher and encrypt
  const cipher = crypto.createCipheriv(
    config.algorithm as crypto.CipherGCMTypes,
    key,
    iv,
    { authTagLength: 16 } as crypto.CipherGCMOptions
  );
  
  const encrypted = Buffer.concat([
    cipher.update(compressed),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine all parts: salt + iv + authTag + encrypted
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);
  
  return combined.toString('base64');
}

/**
 * Decrypt data encrypted with encryptData
 * Expects a base64 encoded string containing salt + iv + authTag + ciphertext
 */
export async function decryptData(
  encryptedData: string,
  secretKey: string,
  config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG
): Promise<string> {
  const combined = Buffer.from(encryptedData, 'base64');
  
  // Extract parts
  const salt = combined.subarray(0, config.saltLength);
  const iv = combined.subarray(config.saltLength, config.saltLength + config.ivLength);
  const authTag = combined.subarray(
    config.saltLength + config.ivLength,
    config.saltLength + config.ivLength + 16
  );
  const encrypted = combined.subarray(config.saltLength + config.ivLength + 16);
  
  // Derive key from secret
  const key = deriveKey(secretKey, salt, config);
  
  // Create decipher and decrypt
  const decipher = crypto.createDecipheriv(
    config.algorithm as crypto.CipherGCMTypes,
    key,
    iv,
    { authTagLength: 16 } as crypto.CipherGCMOptions
  );
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  
  // Decompress
  const decompressed = await gunzip(decrypted);
  
  return decompressed.toString('utf-8');
}

/**
 * Generate a checksum for data integrity verification
 */
export function generateChecksum(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify data integrity using checksum
 */
export function verifyChecksum(data: string, checksum: string): boolean {
  const computedChecksum = generateChecksum(data);
  return computedChecksum === checksum;
}
