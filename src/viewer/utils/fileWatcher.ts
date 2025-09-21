// File watcher system with debounce for monitoring extracted files
import { getTempDirectoryFiles } from '../extractors/zipExtraction';

export interface FileWatcherEvents {
  onFilesChanged: (changedFiles: string[]) => void;
  onError: (error: Error) => void;
}

export class FileWatcher {
  private tempDir: string;
  private debounceMs: number;
  private isWatching: boolean = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private initialFileStates: Map<string, Date> = new Map();
  private watchInterval: NodeJS.Timeout | null = null;
  private events: FileWatcherEvents;

  constructor(tempDir: string, events: FileWatcherEvents, debounceMs: number = 15000) {
    this.tempDir = tempDir;
    this.debounceMs = debounceMs;
    this.events = events;
  }

  /**
   * Start watching for file changes
   */
  async startWatching(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    try {
      // Initialize file states
      await this.updateFileStates();
      
      this.isWatching = true;
      
      // Poll for changes every 2 seconds
      this.watchInterval = setInterval(async () => {
        await this.checkForChanges();
      }, 2000);
      
      console.log('Started watching directory:', this.tempDir);
    } catch (error) {
      this.events.onError(new Error(`Failed to start watching: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Stop watching for file changes
   */
  stopWatching(): void {
    this.isWatching = false;
    
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    console.log('Stopped watching directory:', this.tempDir);
  }

  /**
   * Force trigger change detection (for manual update button)
   */
  async triggerUpdate(): Promise<void> {
    await this.checkForChanges(true);
  }

  /**
   * Update the internal file states
   */
  private async updateFileStates(): Promise<void> {
    try {
      const files = await getTempDirectoryFiles(this.tempDir);
      this.initialFileStates.clear();
      
      for (const file of files) {
        this.initialFileStates.set(file.path, file.modTime);
      }
    } catch (error) {
      console.warn('Failed to update file states:', error);
    }
  }

  /**
   * Check for file changes
   */
  private async checkForChanges(forceUpdate: boolean = false): Promise<void> {
    if (!this.isWatching && !forceUpdate) {
      return;
    }

    try {
      const currentFiles = await getTempDirectoryFiles(this.tempDir);
      const changedFiles: string[] = [];
      
      // Check for modified files
      for (const file of currentFiles) {
        const previousModTime = this.initialFileStates.get(file.path);
        
        if (!previousModTime || file.modTime.getTime() !== previousModTime.getTime()) {
          changedFiles.push(file.path);
        }
      }
      
      // Check for new files (not in initial state)
      for (const file of currentFiles) {
        if (!this.initialFileStates.has(file.path)) {
          changedFiles.push(file.path);
        }
      }
      
      // Check for deleted files (in initial state but not in current)
      const currentFilePaths = new Set(currentFiles.map(f => f.path));
      for (const [filePath] of this.initialFileStates) {
        if (!currentFilePaths.has(filePath)) {
          changedFiles.push(filePath);
        }
      }
      
      if (changedFiles.length > 0 || forceUpdate) {
        if (forceUpdate) {
          // Manual trigger - notify immediately
          this.events.onFilesChanged(changedFiles);
        } else if (this.debounceMs > 0) {
          // Automatic detection with debounce enabled
          this.debounceChanges(changedFiles);
        } else {
          // Automatic detection but no debounce - just track changes without auto-triggering
          // Only update the session state, don't auto-trigger updates
        }
      }
    } catch (error) {
      this.events.onError(new Error(`Failed to check for changes: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Debounce file changes
   */
  private debounceChanges(changedFiles: string[]): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.events.onFilesChanged(changedFiles);
      this.debounceTimer = null;
    }, this.debounceMs);
  }
}