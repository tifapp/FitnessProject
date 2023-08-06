/**
 * An interface for filesystem operations.
 */
export interface Filesystem {
  /**
   * Appends a string to a file at the given path.
   *
   * This function should also create the file at the path if it does not exist.
   */
  appendString(path: string, data: string): Promise<void>

  /**
   * Lists the contents of the given directory.
   */
  listDirectoryContents(path: string): Promise<string[]>

  /**
   * Deletes the file at the given path.
   */
  deleteFile(path: string): Promise<void>
}
