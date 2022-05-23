'use strict'

import { File as FormidableFile } from 'formidable'
import { UploadedFile as UploadedFileContract } from '@supercharge/contracts'

export class UploadedFile implements UploadedFileContract {
  /**
   * Stores the raw formidable file from the request.
   */
  private readonly file: FormidableFile

  /**
   * Create a new instance.
   */
  constructor (file: FormidableFile) {
    this.file = file
  }

  /**
   * Returns the file name (according to the uploading client).
   */
  name (): string | undefined {
    if (this.file.originalFilename) {
      return this.file.originalFilename
    }
  }

  /**
   * Returns the current file path of this uploaded file. Uploaded files
   * are stored in a temporary location of the operating system.
   */
  path (): string {
    return this.file.filepath
  }

  /**
   * Returns the file size in bytes.
   */
  size (): number {
    return this.file.size
  }

  /**
   * Returns the file’s mime type (according to the uploading client).
   */
  mimeType (): string | undefined {
    if (this.file.mimetype) {
      return this.file.mimetype
    }
  }

  /**
   * Return a `Date` instance containing the time this file was last written to.
   */
  lastModified (): Date | null | undefined {
    return this.file.mtime
  }

  /**
   * Returns the JSON object of this file.
   *
   * @returns {Object}
   */
  toJSON (): { [key: string]: any } {
    return {
      name: this.name(),
      size: this.size(),
      path: this.path(),
      mimeType: this.mimeType(),
      lastModified: this.lastModified()
    }
  }
}
