'use strict'

import Set from '@supercharge/set'
import { BodyparserJsonOptions } from './bodyparser-json-options'
import { BodyparserBaseOptions } from './bodyparser-base-options'
import { BodyparserMultipartOptions } from './bodyparser-multipart-options'
import { BodyparserConfig as BodyparserConfigContract } from '@supercharge/contracts'

export class BodyparserOptions {
  /**
   * The bodyparser object object.
   */
  protected readonly config: BodyparserConfigContract

  /**
   * Create a new instance.
   *
   * @param {BodyparserConfigContract} options
   */
  constructor (options: BodyparserConfigContract) {
    this.config = options ?? {}
  }

  /**
   * Returns the configured encoding.
   *
   * @returns {BodyparserJsonOptions}
   */
  encoding (): BufferEncoding {
    return this.config.encoding ?? 'utf8'
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
      .from(this.config.methods)
      .map(method => method.toLowerCase())
      .toArray()
  }

  /**
   * Returns a JSON options instance.
   *
   * @returns {BodyparserJsonOptions}
   */
  json (): BodyparserJsonOptions {
    return new BodyparserJsonOptions(this.config.json)
  }

  /**
   * Returns a form (form url encoded) options instance.
   *
   * @returns {BodyparserBaseOptions}
   */
  form (): BodyparserBaseOptions {
    return new BodyparserBaseOptions(this.config.form)
  }

  /**
   * Returns a text options instance.
   *
   * @returns {BodyparserBaseOptions}
   */
  text (): BodyparserBaseOptions {
    return new BodyparserBaseOptions(this.config.text)
  }

  /**
   * Returns a multipart options instance.
   *
   * @returns {BodyparserMultipartOptions}
   */
  multipart (): BodyparserMultipartOptions {
    return new BodyparserMultipartOptions(this.config.multipart ?? {})
  }
}
