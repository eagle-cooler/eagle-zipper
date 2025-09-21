// Crypto utilities for creating unique directory names

/**
 * Generate SHA256 hash of a string
 */
export function sha256(input: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Create a unique directory name based on the absolute path
 */
export function createUniqueDirectoryName(absolutePath: string): string {
  return sha256(absolutePath);
}