'use strict'

import { MultipartFile } from './multipart-file'

export class MultipartBag {
  /**
   * Stores the multipart fields.
   */
  protected readonly fields: { [field: string]: string | string[] }

  /**
   * Stores the multipart files.
   */
  protected readonly files: Record<string, MultipartFile | MultipartFile[] >

  /**
   * Create a new instance.
   *
   * @param {BodyparserOptionsContract} options
   */
  constructor () {
    this.files = {}
    this.fields = {}
  }

  addField (field: { [field: string]: string | string[] }): this {
    return this.addFields([field])
  }

  addFields (fields: Array<{ [field: string]: string | string[] }>): this {
    for (const [name, value] of fields) {
      // TODO
    }
    return this
  }

  hasField (name: string): boolean {
    return !!this.getField(name)
  }

  getField (name: string): string | string[] | undefined {
    return this.fields[name]
  }

  addFile (file: MultipartFile): this {
    return this.addFiles([file])
  }

  addFiles (files: MultipartFile[]): this {
    return this
  }
}
