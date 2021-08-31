'use strict'

import Map from '@supercharge/map'
import { MultipartFormField } from './multipart-form-field'

export class MultipartBag {
  /**
   * Stores the multipart fields.
   */
  protected readonly fields: Map<string, MultipartFormField<string>>

  /**
   * Stores the multipart files.
   */
  protected readonly files: Map<string, MultipartFormField<any>>

  /**
   * Create a new instance.
   *
   * @param {BodyparserOptionsContract} options
   */
  constructor () {
    this.files = new Map()
    this.fields = new Map()
  }

  addField (field: { [field: string]: string | string[] }): this {
    return this.addFields([field])
  }

  addFields (fields: Array<{ [field: string]: string | string[] }>): this {
    for (const item of fields) {
      console.log(item)

      // this.fields.set(name, value)
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
