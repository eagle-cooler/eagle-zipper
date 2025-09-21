// Archive Updater - Handles editing files within archives
// Currently supports ZIP archives only

import type { ArchiveEntry } from '../types';
import { extractZipToTemp, createZipFromTemp } from '../extractors/zipExtraction';
import { FileWatcher, type FileWatcherEvents } from '../utils/fileWatcher';
import { cleanupTempDirectory } from '../utils/tempDir';

export interface UpdateOperation {
  type: 'edit' | 'add' | 'remove';
  entry: ArchiveEntry;
  data?: Uint8Array;
}

export interface EditingSession {
  tempDirectory: string;
  watcher: FileWatcher;
  changedFiles: string[];
  isActive: boolean;
}

export class ArchiveUpdater {
  private archivePath: string;
  private archiveType: 'zip' | 'rar' | '7z' | 'tar';
  private itemId: string | null;
  private pendingOperations: UpdateOperation[] = [];
  private currentSession: EditingSession | null = null;
  private onSessionUpdate?: (session: EditingSession) => void;
  
  // Static registry to track active editing sessions per archive
  private static activeEditingSessions: Map<string, EditingSession> = new Map();

  constructor(
    archivePath: string, 
    archiveType: 'zip' | 'rar' | '7z' | 'tar',
    itemId: string | null = null
  ) {
    this.archivePath = archivePath;
    this.archiveType = archiveType;
    this.itemId = itemId;
  }

  /**
   * Set callback for session updates
   */
  setSessionUpdateCallback(callback: (session: EditingSession) => void): void {
    this.onSessionUpdate = callback;
  }

  /**
   * Edit a file within the archive (ZIP only for now)
   */
  async editFile(entry: ArchiveEntry): Promise<void> {
    if (this.archiveType !== 'zip') {
      if (eagle && eagle.notification) {
        eagle.notification.show({
          title: 'Edit Feature Unavailable',
          description: 'Edit functionality is only supported for ZIP archives.',
          duration: 3000
        });
      }
      throw new Error('Edit functionality is only supported for ZIP archives');
    }

    // Check if there's already an active editing session for this archive
    const existingSession = ArchiveUpdater.activeEditingSessions.get(this.archivePath);
    if (existingSession && existingSession.isActive) {
      console.log('Found existing editing session for archive:', this.archivePath);
      
      // Use existing session instead of creating new one
      this.currentSession = existingSession;
      
      // Get the specific file path in existing temp directory
      const fs = require('fs');
      const path = require('path');
      const tempFilePath = path.join(existingSession.tempDirectory, entry.path);
      
      // Check if file exists and open it
      const fileExists = await fs.promises.access(tempFilePath).then(() => true).catch(() => false);
      if (fileExists && eagle && eagle.shell) {
        eagle.shell.openPath(tempFilePath);
        
        if (eagle.notification) {
          eagle.notification.show({
            title: 'File Opened from Existing Session',
            description: `"${entry.path}" opened from active editing session.`,
            duration: 3000
          });
        }
      }
      
      // Update session reference
      if (this.onSessionUpdate) {
        this.onSessionUpdate(this.currentSession);
      }
      
      return;
    }

    try {
      // Extract entire archive to temp directory
      const tempDirectory = await extractZipToTemp(this.archivePath);
      
      console.log('Archive extracted to:', tempDirectory);
      
      // Verify directory exists
      const fs = require('fs');
      const path = require('path');
      const directoryExists = await fs.promises.access(tempDirectory).then(() => true).catch(() => false);
      console.log('Directory exists check:', directoryExists);
      
      // Get the specific file path in temp directory
      const tempFilePath = path.join(tempDirectory, entry.path);
      console.log('Target file path:', tempFilePath);
      console.log('Entry name:', entry.name);
      console.log('Entry path:', entry.path);
      
      // Verify the specific file exists
      const fileExists = await fs.promises.access(tempFilePath).then(() => true).catch(() => false);
      console.log('File exists check:', fileExists);
      
      // Create file watcher
      const watcherEvents: FileWatcherEvents = {
        onFilesChanged: (changedFiles: string[]) => {
          if (this.currentSession) {
            this.currentSession.changedFiles = changedFiles;
            if (this.onSessionUpdate) {
              this.onSessionUpdate(this.currentSession);
            }
          }
        },
        onError: (error: Error) => {
          console.error('File watcher error:', error);
          if (eagle && eagle.notification) {
            eagle.notification.show({
              title: 'File Watcher Error',
              description: error.message,
              duration: 5000
            });
          }
        }
      };
      
      const watcher = new FileWatcher(tempDirectory, watcherEvents, 0); // Disable auto-update by setting debounce to 0
      
      // Create editing session
      this.currentSession = {
        tempDirectory,
        watcher,
        changedFiles: [],
        isActive: true
      };
      
      // Start watching for changes
      await watcher.startWatching();
      
      // Register this editing session
      ArchiveUpdater.activeEditingSessions.set(this.archivePath, this.currentSession);
      console.log('Registered new editing session for archive:', this.archivePath);
      
      // Open the specific file directly
      if (fileExists && eagle && eagle.shell) {
        eagle.shell.openPath(tempFilePath);
      } else if (!fileExists) {
        console.warn('Target file not found after extraction:', tempFilePath);
        // Fall back to opening the directory
        if (eagle && eagle.shell) {
          eagle.shell.openPath(tempDirectory);
        }
      }
      
      // Notify user
      if (eagle && eagle.notification) {
        if (fileExists) {
          eagle.notification.show({
            title: 'File Opened for Editing',
            description: `"${entry.path}" has been extracted and opened. Save your changes and click "Finish Editing" when done.`,
            duration: 4000
          });
        } else {
          eagle.notification.show({
            title: 'Archive Extracted',
            description: `Archive extracted but file "${entry.path}" not found. Directory opened instead.`,
            duration: 4000
          });
        }
      }
      
      // Trigger session update callback
      if (this.onSessionUpdate) {
        this.onSessionUpdate(this.currentSession);
      }
      
    } catch (error) {
      console.error('Failed to start editing session:', error);
      if (eagle && eagle.notification) {
        eagle.notification.show({
          title: 'Extraction Failed',
          description: `Failed to extract archive: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: 5000
        });
      }
      throw error;
    }
  }

  /**
   * Update the archive with changes from temp directory
   */
  async updateArchive(): Promise<void> {
    if (!this.currentSession || this.archiveType !== 'zip') {
      throw new Error('No active editing session or unsupported archive type');
    }

    try {
      // Create temporary ZIP file
      const tempZipPath = `${this.currentSession.tempDirectory}_updated.zip`;
      
      // Create new ZIP from temp directory
      await createZipFromTemp(this.currentSession.tempDirectory, tempZipPath);
      
      // Replace original file using Eagle API
      if (this.itemId && eagle && eagle.item) {
        const item = await eagle.item.getById(this.itemId);
        await item.replaceFile(tempZipPath);
        
        // Clean up the editing session
        await this.cleanupEditingSession();
        
        // Notify success
        if (eagle.notification) {
          eagle.notification.show({
            title: 'Archive Updated',
            description: 'Successfully updated the archive with your changes.',
            duration: 3000
          });
        }
      } else {
        console.warn('Cannot replace file: Missing item ID or Eagle API');
        if (eagle && eagle.notification) {
          eagle.notification.show({
            title: 'Update Warning',
            description: 'Archive rebuilt but could not replace original file. Please check the temporary location.',
            duration: 5000
          });
        }
      }
      
      // Clean up temp ZIP
      const fs = require('fs');
      try {
        await fs.promises.unlink(tempZipPath);
      } catch (error) {
        console.warn('Failed to cleanup temp ZIP:', error);
      }
      
    } catch (error) {
      console.error('Failed to update archive:', error);
      if (eagle && eagle.notification) {
        eagle.notification.show({
          title: 'Update Failed',
          description: `Failed to update archive: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: 5000
        });
      }
      throw error;
    }
  }

  /**
   * Cancel the editing session and cleanup
   */
  async cancelEditing(): Promise<void> {
    await this.cleanupEditingSession();
    
    if (eagle && eagle.notification) {
      eagle.notification.show({
        title: 'Editing Cancelled',
        description: 'Editing session cancelled and temporary files cleaned up.',
        duration: 2000
      });
    }
  }

  /**
   * Clean up the editing session (internal method)
   */
  private async cleanupEditingSession(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    // Stop file watcher
    this.currentSession.watcher.stopWatching();
    
    // Cleanup temp directory
    await cleanupTempDirectory(this.currentSession.tempDirectory);
    
    // Remove from active sessions registry
    ArchiveUpdater.activeEditingSessions.delete(this.archivePath);
    console.log('Removed editing session from registry for archive:', this.archivePath);
    
    // Mark session as inactive
    this.currentSession.isActive = false;
    this.currentSession = null;
  }

  /**
   * Trigger manual update
   */
  async triggerManualUpdate(): Promise<void> {
    if (this.currentSession) {
      await this.currentSession.watcher.triggerUpdate();
    }
  }

  /**
   * Get current editing session
   */
  getCurrentSession(): EditingSession | null {
    return this.currentSession;
  }

  /**
   * Apply pending operations to the archive
   */
  async applyOperations(): Promise<void> {
    if (this.archiveType !== 'zip') {
      throw new Error('Archive updating is only supported for ZIP archives');
    }

    // Placeholder for applying operations
    console.log('Applying', this.pendingOperations.length, 'operations to archive');
    this.pendingOperations = [];
  }

  /**
   * Get the list of pending operations
   */
  getPendingOperations(): UpdateOperation[] {
    return [...this.pendingOperations];
  }
}

/**
 * Create an updater instance for the given archive
 */
export function createArchiveUpdater(
  archivePath: string, 
  archiveType: 'zip' | 'rar' | '7z' | 'tar',
  itemId: string | null = null
): ArchiveUpdater {
  return new ArchiveUpdater(archivePath, archiveType, itemId);
}

/**
 * Check if the archive type supports editing
 */
export function supportsEditing(archiveType: 'zip' | 'rar' | '7z' | 'tar' | null): boolean {
  return archiveType === 'zip';
}