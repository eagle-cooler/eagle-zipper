import type { ArchiveEntry } from '../types';
import { formatFileSize } from '../utils';

type SortField = 'name' | 'size' | 'compressedSize' | 'date';
type SortDirection = 'asc' | 'desc';

interface FileTableProps {
  entries: ArchiveEntry[];
  currentPath: string;
  onNavigateToFolder: (folderPath: string) => void;
  onNavigateUp: () => void;
  onFileDoubleClick?: (entry: ArchiveEntry) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const FileTable: React.FC<FileTableProps> = ({ 
  entries, 
  currentPath, 
  onNavigateToFolder, 
  onNavigateUp,
  onFileDoubleClick,
  sortField,
  sortDirection,
  onSort
}) => {
  const handleRowClick = (entry: ArchiveEntry) => {
    if (entry.isDirectory) {
      onNavigateToFolder(entry.path);
    }
  };

  const handleRowDoubleClick = (entry: ArchiveEntry) => {
    if (!entry.isDirectory && onFileDoubleClick) {
      onFileDoubleClick(entry);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="opacity-30">↕️</span>;
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="cursor-pointer hover:bg-base-200 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="size">Size</SortableHeader>
              <SortableHeader field="compressedSize">Compressed</SortableHeader>
              <SortableHeader field="date">Date</SortableHeader>
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
                key={`${entry.path}-${index}`}
                className="hover:bg-base-200 cursor-pointer"
                onClick={() => handleRowClick(entry)}
                onDoubleClick={() => handleRowDoubleClick(entry)}
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