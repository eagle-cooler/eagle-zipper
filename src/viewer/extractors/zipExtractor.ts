import type { ArchiveEntry } from '../types';
import { createExtractionPath, shouldSkipExtraction } from '../utils/extractionUtils';

export const extractZipFile = async (
  archivePath: string, 
  entry: ArchiveEntry, 
  password?: string
): Promise<string> => {
  try {
    console.log('Extracting ZIP file:', entry.path);
    
    // Create extraction paths
    const { folderPath, filePath } = createExtractionPath(archivePath, entry.path);
    
    // Check if file already exists and is up to date
    if (shouldSkipExtraction(filePath, archivePath, entry)) {
      return filePath;
    }
    
    const AdmZip = require('adm-zip');
    const fs = require('fs');
    
    // Read the archive
    const fileBuffer = fs.readFileSync(archivePath);
    const zip = new AdmZip(fileBuffer);
    
    // Get the specific entry
    const zipEntry = zip.getEntry(entry.path);
    if (!zipEntry) {
      throw new Error(`File not found in archive: ${entry.path}`);
    }
    
    // Extract file data
    const fileData = zip.readFile(zipEntry);
    if (!fileData) {
      throw new Error(`Could not read file data for: ${entry.path}`);
    }
    
    // Ensure the folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Write the extracted file
    fs.writeFileSync(filePath, fileData);
    
    console.log('File extracted to:', filePath);
    return filePath;
  } catch (err) {
    console.error('Error extracting ZIP file:', err);
    throw new Error(`Failed to extract file: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};