/**
 * An interface for filesystem operations.
 */
export interface Filesystem {
  /**
   * Appends a string to a file at the given path.
   */
  appendString(path: string, data: string): Promise<void>

  /**
   * Lists the contents of the given directory.
   */
  listDirectory(path: string): Promise<string[]>

  /**
   * Deletes the file at the given path.
   */
  deleteFile(path: string): Promise<void>
}
