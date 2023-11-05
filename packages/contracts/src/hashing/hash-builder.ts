
import type { BinaryToTextEncoding, Encoding } from 'node:crypto'

export type HashBuilderCallback = (hashBuilder: HashBuilder) => unknown

export interface HashBuilderConfig {
  inputEncoding?: Encoding
  outputEncoding: BinaryToTextEncoding
}

export interface HashBuilder {
  /**
   * Set the input encoding for the related value.
   */
  inputEncoding(inputEncoding: Encoding): this

  /**
   * Calculate the final hash string value.
   */
  digest (encoding: BinaryToTextEncoding): void

  /**
   * This is an alias for the `digest` method that calculates the final hash string.
   */
  toString(outputEncoding: BinaryToTextEncoding): void
}
