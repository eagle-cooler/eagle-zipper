import type { ArchiveEntry } from '../types';
import { createExtractionPath, shouldSkipExtraction } from '../utils/extractionUtils';

export const extract7zFile = async (
  archivePath: string, 
  entry: ArchiveEntry, 
  password?: string
): Promise<string> => {
  try {
    console.log('Extracting 7Z file:', entry.path);
    
    // Create extraction paths
    const { folderPath, filePath } = createExtractionPath(archivePath, entry.path);
    
    // Check if file already exists and is up to date
    if (shouldSkipExtraction(filePath, archivePath, entry)) {
      return filePath;
    }
    
    const _7z = require('7zip-min');
    const fs = require('fs');
    const path = require('path');
    
    // Ensure the folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    return new Promise((resolve, reject) => {
      const options = password ? { password } : {};
      
      // Extract specific file to temporary location first
      const tempExtractPath = `${folderPath}/temp_extract`;
      if (!fs.existsSync(tempExtractPath)) {
        fs.mkdirSync(tempExtractPath, { recursive: true });
      }
      
      _7z.unpack(archivePath, tempExtractPath, (err: any) => {
        if (err) {
          console.error('7z extraction error:', err);
          reject(new Error(`Failed to extract 7z file: ${err.message}`));
          return;
        }
        
        try {
          // Find and move the specific file
          const sourcePath = path.join(tempExtractPath, entry.path);
          
          if (fs.existsSync(sourcePath)) {
            // Copy the file to final location
            fs.copyFileSync(sourcePath, filePath);
            
            // Clean up temp directory
            fs.rmSync(tempExtractPath, { recursive: true, force: true });
            
            console.log('7z file extracted to:', filePath);
            resolve(filePath);
          } else {
            reject(new Error(`Extracted file not found: ${entry.path}`));
          }
        } catch (moveErr) {
          console.error('Error moving extracted file:', moveErr);
          reject(new Error(`Failed to move extracted file: ${moveErr instanceof Error ? moveErr.message : 'Unknown error'}`));
        }
      }, options);
    });
  } catch (err) {
    console.error('Error extracting 7Z file:', err);
    throw new Error(`Failed to extract file: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};