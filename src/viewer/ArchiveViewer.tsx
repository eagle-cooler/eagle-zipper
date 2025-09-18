import { useState, useEffect } from 'react';
import type { ArchiveEntry } from './types';
import { getArchiveType } from './utils';
import { loadZipArchive, loadRarArchive, load7zArchive } from './archiveLoaders';
import { getDisplayEntries } from './entryFilters';
import { extractAndOpenFile } from './fileExtractor';
import { PasswordPrompt } from './PasswordPrompt';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { FileTable } from './FileTable';
import { Footer } from './Footer';

export const ArchiveViewer: React.FC = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [archiveType, setArchiveType] = useState<'zip' | 'rar' | '7z' | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string | undefined>(undefined);

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

  const displayEntries = getDisplayEntries(entries, currentPath);

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
        onNavigateToFolder={navigateToFolder}
        onNavigateUp={navigateUp}
        onFileDoubleClick={handleFileDoubleClick}
      />

      <Footer itemCount={displayEntries.length} currentPath={currentPath} />
    </div>
  );
};