
import { BinaryToTextEncoding, Encoding } from 'node:crypto'
import { HashBuilder as HashBuilderContract, HashBuilderConfig } from '@supercharge/contracts'

export class HashBuilder implements HashBuilderContract {
  /**
   * Stores the hash builder config.
   */
  private readonly config: HashBuilderConfig

  /**
   * Create a new instance.
   */
  constructor (options: HashBuilderConfig) {
    this.config = options
  }

  /**
   * Set the input encoding for the related value.
   */
  inputEncoding (inputEncoding: Encoding): this {
    this.config.inputEncoding = inputEncoding
    return this
  }

  /**
   * Calculate the final hash string value.
   */
  digest (encoding: BinaryToTextEncoding): void {
    this.config.outputEncoding = encoding
  }

  /**
   * This is an alias for the `digest` method that calculates the final hash string.
   */
  toString (encoding: BinaryToTextEncoding): void {
    this.digest(encoding)
  }
}
