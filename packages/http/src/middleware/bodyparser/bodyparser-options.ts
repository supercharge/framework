
import Set from '@supercharge/set'
import { BodyparserJsonOptions } from './bodyparser-json-options.js'
import { BodyparserBaseOptions } from './bodyparser-base-options.js'
import { BodyparserMultipartOptions } from './bodyparser-multipart-options.js'
import { BodyparserConfig as BodyparserConfigContract, HttpMethods } from '@supercharge/contracts'

export class BodyparserOptions {
  /**
   * The bodyparser object object.
   */
  protected readonly config: BodyparserConfigContract

  /**
   * Create a new instance.
   */
  constructor (options: BodyparserConfigContract) {
    this.config = options ?? {}
  }

  /**
   * Returns the configured encoding.
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
   */
  methods (): HttpMethods[] {
    return Set
      .from(this.config.methods)
      .map(method => method.toUpperCase())
      .toArray() as HttpMethods[]
  }

  /**
   * Returns a JSON options instance.
   */
  json (): BodyparserJsonOptions {
    return new BodyparserJsonOptions(this.config.json)
  }

  /**
   * Returns a form (form url encoded) options instance.
   */
  form (): BodyparserBaseOptions {
    return new BodyparserBaseOptions(this.config.form)
  }

  /**
   * Returns a text options instance.
   */
  text (): BodyparserBaseOptions {
    return new BodyparserBaseOptions(this.config.text)
  }

  /**
   * Returns a multipart options instance.
   */
  multipart (): BodyparserMultipartOptions {
    return new BodyparserMultipartOptions(this.config.multipart ?? {})
  }
}
