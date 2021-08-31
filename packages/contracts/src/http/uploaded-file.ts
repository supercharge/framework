'use strict'

export interface UploadedFile {
  /**
   * Returns the file path.
   */
  path(): string

  /**
   * Returns the file size in bytes.
   */
  size(): number
}
