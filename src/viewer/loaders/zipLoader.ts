import type { ArchiveEntry } from '../types';

export const loadZipArchive = async (path: string, password?: string): Promise<ArchiveEntry[]> => {
  try {
    console.log('Loading ZIP archive:', path, password ? 'with password' : 'without password');
    
    // Read the file using Node.js fs with require
    const fs = require('fs');
    const AdmZip = require('adm-zip');
    const fileBuffer = fs.readFileSync(path);
    console.log('File buffer size:', fileBuffer.length);
    
    const zip = new AdmZip(fileBuffer);
    
    // Set password if provided
    if (password) {
      // AdmZip doesn't have a direct password method, but we can try to read entries
      // If password is wrong, it will throw an error when accessing entries
    }
    
    const zipEntries = zip.getEntries();
    console.log('ZIP entries found:', zipEntries.length);
    
    const archiveEntries: ArchiveEntry[] = zipEntries
      .filter((entry: any) => {
        // Filter out problematic entries
        if (!entry.entryName || entry.entryName.trim() === '') {
          console.log('Skipping entry with empty name:', entry);
          return false;
        }
        
        // Skip entries that are just root directory markers
        if (entry.entryName === '/' || entry.entryName === './') {
          console.log('Skipping root directory marker:', entry.entryName);
          return false;
        }
        
        return true;
      })
      .map((entry: any) => {
        console.log('Processing entry:', entry.entryName, 'isDirectory:', entry.isDirectory);
        
        // Use entryName consistently (this is the full path)
        const fullPath = entry.entryName;
        
        // Extract proper name for display (just the filename/folder name)
        let displayName = fullPath;
        if (entry.isDirectory && displayName.endsWith('/')) {
          displayName = displayName.slice(0, -1); // Remove trailing slash
        }
        
        // Get just the last part of the path as the display name
        const pathParts = displayName.split('/').filter((part: string) => part.trim() !== '');
        displayName = pathParts[pathParts.length - 1] || displayName;
        
        // Additional safety check for empty names
        if (displayName.trim() === '') {
          displayName = 'Unknown';
        }
        
        return {
          name: displayName,
          path: fullPath,
          size: entry.header.size,
          compressedSize: entry.header.compressedSize,
          isDirectory: entry.isDirectory,
          date: entry.header.time
        };
      });

    console.log('Archive entries created:', archiveEntries);
    return archiveEntries;
  } catch (err) {
    console.error('Error loading ZIP:', err);
    if (err instanceof Error && err.message.includes('password')) {
      throw new Error('Wrong password or corrupted archive');
    }
    throw new Error('Failed to read ZIP archive: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
};