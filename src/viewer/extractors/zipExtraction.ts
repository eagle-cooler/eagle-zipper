// Archive extraction system for full ZIP extraction to temporary directory
import { getArchiveTempDir, createTempDirectory, directoryExists } from '../utils/tempDir';

/**
 * Extract entire ZIP archive to temporary directory
 */
export async function extractZipToTemp(archivePath: string, password?: string): Promise<string> {
  const AdmZip = require('adm-zip');
  
  const tempDir = getArchiveTempDir(archivePath);
  
  console.log('Temp directory path generated:', tempDir);
  
  // Clean up existing directory if it exists to ensure fresh extraction
  if (await directoryExists(tempDir)) {
    console.log('Existing temp directory found, cleaning up...');
    const { cleanupTempDirectory } = await import('../utils/tempDir');
    await cleanupTempDirectory(tempDir);
    console.log('Existing temp directory cleaned up');
  }
  
  // Create fresh temp directory
  console.log('Creating fresh temp directory...');
  await createTempDirectory(tempDir);
  console.log('Fresh temp directory created');
  
  try {
    const zip = new AdmZip(archivePath);
    
    if (password) {
      // Note: adm-zip doesn't have explicit password support for extraction
      // This is a limitation we'll need to document
      console.warn('Password-protected ZIP extraction to temp directory is not fully supported');
    }
    
    // Extract all files
    zip.extractAllTo(tempDir, true);
    
    console.log('Extracted ZIP to temp directory:', tempDir);
    return tempDir;
  } catch (error) {
    console.error('Failed to extract ZIP to temp directory:', error);
    throw new Error(`Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create ZIP archive from temporary directory
 */
export async function createZipFromTemp(tempDir: string, outputPath: string): Promise<void> {
  const AdmZip = require('adm-zip');
  const fs = require('fs');
  const path = require('path');
  
  try {
    const zip = new AdmZip();
    
    // Read all files from temp directory recursively
    async function addDirectoryToZip(dirPath: string, zipPath: string = '') {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const zipEntryPath = zipPath ? `${zipPath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          // Add directory
          zip.addFile(`${zipEntryPath}/`, Buffer.alloc(0));
          // Recursively add directory contents
          await addDirectoryToZip(fullPath, zipEntryPath);
        } else {
          // Add file
          const fileData = await fs.promises.readFile(fullPath);
          zip.addFile(zipEntryPath, fileData);
        }
      }
    }
    
    await addDirectoryToZip(tempDir);
    
    // Write the ZIP file
    zip.writeZip(outputPath);
    
    console.log('Created ZIP archive at:', outputPath);
  } catch (error) {
    console.error('Failed to create ZIP from temp directory:', error);
    throw new Error(`Failed to create ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get list of files in temp directory with modification times
 */
export async function getTempDirectoryFiles(tempDir: string): Promise<Array<{path: string, modTime: Date}>> {
  const fs = require('fs');
  const path = require('path');
  
  const files: Array<{path: string, modTime: Date}> = [];
  
  async function walkDirectory(dirPath: string, relativePath: string = '') {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativeFullPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          await walkDirectory(fullPath, relativeFullPath);
        } else {
          const stats = await fs.promises.stat(fullPath);
          files.push({
            path: relativeFullPath,
            modTime: stats.mtime
          });
        }
      }
    } catch (error) {
      console.warn('Error reading directory:', dirPath, error);
    }
  }
  
  await walkDirectory(tempDir);
  return files;
}