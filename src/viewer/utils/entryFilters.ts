import type { ArchiveEntry } from '../types';

export const getDisplayEntries = (entries: ArchiveEntry[], currentPath: string): ArchiveEntry[] => {
  console.log('Current path:', currentPath);
  console.log('All entries:', entries);
  
  // Create a map to track entries we've already added to avoid duplicates
  const seenEntries = new Map<string, ArchiveEntry>();
  
  for (const entry of entries) {
    // Normalize the entry path to use forward slashes
    const normalizedEntryPath = entry.path.replace(/\\/g, '/');
    
    if (currentPath === '') {
      // Root level - show immediate children only
      const pathParts = normalizedEntryPath.split('/').filter((part: string) => part !== '');
      
      if (pathParts.length === 1) {
        // Direct file or folder in root - but exclude empty entries
        if (normalizedEntryPath.trim() !== '' && entry.name.trim() !== '') {
          const key = entry.name.toLowerCase(); // Use name instead of path for better deduplication
          if (!seenEntries.has(key)) {
            // Update the entry with normalized path
            const normalizedEntry = { ...entry, path: normalizedEntryPath };
            seenEntries.set(key, normalizedEntry);
          }
        }
      } else if (pathParts.length > 1) {
        // This is a nested item, create a folder entry for its parent
        const folderName = pathParts[0];
        const folderPath = folderName;
        const key = folderName.toLowerCase(); // Use folder name for deduplication
        
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
      
      if (normalizedEntryPath.startsWith(normalizedCurrentPath)) {
        const relativePath = normalizedEntryPath.substring(normalizedCurrentPath.length);
        const pathParts = relativePath.split('/').filter((part: string) => part !== '');
        
        if (pathParts.length === 1) {
          // Direct child (file or folder) - exclude empty entries
          if (relativePath.trim() !== '' && entry.name.trim() !== '') {
            const key = entry.name.toLowerCase(); // Use name for deduplication
            if (!seenEntries.has(key)) {
              // Update the entry with normalized path
              const normalizedEntry = { ...entry, path: normalizedEntryPath };
              seenEntries.set(key, normalizedEntry);
            }
          }
        } else if (pathParts.length > 1) {
          // Nested item, create folder entry for immediate child
          const folderName = pathParts[0];
          const folderPath = normalizedCurrentPath + folderName;
          const key = folderName.toLowerCase(); // Use folder name for deduplication
          
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