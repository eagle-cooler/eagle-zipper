import type { ArchiveEntry } from './types';

export const getDisplayEntries = (entries: ArchiveEntry[], currentPath: string): ArchiveEntry[] => {
  console.log('Current path:', currentPath);
  console.log('All entries:', entries);
  
  // Create a map to track entries we've already added to avoid duplicates
  const seenEntries = new Map<string, ArchiveEntry>();
  
  for (const entry of entries) {
    if (currentPath === '') {
      // Root level - show immediate children only
      const pathParts = entry.path.split('/').filter(part => part !== '');
      
      if (pathParts.length === 1) {
        // Direct file or folder in root - but exclude empty entries
        if (entry.path.trim() !== '' && entry.name.trim() !== '') {
          const key = entry.path.toLowerCase(); // Use lowercase for case-insensitive comparison
          if (!seenEntries.has(key)) {
            seenEntries.set(key, entry);
          }
        }
      } else if (pathParts.length > 1) {
        // This is a nested item, create a folder entry for its parent
        const folderName = pathParts[0];
        const folderPath = folderName + '/';
        const key = folderPath.toLowerCase();
        
        // Only create folder if it has a valid name and we haven't seen it
        if (folderName.trim() !== '' && !seenEntries.has(key)) {
          seenEntries.set(key, {
            name: folderName,
            path: folderPath,
            size: 0,
            compressedSize: 0,
            isDirectory: true,
            date: new Date()
          });
        }
      }
    } else {
      // Inside a folder - show items that are direct children
      const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';
      
      if (entry.path.startsWith(normalizedCurrentPath)) {
        const relativePath = entry.path.substring(normalizedCurrentPath.length);
        const pathParts = relativePath.split('/').filter(part => part !== '');
        
        if (pathParts.length === 1) {
          // Direct child (file or folder) - exclude empty entries
          if (relativePath.trim() !== '' && entry.name.trim() !== '') {
            const key = entry.path.toLowerCase();
            if (!seenEntries.has(key)) {
              seenEntries.set(key, entry);
            }
          }
        } else if (pathParts.length > 1) {
          // Nested item, create folder entry for immediate child
          const folderName = pathParts[0];
          const folderPath = normalizedCurrentPath + folderName + '/';
          const key = folderPath.toLowerCase();
          
          // Only create folder if it has a valid name and we haven't seen it
          if (folderName.trim() !== '' && !seenEntries.has(key)) {
            seenEntries.set(key, {
              name: folderName,
              path: folderPath,
              size: 0,
              compressedSize: 0,
              isDirectory: true,
              date: new Date()
            });
          }
        }
      }
    }
  }
  
  // Convert map values to array and apply final filters
  const result = Array.from(seenEntries.values()).filter(entry => 
    entry.name.trim() !== '' && 
    entry.path.trim() !== '' &&
    entry.path !== '/' // Exclude root directory entry
  );
  
  console.log('Filtered entries:', result);
  return result;
};