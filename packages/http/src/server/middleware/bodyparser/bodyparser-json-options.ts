'use strict'

import Bytes from 'bytes'
import { BodyparserBaseOptions } from './bodyparser-base-options'

export class BodyparserJsonOptions extends BodyparserBaseOptions {
  /**
   * Returns the JSON body size limit in bytes.
   *
   * @returns {String|Number}
   */
  override limit (): number {
    return Bytes.parse(this.config.limit ?? '1mb')
  }
}
