import type { ArchiveEntry } from '../types';

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
          for (let i = 0; i < result.length; i++) {
            const file = result[i];
            try {
              // Extract proper name for display
              let fullPath = file.name || file.Name || '';
              if (!fullPath) continue;
              
              // Normalize path separators to forward slashes
              fullPath = fullPath.replace(/\\/g, '/');
              
              const isDirectory = file.attr ? file.attr.includes('D') : 
                                file.attributes ? file.attributes.includes('D') :
                                fullPath.endsWith('/') ||
                                (file.size === '0' && !fullPath.includes('.'));
              
              // Clean up directory paths
              if (isDirectory && fullPath.endsWith('/')) {
                fullPath = fullPath.slice(0, -1);
              }
              
              // Get just the filename for display
              const nameParts = fullPath.split('/');
              const fileName = nameParts[nameParts.length - 1];
              
              if (fileName.trim() === '') continue;
              
              entries.push({
                name: fileName,
                path: fullPath,
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