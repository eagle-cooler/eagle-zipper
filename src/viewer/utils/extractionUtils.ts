import CryptoJS from 'crypto-js';
import type { ArchiveEntry } from '../types';

export const generateSHA256 = (text: string): string => {
  return CryptoJS.SHA256(text).toString();
};

export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '';
};

export const createExtractionPath = (archivePath: string, entryPath: string): { 
  folderPath: string; 
  filePath: string; 
  fileName: string;
} => {
  const tmpDir = eagle.os.tmpdir();
  const archiveHash = generateSHA256(archivePath);
  const entryHash = generateSHA256(entryPath);
  const fileExt = getFileExtension(entryPath);
  
  const folderPath = `${tmpDir}/zipper.e/${archiveHash}`;
  const fileName = `${entryHash}${fileExt}`;
  const filePath = `${folderPath}/${fileName}`;
  
  return { folderPath, filePath, fileName };
};

export const shouldSkipExtraction = (
  extractedFilePath: string, 
  archivePath: string, 
  entry: ArchiveEntry
): boolean => {
  try {
    const fs = require('fs');
    
    // Check if extracted file exists
    if (!fs.existsSync(extractedFilePath)) {
      return false;
    }
    
    // Get archive stats
    const archiveStats = fs.statSync(archivePath);
    
    // Get extracted file stats
    const extractedStats = fs.statSync(extractedFilePath);
    
    // Compare file size and modification time
    // We use archive modification time as a proxy for entry modification time
    const sameSize = extractedStats.size === entry.size;
    const sameModTime = Math.abs(extractedStats.mtime.getTime() - archiveStats.mtime.getTime()) < 1000; // 1 second tolerance
    
    if (sameSize && sameModTime) {
      console.log(`Skipping extraction - file exists and unchanged: ${extractedFilePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.warn('Error checking file existence, proceeding with extraction:', err);
    return false;
  }
};