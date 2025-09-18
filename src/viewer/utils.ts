export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getArchiveType = (path: string): 'zip' | 'rar' | '7z' | null => {
  const ext = path.toLowerCase().split('.').pop();
  if (ext === 'zip' || ext === 'tar') return 'zip';
  if (ext === '7z') return '7z';
  if (ext === 'rar') return 'rar';
  return null;
};