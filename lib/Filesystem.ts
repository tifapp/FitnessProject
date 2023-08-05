/**
 * An interface for filesystem operations.
 */
export interface Filesystem {
  /**
   * Appends a string to a file at the given path.
   */
  appendString(path: string, data: string): Promise<void>
}
