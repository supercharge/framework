'use strict'

export interface UploadedFile {
  /**
   * Returns the file name (according to the uploading client).
   */
  name(): string | undefined

  /**
   * Returns the current file path.
   */
  path(): string

  /**
   * Returns the file size in bytes.
   */
  size(): number

  /**
   * Returns the file’s mime type (according to the uploading client).
   */
  mimeType(): string | undefined

  /**
   * Return a `Date` instance containing the time this file was last written to.
   */
  lastModified(): Date | null | undefined
}
