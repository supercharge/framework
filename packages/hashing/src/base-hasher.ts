
import { HashBuilder } from './hash-builder.js'
import Crypto, { BinaryLike, Encoding, Hash } from 'node:crypto'
import { BaseHasher as BaseHasherContract, HashAlgorithm, HashBuilderCallback, HashBuilderConfig } from '@supercharge/contracts'

export class BaseHasher implements BaseHasherContract {
  /**
   * Creates and returns a Node.js `Hash` instance for the given `algorithm`
   * and the related `input` with (optional) `inputEncoding`. When `input`
   * is a string and `inputEncoding` is omitted, it defaults to `utf8`.
   */
  createHash (algorithm: HashAlgorithm, input: string | BinaryLike, inputEncoding?: Encoding): Hash {
    return typeof input === 'string' && typeof inputEncoding === 'string'
      ? Crypto.createHash(algorithm).update(input, inputEncoding)
      : Crypto.createHash(algorithm).update(input)
  }

  /**
   * Returns an MD5 hash instance for the given `content`.
   */
  md5 (input: BinaryLike): string
  md5 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  md5 (input: string, inputEncoding: Encoding): Hash
  md5 (input: string | BinaryLike, inputEncodingOrHashBuilder?: Encoding | HashBuilderCallback): Hash | string {
    return this.hash('md5', input, inputEncodingOrHashBuilder)
  }

  /**
   * Returns a SHA256 hash instance using SHA-2 for the given `content`.
   */
  sha256 (input: BinaryLike): string
  sha256 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  sha256 (input: string, inputEncoding: Encoding): Hash
  sha256 (input: string | BinaryLike, inputEncodingOrHashBuilder?: Encoding | HashBuilderCallback): Hash | string {
    return this.hash('sha256', input, inputEncodingOrHashBuilder)
  }

  /**
   * Returns a SHA512 hash instance using SHA-2 for the given `content`.
   */
  sha512 (input: BinaryLike): string
  sha512 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  sha512 (input: string, inputEncoding: Encoding): Hash
  sha512 (input: string | BinaryLike, inputEncodingOrHashBuilder?: Encoding | HashBuilderCallback): Hash | string {
    return this.hash('sha512', input, inputEncodingOrHashBuilder)
  }

  /**
   * Returns the hashed string value or the `Hash` instance, depending on the
   * user input. This function resolves a hash builder callback and creates
   * the hash value for the provided algorithm and i/o encoding options.
   */
  private hash (algorithm: HashAlgorithm, input: string | BinaryLike, inputEncodingOrHashBuilder?: Encoding | HashBuilderCallback): Hash | string {
    if (typeof inputEncodingOrHashBuilder === 'string') {
      return this.createHash(algorithm, input, inputEncodingOrHashBuilder)
    }

    if (typeof inputEncodingOrHashBuilder === 'function') {
      const hashBuilderConfig: HashBuilderConfig = { outputEncoding: 'base64' }
      const builder = new HashBuilder(hashBuilderConfig)
      inputEncodingOrHashBuilder(builder)

      return this
        .createHash(algorithm, input, hashBuilderConfig.inputEncoding)
        .digest(hashBuilderConfig.outputEncoding)
    }

    return this
      .createHash(algorithm, input, inputEncodingOrHashBuilder)
      .digest('base64')
  }
}
