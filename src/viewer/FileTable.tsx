import type { ArchiveEntry } from './types';
import { formatFileSize } from './utils';

interface FileTableProps {
  entries: ArchiveEntry[];
  currentPath: string;
  onNavigateToFolder: (folderPath: string) => void;
  onNavigateUp: () => void;
}

export const FileTable: React.FC<FileTableProps> = ({ 
  entries, 
  currentPath, 
  onNavigateToFolder, 
  onNavigateUp 
}) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Compressed</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentPath && (
              <tr className="hover:bg-base-200 cursor-pointer" onClick={onNavigateUp}>
                <td>
                  <div className="flex items-center gap-2">
                    <span>📁</span>
                    <span>..</span>
                  </div>
                </td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            )}
            
            {entries.map((entry, index) => (
              <tr
                key={index}
                className="hover:bg-base-200 cursor-pointer"
                onClick={() => entry.isDirectory && onNavigateToFolder(entry.path)}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <span>{entry.isDirectory ? '📁' : '📄'}</span>
                    <span>{entry.name}</span>
                  </div>
                </td>
                <td>{entry.isDirectory ? '-' : formatFileSize(entry.size)}</td>
                <td>
                  {entry.isDirectory ? '-' : 
                   entry.compressedSize ? formatFileSize(entry.compressedSize) : '-'}
                </td>
                <td>{entry.date ? entry.date.toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            
            {entries.length === 0 && !currentPath && (
              <tr>
                <td colSpan={4} className="text-center py-8 opacity-50">
                  No files found in archive
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};