import type { ArchiveEntry } from './types';

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
        
        // Extract proper name for display
        let displayName = entry.name;
        if (entry.isDirectory && displayName.endsWith('/')) {
          displayName = displayName.slice(0, -1); // Remove trailing slash
        }
        displayName = displayName.split('/').pop() || displayName;
        
        // Additional safety check for empty names
        if (displayName.trim() === '') {
          displayName = entry.entryName.split('/').filter((p: string) => p).pop() || 'Unknown';
        }
        
        return {
          name: displayName,
          path: entry.entryName,
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

export const load7zArchive = async (path: string, password?: string): Promise<ArchiveEntry[]> => {
  try {
    console.log('Loading 7Z archive:', path, password ? 'with password' : 'without password');
    
    const _7z = require('7zip-min');
    
    return new Promise((resolve, reject) => {
      const entries: ArchiveEntry[] = [];
      
      // Use 7zip-min to list archive contents
      const options = password ? { password } : {};
      
      _7z.list(path, (err: any, result: any) => {
        if (err) {
          console.error('7zip-min error:', err);
          
          const errorMessage = err.message || err.toString();
          
          // Check for various password-related error messages
          if (errorMessage.includes('Wrong password') ||
              errorMessage.includes('password') ||
              errorMessage.includes('Can not open encrypted archive') ||
              errorMessage.includes('FATAL ERROR') ||
              errorMessage.includes('Data Error') ||
              (!password && errorMessage.includes('ERROR'))) {
            reject(new Error('Wrong password for 7z archive'));
          } else {
            reject(new Error('Failed to read 7z archive: ' + errorMessage));
          }
          return;
        }
        
        console.log('7zip-min result:', result);
        
        if (result && Array.isArray(result)) {
          for (const file of result) {
            try {
              // Extract proper name for display
              let displayName = file.name || file.Name || '';
              if (!displayName) continue;
              
              const isDirectory = file.attr ? file.attr.includes('D') : 
                                file.attributes ? file.attributes.includes('D') :
                                displayName.endsWith('/');
              
              if (isDirectory && displayName.endsWith('/')) {
                displayName = displayName.slice(0, -1);
              }
              
              // Get just the filename for display
              const nameParts = displayName.split('/');
              const fileName = nameParts[nameParts.length - 1];
              
              if (fileName.trim() === '') continue;
              
              entries.push({
                name: fileName,
                path: displayName,
                size: parseInt(file.size || file.Size || '0'),
                compressedSize: parseInt(file.compressed || file.Compressed || '0'),
                isDirectory: isDirectory,
                date: file.date || file.Date ? new Date(file.date || file.Date) : new Date()
              });
            } catch (e) {
              console.error('Error processing 7z file entry:', e, file);
            }
          }
        }
        
        console.log('7z entries loaded:', entries.length);
        
        // If no entries and no password, it might be encrypted
        if (entries.length === 0 && !password) {
          reject(new Error('Archive may be password protected'));
          return;
        }
        
        resolve(entries);
      }, options);
    });
  } catch (err) {
    console.error('Error loading 7z:', err);
    
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    if (errorMessage.includes('password') || errorMessage.includes('Wrong password')) {
      throw new Error('Wrong password for 7z archive');
    }
    
    throw new Error('Failed to read 7z archive: ' + errorMessage);
  }
};

export const loadRarArchive = async (path: string, password?: string): Promise<ArchiveEntry[]> => {
  try {
    console.log('Loading RAR archive:', path, password ? 'with password' : 'without password');
    
    // Read RAR archive using node-unrar-js with require
    const nodeUnrar = require('node-unrar-js');
    const fs = require('fs');
    
    // Read the RAR file as buffer data (consistent with extraction)
    const rarBuffer = fs.readFileSync(path);
    const buf = Uint8Array.from(rarBuffer).buffer;
    
    const extractor = await nodeUnrar.createExtractorFromData({ 
      data: buf, 
      password: password 
    });
    
    const list = extractor.getFileList();
    console.log('RAR file list:', list);
    
    // Extract file information from the list structure
    const archiveEntries: ArchiveEntry[] = [];
    
    // The fileHeaders is a generator, we need to iterate it
    if (list && list.fileHeaders) {
      console.log('Iterating through RAR file headers...');
      
      // Convert generator to array using spread operator (correct syntax)
      const fileHeaders = [...list.fileHeaders];
      console.log('RAR file headers array:', fileHeaders);
      
      for (const fileHeader of fileHeaders) {
        console.log('Processing RAR file header:', fileHeader);
        
        const header = fileHeader as any; // Type cast for RAR file header
        console.log('RAR header details:', {
          name: header.name,
          flags: header.flags,
          packSize: header.packSize,
          unpSize: header.unpSize,
          crc: header.crc,
          time: header.time,
          fullHeader: header
        });
        
        const fileName = header.name || '';
        const isDir = header.flags?.directory || fileName.endsWith('/') || false;
        
        archiveEntries.push({
          name: fileName ? fileName.split('/').pop() || fileName : 'Unknown',
          path: fileName,
          size: header.unpSize || 0,  // Use unpSize for uncompressed size
          compressedSize: header.packSize || 0,  // Use packSize for compressed size
          isDirectory: isDir,
          date: header.time ? new Date(header.time) : new Date()
        });
      }
    } else {
      console.log('No fileHeaders found in RAR list structure');
      
      // Try alternative structure
      const filesArray = (list as any).files || (list as any).arcHeader?.files || [];
      
      for (const file of filesArray) {
        archiveEntries.push({
          name: file.name ? file.name.split('/').pop() || file.name : 'Unknown',
          path: file.name || '',
          size: file.unpSize || file.uncompressedSize || file.size || 0,
          compressedSize: file.packSize || file.compressedSize || 0,
          isDirectory: file.flags?.directory || file.isDirectory || false,
          date: file.time ? new Date(file.time) : new Date()
        });
      }
    }

    console.log('RAR entries extracted:', archiveEntries.length);
    return archiveEntries;
  } catch (err) {
    console.error('Error loading RAR:', err);
    if (err instanceof Error && (err.message.includes('password') || err.message.includes('Wrong password'))) {
      throw new Error('Wrong password for RAR archive');
    }
    throw new Error('Failed to read RAR archive: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
};