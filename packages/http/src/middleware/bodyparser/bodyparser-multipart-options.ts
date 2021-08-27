'use strict'

import { BodyparserOptions as BodyparserOptionsContract } from '@supercharge/contracts'
import { BodyparserBaseOptions } from './bodyparser-base-options'

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
   * Returns the multipart body size limit.
   *
   * @returns {String|Number}
   */
  limit (): string | number {
    return this.options.limit ?? '20mb'
  }

  /**
   * Returns the maximun number of allowed fields in the multipart body.
   *
   * @returns {String|Number}
   */
  maxFields (): number {
    return this.options.maxFields ?? 1000
  }
}
