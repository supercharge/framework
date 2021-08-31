'use strict'

import { UploadedFile } from './uploaded-file'

export interface FileBag {
  /**
   * Returns all uploaded files.
   */
  all(): UploadedFile[]

  /**
   * Returns the uploaded file for the given `name`.
   */
  get(name: string): UploadedFile | undefined

  /**
   * Add the given file to this header bag.
   */
  add(name: string, file: UploadedFile): this
}
