import type { ArchiveEntry } from '../types';

export const loadTarArchive = async (path: string, password?: string): Promise<ArchiveEntry[]> => {
  try {
    console.log('Loading TAR archive:', path, password ? 'with password' : 'without password');
    
    const _7z = require('7zip-min');
    
    return new Promise((resolve, reject) => {
      const entries: ArchiveEntry[] = [];
      
      // TAR files usually don't have passwords, but support it just in case
      const options = password ? { password } : {};
      
      _7z.list(path, (err: any, result: any) => {
        if (err) {
          console.error('7zip-min TAR error:', err);
          
          const errorMessage = err.message || err.toString();
          
          // TAR-specific error handling
          if (errorMessage.includes('Wrong password') ||
              errorMessage.includes('password')) {
            reject(new Error('Wrong password for TAR archive'));
          } else if (errorMessage.includes('Can not open as archive') ||
                     errorMessage.includes('is not archive')) {
            reject(new Error('Invalid or corrupted TAR archive'));
          } else {
            reject(new Error('Failed to read TAR archive: ' + errorMessage));
          }
          return;
        }
        
        console.log('7zip-min TAR result:', result);
        
        if (result && Array.isArray(result)) {
          for (let i = 0; i < result.length; i++) {
            const file = result[i];
            try {
              // Extract proper name for display
              let fullPath = file.name || file.Name || '';
              if (!fullPath) continue;
              
              // Normalize path separators to forward slashes
              fullPath = fullPath.replace(/\\/g, '/');
              
              // TAR files may have different directory detection
              const isDirectory = file.attr ? file.attr.includes('D') : 
                                file.attributes ? file.attributes.includes('D') :
                                fullPath.endsWith('/') ||
                                (file.size === '0' && file.size !== undefined && !fullPath.includes('.'));
              
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
                compressedSize: parseInt(file.compressed || file.Compressed || file.size || '0'), // TAR is usually uncompressed
                isDirectory: isDirectory,
                date: file.date || file.Date ? new Date(file.date || file.Date) : new Date()
              });
            } catch (e) {
              console.error('Error processing TAR file entry:', e, file);
            }
          }
        }
        
        console.log('TAR entries loaded:', entries.length);
        
        // TAR files are typically not encrypted
        if (entries.length === 0) {
          reject(new Error('TAR archive appears to be empty or corrupted'));
          return;
        }
        
        resolve(entries);
      }, options);
    });
  } catch (err) {
    console.error('Error loading TAR:', err);
    
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    if (errorMessage.includes('password') || errorMessage.includes('Wrong password')) {
      throw new Error('Wrong password for TAR archive');
    }
    
    throw new Error('Failed to read TAR archive: ' + errorMessage);
  }
};