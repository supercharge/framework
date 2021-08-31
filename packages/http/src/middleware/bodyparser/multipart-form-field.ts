'use strict'

import { File } from 'formidable'

/**
 * This class describes a multipart form field. Each form field is a key-value pair.
 * The keys of this form field is the field name. The values are either single
 * instances or an array of instances, like a single file or a file array.
 */
export class MultipartFormField<T extends string | File> {
  /**
   * Stores the form field name.
   */
  protected readonly name: string

  /**
   * Stores the form field value. Form fields are either a single value or a value array.
   */
  protected readonly value: T | T[]

  /**
   * Create a new instance.
   *
   * @param {BodyparserOptionsContract} options
   */
  constructor (field: string, value: T | T[]) {
    this.name = field
    this.value = value
  }
}
