import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

/**
 * Encryption Utility for API Keys
 * Uses AES-256-GCM for secure encryption
 * 
 * @version 1.0.0
 * @lastUpdated 17 January 2026
 */

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32
const KEY_LENGTH = 32

/**
 * Derive encryption key from AUTH_SECRET
 * Uses scrypt for key derivation
 */
function getEncryptionKey(salt: Buffer): Buffer {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is not set')
  }
  return scryptSync(secret, salt, KEY_LENGTH)
}

/**
 * Encrypt a plaintext string
 * Returns base64 encoded string containing salt, iv, authTag, and ciphertext
 */
export function encrypt(plaintext: string): string {
  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH)
  const iv = randomBytes(IV_LENGTH)
  
  // Derive key from AUTH_SECRET
  const key = getEncryptionKey(salt)
  
  // Create cipher and encrypt
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ])
  
  // Get auth tag
  const authTag = cipher.getAuthTag()
  
  // Combine all parts: salt + iv + authTag + ciphertext
  const combined = Buffer.concat([salt, iv, authTag, encrypted])
  
  return combined.toString('base64')
}

/**
 * Decrypt an encrypted string
 * Expects base64 encoded string containing salt, iv, authTag, and ciphertext
 */
export function decrypt(encryptedData: string): string {
  // Decode from base64
  const combined = Buffer.from(encryptedData, 'base64')
  
  // Extract parts
  const salt = combined.subarray(0, SALT_LENGTH)
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)
  
  // Derive key from AUTH_SECRET
  const key = getEncryptionKey(salt)
  
  // Create decipher and decrypt
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ])
  
  return decrypted.toString('utf8')
}

/**
 * Mask an API key for display
 * Shows first 4 and last 4 characters
 */
export function maskApiKey(value: string): string {
  if (!value || value.length < 12) {
    return '****'
  }
  
  const prefix = value.substring(0, 4)
  const suffix = value.substring(value.length - 4)
  const maskedLength = Math.min(value.length - 8, 20)
  const masked = '*'.repeat(maskedLength)
  
  return `${prefix}${masked}${suffix}`
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
  return !!process.env.AUTH_SECRET
}
