'use strict'

import { BodyparserBaseOptions } from './bodyparser-base-options'

export class BodyparserJsonOptions extends BodyparserBaseOptions {
  /**
   * Returns the JSON body size limit.
   *
   * @returns {String|Number}
   */
  limit (): string | number {
    return this.options.limit ?? '1mb'
  }
}
