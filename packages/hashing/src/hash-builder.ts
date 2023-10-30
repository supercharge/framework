
import { HashBuilder as HashBuilderContract, HashBuilderOptions } from '@supercharge/contracts'
import { BinaryToTextEncoding, Encoding } from 'crypto'

export class HashBuilder implements HashBuilderContract {
  /**
   * Stores the hash builder options.
   */
  private readonly options: HashBuilderOptions

  constructor (options: HashBuilderOptions) {
    this.options = options
  }

  inputEncoding (inputEncoding: Encoding): this {
    this.options.inputEncoding = inputEncoding
    return this
  }

  digest (encoding: BinaryToTextEncoding): void {
    this.options.outputEncoding = encoding
  }

  toString (encoding: BinaryToTextEncoding): void {
    this.digest(encoding)
  }
}
