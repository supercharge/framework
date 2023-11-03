
import type { BinaryToTextEncoding, Encoding } from 'node:crypto'

export type HashBuilderCallback = (hashBuilder: HashBuilder) => unknown

export interface HashBuilderConfig {
  inputEncoding?: Encoding
  outputEncoding: BinaryToTextEncoding
}

export interface HashBuilder {
  inputEncoding(inputEncoding: Encoding): this
  toString(outputEncoding: BinaryToTextEncoding): void
}
