import { useState, useEffect } from 'react';
import AdmZip from 'adm-zip';
// import * as fs from 'fs';
// import * as unrar from 'node-unrar-js';

interface ArchiveEntry {
  name: string;
  path: string;
  size: number;
  compressedSize?: number;
  isDirectory: boolean;
  date?: Date;
}

interface PasswordPromptProps {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ isOpen, onSubmit, onCancel }) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword('');
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Archive is Password Protected</h3>
        <form onSubmit={handleSubmit} className="py-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Enter Password:</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Password"
              autoFocus
            />
          </div>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Open
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ArchiveViewer: React.FC = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [archiveType, setArchiveType] = useState<'zip' | 'rar' | null>(null);

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

  const getArchiveType = (path: string): 'zip' | 'rar' | null => {
    const ext = path.toLowerCase().split('.').pop();
    if (ext === 'zip' || ext === '7z' || ext === 'tar') return 'zip';
    if (ext === 'rar') return 'rar';
    return null;
  };

  const loadArchive = async (path: string, password?: string) => {
    setLoading(true);
    setError(null);

    try {
      const type = getArchiveType(path);
      setArchiveType(type);

      if (type === 'zip') {
        await loadZipArchive(path, password);
      } else if (type === 'rar') {
        await loadRarArchive(path, password);
      } else {
        throw new Error('Unsupported archive format');
      }
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

  const loadZipArchive = async (path: string, password?: string) => {
    try {
      console.log('Loading ZIP archive:', path, password ? 'with password' : 'without password');
      
      // Read the file using Node.js fs with require
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(path);
      console.log('File buffer size:', fileBuffer.length);
      
      const zip = new AdmZip(fileBuffer);
      
      // Set password if provided
      if (password) {
        // AdmZip doesn't have a direct password method, but we can try to read entries
        // If password is wrong, it will throw an error when accessing entries
      }
      
      const zipEntries = zip.getEntries();
      console.log('ZIP entries found:', zipEntries.length);
      
      const archiveEntries: ArchiveEntry[] = zipEntries
        .filter(entry => {
          // Filter out problematic entries
          if (!entry.entryName || entry.entryName.trim() === '') {
            console.log('Skipping entry with empty name:', entry);
            return false;
          }
          
          // Skip entries that are just root directory markers
          if (entry.entryName === '/' || entry.entryName === './') {
            console.log('Skipping root directory marker:', entry.entryName);
            return false;
          }
          
          return true;
        })
        .map(entry => {
          console.log('Processing entry:', entry.entryName, 'isDirectory:', entry.isDirectory);
          
          // Extract proper name for display
          let displayName = entry.name;
          if (entry.isDirectory && displayName.endsWith('/')) {
            displayName = displayName.slice(0, -1); // Remove trailing slash
          }
          displayName = displayName.split('/').pop() || displayName;
          
          // Additional safety check for empty names
          if (displayName.trim() === '') {
            displayName = entry.entryName.split('/').filter(p => p).pop() || 'Unknown';
          }
          
          return {
            name: displayName,
            path: entry.entryName,
            size: entry.header.size,
            compressedSize: entry.header.compressedSize,
            isDirectory: entry.isDirectory,
            date: entry.header.time
          };
        });

      console.log('Archive entries created:', archiveEntries);
      setEntries(archiveEntries);
    } catch (err) {
      console.error('Error loading ZIP:', err);
      if (err instanceof Error && err.message.includes('password')) {
        throw new Error('Wrong password or corrupted archive');
      }
      throw new Error('Failed to read ZIP archive: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const loadRarArchive = async (path: string, password?: string) => {
    try {
      console.log('Loading RAR archive:', path, password ? 'with password' : 'without password');
      
      // Read RAR archive using node-unrar-js with require
      const nodeUnrar = require('node-unrar-js');
      const extractor = await nodeUnrar.createExtractorFromFile({ 
        filepath: path, 
        password: password 
      });
      
      const list = extractor.getFileList();
      console.log('RAR file list:', list);
      
      // Extract file information from the list structure
      const archiveEntries: ArchiveEntry[] = [];
      
      // The exact structure depends on the version of node-unrar-js
      // Let's try to handle different possible structures
      if (list && typeof list === 'object') {
        // Try to find files array in the response
        const filesArray = (list as any).files || (list as any).arcHeader?.files || [];
        
        for (const file of filesArray) {
          archiveEntries.push({
            name: file.name ? file.name.split('/').pop() || file.name : 'Unknown',
            path: file.name || '',
            size: file.uncompressedSize || file.size || 0,
            compressedSize: file.compressedSize || 0,
            isDirectory: file.flags?.directory || file.isDirectory || false,
            date: file.time ? new Date(file.time) : new Date()
          });
        }
      }

      setEntries(archiveEntries);
    } catch (err) {
      console.error('Error loading RAR:', err);
      if (err instanceof Error && (err.message.includes('password') || err.message.includes('Wrong password'))) {
        throw new Error('Wrong password for RAR archive');
      }
      throw new Error('Failed to read RAR archive: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handlePasswordSubmit = (password: string) => {
    setShowPasswordPrompt(false);
    if (filePath) {
      loadArchive(filePath, password);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
    setError('Archive access cancelled');
  };

  const getDisplayEntries = () => {
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

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath.endsWith('/') ? folderPath.slice(0, -1) : folderPath);
  };

  const navigateUp = () => {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    setCurrentPath(parentPath);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading archive...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const displayEntries = getDisplayEntries();

  return (
    <div className="h-screen flex flex-col">
      <PasswordPrompt
        isOpen={showPasswordPrompt}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
      />
      
      {/* Header */}
      <div className="navbar bg-base-200">
        <div className="flex-1">
          
          {filePath && (
            <span className="ml-4 text-sm opacity-70">
              {filePath.split('/').pop() || filePath.split('\\').pop()}
            </span>
          )}
        </div>
        <div className="flex-none">
          <span className="badge badge-primary">
            {archiveType?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentPath && (
        <div className="breadcrumbs text-sm px-4 py-2 bg-base-100">
          <ul>
            <li>
              <button onClick={() => setCurrentPath('')} className="link">
                Root
              </button>
            </li>
            {currentPath.split('/').map((part, index, array) => (
              <li key={index}>
                <button
                  onClick={() => navigateToFolder(array.slice(0, index + 1).join('/'))}
                  className="link"
                >
                  {part}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File List */}
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
                <tr className="hover:bg-base-200 cursor-pointer" onClick={navigateUp}>
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
              
              {displayEntries.map((entry, index) => (
                <tr
                  key={index}
                  className="hover:bg-base-200 cursor-pointer"
                  onClick={() => entry.isDirectory && navigateToFolder(entry.path)}
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
              
              {displayEntries.length === 0 && !currentPath && (
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

      {/* Footer */}
      <div className="footer footer-center p-4 bg-base-200 text-base-content">
        <div>
          <p>
            {displayEntries.length} items 
            {currentPath && ` in ${currentPath}`}
          </p>
        </div>
      </div>
    </div>
  );
};