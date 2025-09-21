export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Normalize path separators and decode HTML entities for display
 * @param path The path to normalize
 * @returns Normalized path with forward slashes and decoded entities
 */
export const normalizePath = (path: string): string => {
  if (!path) return path;
  
  // Replace backslashes with forward slashes
  let normalized = path.replace(/\\/g, '/');
  
  // Decode common HTML entities that might appear in paths
  // Handle both numeric and named entities
  normalized = normalized
    .replace(/&#x2f;/gi, '/')
    .replace(/&#47;/g, '/')
    .replace(/&#x5c;/gi, '\\')
    .replace(/&#92;/g, '\\')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // After decoding, ensure all path separators are forward slashes
  normalized = normalized.replace(/\\/g, '/');
  
  return normalized;
};

export const getArchiveType = (path: string): 'zip' | 'rar' | '7z' | 'tar' | null => {
  const ext = path.toLowerCase().split('.').pop();
  if (ext === 'zip') return 'zip';
  if (ext === 'tar') return 'tar'; // TAR files get their own handler
  if (ext === '7z') return '7z';
  if (ext === 'rar') return 'rar';
  return null;
};