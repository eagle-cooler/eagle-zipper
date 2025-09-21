import type { ArchiveEntry } from '../types';
import { extractZipFile } from './zipExtractor';
import { extract7zFile } from './sevenZipExtractor';
import { extractRarFile } from './rarExtractor';
import { extractTarFile } from './tarExtractor';

export const extractAndOpenFile = async (
  archivePath: string,
  entry: ArchiveEntry,
  archiveType: 'zip' | 'rar' | '7z' | 'tar',
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

      case 'tar':
        extractedPath = await extractTarFile(archivePath, entry, password);
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