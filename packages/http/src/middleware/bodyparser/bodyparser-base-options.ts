'use strict'

import Set from '@supercharge/set'

interface BodyparserBaseOptionsContract {
  limit: number | string
  contentTypes: string[]
}

export class BodyparserBaseOptions {
  /**
   * The bodyparser base options object.
   */
  protected readonly options: BodyparserBaseOptionsContract

  /**
   * Create a new instance.
   *
   * @param {BodyparserBaseOptionsContract} options
   */
  constructor (options: BodyparserBaseOptionsContract) {
    this.options = options
  }

  /**
   * Returns the JSON body size limit.
   *
   * @returns {String|Number}
   */
  limit (): string | number {
    return this.options.limit ?? '56kb'
  }

  /**
   * Returns the allowed JSON content types
   * @returns {String[]}
   */
  contentTypes (): string[] {
    return Set.from(this.options.contentTypes).toArray()
  }
}
