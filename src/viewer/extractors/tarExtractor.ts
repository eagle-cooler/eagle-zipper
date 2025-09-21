import type { ArchiveEntry } from '../types';

export const extractTarFile = async (
  archivePath: string,
  entry: ArchiveEntry,
  password?: string
): Promise<string> => {
  try {
    console.log('Extracting TAR file:', entry.path, 'from', archivePath);
    
    const _7z = require('7zip-min');
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    
    // Create temporary directory for extraction
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eagle-tar-'));
    const tempFilePath = path.join(tempDir, entry.name);
    
    return new Promise((resolve, reject) => {
      const options = password ? { password } : {};
      
      // Extract the specific file using 7zip-min
      _7z.unpack(archivePath, tempDir, (err: any) => {
        if (err) {
          console.error('TAR extraction error:', err);
          reject(new Error('Failed to extract TAR file: ' + err.message));
          return;
        }
        
        // Try to find the extracted file
        const expectedPath = path.join(tempDir, entry.path);
        const fallbackPath = tempFilePath;
        
        let finalPath = expectedPath;
        if (!fs.existsSync(expectedPath) && fs.existsSync(fallbackPath)) {
          finalPath = fallbackPath;
        }
        
        if (!fs.existsSync(finalPath)) {
          reject(new Error('Extracted TAR file not found at expected location'));
          return;
        }
        
        console.log('TAR file extracted to:', finalPath);
        resolve(finalPath);
      }, options);
    });
  } catch (err) {
    console.error('Error in TAR extraction:', err);
    throw new Error('Failed to extract TAR file: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
};