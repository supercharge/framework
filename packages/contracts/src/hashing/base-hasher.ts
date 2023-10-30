
import type { BinaryLike, Encoding, Hash } from 'node:crypto'
import { HashBuilderCallback } from './hash-builder.js'

export interface BaseHasher {
  /**
   * Creates and returns a Node.js `Hash` instance for the given `algorithm`
   * and the related `input` with (optional) `inputEncoding`. When `input`
   * is a string and `inputEncoding` is omitted, it defaults to `utf8`.
   */
  createHash (algorithm: string, input: string | BinaryLike, inputEncoding?: Encoding): Hash

  /**
   * Returns an MD5 hash instance for the given `content`.
   */
  md5 (input: BinaryLike): string
  md5 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  md5 (input: string, inputEncoding: Encoding): Hash

  /**
   * Returns a SHA256 hash instance using SHA-2 for the given `content`.
   */
  sha256 (input: BinaryLike): string
  sha256 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  sha256 (input: string, inputEncoding: Encoding): Hash

  /**
   * Returns a SHA512 hash instance using SHA-2 for the given `content`.
   */
  sha512 (input: BinaryLike): string
  sha512 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  sha512 (input: string, inputEncoding: Encoding): Hash
}
