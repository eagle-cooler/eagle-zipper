import CryptoJS from 'crypto-js';
import type { ArchiveEntry } from './types';


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

export const extractRarFile = async (
  archivePath: string, 
  entry: ArchiveEntry, 
  password?: string
): Promise<string> => {
  try {
    console.log('Extracting RAR file:', entry.path);
    
    // Create extraction paths
    const { folderPath, filePath } = createExtractionPath(archivePath, entry.path);
    
    // Check if file already exists and is up to date
    if (shouldSkipExtraction(filePath, archivePath, entry)) {
      return filePath;
    }
    
    const nodeUnrar = require('node-unrar-js');
    const fs = require('fs');
    
    // Read the RAR file as buffer data (like in the documentation)
    const rarBuffer = fs.readFileSync(archivePath);
    const buf = Uint8Array.from(rarBuffer).buffer;
    
    // Create extractor from data instead of file path
    const extractor = await nodeUnrar.createExtractorFromData({ 
      data: buf, 
      password: password 
    });
    
    // Extract specific file
    const extracted = extractor.extract({ files: [entry.path] });
    console.log('RAR extraction result:', extracted);
    console.log('Looking for file:', entry.path);
    console.log('Entry name:', entry.name);
    
    // Convert the files generator to array using spread operator
    const files = [...extracted.files];
    console.log('Extracted files:', files);
    
    // Find the file we want
    const extractedFile = files.find((file: any) => {
      const headerName = file.fileHeader?.name;
      console.log('Checking file header name:', headerName);
      return headerName === entry.path || headerName === entry.name;
    });
    
    console.log('Found extracted file:', extractedFile);
    
    if (!extractedFile || !extractedFile.extraction) {
      throw new Error(`File not found in RAR archive or no extraction data: ${entry.path}`);
    }
    
    // Ensure the folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Write the extracted file
    fs.writeFileSync(filePath, extractedFile.extraction);
    
    console.log('RAR file extracted to:', filePath);
    return filePath;
  } catch (err) {
    console.error('Error extracting RAR file:', err);
    throw new Error(`Failed to extract file: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

export const extractAndOpenFile = async (
  archivePath: string,
  entry: ArchiveEntry,
  archiveType: 'zip' | 'rar' | '7z',
  password?: string
): Promise<void> => {
  try {
    let extractedPath: string;
    
    switch (archiveType) {
      case 'zip':
        extractedPath = await extractZipFile(archivePath, entry, password);
        break;
      case '7z':
        extractedPath = await extract7zFile(archivePath, entry, password);
        break;
      case 'rar':
        extractedPath = await extractRarFile(archivePath, entry, password);
        break;
      default:
        throw new Error(`Unsupported archive type: ${archiveType}`);
    }
    
    // Open the extracted file 
    await eagle.shell.openExternal(extractedPath);
  } catch (err) {
    console.error('Error extracting and opening file:', err);
    throw err;
  }
};