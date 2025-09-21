import { useState, useEffect } from 'react';
import type { ArchiveEntry } from '../types';
import { getArchiveType } from '../utils';
import { loadZipArchive, load7zArchive, loadRarArchive, loadTarArchive } from '../loaders';
import { getDisplayEntries } from '../utils';
import { extractAndOpenFile } from '../extractors';
import { PasswordPrompt } from './PasswordPrompt';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { FileTable } from './FileTable';
import { Footer } from './Footer';

type SortField = 'name' | 'size' | 'compressedSize' | 'date';
type SortDirection = 'asc' | 'desc';

export const ArchiveViewer: React.FC = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [archiveType, setArchiveType] = useState<'zip' | 'rar' | '7z' | 'tar' | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string | undefined>(undefined);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get("path");
    setFilePath(path);
  }, []);

  useEffect(() => {
    if (filePath) {
      loadArchive(filePath);
    }
  }, [filePath]);

  const loadArchive = async (path: string, password?: string) => {
    setLoading(true);
    setError(null);

    try {
      const type = getArchiveType(path);
      setArchiveType(type);

      let archiveEntries: ArchiveEntry[];
      if (type === 'zip') {
        archiveEntries = await loadZipArchive(path, password);
      } else if (type === 'rar') {
        archiveEntries = await loadRarArchive(path, password);
      } else if (type === '7z') {
        archiveEntries = await load7zArchive(path, password);
      } else if (type === 'tar') {
        archiveEntries = await loadTarArchive(path, password);
      } else {
        throw new Error('Unsupported archive format');
      }
      
      setEntries(archiveEntries);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('password') || err.message.includes('Wrong password')) {
          setShowPasswordPrompt(true);
        } else {
          setError(err.message);
        }
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (password: string) => {
    setShowPasswordPrompt(false);
    setCurrentPassword(password);
    if (filePath) {
      loadArchive(filePath, password);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
    setError('Archive access cancelled');
  };

  const handleFileDoubleClick = async (entry: ArchiveEntry) => {
    if (!filePath || !archiveType) return;

    try {
      setLoading(true);
      await extractAndOpenFile(filePath, entry, archiveType, currentPassword);
    } catch (err) {
      console.error('Error extracting file:', err);
      if (err instanceof Error) {
        setError(`Failed to extract file: ${err.message}`);
      } else {
        setError('Failed to extract file');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath.endsWith('/') ? folderPath.slice(0, -1) : folderPath);
  };

  const navigateUp = () => {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    setCurrentPath(parentPath);
  };

  const navigateToRoot = () => {
    setCurrentPath('');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortEntries = (entries: ArchiveEntry[]): ArchiveEntry[] => {
    const sortedEntries = [...entries].sort((a, b) => {
      // Always keep directories at the top
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'compressedSize':
          const aCompressed = a.compressedSize || 0;
          const bCompressed = b.compressedSize || 0;
          comparison = aCompressed - bCompressed;
          break;
        case 'date':
          const aTime = a.date ? a.date.getTime() : 0;
          const bTime = b.date ? b.date.getTime() : 0;
          comparison = aTime - bTime;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sortedEntries;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen select-none">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading archive...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen select-none">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const displayEntries = sortEntries(getDisplayEntries(entries, currentPath));

  return (
    <div className="h-screen flex flex-col select-none">
      <PasswordPrompt
        isOpen={showPasswordPrompt}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
      />
      
      <Header filePath={filePath} archiveType={archiveType} />
      
      <Breadcrumb 
        currentPath={currentPath}
        onNavigateToFolder={navigateToFolder}
        onNavigateToRoot={navigateToRoot}
      />

      <FileTable
        entries={displayEntries}
        currentPath={currentPath}
        archivePath={filePath || ''}
        archiveType={archiveType}
        onNavigateToFolder={navigateToFolder}
        onNavigateUp={navigateUp}
        onFileDoubleClick={handleFileDoubleClick}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      <Footer itemCount={displayEntries.length} currentPath={currentPath} />
    </div>
  );
};