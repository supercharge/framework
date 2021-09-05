'use strict'

import Bytes from 'bytes'
import { BodyparserBaseOptions } from './bodyparser-base-options'
import { BodyparserOptions as BodyparserOptionsContract } from '@supercharge/contracts'

export class BodyparserMultipartOptions extends BodyparserBaseOptions {
  /**
   * The bodyparser multipart options object.
   */
  protected readonly options: BodyparserOptionsContract['multipart']

  /**
    * Create a new instance.
    *
    * @param {BodyparserOptionsContract['multipart']} options
    */
  constructor (options: BodyparserOptionsContract['multipart']) {
    super(options)

    this.options = options
  }

  /**
   * Returns the multipart body file size limit in bytes.
   *
   * @returns {Number}
   */
  maxFileSize (): number {
    return Bytes.parse(this.options.maxFileSize ?? '200mb')
  }

  /**
   * Returns the maximun number of allowed fields in the multipart body.
   *
   * @returns {Number}
   */
  maxFields (): number {
    return this.options.maxFields ?? 1000
  }
}
