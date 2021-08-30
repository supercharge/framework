'use strict'

import { File } from 'formidable'

export class MultipartFile {
  /**
   * The formidable file instance.
   */
  protected readonly file: File

  /**
   * Create a new instance.
   *
   * @param {BodyparserOptionsContract} options
   */
  constructor (file: File) {
    this.file = file
  }

  toJSON (): { [key: string]: any } {
    return {}
  }
}
