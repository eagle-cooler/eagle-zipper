import type { ArchiveEntry } from '../types';
import { createExtractionPath, shouldSkipExtraction } from '../utils/extractionUtils';

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