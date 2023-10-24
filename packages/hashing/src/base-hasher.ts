
import Crypto, { BinaryLike, Encoding, Hash } from 'node:crypto'

export class BaseHasher {
  /**
   * Creates and returns a Node.js `Hash` instance for the given `algorithm`
   * and the related `input` with (optional) `inputEncoding`. When `input`
   * is a string and `inputEncoding` is omitted, it defaults to `utf8`.
   */
  createHash (algorithm: string, input: string | BinaryLike, inputEncoding?: Encoding): Hash {
    return typeof input === 'string' && typeof inputEncoding === 'string'
      ? Crypto.createHash(algorithm).update(input, inputEncoding)
      : Crypto.createHash(algorithm).update(input)
  }

  /**
   * Returns an MD5 hash instance for the given `content`.
   */
  md5 (input: BinaryLike): Hash
  md5 (input: string, inputEncoding: Encoding): Hash
  md5 (input: string | BinaryLike, inputEncoding?: Encoding): Hash {
    return this.createHash('md5', input, inputEncoding)
  }

  /**
   * Returns a SHA256 hash instance using SHA-2 for the given `content`.
   */
  sha256 (input: BinaryLike): Hash
  sha256 (input: string, inputEncoding: Encoding): Hash
  sha256 (input: string | BinaryLike, inputEncoding?: Encoding): Hash {
    return this.createHash('sha256', input, inputEncoding)
  }

  /**
   * Returns a SHA512 hash instance using SHA-2 for the given `content`.
   */
  sha512 (input: BinaryLike): Hash
  sha512 (input: string, inputEncoding: Encoding): Hash
  sha512 (input: string | BinaryLike, inputEncoding?: Encoding): Hash {
    return this.createHash('sha512', input, inputEncoding)
  }
}
