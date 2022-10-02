'use strict'

import Bytes from 'bytes'
import { BodyparserBaseOptions } from './bodyparser-base-options'
import { BodyparserConfig as BodyparserConfigContract } from '@supercharge/contracts'

export class BodyparserMultipartOptions extends BodyparserBaseOptions {
  /**
   * The bodyparser multipart options object.
   */
  protected override readonly config: BodyparserConfigContract['multipart']

  /**
    * Create a new instance.
    *
    * @param {BodyparserConfigContract['multipart']} config
    */
  constructor (config: BodyparserConfigContract['multipart']) {
    super(config)

    this.config = config
  }

  /**
   * Returns the multipart body file size limit in bytes.
   *
   * @returns {Number}
   */
  maxFileSize (): number {
    return Bytes.parse(this.config.maxFileSize ?? '200mb')
  }

  /**
   * Returns the maximun number of allowed fields in the multipart body.
   *
   * @returns {Number}
   */
  maxFields (): number {
    return this.config.maxFields ?? 1000
  }
}
