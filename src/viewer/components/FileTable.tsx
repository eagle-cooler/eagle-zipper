import type { ArchiveEntry } from '../types';
import { formatFileSize } from '../utils';
import { createArchiveUpdater, supportsEditing } from '../updater';

type SortField = 'name' | 'size' | 'compressedSize' | 'date';
type SortDirection = 'asc' | 'desc';

interface FileTableProps {
  entries: ArchiveEntry[];
  currentPath: string;
  archivePath: string;
  archiveType: 'zip' | 'rar' | '7z' | 'tar' | null;
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
  archivePath,
  archiveType,
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

  const handleRowRightClick = (entry: ArchiveEntry, event: React.MouseEvent) => {
    event.preventDefault();
    
    // Only show context menu for files (not directories) and only for supported archive types
    if (!entry.isDirectory && supportsEditing(archiveType)) {
      const menuItems = [
        {
          id: 'edit-file',
          label: 'Edit File',
          click: () => {
            handleEditFile(entry);
          }
        }
      ];
      
      // Open Eagle context menu
      if (eagle && eagle.contextMenu) {
        eagle.contextMenu.open(menuItems);
      }
    }
  };

  const handleEditFile = async (entry: ArchiveEntry) => {
    try {
      if (archiveType && archivePath) {
        const updater = createArchiveUpdater(archivePath, archiveType);
        await updater.editFile(entry);
      }
    } catch (error) {
      console.error('Error editing file:', error);
      
      if (eagle && eagle.notification) {
        eagle.notification.show({
          title: 'Edit Error',
          description: error instanceof Error ? error.message : 'Failed to edit file',
          duration: 3000
        });
      }
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
                onContextMenu={(e) => handleRowRightClick(entry, e)}
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