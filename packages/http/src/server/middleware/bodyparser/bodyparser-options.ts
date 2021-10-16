'use strict'

import Set from '@supercharge/set'
import { BodyparserJsonOptions } from './bodyparser-json-options'
import { BodyparserBaseOptions } from './bodyparser-base-options'
import { BodyparserMultipartOptions } from './bodyparser-multipart-options'
import { BodyparserOptions as BodyparserOptionsContract } from '@supercharge/contracts'

export class BodyparserOptions {
  /**
   * The bodyparser object object.
   */
  protected readonly options: BodyparserOptionsContract

  /**
   * Create a new instance.
   *
   * @param {BodyparserOptionsContract} options
   */
  constructor (options: BodyparserOptionsContract) {
    this.options = options
  }

  /**
   * Returns the configured encoding.
   *
   * @returns {BodyparserJsonOptions}
   */
  encoding (): BufferEncoding {
    return this.options.encoding ?? 'utf8'
  }

  /**
   * Returns an array of allowed methods, transformed to lowercase.
   *
   * @example
   * ```js
   * new BodyparserOptions({ methods: ['post', 'PUT'] }).methods()
   * // ['post', 'put']
   * ```
   *
   * @returns {BodyparserJsonOptions}
   */
  methods (): string[] {
    return Set
      .from(this.options.methods)
      .map(method => method.toLowerCase())
      .toArray()
  }

  /**
   * Returns a JSON options instance.
   *
   * @returns {BodyparserJsonOptions}
   */
  json (): BodyparserJsonOptions {
    return new BodyparserJsonOptions(this.options.json)
  }

  /**
   * Returns a form (form url encoded) options instance.
   *
   * @returns {BodyparserBaseOptions}
   */
  form (): BodyparserBaseOptions {
    return new BodyparserBaseOptions(this.options.form)
  }

  /**
   * Returns a text options instance.
   *
   * @returns {BodyparserBaseOptions}
   */
  text (): BodyparserBaseOptions {
    return new BodyparserBaseOptions(this.options.text)
  }

  /**
   * Returns a multipart options instance.
   *
   * @returns {BodyparserMultipartOptions}
   */
  multipart (): BodyparserMultipartOptions {
    return new BodyparserMultipartOptions(this.options.multipart ?? {})
  }
}
