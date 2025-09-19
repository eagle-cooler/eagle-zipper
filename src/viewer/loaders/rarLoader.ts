import type { ArchiveEntry } from '../types';

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