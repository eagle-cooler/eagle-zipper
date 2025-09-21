// File system utilities for managing temporary directories and file extraction
import { createUniqueDirectoryName } from './crypto';

/**
 * Get the temporary directory path for an archive
 */
export function getArchiveTempDir(archivePath: string): string {
  const path = require('path');
  const tmpDir = eagle ? eagle.os.tmpdir() : '/tmp';
  const uniqueName = createUniqueDirectoryName(archivePath);
  const resultPath = path.join(tmpDir, 'zipper.u', uniqueName);
  
  console.log('Archive path:', archivePath);
  console.log('Temp base dir:', tmpDir);
  console.log('Unique name:', uniqueName);
  console.log('Final temp dir:', resultPath);
  
  return resultPath;
}

/**
 * Create a temporary directory for archive extraction
 */
export async function createTempDirectory(dirPath: string): Promise<void> {
  const fs = require('fs');
  
  // Create directory recursively
  await fs.promises.mkdir(dirPath, { recursive: true });
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  const fs = require('fs');
  try {
    const stats = await fs.promises.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get file modification time
 */
export async function getFileModTime(filePath: string): Promise<Date | null> {
  const fs = require('fs');
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.mtime;
  } catch {
    return null;
  }
}

/**
 * Read all files in a directory recursively
 */
export async function readDirectoryRecursive(dirPath: string): Promise<string[]> {
  const fs = require('fs');
  const path = require('path');
  
  const files: string[] = [];
  
  async function walk(currentPath: string, relativePath: string = '') {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativeFullPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        await walk(fullPath, relativeFullPath);
      } else {
        files.push(relativeFullPath);
      }
    }
  }
  
  await walk(dirPath);
  return files;
}

/**
 * Clean up temporary directory
 */
export async function cleanupTempDirectory(dirPath: string): Promise<void> {
  const fs = require('fs');
  try {
    await fs.promises.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.warn('Failed to cleanup temp directory:', error);
  }
}