export interface ArchiveEntry {
  name: string;
  path: string;
  size: number;
  compressedSize?: number;
  isDirectory: boolean;
  date?: Date;
}