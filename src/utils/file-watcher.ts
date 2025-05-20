import fs from 'fs';
import path from 'path';
import {EventData} from '@/types';

/**
 * File system watcher utility
 * Monitors a directory for file changes and triggers callbacks when files are added
 */
export class FileWatcher {
  private watchFolder: string;
  private watcher: fs.FSWatcher | null = null;
  private callbacks: Array<(data: EventData) => void> = [];

  /**
   * Creates a new FileWatcher instance
   * @param watchFolder - Directory path to watch for changes
   */
  constructor(watchFolder: string) {
    this.watchFolder = watchFolder;
    this.ensureWatchFolderExists();
  }

  /**
   * Ensures the watched directory exists, creates it if it doesn't
   */
  private ensureWatchFolderExists(): void {
    if (!fs.existsSync(this.watchFolder)) {
      try {
        fs.mkdirSync(this.watchFolder, {recursive: true});
      } catch (error) {
        console.error(
          `Failed to create watch folder: ${this.watchFolder}`,
          error,
        );
        throw error;
      }
    }
  }

  /**
   * Starts watching the directory for changes
   */
  public start(): void {
    if (this.watcher) {
      this.stop();
    }

    try {
      this.watcher = fs.watch(this.watchFolder, (eventType, filename) => {
        if (filename && eventType === 'rename') {
          const filePath = path.join(this.watchFolder, filename);

          // Check if the file exists (rename event fires for both creation and deletion)
          if (fs.existsSync(filePath)) {
            console.log(`New file detected: ${filename}`);
            const eventData: EventData = {
              message: 'New file added',
              filename,
              timestamp: Date.now(),
            };

            this.notifyCallbacks(eventData);
          }
        }
      });

      console.log(`Watching for file changes in: ${this.watchFolder}`);
    } catch (error) {
      console.error(
        `Failed to start file watcher for: ${this.watchFolder}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Stops watching the directory
   */
  public stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('File watcher stopped');
    }
  }

  /**
   * Registers a callback to be called when a file event occurs
   * @param callback - Function to be called with event data when a file is added
   */
  public onFileAdded(callback: (data: EventData) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Removes a previously registered callback
   * @param callback - Callback function to remove
   */
  public removeCallback(callback: (data: EventData) => void): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  /**
   * Notifies all registered callbacks with event data
   * @param data - Event data to pass to callbacks
   */
  private notifyCallbacks(data: EventData): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in file watcher callback', error);
      }
    });
  }
}

export default FileWatcher;
