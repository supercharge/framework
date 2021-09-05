'use strict'

import Bytes from 'bytes'
import { BodyparserBaseOptions } from './bodyparser-base-options'

export class BodyparserJsonOptions extends BodyparserBaseOptions {
  /**
   * Returns the JSON body size limit in bytes.
   *
   * @returns {String|Number}
   */
  limit (): number {
    return Bytes.parse(this.options.limit ?? '1mb')
  }
}
